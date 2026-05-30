"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProviderKey } from "@/lib/llm/types";
import { PROVIDERS_META, PROVIDERS_BY_KEY } from "@/lib/providers-meta";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/hooks/useLang";
import {
  DEFAULT_SETTINGS,
  clearSettings,
  configuredProviders,
  loadSettings,
  saveSettings,
  type Settings,
} from "@/lib/settings";
import Header from "./Header";

type TestState = "idle" | "testing" | "ok" | "fail";

export default function SettingsView() {
  const [lang, setLang] = useLang();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [test, setTest] = useState<Record<string, TestState>>({});
  const [testMsg, setTestMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  function update(next: Settings) {
    setSettings(next);
    setSaved(false);
  }

  function setSimpleKey(provider: "openai" | "anthropic" | "gemini" | "mistral" | "groq", value: string) {
    update({ ...settings, keys: { ...settings.keys, [provider]: value || undefined } });
  }

  function setOllama(baseUrl: string) {
    update({
      ...settings,
      keys: { ...settings.keys, ollama: baseUrl ? { baseUrl } : undefined },
    });
  }

  function setAzure(patch: Partial<NonNullable<Settings["keys"]["azure"]>>) {
    const current = settings.keys.azure ?? {
      endpoint: "",
      apiKey: "",
      deploymentName: "",
    };
    const next = { ...current, ...patch };
    const hasAny = next.endpoint || next.apiKey || next.deploymentName;
    update({
      ...settings,
      keys: { ...settings.keys, azure: hasAny ? next : undefined },
    });
  }

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleClear() {
    if (!window.confirm(t("confirmClear", lang))) return;
    clearSettings();
    setSettings(DEFAULT_SETTINGS);
    setTest({});
    setTestMsg({});
  }

  async function handleTest(provider: ProviderKey) {
    const meta = PROVIDERS_BY_KEY[provider];
    let apiKey = "";
    let baseUrl: string | undefined;
    let model = meta.models[0];

    if (provider === "ollama") {
      baseUrl = settings.keys.ollama?.baseUrl || "http://localhost:11434";
    } else if (provider === "azure") {
      apiKey = settings.keys.azure?.apiKey ?? "";
      baseUrl = settings.keys.azure?.endpoint;
      model = settings.keys.azure?.deploymentName || model;
    } else {
      apiKey = (settings.keys[provider] as string) ?? "";
    }

    setTest((s) => ({ ...s, [provider]: "testing" }));
    setTestMsg((s) => ({ ...s, [provider]: "" }));

    try {
      const res = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model, apiKey, baseUrl }),
      });
      const data = await res.json();
      if (data.ok) {
        setTest((s) => ({ ...s, [provider]: "ok" }));
      } else {
        setTest((s) => ({ ...s, [provider]: "fail" }));
        setTestMsg((s) => ({ ...s, [provider]: data.error ?? "" }));
      }
    } catch (err) {
      setTest((s) => ({ ...s, [provider]: "fail" }));
      setTestMsg((s) => ({
        ...s,
        [provider]: err instanceof Error ? err.message : "",
      }));
    }
  }

  const configured = configuredProviders(settings);

  return (
    <div className="min-h-screen">
      <Header lang={lang} onToggleLang={setLang} />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          {t("backToHome", lang)}
        </Link>

        <h1 className="mt-4 text-2xl font-bold">{t("settings", lang)}</h1>
        <p className="mt-1 text-sm text-muted">{t("heroSubtitle", lang)}</p>

        {!loaded ? null : (
          <>
            {/* Defaults */}
            <section className="mt-6 rounded-xl border border-border bg-surface p-4">
              <h2 className="mb-3 font-semibold">
                {lang === "zh" ? "預設值" : "Defaults"}
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-xs text-muted">
                    {t("defaultProvider", lang)}
                  </span>
                  <select
                    value={settings.defaultProvider}
                    onChange={(e) =>
                      update({
                        ...settings,
                        defaultProvider: e.target.value as ProviderKey,
                      })
                    }
                    className="rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent"
                  >
                    {PROVIDERS_META.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-xs text-muted">
                    {t("defaultModel", lang)}
                  </span>
                  <input
                    value={settings.defaultModel}
                    onChange={(e) =>
                      update({ ...settings, defaultModel: e.target.value })
                    }
                    className="rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent"
                  />
                </label>
              </div>
            </section>

            {/* Per-provider */}
            <div className="mt-4 space-y-4">
              {PROVIDERS_META.map((p) => {
                const isConfigured = configured.includes(p.key);
                const state = test[p.key] ?? "idle";
                return (
                  <section
                    key={p.key}
                    className="rounded-xl border border-border bg-surface p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 font-semibold">
                        {p.label}
                        {isConfigured && (
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        )}
                      </h2>
                      <a
                        href={p.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted hover:text-accent"
                      >
                        {lang === "zh" ? "取得金鑰 ↗" : "Get key ↗"}
                      </a>
                    </div>

                    {/* Credential fields */}
                    {p.key === "ollama" ? (
                      <Labeled label={t("baseUrl", lang)}>
                        <input
                          value={settings.keys.ollama?.baseUrl ?? ""}
                          onChange={(e) => setOllama(e.target.value)}
                          placeholder="http://localhost:11434"
                          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent"
                        />
                      </Labeled>
                    ) : p.key === "azure" ? (
                      <div className="space-y-3">
                        <Labeled label={t("endpoint", lang)}>
                          <input
                            value={settings.keys.azure?.endpoint ?? ""}
                            onChange={(e) => setAzure({ endpoint: e.target.value })}
                            placeholder="https://my-resource.openai.azure.com"
                            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent"
                          />
                        </Labeled>
                        <Labeled label={t("deploymentName", lang)}>
                          <input
                            value={settings.keys.azure?.deploymentName ?? ""}
                            onChange={(e) =>
                              setAzure({ deploymentName: e.target.value })
                            }
                            placeholder="gpt-4o"
                            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent"
                          />
                        </Labeled>
                        <Labeled label={t("apiKey", lang)}>
                          <KeyInput
                            value={settings.keys.azure?.apiKey ?? ""}
                            reveal={!!reveal[p.key]}
                            onToggle={() =>
                              setReveal((r) => ({ ...r, [p.key]: !r[p.key] }))
                            }
                            onChange={(v) => setAzure({ apiKey: v })}
                            lang={lang}
                          />
                        </Labeled>
                      </div>
                    ) : (
                      <Labeled label={t("apiKey", lang)}>
                        <KeyInput
                          value={(settings.keys[p.key as "openai"] as string) ?? ""}
                          reveal={!!reveal[p.key]}
                          onToggle={() =>
                            setReveal((r) => ({ ...r, [p.key]: !r[p.key] }))
                          }
                          onChange={(v) =>
                            setSimpleKey(
                              p.key as "openai" | "anthropic" | "gemini" | "mistral" | "groq",
                              v
                            )
                          }
                          lang={lang}
                        />
                      </Labeled>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => handleTest(p.key)}
                        disabled={state === "testing"}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm transition hover:border-accent disabled:opacity-50"
                      >
                        {state === "testing" ? t("testing", lang) : t("test", lang)}
                      </button>
                      {state === "ok" && (
                        <span className="text-sm text-emerald-400">
                          ✅ {t("testOk", lang)}
                        </span>
                      )}
                      {state === "fail" && (
                        <span className="text-sm text-red-400" title={testMsg[p.key]}>
                          ❌ {t("testFail", lang)}
                        </span>
                      )}
                    </div>
                    {state === "fail" && testMsg[p.key] && (
                      <p className="mt-1 line-clamp-2 text-xs text-red-400/80">
                        {testMsg[p.key]}
                      </p>
                    )}
                  </section>
                );
              })}
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleSave}
                className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover"
              >
                {saved ? t("saved", lang) : t("save", lang)}
              </button>
              <button
                onClick={handleClear}
                className="rounded-lg border border-border px-5 py-2.5 font-medium text-muted transition hover:border-red-500/50 hover:text-red-300"
              >
                {t("clearAll", lang)}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

function KeyInput({
  value,
  reveal,
  onToggle,
  onChange,
  lang,
}: {
  value: string;
  reveal: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
  lang: "zh" | "en";
}) {
  return (
    <div className="flex gap-2">
      <input
        type={reveal ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="sk-…"
        autoComplete="off"
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-sm outline-none focus:border-accent"
      />
      <button
        type="button"
        onClick={onToggle}
        className="rounded-lg border border-border px-3 text-sm text-muted transition hover:text-foreground"
      >
        {reveal ? t("hide", lang) : t("show", lang)}
      </button>
    </div>
  );
}
