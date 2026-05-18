// Najpierw definiujemy mocki (przed importami)
vi.mock("../index");
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

describe("GET /api/documents", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    // Act & Assert
    await testUnauthorizedRequest(GET);
  });

  it("powinien zwrócić 400, gdy parametry zapytania są nieprawidłowe", async () => {
    // Arrange
    const request = new Request("https://example.com/api/documents?limit=invalid");
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

  it("powinien zwrócić 200 i listę dokumentów", async () => {
    // Arrange
    const request = new Request("https://example.com/api/documents?limit=10&offset=0");
    const mockContext = createMockContext({
      request,
    }) as unknown as APIContext;

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("documents");
    expect(data).toHaveProperty("total_count");
    expect(Array.isArray(data.documents)).toBe(true);
  });

  it("powinien zwrócić 500, gdy wystąpi błąd podczas pobierania dokumentów", async () => {
    // Arrange
    const request = new Request("https://example.com/api/documents?limit=error");
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

describe("POST /api/documents", () => {
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

  it("powinien zwrócić 201 i utworzyć dokument", async () => {
    // Arrange
    const documentData = {
      title: "Test Document",
      content: "Test content",
      topic_id: "test-topic-id",
    };

    const request = new Request("https://example.com/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(documentData),
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
    expect(data).toHaveProperty("title", documentData.title);
    expect(data).toHaveProperty("content", documentData.content);
    expect(data).toHaveProperty("topic_id", documentData.topic_id);
    expect(data).toHaveProperty("user_id", "test-user-id");
  });

  it("powinien zwrócić 500, gdy wystąpi błąd podczas tworzenia dokumentu", async () => {
    // Arrange
    const documentData = {
      title: "ERROR",
      content: "Test content",
      topic_id: "test-topic-id",
    };

    const request = new Request("https://example.com/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(documentData),
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
