import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { logger } from "@/lib/services/logger.service";

export const GET: APIRoute = async ({ cookies, url, request }) => {
  try {
    const token = url.searchParams.get("token");
    const type = url.searchParams.get("type");
    const token_hash = url.searchParams.get("token_hash");

    // Jeśli mamy token_hash, dajmy priorytet weryfikacji przez token_hash
    if (token_hash) {
      logger.info("Wykryto token_hash, weryfikuję email przez parametry Supabase");
      const supabase = createSupabaseServerInstance({
        cookies,
        headers: request.headers,
      });

      // Sprawdzamy czy użytkownik jest zweryfikowany po przekierowaniu z Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email_confirmed_at) {
        logger.info("Email jest już zweryfikowany");
        return new Response(
          JSON.stringify({
            message: "Email został zweryfikowany",
            redirectTo: "/",
            verified: true,
          }),
          { status: 200 }
        );
      }

      return new Response(
        JSON.stringify({
          message: "Oczekiwanie na weryfikację emaila",
          verified: false,
        }),
        { status: 200 }
      );
    }

    // Standardowa weryfikacja przez token z naszego API
    if (!token || type !== "signup") {
      logger.warn(`Próba weryfikacji z nieprawidłowym tokenem lub typem: token=${token}, type=${type}`);
      return new Response(JSON.stringify({ error: "Nieprawidłowy token lub typ weryfikacji" }), { status: 400 });
    }

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Weryfikacja emaila bezpośrednio przez Supabase
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });

    if (error) {
      logger.error("Błąd weryfikacji emaila", { error });
      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
        }),
        { status: 400 }
      );
    }

    logger.info("Email został pomyślnie zweryfikowany");

    return new Response(
      JSON.stringify({
        message: "Email został zweryfikowany",
        redirectTo: "/",
        verified: true,
      }),
      { status: 200 }
    );
  } catch (error) {
    logger.error("Nieoczekiwany błąd podczas weryfikacji emaila", { error });
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd",
        code: "UNEXPECTED_ERROR",
      }),
      { status: 500 }
    );
  }
};
