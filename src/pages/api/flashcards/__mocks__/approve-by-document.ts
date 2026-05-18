import type { APIRoute } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";

export const prerender = false;

interface MockLocals {
  authorized?: boolean;
  userId?: string;
  supabase: SupabaseClient;
}

// Implementacja mocka dla funkcji PATCH
export const PATCH: APIRoute = async ({ request, locals }): Promise<Response> => {
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
  if (!body.document_id) {
    return new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Nieprawidłowe dane wejściowe",
          details: { document_id: ["Pole wymagane"] },
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Sprawdzamy czy jest rzucony błąd dla określonego ID dokumentu
  if (body.document_id === "nieistniejacy-dokument-id") {
    return new Response(
      JSON.stringify({
        error: {
          code: "DOCUMENT_NOT_FOUND",
          message: "Nie znaleziono dokumentu o podanym identyfikatorze",
        },
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Sprawdzamy czy mamy zasymulować błąd
  if (body.document_id === "error-document-id") {
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

  // Sukces
  const mockResult = {
    approved_count: 3,
    flashcards: Array(3)
      .fill(0)
      .map((_, index) => ({
        id: `test-flashcard-${index + 1}`,
        front_original: `Pytanie ${index + 1}`,
        back_original: `Odpowiedź ${index + 1}`,
        front_modified: `Pytanie ${index + 1}`,
        back_modified: `Odpowiedź ${index + 1}`,
        is_approved: true,
        topic_id: "test-topic-id",
        document_id: body.document_id,
        user_id: mockLocals.userId || "test-user-id",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source: "ai",
      })),
  };

  return new Response(
    JSON.stringify({
      message: "Fiszki zostały zatwierdzone pomyślnie",
      data: {
        approved_count: mockResult.approved_count,
        flashcards: mockResult.flashcards,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
