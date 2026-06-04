/**
 * Site / brand configuration — the ONE place to rebrand this project.
 *
 * This app is open source and meant to be forked. Change the values below and
 * the whole UI (masthead, hero, footer, page <title>) updates. Nothing else in
 * the app hardcodes a brand name.
 *
 * Make it yours:
 *   - name      : product name shown in the masthead and titles
 *   - tagline   : one neutral line under the hero (zh / en)
 *   - attribution / attributionUrl : OPTIONAL footer credit. Leave attribution
 *     as "" to show no credit at all (fully white-label).
 */
export const SITE = {
  /** Product name (masthead, <title>). The "-999" suffix is styled separately. */
  name: "agents-999",

  /** Neutral hero tagline. Describe what it does — no marketing fluff. */
  tagline: {
    zh: "999 個 AI 代理人，自帶金鑰即可使用。",
    en: "999 AI agents, run with your own key.",
  },

  /** Short hero sub-line. */
  subtitle: {
    zh: "免帳號、免註冊。你的 API 金鑰只存在瀏覽器，永不上傳。",
    en: "No account, no signup. Your API key lives in your browser and is never uploaded.",
  },

  /**
   * Optional footer credit. Empty string = no credit line (recommended when
   * you fork this as your own product). Example: "Acme Inc."
   */
  attribution: "",
  attributionUrl: "",

  /** Repository URL (used by the README/deploy button; safe to change). */
  repoUrl: "https://github.com/mltech-ai-tw/agents-999",

  /**
   * Production URL — used as Open Graph / Twitter metadataBase so social
   * previews (LinkedIn, X, Slack…) resolve absolute image/links. Forkers:
   * change this to your own deployed domain.
   */
  url: "https://www.mltech.tw",
} as const;
