import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { logger } from "@/lib/services/logger.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
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
      logger.info(`Otrzymane dane dla reset-password: ${JSON.stringify(body)}`);
    } catch (error) {
      logger.error(`Błąd parsowania JSON: ${error instanceof Error ? error.message : "Nieznany błąd"}`);
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

    const { email, redirectTo } = body;

    if (!email) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_EMAIL",
            message: "Brak adresu email",
            details: "Adres email jest wymagany do resetowania hasła",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${new URL(request.url).origin}/set-new-password`,
    });

    if (error) {
      logger.error(`Błąd podczas resetowania hasła: ${error.message}`);
      return new Response(
        JSON.stringify({
          error: {
            code: "RESET_PASSWORD_ERROR",
            message: error.message,
            details: "Nie udało się wysłać emaila resetującego hasło",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    logger.info(`Email resetujący hasło został wysłany na adres: ${email}`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Link do resetowania hasła został wysłany na podany adres email",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logger.error(
      `Nieoczekiwany błąd podczas resetowania hasła: ${error instanceof Error ? error.message : "Nieznany błąd"}`
    );
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił nieoczekiwany błąd podczas resetowania hasła",
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
