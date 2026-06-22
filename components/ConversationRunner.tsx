"use client";

import { useEffect, useRef, useState } from "react";
import type { ProviderKey } from "@/lib/llm/types";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { PROVIDERS_BY_KEY } from "@/lib/providers-meta";
import { credentialsFor, type Settings } from "@/lib/settings";
import { runAgent, type RunHistoryItem } from "@/lib/runAgentClient";
import ModelSelector from "./ModelSelector";
import MarkdownView from "./MarkdownView";
import type { AgentView } from "./AgentRunner";

// ── Turn shape ───────────────────────────────────────────────────────────────
// A conversation turn is exactly what the API accepts as a history item —
// keep a single source of truth so the two cannot drift apart.
export type Turn = RunHistoryItem;

// ── Props (mirrors CompareRunner) ────────────────────────────────────────────
export type ConversationRunnerProps = {
  agent: AgentView;
  settings: Settings;
  providers: ProviderKey[];
  provider: ProviderKey;
  model: string;
  values: Record<string, string>;
  validate: () => string | null;
  lang: Lang;
  onRunningChange: (v: boolean) => void;
  onProviderChange: (p: ProviderKey) => void;
  onModelChange: (m: string) => void;
};

// ── Component ────────────────────────────────────────────────────────────────
export default function ConversationRunner({
  agent,
  settings,
  providers,
  provider,
  model,
  values,
  validate,
  lang,
  onRunningChange,
  onProviderChange,
  onModelChange,
}: ConversationRunnerProps) {
  const [thread, setThread] = useState<Turn[]>([]); // completed turns
  const [streaming, setStreaming] = useState(""); // in-progress assistant text
  const [running, setRunning] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  // Mutable accumulator for the in-flight assistant text — avoids the stale
  // closure that a setStreaming(prev => …) read would hit when we push the
  // finished turn into `thread`.
  const liveRef = useRef("");
  // Synchronous re-entry guard so a double-click cannot launch two streams.
  const runningRef = useRef(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Abort the live stream on unmount so onDelta never fires post-unmount.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Keep the conversation scrolled to the newest content.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread, streaming]);

  function setRunningState(v: boolean) {
    runningRef.current = v;
    setRunning(v);
    onRunningChange(v);
  }

  // Shared stream driver for both first-run and follow-up turns.
  async function stream(history: Turn[] | undefined) {
    const creds = credentialsFor(settings, provider);
    if (!creds) {
      setError(t("noKeysConfigured", lang));
      return;
    }

    setError(null);
    setStreaming("");
    liveRef.current = "";
    setRunningState(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await runAgent({
        agentId: agent.id,
        inputs: values,
        provider,
        model: model || PROVIDERS_BY_KEY[provider].models[0]!,
        apiKey: creds.apiKey,
        baseUrl: creds.baseUrl,
        lang,
        ...(history ? { history } : {}),
        signal: controller.signal,
        onDelta: (text) => {
          liveRef.current += text;
          setStreaming(liveRef.current);
        },
      });
      setThread((prev) => [
        ...prev,
        { role: "assistant", content: liveRef.current },
      ]);
    } catch (err) {
      // Firefox rejects an aborted fetch with a plain TypeError (not a
      // DOMException), so trust the controller's own signal as the source of
      // truth and only fall back to the error name.
      const aborted =
        controller.signal.aborted ||
        (err instanceof DOMException && err.name === "AbortError");
      if (aborted) {
        // User stopped mid-stream — keep any partial text so the thread stays
        // coherent and a follow-up can still continue from it.
        if (liveRef.current) {
          setThread((prev) => [
            ...prev,
            { role: "assistant", content: liveRef.current },
          ]);
        }
      } else {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setStreaming("");
      liveRef.current = "";
      abortRef.current = null;
      setRunningState(false);
    }
  }

  // ── First run (no history) ─────────────────────────────────────────────────
  async function handleFirstRun() {
    if (runningRef.current || thread.length > 0) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    await stream(undefined);
  }

  // ── Follow-up (history = thread ending with the new user message) ──────────
  async function handleFollowUp() {
    if (runningRef.current) return;
    const text = followUp.trim();
    if (!text) return;

    const nextThread: Turn[] = [...thread, { role: "user", content: text }];
    setThread(nextThread);
    setFollowUp("");
    await stream(nextThread);
  }

  // ── Stop ───────────────────────────────────────────────────────────────────
  function handleStop() {
    abortRef.current?.abort();
  }

  // ── Reset thread ───────────────────────────────────────────────────────────
  function handleReset() {
    abortRef.current?.abort();
    // Reset the run flags eagerly so state is deterministic regardless of when
    // the aborted stream's finally block runs.
    setRunningState(false);
    setThread([]);
    setStreaming("");
    setFollowUp("");
    setError(null);
    setCopiedIndex(null);
  }

  async function handleCopy(index: number, content: string) {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(
        () => setCopiedIndex((prev) => (prev === index ? null : prev)),
        1500
      );
    } catch {
      // Clipboard fails on non-HTTPS origins / denied permissions — surface it.
      setError(t("copyFailed", lang));
    }
  }

  const hasAssistantTurn = thread.some((turn) => turn.role === "assistant");
  const canFollowUp = hasAssistantTurn && !running;

  return (
    <div className="mt-2 space-y-4">
      <ModelSelector
        providers={providers}
        provider={provider}
        model={model}
        onProviderChange={onProviderChange}
        onModelChange={onModelChange}
        lang={lang}
      />

      {/* Conversation thread */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            {t("output", lang)}
          </span>
          {hasAssistantTurn && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {t("conversationFollowUpHint", lang)}
            </span>
          )}
        </div>

        <div
          ref={scrollRef}
          className="thin-scroll max-h-[36rem] min-h-[10rem] space-y-4 overflow-y-auto rounded-none border border-border bg-surface p-5"
        >
          {thread.length === 0 && !streaming && !running ? (
            <span className="font-mono text-sm text-muted">
              {t("emptyOutputHint", lang)}
            </span>
          ) : (
            thread.map((turn, index) =>
              turn.role === "assistant" ? (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                      {t("conversationTurnLabel", lang)}
                    </span>
                    <button
                      onClick={() => handleCopy(index, turn.content)}
                      className="font-mono text-[10px] text-muted transition hover:text-foreground"
                    >
                      {copiedIndex === index
                        ? t("copied", lang)
                        : t("copy", lang)}
                    </button>
                  </div>
                  <MarkdownView text={turn.content} streaming={false} />
                </div>
              ) : (
                <div
                  key={index}
                  className="border-l-2 border-accent bg-surface-2 px-3 py-2"
                >
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">
                    {t("conversationYou", lang)}
                  </span>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground-soft">
                    {turn.content}
                  </p>
                </div>
              )
            )
          )}

          {/* Live streaming assistant text */}
          {streaming && (
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                {t("conversationTurnLabel", lang)}
              </span>
              <div className="stream-cursor">
                <MarkdownView text={streaming} streaming />
              </div>
            </div>
          )}

          {/* Running but no bytes yet */}
          {running && !streaming && (
            <span className="font-mono text-sm text-muted">
              {t("running", lang)}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-none border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Follow-up composer — only once at least one assistant turn exists */}
      {canFollowUp && (
        <div className="flex flex-col gap-2">
          <textarea
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void handleFollowUp();
              }
            }}
            placeholder={t("conversationFollowUpPlaceholder", lang)}
            rows={3}
            maxLength={100_000}
            className="resize-y rounded-none border border-border bg-surface px-3 py-2 outline-none transition placeholder:text-muted focus:border-accent"
          />
          <div>
            <button
              onClick={() => void handleFollowUp()}
              disabled={!followUp.trim()}
              className="bg-accent px-6 py-2.5 font-mono text-sm uppercase tracking-widest text-white transition hover:bg-accent-hover disabled:opacity-50"
            >
              {t("conversationSend", lang)} →
            </button>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex flex-wrap gap-2">
        {running ? (
          <button
            onClick={handleStop}
            className="border border-border-strong px-6 py-2.5 font-mono text-sm uppercase tracking-widest transition hover:border-accent hover:text-accent"
          >
            ◼ {t("stop", lang)}
          </button>
        ) : thread.length === 0 ? (
          <button
            onClick={() => void handleFirstRun()}
            className="bg-accent px-6 py-2.5 font-mono text-sm uppercase tracking-widest text-white transition hover:bg-accent-hover"
          >
            {t("run", lang)} →
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="border border-border px-6 py-2.5 font-mono text-sm uppercase tracking-widest text-muted transition hover:text-foreground"
          >
            {t("conversationReset", lang)}
          </button>
        )}
      </div>
    </div>
  );
}
