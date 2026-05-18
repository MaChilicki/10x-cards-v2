// Najpierw definiujemy mocki (przed importami)
vi.mock("../[id]");
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
import { GET, PUT, DELETE } from "../__mocks__/[id]";
import { TopicsService } from "../../../../lib/services/topics.service";
import type { APIContext } from "astro";
import type { SupabaseClient } from "@/db/supabase.client";
import { createMockRequest } from "../../../../../tests/utils/api-test-utils";

// Helper do testowania endpointów z parametrem ID
const createMockContextWithId = (id: string, additionalProps: Partial<APIContext> = {}) => {
  const mockSupabase = {} as unknown as SupabaseClient;
  return {
    params: { id },
    locals: {
      authorized: true,
      userId: "test-user-id",
      supabase: mockSupabase,
    },
    ...additionalProps,
  } as unknown as APIContext;
};

describe("GET /api/topics/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    const mockContext = {
      params: { id: "test-topic-id" },
      locals: { authorized: false },
    } as unknown as APIContext;

    const response = await GET(mockContext);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("powinien zwrócić 400, gdy brakuje parametru ID", async () => {
    const mockContext = createMockContextWithId("");

    const response = await GET(mockContext);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "MISSING_PARAMETER");
  });

  it("powinien zwrócić 400, gdy ID ma nieprawidłowy format", async () => {
    const mockContext = createMockContextWithId("nieprawidlowe-id");

    const response = await GET(mockContext);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("powinien zwrócić 404, gdy temat nie istnieje", async () => {
    const mockContext = createMockContextWithId("not-found");

    // Mock TopicsService.getById
    const getByIdMock = vi.fn().mockRejectedValue(new Error("Temat nie został znaleziony"));

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      getById: getByIdMock,
    }));

    const response = await GET(mockContext);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "NOT_FOUND");
  });

  it("powinien zwrócić 200 i dane tematu", async () => {
    const topicId = "test-topic-id";
    const mockContext = createMockContextWithId(topicId);

    const mockTopic = {
      id: topicId,
      user_id: "test-user-id",
      name: "Test temat",
      description: "Opis tematu",
      parent_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      documents_count: 2,
      flashcards_count: 5,
      breadcrumbs: [],
    };

    // Mock TopicsService.getById
    const getByIdMock = vi.fn().mockResolvedValue(mockTopic);

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      getById: getByIdMock,
    }));

    const response = await GET(mockContext);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("id", topicId);
    expect(data).toHaveProperty("name", "Test temat");
    expect(getByIdMock).toHaveBeenCalledWith(topicId);
  });

  it("powinien zwrócić 500, gdy wystąpi błąd", async () => {
    const mockContext = createMockContextWithId("error-id");

    // Mock TopicsService.getById
    const getByIdMock = vi.fn().mockRejectedValue(new Error("Test error"));

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      getById: getByIdMock,
    }));

    const response = await GET(mockContext);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
    expect(data.error.details).toContain("Test error");
  });
});

describe("PUT /api/topics/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    const mockContext = {
      params: { id: "test-topic-id" },
      request: new Request("https://example.com/api/topics/test-topic-id", { method: "PUT" }),
      locals: { authorized: false },
    } as unknown as APIContext;

    const response = await PUT(mockContext);
    expect(response.status).toBe(401);
  });

  it("powinien zwrócić 400, gdy brakuje parametru ID", async () => {
    const request = createMockRequest(
      "https://example.com/api/topics/",
      "PUT",
      { "Content-Type": "application/json" },
      { name: "Updated Topic" }
    );

    const mockContext = createMockContextWithId("", { request });

    const response = await PUT(mockContext);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "MISSING_PARAMETER");
  });

  it("powinien zwrócić 415, gdy Content-Type nie jest application/json", async () => {
    const request = new Request("https://example.com/api/topics/test-topic-id", {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
      body: "test",
    });

    const mockContext = createMockContextWithId("test-topic-id", { request });

    const response = await PUT(mockContext);
    expect(response.status).toBe(415);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INVALID_CONTENT_TYPE");
  });

  it("powinien zwrócić 400, gdy body nie jest prawidłowym JSON", async () => {
    const request = new Request("https://example.com/api/topics/test-topic-id", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "{invalid-json",
    });

    const mockContext = createMockContextWithId("test-topic-id", { request });

    const response = await PUT(mockContext);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INVALID_JSON");
  });

  it("powinien zwrócić 400, gdy dane nie przechodzą walidacji", async () => {
    const request = createMockRequest(
      "https://example.com/api/topics/test-topic-id",
      "PUT",
      { "Content-Type": "application/json" },
      { invalid: "data" } // Brak wymaganych pól
    );

    const mockContext = createMockContextWithId("test-topic-id", { request });

    const response = await PUT(mockContext);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("powinien zwrócić 404, gdy temat nie istnieje", async () => {
    const request = createMockRequest(
      "https://example.com/api/topics/not-found",
      "PUT",
      { "Content-Type": "application/json" },
      { name: "Updated Topic" }
    );

    const mockContext = createMockContextWithId("not-found", { request });

    // Mock TopicsService.update
    const updateMock = vi.fn().mockRejectedValue(new Error("Temat nie został znaleziony"));

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      update: updateMock,
    }));

    const response = await PUT(mockContext);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "NOT_FOUND");
  });

  it("powinien zwrócić 200 i zaktualizować temat", async () => {
    const topicId = "test-topic-id";
    const updateData = {
      name: "Updated Topic",
      description: "Updated description",
    };

    const request = createMockRequest(
      `https://example.com/api/topics/${topicId}`,
      "PUT",
      { "Content-Type": "application/json" },
      updateData
    );

    const mockContext = createMockContextWithId(topicId, { request });

    const mockTopic = {
      id: topicId,
      user_id: "test-user-id",
      name: updateData.name,
      description: updateData.description,
      parent_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      documents_count: 2,
      flashcards_count: 5,
      breadcrumbs: [],
    };

    // Mock TopicsService.update
    const updateMock = vi.fn().mockResolvedValue(mockTopic);

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      update: updateMock,
    }));

    const response = await PUT(mockContext);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("id", topicId);
    expect(data).toHaveProperty("name", updateData.name);
    expect(data).toHaveProperty("description", updateData.description);
    expect(updateMock).toHaveBeenCalledWith(topicId, updateData);
  });

  it("powinien zwrócić 409, gdy nazwa tematu już istnieje", async () => {
    const updateData = {
      name: "duplicate-topic",
    };

    const request = createMockRequest(
      "https://example.com/api/topics/test-topic-id",
      "PUT",
      { "Content-Type": "application/json" },
      updateData
    );

    const mockContext = createMockContextWithId("test-topic-id", { request });

    // Mock TopicsService.update
    const updateMock = vi.fn().mockRejectedValue(new Error("Temat o tej nazwie już istnieje dla tego samego rodzica"));

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      update: updateMock,
    }));

    const response = await PUT(mockContext);
    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "CONFLICT");
  });

  it("powinien zwrócić 500, gdy wystąpi błąd", async () => {
    const request = createMockRequest(
      "https://example.com/api/topics/error-id",
      "PUT",
      { "Content-Type": "application/json" },
      { name: "Error Topic" }
    );

    const mockContext = createMockContextWithId("error-id", { request });

    // Mock TopicsService.update
    const updateMock = vi.fn().mockRejectedValue(new Error("Test error"));

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      update: updateMock,
    }));

    const response = await PUT(mockContext);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
    expect(data.error.details).toContain("Test error");
  });
});

