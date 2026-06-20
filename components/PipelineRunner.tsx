"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProviderKey } from "@/lib/llm/types";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/hooks/useLang";
import {
  configuredProviders,
  credentialsFor,
  loadSettings,
  type Settings,
} from "@/lib/settings";
import { PROVIDERS_BY_KEY } from "@/lib/providers-meta";
import { runAgent } from "@/lib/runAgentClient";
import { truncateUpstream } from "@/lib/pipeline/truncate";
import type { PipelineStep, StepStatus } from "@/lib/pipeline/types";
import Header from "./Header";
import ModelSelector from "./ModelSelector";
import MarkdownView from "./MarkdownView";
import PipelineAgentPicker from "./PipelineAgentPicker";

// Budgets sized so instruction + upstream block + labels can never exceed the
// server's 200k context cap (8k + 180k + a little label overhead < 200k).
const MAX_INSTRUCTION_CHARS = 8_000;
const MAX_UPSTREAM_CHARS = 180_000;

function newStep(): PipelineStep {
  return {
    id: crypto.randomUUID(),
    agentId: "",
    instruction: "",
    output: "",
    status: "idle",
    error: null,
  };
}

const STATUS_KEY: Record<StepStatus, Parameters<typeof t>[0]> = {
  idle: "pipelineStepIdle",
  running: "pipelineStepRunning",
  done: "pipelineStepDone",
  error: "pipelineStepError",
  skipped: "pipelineStepSkipped",
};

