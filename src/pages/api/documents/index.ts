import type { APIRoute } from "astro";
import { documentCreateSchema, documentsQuerySchema } from "../../../lib/schemas/documents.schema";
import { DocumentsService } from "../../../lib/services/documents.service";
import { logger } from "../../../lib/services/logger.service";
import { AiGenerateService } from "../../../lib/services/ai-generate.service";
import { checkAuthorization } from "../../../lib/services/auth.service";
import type { DocumentCreateDto } from "@/types";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }): Promise<Response> => {
  try {
    const authCheck = checkAuthorization(locals);
    if (!authCheck.authorized || !authCheck.userId) {
      return authCheck.response as Response;
    }

    const searchParams = Object.fromEntries(url.searchParams);
    const validationResult = documentsQuerySchema.safeParse(searchParams);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Nieprawidłowe parametry zapytania",
            details: validationResult.error.format(),
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const documentsService = new DocumentsService(locals.supabase, authCheck.userId);

    try {
      const result = await documentsService.listDocuments(validationResult.data);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Błąd podczas pobierania listy dokumentów:", error);
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Wystąpił błąd podczas pobierania listy dokumentów",
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

export const POST: APIRoute = async ({ request, locals }): Promise<Response> => {
  try {
    const authCheck = checkAuthorization(locals);
    if (!authCheck.authorized || !authCheck.userId) {
      return authCheck.response as Response;
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

    let body: DocumentCreateDto;
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

    const validationResult = documentCreateSchema.safeParse(body);
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

    const documentsService = new DocumentsService(locals.supabase, authCheck.userId);
    const aiGenerateService = new AiGenerateService(locals.supabase, authCheck.userId);

    try {
      const document = await documentsService.createDocument(validationResult.data);

      // Automatyczne generowanie fiszek po utworzeniu dokumentu
      try {
        if (!document.topic_id) {
          throw new Error("Dokument nie ma przypisanego tematu");
        }

        const { data: existingFlashcards, error: flashcardsError } = await locals.supabase
          .from("flashcards")
          .select("id")
          .eq("document_id", document.id)
          .limit(1);

        if (flashcardsError) {
          throw flashcardsError;
        }

        if (existingFlashcards && existingFlashcards.length > 0) {
          logger.info(`Dokument ${document.id} ma już wygenerowane fiszki, pomijam generowanie`);
          return new Response(JSON.stringify(document), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        }

        await aiGenerateService.generateFlashcards({
          text: document.content,
          document_id: document.id,
          topic_id: document.topic_id,
        });
        logger.info(`Pomyślnie wygenerowano fiszki dla dokumentu ${document.id}`);
      } catch (flashcardsError) {
        logger.error(`Błąd podczas generowania fiszek dla dokumentu ${document.id}:`, flashcardsError);
      }

      return new Response(JSON.stringify(document), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Błąd podczas tworzenia dokumentu:", error);
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Wystąpił błąd podczas tworzenia dokumentu",
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
    logger.error("Nieoczekiwany błąd podczas przetwarzania żądania POST:", error);
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
