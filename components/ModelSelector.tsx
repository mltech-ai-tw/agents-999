"use client";

import type { ProviderKey } from "@/lib/llm/types";
import { PROVIDERS_BY_KEY } from "@/lib/providers-meta";
import { t, type Lang } from "@/lib/i18n";

export default function ModelSelector({
  providers,
  provider,
  model,
  onProviderChange,
  onModelChange,
  lang,
}: {
  providers: ProviderKey[];
  provider: ProviderKey;
  model: string;
  onProviderChange: (p: ProviderKey) => void;
  onModelChange: (m: string) => void;
  lang: Lang;
}) {
  const meta = PROVIDERS_BY_KEY[provider];
  const datalistId = `models-${provider}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="flex flex-1 flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          {t("provider", lang)}
        </span>
        <select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value as ProviderKey)}
          className="rounded-none border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        >
          {providers.map((p) => (
            <option key={p} value={p}>
              {PROVIDERS_BY_KEY[p].label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          {t("model", lang)}
        </span>
        <input
          list={datalistId}
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          placeholder={meta?.models[0]}
          className="rounded-none border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        />
        <datalist id={datalistId}>
          {meta?.models.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </label>
    </div>
  );
}
