import type { AgentInput } from "./types";

/**
 * Default input fields used by every agent that doesn't declare its own
 * (via lib/agents/overrides/). Most agents only need a free-text context
 * box plus an optional tone/format hint, so we keep this deliberately small.
 */
export const DEFAULT_INPUTS: AgentInput[] = [
  {
    key: "context",
    label: "背景與需求",
    labelEn: "Context & Requirements",
    type: "textarea",
    required: true,
    placeholder: "描述你的情境、目標與任何相關細節…",
    placeholderEn: "Describe your situation, goal and any relevant details…",
  },
  {
    key: "details",
    label: "補充資訊（選填）",
    labelEn: "Additional Info (optional)",
    type: "textarea",
    required: false,
    placeholder: "其他限制、受眾、期望輸出格式…",
    placeholderEn: "Constraints, audience, desired output format…",
  },
];
