import { describe, it, expect } from "vitest";
import { createSSEStream, readSSELines, readRawChunks } from "./sse";

/** Drain a byte stream into its decoded text. */
async function drain(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    out += decoder.decode(value, { stream: true });
  }
  return out;
}

/** Parse the unified wire format into {delta|error} events + a DONE flag. */
function parseFrames(raw: string): {
  events: { delta?: string; error?: string }[];
  done: boolean;
} {
  const events: { delta?: string; error?: string }[] = [];
  let done = false;
  for (const chunk of raw.split("\n\n")) {
    const line = chunk.trim();
    if (!line.startsWith("data:")) continue;
    const payload = line.slice("data:".length).trim();
    if (payload === "[DONE]") {
      done = true;
      continue;
    }
    events.push(JSON.parse(payload));
  }
  return { events, done };
}

/** Build a Response whose body emits the given parts as separate chunks. */
function responseFrom(parts: string[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const p of parts) controller.enqueue(encoder.encode(p));
      controller.close();
    },
  });
  return new Response(stream);
}

describe("createSSEStream", () => {
  it("wraps text deltas as data frames and always terminates with [DONE]", async () => {
    const stream = createSSEStream(async function* () {
      yield "Hello";
      yield " world";
    });
    const { events, done } = parseFrames(await drain(stream));
    expect(events).toEqual([{ delta: "Hello" }, { delta: " world" }]);
    expect(done).toBe(true);
  });

  it("skips empty deltas", async () => {
    const stream = createSSEStream(async function* () {
      yield "a";
      yield "";
      yield "b";
    });
    const { events } = parseFrames(await drain(stream));
    expect(events).toEqual([{ delta: "a" }, { delta: "b" }]);
  });

  it("surfaces a generator error as an error frame, then still terminates", async () => {
    const stream = createSSEStream(async function* () {
      yield "partial";
      throw new Error("upstream exploded");
    });
    const { events, done } = parseFrames(await drain(stream));
    expect(events).toEqual([
      { delta: "partial" },
      { error: "upstream exploded" },
    ]);
    expect(done).toBe(true);
  });
});

describe("readSSELines", () => {
  it("yields the payload after each `data:` line", async () => {
    const res = responseFrom([
      'data: {"a":1}\n',
      'data: {"b":2}\n',
      "data: [DONE]\n",
    ]);
    const got: string[] = [];
    for await (const line of readSSELines(res)) got.push(line);
    expect(got).toEqual(['{"a":1}', '{"b":2}', "[DONE]"]);
  });

  it("reassembles a payload split across chunk boundaries", async () => {
    const res = responseFrom(["data: {\"hel", 'lo\":true}\n']);
    const got: string[] = [];
    for await (const line of readSSELines(res)) got.push(line);
    expect(got).toEqual(['{"hello":true}']);
  });

  it("ignores blank lines and non-data lines (keep-alives, event names)", async () => {
    const res = responseFrom([
      "\n",
      "event: ping\n",
      'data: {"ok":1}\n',
      ": comment\n",
    ]);
    const got: string[] = [];
    for await (const line of readSSELines(res)) got.push(line);
    expect(got).toEqual(['{"ok":1}']);
  });
});

describe("readRawChunks", () => {
  it("yields decoded text for each chunk", async () => {
    const res = responseFrom(["line1\n", "line2\n"]);
    const got: string[] = [];
    for await (const chunk of readRawChunks(res)) got.push(chunk);
    expect(got.join("")).toBe("line1\nline2\n");
  });
});
