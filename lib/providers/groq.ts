import type { Provider } from "../llm/types";
import { ProviderError } from "../llm/types";
import { openAICompatibleChat } from "./openai-compat";

export const groqProvider: Provider = {
  chat(request) {
    if (!request.apiKey) throw new ProviderError("Missing Groq API key", 401);
    return openAICompatibleChat(
      request,
      "https://api.groq.com/openai/v1/chat/completions",
      { Authorization: `Bearer ${request.apiKey}` }
    );
  },
};
