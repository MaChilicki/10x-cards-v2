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

vi.mock("../../../../lib/services/topics.service");

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../__mocks__/index";
import { TopicsService } from "../../../../lib/services/topics.service";
import type { APIContext } from "astro";
import type { SupabaseClient } from "@/db/supabase.client";
import {
  createMockContext,
  createMockRequest,
  testUnauthorizedRequest,
  testInvalidContentType,
  testInvalidJson,
  testValidationError,
} from "../../../../../tests/utils/api-test-utils";

describe("GET /api/topics", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    await testUnauthorizedRequest(GET);
  });

  it("powinien zwrócić 400, gdy parametry zapytania są nieprawidłowe", async () => {
    // Arrange
    const url = new URL("https://example.com/api/topics?sort=invalid");
    const mockSupabase = {} as unknown as SupabaseClient;
    const mockContext = {
      url,
      locals: {
        authorized: true,
        userId: "test-user-id",
        supabase: mockSupabase,
      },
    } as unknown as APIContext;

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("powinien zwrócić 200 i pustą listę tematów", async () => {
    // Arrange
    const url = new URL("https://example.com/api/topics?parent_id=empty");
    const mockSupabase = {} as unknown as SupabaseClient;
    const mockContext = {
      url,
      locals: {
        authorized: true,
        userId: "test-user-id",
        supabase: mockSupabase,
      },
    } as unknown as APIContext;

    // Mock TopicsService.list
    const listMock = vi.fn().mockResolvedValue({
      topics: [],
      total: 0,
    });

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      list: listMock,
    }));

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("topics");
    expect(data.topics).toBeInstanceOf(Array);
    expect(data.topics).toHaveLength(0);
    expect(data.total).toBe(0);
    expect(listMock).toHaveBeenCalled();
  });

  it("powinien zwrócić 200 i listę tematów", async () => {
    // Arrange
    const url = new URL("https://example.com/api/topics?page=1&limit=3");
    const mockSupabase = {} as unknown as SupabaseClient;
    const mockContext = {
      url,
      locals: {
        authorized: true,
        userId: "test-user-id",
        supabase: mockSupabase,
      },
    } as unknown as APIContext;

    // Mock TopicsService.list
    const listMock = vi.fn().mockResolvedValue({
      topics: [
        {
          id: "test-topic-1",
          name: "Test temat 1",
          user_id: "test-user-id",
        },
        {
          id: "test-topic-2",
          name: "Test temat 2",
          user_id: "test-user-id",
        },
        {
          id: "test-topic-3",
          name: "Test temat 3",
          user_id: "test-user-id",
        },
      ],
      total: 5,
    });

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      list: listMock,
    }));

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("topics");
    expect(data.topics).toBeInstanceOf(Array);
    expect(data.topics).toHaveLength(3);
    expect(data.total).toBe(5);
    expect(listMock).toHaveBeenCalled();
  });

  it("powinien zwrócić 500, gdy wystąpi błąd", async () => {
    // Arrange
    const url = new URL("https://example.com/api/topics?parent_id=error-id");
    const mockSupabase = {} as unknown as SupabaseClient;
    const mockContext = {
      url,
      locals: {
        authorized: true,
        userId: "test-user-id",
        supabase: mockSupabase,
      },
    } as unknown as APIContext;

    // Mock TopicsService.list
    const listMock = vi.fn().mockRejectedValue(new Error("Test error"));

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      list: listMock,
    }));

    // Act
    const response = await GET(mockContext);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
    expect(data.error.details).toContain("Test error");
  });
});

describe("POST /api/topics", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    await testUnauthorizedRequest(POST);
  });

  it("powinien zwrócić 415, gdy Content-Type nie jest application/json", async () => {
    await testInvalidContentType(POST, "https://example.com/api/topics");
  });

  it("powinien zwrócić 400, gdy body nie jest prawidłowym JSON", async () => {
    await testInvalidJson(POST, "https://example.com/api/topics");
  });

  it("powinien zwrócić 400, gdy dane nie przechodzą walidacji", async () => {
    await testValidationError(
      POST,
      { invalid: "data" }, // Brak wymaganych pól
      "https://example.com/api/topics"
    );
  });

  it("powinien zwrócić 201 i utworzyć nowy temat", async () => {
    // Arrange
    const topicData = {
      name: "Nowy temat",
      description: "Opis nowego tematu",
    };

    const mockTopic = {
      id: "test-topic-id",
      user_id: "test-user-id",
      name: topicData.name,
      description: topicData.description,
      parent_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      documents_count: 0,
      flashcards_count: 0,
      breadcrumbs: [],
    };

    const request = createMockRequest(
      "https://example.com/api/topics",
      "POST",
      { "Content-Type": "application/json" },
      topicData
    );

    const mockContext = createMockContext({
      request,
    });

    // Mock TopicsService.create
    const createMock = vi.fn().mockResolvedValue(mockTopic);

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      create: createMock,
    }));

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty("id", "test-topic-id");
    expect(data).toHaveProperty("name", topicData.name);
    expect(data).toHaveProperty("description", topicData.description);
    expect(createMock).toHaveBeenCalledWith(topicData);
  });

  it("powinien zwrócić 409, gdy nazwa tematu już istnieje", async () => {
    // Arrange
    const topicData = {
      name: "duplicate-topic",
      description: "Duplikat tematu",
    };

    const request = createMockRequest(
      "https://example.com/api/topics",
      "POST",
      { "Content-Type": "application/json" },
      topicData
    );

    const mockContext = createMockContext({
      request,
    });

    // Mock TopicsService.create
    const createMock = vi.fn().mockRejectedValue(new Error("Temat o tej nazwie już istnieje dla tego samego rodzica"));

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      create: createMock,
    }));

    // Act
    const response = await POST(mockContext);

    // Assert
    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "CONFLICT");
  });

  it("powinien zwrócić 500, gdy wystąpi błąd", async () => {
    // Arrange
    const topicData = {
      name: "error-topic",
      description: "Błędny temat",
    };

    const request = createMockRequest(
      "https://example.com/api/topics",
      "POST",
      { "Content-Type": "application/json" },
      topicData
    );

    const mockContext = createMockContext({
      request,
    });

    // Mock TopicsService.create
    const createMock = vi.fn().mockRejectedValue(new Error("Test error"));

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      create: createMock,
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