export default function PipelineRunner() {
  const [lang, setLang] = useLang();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [providers, setProviders] = useState<ProviderKey[]>([]);
  const [provider, setProvider] = useState<ProviderKey>("openai");
  const [model, setModel] = useState<string>("");

  const [steps, setSteps] = useState<PipelineStep[]>([newStep()]);
  const [running, setRunning] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  // Mutable accumulator for the in-flight step's streamed text (avoids the
  // stale closure a setSteps(prev => …) read would hit).
  const liveRef = useRef("");
  // Current step's AbortController, replaced per step; aborted on Stop/halt.
  const abortRef = useRef<AbortController | null>(null);
  // Synchronous re-entry guard so a double-click can't launch two runs.
  const runningRef = useRef(false);

  // Load settings once on mount and pick a sensible provider/model.
  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    const configured = configuredProviders(s);
    setProviders(configured);
    const initial =
      configured.includes(s.defaultProvider) && s.defaultProvider
        ? s.defaultProvider
        : configured[0];
    if (initial) {
      setProvider(initial);
      setModel(
        initial === s.defaultProvider && s.defaultModel
          ? s.defaultModel
          : PROVIDERS_BY_KEY[initial].models[0]
      );
    }
  }, []);

  // Abort the live stream on unmount so onDelta never fires post-unmount.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function handleProviderChange(p: ProviderKey) {
    setProvider(p);
    setModel(PROVIDERS_BY_KEY[p].models[0]);
  }

  // ── Immutable step mutations ───────────────────────────────────────────────
  function patchStep(id: string, patch: Partial<PipelineStep>) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addStep() {
    if (running) return;
    setSteps((prev) => [...prev, newStep()]);
  }

  function removeStep(id: string) {
    if (running) return;
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  // ── Sequential run loop ────────────────────────────────────────────────────
  async function handleRun() {
    if (runningRef.current) return;
    if (steps.length === 0) return;
    if (!settings) return;
    if (steps.some((s) => !s.agentId)) {
      setPipelineError(t("pipelinePickAgentForAllSteps", lang));
      return;
    }

    const creds = credentialsFor(settings, provider);
    if (!creds) {
      setPipelineError(t("noKeysConfigured", lang));
      return;
    }

    runningRef.current = true;
    setRunning(true);
    setPipelineError(null);

    // Snapshot the step list and language at run time so a mid-run language
    // toggle (or any edit) can't change what this run sends.
    const snapshot = steps;
    const runLang = lang;

    // Reset all steps to idle before starting.
    setSteps((prev) =>
      prev.map((s) => ({ ...s, output: "", status: "idle", error: null }))
    );

    let previousOutput = "";

    for (let i = 0; i < snapshot.length; i++) {
      const step = snapshot[i]!;
      patchStep(step.id, { status: "running", output: "", error: null });

      liveRef.current = "";
      const controller = new AbortController();
      abortRef.current = controller;

      // Build context: instruction + (when i > 0) labelled upstream block.
      let context = step.instruction.trim();
      if (i > 0 && previousOutput) {
        const { text: upstream, truncated } = truncateUpstream(
          previousOutput,
          MAX_UPSTREAM_CHARS
        );
        const upstreamLabel =
          runLang === "en"
            ? "\n\n--- OUTPUT FROM PREVIOUS STEP ---\n"
            : "\n\n--- 上一步驟的輸出 ---\n";
        const truncateNote = truncated
          ? "\n" + t("pipelineContextTruncated", runLang)
          : "";
        context = context + upstreamLabel + upstream + truncateNote;
      }

      try {
        await runAgent({
          agentId: step.agentId,
          inputs: {},
          provider,
          model: model || PROVIDERS_BY_KEY[provider].models[0]!,
          apiKey: creds.apiKey,
          baseUrl: creds.baseUrl,
          lang: runLang,
          context,
          signal: controller.signal,
          onDelta: (text) => {
            liveRef.current += text;
            patchStep(step.id, { output: liveRef.current, status: "running" });
          },
        });

        const finalOutput = liveRef.current;
        patchStep(step.id, { output: finalOutput, status: "done" });
        previousOutput = finalOutput;
      } catch (err) {
        // Firefox rejects an aborted fetch with a plain TypeError, so trust the
        // controller's signal as the source of truth.
        const aborted =
          controller.signal.aborted ||
          (err instanceof DOMException && err.name === "AbortError");
        const partial = liveRef.current;
        const message = aborted
          ? t("pipelineStopped", runLang)
          : err instanceof Error
            ? err.message
            : "Unknown error";

        // Halt the chain: mark current step errored, later steps skipped.
        // Match later steps by id (from the snapshot) so the result is correct
        // regardless of array indices.
        const laterIds = new Set(snapshot.slice(i + 1).map((x) => x.id));
        setSteps((prev) =>
          prev.map((s) => {
            if (s.id === step.id)
              return {
                ...s,
                output: aborted ? partial : s.output,
                status: "error" as StepStatus,
                error: message,
              };
            if (laterIds.has(s.id))
              return { ...s, status: "skipped" as StepStatus };
            return s;
          })
        );

        liveRef.current = "";
        abortRef.current = null;
        break;
      }

      liveRef.current = "";
      abortRef.current = null;
    }

    runningRef.current = false;
    setRunning(false);
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  function handleReset() {
    if (running) return;
    setPipelineError(null);
    setSteps((prev) =>
      prev.map((s) => ({ ...s, output: "", status: "idle", error: null }))
    );
  }

  const noProviders = providers.length === 0;

  return (
    <div className="min-h-screen">
      <Header lang={lang} onToggleLang={setLang} />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-muted transition hover:text-accent"
        >
          {t("backToHome", lang)}
        </Link>

        <div className="mt-5 border-b border-border pb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {t("pipelineTitle", lang)}
          </h1>
          <p className="mt-2 max-w-xl leading-relaxed text-foreground-soft">
            {t("pipelineSubtitle", lang)}
          </p>
          <p className="mt-3 max-w-xl font-mono text-[11px] leading-relaxed text-muted">
            {t("pipelineInjectionCaveat", lang)}
          </p>
        </div>

        {noProviders ? (
          <div className="mt-6 rounded-none border border-amber-600/40 bg-amber-500/15 p-4 text-sm">
            <p className="text-amber-900">{t("noKeysConfigured", lang)}</p>
            <Link
              href="/settings"
              className="mt-2 inline-block font-medium text-accent hover:text-accent-hover"
            >
              {t("goToSettings", lang)}
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <ModelSelector
              providers={providers}
              provider={provider}
              model={model}
              onProviderChange={handleProviderChange}
              onModelChange={setModel}
              lang={lang}
            />

            {/* Steps */}
            <div className="space-y-4">
              {steps.length === 0 && (
                <p className="font-mono text-sm text-muted">
                  {t("pipelineNoSteps", lang)}
                </p>
              )}

              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="space-y-3 border border-border bg-surface p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-widest text-accent">
                      {t("pipelineStepLabel", lang)} {index + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                        {t(STATUS_KEY[step.status], lang)}
                      </span>
                      {!running && steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(step.id)}
                          className="font-mono text-[10px] uppercase tracking-widest text-muted transition hover:text-red-400"
                        >
                          {t("pipelineRemoveStep", lang)}
                        </button>
                      )}
                    </div>
                  </div>

                  <PipelineAgentPicker
                    agentId={step.agentId}
                    onPick={(agentId) => patchStep(step.id, { agentId })}
                    disabled={running}
                    lang={lang}
                  />

                  <textarea
                    value={step.instruction}
                    onChange={(e) =>
                      patchStep(step.id, { instruction: e.target.value })
                    }
                    placeholder={t("pipelineInstructionPlaceholder", lang)}
                    rows={3}
                    maxLength={MAX_INSTRUCTION_CHARS}
                    disabled={running}
                    className="w-full resize-y rounded-none border border-border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted focus:border-accent disabled:opacity-50"
                  />

                  {step.error && (
                    <div className="rounded-none border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
                      {step.error}
                    </div>
                  )}

                  {(step.output || step.status === "running") && (
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                        {t("pipelineOutputLabel", lang)}
                      </span>
                      <div
                        className={
                          step.status === "running" ? "stream-cursor" : ""
                        }
                      >
                        {step.output ? (
                          <MarkdownView
                            text={step.output}
                            streaming={step.status === "running"}
                          />
                        ) : (
                          <span className="font-mono text-sm text-muted">
                            {t("running", lang)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!running && (
              <button
                type="button"
                onClick={addStep}
                className="border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted transition hover:border-accent hover:text-accent"
              >
                + {t("pipelineAddStep", lang)}
              </button>
            )}

            {pipelineError && (
              <div className="rounded-none border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {pipelineError}
              </div>
            )}

            {/* Action bar */}
            <div className="flex flex-wrap gap-2">
              {running ? (
                <button
                  onClick={handleStop}
                  className="border border-border-strong px-6 py-2.5 font-mono text-sm uppercase tracking-widest transition hover:border-accent hover:text-accent"
                >
                  ◼ {t("pipelineStop", lang)}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => void handleRun()}
                    disabled={steps.length === 0}
                    className="bg-accent px-6 py-2.5 font-mono text-sm uppercase tracking-widest text-white transition hover:bg-accent-hover disabled:opacity-50"
                  >
                    {t("pipelineRun", lang)} →
                  </button>
                  <button
                    onClick={handleReset}
                    className="border border-border px-6 py-2.5 font-mono text-sm uppercase tracking-widest text-muted transition hover:text-foreground"
                  >
                    {t("pipelineReset", lang)}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
