import type { Provider } from "../llm/types";
import { ProviderError } from "../llm/types";
import { openAICompatibleChat } from "./openai-compat";

const API_VERSION = "2024-02-01";

/**
 * Azure OpenAI. `baseUrl` must be the resource endpoint
 * (e.g. https://my-resource.openai.azure.com) and `model` is the deployment
 * name. The api-key goes in the `api-key` header.
 */
export const azureProvider: Provider = {
  chat(request) {
    if (!request.apiKey) throw new ProviderError("Missing Azure API key", 401);
    if (!request.baseUrl)
      throw new ProviderError("Missing Azure endpoint (baseUrl)", 400);

    const endpoint =
      `${request.baseUrl.replace(/\/$/, "")}/openai/deployments/` +
      `${encodeURIComponent(request.model)}/chat/completions?api-version=${API_VERSION}`;

    return openAICompatibleChat(request, endpoint, { "api-key": request.apiKey });
  },
};
