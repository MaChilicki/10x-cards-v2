import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";
import { logger } from "@/lib/services/logger.service";

// Ścieżki, które nie wymagają autoryzacji
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/set-new-password",
  "/verify-email",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/verify-reset-token",
  "/api/auth/set-new-password",
  "/api/auth/session",
  "/api/auth/logout",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Sprawdź, czy mamy parametry weryfikacyjne w URL
  const token = url.searchParams.get("token");
  const type = url.searchParams.get("type");
  const token_hash = url.searchParams.get("token_hash");

  // Sprawdzamy, czy jest to przekierowanie z procesu weryfikacji Supabase
  const isSupabaseAuthRedirect = !!token_hash || url.searchParams.has("error_description");

  // Sprawdzamy parametry weryfikacyjne zarówno od Supabase jak i naszego API
  if ((token && type && type === "signup") || isSupabaseAuthRedirect) {
    if (url.pathname !== "/verify-email") {
      logger.info("Wykryto parametry weryfikacyjne w URL, przekierowuję na /verify-email");

      // Przekazujemy wszystkie parametry z URL do strony weryfikacyjnej
      const params = new URLSearchParams(url.search);
      return redirect(`/verify-email?${params.toString()}`);
    }
  }

  // Sprawdź, czy ścieżka jest publiczna
  if (PUBLIC_PATHS.some((path) => url.pathname.startsWith(path))) {
    return next();
  }

  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Przypisujemy instancję supabase do locals, aby była dostępna w API endpointach
  locals.supabase = supabase;

  try {
    // Pobieramy i weryfikujemy użytkownika używając getUser()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    // Jeśli nie ma użytkownika, przekieruj do logowania
    if (!user) {
      return redirect("/login");
    }

    // Sprawdź, czy użytkownik ma email
    if (!user.email) {
      return redirect("/login");
    }

    // Dodaj dane użytkownika do kontekstu
    locals.user = {
      id: user.id,
      email: user.email,
      email_verified: user.email_confirmed_at !== null,
      raw_user_meta_data: user.user_metadata || {},
    };

    // Dodaj konfigurację Supabase do kontekstu
    locals.supabaseUrl = import.meta.env.SUPABASE_URL;
    locals.supabaseAnonKey = import.meta.env.SUPABASE_KEY;

    return next();
  } catch (error) {
    logger.error("Błąd podczas sprawdzania autoryzacji", error);
    return redirect("/login");
  }
});
