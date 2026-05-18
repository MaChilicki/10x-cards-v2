import { createClient } from "@supabase/supabase-js";
import { createServerClient, createBrowserClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "../db/database.types";
import type { AstroCookies } from "astro";
import { supabaseConfig } from "../lib/config/supabase.config";
import { logger } from "@/lib/services/logger.service";

// Klient dla operacji niewymagających sesji użytkownika
export const supabaseClient = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey);

export type SupabaseClient = typeof supabaseClient;

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

// Klient na stronę serwerową - używany w API endpoints i middleware
export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};

// Singleton do przechowywania jednej instancji klienta przeglądarki
let browserClientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Klient dla autoryzacji i operacji na stronie klienta
export const createSupabaseBrowserClient = () => {
  if (typeof window === "undefined") {
    logger.error("createSupabaseBrowserClient: Funkcja może być używana tylko w komponencie klienckim");
    throw new Error("Ta funkcja może być używana tylko w komponencie klienckim");
  }

  // Jeśli instancja już istnieje, zwróć ją
  if (browserClientInstance) {
    return browserClientInstance;
  }

  const supabaseUrl = window.__ASTRO_LOCALS__?.supabaseUrl || import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = window.__ASTRO_LOCALS__?.supabaseAnonKey || import.meta.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error("createSupabaseBrowserClient: Brak wymaganych danych konfiguracyjnych Supabase");
    throw new Error("Brak wymaganych danych konfiguracyjnych Supabase");
  }

  // Zgodnie z wytycznymi Supabase używamy cookies.getAll i cookies.setAll
  logger.debug(`Inicjalizacja klienta Supabase w przeglądarce: ${supabaseUrl}`);

  // Utwórz nową instancję tylko jeśli jeszcze nie istnieje
  browserClientInstance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions,
    cookies: {
      getAll() {
        // Pobieranie wszystkich ciasteczek z przeglądarki
        return parseCookieHeader(document.cookie);
      },
      setAll(cookiesToSet) {
        // Ustawianie ciasteczek w przeglądarce
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookieString = `${name}=${value}`;

          if (options?.expires) {
            cookieString += `; expires=${options.expires.toUTCString()}`;
          }
          if (options?.maxAge) {
            cookieString += `; max-age=${options.maxAge}`;
          }
          if (options?.domain) {
            cookieString += `; domain=${options.domain}`;
          }
          if (options?.path) {
            cookieString += `; path=${options.path}`;
          }
          if (options?.secure) {
            cookieString += "; secure";
          }
          if (options?.httpOnly) {
            cookieString += "; httpOnly";
          }
          if (options?.sameSite) {
            cookieString += `; samesite=${options.sameSite}`;
          }

          document.cookie = cookieString;
        });
      },
    },
  });

  return browserClientInstance;
};
