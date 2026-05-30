import type { ProviderKey } from "./llm/types";

export const SETTINGS_STORAGE_KEY = "agents999_settings";

export type AzureKey = {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
};

export type OllamaConfig = {
  baseUrl: string;
};

export type Settings = {
  defaultProvider: ProviderKey;
  defaultModel: string;
  keys: {
    openai?: string;
    anthropic?: string;
    gemini?: string;
    mistral?: string;
    groq?: string;
    azure?: AzureKey;
    ollama?: OllamaConfig;
  };
};

export const DEFAULT_SETTINGS: Settings = {
  defaultProvider: "openai",
  defaultModel: "gpt-4o-mini",
  keys: {},
};

/** Read settings from localStorage. Safe to call on the client only. */
export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      keys: { ...DEFAULT_SETTINGS.keys, ...(parsed.keys ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function clearSettings(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
}

/** Which providers currently have usable credentials configured. */
export function configuredProviders(settings: Settings): ProviderKey[] {
  const out: ProviderKey[] = [];
  const k = settings.keys;
  if (k.openai) out.push("openai");
  if (k.anthropic) out.push("anthropic");
  if (k.gemini) out.push("gemini");
  if (k.mistral) out.push("mistral");
  if (k.groq) out.push("groq");
  if (k.azure?.apiKey && k.azure?.endpoint) out.push("azure");
  if (k.ollama?.baseUrl) out.push("ollama");
  return out;
}

/**
 * Resolves the credential payload for a request to /api/run for a given
 * provider, pulling from stored settings.
 */
export function credentialsFor(
  settings: Settings,
  provider: ProviderKey
): { apiKey: string; baseUrl?: string } | null {
  const k = settings.keys;
  switch (provider) {
    case "openai":
      return k.openai ? { apiKey: k.openai } : null;
    case "anthropic":
      return k.anthropic ? { apiKey: k.anthropic } : null;
    case "gemini":
      return k.gemini ? { apiKey: k.gemini } : null;
    case "mistral":
      return k.mistral ? { apiKey: k.mistral } : null;
    case "groq":
      return k.groq ? { apiKey: k.groq } : null;
    case "azure":
      return k.azure?.apiKey && k.azure?.endpoint
        ? { apiKey: k.azure.apiKey, baseUrl: k.azure.endpoint }
        : null;
    case "ollama":
      return { apiKey: "", baseUrl: k.ollama?.baseUrl || "http://localhost:11434" };
    default:
      return null;
  }
}
