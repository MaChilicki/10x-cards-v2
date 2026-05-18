import type { APIRoute } from "astro";
import type { SupabaseClient } from "@/db/supabase.client";
import { AiGenerateService } from "../../../../lib/services/ai-generate.service";
import { flashcardAiRegenerateSchema } from "../../../../lib/schemas/ai-regenerate.schema";
import type { z } from "zod";

export const prerender = false;

interface MockLocals {
  authorized?: boolean;
  userId?: string;
  supabase: SupabaseClient;
}

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

  // Sprawdzamy poprawność JSON - obsługujemy specjalny przypadek dla testów
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

  let body: z.infer<typeof flashcardAiRegenerateSchema>;
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
  if (!body.document_id && !body.text) {
    return new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Nieprawidłowe dane wejściowe",
          details: {
            document_id: !body.document_id && !body.text ? ["Wymagany document_id lub text"] : [],
          },
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Tworzymy instancję serwisu AI
  const aiService = new AiGenerateService(mockLocals.supabase, mockLocals.userId || "test-user-id");

  try {
    // Sprawdzamy czy mamy zasymulować błąd
    if ((body.text && body.text === "ERROR") || (body.document_id && body.document_id === "ERROR")) {
      throw new Error("Test error");
    }

    // Wywołujemy metodę regenerateFlashcards przez instancję serwisu
    // To pozwoli na śledzenie wywołań mocka
    await aiService.regenerateFlashcards(body);

    // Przygotowujemy specyficzną odpowiedź w zależności od typu zapytania
    let result;

    // Szczególne przypadki dla różnych testów
    if (body.document_id === "test-document-id" && body.topic_id === "test-topic-id") {
      // Dla testu regeneracji z dokumentu
      result = {
        flashcards: [
          {
            front_original: "Regenerowane pytanie 1",
            back_original: "Regenerowana odpowiedź 1",
            topic_id: "test-topic-id",
            document_id: "test-document-id",
            source: "ai",
            is_approved: false,
          },
          {
            front_original: "Regenerowane pytanie 2",
            back_original: "Regenerowana odpowiedź 2",
            topic_id: "test-topic-id",
            document_id: "test-document-id",
            source: "ai",
            is_approved: false,
          },
        ],
        deleted_count: 3,
      };
    } else if (body.text === "Tekst do regeneracji fiszek" && body.topic_id === "test-topic-id") {
      // Dla testu regeneracji z tekstu
      result = {
        flashcards: [
          {
            front_original: "Regenerowane pytanie z tekstu",
            back_original: "Regenerowana odpowiedź z tekstu",
            topic_id: "test-topic-id",
            source: "ai",
            is_approved: false,
          },
        ],
        deleted_count: 0,
      };
    } else {
      // Domyślny przypadek
      result = {
        flashcards: [
          {
            front_original: "Regenerowane pytanie",
            back_original: "Regenerowana odpowiedź",
            topic_id: body.topic_id || "default-topic-id",
            document_id: body.document_id || undefined,
            source: "ai",
            is_approved: false,
          },
        ],
        deleted_count: body.document_id ? 3 : 0,
      };
    }

    // Zwracamy sukces
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Zwracamy błąd
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas generowania fiszek",
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
