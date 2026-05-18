import type { APIRoute } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";

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
  let offset: string | null = null;
  let topicId: string | null = null;
  let documentId: string | null = null;
  let approved: string | null = null;
  let source: string | null = null;

  // Próbujemy pobrać parametry z różnych źródeł
  // 1. Z URL w kontekście
  if (url?.search) {
    const params = new URLSearchParams(url.search);
    limit = params.get("limit");
    offset = params.get("offset");
    topicId = params.get("topic_id");
    documentId = params.get("document_id");
    approved = params.get("approved");
    source = params.get("source");
  }
  // 2. Z URL w obiekcie Request
  else if (request?.url) {
    try {
      const requestUrl = new URL(request.url);
      const params = new URLSearchParams(requestUrl.search);
      limit = params.get("limit");
      offset = params.get("offset");
      topicId = params.get("topic_id");
      documentId = params.get("document_id");
      approved = params.get("approved");
      source = params.get("source");
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
      offset = params.get("offset");
      topicId = params.get("topic_id");
      documentId = params.get("document_id");
      approved = params.get("approved");
      source = params.get("source");
    } catch {
      // Ignorujemy błędy parsowania URL
    }
  }

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

  // Walidacja parametrów
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

  if (offset && isNaN(Number(offset))) {
    return new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Nieprawidłowe parametry zapytania",
          details: { offset: ["Musi być liczbą"] },
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Symulacja paginacji na podstawie offset i limit
  const limitNum = limit ? Number(limit) : 10;
  const offsetNum = offset ? Number(offset) : 0;

  // Zwracamy mocki fiszek
  const allMockFlashcards = [
    {
      id: "test-flashcard-1",
      front_original: "Pytanie 1",
      back_original: "Odpowiedź 1",
      front_modified: "Pytanie 1",
      back_modified: "Odpowiedź 1",
      topic_id: topicId || "test-topic-1",
      document_id: documentId || "test-doc-1",
      user_id: mockLocals.userId || "test-user-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_approved: approved === "true" || true,
      source: source || "manual",
    },
    {
      id: "test-flashcard-2",
      front_original: "Pytanie 2",
      back_original: "Odpowiedź 2",
      front_modified: "Pytanie 2",
      back_modified: "Odpowiedź 2",
      topic_id: topicId || "test-topic-2",
      document_id: documentId || "test-doc-2",
      user_id: mockLocals.userId || "test-user-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_approved: approved === "true" || false,
      source: source || "ai",
    },
    {
      id: "test-flashcard-3",
      front_original: "Pytanie 3",
      back_original: "Odpowiedź 3",
      front_modified: "Pytanie 3",
      back_modified: "Odpowiedź 3",
      topic_id: topicId || "test-topic-1",
      document_id: documentId || "test-doc-1",
      user_id: mockLocals.userId || "test-user-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_approved: approved === "true" || true,
      source: source || "manual",
    },
  ];

  // Zwracamy tylko te fiszki, które pasują do filtrów
  const filteredFlashcards = allMockFlashcards.filter((flashcard) => {
    if (topicId && flashcard.topic_id !== topicId) return false;
    if (documentId && flashcard.document_id !== documentId) return false;
    if (approved && flashcard.is_approved !== (approved === "true")) return false;
    if (source && flashcard.source !== source) return false;
    return true;
  });

  // Stosujemy paginację
  const paginatedFlashcards = filteredFlashcards.slice(offsetNum, offsetNum + limitNum);

  const mockResponse = {
    flashcards: paginatedFlashcards,
    total_count: filteredFlashcards.length,
  };

  return new Response(JSON.stringify(mockResponse), {
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
  if (!body.front_original || !body.back_original || !body.document_id || !body.topic_id) {
    return new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Brak wymaganych pól",
          details: {
            front_original: !body.front_original ? ["Pole wymagane"] : [],
            back_original: !body.back_original ? ["Pole wymagane"] : [],
            document_id: !body.document_id ? ["Pole wymagane"] : [],
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
  if (body.front_original === "ERROR") {
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

  // Zwracamy utworzoną fiszkę
  const mockCreatedFlashcard = {
    id: "test-flashcard-id",
    ...body,
    front_modified: body.front_modified || body.front_original,
    back_modified: body.back_modified || body.back_original,
    user_id: mockLocals.userId || "test-user-id",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_approved: body.is_approved || false,
    source: body.source || "manual",
  };

  return new Response(JSON.stringify(mockCreatedFlashcard), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
