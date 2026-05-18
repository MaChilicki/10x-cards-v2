import type { SupabaseClient } from "@/db/supabase.client";
import type {
  FlashcardDto,
  FlashcardsListResponseDto,
  PaginationDto,
  FlashcardCreateDto,
  FlashcardUpdate,
  FlashcardSource,
  Flashcard,
  FlashcardInsert,
  SpacedRepetitionData,
} from "../../types";
import type { FlashcardsQueryParams } from "../schemas/flashcards.schema";
import { logger } from "./logger.service";
import { FlashcardModificationService } from "./flashcard-modification.service";

export class FlashcardsService {
  private modificationService: FlashcardModificationService;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {
    this.modificationService = new FlashcardModificationService();
  }

  /**
   * Konwertuje dane JSON na SpacedRepetitionData
   */
  private parseSpacedRepetitionData(data: unknown): SpacedRepetitionData | undefined {
    if (!data || typeof data !== "object") return undefined;

    try {
      const parsed = data as Partial<SpacedRepetitionData>;

      // Sprawdzamy czy obiekt ma wszystkie wymagane pola i poprawne typy
      if (
        typeof parsed.repetitions === "number" &&
        typeof parsed.easiness_factor === "number" &&
        typeof parsed.interval === "number" &&
        typeof parsed.next_review_date === "string" &&
        typeof parsed.last_review_date === "string" &&
        Array.isArray(parsed.review_history) &&
        parsed.review_history.every(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            typeof item.date === "string" &&
            typeof item.grade === "number" &&
            typeof item.interval === "number"
        )
      ) {
        return parsed as SpacedRepetitionData;
      }

      return undefined;
    } catch (error) {
      logger.warn(`Błąd podczas parsowania spaced_repetition_data: ${error}`);
      return undefined;
    }
  }

  /**
   * Pobiera pojedynczą fiszkę po ID
   */
  async getFlashcardById(id: string): Promise<FlashcardDto | null> {
    try {
      const { data, error } = await this.supabase
        .from("flashcards")
        .select("*")
        .eq("id", id)
        .eq("is_disabled", false)
        .single();

      if (error) {
        logger.error("Błąd Supabase przy pobieraniu fiszki:", error);
        throw new Error(`Błąd podczas pobierania fiszki: ${error.message}`);
      }

      return data ? this.mapToFlashcardDtos([data])[0] : null;
    } catch (error) {
      logger.error("Błąd podczas pobierania fiszki:", error);
      throw new Error("Nie udało się pobrać fiszki");
    }
  }

