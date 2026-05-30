import { anthropicProvider } from "../providers/anthropic";
import { azureProvider } from "../providers/azure";
import { geminiProvider } from "../providers/gemini";
import { groqProvider } from "../providers/groq";
import { mistralProvider } from "../providers/mistral";
import { ollamaProvider } from "../providers/ollama";
import { openaiProvider } from "../providers/openai";
import { ProviderError, type ChatRequest, type Provider, type ProviderKey } from "./types";

export type { ChatRequest, ChatMessage, ProviderKey } from "./types";

const PROVIDERS: Record<ProviderKey, Provider> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  ollama: ollamaProvider,
  mistral: mistralProvider,
  groq: groqProvider,
  azure: azureProvider,
};

/**
 * Unified entry point: dispatches a ChatRequest to the right provider and
 * returns a unified SSE byte stream (see lib/llm/sse.ts for the format).
 */
export async function chat(
  request: ChatRequest
): Promise<ReadableStream<Uint8Array>> {
  const provider = PROVIDERS[request.provider];
  if (!provider) {
    throw new ProviderError(`Unknown provider: ${request.provider}`, 400);
  }
  return provider.chat(request);
}

export const PROVIDER_KEYS = Object.keys(PROVIDERS) as ProviderKey[];
