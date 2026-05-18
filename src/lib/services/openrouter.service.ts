import fetch from "cross-fetch";
import type { ChatCompletionResponse, ChatMessage, ChatParams, OpenRouterConfig } from "../../types/openrouter.types";
import { ApiError, NetworkError, ValidationError } from "../../types/openrouter.types";
import { logger } from "./logger.service";

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

export class OpenRouterService {
  private readonly config: OpenRouterConfig;
  private readonly defaultParams: Omit<ChatParams, "model" | "messages"> = {
    parameter: 1.0,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  };
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
  };

  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      throw new ValidationError("Brak klucza API");
    }

    this.config = {
      ...config,
      baseUrl: config.baseUrl ?? "https://openrouter.ai/api/v1",
      defaultModel: config.defaultModel ?? "openai/gpt-4",
    };
  }

  private async sendRequestWithRetry(payload: ChatParams): Promise<ChatCompletionResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new ApiError(`OpenRouter API error: ${response.statusText}`, response.status);
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(`Próba ${attempt + 1}/${this.retryConfig.maxRetries} nie powiodła się: ${lastError.message}`);

        if (attempt < this.retryConfig.maxRetries - 1) {
          const delay = Math.min(this.retryConfig.initialDelay * Math.pow(2, attempt), this.retryConfig.maxDelay);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new NetworkError(`Wszystkie próby nie powiodły się: ${lastError?.message}`);
  }

  public async chat(
    systemMessage: string,
    userMessage: string,
    params?: Partial<Omit<ChatParams, "model">> & Partial<Pick<ChatParams, "model">>
  ): Promise<ChatCompletionResponse> {
    const messages: ChatMessage[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ];

    const payload: ChatParams = {
      model: params?.model ?? this.config.defaultModel ?? "openai/gpt-4",
      messages,
      ...this.defaultParams,
      ...params,
    };

    return this.sendRequestWithRetry(payload);
  }
}
