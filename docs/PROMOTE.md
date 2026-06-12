# Spread the word — ready-to-paste copy

Copy-paste blurbs for launching / sharing **agents-999**. Swap the links if you
host your own fork.

- **Repo:** https://github.com/mltech-ai-tw/agents-999
- **Live demo:** https://agents-999.vercel.app

---

## X / Twitter

**Short (under 280):**

```
999 free AI consultant agents — strategy, marketing, sales, finance, legal, dev & more.

Bring your own API key (OpenAI / Claude / Gemini / Ollama). No signup, no subscription, keys never leave your browser. Open source.

▶ Try it: https://agents-999.vercel.app
⭐ Code: https://github.com/mltech-ai-tw/agents-999
```

**Thread opener:**

```
I open-sourced agents-999: a library of 999 AI business-consultant agents you run with your OWN LLM key. 🧵

No account. No server-side secrets. Your key lives in localStorage and is used to proxy a single request — never stored.

Self-hostable Next.js. MIT. 👇
```

---

## Hacker News (Show HN)

> **Naming caveat — read before posting.** On HN, "agent" means an autonomous,
> tool-using loop. These are curated prompt templates with structured forms. If
> the title leans on "999 agents", the top comment will likely be *"these aren't
> agents"* — so the copy below disarms that up front. Honesty reads as
> credibility here, not weakness.

**Title** (pick one — A recommended; avoid repeating "agents-999 … agents"):

```
A) Show HN: A BYO-key AI consultant prompt library – no backend, keys stay in-browser
B) Show HN: 999 curated AI consultant prompts you run with your own API key
C) Show HN: Self-hostable AI consultant app – bring your own LLM key, no database
```

**Body:**

```
I built agents-999: a searchable library of 999 AI consultant "agents" across 12
categories (strategy, marketing, sales, finance, legal, product, dev, ops…).

Up front, so the name isn't misleading: these aren't autonomous tool-using
agents. Each one is a hand-tuned prompt template with a structured input form
(some render Markdown tables, charts, or Mermaid diagrams). Think "a big, curated
prompt library with a UI" rather than agentic loops.

The part I actually found interesting to build is the architecture:

- No database, no auth, no server-side secrets. Your API key lives in the
  browser's localStorage and is forwarded to the provider for a single request,
  then discarded. The server never stores it.
- One provider abstraction normalises OpenAI, Anthropic, Gemini, Ollama (local),
  Mistral, Groq and Azure into a single SSE byte stream, so the client has one
  code path regardless of upstream API shape.
- The 999 agents are data-driven, not 999 files — a flat metadata table plus a
  generic bilingual prompt builder, with per-agent overrides for the hand-tuned
  forms. Build-time pre-renders every page.
- Bilingual (English / 繁體中文), MIT, one-click Vercel deploy or any Node host.

Demo (no key needed to browse): https://agents-999.vercel.app
Code: https://github.com/mltech-ai-tw/agents-999

Happy to go into the provider/SSE layer or the data-driven agent generation.
```

**Posting tactics:**

- Best window: weekday **08:00–10:00 ET** (≈ 20:00–22:00 Taipei) onto `/newest`.
- **Never** ask for upvotes or share an external "upvote my HN post" link — that
  gets the post flagged.
- Post a **maker comment immediately** with the one technical detail you most
  want to be asked about, to seed discussion.
- Stay online and reply to every comment — ranking rewards comment activity.

---

## Reddit (r/SideProject, r/opensource, r/selfhosted, r/LocalLLaMA)

**Title:**

```
I built agents-999: 999 AI consultant agents, bring-your-own-key, fully self-hostable [open source]
```

**Body:**

```
It's a free, open-source library of 999 AI business-consultant agents (strategy,
marketing, sales, finance, legal, product, dev, ops and more). You use your own
API key — OpenAI, Anthropic, Gemini, or local Ollama.

Why you might like it:
• No account / no subscription — keys stay in your browser's localStorage
• Self-hostable: one-click Vercel deploy or any Node host, no secrets to set
• Local-first option via Ollama
• Bilingual (EN / 繁中), fork-and-rebrand from a single config file
• MIT licensed

Demo: https://agents-999.vercel.app
Code: https://github.com/mltech-ai-tw/agents-999

Feedback welcome!
```

> r/LocalLLaMA tip: lead with the **Ollama / local, no-cloud** angle.
> r/selfhosted tip: lead with **no database, no secrets, self-host anywhere**.

---

## Product Hunt

**Tagline (60 chars max):**

```
999 AI consultant agents you run with your own API key
```

**Description:**

```
agents-999 is a free, open-source library of 999 AI consultant agents across
strategy, marketing, sales, finance, legal, product and dev. Bring your own LLM
key (OpenAI, Claude, Gemini, or local Ollama) — no account, no subscription, and
your key never leaves your browser. Self-host it in one click.
```

