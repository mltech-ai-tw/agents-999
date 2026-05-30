<div align="center">

# agents-999

**999 個免費 AI 顧問代理人。用你自己的 API 金鑰。**

[![線上展示](https://img.shields.io/badge/線上展示-agents--999-7c5cff?style=flat-square)](https://agents-999-eta.vercel.app)
[![授權: MIT](https://img.shields.io/badge/授權-MIT-green?style=flat-square)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![一鍵部署 Vercel](https://img.shields.io/badge/部署-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/mltech-ai-tw/agents-999)

[English](./README.md) · **繁體中文**

</div>

一個獨立、可自架的 Next.js 網頁應用，讓任何人都能用自己的 LLM API 金鑰執行 999 個
AI 顧問代理人。免帳號、免註冊，除了你選擇的 LLM 供應商外，資料不會傳到任何地方。
**API 金鑰只儲存在你瀏覽器的 `localStorage`** — 僅在代理單次請求時送到伺服器使用，
絕不留存。

支援：**OpenAI · Anthropic · Gemini · Ollama · Mistral · Groq · Azure OpenAI**

---

## 快速開始

```bash
git clone https://github.com/mltech-ai-tw/agents-999
cd agents-999
npm install
npm run dev
# 開啟 http://localhost:3000 → 設定 → 加入你的 API 金鑰 → 執行任一代理人
```

## 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mltech-ai-tw/agents-999)

可跑在任何 Node.js 主機 — Vercel、Railway、Render、Fly.io 或自架。
**沒有任何伺服器端密鑰** 需要設定：金鑰在請求當下由每位使用者的瀏覽器提供。

```bash
npm run build
npm start
```

---

## 運作原理

```
使用者輸入 → /api/run → lib/llm/router → 供應商 → SSE 串流 → UI（打字機效果）
```

你的 API 金鑰流向：`localStorage → 請求標頭 → /api/run（使用後即丟，不儲存）→ 供應商 API`

- **首頁 (`/`)** — 可搜尋、可依分類篩選的 999 個代理人卡片網格。
- **執行頁 (`/tools/[id]`)** — 每個代理人的動態表單、模型選擇器（只顯示你已設定金鑰的供應商）、
  即時串流輸出，附複製／重設。
- **設定頁 (`/settings`)** — 每個供應商一個區塊、金鑰顯示／隱藏、各供應商「測試連線」、
  預設供應商／模型、清除全部。

整個介面皆為雙語（繁體中文 / English），可由頁首切換。

---

## 供應商

| 供應商    | 所需憑證                              | 備註 |
|-----------|---------------------------------------|------|
| OpenAI    | API 金鑰                              | Chat Completions，串流 |
| Anthropic | API 金鑰                              | Messages API，串流 |
| Gemini    | API 金鑰                              | `streamGenerateContent`（SSE）|
| Ollama    | Base URL（預設 `localhost:11434`）    | 本機，免金鑰 |
| Mistral   | API 金鑰                              | OpenAI 相容 |
| Groq      | API 金鑰                              | OpenAI 相容 |
| Azure     | Endpoint ＋ 部署名稱 ＋ API 金鑰      | OpenAI 相容 |

---

## 指令

| 指令                  | 用途 |
|-----------------------|------|
| `npm run dev`        | 啟動開發伺服器（http://localhost:3000）|
| `npm run build`      | 正式版建置（預先渲染所有代理人頁面）|
| `npm start`          | 提供正式版建置 |
| `npm run lint`       | ESLint（next/core-web-vitals）|
| `npm run typecheck`  | `tsc --noEmit` |
| `npm run gen:agents` | 從來源 metadata 重新產生 `lib/agents/data.ts` |

---

## 新增／客製代理人

999 個代理人以扁平 metadata 形式定義在 `lib/agents/data.ts`（自動產生），於載入時透過
通用 prompt 產生器轉成可執行的代理人。若要客製單一代理人的輸入欄位或 prompt，
**請勿編輯自動產生的檔案** — 改在 `lib/agents/overrides.ts` 加一筆。詳見
[CONTRIBUTING.md](./CONTRIBUTING.md)。

---

## 不在範圍內（v1）

無帳號／OAuth · 無對話歷史 · 無代理人串接 · 無檔案／圖片輸入 ·
無 UI 內建代理人建立 · 無使用分析。

---

## 授權

MIT — 見 [LICENSE](./LICENSE)。
