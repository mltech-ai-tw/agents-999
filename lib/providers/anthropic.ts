import { createSSEStream, readErrorBody, readSSELines } from "../llm/sse";
import type { ChatMessage, Provider } from "../llm/types";
import { ProviderError } from "../llm/types";

const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MAX_TOKENS = 4096;

/** Anthropic separates the system prompt from the messages array. */
function splitSystem(messages: ChatMessage[]): {
  system?: string;
  rest: { role: "user" | "assistant"; content: string }[];
} {
  const systemParts = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content);
  const rest = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  return {
    system: systemParts.length ? systemParts.join("\n\n") : undefined,
    rest,
  };
}

export const anthropicProvider: Provider = {
  async chat(request) {
    if (!request.apiKey)
      throw new ProviderError("Missing Anthropic API key", 401);

    const { system, rest } = splitSystem(request.messages);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": request.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        // Required to call the API directly from a server/browser-origin proxy.
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: DEFAULT_MAX_TOKENS,
        stream: true,
        ...(system ? { system } : {}),
        messages: rest,
      }),
    });

    if (!res.ok) {
      const body = await readErrorBody(res);
      throw new ProviderError(
        `Anthropic returned ${res.status}: ${body || res.statusText}`,
        res.status
      );
    }

    return createSSEStream(async function* () {
      for await (const data of readSSELines(res)) {
        if (!data || data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          if (
            json?.type === "content_block_delta" &&
            json?.delta?.type === "text_delta"
          ) {
            const text = json.delta.text;
            if (typeof text === "string" && text) yield text;
          }
        } catch {
          // ignore non-JSON / event-name lines
        }
      }
    });
  },
};
