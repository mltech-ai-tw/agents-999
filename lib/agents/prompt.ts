import type { AgentInput, AgentMeta, Lang } from "./types";

/**
 * Builds a system+task prompt for an agent from its metadata and the user's
 * filled inputs. The agent's Chinese/English `label` + `desc` become the role
 * and mission; user inputs are appended as labelled context.
 *
 * This generic builder powers all 999 agents. To give a specific agent a
 * bespoke prompt, add a `prompt` function in lib/agents/overrides.ts.
 */
export function buildPrompt(
  meta: AgentMeta,
  inputs: AgentInput[],
  values: Record<string, string>,
  lang: Lang
): string {
  const role = lang === "zh" ? meta.label : meta.labelEn;
  const mission = lang === "zh" ? meta.desc : meta.descEn;

  const filled = inputs
    .map((input) => {
      const raw = values[input.key];
      const value = typeof raw === "string" ? raw.trim() : "";
      if (!value) return null;
      const fieldLabel = lang === "zh" ? input.label : input.labelEn;
      return `### ${fieldLabel}\n${value}`;
    })
    .filter((x): x is string => x !== null);

  const contextBlock = filled.length
    ? filled.join("\n\n")
    : lang === "zh"
      ? "（使用者未提供額外資訊，請根據你的專業主動釐清並給出最佳實務建議。）"
      : "(No additional info provided — use your expertise to make sensible assumptions and deliver best-practice guidance.)";

  if (lang === "zh") {
    return [
      `你是一位「${role}」領域的資深顧問。`,
      `你的任務：${mission}。`,
      "",
      "以下是使用者提供的資訊：",
      "",
      contextBlock,
      "",
      "請依此產出專業、具體、可立即執行的成果。",
      "要求：",
      "1. 直接給出結論與建議，避免空泛的客套話。",
      "2. 全程使用 Markdown 排版：用 ## / ### 標題分段、用條列與編號清單、**粗體**標出重點。",
      "3. 凡是比較、評分、數據、時程或選項，一律用 Markdown 表格（| 欄 | 欄 |）呈現，不要寫成一段文字。",
      "4. 流程或步驟用編號清單；必要時可用 > 引用區塊強調關鍵提醒。",
      "5. 若資訊不足，先列出你的合理假設再繼續。",
      "6. 全程使用繁體中文。",
    ].join("\n");
  }

  return [
    `You are a senior consultant specialising in "${role}".`,
    `Your mission: ${mission}.`,
    "",
    "Here is the information provided by the user:",
    "",
    contextBlock,
    "",
    "Produce a professional, concrete and immediately actionable result.",
    "Requirements:",
    "1. Lead with conclusions and recommendations — skip filler.",
    "2. Format everything in Markdown: use ## / ### headings, bullet and numbered lists, and **bold** for key points.",
    "3. Whenever you compare options, score, show data, timelines or trade-offs, use a Markdown table (| col | col |) — never bury it in prose.",
    "4. Use numbered lists for processes/steps; use > blockquotes for critical callouts when useful.",
    "5. If information is missing, state your reasonable assumptions, then proceed.",
    "6. Respond entirely in English.",
  ].join("\n");
}
