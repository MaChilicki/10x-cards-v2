import type { APIRoute } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";

export const prerender = false;

interface MockLocals {
  authorized?: boolean;
  userId?: string;
  supabase: SupabaseClient;
}

// Implementacja mocka dla funkcji PATCH
export const PATCH: APIRoute = async ({ params, locals }): Promise<Response> => {
  // Sprawdzamy autoryzację
  const mockLocals = locals as unknown as MockLocals;
  if (mockLocals.authorized === false) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Walidacja ID fiszki
  if (!params.id) {
    return new Response(
      JSON.stringify({
        error: {
          code: "MISSING_PARAMETER",
          message: "Nie podano identyfikatora fiszki",
        },
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Walidacja formatu ID
  if (params.id.includes("!")) {
    return new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Nieprawidłowy format identyfikatora fiszki",
          details: { id: ["Nieprawidłowy format ID"] },
        },
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Sprawdzamy czy fiszka nie spełnia warunków zatwierdzenia
  if (params.id === "invalid-state-flashcard") {
    return new Response(
      JSON.stringify({
        error: {
          code: "INVALID_STATE",
          message: "Nie można zatwierdzić tej fiszki",
          details: "Fiszka nie spełnia warunków zatwierdzenia (musi być typu AI, niezatwierdzona i aktywna)",
        },
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Sprawdzamy czy mamy zasymulować błąd
  if (params.id === "error-flashcard") {
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
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Sukces
  const mockFlashcard = {
    id: params.id,
    front_original: "Pytanie testowe",
    back_original: "Odpowiedź testowa",
    front_modified: "Pytanie testowe",
    back_modified: "Odpowiedź testowa",
    is_approved: true,
    topic_id: "test-topic-id",
    document_id: "test-document-id",
    user_id: mockLocals.userId || "test-user-id",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source: "ai",
  };

  return new Response(
    JSON.stringify({
      message: "Fiszka została zatwierdzona pomyślnie",
      data: mockFlashcard,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
