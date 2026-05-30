import { createSSEStream, readErrorBody, readSSELines } from "../llm/sse";
import type { ChatMessage, Provider } from "../llm/types";
import { ProviderError } from "../llm/types";

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function toContents(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

export const geminiProvider: Provider = {
  async chat(request) {
    if (!request.apiKey) throw new ProviderError("Missing Gemini API key", 401);

    const system = request.messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");

    // alt=sse makes Gemini emit standard `data:` SSE frames.
    const url =
      `${BASE}/${encodeURIComponent(request.model)}:streamGenerateContent` +
      `?alt=sse&key=${encodeURIComponent(request.apiKey)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: toContents(request.messages),
        ...(system
          ? { systemInstruction: { parts: [{ text: system }] } }
          : {}),
      }),
    });

    if (!res.ok) {
      const body = await readErrorBody(res);
      throw new ProviderError(
        `Gemini returned ${res.status}: ${body || res.statusText}`,
        res.status
      );
    }

    return createSSEStream(async function* () {
      for await (const data of readSSELines(res)) {
        if (!data || data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          const parts = json?.candidates?.[0]?.content?.parts;
          if (Array.isArray(parts)) {
            for (const part of parts) {
              if (typeof part?.text === "string" && part.text) yield part.text;
            }
          }
        } catch {
          // ignore
        }
      }
    });
  },
};
