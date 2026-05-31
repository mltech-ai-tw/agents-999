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
      "4. 當有可量化的數據（占比、趨勢、各項目數值比較）時，額外輸出一個圖表，格式為 ```chart 程式碼區塊，內容是 JSON：",
      '   {"type":"bar|line|pie","title":"標題","data":[{"name":"項目","value":數字}]}（多數列時可加 "series":["欄1","欄2"] 並在每筆 data 放對應數字欄）。',
      "   圖表只在數據適合視覺化時使用，且仍要保留對應的文字說明或表格。",
      "5. 當內容涉及流程、步驟、旅程、決策樹、組織架構或時程時，額外輸出一張圖，用 ```mermaid 程式碼區塊（flowchart TD / journey / sequenceDiagram / gantt 皆可）。節點文字務必用雙引號包住，例如 A[\"認知階段\"] --> B[\"考慮階段\"]。",
      "6. 流程或步驟用編號清單；必要時可用 > 引用區塊強調關鍵提醒。",
      "7. 若資訊不足，先列出你的合理假設再繼續。",
      "8. 全程使用繁體中文。",
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
    "4. When you have quantifiable data (proportions, trends, value comparisons), also output a chart as a ```chart code block containing JSON:",
    '   {"type":"bar|line|pie","title":"Title","data":[{"name":"Item","value":number}]} (for multi-series add "series":["col1","col2"] and put those numeric fields on each data row).',
    "   Only use a chart when the data genuinely suits visualization, and still keep the matching text or table.",
    "5. When the content involves a process, steps, a journey, a decision tree, an org structure or a timeline, also output a diagram in a ```mermaid code block (flowchart TD / journey / sequenceDiagram / gantt). Always wrap node labels in double quotes, e.g. A[\"Awareness\"] --> B[\"Consideration\"].",
    "6. Use numbered lists for processes/steps; use > blockquotes for critical callouts when useful.",
    "7. If information is missing, state your reasonable assumptions, then proceed.",
    "8. Respond entirely in English.",
  ].join("\n");
}
