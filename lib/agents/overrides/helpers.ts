import type { AgentInput, Lang } from "../types";

/**
 * Concise authoring helpers for agent overrides.
 *
 * The category files (./strategy.ts, ./marketing.ts, …) currently spell every
 * override out in full. These helpers are the supported, terser way to write
 * NEW overrides — they cut the bilingual boilerplate without changing behaviour.
 *
 * Example:
 *   import { field, bilingual } from "./helpers";
 *
 *   myAgent: {
 *     inputs: [
 *       field("topic", ["主題", "Topic"], { required: true }),
 *       field("tone", ["語調（選填）", "Tone (optional)"], { type: "text" }),
 *     ],
 *     prompt: bilingual({
 *       zh: (v) => ["你是一位…", `主題：${v.topic}`, v.tone && `語調：${v.tone}`],
 *       en: (v) => ["You are a…", `Topic: ${v.topic}`, v.tone && `Tone: ${v.tone}`],
 *     }),
 *   }
 */

type PromptValues = Record<string, string>;
type Line = string | false | null | undefined;

/**
 * Build an {@link AgentInput} from a `[zh, en]` label pair. Defaults to a
 * non-required `textarea`; pass `placeholder` as a `[zh, en]` pair too.
 */
export function field(
  key: string,
  label: [zh: string, en: string],
  opts: {
    type?: AgentInput["type"];
    required?: boolean;
    placeholder?: [zh: string, en: string];
    options?: string[];
  } = {}
): AgentInput {
  return {
    key,
    label: label[0],
    labelEn: label[1],
    type: opts.type ?? "textarea",
    required: opts.required ?? false,
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.placeholder
      ? { placeholder: opts.placeholder[0], placeholderEn: opts.placeholder[1] }
      : {}),
  };
}

/**
 * Build a bilingual prompt closure from zh/en line arrays. Falsy lines are
 * dropped — so `cond && "line"` cleanly omits optional sections — and the rest
 * are joined with newlines. Matches the `Agent["prompt"]` signature.
 */
export function bilingual(spec: {
  zh: (v: PromptValues) => Line[];
  en: (v: PromptValues) => Line[];
}): (values: PromptValues, lang: Lang) => string {
  return (values, lang) =>
    (lang === "zh" ? spec.zh(values) : spec.en(values))
      .filter((line): line is string => Boolean(line))
      .join("\n");
}
