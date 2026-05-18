import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../lib/services/flashcards.service";
import { flashcardUpdateSchema } from "../../../lib/schemas/flashcards.schema";
import { logger } from "../../../lib/services/logger.service";
import { checkAuthorization } from "../../../lib/services/auth.service";
import type { FlashcardUpdateDto } from "@/types";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }): Promise<Response> => {
  try {
    const authCheck = checkAuthorization(locals);
    if (!authCheck.authorized || !authCheck.userId) {
      return authCheck.response as Response;
    }

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

    const flashcardsService = new FlashcardsService(locals.supabase, authCheck.userId);

    try {
      const flashcard = await flashcardsService.getFlashcardById(flashcardId);
      if (!flashcard) {
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

      return new Response(JSON.stringify(flashcard), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error(`Błąd podczas pobierania fiszki ${flashcardId}:`, error);
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Wystąpił błąd podczas pobierania fiszki",
            details: error instanceof Error ? error.message : "Nieznany błąd",
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    logger.error("Nieoczekiwany błąd podczas przetwarzania żądania GET:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił nieoczekiwany błąd",
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

export const PUT: APIRoute = async ({ params, request, locals }): Promise<Response> => {
  try {
    const authCheck = checkAuthorization(locals);
    if (!authCheck.authorized || !authCheck.userId) {
      return authCheck.response as Response;
    }

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

    const validationResult = flashcardUpdateSchema.safeParse(body);
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

    const flashcardsService = new FlashcardsService(locals.supabase, authCheck.userId);

    try {
      const result = await flashcardsService.updateFlashcard(flashcardId, validationResult.data, 0);
      const flashcard = result.flashcard;

      if (!flashcard) {
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

      return new Response(JSON.stringify(flashcard), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error(`Błąd podczas aktualizacji fiszki ${flashcardId}:`, error);
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Wystąpił błąd podczas aktualizacji fiszki",
            details: error instanceof Error ? error.message : "Nieznany błąd",
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    logger.error("Nieoczekiwany błąd podczas przetwarzania żądania PUT:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił nieoczekiwany błąd",
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

export const DELETE: APIRoute = async ({ params, locals }): Promise<Response> => {
  try {
    const authCheck = checkAuthorization(locals);
    if (!authCheck.authorized || !authCheck.userId) {
      return authCheck.response as Response;
    }

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

    const flashcardsService = new FlashcardsService(locals.supabase, authCheck.userId);

    try {
      // Najpierw pobieramy fiszkę, aby sprawdzić jej source
      const flashcard = await flashcardsService.getFlashcardById(flashcardId);
      if (!flashcard) {
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

      await flashcardsService.deleteFlashcard(flashcardId, flashcard.source);

      return new Response(null, {
        status: 204,
      });
    } catch (error) {
      logger.error(`Błąd podczas usuwania fiszki ${flashcardId}:`, error);
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Wystąpił błąd podczas usuwania fiszki",
            details: error instanceof Error ? error.message : "Nieznany błąd",
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    logger.error("Nieoczekiwany błąd podczas przetwarzania żądania DELETE:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił nieoczekiwany błąd",
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
