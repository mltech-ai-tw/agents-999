import { describe, it, expect, vi } from "vitest";
import { ALL_AGENTS } from "@/lib/agents";
import { POST } from "./route";

// Mock the LLM router so the "valid context" case can assert a clean 200
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

// Use a real agent id so getAgent() does not 404 before context validation,
// without hard-coding an id that agent regeneration could remove.
const AGENT_ID = ALL_AGENTS[0]!.id;

/**
 * Build a request that passes every earlier guard (agent, provider, model,
 * key) so execution reaches the context validation block.
 */
function makeReq(context: unknown) {
  return new Request("http://localhost/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: AGENT_ID,
      provider: "openai",
      model: "gpt-4o",
      apiKey: "sk-x",
      context,
    }),
  });
}

describe("POST /api/run — context validation", () => {
  it("400 when context is not a string (number)", async () => {
    const res = await POST(makeReq(42));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/context/i);
  });

  it("400 when context is not a string (object)", async () => {
    const res = await POST(makeReq({ nested: true }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/context/i);
  });

  it("400 when context is null", async () => {
    const res = await POST(makeReq(null));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/context/i);
  });

  it("400 when context exceeds 200000 characters", async () => {
    const res = await POST(makeReq("a".repeat(200_001)));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/200000/);
  });

  it("200 when context is a valid short string", async () => {
    const res = await POST(makeReq("this is valid upstream context"));
    expect(res.status).toBe(200);
  });

  it("200 when context is omitted entirely", async () => {
    const res = await POST(makeReq(undefined));
    expect(res.status).toBe(200);
  });
});
