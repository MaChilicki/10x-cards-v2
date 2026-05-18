import type { APIRoute } from "astro";
import type { SupabaseClient } from "@/db/supabase.client";
import type { FlashcardAiGenerateDto } from "@/types";
import { AiGenerateService } from "../../../../lib/services/ai-generate.service";

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

  let body: FlashcardAiGenerateDto;
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
  if (!body.text || !body.document_id || !body.topic_id) {
    return new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Nieprawidłowe dane wejściowe",
          details: {
            text: !body.text ? ["Pole wymagane"] : [],
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

  // Tworzymy instancję serwisu AI
  const aiService = new AiGenerateService(mockLocals.supabase, mockLocals.userId || "test-user-id");

  try {
    // Wywołujemy metodę generateFlashcards przez instancję serwisu
    // To pozwoli na śledzenie wywołań mocka
    await aiService.generateFlashcards(body);

    // Zwracamy sukces
    return new Response(
      JSON.stringify({
        message: "Fiszki zostały pomyślnie wygenerowane",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
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
