# Architecture

A map of how agents-999 fits together, for contributors. For a narrative deep-dive
on the streaming layer, see [`docs/blog/one-sse-seven-llms.md`](./docs/blog/one-sse-seven-llms.md).

## The big picture

agents-999 is a Next.js 15 (App Router) app with **no database, no auth, and no
server-side secrets**. A visitor stores their own LLM API key in the browser's
`localStorage`; it is sent per-request and used for a single upstream call, then
discarded. The server is a pure streaming proxy.

## Request flow

```
AgentRunner (client)
  → POST /api/run                         (app/api/run/route.ts)
    → chat(request)                       (lib/llm/router.ts)
      → a provider                        (lib/providers/*)
        → unified SSE byte stream         (lib/llm/sse.ts)
  → runAgentClient parses SSE             (lib/runAgentClient.ts)
    → typewriter output in the UI
```

## The two contracts that hold it together

### 1. Unified SSE wire format (`lib/llm/sse.ts`)

Every provider, whatever its upstream shape, emits the same bytes to the client:

```
data: {"delta":"<text>"}\n\n   data: {"error":"<msg>"}\n\n   data: [DONE]\n\n
```

`createSSEStream(generator)` wraps an async generator of text deltas and
guarantees a terminating `[DONE]` even when the generator throws (the error
surfaces as an `{error}` frame first). Providers express themselves as "a
generator of text deltas"; the wrapper owns the transport and termination.

- `readSSELines(res)` — yields the payload after each `data:` line (OpenAI-style
  + Anthropic).
- `readRawChunks(res)` — yields raw decoded chunks (Ollama NDJSON).

Tests: [`lib/llm/sse.test.ts`](./lib/llm/sse.test.ts),
[`lib/providers/providers.test.ts`](./lib/providers/providers.test.ts).

### 2. The `Provider` interface (`lib/llm/types.ts`)

```ts
type Provider = { chat: (request: ChatRequest) => Promise<ReadableStream<Uint8Array>> };
```

`lib/llm/router.ts` maps each `ProviderKey` to a `Provider` and dispatches.
OpenAI / Mistral / Groq / Azure share `lib/providers/openai-compat.ts`;
Anthropic (system split + typed events) and Ollama (NDJSON) have bespoke parsers.

**Adding a provider** touches five places — see [CONTRIBUTING.md](./CONTRIBUTING.md):
`lib/providers/<name>.ts`, `PROVIDERS` in `router.ts`, `ProviderKey` in
`llm/types.ts`, `providers-meta.ts`, and the credential helpers + Settings UI.

## Agents are data, not 999 files

This is the most important thing to know before touching agents.

- `lib/agents/data.ts` is **auto-generated** (`npm run gen:agents`) — flat
  `AgentMeta` rows. **Do not hand-edit it.**
- `lib/agents/index.ts` resolves each row into a full `Agent` at load time,
  attaching `inputs` (default `lib/agents/inputs.ts`) and a `prompt` closure
  (default `buildPrompt()` in `lib/agents/prompt.ts`).
- To customise one agent, add an entry to `lib/agents/overrides/<category>.ts` —
  never edit the generated file. Overrides can supply hand-tuned `inputs`, a
  bilingual `prompt`, and a `model`.
- Public API from `lib/agents`: `getAgent`, `listAgents`, `ALL_AGENTS`.

Every agent page is statically pre-rendered at build time
(`generateStaticParams` in `app/tools/[id]/page.tsx`).

## Server ↔ client boundary

`Agent` objects contain a `prompt` **function**, so they are not serialisable
across the server→client boundary. The tool page passes only an `AgentView`
(plain fields) to the client; `/api/run` rebuilds the prompt server-side from the
agent id. Listing/search uses the plain `AGENT_DATA` array directly.

## Credentials

`lib/settings.ts` reads/writes the `Settings` object in `localStorage`. The
client resolves credentials with `credentialsFor()` and sends them in the
`/api/run` body; the route uses them for one fetch and discards them.
`configuredProviders()` drives which providers appear in the model selector and
Settings status dots.

## Conventions

- **Next.js 15:** route `params` are `Promise`s — `await params`.
- **i18n everywhere:** user-facing strings go through `t(key, lang)`
  (`lib/i18n.ts`); prompts switch on `lang: 'zh' | 'en'`. Add both languages.
- **Categories:** the `AgentCategory` union in `lib/agents/types.ts` must include
  every `cat` present in the data.
- Path alias `@/*` maps to the repo root.

## Verify locally

```bash
npm run typecheck && npm run lint && npm test && npm run build
```
