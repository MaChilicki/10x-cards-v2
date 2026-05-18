import type { APIRoute } from "astro";
import type { SupabaseClient } from "@/db/supabase.client";
import { TopicsService } from "../../../../lib/services/topics.service";
import { topicsQuerySchema, topicCreateSchema } from "../../../../lib/schemas/topics.schema";
import type { TopicDto, TopicsListResponseDto } from "@/types";

export const prerender = false;

interface MockLocals {
  authorized?: boolean;
  userId?: string;
  supabase: SupabaseClient;
}

// Mock GET endpoint
export const GET: APIRoute = async ({ url, locals }): Promise<Response> => {
  // Sprawdzamy autoryzację
  const mockLocals = locals as unknown as MockLocals;
  if (mockLocals.authorized === false) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parsujemy parametry zapytania
  const searchParams = Object.fromEntries(url.searchParams);

  // Walidacja parametrów zapytania
  const validationResult = topicsQuerySchema.safeParse(searchParams);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Nieprawidłowe parametry zapytania",
          details: validationResult.error.format(),
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Symulacja błędu serwera dla przypadku testowego
  if (url.searchParams.get("error") === "server") {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas pobierania listy tematów",
          details: "Test error",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Tworzymy instancję serwisu
  const topicsService = new TopicsService(mockLocals.supabase, mockLocals.userId || "test-user-id");

  try {
    // Przygotowujemy dane dla różnych przypadków testowych
    let mockResponse: TopicsListResponseDto;
    const { limit, name, parent_id } = validationResult.data;

    if (parent_id === "empty") {
      // Przypadek dla pustej listy tematów
      mockResponse = {
        topics: [],
        total: 0,
      };
    } else if (parent_id === "error-id") {
      throw new Error("Test error");
    } else {
      // Domyślna lista tematów dla testów
      const mockTopics: TopicDto[] = [];
      const total = 5;
      const realLimit = typeof limit === "number" ? limit : 10;
      const count = Math.min(realLimit, total);

      for (let i = 0; i < count; i++) {
        mockTopics.push({
          id: `test-topic-${i + 1}`,
          user_id: mockLocals.userId || "test-user-id",
          name: name ? `${name} ${i + 1}` : `Test temat ${i + 1}`,
          description: `Opis dla temat ${i + 1}`,
          parent_id: parent_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          documents_count: i,
          flashcards_count: i * 2,
          breadcrumbs: parent_id ? [{ id: parent_id, name: "Temat nadrzędny" }] : [],
        });
      }

      mockResponse = {
        topics: mockTopics,
        total,
      };
    }

    // Wywołujemy metodę list serwisu, aby została śledzona w testach
    await topicsService.list(validationResult.data);

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas pobierania listy tematów",
          details: error instanceof Error ? error.message : "Nieznany błąd",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Mock POST endpoint
export const POST: APIRoute = async ({ request, locals }): Promise<Response> => {
  // Sprawdzamy autoryzację
  const mockLocals = locals as unknown as MockLocals;
  if (mockLocals.authorized === false) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Sprawdzamy Content-Type
  const contentType = request.headers.get("Content-Type");
  if (!contentType?.includes("application/json")) {
    return new Response(
      JSON.stringify({
        error: {
          code: "INVALID_CONTENT_TYPE",
          message: "Nieprawidłowy format danych",
          details: "Wymagany Content-Type: application/json",
        },
      }),
      {
        status: 415,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Sprawdzamy poprawność JSON
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: {
          code: "INVALID_JSON",
          message: "Nieprawidłowy format JSON",
          details: "Nie można sparsować body requestu",
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Walidacja danych
  const validationResult = topicCreateSchema.safeParse(body);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Nieprawidłowe dane wejściowe",
          details: validationResult.error.format(),
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Specjalne przypadki testowe
  if (validationResult.data.name === "error-topic") {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas tworzenia tematu",
          details: "Test error",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (validationResult.data.name === "duplicate-topic") {
    return new Response(
      JSON.stringify({
        error: {
          code: "CONFLICT",
          message: "Temat o tej nazwie już istnieje dla tego samego rodzica",
          details: "Temat o tej nazwie już istnieje dla tego samego rodzica",
        },
      }),
      {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Tworzymy instancję serwisu
  const topicsService = new TopicsService(mockLocals.supabase, mockLocals.userId || "test-user-id");

  try {
    // Wywołujemy metodę create serwisu, aby została śledzona w testach
    await topicsService.create(validationResult.data);

    // Przygotowujemy mockową odpowiedź
    const mockResponse: TopicDto = {
      id: "test-topic-id",
      user_id: mockLocals.userId || "test-user-id",
      name: validationResult.data.name,
      description: validationResult.data.description || null,
      parent_id: validationResult.data.parent_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      documents_count: 0,
      flashcards_count: 0,
      breadcrumbs: validationResult.data.parent_id
        ? [{ id: validationResult.data.parent_id, name: "Temat nadrzędny" }]
        : [],
    };

    return new Response(JSON.stringify(mockResponse), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas tworzenia tematu",
          details: error instanceof Error ? error.message : "Nieznany błąd",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
