import { describe, it, expect, vi, afterEach } from "vitest";
import { openaiProvider } from "./openai";
import { anthropicProvider } from "./anthropic";
import { ollamaProvider } from "./ollama";
import type { ChatRequest } from "../llm/types";

/** Drain a unified SSE stream into the concatenated delta text. */
async function collectDeltas(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let raw = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    raw += decoder.decode(value, { stream: true });
  }
  let text = "";
  for (const chunk of raw.split("\n\n")) {
    const line = chunk.trim();
    if (!line.startsWith("data:")) continue;
    const payload = line.slice("data:".length).trim();
    if (payload === "[DONE]") continue;
    const obj = JSON.parse(payload);
    if (obj.delta) text += obj.delta;
  }
  return text;
}

/** Mock the global fetch with a streaming Response built from `parts`. */
function mockFetch(parts: string[], status = 200) {
  const fn = vi.fn(async (_input: unknown, _init?: RequestInit) => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const p of parts) controller.enqueue(encoder.encode(p));
        controller.close();
      },
    });
    return new Response(body, { status });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

const baseRequest: ChatRequest = {
  provider: "openai",
  model: "gpt-test",
  apiKey: "sk-test",
  messages: [{ role: "user", content: "hi" }],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("openaiProvider (OpenAI-compatible parsing)", () => {
  it("extracts choices[0].delta.content and stops at [DONE]", async () => {
    mockFetch([
      'data: {"choices":[{"delta":{"content":"Hel"}}]}\n',
      'data: {"choices":[{"delta":{"content":"lo"}}]}\n',
      "data: [DONE]\n",
      'data: {"choices":[{"delta":{"content":"IGNORED"}}]}\n',
    ]);
    const out = await collectDeltas(await openaiProvider.chat(baseRequest));
    expect(out).toBe("Hello");
  });

  it("throws ProviderError on a non-ok response", async () => {
    mockFetch(["nope"], 429);
    await expect(openaiProvider.chat(baseRequest)).rejects.toThrow(/429/);
  });
});

describe("anthropicProvider", () => {
  it("yields only content_block_delta text_delta events", async () => {
    mockFetch([
      'data: {"type":"message_start"}\n',
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}\n',
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":" there"}}\n',
      'data: {"type":"message_stop"}\n',
    ]);
    const out = await collectDeltas(
      await anthropicProvider.chat({ ...baseRequest, provider: "anthropic" })
    );
    expect(out).toBe("Hi there");
  });

  it("hoists the system message into a top-level `system` field", async () => {
    const fn = mockFetch(["data: {\"type\":\"message_stop\"}\n"]);
    await anthropicProvider.chat({
      ...baseRequest,
      provider: "anthropic",
      messages: [
        { role: "system", content: "You are terse." },
        { role: "user", content: "hi" },
      ],
    });
    const init = fn.mock.calls[0][1];
    const body = JSON.parse(init!.body as string);
    expect(body.system).toBe("You are terse.");
    expect(body.messages).toEqual([{ role: "user", content: "hi" }]);
  });
});

describe("ollamaProvider (NDJSON parsing)", () => {
  it("extracts message.content from each NDJSON line", async () => {
    mockFetch([
      '{"message":{"content":"Yo"}}\n',
      '{"message":{"content":"!"}}\n',
      '{"done":true}\n',
    ]);
    const out = await collectDeltas(
      await ollamaProvider.chat({ ...baseRequest, provider: "ollama" })
    );
    expect(out).toBe("Yo!");
  });
});
