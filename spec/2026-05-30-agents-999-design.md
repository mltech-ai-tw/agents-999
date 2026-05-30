# agents-999 Implementation Design

**Date:** 2026-05-30  
**GitHub:** `github.com/MLTech-AI/agents-999`  
**Goal:** Open-source self-hostable web app — 999 AI consultant agents, bring-your-own API key.

---

## Overview

A standalone Next.js web app that lets anyone run 999 AI consultant agents using their own LLM API keys. No account required, no data sent to any server other than the chosen LLM provider. API keys stored in localStorage only.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Custom fetch (no Vercel AI SDK)

---

## Architecture

```
agents-999/
├── app/
│   ├── page.tsx                  # Home: tool grid + search + filter
│   ├── tools/[id]/page.tsx       # Single agent runner page
│   ├── settings/page.tsx         # API key management
│   └── api/
│       └── run/route.ts          # Server-side LLM proxy (SSE stream)
├── lib/
│   ├── agents/                   # 999 agent definitions
│   │   ├── index.ts              # getAgent(id), listAgents(cat?), ALL_AGENTS
│   │   └── [id].ts               # One file per agent (or grouped by cat)
│   ├── llm/
│   │   └── router.ts             # Unified chat() interface → provider dispatch
│   └── providers/
│       ├── openai.ts
│       ├── anthropic.ts
│       ├── gemini.ts
│       ├── ollama.ts
│       ├── mistral.ts
│       ├── groq.ts
│       └── azure.ts
├── components/
│   ├── AgentCard.tsx
│   ├── AgentGrid.tsx
│   ├── AgentRunner.tsx           # Form + stream output
│   ├── ModelSelector.tsx
│   ├── SearchBar.tsx
│   └── CategoryFilter.tsx
└── public/
```

**Request flow:**
```
User input → /api/run → lib/llm/router → provider → SSE stream → UI (typewriter)
```

API key travels: `localStorage → request header → /api/run (used, never stored) → provider API`

---

## Agent Definition Schema

Each agent is a typed object. All 999 agents migrated from `lib/tools-meta.ts` + prompt added.

```typescript
// lib/agents/types.ts
export type AgentInput = {
  key: string
  label: string          // Chinese
  labelEn: string        // English
  type: 'text' | 'textarea' | 'select'
  options?: string[]     // for select type
  required: boolean
  placeholder?: string
  placeholderEn?: string
}

export type Agent = {
  id: string             // camelCase, unique
  label: string          // 4-12 Chinese chars
  labelEn: string        // 2-6 English words
  desc: string           // 15-30 Chinese chars
  descEn: string         // 8-20 English words
  cat: AgentCategory
  inputs: AgentInput[]
  prompt: (inputs: Record<string, string>, lang: 'zh' | 'en') => string
  model?: string         // override default model, e.g. 'gpt-4o'
  stream: boolean        // always true for v1
}

export type AgentCategory =
  | 'product' | 'brand' | 'finance' | 'strategy'
  | 'marketing' | 'legal' | 'sales' | 'people'
  | 'ops' | 'dev' | 'content' | 'operations'
```

Example agent file:
```typescript
// lib/agents/competitor.ts
import type { Agent } from './types'

export const agent: Agent = {
  id: 'competitor',
  label: '競品分析',
  labelEn: 'Competitor Analysis',
  desc: '並行抓取品牌定位，策略師彙整差異化',
  descEn: 'Parallel brand positioning — strategist synthesizes differentiation',
  cat: 'marketing',
  inputs: [
    {
      key: 'product',
      label: '你的產品/服務',
      labelEn: 'Your Product/Service',
      type: 'textarea',
      required: true,
      placeholder: '描述你的產品...',
      placeholderEn: 'Describe your product...',
    },
    {
      key: 'competitors',
      label: '競品名稱（逗號分隔）',
      labelEn: 'Competitor Names (comma-separated)',
      type: 'text',
      required: true,
    },
  ],
  prompt: (inputs, lang) => lang === 'zh'
    ? `你是一位競品分析師。\n產品：${inputs.product}\n競品：${inputs.competitors}\n請分析各競品定位並整合差異化建議。`
    : `You are a competitive analyst.\nProduct: ${inputs.product}\nCompetitors: ${inputs.competitors}\nAnalyze each competitor's positioning and synthesize differentiation recommendations.`,
  stream: true,
}
```

---

## LLM Router & Providers

### Unified Interface

```typescript
// lib/llm/router.ts
export type ChatRequest = {
  provider: ProviderKey
  model: string
  apiKey: string
  baseUrl?: string        // for Ollama / Azure custom endpoints
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
}

export type ProviderKey = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'mistral' | 'groq' | 'azure'

