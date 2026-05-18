import { z } from "zod";

const openRouterEnvSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_BASE_URL: z.string().url(),
  OPENROUTER_DEFAULT_MODEL: z.string().min(1),
});

// Walidacja zmiennych środowiskowych
const env = openRouterEnvSchema.parse({
  OPENROUTER_API_KEY: import.meta.env.OPENROUTER_API_KEY,
  OPENROUTER_BASE_URL: import.meta.env.OPENROUTER_BASE_URL,
  OPENROUTER_DEFAULT_MODEL: import.meta.env.OPENROUTER_DEFAULT_MODEL,
});

export const openRouterConfig = {
  apiKey: env.OPENROUTER_API_KEY,
  baseUrl: env.OPENROUTER_BASE_URL,
  defaultModel: env.OPENROUTER_DEFAULT_MODEL,
} as const;
