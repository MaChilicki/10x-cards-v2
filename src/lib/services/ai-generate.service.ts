import type { SupabaseClient } from "@/db/supabase.client";
import type {
  FlashcardAiGenerateDto,
  FlashcardAiResponse,
  FlashcardProposalDto,
  AiRegenerateResponseDto,
} from "../../types";
import { logger } from "./logger.service";
import { FlashcardsService } from "./flashcards.service";
import { flashcardAiRegenerateSchema } from "../schemas/ai-regenerate.schema";
import { z } from "zod";
import { OpenRouterService } from "./openrouter.service";
import fs from "fs";
import path from "path";
import { openRouterConfig } from "../config/openrouter.config";

interface AiFlashcard {
  front_original: string;
  back_original: string;
}

export class AiGenerateService {
  private flashcardsService: FlashcardsService;
  private openRouterService: OpenRouterService;
  private readonly systemPrompt: string;

  constructor(
    private supabase: SupabaseClient,
    private readonly userId: string
  ) {
    this.flashcardsService = new FlashcardsService(supabase, userId);
    this.openRouterService = new OpenRouterService(openRouterConfig);

    // Wczytanie promptu systemowego z pliku
    const promptPath = path.join(process.cwd(), "src/lib/prompts/generate-flashcards.md");
    try {
      this.systemPrompt = fs.readFileSync(promptPath, "utf-8");
    } catch (error) {
      logger.error("Nie udało się wczytać promptu systemowego", error);
      throw new Error("Nie udało się wczytać promptu systemowego");
    }
  }

