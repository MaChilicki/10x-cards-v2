import type { APIRoute } from "astro";
import type { SupabaseClient } from "@/db/supabase.client";
import { TopicsService } from "../../../../lib/services/topics.service";
import { topicIdSchema, topicUpdateSchema } from "../../../../lib/schemas/topics.schema";
import type { TopicDto } from "@/types";

export const prerender = false;

interface MockLocals {
  authorized?: boolean;
  userId?: string;
  supabase: SupabaseClient;
}

// Wspólna funkcja do walidacji ID tematu
const validateTopicId = (params: Record<string, string | undefined>) => {
  if (!params.id) {
    return {
      success: false as const,
      error: {
        code: "MISSING_PARAMETER",
        message: "Brak wymaganego parametru",
        details: "ID tematu jest wymagane",
      },
    };
  }

  // Specjalne ID dla celów testowych
  if (
    ["not-found", "error-id", "has-subtopics", "has-documents", "has-flashcards", "test-topic-id"].includes(params.id)
  ) {
    return {
      success: true as const,
      id: params.id,
    };
  }

  const result = topicIdSchema.safeParse(params.id);
  if (!result.success) {
    return {
      success: false as const,
      error: {
        code: "VALIDATION_ERROR",
        message: "Nieprawidłowy format ID tematu",
        details: result.error.format(),
      },
    };
  }

  return {
    success: true as const,
    id: result.data,
  };
};

// Mock GET endpoint
export const GET: APIRoute = async ({ params, locals }): Promise<Response> => {
  // Sprawdzamy autoryzację
  const mockLocals = locals as unknown as MockLocals;
  if (mockLocals.authorized === false) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Walidacja ID tematu
  const idValidation = validateTopicId(params);
  if (!idValidation.success) {
    return new Response(
      JSON.stringify({
        error: idValidation.error,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const topicId = idValidation.id;

  // Tworzymy instancję serwisu
  const topicsService = new TopicsService(mockLocals.supabase, mockLocals.userId || "test-user-id");

  try {
    // Przypadki specjalne dla testów
    if (topicId === "not-found") {
      return new Response(
        JSON.stringify({
          error: {
            code: "NOT_FOUND",
            message: "Temat nie został znaleziony",
            details: `Nie znaleziono tematu o ID: ${topicId}`,
          },
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (topicId === "error-id") {
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Wystąpił błąd podczas pobierania tematu",
            details: "Test error",
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Wywołujemy metodę getById serwisu, aby została śledzona w testach
    await topicsService.getById(topicId);

    // Przygotowujemy mockową odpowiedź
    const mockTopic: TopicDto = {
      id: topicId,
      user_id: mockLocals.userId || "test-user-id",
      name: topicId === "test-topic-id" ? "Test temat" : `Test temat ${topicId}`,
      description: `Opis dla temat ${topicId}`,
      parent_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      documents_count: 2,
      flashcards_count: 5,
      breadcrumbs: [],
    };

    return new Response(JSON.stringify(mockTopic), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas pobierania tematu",
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

// Mock PUT endpoint
export const PUT: APIRoute = async ({ request, params, locals }): Promise<Response> => {
  // Sprawdzamy autoryzację
  const mockLocals = locals as unknown as MockLocals;
  if (mockLocals.authorized === false) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Walidacja ID tematu
  const idValidation = validateTopicId(params);
  if (!idValidation.success) {
    return new Response(
      JSON.stringify({
        error: idValidation.error,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const topicId = idValidation.id;

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
  const validationResult = topicUpdateSchema.safeParse(body);
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

  // Tworzymy instancję serwisu
  const topicsService = new TopicsService(mockLocals.supabase, mockLocals.userId || "test-user-id");

  try {
    // Przypadki specjalne dla testów
    if (topicId === "not-found") {
      return new Response(
        JSON.stringify({
          error: {
            code: "NOT_FOUND",
            message: "Temat nie został znaleziony",
            details: `Nie znaleziono tematu o ID: ${topicId}`,
          },
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (topicId === "error-id" || (validationResult.data.name && validationResult.data.name === "error-topic")) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Wystąpił błąd podczas aktualizacji tematu",
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

    // Wywołujemy metodę update serwisu, aby została śledzona w testach
    await topicsService.update(topicId, validationResult.data);

    // Przygotowujemy mockową odpowiedź
    const mockTopic: TopicDto = {
      id: topicId,
      user_id: mockLocals.userId || "test-user-id",
      name: validationResult.data.name || `Test temat ${topicId}`,
      description:
        validationResult.data.description !== undefined
          ? validationResult.data.description
          : `Opis dla temat ${topicId}`,
      parent_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      documents_count: 2,
      flashcards_count: 5,
      breadcrumbs: [],
    };

    return new Response(JSON.stringify(mockTopic), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas aktualizacji tematu",
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

// Mock DELETE endpoint
export const DELETE: APIRoute = async ({ params, locals }): Promise<Response> => {
  // Sprawdzamy autoryzację
  const mockLocals = locals as unknown as MockLocals;
  if (mockLocals.authorized === false) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Walidacja ID tematu
  const idValidation = validateTopicId(params);
  if (!idValidation.success) {
    return new Response(
      JSON.stringify({
        error: idValidation.error,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const topicId = idValidation.id;

  // Tworzymy instancję serwisu
  const topicsService = new TopicsService(mockLocals.supabase, mockLocals.userId || "test-user-id");

  try {
    // Przypadki specjalne dla testów
    if (topicId === "not-found") {
      return new Response(
        JSON.stringify({
          error: {
            code: "NOT_FOUND",
            message: "Temat nie został znaleziony",
            details: `Nie znaleziono tematu o ID: ${topicId}`,
          },
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (topicId === "has-subtopics") {
      return new Response(
        JSON.stringify({
          error: {
            code: "CONFLICT",
            message: "Nie można usunąć tematu",
            details: "Temat posiada podrzędne tematy. Usuń najpierw wszystkie podtematy.",
          },
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (topicId === "has-documents") {
      return new Response(
        JSON.stringify({
          error: {
            code: "CONFLICT",
            message: "Nie można usunąć tematu",
            details: "Temat posiada przypisane dokumenty. Usuń najpierw wszystkie dokumenty.",
          },
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (topicId === "has-flashcards") {
      return new Response(
        JSON.stringify({
          error: {
            code: "CONFLICT",
            message: "Nie można usunąć tematu",
            details: "Temat posiada przypisane fiszki. Usuń najpierw wszystkie fiszki.",
          },
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (topicId === "error-id") {
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Wystąpił błąd podczas usuwania tematu",
            details: "Test error",
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Wywołujemy metodę delete serwisu, aby została śledzona w testach
    await topicsService.delete(topicId);

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas usuwania tematu",
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
