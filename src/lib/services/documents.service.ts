import type { SupabaseClient } from "@/db/supabase.client";
import type { DocumentDto, DocumentsListResponseDto } from "@/types";
import type { DocumentsQueryParams, DocumentCreateParams, DocumentUpdateParams } from "../schemas/documents.schema";
import { AiGenerateService } from "./ai-generate.service";
import { logger } from "./logger.service";

/**
 * Serwis obsługujący operacje na dokumentach
 * Zapewnia podstawowe operacje CRUD oraz integrację z generowaniem fiszek
 */
export class DocumentsService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string,
    private readonly aiGenerateService: AiGenerateService = new AiGenerateService(supabase, userId)
  ) {}

  /**
   * Pobiera listę dokumentów z możliwością filtrowania i paginacji
   * @param params Parametry zapytania (strona, limit, sortowanie, nazwa)
   * @returns Lista dokumentów i całkowita liczba wyników
   * @throws Error gdy wystąpi problem z bazą danych
   */
  async listDocuments(params: DocumentsQueryParams): Promise<DocumentsListResponseDto> {
    const { page, limit, sort, name, topic_id } = params;
    const offset = (page - 1) * limit;

    let query = this.supabase.from("documents").select(
      `
        *,
        topics:topic_id (
          name
        )
      `,
      { count: "exact" }
    );

    // Dodaj filtrowanie po topic_id
    if (topic_id) {
      query = query.eq("topic_id", topic_id);
    }

    // Dodaj filtrowanie po nazwie, jeśli podano
    if (name) {
      query = query.ilike("name", `%${name}%`);
    }

    // Dodaj sortowanie
    const [column, order] = sort.startsWith("-") ? [sort.slice(1), "desc" as const] : [sort, "asc" as const];
    query = query.order(column, { ascending: order === "asc" });

    // Dodaj paginację
    query = query.range(offset, offset + limit - 1);

    // Wykonujemy główne zapytanie
    const { data: documentsWithTopics, error, count } = await query;

    if (error) {
      logger.error("Błąd podczas pobierania listy dokumentów:", error);
      throw new Error("Nie udało się pobrać listy dokumentów");
    }

    // Jeśli nie ma dokumentów, zwracamy pustą listę
    if (!documentsWithTopics || documentsWithTopics.length === 0) {
      return {
        documents: [],
        total: count ?? 0,
      };
    }

    // Wyodrębniamy dokumenty i informacje o tematach
    const documents = documentsWithTopics.map((doc) => {
      const { topics, ...document } = doc; // eslint-disable-line @typescript-eslint/no-unused-vars
      return {
        ...document,
        topic_title: doc.topics?.name || null,
      };
    });

    // Pobieramy dokumenty z ID
    const documentIds = documents.map((doc) => doc.id);

    // Pobieramy statystyki fiszek
    try {
      // Zapytanie o fiszki AI
      const { data: aiFlashcards, error: aiError } = await this.supabase
        .from("flashcards")
        .select("document_id, id")
        .in("document_id", documentIds)
        .eq("source", "ai")
        .eq("is_disabled", false)
        .eq("is_approved", true);

      if (aiError) {
        logger.error("Błąd podczas pobierania statystyk fiszek AI:", aiError);
      }

      // Zapytanie o fiszki manual
      const { data: manualFlashcards, error: manualError } = await this.supabase
        .from("flashcards")
        .select("document_id, id")
        .in("document_id", documentIds)
        .eq("source", "manual")
        .eq("is_disabled", false)
        .eq("is_approved", true);

      if (manualError) {
        logger.error("Błąd podczas pobierania statystyk fiszek manual:", manualError);
      }

      // Zapytanie o niezatwierdzone fiszki
      const { data: unapprovedFlashcards, error: unapprovedError } = await this.supabase
        .from("flashcards")
        .select("document_id, id")
        .in("document_id", documentIds)
        .eq("is_disabled", false)
        .eq("is_approved", false);

      if (unapprovedError) {
        logger.error("Błąd podczas pobierania statystyk niezatwierdzonych fiszek:", unapprovedError);
      }

      // Przygotowanie map z liczbą fiszek dla każdego dokumentu
      const aiFlashcardsCountMap = new Map<string, number>();
      const manualFlashcardsCountMap = new Map<string, number>();
      const unapprovedFlashcardsCountMap = new Map<string, number>();

      documentIds.forEach((id) => {
        aiFlashcardsCountMap.set(id, 0);
        manualFlashcardsCountMap.set(id, 0);
        unapprovedFlashcardsCountMap.set(id, 0);
      });

      if (aiFlashcards) {
        aiFlashcards.forEach((flashcard) => {
          const docId = flashcard.document_id;
          if (docId) {
            aiFlashcardsCountMap.set(docId, (aiFlashcardsCountMap.get(docId) || 0) + 1);
          }
        });
      }

      if (manualFlashcards) {
        manualFlashcards.forEach((flashcard) => {
          const docId = flashcard.document_id;
          if (docId) {
            manualFlashcardsCountMap.set(docId, (manualFlashcardsCountMap.get(docId) || 0) + 1);
          }
        });
      }

      if (unapprovedFlashcards) {
        unapprovedFlashcards.forEach((flashcard) => {
          const docId = flashcard.document_id;
          if (docId) {
            unapprovedFlashcardsCountMap.set(docId, (unapprovedFlashcardsCountMap.get(docId) || 0) + 1);
          }
        });
      }

      // Przygotowanie dokumentów z danymi statystycznymi
      const documentsWithStats = documents.map((doc) => {
        const aiCount = aiFlashcardsCountMap.get(doc.id) || 0;
        const manualCount = manualFlashcardsCountMap.get(doc.id) || 0;
        const unapprovedCount = unapprovedFlashcardsCountMap.get(doc.id) || 0;

        return {
          ...doc,
          ai_flashcards_count: aiCount,
          manual_flashcards_count: manualCount,
          unapproved_flashcards_count: unapprovedCount,
          total_flashcards_count: aiCount + manualCount,
        };
      });

      return {
        documents: documentsWithStats as DocumentDto[],
        total: count ?? 0,
      };
    } catch (statsError) {
      logger.error("Błąd podczas przetwarzania statystyk fiszek:", statsError);
      // W przypadku błędu zwracamy dokumenty bez statystyk
      return {
        documents: documents as DocumentDto[],
        total: count ?? 0,
      };
    }
  }

  /**
   * Tworzy nowy dokument i inicjuje generowanie fiszek
   * @param data Dane nowego dokumentu
   * @returns Utworzony dokument
   * @throws Error gdy wystąpi problem z bazą danych lub walidacją
   */
  async createDocument(data: DocumentCreateParams): Promise<DocumentDto> {
    // Dodajemy user_id do danych dokumentu
    const documentData = {
      ...data,
      user_id: this.userId,
    };

    const { data: document, error } = await this.supabase.from("documents").insert(documentData).select().single();

    if (error) {
      logger.error("Błąd podczas tworzenia dokumentu:", error);
      throw new Error("Nie udało się utworzyć dokumentu");
    }

    // Asynchronicznie zainicjuj generowanie fiszek
    try {
      logger.debug(`Rozpoczęto generowanie fiszek dla dokumentu ${document.id}`);

      await this.aiGenerateService.generateFlashcards({
        text: data.content,
        document_id: document.id,
        topic_id: data.topic_id,
      });

      logger.info(`Pomyślnie zainicjowano generowanie fiszek dla dokumentu ${document.id}`);
    } catch (error) {
      logger.error("Błąd podczas inicjowania generowania fiszek:", error);
      // Nie przerywamy flow w przypadku błędu generowania fiszek
    }

    return {
      ...document,
      ai_flashcards_count: 0,
      manual_flashcards_count: 0,
      total_flashcards_count: 0,
    } as DocumentDto;
  }

  /**
   * Pobiera dokument o określonym ID
   * @param id ID dokumentu
   * @returns Dokument
   * @throws Error gdy dokument nie istnieje lub wystąpi problem z bazą danych
   */
  async getDocumentById(id: string): Promise<DocumentDto> {
    // Pobieramy dokument wraz z informacją o temacie
    const { data: documentWithTopic, error: docError } = await this.supabase
      .from("documents")
      .select(
        `
        *,
        topics:topic_id (
          name
        )
      `
      )
      .eq("id", id)
      .single();

    if (docError) {
      logger.error(`Błąd podczas pobierania dokumentu o ID ${id}:`, docError);
      throw new Error("Nie udało się pobrać dokumentu");
    }

    if (!documentWithTopic) {
      throw new Error("Dokument nie istnieje");
    }

    // Wyodrębniamy nazwę tematu, jeśli istnieje
    const topicTitle = documentWithTopic.topics?.name || null;

    // Przygotowanie dokumentu do zwrócenia (bez pola topics)
    const { topics, ...document } = documentWithTopic; // eslint-disable-line @typescript-eslint/no-unused-vars

    try {
      // Pobieramy fiszki AI
      const { data: aiFlashcards, error: aiError } = await this.supabase
        .from("flashcards")
        .select("id")
        .eq("document_id", id)
        .eq("source", "ai")
        .eq("is_disabled", false)
        .eq("is_approved", true);

      if (aiError) {
        logger.error(`Błąd podczas pobierania fiszek AI dla dokumentu ${id}:`, aiError);
      }

      // Pobieramy fiszki manual
      const { data: manualFlashcards, error: manualError } = await this.supabase
        .from("flashcards")
        .select("id")
        .eq("document_id", id)
        .eq("source", "manual")
        .eq("is_disabled", false)
        .eq("is_approved", true);

      if (manualError) {
        logger.error(`Błąd podczas pobierania fiszek manual dla dokumentu ${id}:`, manualError);
      }

      // Pobieramy niezaakceptowane fiszki
      const { data: pendingFlashcards, error: pendingError } = await this.supabase
        .from("flashcards")
        .select("id")
        .eq("document_id", id)
        .eq("is_disabled", false)
        .eq("is_approved", false);

      if (pendingError) {
        logger.error(`Błąd podczas pobierania niezaakceptowanych fiszek dla dokumentu ${id}:`, pendingError);
      }

      const aiCount = aiFlashcards?.length || 0;
      const manualCount = manualFlashcards?.length || 0;
      const pendingCount = pendingFlashcards?.length || 0;

      return {
        ...document,
        topic_title: topicTitle,
        ai_flashcards_count: aiCount,
        manual_flashcards_count: manualCount,
        total_flashcards_count: aiCount + manualCount,
        pending_flashcards_count: pendingCount,
      } as DocumentDto;
    } catch (statsError) {
      logger.error(`Błąd podczas przetwarzania statystyk fiszek dla dokumentu ${id}:`, statsError);
      return {
        ...document,
        topic_title: topicTitle,
      } as DocumentDto;
    }
  }

  /**
   * Aktualizuje istniejący dokument
   * @param id ID dokumentu
   * @param data Dane do aktualizacji
   * @returns Zaktualizowany dokument
   * @throws Error gdy wystąpi problem z bazą danych
   */
  async updateDocument(id: string, data: DocumentUpdateParams): Promise<DocumentDto> {
    const { error } = await this.supabase.from("documents").update(data).eq("id", id);

    if (error) {
      logger.error(`Błąd podczas aktualizacji dokumentu o ID ${id}:`, error);
      throw new Error("Nie udało się zaktualizować dokumentu");
    }

    // Pobieramy statystyki fiszek dla zaktualizowanego dokumentu
    return await this.getDocumentById(id);
  }

  /**
   * Usuwa dokument i powiązane z nim fiszki
   * @param id ID dokumentu
   * @throws Error gdy wystąpi problem z bazą danych
   */
  async deleteDocument(id: string): Promise<void> {
    const { error: deleteFlashcardsError } = await this.supabase.from("flashcards").delete().eq("document_id", id);

    if (deleteFlashcardsError) {
      logger.error(`Błąd podczas usuwania fiszek dla dokumentu ${id}:`, deleteFlashcardsError);
      throw new Error("Nie udało się usunąć powiązanych fiszek");
    }

    const { error: deleteDocumentError } = await this.supabase.from("documents").delete().eq("id", id);

    if (deleteDocumentError) {
      logger.error(`Błąd podczas usuwania dokumentu o ID ${id}:`, deleteDocumentError);
      throw new Error("Nie udało się usunąć dokumentu");
    }
  }
}
