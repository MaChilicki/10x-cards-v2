import type { APIRoute } from "astro";
import { TopicsService } from "../../../lib/services/topics.service";
import { logger } from "../../../lib/services/logger.service";
import type { TopicCreateDto } from "@/types";
import { topicsQuerySchema, topicCreateSchema } from "../../../lib/schemas/topics.schema";
import { checkAuthorization } from "../../../lib/services/auth.service";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }): Promise<Response> => {
  try {
    const authCheck = checkAuthorization(locals);
    if (!authCheck.authorized || !authCheck.userId) {
      return authCheck.response as Response;
    }

    const searchParams = Object.fromEntries(url.searchParams);
    logger.info(`GET /api/topics - Parametry zapytania: ${JSON.stringify(searchParams)}`);

    const validationResult = topicsQuerySchema.safeParse(searchParams);

    if (!validationResult.success) {
      logger.warn(`GET /api/topics - Błąd walidacji parametrów: ${JSON.stringify(validationResult.error.format())}`);
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

    logger.info(`GET /api/topics - Tworzę TopicsService z userId: ${authCheck.userId}`);
    const topicsService = new TopicsService(locals.supabase, authCheck.userId);

    try {
      logger.info(
        `GET /api/topics - Próba pobrania listy tematów z parametrami: ${JSON.stringify(validationResult.data)}`
      );
      const result = await topicsService.list(validationResult.data);
      logger.info(`GET /api/topics - Pobrano ${result.topics.length} tematów`);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Błąd podczas pobierania listy tematów:", error);
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Wystąpił błąd podczas pobierania listy tematów",
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

    let body: TopicCreateDto;
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

    const validationResult = topicCreateSchema.safeParse(body);
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

    const topicsService = new TopicsService(locals.supabase, authCheck.userId);

    try {
      const topic = await topicsService.create(validationResult.data);
      return new Response(JSON.stringify(topic), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Błąd podczas tworzenia tematu:", error);
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Wystąpił błąd podczas tworzenia tematu",
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
