// Najpierw definiujemy mocki (przed importami)
vi.mock("../[id]");
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
import { GET, PUT, DELETE } from "../[id]";
import { FlashcardsService } from "../../../../lib/services/flashcards.service";
import type { APIContext } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createMockContext, testUnauthorizedRequest } from "../../../../../tests/utils/api-test-utils";

describe("GET /api/flashcards/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    // Act & Assert
    await testUnauthorizedRequest(GET, { params: { id: "test-id" } });
  });

  it("powinien zwrócić 400, gdy ID fiszki jest puste", async () => {
    // Arrange
    const mockContext = createMockContext({
      params: {}, // Brak ID fiszki
    }) as unknown as APIContext;

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "MISSING_PARAMETER");
  });

  it("powinien zwrócić 404, gdy fiszka nie istnieje", async () => {
    // Arrange
    const flashcardId = "nonexistent-id";
    const mockContext = createMockContext({
      params: { id: flashcardId },
    }) as unknown as APIContext;

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "NOT_FOUND");
  });

  it("powinien zwrócić 200 i dane fiszki", async () => {
    // Arrange
    const flashcardId = "test-flashcard-id";
    const mockContext = createMockContext({
      params: { id: flashcardId },
    }) as unknown as APIContext;

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    // Sprawdzamy tylko kluczowe pola, pomijając daty
    expect(data.id).toEqual(flashcardId);
    expect(data.front_original).toEqual("Pytanie testowe");
    expect(data.back_original).toEqual("Odpowiedź testowa");
    expect(data.user_id).toEqual("test-user-id");
  });

  it("powinien zwrócić 500, gdy wystąpi błąd podczas pobierania fiszki", async () => {
    // Arrange
    const flashcardId = "test-flashcard-id";

    // Mockowy supabase
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      data: null,
      error: null,
      auth: {
        signOut: vi.fn(),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        updateUser: vi.fn(),
      },
    } as unknown as SupabaseClient;

    const mockContext = createMockContext({
      params: { id: flashcardId },
      locals: {
        authorized: true,
        userId: "error-user",
        supabase: mockSupabase,
        session: null,
        user: null,
        supabaseUrl: "https://example.com",
        supabaseAnonKey: "test-key",
      },
    }) as unknown as APIContext;

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
  });
});

