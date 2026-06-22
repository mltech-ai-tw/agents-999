import type { AgentCategory } from "./agents/types";

export type Lang = "zh" | "en";

export const LANG_STORAGE_KEY = "agents999_lang";

type Dict = Record<string, { zh: string; en: string }>;

const STRINGS: Dict = {
  appName: { zh: "agents-999", en: "agents-999" },
  tagline: {
    zh: "999 個 AI 顧問代理人 — 用你自己的 API 金鑰",
    en: "999 AI Consultant Agents — Bring Your Own Key",
  },
  heroSubtitle: {
    zh: "免帳號、免註冊。你的金鑰只存在瀏覽器，永不上傳。",
    en: "No account, no signup. Your keys live in your browser, never uploaded.",
  },
  settings: { zh: "設定", en: "Settings" },
  searchPlaceholder: {
    zh: "搜尋代理人…",
    en: "Search agents…",
  },
  all: { zh: "全部", en: "All" },
  run: { zh: "執行", en: "Run" },
  running: { zh: "執行中…", en: "Running…" },
  stop: { zh: "停止", en: "Stop" },
  reset: { zh: "重設", en: "Reset" },
  copy: { zh: "複製", en: "Copy" },
  copied: { zh: "已複製", en: "Copied" },
  output: { zh: "輸出", en: "Output" },
  noResults: { zh: "找不到符合的代理人", en: "No matching agents" },
  backToHome: { zh: "← 返回首頁", en: "← Back to home" },
  model: { zh: "模型", en: "Model" },
  provider: { zh: "供應商", en: "Provider" },
  required: { zh: "必填", en: "required" },
  optional: { zh: "選填", en: "optional" },
  noKeysConfigured: {
    zh: "尚未設定任何 API 金鑰。請先到設定頁加入金鑰。",
    en: "No API keys configured yet. Add one in Settings first.",
  },
  goToSettings: { zh: "前往設定 →", en: "Go to Settings →" },
  apiKey: { zh: "API 金鑰", en: "API Key" },
  show: { zh: "顯示", en: "Show" },
  hide: { zh: "隱藏", en: "Hide" },
  save: { zh: "儲存", en: "Save" },
  saved: { zh: "已儲存", en: "Saved" },
  clearAll: { zh: "清除全部", en: "Clear All" },
  test: { zh: "測試連線", en: "Test Connection" },
  testing: { zh: "測試中…", en: "Testing…" },
  testOk: { zh: "連線成功", en: "Connection OK" },
  testFail: { zh: "連線失敗", en: "Connection failed" },
  defaultProvider: { zh: "預設供應商", en: "Default Provider" },
  defaultModel: { zh: "預設模型", en: "Default Model" },
  baseUrl: { zh: "Base URL", en: "Base URL" },
  endpoint: { zh: "Endpoint", en: "Endpoint" },
  deploymentName: { zh: "部署名稱", en: "Deployment Name" },
  agentsCount: { zh: "個代理人", en: "agents" },
  emptyOutputHint: {
    zh: "填寫表單並按下「執行」，結果會在此即時串流顯示。",
    en: "Fill in the form and hit Run — results stream here in real time.",
  },
  language: { zh: "語言", en: "Language" },
  settingsSaved: { zh: "設定已儲存", en: "Settings saved" },
  confirmClear: {
    zh: "確定要清除所有金鑰與設定嗎？",
    en: "Clear all keys and settings?",
  },
  compareMode: { zh: "對比模式", en: "Compare Mode" },
  compareModeOff: { zh: "單欄模式", en: "Single Mode" },
  compareAddColumn: { zh: "新增欄位", en: "Add Column" },
  compareRemoveColumn: { zh: "移除此欄", en: "Remove column" },
  compareStopAll: { zh: "全部", en: "All" },
  copyFailed: { zh: "複製失敗", en: "Copy failed" },
  compareIdle: { zh: "等待執行…", en: "Waiting to run…" },
  compareStatusIdle: { zh: "待機", en: "Idle" },
  compareStatusStreaming: { zh: "串流中", en: "Streaming" },
  compareStatusDone: { zh: "完成", en: "Done" },
  compareStatusError: { zh: "錯誤", en: "Error" },
  conversationFollowUpPlaceholder: {
    zh: "輸入後續問題…",
    en: "Ask a follow-up question…",
  },
  conversationSend: { zh: "送出", en: "Send" },
  conversationYou: { zh: "你", en: "You" },
  conversationReset: { zh: "重設對話", en: "Reset conversation" },
  conversationTurnLabel: { zh: "助手", en: "Assistant" },
  conversationFollowUpHint: {
    zh: "可繼續追問",
    en: "You can ask follow-up questions",
  },
  change: { zh: "更改", en: "Change" },
  pipeline: { zh: "流程", en: "Pipeline" },
  pipelineTitle: { zh: "代理人流程", en: "Agent Pipeline" },
  pipelineSubtitle: {
    zh: "串接多個代理人 — 每一步的輸出會成為下一步的輸入。",
    en: "Chain multiple agents — each step's output feeds the next step.",
  },
  pipelineAddStep: { zh: "新增步驟", en: "Add step" },
  pipelineRemoveStep: { zh: "移除步驟", en: "Remove step" },
  pipelineStepLabel: { zh: "步驟", en: "Step" },
  pipelineInjectionCaveat: {
    zh: "注意：每一步的輸出會直接餵入下一步，請檢視中間結果——惡意或被注入的內容可能影響後續步驟。",
    en: "Note: each step's output feeds directly into the next — review intermediate results, as malicious or injected content can steer later steps.",
  },
  pipelineInstructionPlaceholder: {
    zh: "這一步要做什麼？",
    en: "What should this step do?",
  },
  pipelineRun: { zh: "執行流程", en: "Run pipeline" },
  pipelineReset: { zh: "重設流程", en: "Reset pipeline" },
  pipelineStop: { zh: "停止", en: "Stop" },
  pipelineStopped: { zh: "已由使用者停止", en: "Stopped by user" },
  pipelinePickAgentForAllSteps: {
    zh: "請為每個步驟選擇代理人。",
    en: "Please pick an agent for every step.",
  },
  pipelineStepIdle: { zh: "待機", en: "Idle" },
  pipelineStepRunning: { zh: "執行中", en: "Running" },
  pipelineStepDone: { zh: "完成", en: "Done" },
  pipelineStepError: { zh: "錯誤", en: "Error" },
  pipelineStepSkipped: { zh: "已略過", en: "Skipped" },
  pipelineNoSteps: {
    zh: "尚無步驟。新增一個步驟開始建立流程。",
    en: "No steps yet. Add a step to start building your pipeline.",
  },
  pipelineOutputLabel: { zh: "輸出", en: "Output" },
  pipelineSearchPlaceholder: {
    zh: "搜尋代理人…",
    en: "Search agents…",
  },
  pipelineContextTruncated: {
    zh: "上一步輸出過長，已截斷。",
    en: "Previous output was too long and has been truncated.",
  },
};

export function t(key: keyof typeof STRINGS, lang: Lang): string {
  const entry = STRINGS[key];
  return entry ? entry[lang] : key;
}

export const CATEGORY_LABELS: Record<AgentCategory, { zh: string; en: string }> = {
  product: { zh: "產品", en: "Product" },
  brand: { zh: "品牌", en: "Brand" },
  finance: { zh: "財務", en: "Finance" },
  strategy: { zh: "策略", en: "Strategy" },
  marketing: { zh: "行銷", en: "Marketing" },
  legal: { zh: "法務", en: "Legal" },
  sales: { zh: "銷售", en: "Sales" },
  people: { zh: "人才", en: "People" },
  ops: { zh: "營運", en: "Ops" },
  dev: { zh: "開發", en: "Dev" },
  content: { zh: "內容", en: "Content" },
  operations: { zh: "作業", en: "Operations" },
  design: { zh: "設計", en: "Design" },
};

export function categoryLabel(cat: AgentCategory, lang: Lang): string {
  return CATEGORY_LABELS[cat]?.[lang] ?? cat;
}