  /**
   * Pobiera listę fiszek z paginacją i filtrowaniem
   */
  async getFlashcards(params: FlashcardsQueryParams): Promise<FlashcardsListResponseDto> {
    try {
      const {
        page = 1,
        limit = 10,
        sort,
        document_id,
        topic_id,
        source,
        is_approved,
        is_modified,
        is_disabled = false,
      } = params;

      logger.debug(
        `Parametry zapytania: ${JSON.stringify({ page, limit, sort, document_id, topic_id, source, is_approved, is_modified, is_disabled })}`
      );

      // Budowanie zapytania bazowego
      let query = this.supabase.from("flashcards").select("*", { count: "exact" });

      // Dodawanie filtrów
      if (document_id) {
        query = query.eq("document_id", document_id);
      }
      if (topic_id) {
        query = query.eq("topic_id", topic_id);
      }
      if (source) {
        query = query.eq("source", source);
      }
      if (is_approved !== undefined) {
        logger.debug(`Filtrowanie po is_approved: ${is_approved}, typ: ${typeof is_approved}`);
        query = query.eq("is_approved", is_approved);
      }
      if (is_modified !== undefined) {
        logger.debug(`Filtrowanie po is_modified: ${is_modified}, typ: ${typeof is_modified}`);
        query = query.eq("is_modified", is_modified);
      }

      // Zawsze filtrujemy po is_disabled
      logger.debug(`Filtrowanie po is_disabled: ${is_disabled}, typ: ${typeof is_disabled}`);
      query = query.eq("is_disabled", is_disabled);

      // Sortowanie
      if (sort) {
        const isDesc = sort.startsWith("-");
        const fieldName = isDesc ? sort.substring(1) : sort;

        // Specjalna obsługa sortowania po front_modified
        if (fieldName === "front_modified") {
          query = query
            .order("front_modified", { ascending: !isDesc, nullsFirst: false })
            .order("front_original", { ascending: !isDesc });
        } else {
          query = query.order(fieldName, { ascending: !isDesc });
        }
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Paginacja
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Wykonanie zapytania
      const { data, error, count } = await query;

      if (error) {
        logger.error("Błąd Supabase przy pobieraniu fiszek:", error);
        throw new Error(`Błąd podczas pobierania fiszek: ${error.message}`);
      }

      // Przygotowanie odpowiedzi
      const pagination: PaginationDto = {
        page,
        limit,
        total: count || 0,
      };

      return {
        data: this.mapToFlashcardDtos(data || []),
        pagination,
      };
    } catch (error) {
      logger.error("Błąd podczas pobierania fiszek:", error);
      throw new Error("Nie udało się pobrać fiszek");
    }
  }

  /**
   * Tworzy nowe fiszki
   */
  async createFlashcards(flashcards: FlashcardCreateDto[]): Promise<void> {
    try {
      const { error } = await this.supabase.from("flashcards").insert(
        flashcards.map((flashcard) => ({
          ...flashcard,
          user_id: this.userId,
          front_modified: flashcard.front_original,
          back_modified: flashcard.back_original,
          is_modified: false,
          is_disabled: false,
          // Dla fiszek manualnych zawsze ustawiamy is_approved na true
          is_approved: flashcard.source === "manual" ? true : flashcard.is_approved,
        }))
      );

      if (error) {
        logger.error("Błąd Supabase przy tworzeniu fiszek:", error);
        throw new Error(`Błąd podczas tworzenia fiszek: ${error.message}`);
      }

      logger.info(`Pomyślnie utworzono ${flashcards.length} fiszek`);
    } catch (error) {
      logger.error("Błąd podczas tworzenia fiszek:", error);
      throw new Error("Nie udało się utworzyć fiszek");
    }
  }

  /**
   * Aktualizuje fiszkę lub tworzy nową wersję jeśli stopień modyfikacji jest wystarczający (tylko dla fiszek AI)
   */
  async updateFlashcard(
    id: string,
    update: FlashcardUpdate,
    modificationPercentage: number
  ): Promise<{ flashcard: FlashcardDto; newFlashcard?: FlashcardDto }> {
    try {
      const originalFlashcard = await this.getFlashcardById(id);
      if (!originalFlashcard) {
        throw new Error("Nie znaleziono fiszki do aktualizacji");
      }

      // Dla fiszek manualnych zawsze aktualizujemy istniejącą fiszkę
      if (originalFlashcard.source === "manual") {
        const { data: updatedData, error: updateError } = await this.supabase
          .from("flashcards")
          .update({
            front_modified: update.front_modified || originalFlashcard.front_original,
            back_modified: update.back_modified || originalFlashcard.back_original,
          })
          .eq("id", id)
          .select()
          .single();

        if (updateError || !updatedData) {
          throw new Error(`Błąd podczas aktualizacji fiszki: ${updateError?.message}`);
        }

        return {
          flashcard: this.mapToFlashcardDtos([updatedData])[0],
        };
      }

      // Dla fiszek AI sprawdzamy stopień modyfikacji
      if (this.modificationService.shouldCreateNewVersion(modificationPercentage)) {
        // Oznaczamy oryginalną fiszkę jako zmodyfikowaną i nieaktywną
        const { error: updateError } = await this.supabase
          .from("flashcards")
          .update({
            is_modified: true,
            is_disabled: true,
            modification_percentage: modificationPercentage,
          })
          .eq("id", id);

        if (updateError) {
          throw new Error(`Błąd podczas aktualizacji oryginalnej fiszki: ${updateError.message}`);
        }

        // Tworzymy nową fiszkę jako manualną
        const newFrontModified = update.front_modified || originalFlashcard.front_original;
        const newBackModified = update.back_modified || originalFlashcard.back_original;

        const newFlashcard: FlashcardInsert = {
          front_original: newFrontModified,
          back_original: newBackModified,
          front_modified: newFrontModified,
          back_modified: newBackModified,
          topic_id: originalFlashcard.topic_id,
          document_id: originalFlashcard.document_id,
          source: "manual",
          is_approved: true,
          is_modified: false,
          is_disabled: false,
          user_id: this.userId,
          created_at: originalFlashcard.created_at, // Kopiujemy datę utworzenia z oryginalnej fiszki
        };

        const { data: newData, error: insertError } = await this.supabase
          .from("flashcards")
          .insert(newFlashcard)
          .select()
          .single();

        if (insertError || !newData) {
          throw new Error(`Błąd podczas tworzenia nowej wersji fiszki: ${insertError?.message}`);
        }

        return {
          flashcard: originalFlashcard,
          newFlashcard: this.mapToFlashcardDtos([newData])[0],
        };
      } else {
        // Aktualizujemy istniejącą fiszkę AI, zachowując oryginalne wartości
        const { data: updatedData, error: updateError } = await this.supabase
          .from("flashcards")
          .update({
            // Dla fiszek AI aktualizujemy tylko modified, zachowując oryginalne wartości
            front_modified: update.front_modified || originalFlashcard.front_original,
            back_modified: update.back_modified || originalFlashcard.back_original,
            modification_percentage: modificationPercentage,
            is_modified: modificationPercentage > 0,
          })
          .eq("id", id)
          .select()
          .single();

        if (updateError || !updatedData) {
          throw new Error(`Błąd podczas aktualizacji fiszki: ${updateError?.message}`);
        }

        return {
          flashcard: this.mapToFlashcardDtos([updatedData])[0],
        };
      }
    } catch (error) {
      logger.error("Błąd podczas aktualizacji fiszki:", error);
      throw new Error("Nie udało się zaktualizować fiszki");
    }
  }

  /**
   * Usuwa fiszkę (soft delete dla AI, hard delete dla manualnych)
   */
  async deleteFlashcard(id: string, source: FlashcardSource): Promise<void> {
    try {
      if (source === "ai") {
        // Soft delete dla fiszek AI
        const { error } = await this.supabase.from("flashcards").update({ is_disabled: true }).eq("id", id);

        if (error) {
          throw new Error(`Błąd podczas dezaktywacji fiszki: ${error.message}`);
        }
      } else {
        // Hard delete dla fiszek manualnych
        const { error } = await this.supabase.from("flashcards").delete().eq("id", id);

        if (error) {
          throw new Error(`Błąd podczas usuwania fiszki: ${error.message}`);
        }
      }

      logger.info(`Pomyślnie usunięto fiszkę ${id} (${source})`);
    } catch (error) {
      logger.error("Błąd podczas usuwania fiszki:", error);
      throw new Error("Nie udało się usunąć fiszki");
    }
  }

  /**
   * Mapuje encje bazodanowe na DTOs
   */
  private mapToFlashcardDtos(flashcards: Flashcard[]): FlashcardDto[] {
    return flashcards.map((flashcard) => ({
      id: flashcard.id,
      front_original: flashcard.front_original,
      back_original: flashcard.back_original,
      front_modified: flashcard.front_modified || flashcard.front_original,
      back_modified: flashcard.back_modified || flashcard.back_original,
      topic_id: flashcard.topic_id || undefined,
      document_id: flashcard.document_id || undefined,
      created_at: flashcard.created_at,
      updated_at: flashcard.updated_at,
      user_id: flashcard.user_id,
      modification_percentage: flashcard.modification_percentage || undefined,
      source: flashcard.source as FlashcardSource,
      is_approved: flashcard.is_approved,
      is_modified: flashcard.is_modified,
      is_disabled: flashcard.is_disabled,
      spaced_repetition_data: this.parseSpacedRepetitionData(flashcard.spaced_repetition_data),
      status: flashcard.is_approved ? "approved" : "pending", // Mapujemy status na podstawie is_approved
    }));
  }

  /**
   * Zatwierdza wiele fiszek jednocześnie
   * @param flashcard_ids Lista identyfikatorów fiszek do zatwierdzenia
   * @returns Liczba zatwierdzonych fiszek i ich dane
   */
  async approveBulk(flashcard_ids: string[]): Promise<{ approved_count: number; flashcards: FlashcardDto[] }> {
    try {
      // Aktualizujemy tylko fiszki AI, które nie są zatwierdzone i nie są dezaktywowane
      const { data, error } = await this.supabase
        .from("flashcards")
        .update({ is_approved: true })
        .in("id", flashcard_ids)
        .eq("source", "ai")
        .eq("is_approved", false)
        .eq("is_disabled", false)
        .select();

      if (error) {
        logger.error("Błąd podczas zatwierdzania fiszek:", error);
        throw new Error(`Błąd podczas zatwierdzania fiszek: ${error.message}`);
      }

      const approvedFlashcards = this.mapToFlashcardDtos(data || []);
      logger.info(`Pomyślnie zatwierdzono ${approvedFlashcards.length} fiszek`);

      return {
        approved_count: approvedFlashcards.length,
        flashcards: approvedFlashcards,
      };
    } catch (error) {
      logger.error("Błąd podczas zatwierdzania fiszek:", error);
      throw new Error("Nie udało się zatwierdzić fiszek");
    }
  }

  /**
   * Zatwierdza wszystkie fiszki dla danego dokumentu
   * @param document_id Identyfikator dokumentu
   * @returns Liczba zatwierdzonych fiszek i ich dane
   */
  async approveByDocument(document_id: string): Promise<{ approved_count: number; flashcards: FlashcardDto[] }> {
    try {
      // Sprawdzamy czy dokument istnieje
      const { data: document, error: documentError } = await this.supabase
        .from("documents")
        .select("id")
        .eq("id", document_id)
        .single();

      if (documentError || !document) {
        logger.error(`Dokument o ID ${document_id} nie istnieje`);
        throw new Error("Dokument nie istnieje");
      }

      // Aktualizujemy tylko fiszki AI, które nie są zatwierdzone i nie są dezaktywowane
      const { data, error } = await this.supabase
        .from("flashcards")
        .update({ is_approved: true })
        .eq("document_id", document_id)
        .eq("source", "ai")
        .eq("is_approved", false)
        .eq("is_disabled", false)
        .select();

      if (error) {
        logger.error("Błąd podczas zatwierdzania fiszek:", error);
        throw new Error(`Błąd podczas zatwierdzania fiszek: ${error.message}`);
      }

      const approvedFlashcards = this.mapToFlashcardDtos(data || []);
      logger.info(`Pomyślnie zatwierdzono ${approvedFlashcards.length} fiszek dla dokumentu ${document_id}`);

      return {
        approved_count: approvedFlashcards.length,
        flashcards: approvedFlashcards,
      };
    } catch (error) {
      logger.error("Błąd podczas zatwierdzania fiszek:", error);
      throw error;
    }
  }

  /**
   * Zatwierdza pojedynczą fiszkę
   * @param flashcard_id Identyfikator fiszki do zatwierdzenia
   * @returns Zatwierdzona fiszka
   */
  async approveOne(flashcard_id: string): Promise<FlashcardDto> {
    try {
      // Aktualizujemy tylko fiszki AI, które nie są zatwierdzone i nie są dezaktywowane
      const { data, error } = await this.supabase
        .from("flashcards")
        .update({ is_approved: true })
        .eq("id", flashcard_id)
        .eq("source", "ai")
        .eq("is_approved", false)
        .eq("is_disabled", false)
        .select()
        .single();

      if (error) {
        logger.error("Błąd podczas zatwierdzania fiszki:", error);
        throw new Error(`Błąd podczas zatwierdzania fiszki: ${error.message}`);
      }

      if (!data) {
        throw new Error("Nie znaleziono fiszki do zatwierdzenia lub fiszka nie spełnia warunków zatwierdzenia");
      }

      logger.info(`Pomyślnie zatwierdzono fiszkę ${flashcard_id}`);
      return this.mapToFlashcardDtos([data])[0];
    } catch (error) {
      logger.error("Błąd podczas zatwierdzania fiszki:", error);
      throw error;
    }
  }
}
