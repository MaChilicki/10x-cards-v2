// Najpierw definiujemy mocki (przed importami)
vi.mock("../[id]");
vi.mock("../../../../lib/services/documents.service");
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
import { GET } from "../[id]";
import type { APIContext } from "astro";
import { createMockContext, testUnauthorizedRequest } from "../../../../../tests/utils/api-test-utils";

describe("GET /api/documents/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    // Act & Assert
    await testUnauthorizedRequest(GET, { params: { id: "test-id" } });
  });

  it("powinien zwrócić 400, gdy ID dokumentu jest puste", async () => {
    // Arrange
    const mockContext = createMockContext({
      params: {}, // Brak ID dokumentu
    }) as unknown as APIContext;

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "MISSING_PARAMETER");
  });

  it("powinien zwrócić 404, gdy dokument nie istnieje", async () => {
    // Arrange
    const mockContext = createMockContext({
      params: { id: "nonexistent-id" },
    }) as unknown as APIContext;

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "NOT_FOUND");
  });

  it("powinien zwrócić 200 i dane dokumentu", async () => {
    // Arrange
    const documentId = "test-document-id";
    const mockContext = createMockContext({
      params: { id: documentId },
    }) as unknown as APIContext;

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("id", documentId);
    expect(data).toHaveProperty("title");
    expect(data).toHaveProperty("content");
    expect(data).toHaveProperty("topic_id");
    expect(data).toHaveProperty("user_id");
  });

  it("powinien zwrócić 500, gdy wystąpi błąd podczas pobierania dokumentu", async () => {
    // Arrange
    const documentId = "error-id";
    const mockContext = createMockContext({
      params: { id: documentId },
    }) as unknown as APIContext;

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
    expect(data.error.details).toContain("Test error");
  });
});
