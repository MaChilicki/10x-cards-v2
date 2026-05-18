import { useEffect, useState, useCallback } from "react";
import { logger } from "@/lib/services/logger.service";
import { createSupabaseBrowserClient } from "@/db/supabase.client";
import type { ExtendedUser } from "@/types/auth.types";
import type { UseFormReturn } from "react-hook-form";

// Nie deklarujemy typów globalnych, używamy typu dla lokalnej zmiennej
type WindowWithAstroLocals = Window & {
  __ASTRO_LOCALS__?: {
    user?: ExtendedUser;
    supabaseUrl: string;
    supabaseAnonKey: string;
    [key: string]: unknown;
  };
};

// Definiujemy typy dla logowania
interface LoginCredentials {
  email: string;
  password: string;
}

// Definiujemy typ dla formularza logowania
interface LoginFormFields {
  email: string;
  password: string;
  [key: string]: string | unknown;
}

interface SignInResult {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    email_verified: boolean;
    raw_user_meta_data?: Record<string, unknown>;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Definiujemy typ dla funkcji signIn
type SignInFunction = (
  credentials: LoginCredentials,
  formInstance?: UseFormReturn<LoginFormFields>
) => Promise<SignInResult>;

interface UseAuthReturn {
  user: ExtendedUser | null;
  isLoading: boolean;
  error: Error | null;
  signIn: SignInFunction;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const mapUserData = (user: ExtendedUser | null): ExtendedUser | null => {
  if (!user) return null;

  // Pobierz dane z metadanych użytkownika
  const metadata = user.user_metadata || {};
  const rawMetadata = user.raw_user_meta_data || {};

  // Połącz metadane z różnych źródeł
  const firstName = metadata.firstName || rawMetadata.firstName || user.firstName;
  const lastName = metadata.lastName || rawMetadata.lastName || user.lastName;

  logger.debug(`Mapowanie danych użytkownika: ${user.id}, ${firstName}, ${lastName}`);

  return {
    ...user,
    firstName,
    lastName,
    raw_user_meta_data: {
      ...rawMetadata,
      firstName,
      lastName,
    },
  };
};

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [supabase, setSupabase] = useState<ReturnType<typeof createSupabaseBrowserClient> | null>(null);

  // Inicjalizacja klienta Supabase
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return undefined;
    }

