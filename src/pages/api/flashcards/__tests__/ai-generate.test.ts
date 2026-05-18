// Najpierw definiujemy mocki (przed importami)
vi.mock("../ai-generate");
vi.mock("../../../../lib/services/ai-generate.service");
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
import { POST } from "../ai-generate";
import { AiGenerateService } from "../../../../lib/services/ai-generate.service";
import type { APIContext } from "astro";
import type { SupabaseClient } from "@/db/supabase.client";
import {
  createMockContext,
  testUnauthorizedRequest,
  testInvalidContentType,
  testInvalidJson,
  testValidationError,
} from "../../../../../tests/utils/api-test-utils";

describe("POST /api/flashcards/ai-generate", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    // Act & Assert
    await testUnauthorizedRequest(POST);
  });

  it("powinien zwrócić 415, gdy Content-Type nie jest application/json", async () => {
    // Act & Assert
    await testInvalidContentType(POST);
  });

  it("powinien zwrócić 400, gdy body nie jest prawidłowym JSON", async () => {
    // Act & Assert
    await testInvalidJson(POST);
  });

  it("powinien zwrócić 400, gdy dane nie przechodzą walidacji", async () => {
    // Act & Assert
    await testValidationError(POST, { invalid: "data" });
  });

  it("powinien zwrócić 200 i wygenerować fiszki z powodzeniem", async () => {
    // Arrange
    const requestData = {
      text: "Tekst do wygenerowania fiszek",
      topic_id: "test-topic-id",
      document_id: "test-document-id",
    };

    const request = new Request("https://example.com/api/flashcards/ai-generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

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
    }) as unknown as APIContext;

    // Mock AiGenerateService.generateFlashcards
    const generateFlashcardsMock = vi.fn().mockResolvedValue({
      flashcards: [
        {
          front_original: "Pytanie 1",
          back_original: "Odpowiedź 1",
          topic_id: "test-topic-id",
          document_id: "test-document-id",
          source: "ai",
          is_approved: false,
        },
      ],
    });

    // @ts-expect-error - mockujemy implementację
    AiGenerateService.mockImplementation(() => ({
      generateFlashcards: generateFlashcardsMock,
    }));

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("message", "Fiszki zostały pomyślnie wygenerowane");
    expect(generateFlashcardsMock).toHaveBeenCalledWith(requestData);
  });

  it("powinien zwrócić 500, gdy wystąpi błąd podczas generowania fiszek", async () => {
    // Arrange
    const requestData = {
      text: "ERROR",
      topic_id: "test-topic-id",
      document_id: "test-document-id",
    };

    const request = new Request("https://example.com/api/flashcards/ai-generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

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
    }) as unknown as APIContext;

    // Mock AiGenerateService.generateFlashcards z błędem
    const generateFlashcardsMock = vi.fn().mockRejectedValue(new Error("Test error"));

    // @ts-expect-error - mockujemy implementację
    AiGenerateService.mockImplementation(() => ({
      generateFlashcards: generateFlashcardsMock,
    }));

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
    expect(data.error).toHaveProperty("message", "Wystąpił błąd podczas generowania fiszek");
    expect(data.error.details).toContain("Test error");
  });
});
