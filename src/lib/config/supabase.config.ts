import { z } from "zod";
import { logger } from "@/lib/services/logger.service";

const supabaseEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string().min(1),
});

// Funkcja do bezpiecznego uzyskiwania zmiennych środowiskowych
const getSafeEnv = () => {
  try {
    // Sprawdź czy jesteśmy w środowisku serwerowym czy klienckim
    if (typeof window !== "undefined") {
      // W środowisku klienckim - użyj wartości przekazanych z AstroLocals
      if (window.__ASTRO_LOCALS__?.supabaseUrl && window.__ASTRO_LOCALS__?.supabaseAnonKey) {
        return {
          SUPABASE_URL: window.__ASTRO_LOCALS__.supabaseUrl,
          SUPABASE_KEY: window.__ASTRO_LOCALS__.supabaseAnonKey,
        };
      }

      // Fallback - użyj zmiennych ze środowiska Vite (jeśli dostępne)
      if (import.meta.env.SUPABASE_URL && import.meta.env.SUPABASE_KEY) {
        return {
          SUPABASE_URL: import.meta.env.SUPABASE_URL,
          SUPABASE_KEY: import.meta.env.SUPABASE_KEY,
        };
      }

      // Ostrzeżenie, jeśli brak zmiennych w środowisku klienckim
      logger.warn("Brak zmiennych środowiskowych Supabase w środowisku klienckim");
      return {
        SUPABASE_URL: "",
        SUPABASE_KEY: "",
      };
    }

    // W środowisku serwerowym - użyj zmiennych ze środowiska
    return {
      SUPABASE_URL: import.meta.env.SUPABASE_URL,
      SUPABASE_KEY: import.meta.env.SUPABASE_KEY,
    };
  } catch (error) {
    logger.error("Błąd podczas pobierania zmiennych środowiskowych", error);
    throw error;
  }
};

// Spróbuj sparsować zmienne środowiskowe
let env: z.infer<typeof supabaseEnvSchema>;

try {
  env = supabaseEnvSchema.parse(getSafeEnv());
} catch (error) {
  // W przypadku błędu - zwróć puste zmienne
  logger.error("Błąd walidacji zmiennych środowiskowych Supabase", error);

  // W środowisku produkcyjnym rzucamy błąd, w środowisku dev używamy pustych wartości
  if (import.meta.env.PROD) {
    throw error;
  }

  env = {
    SUPABASE_URL: "",
    SUPABASE_KEY: "",
  };
}

export const supabaseConfig = {
  url: env.SUPABASE_URL,
  anonKey: env.SUPABASE_KEY,
} as const;

// Sprawdzenie czy window.__ASTRO_LOCALS__ istnieje
declare global {
  interface Window {
    __ASTRO_LOCALS__?: {
      supabaseUrl: string;
      supabaseAnonKey: string;
      user?: unknown;
      // Inne właściwości, które mogą być w Astro.locals
      [key: string]: unknown;
    };
  }
}
