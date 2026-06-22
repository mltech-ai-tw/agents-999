"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AgentInput, AgentCategory } from "@/lib/agents/types";
import type { ProviderKey } from "@/lib/llm/types";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/hooks/useLang";
import {
  configuredProviders,
  loadSettings,
  type Settings,
} from "@/lib/settings";
import { PROVIDERS_BY_KEY } from "@/lib/providers-meta";
import { getExamples } from "@/lib/agents/examples";
import Header from "./Header";
import CategoryBadge from "./CategoryBadge";
import CompareRunner from "./CompareRunner";
import ConversationRunner from "./ConversationRunner";

export type AgentView = {
  id: string;
  label: string;
  labelEn: string;
  desc: string;
  descEn: string;
  cat: AgentCategory;
  inputs: AgentInput[];
  model?: string;
};

export default function AgentRunner({ agent }: { agent: AgentView }) {
  const [lang, setLang] = useLang();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [providers, setProviders] = useState<ProviderKey[]>([]);
  const [provider, setProvider] = useState<ProviderKey>("openai");
  const [model, setModel] = useState<string>("");

  const [values, setValues] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  // Load settings on mount and pick a sensible provider/model.
  // One-time hydration from localStorage (unavailable during SSR/render), so
  // the cascading-render rule doesn't apply here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    const configured = configuredProviders(s);
    setProviders(configured);
    const initialProvider =
      configured.includes(s.defaultProvider) && s.defaultProvider
        ? s.defaultProvider
        : configured[0];
    if (initialProvider) {
      setProvider(initialProvider);
      setModel(
        agent.model ??
          (initialProvider === s.defaultProvider && s.defaultModel
            ? s.defaultModel
            : PROVIDERS_BY_KEY[initialProvider].models[0])
      );
    }
  }, [agent.model]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Keep model sensible when provider changes.
  function handleProviderChange(p: ProviderKey) {
    setProvider(p);
    setModel(agent.model ?? PROVIDERS_BY_KEY[p].models[0]);
  }

  const name = lang === "zh" ? agent.label : agent.labelEn;
  const desc = lang === "zh" ? agent.desc : agent.descEn;

  function setField(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    for (const input of agent.inputs) {
      if (input.required && !(values[input.key] || "").trim()) {
        const label = lang === "zh" ? input.label : input.labelEn;
        return lang === "zh" ? `請填寫「${label}」` : `Please fill in "${label}"`;
      }
    }
    return null;
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

        <div className="mt-5 flex items-start justify-between gap-3 border-b border-border pb-6">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {name}
            </h1>
            <p className="mt-2 max-w-xl leading-relaxed text-foreground-soft">
              {desc}
            </p>
          </div>
          <CategoryBadge cat={agent.cat} lang={lang} />
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
            {/* Compare toggle — shown only when at least one provider is configured */}
            <div className="flex items-center gap-3">
              <button
                aria-pressed={compareMode}
                onClick={() => {
                  // Leaving compare mode unmounts CompareRunner; clear the
                  // shared running flag so it can't get stuck on.
                  if (compareMode) setRunning(false);
                  setCompareMode((v) => !v);
                }}
                className={`font-mono text-xs uppercase tracking-widest transition ${
                  compareMode
                    ? "border-b border-accent pb-0.5 text-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {compareMode ? t("compareMode", lang) : t("compareModeOff", lang)}
              </button>
            </div>

            {compareMode && settings ? (
              <CompareRunner
                agent={agent}
                settings={settings}
                providers={providers}
                values={values}
                validate={validate}
                lang={lang}
                onRunningChange={setRunning}
              />
            ) : settings ? (
              <>
            {agent.inputs[0] && (
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-muted">
                  {lang === "zh" ? "範例（點擊填入）" : "Examples (click to fill)"}
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {getExamples(agent.cat, agent.label, agent.labelEn, lang).map(
                    (ex, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setField(agent.inputs[0]!.key, ex)}
                        className="group flex flex-col gap-1 border border-border bg-surface p-3 text-left transition hover:border-accent hover:bg-surface-2"
                      >
                        <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
                          {lang === "zh" ? `範例 ${i + 1}` : `Example ${i + 1}`}
                        </span>
                        <span className="line-clamp-3 text-sm leading-relaxed text-muted group-hover:text-foreground-soft">
                          {ex}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {agent.inputs.map((input) => (
              <Field
                key={input.key}
                input={input}
                value={values[input.key] ?? ""}
                onChange={(v) => setField(input.key, v)}
                lang={lang}
              />
            ))}

            <ConversationRunner
              agent={agent}
              settings={settings}
              providers={providers}
              provider={provider}
              model={model}
              values={values}
              validate={validate}
              lang={lang}
              onRunningChange={setRunning}
              onProviderChange={handleProviderChange}
              onModelChange={setModel}
            />
              </>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}

function Field({
  input,
  value,
  onChange,
  lang,
}: {
  input: AgentInput;
  value: string;
  onChange: (v: string) => void;
  lang: "zh" | "en";
}) {
  const label = lang === "zh" ? input.label : input.labelEn;
  const placeholder =
    lang === "zh" ? input.placeholder : input.placeholderEn ?? input.placeholder;
  const tag = input.required ? t("required", lang) : t("optional", lang);

  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-widest">
        {label}{" "}
        <span className={input.required ? "text-accent" : "text-muted"}>
          ({tag})
        </span>
      </span>

      {input.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="resize-y rounded-none border border-border bg-surface px-3 py-2 outline-none transition placeholder:text-muted focus:border-accent"
        />
      ) : input.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-none border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        >
          <option value="">—</option>
          {(input.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="rounded-none border border-border bg-surface px-3 py-2 outline-none transition placeholder:text-muted focus:border-accent"
        />
      )}
    </label>
  );
}
