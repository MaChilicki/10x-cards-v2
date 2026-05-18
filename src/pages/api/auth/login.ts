import { createSupabaseServerInstance } from "@/db/supabase.client";
import { loginSchema } from "@/lib/schemas/auth.schema";
import type { APIRoute } from "astro";
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
      logger.info(`Otrzymane dane: ${JSON.stringify(body)}`);
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

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Jeśli mamy token, próbujemy się zalogować z tokenem
    if (body.token) {
      logger.info(`Weryfikacja tokenu: ${body.token}`);
      try {
        // Najpierw próbujemy pobrać sesję
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          logger.error(`Błąd podczas pobierania sesji: ${sessionError.message}`);
          throw sessionError;
        }

        // Jeśli nie mamy sesji, próbujemy zweryfikować token
        if (!session) {
          // Próbujemy użyć tokenu jako token_hash
          const { data: tokenData, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: body.token,
            type: "recovery",
          });

          if (verifyError) {
            logger.error(`Błąd weryfikacji tokenu: ${verifyError.message}`);
            throw verifyError;
          }

          logger.info(`Token zweryfikowany pomyślnie, email: ${tokenData.user?.email}`);
          return new Response(
            JSON.stringify({
              success: true,
              message: "Token poprawny",
              data: {
                email: tokenData.user?.email,
              },
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Jeśli mamy sesję, zwracamy email z sesji
        logger.info(`Używam emaila z sesji: ${session.user.email}`);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Token poprawny",
            data: {
              email: session.user.email,
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
              code: "TOKEN_VERIFICATION_ERROR",
              message: "Nieprawidłowy lub wygasły token",
              details: error instanceof Error ? error.message : "Nieznany błąd",
            },
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Standardowe logowanie z email i hasłem
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn(`Błąd walidacji danych logowania: ${JSON.stringify(validationResult.error)}`);
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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: validationResult.data.email,
      password: validationResult.data.password,
    });

    if (signInError) {
      logger.error(`Błąd logowania: ${signInError.message}`);
      return new Response(
        JSON.stringify({
          error: {
            code: "SIGN_IN_ERROR",
            message: "Błędny login lub hasło",
            details: signInError.message,
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pobieramy dane użytkownika po pomyślnym zalogowaniu
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Zalogowano pomyślnie",
        user: user
          ? {
              id: user.id,
              email: user.email,
              email_verified: user.email_confirmed_at !== null,
              raw_user_meta_data: user.user_metadata,
            }
          : null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił nieoczekiwany błąd podczas logowania",
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
