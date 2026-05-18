import type { APIRoute } from "astro";
import { logger } from "@/lib/services/logger.service";
import { checkAuthorization } from "../../../lib/services/auth.service";

export const prerender = false;

export const GET: APIRoute = async ({ locals }): Promise<Response> => {
  try {
    const authCheck = checkAuthorization(locals);
    if (!authCheck.authorized || !authCheck.userId || !locals.user) {
      return authCheck.response as Response;
    }

    // Zwracamy tylko niezbędne dane użytkownika
    const userData = {
      id: locals.user.id,
      email: locals.user.email,
      email_verified: locals.user.email_verified,
      raw_user_meta_data: locals.user.raw_user_meta_data,
    };

    logger.info(`Pobrano dane użytkownika: ${locals.user.email}`);
    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Nieoczekiwany błąd podczas pobierania danych użytkownika:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił nieoczekiwany błąd podczas pobierania danych użytkownika",
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
