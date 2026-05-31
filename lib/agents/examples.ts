import type { AgentCategory, Lang } from "./types";

/**
 * Two ready-to-run example inputs per agent, so users can try any agent with
 * one click instead of staring at an empty box.
 *
 * 999 agents can't have hand-written examples, so we generate two realistic
 * scenarios from the agent's category, then tie each to the specific agent by
 * naming its task. The result fills the agent's primary input field.
 */

type Example = { zh: string; en: string };

// Two generic-but-concrete business scenarios per category. {task} is replaced
// with the agent's own label so the example reads on-topic.
const CATEGORY_EXAMPLES: Record<AgentCategory, [Example, Example]> = {
  product: [
    {
      zh: "我們是一個成立 18 個月的 B2B SaaS 團隊，產品是給中小企業用的排班工具，目前 120 家付費客戶、月流失率約 4%。請針對「{task}」給我具體可執行的產出。",
      en: "We're an 18-month-old B2B SaaS team building a staff-scheduling tool for SMBs — 120 paying customers, ~4% monthly churn. Produce a concrete, actionable result for \"{task}\".",
    },
    {
      zh: "我是一位獨立開發者，正在打造一款專注度計時的行動 App，已有 5,000 名免費用戶但還沒開始收費。針對「{task}」請給我清楚的步驟與範例。",
      en: "I'm a solo developer building a focus-timer mobile app — 5,000 free users, no paid tier yet. For \"{task}\", give me clear steps and concrete examples.",
    },
  ],
  brand: [
    {
      zh: "我們是一個主打永續材質的家居品牌，受眾是 28–40 歲注重環保的都會族群，預算有限。請針對「{task}」產出符合品牌調性的成果。",
      en: "We're a homeware brand built on sustainable materials, targeting eco-conscious urban professionals aged 28–40, on a lean budget. Produce on-brand output for \"{task}\".",
    },
    {
      zh: "我經營一間精品咖啡店，想從在地小店擴展成有記憶點的品牌。針對「{task}」給我具體、有個性、不落俗套的建議。",
      en: "I run a specialty coffee shop and want to grow from a local spot into a memorable brand. For \"{task}\", give me specific, characterful, non-generic recommendations.",
    },
  ],
  finance: [
    {
      zh: "我們是一家年營收 3,000 萬台幣的電商，毛利率 35%，正考慮募種子輪。請針對「{task}」給我有數字、有假設的分析。",
      en: "We're an e-commerce business doing ~NT$30M annual revenue at 35% gross margin, considering a seed round. For \"{task}\", give me analysis with numbers and stated assumptions.",
    },
    {
      zh: "我是早期新創創辦人，手上現金可撐 9 個月，月燒約 40 萬。針對「{task}」請給我務實、可立即套用的財務建議。",
      en: "I'm an early-stage founder with 9 months of runway, burning ~NT$400k/month. For \"{task}\", give me pragmatic finance guidance I can apply immediately.",
    },
  ],
  strategy: [
    {
      zh: "我們是傳統製造業，年營收 5 億，正面臨數位轉型與接班的雙重壓力。請針對「{task}」提出有優先順序的策略建議。",
      en: "We're a traditional manufacturer (~NT$500M revenue) facing both digital transformation and succession pressure. For \"{task}\", give prioritized strategic recommendations.",
    },
    {
      zh: "我們是一家成長中的軟體公司，想在 12 個月內進入東南亞市場。針對「{task}」請給我清楚的取捨與行動路線圖。",
      en: "We're a growing software company aiming to enter Southeast Asia within 12 months. For \"{task}\", give me clear trade-offs and an action roadmap.",
    },
  ],
  marketing: [
    {
      zh: "我們是 DTC 保養品品牌，主力在 Instagram 與蝦皮，月行銷預算 20 萬，想提升回購率。請針對「{task}」產出可直接執行的內容。",
      en: "We're a DTC skincare brand selling on Instagram and Shopee, NT$200k monthly marketing budget, aiming to lift repeat purchases. Produce ready-to-execute output for \"{task}\".",
    },
    {
      zh: "我負責一個 B2B 軟體的成長行銷，主要客群是中型企業的 IT 主管，銷售週期約 3 個月。針對「{task}」請給我具體做法與範例文案。",
      en: "I run growth marketing for a B2B software product; buyers are IT managers at mid-sized firms with a ~3-month sales cycle. For \"{task}\", give me concrete tactics and sample copy.",
    },
  ],
  legal: [
    {
      zh: "我們是一家 15 人的新創，正準備與第一個企業客戶簽約，也要規範員工與承包商關係。請針對「{task}」給我清楚、白話、可落地的內容（非正式法律意見）。",
      en: "We're a 15-person startup about to sign our first enterprise customer and formalize employee/contractor terms. For \"{task}\", give clear, plain-language, practical output (not formal legal advice).",
    },
    {
      zh: "我經營一個線上平台，需要處理個資保護與使用者條款，使用者主要在台灣與東南亞。針對「{task}」請給我重點清單與注意事項。",
      en: "I run an online platform and need to handle data protection and user terms, with users mainly in Taiwan and Southeast Asia. For \"{task}\", give me a checklist and key cautions.",
    },
  ],
  sales: [
    {
      zh: "我們賣 B2B 數據分析訂閱，客單價約每年 30 萬，目前靠創辦人銷售、想建立可複製的流程。請針對「{task}」給我具體腳本或框架。",
      en: "We sell a B2B data-analytics subscription at ~NT$300k/year ACV, currently founder-led, and want a repeatable process. For \"{task}\", give me concrete scripts or frameworks.",
    },
    {
      zh: "我是一名業務，正在跟進一個猶豫的中型客戶，對方擔心導入成本與團隊接受度。針對「{task}」請給我可直接使用的應對內容。",
      en: "I'm a sales rep working a hesitant mid-market deal; the buyer worries about switching cost and team adoption. For \"{task}\", give me ready-to-use material.",
    },
  ],
  people: [
    {
      zh: "我們是一家 60 人的科技公司，遠距與辦公混合，最近幾季流動率偏高。請針對「{task}」給我務實、以人為本的具體方案。",
      en: "We're a 60-person tech company on a hybrid model with elevated turnover the past few quarters. For \"{task}\", give me a pragmatic, people-first plan.",
    },
    {
      zh: "我是新上任的團隊主管，帶 8 個人，想建立信任與清楚的成長路徑。針對「{task}」請給我可立即執行的步驟。",
      en: "I'm a newly promoted team lead managing 8 people, aiming to build trust and clear growth paths. For \"{task}\", give me steps I can act on immediately.",
    },
  ],
  ops: [
    {
      zh: "我們是一家快速成長的電商，倉儲與出貨流程開始跟不上訂單量，錯誤率上升。請針對「{task}」給我可落地的流程改善建議。",
      en: "We're a fast-growing e-commerce business whose warehousing and fulfillment can't keep up with order volume, with rising error rates. For \"{task}\", give me actionable process improvements.",
    },
    {
      zh: "我管理一間 30 桌的餐廳，想優化排班、備料與尖峰時段的出餐效率。針對「{task}」請給我具體做法。",
      en: "I manage a 30-table restaurant and want to optimize scheduling, prep, and peak-hour throughput. For \"{task}\", give me concrete tactics.",
    },
  ],
  dev: [
    {
      zh: "我們是一個 6 人的工程團隊，維護一套單體式的 Node.js + React 系統，部署仍是半手動。請針對「{task}」給我具體、可分階段執行的技術建議。",
      en: "We're a 6-engineer team maintaining a monolithic Node.js + React system with semi-manual deploys. For \"{task}\", give me concrete, phased technical recommendations.",
    },
    {
      zh: "我是技術主管，正在規劃一套新功能的架構，需要兼顧開發速度與後續維護。針對「{task}」請給我清楚的設計與取捨。",
      en: "I'm a tech lead planning the architecture for a new feature, balancing dev speed with maintainability. For \"{task}\", give me a clear design with trade-offs.",
    },
  ],
  content: [
    {
      zh: "我們經營一個面向開發者的電子報，約 8,000 訂閱、開信率 38%，想提升互動與分享。請針對「{task}」產出具體、有風格的內容。",
      en: "We run a developer-focused newsletter with ~8,000 subscribers and a 38% open rate, aiming to lift engagement and shares. Produce concrete, stylish output for \"{task}\".",
    },
    {
      zh: "我是內容創作者，主題是個人理財，想把長文改寫成多平台內容。針對「{task}」請給我可直接發布的範例。",
      en: "I'm a content creator covering personal finance, repurposing long-form posts across platforms. For \"{task}\", give me ready-to-publish examples.",
    },
  ],
  operations: [
    {
      zh: "我們是一家 B2B 服務公司，跨部門協作與交接常出問題，資訊散落各處。請針對「{task}」給我可落地的作業流程設計。",
      en: "We're a B2B services company where cross-team handoffs break down and information is scattered. For \"{task}\", give me a workable operating-process design.",
    },
    {
      zh: "我負責公司的內部營運，想把重複性的人工作業標準化甚至自動化。針對「{task}」請給我具體步驟與範例。",
      en: "I run internal operations and want to standardize and ideally automate repetitive manual work. For \"{task}\", give me concrete steps and examples.",
    },
  ],
  design: [
    {
      zh: "我們是一個小型產品團隊，準備重新設計核心流程的使用者體驗，希望兼顧美感與易用。請針對「{task}」給我具體、有觀點的建議。",
      en: "We're a small product team about to redesign the UX of a core flow, balancing aesthetics and usability. For \"{task}\", give me specific, opinionated recommendations.",
    },
    {
      zh: "我是設計師，正在為一個新品牌建立視覺與介面規範。針對「{task}」請給我清楚、可交付的成果。",
      en: "I'm a designer establishing the visual and UI guidelines for a new brand. For \"{task}\", give me clear, deliverable output.",
    },
  ],
};

/**
 * Returns two example input strings for an agent in the given language.
 * The `{task}` placeholder is filled with the agent's localized label.
 */
export function getExamples(
  cat: AgentCategory,
  label: string,
  labelEn: string,
  lang: Lang
): [string, string] {
  const pair = CATEGORY_EXAMPLES[cat] ?? CATEGORY_EXAMPLES.strategy;
  const task = lang === "zh" ? label : labelEn;
  const fill = (e: Example) => e[lang].replace("{task}", task);
  return [fill(pair[0]), fill(pair[1])];
}
