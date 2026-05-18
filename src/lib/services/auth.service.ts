import { logger } from "./logger.service";
import type { APIContext } from "astro";
import type { SupabaseClient } from "@/db/supabase.client";
import type { RegisterData, LoginData, ResetPasswordData, ChangePasswordData } from "../schemas/auth.schema";

export const AUTH_ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INVALID_TOKEN: "INVALID_TOKEN",
  EXPIRED_TOKEN: "EXPIRED_TOKEN",
  UNSAVED_CHANGES: "UNSAVED_CHANGES",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export interface AuthorizationResult {
  authorized: boolean;
  response?: Response;
  userId?: string;
}

export function checkAuthorization(locals: APIContext["locals"]): AuthorizationResult {
  if (!locals.user?.id) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          error: {
            code: "UNAUTHORIZED",
            message: "Brak aktywnej sesji",
            details: "Zaloguj się ponownie, aby kontynuować",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      ),
    };
  }

  if (!locals.user.email_verified) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          error: {
            code: "EMAIL_NOT_VERIFIED",
            message: "Email nie jest zweryfikowany",
            details: "Zweryfikuj swój email, aby kontynuować",
          },
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      ),
    };
  }

  return {
    authorized: true,
    userId: locals.user.id,
  };
}

export async function registerUser(supabase: SupabaseClient, data: RegisterData) {
  try {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
        emailRedirectTo: "http://localhost:3000/verify-email",
      },
    });

    if (error) {
      logger.error("Błąd podczas rejestracji:", error);
      throw new Error(error.message);
    }

    logger.info(`Zarejestrowano użytkownika ${data.email}`);
    return { success: true };
  } catch (error) {
    logger.error("Błąd podczas rejestracji:", error);
    throw error;
  }
}

export async function loginUser(supabase: SupabaseClient, data: LoginData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      logger.error("Błąd podczas logowania:", error);
      throw new Error(error.message);
    }

    logger.info(`Zalogowano użytkownika ${data.email}`);
    return { success: true, data: authData };
  } catch (error) {
    logger.error("Błąd podczas logowania:", error);
    throw error;
  }
}

export async function resetPassword(supabase: SupabaseClient, data: ResetPasswordData) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: "http://localhost:3000/set-new-password",
    });

    if (error) {
      logger.error("Błąd podczas resetowania hasła:", error);
      throw new Error(error.message);
    }

    logger.info(`Wysłano link do resetowania hasła dla ${data.email}`);
    return { success: true };
  } catch (error) {
    logger.error("Błąd podczas resetowania hasła:", error);
    throw error;
  }
}

async function updateUserPassword(supabase: SupabaseClient, newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    logger.error("Błąd podczas aktualizacji hasła:", error);
    throw new Error(error.message);
  }

  logger.info("Hasło zostało zaktualizowane");
  return { success: true };
}

export async function changePassword(supabase: SupabaseClient, data: ChangePasswordData) {
  try {
    // Najpierw sprawdzamy czy aktualne hasło jest poprawne
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user?.email || "",
      password: data.currentPassword,
    });

    if (signInError) {
      logger.error("Błąd podczas weryfikacji aktualnego hasła:", signInError);
      throw new Error("Invalid login credentials");
    }

    // Jeśli aktualne hasło jest poprawne, zmieniamy na nowe
    return await updateUserPassword(supabase, data.password);
  } catch (error) {
    logger.error("Błąd podczas zmiany hasła:", error);
    throw error;
  }
}

export async function setNewPassword(supabase: SupabaseClient, data: { password: string }) {
  try {
    return await updateUserPassword(supabase, data.password);
  } catch (error) {
    logger.error("Błąd podczas ustawiania nowego hasła:", error);
    throw error;
  }
}

export async function verifyEmail(supabase: SupabaseClient, token: string) {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });

    if (error) {
      logger.error("Błąd podczas weryfikacji emaila:", error);
      throw new Error(error.message);
    }

    logger.info("Email został zweryfikowany");
    return { success: true };
  } catch (error) {
    logger.error("Błąd podczas weryfikacji emaila:", error);
    throw error;
  }
}

export async function logoutUser(supabase: SupabaseClient) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error("Błąd podczas wylogowania:", error);
      throw new Error(error.message);
    }

    logger.info("Użytkownik został wylogowany");
    return { success: true };
  } catch (error) {
    logger.error("Błąd podczas wylogowania:", error);
    throw error;
  }
}
