import type { Provider } from "../llm/types";
import { ProviderError } from "../llm/types";
import { openAICompatibleChat } from "./openai-compat";

export const mistralProvider: Provider = {
  chat(request) {
    if (!request.apiKey) throw new ProviderError("Missing Mistral API key", 401);
    return openAICompatibleChat(
      request,
      "https://api.mistral.ai/v1/chat/completions",
      { Authorization: `Bearer ${request.apiKey}` }
    );
  },
};
