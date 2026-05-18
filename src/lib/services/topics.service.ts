import type { SupabaseClient } from "@/db/supabase.client";
import type { TopicDto, TopicsListResponseDto } from "../../types";
import {
  topicIdSchema,
  type TopicsQueryParams,
  type TopicCreateParams,
  type TopicUpdateParams,
} from "../schemas/topics.schema";
import { logger } from "./logger.service";

export class TopicsService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {
    logger.info(`TopicsService inicjalizowany - userId: ${userId}`);
  }

  private async getBreadcrumbs(topicId: string | null): Promise<{ id: string; name: string }[]> {
    const breadcrumbs: { id: string; name: string }[] = [];
    let currentId = topicId;

    while (currentId) {
      const { data: topic, error } = await this.supabase
        .from("topics")
        .select("id, name, parent_id")
        .eq("id", currentId)
        .eq("user_id", this.userId)
        .single();

      if (error || !topic) break;

      breadcrumbs.unshift({ id: topic.id, name: topic.name });
      currentId = topic.parent_id;
    }

    return breadcrumbs;
  }

  async list(params: TopicsQueryParams): Promise<TopicsListResponseDto> {
    logger.info(`Rozpoczynam pobieranie listy tematów - parametry: ${JSON.stringify(params)}, userId: ${this.userId}`);

    const { page, limit, sort, parent_id, name } = params;
    const offset = (page - 1) * limit;

    logger.info(`Konstruuję zapytanie - offset: ${offset}, limit: ${limit}, sort: ${sort}, userId: ${this.userId}`);

    let query = this.supabase
      .from("topics")
      .select(
        `
        *,
        documents:documents!topic_id(count),
        flashcards:flashcards!topic_id(count)
      `,
        { count: "exact" }
      )
      .eq("user_id", this.userId);

    // Filtrowanie po parent_id
    if (parent_id === null) {
      logger.info("Dodaję filtr parent_id IS NULL");
      query = query.is("parent_id", null);
    } else if (parent_id) {
      logger.info(`Dodaję filtr parent_id = ${parent_id}`);
      query = query.eq("parent_id", parent_id);
    }

    // Filtrowanie po nazwie
    if (name) {
      logger.info(`Dodaję filtr name ILIKE %${name}%`);
      query = query.ilike("name", `%${name}%`);
    }

    // Sortowanie i paginacja
    logger.info(`Dodaję sortowanie po ${sort} i paginację ${offset}-${offset + limit - 1}`);
    const {
      data: topics,
      count,
      error,
    } = await query.order(sort, { ascending: true }).range(offset, offset + limit - 1);

    if (error) {
      logger.error(`Błąd podczas pobierania tematów: ${error.message}, userId: ${this.userId}`, error);
      throw new Error(`Błąd podczas pobierania tematów: ${error.message}`);
    }

    logger.info(`Pobrano ${topics?.length || 0} tematów, łączna liczba: ${count || 0}, userId: ${this.userId}`);

    // Pobierz breadcrumbs dla każdego tematu
    const topicsWithBreadcrumbs = await Promise.all(
      topics.map(async (topic) => {
        const breadcrumbs = await this.getBreadcrumbs(topic.id);
        logger.info(`Pobrano breadcrumbs dla tematu ${topic.id}: ${JSON.stringify(breadcrumbs)}`);
        return {
          ...topic,
          documents_count: topic.documents[0]?.count || 0,
          flashcards_count: topic.flashcards[0]?.count || 0,
          breadcrumbs,
        };
      })
    );

    return {
      topics: topicsWithBreadcrumbs as TopicDto[],
      total: count || 0,
    };
  }

  async create(data: TopicCreateParams): Promise<TopicDto> {
    let query = this.supabase.from("topics").select("id").eq("name", data.name).eq("user_id", this.userId);

    // Dodajemy warunek na parent_id osobno
    if (data.parent_id === undefined || data.parent_id === null) {
      query = query.is("parent_id", null);
    } else {
      query = query.eq("parent_id", data.parent_id);
    }

    // Sprawdzenie unikalności nazwy dla tego samego rodzica
    const { data: existing, error: checkError } = await query.maybeSingle();

    if (checkError) {
      throw new Error(`Błąd podczas sprawdzania unikalności nazwy: ${checkError.message}`);
    }

    if (existing) {
      throw new Error("Temat o tej nazwie już istnieje dla tego samego rodzica");
    }

    const { data: topic, error } = await this.supabase
      .from("topics")
      .insert({
        ...data,
        user_id: this.userId,
      })
      .select(
        `
        *,
        documents:documents!topic_id(count),
        flashcards:flashcards!topic_id(count)
      `
      )
      .single();

    if (error) {
      throw new Error(`Błąd podczas tworzenia tematu: ${error.message}`);
    }

    return {
      ...topic,
      documents_count: topic.documents[0]?.count || 0,
      flashcards_count: topic.flashcards[0]?.count || 0,
      breadcrumbs: await this.getBreadcrumbs(topic.id),
    } as TopicDto;
  }

  async getById(id: string): Promise<TopicDto> {
    // Walidacja ID
    const validatedId = topicIdSchema.parse(id);

    const { data: topic, error } = await this.supabase
      .from("topics")
      .select(
        `
        *,
        documents:documents!topic_id(count),
        flashcards:flashcards!topic_id(count)
      `
      )
      .eq("id", validatedId)
      .eq("user_id", this.userId)
      .single();

    if (error) {
      throw new Error(`Błąd podczas pobierania tematu: ${error.message}`);
    }

    if (!topic) {
      throw new Error("Temat nie został znaleziony");
    }

    return {
      ...topic,
      documents_count: topic.documents[0]?.count || 0,
      flashcards_count: topic.flashcards[0]?.count || 0,
      breadcrumbs: await this.getBreadcrumbs(topic.id),
    } as TopicDto;
  }

  async update(id: string, data: TopicUpdateParams): Promise<TopicDto> {
    // Walidacja ID
    const validatedId = topicIdSchema.parse(id);
    const topic = await this.getById(validatedId);

    if (data.name && data.name !== topic.name) {
      let query = this.supabase
        .from("topics")
        .select("id")
        .eq("name", data.name)
        .eq("user_id", this.userId)
        .neq("id", validatedId);

      // Dodajemy warunek na parent_id osobno
      if (topic.parent_id === null) {
        query = query.is("parent_id", null);
      } else {
        query = query.eq("parent_id", topic.parent_id);
      }

      // Sprawdzenie unikalności nowej nazwy
      const { data: existing, error: checkError } = await query.maybeSingle();

      if (checkError) {
        throw new Error(`Błąd podczas sprawdzania unikalności nazwy: ${checkError.message}`);
      }

      if (existing) {
        throw new Error("Temat o tej nazwie już istnieje dla tego samego rodzica");
      }
    }

    const { data: updated, error } = await this.supabase
      .from("topics")
      .update(data)
      .eq("id", validatedId)
      .eq("user_id", this.userId)
      .select(
        `
        *,
        documents:documents!topic_id(count),
        flashcards:flashcards!topic_id(count)
      `
      )
      .single();

    if (error) {
      throw new Error(`Błąd podczas aktualizacji tematu: ${error.message}`);
    }

    return {
      ...updated,
      documents_count: updated.documents[0]?.count || 0,
      flashcards_count: updated.flashcards[0]?.count || 0,
      breadcrumbs: await this.getBreadcrumbs(updated.id),
    } as TopicDto;
  }

  async delete(id: string): Promise<void> {
    // Walidacja ID
    const validatedId = topicIdSchema.parse(id);

    // Sprawdzenie czy temat ma podrzędne tematy
    const { data: childTopics, error: childError } = await this.supabase
      .from("topics")
      .select("id, name")
      .eq("parent_id", validatedId)
      .eq("user_id", this.userId);

    if (childError) {
      throw new Error(`Błąd podczas sprawdzania podrzędnych tematów: ${childError.message}`);
    }

    if (childTopics && childTopics.length > 0) {
      throw new Error("Nie można usunąć tematu, który ma podrzędne tematy");
    }

    // Sprawdzenie czy temat ma przypisane dokumenty
    const { data: documents, error: docError } = await this.supabase
      .from("documents")
      .select("id, name")
      .eq("topic_id", validatedId);

    if (docError) {
      throw new Error(`Błąd podczas sprawdzania dokumentów: ${docError.message}`);
    }

    if (documents && documents.length > 0) {
      throw new Error("Nie można usunąć tematu, który ma przypisane dokumenty");
    }

    // Sprawdzenie czy temat ma przypisane fiszki
    const { count: flashcardsCount, error: flashError } = await this.supabase
      .from("flashcards")
      .select("id", { count: "exact" })
      .eq("topic_id", validatedId);

    if (flashError) {
      throw new Error(`Błąd podczas sprawdzania fiszek: ${flashError.message}`);
    }

    if (flashcardsCount && flashcardsCount > 0) {
      throw new Error("Nie można usunąć tematu, który ma przypisane fiszki");
    }

    const { error } = await this.supabase.from("topics").delete().eq("id", validatedId).eq("user_id", this.userId);

    if (error) {
      throw new Error(`Błąd podczas usuwania tematu: ${error.message}`);
    }
  }
}
