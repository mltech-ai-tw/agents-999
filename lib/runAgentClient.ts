import type { Lang } from "./i18n";
import type { ProviderKey } from "./llm/types";

export type RunHistoryItem = { role: "user" | "assistant"; content: string };

export type RunAgentParams = {
  agentId: string;
  inputs: Record<string, string>;
  provider: ProviderKey;
  model: string;
  apiKey: string;
  baseUrl?: string;
  history?: RunHistoryItem[];
  context?: string;
  lang: Lang;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
};

/**
 * Client-side caller for /api/run. Streams the unified SSE response and
 * invokes `onDelta` for each text chunk. Resolves when the stream completes,
 * rejects on transport or provider error.
 */
export async function runAgent(params: RunAgentParams): Promise<void> {
  const { onDelta, signal, ...payload } = params;

  const res = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // keep default
    }
    throw new Error(message);
  }

  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nlIndex: number;
      while ((nlIndex = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, nlIndex);
        buffer = buffer.slice(nlIndex + 2);
        const line = rawEvent.trim();
        if (!line.startsWith("data:")) continue;
        const data = line.slice("data:".length).trim();
        if (data === "[DONE]") return;
        try {
          const json = JSON.parse(data);
          if (json.error) throw new Error(json.error);
          if (typeof json.delta === "string") onDelta(json.delta);
        } catch (err) {
          if (err instanceof Error && err.message) throw err;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
