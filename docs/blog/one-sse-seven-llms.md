# One SSE stream, seven LLM providers: giving a Next.js app a single streaming code path

*How I made OpenAI, Claude, Gemini, Ollama, Mistral, Groq and Azure look identical to the browser — with no database, no backend secrets, and the user's API key never leaving their machine for longer than one request.*

---

I built a small open-source Next.js app where a visitor picks an LLM provider, pastes their own API key, and streams a response. The fun part wasn't the UI — it was a constraint I set early:

> **The client must have exactly one code path for streaming, no matter which of the seven providers is selected.**

That sounds obvious until you actually look at how these APIs stream. They disagree on almost everything: the transport, the chunk shape, where the system prompt goes, and how the stream ends. This post is how I collapsed all of that into a single contract.

## The mess you're actually dealing with

Three different streaming dialects, just among the providers I wanted to support:

- **OpenAI / Mistral / Groq / Azure** — SSE, each line is `data: {…}`, and the text lives at `choices[0].delta.content`. Stream ends with a literal `data: [DONE]`.
- **Anthropic** — also SSE, but the system prompt is a *separate top-level field* (not a message), and the deltas arrive as typed events: you only want the ones where `type === "content_block_delta"` and `delta.type === "text_delta"`.
- **Ollama (local)** — not SSE at all. It's **NDJSON**: one JSON object per line, text at `message.content`, terminated by a `{done:true}` object. No API key, runs at `localhost:11434`.

If you let any of that leak to the client, you get three parsers in the browser and an `if (provider === …)` ladder that grows every time you add a provider. I wanted the opposite: the browser parses *one* format, forever.

## The contract

Every provider, regardless of its upstream shape, emits this back to the browser:

```
data: {"delta":"<text chunk>"}\n\n   ... repeated
data: {"error":"<message>"}\n\n      ... on failure
data: [DONE]\n\n                     ... always terminates
```

The browser only ever needs to understand three things: `delta`, `error`, `[DONE]`. That's the whole client-side protocol.

## The keystone: turn "a generator of text" into "a guaranteed SSE stream"

The trick that makes everything else simple is to express each provider as an **async generator that yields plain text deltas**, and wrap it once. The wrapper owns the wire format *and* the guarantee that the stream always terminates — even when the upstream throws mid-flight:

```ts
const encoder = new TextEncoder();
const frame = (payload: object) =>
  encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
const DONE = encoder.encode("data: [DONE]\n\n");

export function createSSEStream(
  deltas: () => AsyncGenerator<string, void, unknown>
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const delta of deltas()) {
          if (delta) controller.enqueue(frame({ delta }));
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown streaming error";
        controller.enqueue(frame({ error: message }));
      } finally {
        controller.enqueue(DONE); // <- the client always sees a terminator
        controller.close();
      }
    },
  });
}
```

That `finally` is the quietly important line. A provider can blow up halfway through a response — rate limit, dropped socket, malformed chunk — and the browser still receives a clean `error` frame followed by `[DONE]`. The client's read loop never hangs waiting for an end that never comes. **Error handling becomes a property of the transport, not something every provider re-implements.**

Now each provider only has to answer one question: *given the upstream response, what text do I yield?*

## Four providers, one file

OpenAI, Mistral, Groq and Azure speak the same Chat Completions dialect, so they share a single implementation. Callers pass only the endpoint and auth headers:

```ts
export async function openAICompatibleChat(
  request: ChatRequest,
  endpoint: string,
  headers: Record<string, string>
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ model: request.model, messages: request.messages, stream: true }),
  });
  if (!res.ok) throw new ProviderError(`Provider returned ${res.status}: ${await readErrorBody(res)}`, res.status);

  return createSSEStream(async function* () {
    for await (const data of readSSELines(res)) {     // yields the text after `data: `
      if (data === "[DONE]") return;
      try {
        const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) yield delta;
      } catch {
        /* ignore keep-alive / non-JSON lines */
      }
    }
  });
}
```

`openaiProvider`, `mistralProvider`, `groqProvider` and `azureProvider` are now three-line wrappers that supply a URL and a header. Adding the next OpenAI-compatible provider is a one-liner.

## The two oddballs — same output, different innards

**Anthropic** needs the system prompt hoisted out of the messages array, and it filters typed events instead of reading a single field:

