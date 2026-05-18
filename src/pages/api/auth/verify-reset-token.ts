import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { logger } from "@/lib/services/logger.service";
import { cookieOptions } from "@/db/supabase.client";

export const prerender = false;

// Nazwa ciasteczka do przechowywania informacji o zweryfikowanym tokenie
const VERIFIED_TOKEN_COOKIE = "verified_reset_token";

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
      logger.info(`Otrzymane dane: ${JSON.stringify(body)}`);
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

    const { code } = body;
    logger.info(`Wyekstrahowany code: ${code}`);

    if (!code) {
      logger.warn(`Brak kodu w żądaniu. Body: ${JSON.stringify(body)}`);
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_TOKEN",
            message: "Brak tokenu resetowania hasła",
            details: "Token jest wymagany do weryfikacji",
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

    // Używamy exchangeCodeForSession, które jest właściwą metodą do przetwarzania tokenu z emaila
    logger.debug("Rozpoczynam wymianę tokenu na sesję...");
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error(`Błąd wymiany tokenu na sesję: ${error.message}`);
      return new Response(
        JSON.stringify({
          error: {
            code: "TOKEN_VERIFICATION_ERROR",
            message: "Nieprawidłowy lub wygasły token",
            details: error.message,
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!data.user) {
      logger.error("Brak danych użytkownika po wymianie tokenu");
      return new Response(
        JSON.stringify({
          error: {
            code: "USER_NOT_FOUND",
            message: "Nie znaleziono użytkownika",
            details: "Token jest prawidłowy, ale nie znaleziono powiązanego użytkownika",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    logger.info(`Wymiana tokenu na sesję zakończona sukcesem dla użytkownika: ${data.user.email}`);

    // Zapisz zweryfikowany token w ciasteczku
    cookies.set(
      VERIFIED_TOKEN_COOKIE,
      JSON.stringify({
        code,
        email: data.user.email,
      }),
      cookieOptions
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          email: data.user.email,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logger.error(`Błąd podczas weryfikacji tokenu: ${error instanceof Error ? error.message : "Nieznany błąd"}`);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił nieoczekiwany błąd podczas weryfikacji tokenu",
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
