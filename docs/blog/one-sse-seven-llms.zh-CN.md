# 一条 SSE 流，七个大模型供应商：让前端只写一套流式代码

> OpenAI、Claude、Gemini、Ollama、Mistral、Groq、Azure —— 七家流式接口长得完全不一样。这篇讲我怎么把它们在浏览器端收敛成「一套解析逻辑」，而且没有数据库、没有后端密钥，用户的 API Key 只在单次请求里存活。

---

我做了个开源的 Next.js 小应用：用户选一个大模型供应商，填自己的 API Key，然后流式拿到回答。UI 不是重点，真正有意思的是我一开始定下的约束：

> **不管选哪个供应商，前端只能有一套流式代码，绝不允许 `if (provider === ...)` 的判断链。**

听起来理所当然，直到你真去看这些接口怎么流式输出 —— 它们在传输方式、分块结构、system prompt 放哪、流怎么结束，几乎全都不一样。这篇就讲我怎么把这堆差异塞进一个统一契约里。

## 先看你实际要面对的烂摊子

光是我想支持的这几家，就有三种流式「方言」：

- **OpenAI / Mistral / Groq / Azure** —— SSE，每行 `data: {…}`，正文在 `choices[0].delta.content`，结尾是字面量 `data: [DONE]`。
- **Anthropic** —— 也是 SSE，但 system prompt 是**顶层独立字段**（不是一条 message），而且增量是带类型的事件：你只要 `type === "content_block_delta"` 且 `delta.type === "text_delta"` 的那些。
- **Ollama（本地）** —— 根本不是 SSE，是 **NDJSON**：一行一个 JSON，正文在 `message.content`，以 `{done:true}` 收尾，无需 Key，跑在 `localhost:11434`。

只要这些差异漏到前端，你就会有三个解析器，外加一条每接一个新供应商就变长的 `if-else`。我要的是反过来：浏览器永远只解析**一种**格式。

## 统一契约

每个供应商不管上游长啥样，回给浏览器的永远是这个：

```
data: {"delta":"<文本块>"}\n\n   ... 重复
data: {"error":"<错误信息>"}\n\n  ... 失败时
data: [DONE]\n\n                 ... 永远收尾
```

浏览器只需要认三样东西：`delta`、`error`、`[DONE]`。整个前端协议就这么点。

## 关键招：把「一个产文本的生成器」变成「一定会正确结束的 SSE 流」

让后面一切变简单的核心技巧，是把每个供应商表达成**一个 yield 纯文本增量的 async generator**，再统一包一层。这层包装同时负责线格式**和**「流一定会结束」的保证 —— 哪怕上游在中途抛错：

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
        controller.enqueue(DONE); // <- 客户端永远能收到结束标记
        controller.close();
      }
    },
  });
}
```

那个 `finally` 是最不起眼但最重要的一行。供应商可能在回答到一半时炸掉 —— 限流、断连、分块格式错误 —— 浏览器依然能收到一个干净的 `error` 帧加 `[DONE]`，客户端的读取循环永远不会卡在「等一个永远不来的结尾」。**错误处理变成了传输层的固有属性，而不是每个供应商各写一遍的东西。**

现在每个供应商只需回答一个问题：*给定上游响应，我该 yield 出哪些文本？*

## 四个供应商，一个文件

OpenAI、Mistral、Groq、Azure 说的是同一种 Chat Completions 方言，所以共用一份实现，调用方只传 endpoint 和鉴权头：

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
    for await (const data of readSSELines(res)) {     // yield 出 `data: ` 后面的文本
      if (data === "[DONE]") return;
      try {
        const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) yield delta;
      } catch {
        /* 忽略心跳 / 非 JSON 行 */
      }
    }
  });
}
```

于是 `openaiProvider`、`mistralProvider`、`groqProvider`、`azureProvider` 都成了三行的小包装，只负责提供 URL 和一个 header。再接下一个 OpenAI 兼容供应商？一行的事。

## 两个异类 —— 输出一致，内部各异

**Anthropic** 要把 system prompt 从 messages 里拎出来，而且是过滤带类型的事件，而不是读单一字段：

```ts
return createSSEStream(async function* () {
  for await (const data of readSSELines(res)) {
    if (!data || data === "[DONE]") continue;
    try {
      const json = JSON.parse(data);
      if (json?.type === "content_block_delta" && json?.delta?.type === "text_delta") {
        if (typeof json.delta.text === "string" && json.delta.text) yield json.delta.text;
      }
    } catch { /* 忽略事件名行 */ }
  }
});
```

（一个 Anthropic 专属的坑：如果你用服务端当「浏览器源」的代理去调它的接口，必须带上 `anthropic-dangerous-direct-browser-access: true` 这个头，否则会被拒。）

**Ollama** 不是 SSE，所以它读原始字节块、自己切 NDJSON 行 —— 但它依然把纯文本 yield 进**同一个** `createSSEStream`：

```ts
return createSSEStream(async function* () {
  let buffer = "";
  for await (const chunk of readRawChunks(res)) {   // 原始解码字节
    buffer += chunk;
    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        const content = JSON.parse(line)?.message?.content;
        if (typeof content === "string" && content) yield content;
      } catch { /* 半行 */ }
    }
  }
});
```

两种完全不同的传输 —— 带类型的 SSE 事件 vs 行分隔 JSON —— 收敛到同一个输出契约。浏览器分不出它俩，这正是整件事的目标。

## 分发逻辑，故意写得很无聊

当每个供应商都产出同一种流类型后，路由就是一张查找表：

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

无聊的分发，是把变化都推进生成器里换来的回报。加一个供应商只动一个文件加一行表，前端永远不变。

## 让人意外的部分：几乎没有后端

因为核心约束是*用户自带 Key*，所以**没有数据库、没有鉴权、没有任何服务端密钥**。流程是：

1. Key 存在浏览器 `localStorage`。
2. 在单次 `POST /api/run` 的 body 里发出去。
3. 路由用它发**恰好一次**上游 `fetch`，把结果流式回传，然后丢弃。

服务端就是一个纯透传代理，用户的任何东西都不落地。这让应用极易自托管（一键部署、零环境变量要配），也绕开了一整类「你把我的 Key 存哪了」的问题 —— 诚实的答案是「我们不存」。

## 附带：999 个页面，不用 999 个文件

应用内置了一大批顾问类 prompt 模板。它们**不是**手写文件，而是一张扁平元数据表里的行，在加载时解析成完整对象 —— 除非某个 id 有覆写提供定制表单，否则回退到一个通用 prompt 构造器：

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

每个页面都在构建时从这张表静态预渲染。「需要时才覆写」的模式意味着长尾零成本，重要的那些拿到定制待遇 —— 和供应商层是同一套哲学：**一条通用路径，按需选择特化。**

## 几点收获

- 把每个集成建模成**「你真正想要的东西」的生成器**（文本增量），然后只包一次传输层 + 结束保证。变化进生成器，下游全都统一。
- 把错误与结束处理放进包装层的 `finally`，这样行为不端的上游永远卡不死客户端。
- 「自带 Key」不只是隐私姿态 —— 它直接删掉你整个密钥与存储面，让自托管变免费。
- 同形状的集成合并成一份实现；真正不同的给它自己的解析器，但强制走同一个输出契约。

代码开源（MIT）。供应商层或数据驱动生成有任何问题，欢迎评论区聊。

> 仓库：https://github.com/mltech-ai-tw/agents-999 · 在线 Demo：https://agents-999.vercel.app
