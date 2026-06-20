import { describe, it, expect, vi } from "vitest";
import { ALL_AGENTS } from "@/lib/agents";
import { POST } from "./route";

// Mock the LLM router so the "valid history" case can assert a clean 200
// without making a real network call to a provider.
vi.mock("@/lib/llm/router", () => ({
  chat: vi.fn(
    async () =>
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        },
      })
  ),
}));

// Use a real agent id so getAgent() does not 404 before history validation,
// without hard-coding an id that agent regeneration could remove.
const AGENT_ID = ALL_AGENTS[0]!.id;

/**
 * Build a request that passes every earlier guard (agent, provider, model,
 * key) so execution reaches the history validation block.
 */
function makeReq(history: unknown) {
  return new Request("http://localhost/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: AGENT_ID,
      provider: "openai",
      model: "gpt-4o",
      apiKey: "sk-x",
      history,
    }),
  });
}

describe("POST /api/run — history validation", () => {
  it("400 when history is not an array", async () => {
    const res = await POST(makeReq("not-an-array"));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/history/i);
  });

  it("400 when history has an invalid role", async () => {
    const res = await POST(makeReq([{ role: "system", content: "hi" }]));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/role/i);
  });

  it("400 when a history item is null", async () => {
    const res = await POST(makeReq([null]));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/role/i);
  });

  it("400 when history item content is empty string", async () => {
    const res = await POST(makeReq([{ role: "assistant", content: "" }]));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/content/i);
  });

  it("400 when history item content is whitespace only", async () => {
    const res = await POST(makeReq([{ role: "user", content: "   " }]));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/content/i);
  });

  it("400 when any content exceeds 100000 chars", async () => {
    const res = await POST(
      makeReq([{ role: "assistant", content: "a".repeat(100_001) }])
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/100000/);
  });

  it("400 when history has more than 50 items", async () => {
    const items = Array.from({ length: 51 }, (_, i) => ({
      role: i % 2 === 0 ? "assistant" : "user",
      content: "turn",
    }));
    const res = await POST(makeReq(items));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/50/);
  });

  it("400 when aggregate history content exceeds the total cap", async () => {
    // 10 items × 60k chars = 600k > 500k cap, while each item stays under the
    // per-item 100k limit.
    const items = Array.from({ length: 10 }, (_, i) => ({
      role: i % 2 === 0 ? "assistant" : "user",
      content: "a".repeat(60_000),
    }));
    const res = await POST(makeReq(items));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/total/i);
  });

  it("returns 200 (reaches chat) when history is valid", async () => {
    const res = await POST(
      makeReq([{ role: "assistant", content: "previous answer" }])
    );
    expect(res.status).toBe(200);
  });
});
