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

type RunBody = {
  agentId?: string;
  inputs?: Record<string, string>;
  provider?: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  lang?: "zh" | "en";
};

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

  const { agentId, inputs, provider, model, apiKey, baseUrl } = body;
  const lang = body.lang === "en" ? "en" : "zh";

  // --- Validation at the boundary ---
  if (!agentId) return jsonError("Missing agentId", 400);

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

  const prompt = agent.prompt(inputs ?? {}, lang);

  const chatRequest: ChatRequest = {
    provider: provider as ProviderKey,
    model,
    apiKey: apiKey ?? "",
    baseUrl,
    messages: [{ role: "user", content: prompt }],
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
      return jsonError(err.message, err.status);
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(message, 500);
  }
}
