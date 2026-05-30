import type { AgentOverride } from "./types";

/**
 * Per-agent customisations, keyed by agent id. Anything you set here overrides
 * the generated defaults (inputs / prompt / model / labels). Everything else
 * falls back to the auto-generated metadata + generic prompt builder.
 *
 * This is the supported way to hand-tune an agent without editing the
 * auto-generated data.ts. See CONTRIBUTING.md.
 *
 * Example — give the competitor-analysis agent dedicated inputs and prompt:
 *
 *   competitor: {
 *     inputs: [
 *       { key: "product", label: "你的產品/服務", labelEn: "Your Product/Service",
 *         type: "textarea", required: true },
 *       { key: "competitors", label: "競品名稱（逗號分隔）",
 *         labelEn: "Competitor Names (comma-separated)", type: "text", required: true },
 *     ],
 *     prompt: (inputs, lang) =>
 *       lang === "zh"
 *         ? `你是一位競品分析師。\n產品：${inputs.product}\n競品：${inputs.competitors}\n` +
 *           `請分析各競品定位並整合差異化建議。`
 *         : `You are a competitive analyst.\nProduct: ${inputs.product}\n` +
 *           `Competitors: ${inputs.competitors}\nAnalyze positioning and synthesize differentiation.`,
 *   },
 */
export const AGENT_OVERRIDES: Record<string, AgentOverride> = {
  // Add overrides here.
};
