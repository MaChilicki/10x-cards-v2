import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { logger } from "@/lib/services/logger.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Sprawdzenie poprawności formatu danych wejściowych
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

    // Pobranie i walidacja danych z requestu
    let body;
    try {
      body = await request.json();
      logger.info(`Otrzymane dane dla set-new-password: ${JSON.stringify(body)}`);
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

    const { password, confirmPassword } = body;

    // Walidacja danych
    if (!password) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_PASSWORD",
            message: "Brak hasła",
            details: "Hasło jest wymagane",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (password !== confirmPassword) {
      return new Response(
        JSON.stringify({
          error: {
            code: "PASSWORDS_DONT_MATCH",
            message: "Hasła nie są identyczne",
            details: "Wprowadzone hasła muszą być identyczne",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Inicjalizacja klienta Supabase z obsługą ciasteczek zgodną z SSR
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Sprawdź czy mamy aktywną sesję
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      logger.error(`Brak aktywnej sesji: ${sessionError?.message || "Sesja wygasła"}`);
      return new Response(
        JSON.stringify({
          error: {
            code: "SESSION_MISSING",
            message: "Sesja wygasła lub jest nieprawidłowa",
            details: "Proszę rozpocznij proces resetowania hasła od nowa",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Aktualizacja hasła użytkownika używając istniejącej sesji
    logger.info("Aktualizacja hasła użytkownika");
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      logger.error(`Błąd podczas ustawiania nowego hasła: ${updateError.message}`);
      return new Response(
        JSON.stringify({
          error: {
            code: "PASSWORD_UPDATE_ERROR",
            message: "Nie udało się ustawić nowego hasła",
            details: updateError.message,
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    logger.info("Hasło zostało pomyślnie zmienione");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Hasło zostało pomyślnie zmienione",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logger.error(
      `Nieoczekiwany błąd podczas ustawiania nowego hasła: ${error instanceof Error ? error.message : "Nieznany błąd"}`
    );
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił nieoczekiwany błąd podczas ustawiania nowego hasła",
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