    const initializeSupabase = async () => {
      try {
        logger.debug("Inicjalizacja klienta Supabase w useAuth");

        // Wykorzystanie zoptymalizowanej funkcji z supabase.client.ts
        const client = createSupabaseBrowserClient();
        setSupabase(client);

        // Próbujemy najpierw pobrać dane z Astro.locals, które są dostępne natychmiast
        const win = window as WindowWithAstroLocals;
        const astroUser = win.__ASTRO_LOCALS__?.user;

        // Jeżeli mamy dane użytkownika w Astro.locals, używamy ich od razu
        if (astroUser && "id" in astroUser) {
          logger.debug(`Używam danych użytkownika z Astro.locals: ${astroUser.id}`);
          setUser(mapUserData(astroUser as ExtendedUser));
        }

        // Mimo to próbujemy zweryfikować użytkownika przez Supabase dla pełnego bezpieczeństwa
        try {
          // Używamy getUser() zgodnie z zaleceniami Supabase
          const {
            data: { user },
            error: userError,
          } = await client.auth.getUser();

          if (!userError && user) {
            logger.debug(`Znaleziono dane użytkownika: ${user.id}`);
            setUser(mapUserData(user));
            return;
          } else if (userError) {
            logger.debug(`Błąd getUser(): ${userError.message}. Próbuję getSession()...`);
          }
        } catch (err) {
          logger.debug(
            `Wyjątek przy getUser(): ${err instanceof Error ? err.message : "Nieznany błąd"}. Próbuję getSession()...`
          );
        }

        // Jeśli getUser() zawiodło, próbujemy fallback na getSession()
        try {
          const {
            data: { session },
            error: sessionError,
          } = await client.auth.getSession();

          if (sessionError) {
            throw sessionError;
          }

          if (session?.user) {
            logger.debug(`Znaleziono sesję użytkownika: ${session.user.id}`);
            setUser(mapUserData(session.user));
          } else if (!astroUser) {
            // Tylko jeśli nie mamy ani danych z Astro.locals, ani z getUser(), ani z getSession()
            logger.debug("Brak aktywnej sesji użytkownika");
            setUser(null);
          }
        } catch (sessionErr) {
          // Jeśli nie udało się pobrać sesji, ale mamy dane z Astro.locals, to już zostały ustawione
          if (!astroUser) {
            logger.debug(
              `Błąd podczas pobierania sesji: ${sessionErr instanceof Error ? sessionErr.message : "Nieznany błąd"}`
            );
            setUser(null);
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Błąd podczas inicjalizacji klienta Supabase");
        logger.error(`Błąd inicjalizacji klienta Supabase: ${error.message}`);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSupabase();
    return undefined;
  }, []);

  const refreshSession = useCallback(async () => {
    if (!supabase) {
      logger.warn("Próba odświeżenia sesji bez zainicjalizowanego klienta Supabase");
      setIsLoading(false);
      return false;
    }

    try {
      setIsLoading(true);
      logger.debug("Odświeżanie danych sesji i użytkownika");

      // Próbujemy sekwencyjnie różne metody pobierania danych użytkownika,
      // zaczynając od najbardziej bezpiecznej (getSession)
      let userData: ExtendedUser | null = null;

      // 1. Próba z getSession
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!sessionError && session?.user) {
          userData = session.user;
          logger.debug(`Sesja odświeżona pomyślnie: ${userData.id}`);
        } else if (sessionError) {
          logger.debug(`Błąd przy getSession: ${sessionError.message}`);
        }
      } catch (sessionErr) {
        logger.debug(`Wyjątek przy getSession: ${sessionErr instanceof Error ? sessionErr.message : "Nieznany błąd"}`);
      }

      // 2. Jeśli getSession nie zwróciło użytkownika, spróbuj z getUser
      if (!userData) {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (!userError && user) {
            userData = user;
            logger.debug(`Dane użytkownika odświeżone pomyślnie: ${userData.id}`);
          } else if (userError) {
            logger.debug(`Błąd przy getUser: ${userError.message}`);
          }
        } catch (userErr) {
          logger.debug(`Wyjątek przy getUser: ${userErr instanceof Error ? userErr.message : "Nieznany błąd"}`);
        }
      }

      // 3. Aktualizacja stanu
      if (userData) {
        setUser(mapUserData(userData));
        return true; // Informacja, że pomyślnie odświeżono dane użytkownika
      } else {
        logger.debug("Brak danych użytkownika po próbie odświeżenia - może to być normalne zaraz po logowaniu");
        setUser(null);
        return false; // Informacja, że nie udało się odświeżyć danych użytkownika
      }
    } catch (error) {
      logger.error(
        `Błąd podczas odświeżania danych sesji i użytkownika: ${error instanceof Error ? error.message : "Nieznany błąd"}`
      );
      return false; // Informacja, że nie udało się odświeżyć danych użytkownika
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Nasłuchiwanie na zmiany w autoryzacji
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Nasłuchujemy na zmiany w autoryzacji
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      try {
        setIsLoading(true);
        logger.debug(`Zmiana stanu autoryzacji: ${event}`);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Weryfikujemy dane użytkownika przez getUser() zamiast polegać na danych z sesji
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();

          if (error) {
            logger.error(`Błąd podczas weryfikacji użytkownika: ${error.message}`);
            setUser(null);
            return;
          }

          if (user) {
            logger.debug(`Zalogowano użytkownika: ${user.id}, zdarzenie: ${event}`);
            setUser(mapUserData(user));
          }
        } else if (event === "SIGNED_OUT") {
          logger.debug("Wylogowano użytkownika");
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Funkcja logowania - nie używamy useCallback, aby uniknąć problemów z typowaniem
  const signIn: SignInFunction = async (credentials, formInstance) => {
    if (!supabase) {
      logger.error("Próba logowania bez zainicjalizowanego klienta Supabase");
      throw new Error("Klient Supabase nie jest zainicjalizowany");
    }

    try {
      setIsLoading(true);
      logger.debug("Rozpoczęcie procesu logowania");

      // Używamy API endpointu zamiast bezpośredniego wywołania supabase.auth
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const result = (await response.json()) as SignInResult;

      if (!response.ok) {
        // Obsługa błędów walidacji
        if (
          response.status === 400 &&
          result.error?.code === "VALIDATION_ERROR" &&
          result.error?.details &&
          formInstance
        ) {
          Object.entries(result.error.details).forEach(([field, errors]) => {
            try {
              // Upewniamy się, że field jest traktowane jako string
              const fieldName = field as string;
              // Używamy string jako FieldPath dla bezpieczeństwa typów
              formInstance.setError(fieldName, {
                message: Array.isArray(errors) ? errors[0] : String(errors),
              });
            } catch (err) {
              logger.error(`Nie można ustawić błędu dla pola ${field}`, err);
            }
          });
          throw new Error("Popraw błędy w formularzu");
        }

        // Obsługa wygaśnięcia sesji
        if (response.status === 401) {
          if (result.error?.code === "INVALID_CREDENTIALS") {
            throw new Error("Nieprawidłowy email lub hasło");
          }
          window.dispatchEvent(new Event("session-expired"));
          throw new Error("Sesja wygasła. Zaloguj się ponownie.");
        }

        // Obsługa błędów autoryzacji
        if (response.status === 403) {
          if (result.error?.code === "EMAIL_NOT_VERIFIED") {
            throw new Error("Email nie został zweryfikowany. Sprawdź swoją skrzynkę email.");
          }
          throw new Error("Brak dostępu. Sprawdź czy Twoje konto jest aktywne.");
        }

        throw new Error(result.error?.message || "Nieprawidłowy email lub hasło");
      }

      // Odświeżamy dane użytkownika po pomyślnym logowaniu
      await refreshSession();

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Błąd podczas logowania");
      logger.error(`Błąd podczas logowania: ${error.message}`);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (!supabase) {
      logger.error("Próba wylogowania bez zainicjalizowanego klienta Supabase");
      throw new Error("Supabase client nie jest zainicjalizowany");
    }

    try {
      setIsLoading(true);
      logger.debug("Rozpoczęcie procesu wylogowania");

      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error(`Błąd podczas wylogowania: ${error.message}`);
        throw error;
      }

      logger.debug("Wylogowano pomyślnie");
      setUser(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Błąd podczas wylogowania");
      logger.error(`Błąd podczas wylogowania: ${error.message}`);
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    signIn,
    signOut,
    refreshSession,
  };
};
