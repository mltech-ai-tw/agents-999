import { describe, it, expect } from "vitest";
import { truncateUpstream } from "./truncate";

describe("truncateUpstream", () => {
  it("returns text unchanged when under the limit", () => {
    const result = truncateUpstream("hello", 100);
    expect(result).toEqual({ text: "hello", truncated: false });
  });

  it("returns truncated=true and tail when over limit", () => {
    const text = "abcdefghij";
    const result = truncateUpstream(text, 5);
    expect(result).toEqual({ text: "fghij", truncated: true });
  });

  it("preserves tail (most recent content)", () => {
    const text = "OLD_CONTENT_NEW_CONTENT";
    const result = truncateUpstream(text, 11);
    expect(result.text).toBe("NEW_CONTENT");
    expect(result.truncated).toBe(true);
  });

  it("exact boundary is not truncated", () => {
    const result = truncateUpstream("a".repeat(100_000), 100_000);
    expect(result.truncated).toBe(false);
  });
});
