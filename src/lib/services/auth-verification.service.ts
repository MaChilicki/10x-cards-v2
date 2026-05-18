import { type SupabaseClient } from "@/db/supabase.client";
import { logger } from "./logger.service";

interface VerificationResult {
  isVerified: boolean;
  error: string;
  errorDetails: string;
}

/**
 * Serwis do zarządzania procesem weryfikacji emaila
 */
export const AuthVerificationService = {
  /**
   * Weryfikuje token z linku aktywacyjnego
   */
  async verifyEmailToken(supabase: SupabaseClient, token: string, type: string | null): Promise<VerificationResult> {
    let isVerified = false;
    let error = "";
    let errorDetails = "";

    if (!type || type !== "signup") {
      logger.error(`Nieobsługiwany typ tokena: ${type}`);
      return {
        isVerified: false,
        error: "Nieobsługiwany typ tokena",
        errorDetails: `Typ tokena '${type}' nie jest obsługiwany dla weryfikacji email`,
      };
    }

    try {
      logger.info("Próba weryfikacji adresu email z tokenem");

      // Próbujemy bezpośrednio użyć tokena do weryfikacji
      const { error: verificationError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "signup",
      });

      if (verificationError) {
        throw verificationError;
      }

      isVerified = true;
      logger.info("Weryfikacja adresu email zakończona sukcesem");
    } catch (e: unknown) {
      isVerified = false;
      const errorMessage = e instanceof Error ? e.message : "Nieznany błąd";
      error = "Weryfikacja nie powiodła się";
      errorDetails = errorMessage;
      logger.error(`Błąd weryfikacji tokenu: ${errorMessage}`);
    }

    return {
      isVerified,
      error,
      errorDetails,
    };
  },

  /**
   * Sprawdza czy użytkownik powinien być przekierowany
   * Zwraca ścieżkę do przekierowania lub null
   */
  async checkRedirectNeeded(supabase: SupabaseClient, hasVerificationToken = false) {
    try {
      // Sprawdzamy aktualną sesję użytkownika
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Jeśli użytkownik ma zweryfikowany email, przekierowujemy go na stronę główną
      if (user?.email_confirmed_at) {
        logger.info("Użytkownik ma już zweryfikowany email, przekierowuję na stronę główną");
        return "/";
      }

      // Jeśli mamy token weryfikacyjny, nie przekierowujemy
      if (hasVerificationToken) {
        logger.info("Wykryto token weryfikacyjny, pozostajemy na stronie weryfikacji");
        return null;
      }

      // Jeśli nie ma sesji, przekierowujemy na stronę logowania
      if (!session) {
        logger.info("Brak aktywnej sesji, przekierowuję na /login");
        return "/login";
      }

      // Brak potrzeby przekierowania
      return null;
    } catch (error) {
      logger.error("Błąd podczas sprawdzania statusu sesji", { error });

      // Jeśli mamy token weryfikacyjny, nie przekierowujemy nawet w przypadku błędu
      if (hasVerificationToken) {
        return null;
      }

      return "/login"; // W razie błędu, przekierowujemy na logowanie
    }
  },

  /**
   * Pobiera email użytkownika z sesji
   */
  async getUserEmailFromSession(supabase: SupabaseClient): Promise<string> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.user?.email || "";
    } catch (error) {
      logger.error("Błąd podczas pobierania emaila z sesji", { error });
      return "";
    }
  },
};
