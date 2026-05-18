import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { logoutUser } from "@/lib/services/auth.service";
import { logger } from "@/lib/services/logger.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }): Promise<Response> => {
  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    await logoutUser(supabase);

    logger.info("Pomyślnie wylogowano użytkownika");

    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Nieoczekiwany błąd podczas wylogowania:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił nieoczekiwany błąd podczas wylogowania",
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
