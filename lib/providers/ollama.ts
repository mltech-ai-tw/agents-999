import { createSSEStream, readErrorBody, readRawChunks } from "../llm/sse";
import type { Provider } from "../llm/types";
import { ProviderError } from "../llm/types";

const DEFAULT_BASE_URL = "http://localhost:11434";

/**
 * Ollama (local). Streams NDJSON: one JSON object per line, each with a
 * `message.content` delta and a final `{done:true}` object. No API key.
 */
export const ollamaProvider: Provider = {
  async chat(request) {
    const baseUrl = (request.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");

    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: true,
      }),
    });

    if (!res.ok) {
      const body = await readErrorBody(res);
      throw new ProviderError(
        `Ollama returned ${res.status}: ${body || res.statusText}`,
        res.status
      );
    }

    return createSSEStream(async function* () {
      let buffer = "";
      for await (const chunk of readRawChunks(res)) {
        buffer += chunk;
        let nlIndex: number;
        while ((nlIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, nlIndex).trim();
          buffer = buffer.slice(nlIndex + 1);
          if (!line) continue;
          try {
            const json = JSON.parse(line);
            const content = json?.message?.content;
            if (typeof content === "string" && content) yield content;
          } catch {
            // ignore partial / non-JSON lines
          }
        }
      }
    });
  },
};
