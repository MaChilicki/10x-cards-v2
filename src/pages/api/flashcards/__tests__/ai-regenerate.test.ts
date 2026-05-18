import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../ai-regenerate";
import { AiGenerateService } from "../../../../lib/services/ai-generate.service";
import type { APIContext } from "astro";
import type { SupabaseClient } from "@/db/supabase.client";

// Najpierw definiujemy mocki (przed importami)
vi.mock("../ai-regenerate");
vi.mock("../../../../lib/services/ai-generate.service");
vi.mock("../../../../lib/services/logger.service", () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));
// Mockujemy konfigurację OpenRouter, aby uniknąć błędów walidacji zmiennych środowiskowych
vi.mock("../../../../lib/config/openrouter.config", () => ({
  openRouterConfig: {
    apiKey: "test-api-key",
    baseUrl: "https://api.example.com",
    defaultModel: "test-model",
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

describe("POST /api/flashcards/ai-regenerate", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    // Arrange
    const request = new Request("https://example.com/api/flashcards/ai-regenerate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    } as unknown as SupabaseClient;

    const mockContext = {
      request,
      locals: {
        authorized: false,
        supabase: mockSupabase,
      },
      params: {},
    } as unknown as APIContext;

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("powinien zwrócić 415, gdy Content-Type nie jest application/json", async () => {
    // Arrange
    const request = new Request("https://example.com/api/flashcards/ai-regenerate", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: "test",
    });

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    } as unknown as SupabaseClient;

    const mockContext = {
      request,
      locals: {
        authorized: true,
        userId: "test-user-id",
        supabase: mockSupabase,
      },
      params: {},
    } as unknown as APIContext;

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(415);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INVALID_CONTENT_TYPE");
  });

  it("powinien zwrócić 400, gdy body nie jest prawidłowym JSON", async () => {
    // Arrange
    const request = new Request("https://example.com/api/flashcards/ai-regenerate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{invalid-json",
    });

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    } as unknown as SupabaseClient;

    const mockContext = {
      request,
      locals: {
        authorized: true,
        userId: "test-user-id",
        supabase: mockSupabase,
      },
      params: {},
    } as unknown as APIContext;

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INVALID_JSON");
  });

  it("powinien zwrócić 400, gdy dane nie przechodzą walidacji", async () => {
    // Arrange
    const request = new Request("https://example.com/api/flashcards/ai-regenerate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invalid: "data" }), // Brak wymaganych pól
    });

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    } as unknown as SupabaseClient;

    const mockContext = {
      request,
      locals: {
        authorized: true,
        userId: "test-user-id",
        supabase: mockSupabase,
      },
      params: {},
    } as unknown as APIContext;

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("powinien zwrócić 200 i zregenerować fiszki z dokumentu", async () => {
    // Arrange
    const requestData = {
      document_id: "test-document-id",
      topic_id: "test-topic-id",
    };

    const mockResult = {
      flashcards: [
        {
          front_original: "Regenerowane pytanie 1",
          back_original: "Regenerowana odpowiedź 1",
          topic_id: "test-topic-id",
          document_id: "test-document-id",
          source: "ai",
          is_approved: false,
        },
        {
          front_original: "Regenerowane pytanie 2",
          back_original: "Regenerowana odpowiedź 2",
          topic_id: "test-topic-id",
          document_id: "test-document-id",
          source: "ai",
          is_approved: false,
        },
      ],
      deleted_count: 3,
    };

    const request = new Request("https://example.com/api/flashcards/ai-regenerate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

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

    const mockContext = {
      request,
      locals: {
        supabase: mockSupabase,
        authorized: true,
        userId: "test-user-id",
        session: null,
        user: null,
        supabaseUrl: "https://example.com",
        supabaseAnonKey: "test-key",
      },
      params: {},
    } as unknown as APIContext;

    // Mock AiGenerateService.regenerateFlashcards
    const regenerateFlashcardsMock = vi.fn().mockResolvedValue(mockResult);

    // @ts-expect-error - mockujemy implementację
    AiGenerateService.mockImplementation(() => ({
      regenerateFlashcards: regenerateFlashcardsMock,
    }));

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockResult);
    expect(regenerateFlashcardsMock).toHaveBeenCalledWith(requestData);
  });

  it("powinien zwrócić 200 i zregenerować fiszki z podanego tekstu", async () => {
    // Arrange
    const requestData = {
      text: "Tekst do regeneracji fiszek",
      topic_id: "test-topic-id",
    };

    const mockResult = {
      flashcards: [
        {
          front_original: "Regenerowane pytanie z tekstu",
          back_original: "Regenerowana odpowiedź z tekstu",
          topic_id: "test-topic-id",
          source: "ai",
          is_approved: false,
        },
      ],
      deleted_count: 0,
    };

    const request = new Request("https://example.com/api/flashcards/ai-regenerate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

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

    const mockContext = {
      request,
      locals: {
        supabase: mockSupabase,
        authorized: true,
        userId: "test-user-id",
        session: null,
        user: null,
        supabaseUrl: "https://example.com",
        supabaseAnonKey: "test-key",
      },
      params: {},
    } as unknown as APIContext;

    // Mock AiGenerateService.regenerateFlashcards
    const regenerateFlashcardsMock = vi.fn().mockResolvedValue(mockResult);

    // @ts-expect-error - mockujemy implementację
    AiGenerateService.mockImplementation(() => ({
      regenerateFlashcards: regenerateFlashcardsMock,
    }));

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockResult);
    expect(regenerateFlashcardsMock).toHaveBeenCalledWith(requestData);
  });

  it("powinien zwrócić 500, gdy wystąpi błąd podczas regenerowania fiszek", async () => {
    // Arrange
    const requestData = {
      document_id: "ERROR",
      topic_id: "test-topic-id",
    };

    const request = new Request("https://example.com/api/flashcards/ai-regenerate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

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

    const mockContext = {
      request,
      locals: {
        supabase: mockSupabase,
        authorized: true,
        userId: "test-user-id",
        session: null,
        user: null,
        supabaseUrl: "https://example.com",
        supabaseAnonKey: "test-key",
      },
      params: {},
    } as unknown as APIContext;

    // Mock AiGenerateService.regenerateFlashcards z błędem
    const regenerateFlashcardsMock = vi.fn().mockRejectedValue(new Error("Test error"));

    // @ts-expect-error - mockujemy implementację
    AiGenerateService.mockImplementation(() => ({
      regenerateFlashcards: regenerateFlashcardsMock,
    }));

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
    expect(data.error.details).toContain("Test error");
  });
});
