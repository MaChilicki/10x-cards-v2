import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../../lib/services/flashcards.service";
import { logger } from "../../../../lib/services/logger.service";
import { flashcardIdSchema } from "../../../../lib/schemas/flashcards.schema";
import { checkAuthorization } from "../../../../lib/services/auth.service";

export const prerender = false;

export const PATCH: APIRoute = async ({ params, locals }): Promise<Response> => {
  try {
    const authCheck = checkAuthorization(locals);
    if (!authCheck.authorized || !authCheck.userId) {
      return authCheck.response as Response;
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

    try {
      // Walidacja formatu ID przy użyciu Zod
      const validationResult = flashcardIdSchema.safeParse(params.id);
      if (!validationResult.success) {
        return new Response(
          JSON.stringify({
            error: {
              code: "VALIDATION_ERROR",
              message: "Nieprawidłowy format identyfikatora fiszki",
              details: validationResult.error.format(),
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

      const flashcardsService = new FlashcardsService(locals.supabase, authCheck.userId);
      const flashcard = await flashcardsService.approveOne(validationResult.data);

      return new Response(
        JSON.stringify({
          message: "Fiszka została zatwierdzona pomyślnie",
          data: flashcard,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("nie spełnia warunków")) {
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
      throw error;
    }
  } catch (error) {
    logger.error("Błąd podczas zatwierdzania fiszki:", error);

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas przetwarzania żądania",
          details: error instanceof Error ? error.message : "Nieznany błąd",
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
};
