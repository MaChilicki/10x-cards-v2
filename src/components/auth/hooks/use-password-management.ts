import { useState } from "react";
import { logger } from "@/lib/services/logger.service";

interface UsePasswordManagementReturn {
  isLoading: boolean;
  error: Error | null;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setNewPassword: (password: string, token: string) => Promise<void>;
  verifyResetToken: (token: string) => Promise<{ email: string }>;
}

// Klasa błędu z dodatkowym kontekstem do obsługi specjalnych przypadków
class ApiError extends Error {
  constructor(
    message: string,
    public readonly cause: { code: string; details?: string }
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const usePasswordManagement = (): UsePasswordManagementReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Zmiana hasła dla zalogowanego użytkownika
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug("Rozpoczynam proces zmiany hasła");

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error(`Błąd podczas zmiany hasła: ${data.error?.message || "Nieznany błąd"}`);
        throw new ApiError(data.error?.message || "Wystąpił błąd podczas zmiany hasła", {
          code: data.error?.code || "UNKNOWN_ERROR",
          details: data.error?.details,
        });
      }

      logger.debug("Hasło zostało zmienione pomyślnie");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
        throw err;
      }
      const _error = err instanceof Error ? err : new Error("Nieznany błąd podczas zmiany hasła");
      logger.error(`Błąd zmiany hasła: ${_error.message}`);
      setError(_error);
      throw _error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset hasła (wysłanie linku resetującego)
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug(`Rozpoczynam proces resetowania hasła dla: ${email}`);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/set-new-password`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error(`Błąd podczas resetowania hasła: ${data.error?.message || "Nieznany błąd"}`);
        throw new ApiError(data.error?.message || "Wystąpił błąd podczas resetowania hasła", {
          code: data.error?.code || "UNKNOWN_ERROR",
          details: data.error?.details,
        });
      }

      logger.debug("Link do resetowania hasła został wysłany");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
        throw err;
      }
      const _error = err instanceof Error ? err : new Error("Nieznany błąd podczas resetowania hasła");
      logger.error(`Błąd resetowania hasła: ${_error.message}`);
      setError(_error);
      throw _error;
    } finally {
      setIsLoading(false);
    }
  };

  // Weryfikacja tokenu resetującego
  const verifyResetToken = async (token: string): Promise<{ email: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug("Weryfikacja tokenu resetującego hasło");
      logger.debug(`Token do weryfikacji: ${token}`);

      const response = await fetch("/api/auth/verify-reset-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: token }),
      });

      // Logowanie szczegółów odpowiedzi
      logger.debug(`Status odpowiedzi: ${response.status}`);

      const data = await response.json();
      logger.debug(`Zawartość odpowiedzi: ${JSON.stringify(data)}`);

      if (!response.ok) {
        logger.error(`Błąd podczas weryfikacji tokenu: ${data.error?.message || "Nieznany błąd"}`);

        // Sprawdź czy to specjalny kod błędu wymagający ręcznego emaila
        if (data.error?.code === "MANUAL_EMAIL_REQUIRED") {
          throw new ApiError(data.error.message || "Potrzebny ręczny adres email", {
            code: "MANUAL_EMAIL_REQUIRED",
            details: data.error?.details,
          });
        }

        throw new ApiError(data.error?.message || "Nie udało się zweryfikować tokenu", {
          code: data.error?.code || "UNKNOWN_ERROR",
          details: data.error?.details,
        });
      }

      // Sukces - pobierz email z odpowiedzi
      const userEmail = data.data?.email;

      if (!userEmail) {
        logger.error("Brak adresu email w odpowiedzi");
        throw new ApiError("Nie udało się pobrać adresu email", {
          code: "EMAIL_NOT_FOUND",
          details: "Serwer nie zwrócił adresu email",
        });
      }

      logger.debug(`Token zweryfikowany pomyślnie dla: ${userEmail}`);
      return { email: userEmail };
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
        throw err;
      }
      const _error = err instanceof Error ? err : new Error("Nieznany błąd podczas weryfikacji tokenu");
      logger.error(`Błąd weryfikacji tokenu: ${_error.message}`);
      setError(_error);
      throw _error;
    } finally {
      setIsLoading(false);
    }
  };

  // Ustawienie nowego hasła po resecie
  const setNewPassword = async (password: string, token: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug(`Ustawianie nowego hasła`);
      logger.debug(`Token do resetowania hasła: ${token}`);

      const response = await fetch("/api/auth/set-new-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          confirmPassword: password,
        }),
      });

      // Logowanie szczegółów odpowiedzi
      logger.debug(`Status odpowiedzi set-new-password: ${response.status}`);

      const data = await response.json();
      logger.debug(`Zawartość odpowiedzi set-new-password: ${JSON.stringify(data)}`);

      if (!response.ok) {
        logger.error(`Błąd podczas ustawiania nowego hasła: ${data.error?.message || "Nieznany błąd"}`);
        throw new ApiError(data.error?.message || "Wystąpił błąd podczas ustawiania nowego hasła", {
          code: data.error?.code || "UNKNOWN_ERROR",
          details: data.error?.details,
        });
      }

      logger.debug("Nowe hasło zostało ustawione pomyślnie");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
        throw err;
      }
      const _error = err instanceof Error ? err : new Error("Nieznany błąd podczas ustawiania nowego hasła");
      logger.error(`Błąd ustawiania nowego hasła: ${_error.message}`);
      setError(_error);
      throw _error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    changePassword,
    resetPassword,
    setNewPassword,
    verifyResetToken,
  };
};
