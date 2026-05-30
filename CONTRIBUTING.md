# Contributing to agents-999

Thanks for helping improve agents-999! This guide covers the two most common
contributions: **adding/editing agents** and **adding a new LLM provider**.

## Project layout

```
app/                     Next.js App Router (pages + /api routes)
  api/run/route.ts       LLM proxy — builds the prompt, streams the response
  api/test/route.ts      Connection tester used by Settings
components/              React components (Header, AgentRunner, Settings, …)
lib/
  agents/
    data.ts              AUTO-GENERATED — 999 agents of flat metadata
    types.ts             Agent / AgentMeta / AgentInput / AgentCategory
    inputs.ts            DEFAULT_INPUTS used when an agent has no custom inputs
    prompt.ts            buildPrompt() — the generic prompt template
    overrides.ts         per-agent customisations (inputs / prompt / model)
    index.ts             getAgent / listAgents / ALL_AGENTS (resolves overrides)
  llm/
    router.ts            chat() → dispatches to a provider
    sse.ts               unified SSE wire format + stream helpers
    types.ts             ChatRequest / Provider / ProviderKey / ProviderError
  providers/             one file per provider (openai, anthropic, …)
  providers-meta.ts      client catalogue: labels, model lists, credential needs
  settings.ts            localStorage settings read/write helpers
  i18n.ts                UI strings + category labels (zh/en)
scripts/
  generate-agents.cjs    regenerates lib/agents/data.ts from upstream metadata
```

## Agent model

Each agent has flat **metadata** (`AgentMeta`: id, label/labelEn, desc/descEn,
cat). At load time `lib/agents/index.ts` turns each into a full **`Agent`** by
attaching:

- **inputs** — `DEFAULT_INPUTS` (a context + details textarea), unless overridden.
- **prompt** — a closure over `buildPrompt(meta, inputs, values, lang)`, unless
  overridden.

This keeps all 999 agents data-driven instead of 999 hand-written files.

### Customise a single agent

Add an entry to `lib/agents/overrides.ts`. Anything you omit falls back to the
generated defaults:

```ts
export const AGENT_OVERRIDES: Record<string, AgentOverride> = {
  competitor: {
    inputs: [
      { key: "product", label: "你的產品/服務", labelEn: "Your Product/Service",
        type: "textarea", required: true },
      { key: "competitors", label: "競品名稱（逗號分隔）",
        labelEn: "Competitor Names (comma-separated)", type: "text", required: true },
    ],
    prompt: (inputs, lang) =>
      lang === "zh"
        ? `你是一位競品分析師。\n產品：${inputs.product}\n競品：${inputs.competitors}\n請分析定位並整合差異化建議。`
        : `You are a competitive analyst.\nProduct: ${inputs.product}\nCompetitors: ${inputs.competitors}\nAnalyze positioning and synthesize differentiation.`,
    model: "gpt-4o", // optional per-agent model override
  },
};
```

### Add a brand-new agent

1. Add a row to `lib/agents/data.ts`. Each entry is:
   `{ id, label, labelEn, desc, descEn, cat }` where `cat` is an `AgentCategory`.
2. (Optional) Add an override in `overrides.ts` for custom inputs/prompt.

If you maintain agents in an upstream source table, edit the generator and run
`npm run gen:agents` instead of editing `data.ts` by hand.

## Add a new provider

1. Create `lib/providers/<name>.ts` exporting a `Provider` whose `chat()`
   returns a unified SSE stream. Reuse `openAICompatibleChat()` if the API is
   OpenAI-compatible; otherwise use `createSSEStream()` + `readSSELines()` from
   `lib/llm/sse.ts`.
2. Register it in `PROVIDERS` in `lib/llm/router.ts` and add the key to
   `ProviderKey` in `lib/llm/types.ts`.
3. Add a `ProviderMeta` entry in `lib/providers-meta.ts` (label, model list,
   credential needs).
4. Add credential handling in `lib/settings.ts` (`configuredProviders`,
   `credentialsFor`) and the Settings UI section.

## Before opening a PR

```bash
npm run typecheck
npm run lint
npm run build
```

Keep files small and focused, prefer immutable updates, and validate input at
the `/api` boundary (see `app/api/run/route.ts`).
