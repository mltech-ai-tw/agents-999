import { ProviderError } from "./types";

/**
 * Unified SSE wire format (provider → /api/run → browser):
 *   data: {"delta":"<text chunk>"}\n\n   ... repeated
 *   data: {"error":"<message>"}\n\n      ... on failure
 *   data: [DONE]\n\n                     ... terminator
 *
 * The client only needs to parse `delta`, `error` and the `[DONE]` sentinel.
 */

const encoder = new TextEncoder();

function frame(payload: object): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

const DONE = encoder.encode("data: [DONE]\n\n");

/**
 * Wraps an async generator of plain text deltas into a unified SSE
 * ReadableStream. Errors thrown by the generator are surfaced as an
 * `{error}` frame followed by `[DONE]` so the client always terminates.
 */
export function createSSEStream(
  deltas: () => AsyncGenerator<string, void, unknown>
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const delta of deltas()) {
          if (delta) controller.enqueue(frame({ delta }));
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown streaming error";
        controller.enqueue(frame({ error: message }));
      } finally {
        controller.enqueue(DONE);
        controller.close();
      }
    },
  });
}

/**
 * Reads a fetch Response body and yields raw SSE `data:` payload strings
 * (the text after `data: `). Used by OpenAI-compatible + Anthropic providers.
 */
export async function* readSSELines(
  res: Response
): AsyncGenerator<string, void, unknown> {
  if (!res.body) throw new ProviderError("No response body from provider");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nlIndex: number;
      while ((nlIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nlIndex).trim();
        buffer = buffer.slice(nlIndex + 1);
        if (!line || !line.startsWith("data:")) continue;
        yield line.slice("data:".length).trim();
      }
    }
    const tail = buffer.trim();
    if (tail.startsWith("data:")) yield tail.slice("data:".length).trim();
  } finally {
    reader.releaseLock();
  }
}

/**
 * Reads a streaming JSON-array / NDJSON-ish body and yields decoded text
 * chunks line by line. Used by Ollama (NDJSON) and as a raw byte fallback.
 */
export async function* readRawChunks(
  res: Response
): AsyncGenerator<string, void, unknown> {
  if (!res.body) throw new ProviderError("No response body from provider");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

/** Reads and truncates an error response body for a helpful message. */
export async function readErrorBody(res: Response): Promise<string> {
  let text = "";
  try {
    text = await res.text();
  } catch {
    text = "";
  }
  return text.slice(0, 500);
}