  private async saveFlashcards(flashcards: FlashcardProposalDto[]): Promise<void> {
    try {
      const flashcardsWithUser = flashcards.map((flashcard) => ({
        ...flashcard,
        user_id: this.userId,
        // Kopiowanie wartości z pól _original do pól _modified
        front_modified: flashcard.front_original,
        back_modified: flashcard.back_original,
      }));
      await this.flashcardsService.createFlashcards(flashcardsWithUser);
      logger.debug(`Zapisano ${flashcards.length} fiszek w bazie danych`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
      logger.error(`Błąd podczas zapisywania fiszek: ${errorMessage}`, error);
      throw new Error(`Nie udało się zapisać fiszek: ${errorMessage}`);
    }
  }

  async generateFlashcards(data: FlashcardAiGenerateDto): Promise<FlashcardAiResponse> {
    const MAX_RETRIES = 5;
    const INITIAL_DELAY = 1000; // 1 sekunda
    const MAX_DELAY = 10000; // 10 sekund

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        logger.debug(
          `Próba generowania fiszek (próba ${attempt + 1}/${MAX_RETRIES})${data.document_id ? ` dla dokumentu ${data.document_id}` : ""}`
        );

        const response = await this.openRouterService.chat(this.systemPrompt, data.text, {
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "flashcards_response",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  flashcards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        front_original: { type: "string" },
                        back_original: { type: "string" },
                      },
                      required: ["front_original", "back_original"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["flashcards"],
                additionalProperties: false,
              },
            },
          },
        });

        const aiFlashcards = JSON.parse(response.choices[0].message.content).flashcards as AiFlashcard[];

        // Walidacja odpowiedzi
        if (!Array.isArray(aiFlashcards) || aiFlashcards.length === 0) {
          throw new Error("Otrzymano nieprawidłową odpowiedź - brak fiszek w odpowiedzi");
        }

        const flashcards: FlashcardProposalDto[] = aiFlashcards.map((flashcard) => ({
          front_original: flashcard.front_original,
          back_original: flashcard.back_original,
          topic_id: data.topic_id,
          document_id: data.document_id,
          source: "ai",
          is_approved: false,
        }));

        // Walidacja długości pól fiszek i skracanie jeśli potrzeba
        const validatedFlashcards = flashcards.map((flashcard) => {
          if (flashcard.front_original.length > 200) {
            logger.warn(`Skrócono przód fiszki z ${flashcard.front_original.length} do 200 znaków`);
            flashcard.front_original = flashcard.front_original.substring(0, 197) + "...";
          }

          if (flashcard.back_original.length > 500) {
            logger.warn(`Skrócono tył fiszki z ${flashcard.back_original.length} do 500 znaków`);
            flashcard.back_original = flashcard.back_original.substring(0, 497) + "...";
          }

          return flashcard;
        });

        logger.debug(
          `Wygenerowano ${validatedFlashcards.length} fiszek${data.document_id ? ` dla dokumentu ${data.document_id}` : ""}`
        );

        await this.saveFlashcards(validatedFlashcards);

        return {
          flashcards: validatedFlashcards,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";

        // Jeśli to ostatnia próba, rzuć błąd
        if (attempt === MAX_RETRIES - 1) {
          logger.error(
            `Ostatnia próba generowania fiszek nie powiodła się${data.document_id ? ` dla dokumentu ${data.document_id}` : ""}: ${errorMessage}`,
            error
          );
          throw new Error(`Nie udało się wygenerować fiszek po ${MAX_RETRIES} próbach: ${errorMessage}`);
        }

        // Oblicz opóźnienie z exponential backoff i jitter
        const delay = Math.min(INITIAL_DELAY * Math.pow(2, attempt) + Math.random() * 1000, MAX_DELAY);

        logger.warn(
          `Próba ${attempt + 1}/${MAX_RETRIES} nie powiodła się. Ponowna próba za ${Math.round(delay / 1000)} sekund. Błąd: ${errorMessage}`
        );

        // Poczekaj przed następną próbą
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Ta linia nie powinna być nigdy osiągnięta, ale TypeScript wymaga zwrócenia wartości
    throw new Error("Nie udało się wygenerować fiszek");
  }

  async regenerateFlashcards(data: z.infer<typeof flashcardAiRegenerateSchema>): Promise<AiRegenerateResponseDto> {
    try {
      let textToProcess = data.text;
      let documentTopicId = data.topic_id;
      let deletedCount = 0;

      // Jeśli podano document_id, pobierz dokument i jego tekstową zawartość
      if (data.document_id) {
        logger.debug(`Regeneracja fiszek dla dokumentu: ${data.document_id}`);

        // Sprawdzenie istnienia dokumentu
        const { data: document, error: documentError } = await this.supabase
          .from("documents")
          .select("*")
          .eq("id", data.document_id)
          .single();

        if (documentError || !document) {
          throw new Error(`Nie znaleziono dokumentu o ID: ${data.document_id}`);
        }

        // Ustawienie tekstowej zawartości dokumentu jako źródło do generacji fiszek
        textToProcess = document.content;
        // Użyj topic_id z dokumentu, jeśli nie został jawnie przekazany
        documentTopicId = data.topic_id || document.topic_id || undefined;

        // Usunięcie wszystkich istniejących fiszek AI dla dokumentu
        const { data: deletedFlashcards, error: deleteError } = await this.supabase
          .from("flashcards")
          .delete()
          .eq("document_id", data.document_id)
          .eq("source", "ai")
          .select("id");

        if (deleteError) {
          throw new Error(`Błąd podczas usuwania istniejących fiszek: ${deleteError.message}`);
        }

        deletedCount = deletedFlashcards?.length || 0;
        logger.info(`Usunięto ${deletedCount} istniejących fiszek AI dla dokumentu ${data.document_id}`);
      }

      // Sprawdzenie czy text jest dostępny do przetworzenia
      if (!textToProcess) {
        throw new Error("Brak tekstu do przetworzenia. Podaj tekst lub poprawne ID dokumentu.");
      }

      // Wygenerowanie nowych fiszek z tekstu
      const aiGenerateDto: FlashcardAiGenerateDto = {
        text: textToProcess,
        topic_id: documentTopicId,
        document_id: data.document_id,
      };

      const generationResult = await this.generateFlashcards(aiGenerateDto);

      return {
        flashcards: generationResult.flashcards,
        deleted_count: deletedCount,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
      logger.error(`Błąd podczas regeneracji fiszek: ${errorMessage}`, error);
      throw error;
    }
  }
}
