import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "../__mocks__/approve-by-document";
import {
  createMockContext,
  createMockRequest,
  testUnauthorizedRequest,
  testInvalidContentType,
  testInvalidJson,
  testValidationError,
} from "../../../../../tests/utils/api-test-utils";

// Mockujemy zewnętrzne zależności - umieszczamy je na górze pliku zgodnie z zasadami hoistingu
vi.mock("../../../../lib/services/logger.service", () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("PATCH /api/flashcards/approve-by-document", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    await testUnauthorizedRequest(PATCH);
  });

  it("powinien zwrócić 415, gdy Content-Type nie jest application/json", async () => {
    await testInvalidContentType(PATCH, "https://example.com/api/flashcards/approve-by-document");
  });

  it("powinien zwrócić 400, gdy body nie jest prawidłowym JSON", async () => {
    await testInvalidJson(PATCH, "https://example.com/api/flashcards/approve-by-document", "PATCH");
  });

  it("powinien zwrócić 400, gdy dane nie przechodzą walidacji", async () => {
    await testValidationError(
      PATCH,
      { invalid: "data" }, // Brak wymaganego pola document_id
      "https://example.com/api/flashcards/approve-by-document",
      "PATCH"
    );
  });

  it("powinien zwrócić 200 i zatwierdzić fiszki z dokumentu", async () => {
    // Arrange
    const documentId = "test-document-id";
    const request = createMockRequest(
      "https://example.com/api/flashcards/approve-by-document",
      "PATCH",
      { "Content-Type": "application/json" },
      { document_id: documentId }
    );

    const mockContext = createMockContext({
      request,
    });

    // Act
    const response = await PATCH(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("message", "Fiszki zostały zatwierdzone pomyślnie");
    expect(data.data).toHaveProperty("approved_count");
    expect(data.data).toHaveProperty("flashcards");
    expect(Array.isArray(data.data.flashcards)).toBe(true);
  });

  it("powinien zwrócić 404, gdy dokument nie istnieje", async () => {
    // Arrange
    const documentId = "nieistniejacy-dokument-id";
    const request = createMockRequest(
      "https://example.com/api/flashcards/approve-by-document",
      "PATCH",
      { "Content-Type": "application/json" },
      { document_id: documentId }
    );

    const mockContext = createMockContext({
      request,
    });

    // Act
    const response = await PATCH(mockContext);

    // Assert
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "DOCUMENT_NOT_FOUND");
  });

  it("powinien zwrócić 500, gdy wystąpi błąd podczas zatwierdzania fiszek", async () => {
    // Arrange
    const documentId = "error-document-id";
    const request = createMockRequest(
      "https://example.com/api/flashcards/approve-by-document",
      "PATCH",
      { "Content-Type": "application/json" },
      { document_id: documentId }
    );

    const mockContext = createMockContext({
      request,
    });

    // Act
    const response = await PATCH(mockContext);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
    expect(data.error.details).toContain("Test error");
  });
});
