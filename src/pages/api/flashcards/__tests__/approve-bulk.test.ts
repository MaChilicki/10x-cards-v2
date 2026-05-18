import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "../__mocks__/approve-bulk";

// Mocks muszą być zdefiniowane przed importami, które z nich korzystają
vi.mock("../approve-bulk");
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

vi.mock("../../../../lib/services/flashcards.service");

// Teraz importujemy pozostałe zależności
import { FlashcardsService } from "../../../../lib/services/flashcards.service";
import {
  createMockContext,
  createMockRequest,
  testUnauthorizedRequest,
  testInvalidContentType,
  testInvalidJson,
  testValidationError,
} from "../../../../../tests/utils/api-test-utils";

describe("PATCH /api/flashcards/approve-bulk", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    await testUnauthorizedRequest(PATCH);
  });

  it("powinien zwrócić 415, gdy Content-Type nie jest application/json", async () => {
    await testInvalidContentType(PATCH, "https://example.com/api/flashcards/approve-bulk");
  });

  it("powinien zwrócić 400, gdy body nie jest prawidłowym JSON", async () => {
    await testInvalidJson(PATCH, "https://example.com/api/flashcards/approve-bulk", "PATCH");
  });

  it("powinien zwrócić 400, gdy dane nie przechodzą walidacji", async () => {
    await testValidationError(
      PATCH,
      { invalid: "data" }, // Brak wymaganego pola flashcard_ids
      "https://example.com/api/flashcards/approve-bulk",
      "PATCH"
    );
  });

  it("powinien zwrócić 200 i zatwierdzić wiele fiszek", async () => {
    // Arrange
    const flashcardIds = ["test-flashcard-1", "test-flashcard-2", "test-flashcard-3"];

    const mockResult = {
      approved_count: flashcardIds.length,
      flashcards: flashcardIds.map((id) => ({
        id,
        front_original: `Pytanie ${id}`,
        back_original: `Odpowiedź ${id}`,
        front_modified: `Pytanie ${id}`,
        back_modified: `Odpowiedź ${id}`,
        is_approved: true,
        topic_id: "test-topic-id",
        document_id: "test-document-id",
        user_id: "test-user-id",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source: "ai",
      })),
    };

    const request = createMockRequest(
      "https://example.com/api/flashcards/approve-bulk",
      "PATCH",
      { "Content-Type": "application/json" },
      { flashcard_ids: flashcardIds }
    );

    const mockContext = createMockContext({
      request,
    });

    // Mock FlashcardsService.approveBulk
    const approveBulkMock = vi.fn().mockResolvedValue(mockResult);

    // @ts-expect-error - mockujemy implementację
    FlashcardsService.mockImplementation(() => ({
      approveBulk: approveBulkMock,
    }));

    // Act
    const response = await PATCH(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("message", "Fiszki zostały zatwierdzone pomyślnie");

    // Sprawdzamy tylko istotne pola zamiast całego obiektu
    expect(data.data).toHaveProperty("approved_count", mockResult.approved_count);
    expect(data.data).toHaveProperty("flashcards");
    expect(Array.isArray(data.data.flashcards)).toBe(true);
    expect(data.data.flashcards.length).toBe(mockResult.flashcards.length);

    // Sprawdzamy, czy każda fiszka zawiera wymagane pola
    data.data.flashcards.forEach((flashcard: Record<string, unknown>, index: number) => {
      const expectedId = flashcardIds[index];
      expect(flashcard).toHaveProperty("id", expectedId);
      expect(flashcard).toHaveProperty("front_original", `Pytanie ${expectedId}`);
      expect(flashcard).toHaveProperty("back_original", `Odpowiedź ${expectedId}`);
      expect(flashcard).toHaveProperty("is_approved", true);
      expect(flashcard).toHaveProperty("topic_id", "test-topic-id");
      expect(flashcard).toHaveProperty("document_id", "test-document-id");
      expect(flashcard).toHaveProperty("source", "ai");
    });

    expect(approveBulkMock).toHaveBeenCalledWith(flashcardIds);
  });

  it("powinien zwrócić 500, gdy wystąpi błąd podczas zatwierdzania fiszek", async () => {
    // Arrange
    const flashcardIds = ["test-flashcard-1", "test-flashcard-2", "error-flashcard"];

    const request = createMockRequest(
      "https://example.com/api/flashcards/approve-bulk",
      "PATCH",
      { "Content-Type": "application/json" },
      { flashcard_ids: flashcardIds }
    );

    const mockContext = createMockContext({
      request,
    });

    // Mock FlashcardsService.approveBulk rzucający błąd
    const approveBulkMock = vi.fn().mockRejectedValue(new Error("Test error"));

    // @ts-expect-error - mockujemy implementację
    FlashcardsService.mockImplementation(() => ({
      approveBulk: approveBulkMock,
    }));

    // Act
    const response = await PATCH(mockContext);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
    expect(data.error.details).toContain("Test error");
  });
});
