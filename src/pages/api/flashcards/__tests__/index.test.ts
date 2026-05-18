// Najpierw definiujemy mocki (przed importami)
vi.mock("../index");
vi.mock("../../../../lib/services/flashcards.service");
vi.mock("../../../../lib/services/logger.service", () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));
vi.mock("../../../../lib/services/auth.service", () => ({
  checkAuthorization: vi.fn().mockImplementation((locals) => {
    if (locals.authorized === false) {
      return {
        authorized: false,
        response: new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      };
    }
    return {
      authorized: true,
      userId: locals.userId || "test-user-id",
    };
  }),
}));
// Mockujemy konfigurację OpenRouter, aby uniknąć błędów walidacji zmiennych środowiskowych
vi.mock("../../../../lib/config/openrouter.config", () => ({
  openRouterConfig: {
    apiKey: "test-api-key",
    baseUrl: "https://api.example.com",
    defaultModel: "test-model",
  },
}));

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../index";
import type { APIContext } from "astro";
import {
  createMockContext,
  testUnauthorizedRequest,
  testInvalidContentType,
  testInvalidJson,
  testValidationError,
} from "../../../../../tests/utils/api-test-utils";

describe("GET /api/flashcards", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    // Act & Assert
    await testUnauthorizedRequest(GET);
  });

  it("powinien zwrócić 400, gdy parametry zapytania są nieprawidłowe", async () => {
    // Arrange
    const request = new Request("https://example.com/api/flashcards?limit=invalid");
    const mockContext = createMockContext({
      request,
    }) as unknown as APIContext;

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("powinien zwrócić 200 i listę fiszek", async () => {
    // Arrange
    const request = new Request("https://example.com/api/flashcards?limit=10&offset=0&topic_id=test-topic-1");
    const mockContext = createMockContext({
      request,
    }) as unknown as APIContext;

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("flashcards");
    expect(data).toHaveProperty("total_count");
    expect(Array.isArray(data.flashcards)).toBe(true);
    expect(data.flashcards.length).toBeGreaterThan(0);
  });

  it("powinien zwrócić 500, gdy wystąpi błąd podczas pobierania fiszek", async () => {
    // Arrange
    const request = new Request("https://example.com/api/flashcards?limit=error");
    const mockContext = createMockContext({
      request,
    }) as unknown as APIContext;

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
  });
});

describe("POST /api/flashcards", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    // Act & Assert
    await testUnauthorizedRequest(POST);
  });

  it("powinien zwrócić 415, gdy Content-Type nie jest application/json", async () => {
    // Act & Assert
    await testInvalidContentType(POST, "https://example.com/api/flashcards");
  });

  it("powinien zwrócić 400, gdy body nie jest prawidłowym JSON", async () => {
    // Act & Assert
    await testInvalidJson(POST, "https://example.com/api/flashcards");
  });

  it("powinien zwrócić 400, gdy brakuje wymaganych pól", async () => {
    // Act & Assert
    await testValidationError(POST, { front_original: "Pytanie" }, "https://example.com/api/flashcards");
  });

  it("powinien zwrócić 201 i utworzyć fiszkę", async () => {
    // Arrange
    const flashcardData = {
      document_id: "test-doc-id",
      topic_id: "test-topic-id",
      front_original: "Pytanie testowe",
      back_original: "Odpowiedź testowa",
    };

    const request = new Request("https://example.com/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flashcardData),
    });

    const mockContext = createMockContext({
      request,
    }) as unknown as APIContext;

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("front_original", flashcardData.front_original);
    expect(data).toHaveProperty("back_original", flashcardData.back_original);
    expect(data).toHaveProperty("document_id", flashcardData.document_id);
    expect(data).toHaveProperty("topic_id", flashcardData.topic_id);
    expect(data).toHaveProperty("user_id", "test-user-id");
  });

  it("powinien zwrócić 500, gdy wystąpi błąd podczas tworzenia fiszki", async () => {
    // Arrange
    const flashcardData = {
      document_id: "test-doc-id",
      topic_id: "test-topic-id",
      front_original: "ERROR", // Używamy wartości "ERROR" do zasymulowania błędu
      back_original: "Odpowiedź testowa",
    };

    const request = new Request("https://example.com/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flashcardData),
    });

    const mockContext = createMockContext({
      request,
    }) as unknown as APIContext;

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
  });
});
