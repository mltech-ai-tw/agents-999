export type ProviderKey =
  | "openai"
  | "anthropic"
  | "gemini"
  | "ollama"
  | "mistral"
  | "groq"
  | "azure";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatRequest = {
  provider: ProviderKey;
  model: string;
  apiKey: string;
  baseUrl?: string; // for Ollama / Azure custom endpoints
  messages: ChatMessage[];
};

/**
 * A provider knows how to turn a ChatRequest into a stream of unified SSE
 * bytes (see lib/llm/sse.ts for the wire format).
 */
export type Provider = {
  chat: (request: ChatRequest) => Promise<ReadableStream<Uint8Array>>;
};

/** Thrown by providers for predictable, user-facing failures. */
export class ProviderError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
  }
}
