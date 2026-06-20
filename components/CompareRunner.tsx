"use client";

import { useEffect, useRef, useState } from "react";
import type { ProviderKey } from "@/lib/llm/types";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { PROVIDERS_BY_KEY } from "@/lib/providers-meta";
import { credentialsFor, type Settings } from "@/lib/settings";
import { runAgent } from "@/lib/runAgentClient";
import ModelSelector from "./ModelSelector";
import MarkdownView from "./MarkdownView";
import type { AgentView } from "./AgentRunner";

// ── Column state shape ──────────────────────────────────────────────────────
export type ColStatus = "idle" | "streaming" | "done" | "error";

export type ColState = {
  readonly id: string; // stable id assigned at column creation
  readonly provider: ProviderKey;
  readonly model: string;
  readonly output: string;
  readonly status: ColStatus;
  readonly error: string | null;
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const MAX_COLS = 3;

function makeDefaultCol(
  provider: ProviderKey,
  model: string,
  id: string
): ColState {
  return { id, provider, model, output: "", status: "idle", error: null };
}

function updateCol(
  cols: ColState[],
  id: string,
  patch: Partial<ColState>
): ColState[] {
  // Returns a NEW array — never mutates.
  return cols.map((c) => (c.id === id ? { ...c, ...patch } : c));
}

function uid(): string {
  return crypto.randomUUID();
}

function modelFor(agent: AgentView, p: ProviderKey): string {
  return agent.model ?? PROVIDERS_BY_KEY[p].models[0] ?? "";
}

// ── Props ───────────────────────────────────────────────────────────────────
export type CompareRunnerProps = {
  agent: AgentView;
  settings: Settings;
  providers: ProviderKey[];
  values: Record<string, string>;
  validate: () => string | null;
  lang: Lang;
  onRunningChange: (v: boolean) => void;
};

// ── Component ───────────────────────────────────────────────────────────────
export default function CompareRunner({
  agent,
  settings,
  providers,
  values,
  validate,
  lang,
  onRunningChange,
}: CompareRunnerProps) {
  // Seed initial columns from the first two available providers so compare is
  // immediately useful without extra clicks.
  const [cols, setCols] = useState<ColState[]>(() => {
    const initial = providers
      .slice(0, 2)
      .map((p) => makeDefaultCol(p, modelFor(agent, p), uid()));
    if (initial.length === 0 && providers[0]) {
      const p = providers[0];
      initial.push(makeDefaultCol(p, modelFor(agent, p), uid()));
    }
    return initial;
  });

  // Map<colId, AbortController> — one controller per active stream.
  const abortMap = useRef<Map<string, AbortController>>(new Map());
  // Synchronous re-entry guard so a double-click cannot launch two batches.
  const runningRef = useRef(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Abort every live stream on unmount so onDelta never fires post-unmount.
  useEffect(() => {
    const map = abortMap.current;
    return () => {
      for (const ctrl of map.values()) ctrl.abort();
      map.clear();
    };
  }, []);

  // ── Column CRUD (immutable) ─────────────────────────────────────────────
  function addCol() {
    if (cols.length >= MAX_COLS || providers.length === 0) return;
    const p = providers[0]!;
    setCols((prev) => [...prev, makeDefaultCol(p, modelFor(agent, p), uid())]);
  }

  function removeCol(id: string) {
    abortMap.current.get(id)?.abort();
    abortMap.current.delete(id);
    setCols((prev) => prev.filter((c) => c.id !== id));
  }

  function setColProvider(id: string, p: ProviderKey) {
    setCols((prev) => updateCol(prev, id, { provider: p, model: modelFor(agent, p) }));
  }

  function setColModel(id: string, model: string) {
    setCols((prev) => updateCol(prev, id, { model }));
  }

  // ── Run all ──────────────────────────────────────────────────────────────
  async function handleRunAll() {
    if (runningRef.current) return; // guard against double-fire
    setGlobalError(null);

    const validationError = validate();
    if (validationError) {
      setGlobalError(validationError);
      return;
    }

    // Capture the column snapshot BEFORE resetting, to avoid racing add/remove.
    const snapshot = cols;

    // Reset all column outputs before starting.
    setCols((prev) =>
      prev.map((c) => ({
        ...c,
        output: "",
        status: "idle" as ColStatus,
        error: null,
      }))
    );

    // Flip running BEFORE dispatching so the parent reflects in-flight state
    // for the entire duration streams are active.
    runningRef.current = true;
    onRunningChange(true);

    const promises = snapshot.map(async (col) => {
      const creds = credentialsFor(settings, col.provider);
      if (!creds) {
        setCols((prev) =>
          updateCol(prev, col.id, {
            status: "error",
            error: t("noKeysConfigured", lang),
          })
        );
        return;
      }

      const controller = new AbortController();
      abortMap.current.set(col.id, controller);

      setCols((prev) =>
        updateCol(prev, col.id, {
          status: "streaming",
          output: "",
          error: null,
        })
      );

      try {
        await runAgent({
          agentId: agent.id,
          inputs: values,
          provider: col.provider,
          model: col.model || PROVIDERS_BY_KEY[col.provider].models[0]!,
          apiKey: creds.apiKey,
          baseUrl: creds.baseUrl,
          lang,
          signal: controller.signal,
          onDelta: (text) =>
            setCols((prev) =>
              updateCol(prev, col.id, {
                output: (prev.find((c) => c.id === col.id)?.output ?? "") + text,
              })
            ),
        });
        setCols((prev) => updateCol(prev, col.id, { status: "done" }));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // user stopped — keep partial output
          setCols((prev) => updateCol(prev, col.id, { status: "done" }));
        } else {
          setCols((prev) =>
            updateCol(prev, col.id, {
              status: "error",
              error: err instanceof Error ? err.message : "Unknown error",
            })
          );
        }
      } finally {
        abortMap.current.delete(col.id);
      }
    });

    try {
      await Promise.allSettled(promises);
    } finally {
      runningRef.current = false;
      onRunningChange(false);
    }
  }

  // ── Abort all ─────────────────────────────────────────────────────────────
  function handleStopAll() {
    for (const ctrl of abortMap.current.values()) ctrl.abort();
    // Controllers are cleaned up in each column's finally block.
  }

  // ── Abort single column ────────────────────────────────────────────────────
  function handleStopCol(id: string) {
    abortMap.current.get(id)?.abort();
  }

  // ── Copy ────────────────────────────────────────────────────────────────────
  async function handleCopy(col: ColState) {
    if (!col.output) return;
    try {
      await navigator.clipboard.writeText(col.output);
      setCopiedId(col.id);
      setTimeout(
        () => setCopiedId((prev) => (prev === col.id ? null : prev)),
        1500
      );
    } catch {
      // Clipboard can fail on non-HTTPS origins or with denied permissions —
      // surface it rather than swallowing silently.
      setGlobalError(t("copyFailed", lang));
    }
  }

  const anyStreaming = cols.some((c) => c.status === "streaming");

  // Defensive empty state: settings present but no usable provider credentials.
  if (cols.length === 0) {
    return (
      <div className="mt-6 text-sm text-muted">
        {t("noKeysConfigured", lang)}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mt-6 space-y-4">
      {/* Global action bar */}
      <div className="flex flex-wrap items-center gap-2">
        {!anyStreaming ? (
          <button
            onClick={handleRunAll}
            className="bg-accent px-6 py-2.5 font-mono text-sm uppercase tracking-widest text-white transition hover:bg-accent-hover"
          >
            {t("run", lang)} ({cols.length}) →
          </button>
        ) : (
          <button
            onClick={handleStopAll}
            className="border border-border-strong px-6 py-2.5 font-mono text-sm uppercase tracking-widest transition hover:border-accent hover:text-accent"
          >
            ◼ {t("stop", lang)} {t("compareStopAll", lang)}
          </button>
        )}
        {cols.length < MAX_COLS && (
          <button
            onClick={addCol}
            className="border border-border px-4 py-2.5 font-mono text-sm uppercase tracking-widest text-muted transition hover:text-foreground"
          >
            + {t("compareAddColumn", lang)}
          </button>
        )}
      </div>

      {globalError && (
        <div className="rounded-none border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {globalError}
        </div>
      )}

      {/* Column grid */}
      <div
        className={`grid gap-4 ${
          cols.length === 1
            ? "grid-cols-1"
            : cols.length === 2
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1 lg:grid-cols-3"
        }`}
      >
        {cols.map((col) => (
          <CompareColumn
            key={col.id}
            col={col}
            providers={providers}
            lang={lang}
            canRemove={cols.length > 1}
            copied={copiedId === col.id}
            onProviderChange={(p) => setColProvider(col.id, p)}
            onModelChange={(m) => setColModel(col.id, m)}
            onStop={() => handleStopCol(col.id)}
            onRemove={() => removeCol(col.id)}
            onCopy={() => handleCopy(col)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Per-column sub-component ──────────────────────────────────────────────────
function CompareColumn({
  col,
  providers,
  lang,
  canRemove,
  copied,
  onProviderChange,
  onModelChange,
  onStop,
  onRemove,
  onCopy,
}: {
  col: ColState;
  providers: ProviderKey[];
  lang: Lang;
  canRemove: boolean;
  copied: boolean;
  onProviderChange: (p: ProviderKey) => void;
  onModelChange: (m: string) => void;
  onStop: () => void;
  onRemove: () => void;
  onCopy: () => void;
}) {
  const isStreaming = col.status === "streaming";

  return (
    <div className="flex flex-col gap-3 border border-border bg-surface-2 p-4">
      {/* Column header: model selector + remove */}
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <ModelSelector
            providers={providers}
            provider={col.provider}
            model={col.model}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
            lang={lang}
          />
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="mt-6 font-mono text-xs text-muted transition hover:text-red-400"
            title={t("compareRemoveColumn", lang)}
          >
            ✕
          </button>
        )}
      </div>

      {/* Status + per-column controls */}
      <div className="flex items-center justify-between">
        <ColStatusBadge status={col.status} lang={lang} />
        <div className="flex gap-2">
          {isStreaming && (
            <button
              onClick={onStop}
              className="font-mono text-xs uppercase tracking-widest text-muted transition hover:text-accent"
            >
              ◼ {t("stop", lang)}
            </button>
          )}
          {col.output && !isStreaming && (
            <button
              onClick={onCopy}
              className="font-mono text-xs text-muted transition hover:text-foreground"
            >
              {copied ? t("copied", lang) : t("copy", lang)}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {col.error && (
        <div className="rounded-none border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
          {col.error}
        </div>
      )}

      {/* Output */}
      <div className="thin-scroll max-h-[32rem] min-h-[10rem] overflow-y-auto rounded-none border border-border bg-surface p-4">
        {col.output ? (
          <div className={isStreaming ? "stream-cursor" : ""}>
            <MarkdownView text={col.output} streaming={isStreaming} />
          </div>
        ) : (
          <span className="font-mono text-sm text-muted">
            {col.status === "idle"
              ? t("compareIdle", lang)
              : isStreaming
                ? t("running", lang)
                : t("emptyOutputHint", lang)}
          </span>
        )}
      </div>
    </div>
  );
}

function ColStatusBadge({ status, lang }: { status: ColStatus; lang: Lang }) {
  const label = {
    idle: t("compareStatusIdle", lang),
    streaming: t("compareStatusStreaming", lang),
    done: t("compareStatusDone", lang),
    error: t("compareStatusError", lang),
  }[status];

  const colour = {
    idle: "text-muted",
    streaming: "text-accent",
    done: "text-green-400",
    error: "text-red-400",
  }[status];

  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-widest ${colour}`}
    >
      {label}
    </span>
  );
}
