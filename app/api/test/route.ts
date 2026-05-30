import { chat } from "@/lib/llm/router";
import { ProviderError, type ChatRequest, type ProviderKey } from "@/lib/llm/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID: ProviderKey[] = [
  "openai",
  "anthropic",
  "gemini",
  "ollama",
  "mistral",
  "groq",
  "azure",
];

/**
 * Connection tester for the Settings page. Sends a minimal prompt and reports
 * whether the provider streamed any content (or errored). Does not return the
 * generated text.
 */
export async function POST(req: Request) {
  let body: {
    provider?: string;
    model?: string;
    apiKey?: string;
    baseUrl?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { provider, model, apiKey, baseUrl } = body;
  if (!provider || !VALID.includes(provider as ProviderKey)) {
    return Response.json({ ok: false, error: "Invalid provider" }, { status: 400 });
  }
  if (!model) {
    return Response.json({ ok: false, error: "Missing model" }, { status: 400 });
  }

  const request: ChatRequest = {
    provider: provider as ProviderKey,
    model,
    apiKey: apiKey ?? "",
    baseUrl,
    messages: [{ role: "user", content: 'Reply with the single word: ok' }],
  };

  try {
    const stream = await chat(request);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n\n")) !== -1) {
          const evt = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 2);
          if (!evt.startsWith("data:")) continue;
          const data = evt.slice("data:".length).trim();
          if (data === "[DONE]") {
            return Response.json({ ok: true });
          }
          try {
            const json = JSON.parse(data);
            if (json.error) {
              return Response.json({ ok: false, error: json.error });
            }
            if (typeof json.delta === "string") {
              // Got real content — connection works. Stop early.
              await reader.cancel();
              return Response.json({ ok: true });
            }
          } catch {
            // ignore
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof ProviderError) {
      return Response.json({ ok: false, error: err.message }, { status: 200 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 200 });
  }
}
