import { z } from "zod";

export const flashcardAiGenerateSchema = z.object({
  text: z
    .string()
    .min(1000, "Tekst musi mieć co najmniej 1000 znaków")
    .max(10000, "Tekst nie może przekraczać 10000 znaków"),
  topic_id: z.string().uuid("Nieprawidłowy format UUID").optional(),
  document_id: z.string().uuid("Nieprawidłowy format UUID").optional(),
});

export type FlashcardAiGenerateSchema = typeof flashcardAiGenerateSchema;
