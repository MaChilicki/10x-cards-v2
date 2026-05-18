import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { registerUser } from "@/lib/services/auth.service";
import { registerSchema } from "@/lib/schemas/auth.schema";
import { logger } from "@/lib/services/logger.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }): Promise<Response> => {
  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const data = await request.json();
    const validatedData = registerSchema.parse(data);

    await registerUser(supabase, validatedData);

    return new Response(
      JSON.stringify({
        success: true,
        redirectTo: "/verify-email",
      }),
      { status: 200 }
    );
  } catch (error) {
    logger.error("Błąd podczas rejestracji:", error);

    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Wystąpił nieoczekiwany błąd podczas rejestracji",
      }),
      { status: 500 }
    );
  }
};
