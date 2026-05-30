import { createSSEStream, readErrorBody, readSSELines } from "../llm/sse";
import { ProviderError, type ChatRequest } from "../llm/types";

/**
 * Shared implementation for OpenAI-compatible Chat Completions APIs
 * (OpenAI, Mistral, Groq, Azure OpenAI). Each caller supplies the endpoint
 * URL and auth headers; the request/response shape is identical.
 */
export async function openAICompatibleChat(
  request: ChatRequest,
  endpoint: string,
  headers: Record<string, string>
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      stream: true,
    }),
  });

  if (!res.ok) {
    const body = await readErrorBody(res);
    throw new ProviderError(
      `Provider returned ${res.status}: ${body || res.statusText}`,
      res.status
    );
  }

  return createSSEStream(async function* () {
    for await (const data of readSSELines(res)) {
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        const delta = json?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) yield delta;
      } catch {
        // ignore keep-alive / non-JSON lines
      }
    }
  });
}
