import type { ProviderKey } from "./llm/types";

/**
 * Client-facing provider catalogue: display names, default model lists, and
 * which credential fields each provider needs. Used by the Settings page and
 * the ModelSelector. Model lists are suggestions — users can type any model.
 */
export type ProviderMeta = {
  key: ProviderKey;
  label: string;
  models: string[];
  /** auth fields beyond a plain api key */
  needsBaseUrl?: boolean; // Ollama
  needsEndpoint?: boolean; // Azure (endpoint + deployment)
  keyless?: boolean; // Ollama
  docsUrl: string;
};

export const PROVIDERS_META: ProviderMeta[] = [
  {
    key: "openai",
    label: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "o3-mini"],
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    key: "anthropic",
    label: "Anthropic",
    models: [
      "claude-opus-4-1-20250805",
      "claude-sonnet-4-20250514",
      "claude-3-5-sonnet-latest",
      "claude-3-5-haiku-latest",
    ],
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    key: "gemini",
    label: "Google Gemini",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    key: "ollama",
    label: "Ollama (local)",
    models: ["llama3.2", "llama3.1", "qwen2.5", "mistral", "phi3"],
    needsBaseUrl: true,
    keyless: true,
    docsUrl: "https://ollama.com/library",
  },
  {
    key: "mistral",
    label: "Mistral",
    models: ["mistral-large-latest", "mistral-small-latest", "open-mistral-nemo"],
    docsUrl: "https://console.mistral.ai/api-keys",
  },
  {
    key: "groq",
    label: "Groq",
    models: [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
    ],
    docsUrl: "https://console.groq.com/keys",
  },
  {
    key: "azure",
    label: "Azure OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4"],
    needsEndpoint: true,
    docsUrl: "https://learn.microsoft.com/azure/ai-services/openai/",
  },
];

export const PROVIDERS_BY_KEY: Record<ProviderKey, ProviderMeta> =
  Object.fromEntries(PROVIDERS_META.map((p) => [p.key, p])) as Record<
    ProviderKey,
    ProviderMeta
  >;
