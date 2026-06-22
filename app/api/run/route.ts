import { getAgent } from "@/lib/agents";
import { chat } from "@/lib/llm/router";
import { ProviderError, type ChatRequest, type ProviderKey } from "@/lib/llm/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_PROVIDERS: ProviderKey[] = [
  "openai",
  "anthropic",
  "gemini",
  "ollama",
  "mistral",
  "groq",
  "azure",
];

type HistoryItem = { role: "user" | "assistant"; content: string };

type RunBody = {
  agentId?: string;
  inputs?: Record<string, string>;
  provider?: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  history?: HistoryItem[];
  lang?: "zh" | "en";
  context?: string;
};

const MAX_HISTORY_ITEMS = 50;
const MAX_HISTORY_CONTENT_CHARS = 100_000;
// Aggregate cap so 50 items × 100k chars can't add up to a multi-MB payload.
const MAX_HISTORY_TOTAL_CHARS = 500_000;
// Cap for the optional upstream context block (used by the /pipeline page).
const MAX_CONTEXT_CHARS = 200_000;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let body: RunBody;
  try {
    body = (await req.json()) as RunBody;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const { agentId, inputs, provider, model, apiKey, baseUrl, history, context } =
    body;
  const lang = body.lang === "en" ? "en" : "zh";

  // --- Validation at the boundary ---
  if (!agentId) return jsonError("Missing agentId", 400);

  if (
    inputs !== undefined &&
    (typeof inputs !== "object" || inputs === null || Array.isArray(inputs))
  ) {
    return jsonError("inputs must be an object", 400);
  }
  if (inputs) {
    let inputsTotal = 0;
    for (const value of Object.values(inputs)) {
      if (typeof value !== "string") continue;
      if (value.length > MAX_HISTORY_CONTENT_CHARS) {
        return jsonError(
          `input value exceeds ${MAX_HISTORY_CONTENT_CHARS} characters`,
          400
        );
      }
      inputsTotal += value.length;
    }
    if (inputsTotal > MAX_HISTORY_TOTAL_CHARS) {
      return jsonError(
        `inputs total exceeds ${MAX_HISTORY_TOTAL_CHARS} characters`,
        400
      );
    }
  }

  const agent = getAgent(agentId);
  if (!agent) return jsonError("Agent not found", 404);

  if (!provider || !VALID_PROVIDERS.includes(provider as ProviderKey)) {
    return jsonError("Missing or invalid provider", 400);
  }
  if (!model) return jsonError("Missing model", 400);
  // Ollama is keyless; everyone else needs a key.
  if (provider !== "ollama" && !apiKey) {
    return jsonError(`Missing API key for ${provider}`, 401);
  }

  // Optional conversation history — validate strictly at the boundary so a
  // malformed follow-up payload fails fast (400) before reaching a provider.
  if (history !== undefined) {
    if (!Array.isArray(history)) {
      return jsonError("history must be an array", 400);
    }
    if (history.length > MAX_HISTORY_ITEMS) {
      return jsonError(
        `history exceeds maximum of ${MAX_HISTORY_ITEMS} items`,
        400
      );
    }
    for (const item of history) {
      if (!item || (item.role !== "user" && item.role !== "assistant")) {
        return jsonError(
          'history item role must be "user" or "assistant"',
          400
        );
      }
      if (typeof item.content !== "string" || item.content.trim() === "") {
        return jsonError("history item content must be a non-empty string", 400);
      }
      if (item.content.length > MAX_HISTORY_CONTENT_CHARS) {
        return jsonError(
          `history item content exceeds ${MAX_HISTORY_CONTENT_CHARS} characters`,
          400
        );
      }
    }
    const totalChars = history.reduce((n, item) => n + item.content.length, 0);
    if (totalChars > MAX_HISTORY_TOTAL_CHARS) {
      return jsonError(
        `history total content exceeds ${MAX_HISTORY_TOTAL_CHARS} characters`,
        400
      );
    }
  }

  // Optional upstream context (used by the /pipeline page to chain agents).
  // Validate at the boundary so a malformed payload fails fast (400).
  if (context !== undefined) {
    if (typeof context !== "string") {
      return jsonError("context must be a string", 400);
    }
    if (context.length > MAX_CONTEXT_CHARS) {
      return jsonError(
        `context exceeds ${MAX_CONTEXT_CHARS} characters`,
        400
      );
    }
  }

  const prompt = agent.prompt(inputs ?? {}, lang);

  // Append the context as a clearly-labelled block so the model treats it as
  // the concrete input for this step. Uniform for generic AND override agents
  // because it happens after agent.prompt() returns — no prompt closure edits.
  const finalPrompt =
    context && context.trim()
      ? prompt +
        "\n\n" +
        (lang === "en" ? "--- UPSTREAM CONTEXT ---\n" : "--- 上游內容 ---\n") +
        context.trim()
      : prompt;

  const chatRequest: ChatRequest = {
    provider: provider as ProviderKey,
    model,
    apiKey: apiKey ?? "",
    baseUrl,
    messages: [{ role: "user", content: finalPrompt }, ...(history ?? [])],
  };

  try {
    const stream = await chat(chatRequest);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    if (err instanceof ProviderError) {
      // Forward client-actionable 4xx messages (invalid key, rate limit, …);
      // mask 5xx details that may leak upstream provider internals.
      return jsonError(
        err.status < 500 ? err.message : "Upstream provider error",
        err.status
      );
    }
    // Don't leak internal error details (DNS/TLS/runtime) to the client; log
    // server-side and return a generic message.
    console.error("/api/run unexpected error:", err);
    return jsonError("Internal error", 500);
  }
}
