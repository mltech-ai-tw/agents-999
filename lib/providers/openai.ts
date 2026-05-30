import type { Provider } from "../llm/types";
import { ProviderError } from "../llm/types";
import { openAICompatibleChat } from "./openai-compat";

export const openaiProvider: Provider = {
  chat(request) {
    if (!request.apiKey) throw new ProviderError("Missing OpenAI API key", 401);
    return openAICompatibleChat(
      request,
      "https://api.openai.com/v1/chat/completions",
      { Authorization: `Bearer ${request.apiKey}` }
    );
  },
};
