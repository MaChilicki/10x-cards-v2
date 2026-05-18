import { z } from "zod";

// Schema dla ID tematu
export const topicIdSchema = z.string().uuid();

// Schema dla parametrów zapytania GET /api/topics
export const topicsQuerySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
  name: z.string().optional(),
  parent_id: z.string().optional(),
  sort: z
    .string()
    .default("name")
    .pipe(z.enum(["name", "created_at", "updated_at"])),
});

// Schema dla tworzenia nowego tematu
export const topicCreateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  parent_id: z.string().uuid().nullable().optional(),
});

// Schema dla aktualizacji tematu
export const topicUpdateSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Przynajmniej jedno pole musi być zaktualizowane",
  });

// Typy inferowane ze schematów
export type TopicsQueryParams = z.infer<typeof topicsQuerySchema>;
export type TopicCreateParams = z.infer<typeof topicCreateSchema>;
export type TopicUpdateParams = z.infer<typeof topicUpdateSchema>;