**First comment (maker):**

```
Hey PH! 👋 I wanted a huge library of business-consultant prompts without
handing my data (or my wallet) to yet another SaaS. So agents-999 is 100%
bring-your-own-key: your API key lives in your browser and is only used to proxy
a single request. It's open source (MIT), bilingual, and self-hostable on
Vercel in one click. Would love your feedback!
```

---

## LinkedIn

```
I open-sourced agents-999 — a library of 999 AI consultant agents for strategy,
marketing, sales, finance, legal, product and engineering.

What makes it different: it's bring-your-own-key. There's no account, no
subscription, and no server-side data store. Your LLM API key stays in your
browser and is used only to proxy a single request to the provider you choose
(OpenAI, Anthropic, Gemini, or a local Ollama model).

It's MIT-licensed and self-hostable on Vercel in one click — fork it and rebrand
it for your team from a single config file.

▶ Live demo: https://agents-999.vercel.app
⭐ Code: https://github.com/mltech-ai-tw/agents-999

#AI #OpenSource #LLM #NextJS #Productivity
```

---

## 中文（Threads / Facebook / X / 噗浪 / 社群）

**短版：**

```
開源專案 agents-999：999 個 AI 顧問代理人,涵蓋策略、行銷、業務、財務、法務、產品、開發等領域。

自帶 API 金鑰即可使用(OpenAI / Claude / Gemini / 本地 Ollama),免註冊、免訂閱,金鑰只存在你的瀏覽器,不會上傳。MIT 授權,可一鍵自架。

▶ 體驗:https://agents-999.vercel.app
⭐ 原始碼:https://github.com/mltech-ai-tw/agents-999
```

**長版:**

```
分享我開源的 agents-999 — 一個內建 999 個 AI 商業顧問代理人的網站。

特色是「自帶金鑰(BYOK)」:沒有帳號、沒有訂閱、沒有伺服器端資料庫。你的
LLM API 金鑰只存在瀏覽器的 localStorage,僅用來代理單次請求,絕不儲存。

支援 OpenAI、Anthropic、Google Gemini、本地 Ollama、Mistral、Groq、Azure。
中英雙語介面,MIT 授權,可在 Vercel 一鍵自架,改一個設定檔就能換成自己的品牌。

▶ 線上體驗:https://agents-999.vercel.app
⭐ GitHub:https://github.com/mltech-ai-tw/agents-999

#AI #開源 #LLM #生產力工具
```

---

## Repo hygiene checklist (boosts discovery)

- [x] **Topics** set (ai, ai-agents, llm, openai, anthropic, nextjs, self-hosted, bring-your-own-key…)
- [x] **Description** keyword-rich, one line
- [x] **Website** field → live demo URL
- [x] **README** banner image + screenshots + live-demo CTA
- [ ] **Custom social preview image** (Settings → Options → Social preview) — upload `docs/screenshots/og-cover.png`
- [ ] **Pin the repo** on the org/profile
- [x] Cut a **tagged release** (`v1.0.0`) so it shows in the sidebar and feeds
- [ ] Submit to awesome lists — see the section below

---

## awesome-list submissions (copy-paste entries)

Highest-value, longest-lived backlinks. Each is a single-line PR.

| List | Fit | Notes |
|------|-----|-------|
| **awesome-selfhosted** | ★★★★ | Strictest rules, but you qualify (self-hostable, MIT, live demo). Biggest payoff. |
| **awesome-nextjs** | ★★★★ | You're a Next.js 15 app — natural fit, looser rules. |
| **awesome-chatgpt / awesome-llm** | ★★★ | Lead with the multi-provider BYOK angle. |
| **awesome-ai-agents** | ★★ | Name fits, but keep the description honest ("prompt templates"). |

**awesome-selfhosted** — strict format: correct category, alphabetical order,
description ends with a period, license + language tags at the end:

```
- [agents-999](https://github.com/mltech-ai-tw/agents-999) - Searchable library of 999 AI consultant prompt templates that run with your own LLM API key; no database, no accounts, keys stay in the browser. ([Demo](https://agents-999.vercel.app)) `MIT` `Nodejs`
```

> Suggested category: `Automation` (or near `Communication - Custom
> Communication Systems`). Read that repo's `CONTRIBUTING.md` first — it checks
> formatting, requires a demo link, and wants the project to be actively
> maintained (your `v1.0.0` covers that).

**awesome-nextjs** (looser):

```
- [agents-999](https://github.com/mltech-ai-tw/agents-999) - 999 AI consultant prompt templates, bring-your-own-key, no backend. ([Demo](https://agents-999.vercel.app))
```

**PR flow:** Fork → add one line to the correct category / alphabetical slot →
commit `Add agents-999` → open PR titled `Add agents-999`, body: "open source,
MIT, live demo, actively maintained."