```ts
return createSSEStream(async function* () {
  for await (const data of readSSELines(res)) {
    if (!data || data === "[DONE]") continue;
    try {
      const json = JSON.parse(data);
      if (json?.type === "content_block_delta" && json?.delta?.type === "text_delta") {
        if (typeof json.delta.text === "string" && json.delta.text) yield json.delta.text;
      }
    } catch { /* ignore event-name lines */ }
  }
});
```

(One Anthropic-specific gotcha worth knowing if you ever call their API from a server acting as a browser-origin proxy: you need the `anthropic-dangerous-direct-browser-access: true` header, otherwise it refuses the request.)

**Ollama** isn't SSE, so it reads raw byte chunks and splits NDJSON lines itself — but it still yields plain text into the *exact same* `createSSEStream`:

```ts
return createSSEStream(async function* () {
  let buffer = "";
  for await (const chunk of readRawChunks(res)) {   // raw decoded bytes
    buffer += chunk;
    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        const content = JSON.parse(line)?.message?.content;
        if (typeof content === "string" && content) yield content;
      } catch { /* partial line */ }
    }
  }
});
```

Two completely different transports — typed SSE events vs. line-delimited JSON — converge on the same output contract. The browser can't tell them apart, which was the entire goal.

## Dispatch is boring on purpose

With every provider producing the same stream type, the router is a lookup table:

```ts
const PROVIDERS: Record<ProviderKey, Provider> = {
  openai: openaiProvider, anthropic: anthropicProvider, gemini: geminiProvider,
  ollama: ollamaProvider, mistral: mistralProvider, groq: groqProvider, azure: azureProvider,
};

export async function chat(request: ChatRequest): Promise<ReadableStream<Uint8Array>> {
  const provider = PROVIDERS[request.provider];
  if (!provider) throw new ProviderError(`Unknown provider: ${request.provider}`, 400);
  return provider.chat(request);
}
```

Boring dispatch is the reward for pushing the variation into the generators. Adding a provider touches one file and one table row, and the client never changes.

## The part that surprises people: there's no backend to speak of

Because the key constraint was *the user brings their own key*, there is **no database, no auth, and no server-side secret**. The flow is:

1. The key lives in the browser's `localStorage`.
2. It's sent in the body of a single `POST /api/run`.
3. The route uses it for exactly one upstream `fetch`, streams the result back, and discards it.

The server is a pure pass-through proxy. Nothing about a user persists anywhere. That makes the app trivially self-hostable (one-click deploy, zero env vars to configure) and sidesteps a whole category of "where are you storing my key" questions — the honest answer is "we're not."

## Bonus: 999 pages without 999 files

The app ships a large library of consultant prompt templates. They are **not** hand-written files. Each one is a row in a flat metadata table, resolved at load time into a full object — falling back to a generic prompt builder unless a per-id override supplies a hand-tuned form:

```ts
function resolveAgent(meta: AgentMeta): Agent {
  const override = AGENT_OVERRIDES[meta.id] ?? {};
  const inputs = override.inputs ?? DEFAULT_INPUTS;
  const prompt =
    override.prompt ??
    ((values, lang) => buildPrompt(meta, inputs, values, lang));
  return { ...meta, inputs, prompt, model: override.model, stream: true };
}
```

Every page is statically pre-rendered at build time from that table. The "override only when you need to" pattern means the long tail costs nothing while the important ones get bespoke treatment — the same philosophy as the provider layer: **one generic path, opt into specialization.**

## Takeaways

- Model each integration as **a generator of the thing you actually want** (text deltas), and wrap it *once* with the transport + termination guarantee. Variation goes in the generators; everything downstream stays uniform.
- Put error-and-termination handling in the wrapper's `finally`, so a misbehaving upstream can never hang the client.
- "Bring your own key" isn't just a privacy stance — it deletes your entire secrets-and-storage surface and makes self-hosting free.
- Collapse the same-shaped integrations into one implementation; give the genuinely different ones their own parser but force them through the same output contract.

The code is open source (MIT). Happy to answer anything about the provider layer or the data-driven generation in the comments.

> Repo: https://github.com/mltech-ai-tw/agents-999 · Live demo: https://agents-999.vercel.app