describe("DELETE /api/topics/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    const mockContext = {
      params: { id: "test-topic-id" },
      locals: { authorized: false },
    } as unknown as APIContext;

    const response = await DELETE(mockContext);
    expect(response.status).toBe(401);
  });

  it("powinien zwrócić 400, gdy brakuje parametru ID", async () => {
    const mockContext = createMockContextWithId("");

    const response = await DELETE(mockContext);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "MISSING_PARAMETER");
  });

  it("powinien zwrócić 400, gdy ID ma nieprawidłowy format", async () => {
    const mockContext = createMockContextWithId("nieprawidlowe-id");

    const response = await DELETE(mockContext);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("powinien zwrócić 404, gdy temat nie istnieje", async () => {
    const mockContext = createMockContextWithId("not-found");

    // Mock TopicsService.delete
    const deleteMock = vi.fn().mockRejectedValue(new Error("Temat nie został znaleziony"));

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      delete: deleteMock,
    }));

    const response = await DELETE(mockContext);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "NOT_FOUND");
  });

  it("powinien zwrócić 409, gdy temat ma podrzędne tematy", async () => {
    const mockContext = createMockContextWithId("has-subtopics");

    // Mock TopicsService.delete
    const deleteMock = vi
      .fn()
      .mockRejectedValue(new Error("Temat posiada podrzędne tematy. Usuń najpierw wszystkie podtematy."));

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      delete: deleteMock,
    }));

    const response = await DELETE(mockContext);
    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "CONFLICT");
    expect(data.error.details).toContain("podtematy");
  });

  it("powinien zwrócić 409, gdy temat ma przypisane dokumenty", async () => {
    const mockContext = createMockContextWithId("has-documents");

    // Mock TopicsService.delete
    const deleteMock = vi
      .fn()
      .mockRejectedValue(new Error("Temat posiada przypisane dokumenty. Usuń najpierw wszystkie dokumenty."));

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      delete: deleteMock,
    }));

    const response = await DELETE(mockContext);
    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "CONFLICT");
    expect(data.error.details).toContain("dokumenty");
  });

  it("powinien zwrócić 409, gdy temat ma przypisane fiszki", async () => {
    const mockContext = createMockContextWithId("has-flashcards");

    // Mock TopicsService.delete
    const deleteMock = vi
      .fn()
      .mockRejectedValue(new Error("Temat posiada przypisane fiszki. Usuń najpierw wszystkie fiszki."));

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      delete: deleteMock,
    }));

    const response = await DELETE(mockContext);
    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "CONFLICT");
    expect(data.error.details).toContain("fiszki");
  });

  it("powinien zwrócić 204 i usunąć temat", async () => {
    const topicId = "test-topic-id";
    const mockContext = createMockContextWithId(topicId);

    // Mock TopicsService.delete
    const deleteMock = vi.fn().mockResolvedValue(undefined);

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      delete: deleteMock,
    }));

    const response = await DELETE(mockContext);
    expect(response.status).toBe(204);
    expect(deleteMock).toHaveBeenCalledWith(topicId);
  });

  it("powinien zwrócić 500, gdy wystąpi błąd", async () => {
    const mockContext = createMockContextWithId("error-id");

    // Mock TopicsService.delete
    const deleteMock = vi.fn().mockRejectedValue(new Error("Test error"));

    // @ts-expect-error - mockujemy implementację
    TopicsService.mockImplementation(() => ({
      delete: deleteMock,
    }));

    const response = await DELETE(mockContext);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
    expect(data.error.details).toContain("Test error");
  });
});
