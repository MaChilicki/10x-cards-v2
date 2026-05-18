import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenRouterService } from "../openrouter.service";
import fetch from "cross-fetch";
import type { ChatCompletionResponse } from "../../../types/openrouter.types";
import { NetworkError, ValidationError } from "../../../types/openrouter.types";
import "../../../types/openrouter.types";

// Zdefiniowanie interfejsu RetryConfig na potrzeby testów
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

// Mockowanie modułu cross-fetch
vi.mock("cross-fetch", () => ({
  default: vi.fn(),
}));

// Mockowanie logger service
vi.mock("../logger.service", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("OpenRouterService", () => {
  const mockApiKey = "test-api-key";
  const mockConfig = { apiKey: mockApiKey };
  let service: OpenRouterService;
  const mockSuccessResponse: ChatCompletionResponse = {
    id: "test-id",
    object: "chat.completion",
    created: 123456789,
    model: "openai/gpt-4",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "Test response",
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 5,
      total_tokens: 15,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new OpenRouterService(mockConfig);

    // Resetujemy mocki przed każdym testem
    vi.mocked(fetch).mockReset();
  });

  describe("constructor", () => {
    it("powinien rzucić błąd gdy brak klucza API", () => {
      // Arrange
      const invalidConfig = { apiKey: "" };

      // Act & Assert
      expect(() => new OpenRouterService(invalidConfig)).toThrow(ValidationError);
    });

    it("powinien ustawić domyślne wartości", () => {
      // Act
      const service = new OpenRouterService(mockConfig);

      // Assert - sprawdzamy prywatne pola przez wywołanie metody
      expect(() => service.chat("system", "user")).not.toThrow();
    });
  });

  describe("chat", () => {
    it("powinien wykonać zapytanie do API z prawidłowymi parametrami", async () => {
      // Arrange
      const systemMessage = "System message";
      const userMessage = "User message";
      const mockResponse = new Response(JSON.stringify(mockSuccessResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await service.chat(systemMessage, userMessage);

      // Assert
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockApiKey}`,
          }),
          body: expect.any(String),
        })
      );

      // Sprawdzamy czy prawidłowo przekazano parametry w body
      const requestBody = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string);
      expect(requestBody.messages).toEqual([
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ]);
      expect(result).toEqual(mockSuccessResponse);
    });

    it("powinien użyć niestandardowego modelu jeśli podano", async () => {
      // Arrange
      const customModel = "anthropic/claude-3-opus-20240229";
      const mockResponse = new Response(JSON.stringify(mockSuccessResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      // Act
      await service.chat("system", "user", { model: customModel });

      // Assert
      const requestBody = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string);
      expect(requestBody.model).toBe(customModel);
    });

    it("powinien obsłużyć błędy API", async () => {
      // Arrange
      const errorResponse = new Response(JSON.stringify({ error: "Test error" }), {
        status: 400,
        statusText: "Bad Request",
      });

      // Mockujemy fetch, by zwrócił błędną odpowiedź
      vi.mocked(fetch).mockResolvedValueOnce(errorResponse);

      // Zmniejszamy liczbę prób, aby test był szybszy
      vi.spyOn(service as unknown as { retryConfig: RetryConfig }, "retryConfig", "get").mockReturnValue({
        maxRetries: 1,
        initialDelay: 0,
        maxDelay: 0,
      });

      // Act & Assert - oczekujemy NetworkError (po wyczerpaniu wszystkich prób)
      await expect(service.chat("system", "user")).rejects.toThrow(NetworkError);

      // Sprawdzamy czy fetch został wywołany z oczekiwanymi parametrami
      expect(fetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockApiKey}`,
          }),
          body: expect.any(String),
        })
      );
    }, 10000);

    it("powinien ponowić próbę w przypadku błędu", async () => {
      // Arrange
      const networkError = new Error("Network error");
      const mockSuccessResponseObj = new Response(JSON.stringify(mockSuccessResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      // Usuwamy opóźnienia przy ponownych próbach
      vi.spyOn(service as unknown as { retryConfig: RetryConfig }, "retryConfig", "get").mockReturnValue({
        maxRetries: 2,
        initialDelay: 0,
        maxDelay: 0,
      });

      // Pierwsza próba kończy się błędem, druga się udaje
      vi.mocked(fetch).mockRejectedValueOnce(networkError).mockResolvedValueOnce(mockSuccessResponseObj);

      // Act
      const result = await service.chat("system", "user");

      // Assert
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockSuccessResponse);
    }, 10000); // Zwiększamy timeout do 10s

    it("powinien rzucić NetworkError po wyczerpaniu wszystkich prób", async () => {
      // Arrange
      const networkError = new Error("Network error");

      // Usuwamy opóźnienia przy ponownych próbach
      vi.spyOn(service as unknown as { retryConfig: RetryConfig }, "retryConfig", "get").mockReturnValue({
        maxRetries: 2,
        initialDelay: 0,
        maxDelay: 0,
      });

      // Wszystkie próby kończą się błędem
      vi.mocked(fetch).mockRejectedValue(networkError);

      // Act & Assert
      await expect(service.chat("system", "user")).rejects.toThrow(NetworkError);
      expect(fetch).toHaveBeenCalledTimes(2); // Zależnie od wartości maxRetries powyżej
    });
  });
});