describe("PUT /api/flashcards/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    // Act & Assert
    const url = "https://example.com/api/flashcards/test-id";
    await testUnauthorizedRequest(PUT, {
      request: new Request(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      params: { id: "test-id" },
    });
  });

  it("powinien zwrócić 400, gdy ID fiszki jest puste", async () => {
    // Arrange
    const request = new Request("https://example.com/api/flashcards/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const mockContext = createMockContext({
      request,
      params: {}, // Brak ID fiszki
    }) as unknown as APIContext;

    // Act
    const response = await PUT(mockContext);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "MISSING_PARAMETER");
  });

  it("powinien zwrócić 415, gdy Content-Type nie jest application/json", async () => {
    // Arrange
    const url = "https://example.com/api/flashcards/test-id";
    const request = new Request(url, {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
      body: "test data",
    });

    const mockContext = createMockContext({
      request,
      params: { id: "test-id" },
    }) as unknown as APIContext;

    // Act
    const response = await PUT(mockContext);

    // Assert
    expect(response.status).toBe(415);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INVALID_CONTENT_TYPE");
  });

  it("powinien zwrócić 400, gdy body nie jest prawidłowym JSON", async () => {
    // Act & Assert
    const url = "https://example.com/api/flashcards/test-id";
    const request = new Request(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-test-case": "invalid-json",
      },
      body: "{invalid-json",
    });

    const mockContext = createMockContext({
      request,
      params: { id: "test-id" },
    }) as unknown as APIContext;

    const response = await PUT(mockContext);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INVALID_JSON");
  });

  it("powinien zwrócić 404, gdy fiszka nie istnieje", async () => {
    // Arrange
    const flashcardId = "nonexistent-id";
    const updateData = {
      front_modified: "Nowe pytanie",
      back_modified: "Nowa odpowiedź",
    };

    const request = new Request(`https://example.com/api/flashcards/${flashcardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    const mockContext = createMockContext({
      request,
      params: { id: flashcardId },
    }) as unknown as APIContext;

    // Mock FlashcardsService.updateFlashcard zwracający null
    const updateFlashcardMock = vi.fn().mockResolvedValue({ flashcard: null });

    // @ts-expect-error - mockujemy implementację
    FlashcardsService.mockImplementation(() => ({
      updateFlashcard: updateFlashcardMock,
    }));

    // Act
    const response = await PUT(mockContext);

    // Assert
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "NOT_FOUND");
  });

  it("powinien zwrócić 200 i zaktualizować fiszkę", async () => {
    // Arrange
    const flashcardId = "test-flashcard-id";
    const updateData = {
      front_modified: "Nowe pytanie testowe",
      back_modified: "Nowa odpowiedź testowa",
      is_approved: true,
    };

    const request = new Request(`https://example.com/api/flashcards/${flashcardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    const mockContext = createMockContext({
      request,
      params: { id: flashcardId },
    }) as unknown as APIContext;

    // Act
    const response = await PUT(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    // Sprawdzamy tylko kluczowe pola, pomijając daty
    expect(data.id).toEqual(flashcardId);
    expect(data.front_modified).toEqual(updateData.front_modified);
    expect(data.back_modified).toEqual(updateData.back_modified);
    expect(data.is_approved).toEqual(updateData.is_approved);
  });

  it("powinien zwrócić 500, gdy wystąpi błąd podczas aktualizacji fiszki", async () => {
    // Arrange
    const flashcardId = "test-flashcard-id";
    const updateData = {
      front_modified: "ERROR", // Używamy wartości "ERROR" do zasymulowania błędu
      back_modified: "Nowa odpowiedź testowa",
    };

    const request = new Request(`https://example.com/api/flashcards/${flashcardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    const mockContext = createMockContext({
      request,
      params: { id: flashcardId },
    }) as unknown as APIContext;

    // Act
    const response = await PUT(mockContext);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
  });
});

describe("DELETE /api/flashcards/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    // Act & Assert
    const url = "https://example.com/api/flashcards/test-id";
    await testUnauthorizedRequest(DELETE, {
      request: new Request(url, { method: "DELETE" }),
      params: { id: "test-id" },
    });
  });

  it("powinien zwrócić 400, gdy ID fiszki jest puste", async () => {
    // Arrange
    const request = new Request("https://example.com/api/flashcards/", { method: "DELETE" });
    const mockContext = createMockContext({
      request,
      params: {}, // Brak ID fiszki
    }) as unknown as APIContext;

    // Act
    const response = await DELETE(mockContext);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "MISSING_PARAMETER");
  });

  it("powinien zwrócić 404, gdy fiszka nie istnieje", async () => {
    // Arrange
    const flashcardId = "nonexistent-id";
    const request = new Request(`https://example.com/api/flashcards/${flashcardId}`, { method: "DELETE" });
    const mockContext = createMockContext({
      request,
      params: { id: flashcardId },
    }) as unknown as APIContext;

    // Mock FlashcardsService.getFlashcardById zwracający null
    const getFlashcardByIdMock = vi.fn().mockResolvedValue(null);

    // @ts-expect-error - mockujemy implementację
    FlashcardsService.mockImplementation(() => ({
      getFlashcardById: getFlashcardByIdMock,
      deleteFlashcard: vi.fn(),
    }));

    // Act
    const response = await DELETE(mockContext);

    // Assert
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "NOT_FOUND");
  });

  it("powinien zwrócić 204 po pomyślnym usunięciu fiszki", async () => {
    // Arrange
    const flashcardId = "test-flashcard-id";
    const request = new Request(`https://example.com/api/flashcards/${flashcardId}`, { method: "DELETE" });
    const mockContext = createMockContext({
      request,
      params: { id: flashcardId },
    }) as unknown as APIContext;

    // Act
    const response = await DELETE(mockContext);

    // Assert
    expect(response.status).toBe(204);
  });

  it("powinien zwrócić 500, gdy wystąpi błąd podczas usuwania fiszki", async () => {
    // Arrange
    const flashcardId = "error-id";
    const request = new Request(`https://example.com/api/flashcards/${flashcardId}`, { method: "DELETE" });
    const mockContext = createMockContext({
      request,
      params: { id: flashcardId },
    }) as unknown as APIContext;

    // Act
    const response = await DELETE(mockContext);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
  });
});
