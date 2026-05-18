import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { changePassword } from "@/lib/services/auth.service";
import { changePasswordSchema } from "@/lib/schemas/auth.schema";
import { logger } from "@/lib/services/logger.service";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Sprawdź czy użytkownik jest zalogowany
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn("Próba zmiany hasła bez zalogowania");
      return new Response(JSON.stringify({ message: "Nie jesteś zalogowany" }), { status: 401 });
    }

    // Sprawdź czy są niezapisane zmiany
    const hasUnsavedChanges = request.headers.get("X-Has-Unsaved-Changes") === "true";
    if (hasUnsavedChanges) {
      return new Response(
        JSON.stringify({
          error: {
            code: "UNSAVED_CHANGES",
            message: "Masz niezapisane zmiany",
            details: "Zapisz lub odrzuć zmiany przed zmianą hasła",
          },
        }),
        { status: 409 }
      );
    }

    // Walidacja danych wejściowych
    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      logger.warn(`Nieprawidłowy format danych do zmiany hasła: ${JSON.stringify(result.error.errors)}`);
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Nieprawidłowy format danych",
            details: result.error.errors,
          },
        }),
        { status: 400 }
      );
    }

    try {
      await changePassword(supabase, result.data);
      logger.info(`Hasło zostało zmienione dla użytkownika ${user.id}`);
      return new Response(JSON.stringify({ message: "Hasło zostało zmienione" }), { status: 200 });
    } catch (error) {
      if (error instanceof Error) {
        // Sprawdzamy czy to błąd nieprawidłowego aktualnego hasła
        if (error.message.includes("Invalid login credentials")) {
          return new Response(
            JSON.stringify({
              error: {
                code: "INVALID_CURRENT_PASSWORD",
                message: "Nieprawidłowe aktualne hasło",
                details: "Podane aktualne hasło jest nieprawidłowe",
              },
            }),
            { status: 400 }
          );
        }
        // Sprawdzamy czy to błąd takiego samego hasła
        if (error.message.includes("same_password")) {
          return new Response(
            JSON.stringify({
              error: {
                code: "SAME_PASSWORD",
                message: "Nowe hasło musi być inne niż poprzednie",
                details: "Podane nowe hasło jest takie samo jak aktualne",
              },
            }),
            { status: 400 }
          );
        }
      }
      throw error; // Jeśli to inny błąd, przekazujemy go dalej
    }
  } catch (error) {
    logger.error(
      `Nieoczekiwany błąd podczas zmiany hasła: ${error instanceof Error ? error.message : "Nieznany błąd"}`
    );
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił nieoczekiwany błąd",
          details: error instanceof Error ? error.message : "Nieznany błąd",
        },
      }),
      { status: 500 }
    );
  }
};
