"use client";

import { useMemo, useState } from "react";
import { AGENT_DATA } from "@/lib/agents/data";
import type { AgentMeta } from "@/lib/agents/types";
import { t, type Lang } from "@/lib/i18n";

const MAX_RESULTS = 30;

type Props = {
  agentId: string;
  onPick: (agentId: string) => void;
  disabled: boolean;
  lang: Lang;
};

function nameOf(a: AgentMeta, lang: Lang): string {
  return lang === "zh" ? a.label : a.labelEn;
}

/**
 * Inline agent picker for a single pipeline step. Searches the client-safe
 * AGENT_DATA meta rows (never ALL_AGENTS / prompt closures). Shows the chosen
 * agent's name when set; otherwise a search box with a result list.
 */
export default function PipelineAgentPicker({
  agentId,
  onPick,
  disabled,
  lang,
}: Props) {
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => AGENT_DATA.find((a) => a.id === agentId) ?? null,
    [agentId]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return AGENT_DATA.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.labelEn.toLowerCase().includes(q) ||
        a.desc.toLowerCase().includes(q) ||
        a.descEn.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
    ).slice(0, MAX_RESULTS);
  }, [query]);

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-2 border border-border bg-surface px-3 py-2">
        <span className="text-sm text-foreground">{nameOf(selected, lang)}</span>
        {!disabled && (
          <button
            type="button"
            onClick={() => onPick("")}
            className="font-mono text-[10px] uppercase tracking-widest text-muted transition hover:text-accent"
          >
            {t("change", lang)}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("pipelineSearchPlaceholder", lang)}
        disabled={disabled}
        className="rounded-none border border-border bg-surface px-3 py-2 text-sm outline-none transition placeholder:text-muted focus:border-accent disabled:opacity-50"
      />
      {results.length > 0 && (
        <ul className="thin-scroll max-h-48 divide-y divide-border overflow-y-auto border border-border bg-surface">
          {results.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(a.id);
                  setQuery("");
                }}
                className="flex w-full flex-col gap-0.5 px-3 py-2 text-left transition hover:bg-surface-2"
              >
                <span className="text-sm text-foreground">
                  {nameOf(a, lang)}
                </span>
                <span className="line-clamp-1 text-xs text-muted">
                  {lang === "zh" ? a.desc : a.descEn}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
