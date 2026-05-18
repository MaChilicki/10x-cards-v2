import { z } from "zod";

export const flashcardAiRegenerateSchema = z
  .object({
    text: z
      .string()
      .min(1000, "Tekst musi mieć co najmniej 1000 znaków")
      .max(10000, "Tekst nie może przekraczać 10000 znaków")
      .optional(),
    document_id: z.string().uuid("Nieprawidłowy format UUID").optional(),
    topic_id: z.string().uuid("Nieprawidłowy format UUID").optional(),
    force_regenerate: z.boolean().default(false).optional(),
  })
  .refine((data) => data.text !== undefined || data.document_id !== undefined, {
    message: "Musisz podać tekst lub identyfikator dokumentu",
  });

export type FlashcardAiRegenerateSchema = z.infer<typeof flashcardAiRegenerateSchema>;
