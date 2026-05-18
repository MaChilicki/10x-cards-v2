import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "../__mocks__/approve";
import type { APIContext } from "astro";

// Mockujemy zewnętrzne zależności
vi.mock("../../../../../lib/services/logger.service", () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("PATCH /api/flashcards/[id]/approve", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien zwrócić 401, gdy użytkownik nie jest zalogowany", async () => {
    // Arrange
    const locals = { authorized: false, supabase: {} };
    const mockContext = {
      locals,
      params: { id: "test-flashcard-id" },
    } as unknown as APIContext;

    // Act
    const response = await PATCH(mockContext);

    // Assert
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("powinien zwrócić 400, gdy brakuje parametru ID", async () => {
    // Arrange
    const locals = { authorized: true, userId: "test-user-id", supabase: {} };
    const mockContext = {
      locals,
      params: {}, // Brak ID
    } as unknown as APIContext;

    // Act
    const response = await PATCH(mockContext);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "MISSING_PARAMETER");
  });

  it("powinien zwrócić 400, gdy ID fiszki nie przechodzi walidacji", async () => {
    // Arrange
    const locals = { authorized: true, userId: "test-user-id", supabase: {} };
    const mockContext = {
      locals,
      params: { id: "nieprawidlowe-id!" }, // Nieprawidłowy format ID
    } as unknown as APIContext;

    // Act
    const response = await PATCH(mockContext);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("powinien zwrócić 400, gdy fiszka nie spełnia warunków zatwierdzenia", async () => {
    // Arrange
    const flashcardId = "invalid-state-flashcard";

    const locals = { authorized: true, userId: "test-user-id", supabase: {} };
    const mockContext = {
      locals,
      params: { id: flashcardId },
    } as unknown as APIContext;

    // Act
    const response = await PATCH(mockContext);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INVALID_STATE");
  });

  it("powinien zwrócić 200 i zatwierdzić jedną fiszkę", async () => {
    // Arrange
    const flashcardId = "test-flashcard-id";

    const locals = { authorized: true, userId: "test-user-id", supabase: {} };
    const mockContext = {
      locals,
      params: { id: flashcardId },
    } as unknown as APIContext;

    // Act
    const response = await PATCH(mockContext);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("message", "Fiszka została zatwierdzona pomyślnie");
    expect(data.data).toHaveProperty("id", flashcardId);
    expect(data.data).toHaveProperty("is_approved", true);
  });

  it("powinien zwrócić 500, gdy wystąpi nieoczekiwany błąd", async () => {
    // Arrange
    const flashcardId = "error-flashcard";

    const locals = { authorized: true, userId: "test-user-id", supabase: {} };
    const mockContext = {
      locals,
      params: { id: flashcardId },
    } as unknown as APIContext;

    // Act
    const response = await PATCH(mockContext);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toHaveProperty("code", "INTERNAL_SERVER_ERROR");
    expect(data.error.details).toContain("Test error");
  });
});
