import type { APIRoute } from "astro";
import type { SupabaseClient } from "../../../../db/supabase.client";

export const prerender = false;

interface MockLocals {
  authorized?: boolean;
  userId?: string;
  supabase: SupabaseClient;
}

// Implementacja mocka dla funkcji GET
export const GET: APIRoute = async ({ params, locals }): Promise<Response> => {
  // Sprawdzamy autoryzację
  const mockLocals = locals as unknown as MockLocals;
  if (mockLocals.authorized === false) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Sprawdzamy, czy mamy id dokumentu
  const documentId = params.id;
  if (!documentId) {
    return new Response(
      JSON.stringify({
        error: {
          code: "MISSING_PARAMETER",
          message: "Brak ID dokumentu",
          details: "Parametr 'id' jest wymagany",
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Symulujemy nieistniejący dokument
  if (documentId === "nonexistent-id") {
    return new Response(
      JSON.stringify({
        error: {
          code: "NOT_FOUND",
          message: "Dokument nie został znaleziony",
          details: `Dokument o ID ${documentId} nie istnieje`,
        },
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Symulujemy błąd serwera
  if (documentId === "error-id") {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas pobierania dokumentu",
          details: "Test error",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Zwracamy dokument
  const mockDocument = {
    id: documentId,
    title: "Test Document",
    content: "Test content",
    topic_id: "test-topic-id",
    user_id: mockLocals.userId || "test-user-id",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return new Response(JSON.stringify(mockDocument), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
