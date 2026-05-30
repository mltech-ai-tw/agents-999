# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`agents-999` is an open-source, self-hostable Next.js 15 (App Router) web app that
runs 999 AI consultant agents using the visitor's **own** LLM API key. There is no
database, no auth, and no server-side secrets — keys live in the browser's
`localStorage` and are forwarded per-request to the chosen provider only.

## Commands

```bash
npm run dev          # dev server at http://localhost:3000
npm run build        # production build — pre-renders all 999 agent pages
npm start            # serve the production build
npm run lint         # ESLint (next/core-web-vitals)
npm run typecheck    # tsc --noEmit  (run this after non-trivial changes)
npm run gen:agents   # regenerate lib/agents/data.ts from the source metadata
```

There is no test suite. The fastest correctness check is `npm run typecheck && npm run build`.

To regenerate agents from a custom source table:
`node scripts/generate-agents.cjs <path-to-tools-meta.ts>`

## Architecture (the parts that span files)

**Request flow:** `AgentRunner` (client) → `POST /api/run` → `lib/llm/router.ts`
`chat()` → a `lib/providers/*` provider → unified SSE byte stream → back through
`/api/run` → `lib/runAgentClient.ts` parses SSE → typewriter output.

**Agents are data-driven, not 999 files.** This is the most important thing to
understand before touching agents:

- `lib/agents/data.ts` is **auto-generated** (`npm run gen:agents`) — flat
  `AgentMeta` rows: `{ id, label, labelEn, desc, descEn, cat }`. Do not hand-edit it.
- `lib/agents/index.ts` resolves each `AgentMeta` into a full `Agent` at load time
  by attaching `inputs` (default: `lib/agents/inputs.ts`) and a `prompt` closure
  (default: `buildPrompt()` in `lib/agents/prompt.ts`).
- To customise one agent's inputs/prompt/model, add an entry to
  `lib/agents/overrides.ts` — never edit the generated file.
- `getAgent`, `listAgents`, `ALL_AGENTS` are the public API from `lib/agents`.

**Unified SSE is the contract between every provider and the client.** Wire format
(see `lib/llm/sse.ts`): `data: {"delta":"…"}` chunks, `data: {"error":"…"}` on
failure, terminated by `data: [DONE]`. Every provider must emit this regardless of
its upstream API shape. `createSSEStream(generator)` wraps a text-delta generator
and guarantees a terminating `[DONE]` even on error. OpenAI/Mistral/Groq/Azure
share `lib/providers/openai-compat.ts`; Anthropic, Gemini, and Ollama (NDJSON)
have bespoke parsers.

**Server vs client boundary.** `Agent` objects contain a `prompt` **function**, so
they are not serialisable across the server→client boundary. The tool page
(`app/tools/[id]/page.tsx`) passes only an `AgentView` (plain fields, no closure)
to the client; the prompt is rebuilt server-side in `/api/run` from the agent id.
Listing/search uses the plain `AGENT_DATA` array directly in client components.

**Credentials never hit a server store.** `lib/settings.ts` reads/writes the
`Settings` object in `localStorage`. The client resolves credentials with
`credentialsFor()` and sends them in the `/api/run` body; the route uses them for
one fetch and discards them. `configuredProviders()` drives which providers appear
in the model selector and Settings status dots.

## Conventions

- **Next.js 15:** route `params` are `Promise`s — `await params` in pages/metadata.
- **i18n everywhere:** all user-facing strings go through `t(key, lang)` in
  `lib/i18n.ts`; agent prompts switch on a `lang: 'zh' | 'en'` arg. Add both
  languages. Category display names live in `CATEGORY_LABELS`.
- **Adding a provider** touches five places: `lib/providers/<name>.ts`, `PROVIDERS`
  in `router.ts`, `ProviderKey` in `llm/types.ts`, `providers-meta.ts`, and the
  credential helpers + Settings section. See CONTRIBUTING.md.
- **Categories:** the `AgentCategory` union in `lib/agents/types.ts` must include
  every `cat` present in the data (note `design` exists in the data but isn't in
  the original design spec's list). The generator warns on unknown categories.
- Path alias `@/*` maps to the repo root.
