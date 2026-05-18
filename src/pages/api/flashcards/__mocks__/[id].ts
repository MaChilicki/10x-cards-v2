import type { APIRoute } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlashcardUpdateDto } from "@/types";

export const prerender = false;

interface MockLocals {
  authorized?: boolean;
  userId?: string;
  supabase: SupabaseClient;
}

// Implementacja mocka dla funkcji GET
export const GET: APIRoute = async ({ params, locals }): Promise<Response> => {
  // Sprawdzamy autoryzację
  const mockLocals = locals as unknown as MockLocals;
  if (mockLocals.authorized === false) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Sprawdzamy czy ID fiszki jest dostępne
  const flashcardId = params.id;
  if (!flashcardId) {
    return new Response(
      JSON.stringify({
        error: {
          code: "MISSING_PARAMETER",
          message: "Brak wymaganego parametru",
          details: "ID fiszki jest wymagane",
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Zwracamy 404 dla nieistniejących fiszek
  if (flashcardId === "nonexistent-id") {
    return new Response(
      JSON.stringify({
        error: {
          code: "NOT_FOUND",
          message: "Fiszka nie została znaleziona",
          details: `Nie znaleziono fiszki o ID: ${flashcardId}`,
        },
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Symulujemy błąd serwera dla specjalnego ID
  if (flashcardId === "error-id" || (flashcardId === "test-flashcard-id" && locals.userId === "error-user")) {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas pobierania fiszki",
          details: "Test error",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Zwracamy fiszkę dla poprawnego ID
  const mockFlashcard = {
    id: flashcardId,
    front_original: "Pytanie testowe",
    back_original: "Odpowiedź testowa",
    front_modified: "Pytanie testowe",
    back_modified: "Odpowiedź testowa",
    topic_id: "test-topic-id",
    document_id: "test-document-id",
    user_id: mockLocals.userId || "test-user-id",
    created_at: "2025-05-13T20:14:55.186Z", // stała data dla testów
    updated_at: "2025-05-13T20:14:55.186Z", // stała data dla testów
    is_approved: true,
    source: "manual",
  };

  return new Response(JSON.stringify(mockFlashcard), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

// Implementacja mocka dla funkcji PUT
export const PUT: APIRoute = async ({ params, request, locals }): Promise<Response> => {
  // Sprawdzamy autoryzację
  const mockLocals = locals as unknown as MockLocals;
  if (mockLocals.authorized === false) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Sprawdzamy czy ID fiszki jest dostępne
  const flashcardId = params.id;
  if (!flashcardId) {
    return new Response(
      JSON.stringify({
        error: {
          code: "MISSING_PARAMETER",
          message: "Brak wymaganego parametru",
          details: "ID fiszki jest wymagane",
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
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

  // Sprawdzamy poprawność JSON - obsługujemy specjalny przypadek dla testInvalidJson
  if (request.headers.get("x-test-case") === "invalid-json") {
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

  let body: FlashcardUpdateDto;
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

  // Zwracamy 404 dla nieistniejących fiszek
  if (flashcardId === "nonexistent-id") {
    return new Response(
      JSON.stringify({
        error: {
          code: "NOT_FOUND",
          message: "Fiszka nie została znaleziona",
          details: `Nie znaleziono fiszki o ID: ${flashcardId}`,
        },
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Symulujemy błąd serwera dla specjalnego ID lub danych
  if (flashcardId === "error-id" || (body as FlashcardUpdateDto)?.front_modified === "ERROR") {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas aktualizacji fiszki",
          details: "Test error",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Zwracamy zaktualizowaną fiszkę
  const mockUpdatedFlashcard = {
    id: flashcardId,
    front_original: "Pytanie testowe",
    back_original: "Odpowiedź testowa",
    front_modified: body.front_modified || "Pytanie testowe",
    back_modified: body.back_modified || "Odpowiedź testowa",
    topic_id: "test-topic-id",
    document_id: "test-document-id",
    user_id: mockLocals.userId || "test-user-id",
    created_at: "2025-05-13T20:14:55.186Z", // stała data dla testów
    updated_at: "2025-05-13T20:14:55.186Z", // stała data dla testów
    is_approved: body.is_approved !== undefined ? body.is_approved : true,
    source: "manual",
  };

  return new Response(JSON.stringify(mockUpdatedFlashcard), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

// Implementacja mocka dla funkcji DELETE
export const DELETE: APIRoute = async ({ params, locals }): Promise<Response> => {
  // Sprawdzamy autoryzację
  const mockLocals = locals as unknown as MockLocals;
  if (mockLocals.authorized === false) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Sprawdzamy czy ID fiszki jest dostępne
  const flashcardId = params.id;
  if (!flashcardId) {
    return new Response(
      JSON.stringify({
        error: {
          code: "MISSING_PARAMETER",
          message: "Brak wymaganego parametru",
          details: "ID fiszki jest wymagane",
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Zwracamy 404 dla nieistniejących fiszek
  if (flashcardId === "nonexistent-id") {
    return new Response(
      JSON.stringify({
        error: {
          code: "NOT_FOUND",
          message: "Fiszka nie została znaleziona",
          details: `Nie znaleziono fiszki o ID: ${flashcardId}`,
        },
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Symulujemy błąd serwera dla specjalnego ID
  if (flashcardId === "error-id") {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas usuwania fiszki",
          details: "Test error",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Zwracamy 204 No Content dla poprawnego usunięcia
  return new Response(null, {
    status: 204,
  });
};
