import type { APIRoute } from "astro";
import type { SupabaseClient } from "../../../../db/supabase.client";

export const prerender = false;

interface MockLocals {
  authorized?: boolean;
  userId?: string;
  supabase: SupabaseClient;
}

// Implementacja mocka dla funkcji GET
export const GET: APIRoute = async ({ url, request, locals }): Promise<Response> => {
  // Sprawdzamy autoryzację
  const mockLocals = locals as unknown as MockLocals;
  if (mockLocals.authorized === false) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Pobieramy parametry zapytania
  let limit: string | null = null;
  let topicId: string | null = null;

  // Próbujemy pobrać parametry z różnych źródeł
  // 1. Z URL w kontekście
  if (url?.search) {
    const params = new URLSearchParams(url.search);
    limit = params.get("limit");
    topicId = params.get("topic_id");
  }
  // 2. Z URL w obiekcie Request
  else if (request?.url) {
    try {
      const requestUrl = new URL(request.url);
      const params = new URLSearchParams(requestUrl.search);
      limit = params.get("limit");
      topicId = params.get("topic_id");
    } catch {
      // Ignorujemy błędy parsowania URL
    }
  }
  // 3. Z toString URL (dla kompatybilności)
  else if (url?.toString) {
    try {
      const urlObj = new URL(url.toString());
      const params = new URLSearchParams(urlObj.search);
      limit = params.get("limit");
      topicId = params.get("topic_id");
    } catch {
      // Ignorujemy błędy parsowania URL
    }
  }

  // Walidacja parametrów
  // Sprawdzamy czy mamy zasymulować błąd
  if (limit === "error") {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas przetwarzania żądania",
          details: "Test error",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Walidacja, czy limit jest liczbą
  if (limit && isNaN(Number(limit))) {
    return new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Nieprawidłowe parametry zapytania",
          details: { limit: ["Musi być liczbą"] },
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Zwracamy mocki dokumentów
  const mockDocuments = {
    documents: [
      {
        id: "test-doc-1",
        title: "Test Document 1",
        content: "Test content 1",
        topic_id: topicId || "test-topic-1",
        user_id: mockLocals.userId || "test-user-id",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "test-doc-2",
        title: "Test Document 2",
        content: "Test content 2",
        topic_id: topicId || "test-topic-2",
        user_id: mockLocals.userId || "test-user-id",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_count: 2,
  };

  return new Response(JSON.stringify(mockDocuments), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

// Implementacja mocka dla funkcji POST
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
  if (!body.title || !body.content || !body.topic_id) {
    return new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Brak wymaganych pól",
          details: {
            title: !body.title ? ["Pole wymagane"] : [],
            content: !body.content ? ["Pole wymagane"] : [],
            topic_id: !body.topic_id ? ["Pole wymagane"] : [],
          },
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Sprawdzamy czy mamy zasymulować błąd
  if (body.title === "ERROR") {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas przetwarzania żądania",
          details: "Test error",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Zwracamy utworzony dokument
  const mockCreatedDocument = {
    id: "test-doc-id",
    ...body,
    user_id: mockLocals.userId || "test-user-id",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return new Response(JSON.stringify(mockCreatedDocument), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
