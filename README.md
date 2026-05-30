# agents-999

**English** · [繁體中文](./README.zh-TW.md)

**999 free AI consultant agents. Bring your own API key.**

🔗 **Live demo: https://agents-999-eta.vercel.app**

A standalone, self-hostable Next.js web app that lets anyone run 999 AI
consultant agents using their own LLM API keys. No account, no signup, no data
sent anywhere except the LLM provider you choose. **API keys are stored in your
browser's `localStorage` only** — they're sent to the server purely to proxy a
single request and are never persisted.

Supports: **OpenAI · Anthropic · Gemini · Ollama · Mistral · Groq · Azure OpenAI**

---

## Quick Start

```bash
git clone https://github.com/mltech-ai-tw/agents-999
cd agents-999
npm install
npm run dev
# Open http://localhost:3000 → Settings → add your API key → run any agent
```

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mltech-ai-tw/agents-999)

Runs on any Node.js host — Vercel, Railway, Render, Fly.io, or self-hosted.
There are **no server-side secrets** to configure: keys come from each visitor's
browser at request time.

```bash
npm run build
npm start
```

---

## How it works

```
User input → /api/run → lib/llm/router → provider → SSE stream → UI (typewriter)
```

Your API key travels: `localStorage → request header → /api/run (used, never stored) → provider API`

- **Home (`/`)** — searchable, category-filtered grid of all 999 agents.
- **Runner (`/tools/[id]`)** — dynamic form per agent, model selector (only shows
  providers you've configured), live-streaming output with copy/reset.
- **Settings (`/settings`)** — one section per provider, show/hide keys,
  per-provider "Test Connection", default provider/model, Clear All.

Everything is bilingual (繁體中文 / English) via a header toggle.

---

## Providers

| Provider  | Credentials needed                     | Notes |
|-----------|----------------------------------------|-------|
| OpenAI    | API key                                | Chat Completions, streaming |
| Anthropic | API key                                | Messages API, streaming |
| Gemini    | API key                                | `streamGenerateContent` (SSE) |
| Ollama    | Base URL (default `localhost:11434`)   | Local, no key |
| Mistral   | API key                                | OpenAI-compatible |
| Groq      | API key                                | OpenAI-compatible |
| Azure     | Endpoint + deployment name + API key   | OpenAI-compatible |

---

## Scripts

| Command              | What it does |
|----------------------|--------------|
| `npm run dev`        | Start the dev server (http://localhost:3000) |
| `npm run build`      | Production build (pre-renders all agent pages) |
| `npm start`          | Serve the production build |
| `npm run lint`       | ESLint (next/core-web-vitals) |
| `npm run typecheck`  | `tsc --noEmit` |
| `npm run gen:agents` | Regenerate `lib/agents/data.ts` from the source metadata |

---

## Adding / customising agents

The 999 agents are defined as flat metadata in `lib/agents/data.ts`
(auto-generated) and turned into runnable agents at load time with a generic
prompt builder. To customise a single agent's inputs or prompt, **don't edit the
generated file** — add an entry to `lib/agents/overrides.ts`. See
[CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Out of scope (v1)

No accounts/OAuth · no conversation history · no agent chaining · no
file/image input · no in-UI agent creation · no analytics.

---

## License

MIT — see [LICENSE](./LICENSE).
