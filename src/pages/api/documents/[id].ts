import type { APIRoute } from "astro";
import { documentUpdateSchema } from "../../../lib/schemas/documents.schema";
import { DocumentsService } from "../../../lib/services/documents.service";
import { logger } from "../../../lib/services/logger.service";
import { checkAuthorization } from "../../../lib/services/auth.service";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }): Promise<Response> => {
  try {
    const authCheck = checkAuthorization(locals);
    if (!authCheck.authorized || !authCheck.userId) {
      return authCheck.response as Response;
    }

    const documentId = params.id;
    if (!documentId) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_PARAMETER",
            message: "Brak wymaganego parametru",
            details: "ID dokumentu jest wymagane",
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
      const document = await documentsService.getDocumentById(documentId);
      if (!document) {
        return new Response(
          JSON.stringify({
            error: {
              code: "NOT_FOUND",
              message: "Dokument nie został znaleziony",
              details: `Nie znaleziono dokumentu o ID: ${documentId}`,
            },
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify(document), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error(`Błąd podczas pobierania dokumentu ${documentId}:`, error);
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Wystąpił błąd podczas pobierania dokumentu",
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

    const documentId = params.id;
    if (!documentId) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_PARAMETER",
            message: "Brak wymaganego parametru",
            details: "ID dokumentu jest wymagane",
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

    const validationResult = documentUpdateSchema.safeParse(body);
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

    try {
      const document = await documentsService.updateDocument(documentId, validationResult.data);
      if (!document) {
        return new Response(
          JSON.stringify({
            error: {
              code: "NOT_FOUND",
              message: "Dokument nie został znaleziony",
              details: `Nie znaleziono dokumentu o ID: ${documentId}`,
            },
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify(document), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error(`Błąd podczas aktualizacji dokumentu ${documentId}:`, error);
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Wystąpił błąd podczas aktualizacji dokumentu",
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

    const documentId = params.id;
    if (!documentId) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_PARAMETER",
            message: "Brak wymaganego parametru",
            details: "ID dokumentu jest wymagane",
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
      await documentsService.deleteDocument(documentId);
      return new Response(null, {
        status: 204,
      });
    } catch (error) {
      logger.error(`Błąd podczas usuwania dokumentu ${documentId}:`, error);
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Wystąpił błąd podczas usuwania dokumentu",
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