export async function chat(request: ChatRequest): Promise<ReadableStream> {
  const providers: Record<ProviderKey, Provider> = {
    openai:    openaiProvider,
    anthropic: anthropicProvider,
    gemini:    geminiProvider,
    ollama:    ollamaProvider,
    mistral:   mistralProvider,
    groq:      groqProvider,
    azure:     azureProvider,
  }
  return providers[request.provider].chat(request)
}
```

### Provider API Endpoints

| Provider  | Endpoint                                                        | Auth Header          |
|-----------|----------------------------------------------------------------|----------------------|
| OpenAI    | `https://api.openai.com/v1/chat/completions`                  | `Bearer {key}`       |
| Anthropic | `https://api.anthropic.com/v1/messages`                       | `x-api-key: {key}`   |
| Gemini    | `https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?key={key}` | query param |
| Ollama    | `{baseUrl}/api/chat` (default: `http://localhost:11434`)       | none                 |
| Mistral   | `https://api.mistral.ai/v1/chat/completions`                  | `Bearer {key}`       |
| Groq      | `https://api.groq.com/openai/v1/chat/completions`             | `Bearer {key}`       |
| Azure     | `{endpoint}/openai/deployments/{model}/chat/completions?api-version=2024-02-01` | `api-key: {key}` |

### /api/run Route

```typescript
// app/api/run/route.ts
export async function POST(req: Request) {
  const { agentId, inputs, provider, model, apiKey, baseUrl, lang } = await req.json()

  const agent = getAgent(agentId)
  if (!agent) return Response.json({ error: 'Agent not found' }, { status: 404 })

  const prompt = agent.prompt(inputs, lang ?? 'zh')
  const stream = await chat({ provider, model, apiKey, baseUrl, messages: [{ role: 'user', content: prompt }] })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  })
}
```

---

## Settings — API Key Storage

Stored in `localStorage` under key `agents999_settings`:

```typescript
type Settings = {
  defaultProvider: ProviderKey
  defaultModel: string
  keys: {
    openai?: string
    anthropic?: string
    gemini?: string
    mistral?: string
    groq?: string
    azure?: { endpoint: string; apiKey: string; deploymentName: string }
    ollama?: { baseUrl: string }   // no key needed
  }
}
```

Settings page features:
- Show/hide toggle per key
- Save button (writes to localStorage)
- "Test Connection" button per provider (sends minimal request, reports ✅ / ❌)
- Clear All button

---

## UI Pages

### Home `/`
- Header: logo, language toggle (zh/en), Settings link
- Hero: "999 Agents — Bring Your Own Key"
- Search bar (searches label + desc)
- Category filter tabs (12 cats + "All")
- Agent card grid (responsive, 2-4 cols)
- Each card: name, category badge, short desc, "Run →" link

### Agent Runner `/tools/[id]`
- Agent name + category + description
- Dynamic form (renders `agent.inputs` — text, textarea, select)
- Model selector dropdown (only shows providers with keys configured)
- "Run" button → POST to `/api/run` → SSE stream to output box
- Output box: typewriter streaming effect, monospace, copy button
- Reset button to clear inputs + output

### Settings `/settings`
- One section per provider
- Inputs: API key field (password type, show/hide), test button
- Ollama section: base URL field instead of key
- Azure section: endpoint + key + deployment name
- Default model selector
- Save / Clear All buttons

---

## Internationalisation

- Language toggle stored in `localStorage` (`agents999_lang`: `'zh' | 'en'`)
- All agent metadata has both `label`/`labelEn`, `desc`/`descEn`
- UI strings in `lib/i18n.ts` (simple key→string map, zh + en)
- Agent prompts use `lang` param to switch between Chinese/English system prompt

---

## README (Key Sections)

```markdown
# agents-999

999 free AI consultant agents. Bring your own API key.

Supports: OpenAI · Anthropic · Gemini · Ollama · Mistral · Groq · Azure OpenAI

## Quick Start
git clone https://github.com/MLTech-AI/agents-999
cd agents-999
npm install
npm run dev
# Open http://localhost:3000 → Settings → Add your API key → Run any agent

## Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=...)
# Or: any Node.js host — Railway, Render, Fly.io, self-hosted

## Adding Agents
See CONTRIBUTING.md — one file per agent in lib/agents/
```

---

## Out of Scope (v1)

- OAuth login (no accounts)
- Conversation history / memory
- Agent chaining / multi-step workflows
- Image/file input
- Custom agent creation via UI
- Usage analytics

---

## Migration from MLSTech_official

Source: `lib/tools-meta.ts` from `github.com/Ikeli0320/Mltech_Official`

Steps:
1. Copy all 999 entries from `TOOLS_META`
2. For each entry, create `lib/agents/{id}.ts` with metadata + a default prompt template using the `desc`/`descEn` as basis
3. Add 2-3 `inputs` fields per agent (most need at least one `textarea` for context)
4. Export all from `lib/agents/index.ts`
