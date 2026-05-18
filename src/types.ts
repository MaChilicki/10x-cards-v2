import type { Database } from "./db/database.types";

// ------------------------------------------------------------------------------------------------
// Aliasy typów bazodanowych
// ------------------------------------------------------------------------------------------------
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
export type FlashcardUpdate = Database["public"]["Tables"]["flashcards"]["Update"];

export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];

export type Topic = Database["public"]["Tables"]["topics"]["Row"];
export type TopicInsert = Database["public"]["Tables"]["topics"]["Insert"];

export type StudySession = Database["public"]["Tables"]["study_sessions"]["Row"];
export type StudySessionInsert = Database["public"]["Tables"]["study_sessions"]["Insert"];

export type StudySessionResult = Database["public"]["Tables"]["study_session_results"]["Row"];
export type StudySessionResultInsert = Database["public"]["Tables"]["study_session_results"]["Insert"];

export type UserStatistics = Database["public"]["Tables"]["user_statistics"]["Row"];

// ------------------------------------------------------------------------------------------------
// Source literal type for flashcards
// ------------------------------------------------------------------------------------------------
export type FlashcardSource = "ai" | "manual";

// ------------------------------------------------------------------------------------------------
// Spaced Repetition Data
// ------------------------------------------------------------------------------------------------
export interface SpacedRepetitionData {
  // Liczba powtórek
  repetitions: number;
  // Łatwość zapamiętywania (czynnik E w algorytmie SuperMemo)
  easiness_factor: number;
  // Interwał w dniach do następnej powtórki
  interval: number;
  // Data następnej powtórki
  next_review_date: string;
  // Data ostatniej powtórki
  last_review_date: string;
  // Historia odpowiedzi (0-5, gdzie 5 to najłatwiejsze)
  review_history: {
    date: string;
    grade: number;
    interval: number;
  }[];
}

// ------------------------------------------------------------------------------------------------
// Flashcard DTOs
// ------------------------------------------------------------------------------------------------
export interface FlashcardDto {
  id: string;
  front_original: string;
  back_original: string;
  front_modified?: string;
  back_modified?: string;
  created_at: string;
  updated_at: string;
  topic_id?: string;
  document_id?: string;
  source: FlashcardSource;
  status: "pending" | "approved" | "rejected";
  is_modified?: boolean;
  modification_percentage?: number;
  user_id: string;
  is_approved: boolean;
  is_disabled: boolean;
  spaced_repetition_data?: SpacedRepetitionData;
}

export interface AiRegenerateResponseDto {
  flashcards: FlashcardProposalDto[];
  deleted_count: number;
}

// ------------------------------------------------------------------------------------------------
// Pagination DTO
// ------------------------------------------------------------------------------------------------
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}

// ------------------------------------------------------------------------------------------------
// Flashcards list response
// ------------------------------------------------------------------------------------------------
export interface FlashcardsListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
  error?: {
    message: string;
    code?: string;
  };
}

// ------------------------------------------------------------------------------------------------
// Flashcard create DTO and command
// ------------------------------------------------------------------------------------------------
export interface FlashcardCreateDto {
  front_original: string;
  back_original: string;
  front_modified?: string;
  back_modified?: string;
  topic_id?: string;
  document_id?: string;
  source: FlashcardSource;
  is_approved: boolean;
  is_modified?: boolean;
  modification_percentage?: number;
}

export interface FlashcardsCreateCommand {
  flashcards: FlashcardCreateDto[];
}

// ------------------------------------------------------------------------------------------------
// Flashcard update DTO
// ------------------------------------------------------------------------------------------------
export type FlashcardUpdateDto = Partial<{
  front_modified: string;
  back_modified: string;
  is_modified: boolean;
  modification_percentage: number;
  is_approved: boolean;
  is_disabled: boolean;
}>;

// ------------------------------------------------------------------------------------------------
// Flashcard AI generation input
// ------------------------------------------------------------------------------------------------
export interface FlashcardAiGenerateDto {
  text: string;
  topic_id?: string;
  document_id?: string;
}

// ------------------------------------------------------------------------------------------------
// Flashcard AI proposal (not yet saved)
// ------------------------------------------------------------------------------------------------
export interface FlashcardProposalDto {
  // Przód fiszki - maksymalnie 200 znaków
  front_original: string;
  // Tył fiszki - maksymalnie 500 znaków
  back_original: string;
  // Początkowa wartość równa front_original
  front_modified?: string;
  // Początkowa wartość równa back_original
  back_modified?: string;
  topic_id?: string;
  document_id?: string;
  source: "ai";
  is_approved: boolean;
}

// ------------------------------------------------------------------------------------------------
// Flashcard AI response DTO
// ------------------------------------------------------------------------------------------------
export interface FlashcardAiResponse {
  flashcards: FlashcardProposalDto[];
}

// ------------------------------------------------------------------------------------------------
// Topic DTOs
// ------------------------------------------------------------------------------------------------
export interface TopicDto extends Topic {
  documents_count: number;
  flashcards_count: number;
  breadcrumbs: { id: string; name: string }[];
}

export interface TopicCreateDto {
  name: string;
  description?: string;
  parent_id?: string | null;
}

export type TopicUpdateDto = Partial<{
  name: string;
  description: string;
}>;

export interface TopicsListResponseDto {
  topics: TopicDto[];
  total: number;
}

// ------------------------------------------------------------------------------------------------
// Document DTOs
// ------------------------------------------------------------------------------------------------
export interface DocumentDto {
  id: string;
  user_id: string;
  topic_id: string | null;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Statystyki fiszek
  ai_flashcards_count?: number;
  manual_flashcards_count?: number;
  total_flashcards_count?: number;
  pending_flashcards_count?: number;
  // Istniejące pola
  has_flashcards?: boolean;
  flashcards?: FlashcardDto[];
  is_ai_generated?: boolean;
  // Dodatkowe informacje o temacie
  topic_title?: string;
}

export interface DocumentCreateDto {
  name: string;
  content: string;
  topic_id: string;
}

export type DocumentUpdateDto = Partial<{
  name: string;
  content: string;
}>;

export interface DocumentsListResponseDto {
  documents: DocumentDto[];
  total: number;
}

// ------------------------------------------------------------------------------------------------
// Study Session DTOs
// ------------------------------------------------------------------------------------------------
export type StudySessionDto = StudySession;

export interface StudySessionCreateDto {
  topic_id?: string;
}

export interface StudySessionUpdateDto {
  end_time: string;
}

export interface StudySessionsListResponseDto {
  study_sessions: StudySessionDto[];
  total: number;
}

// ------------------------------------------------------------------------------------------------
// Study Session Result DTOs
// ------------------------------------------------------------------------------------------------
export type StudySessionResultDto = StudySessionResult;

export interface StudySessionResultCreateDto {
  session_id: string;
  flashcard_id: string;
  is_correct: boolean;
  response_time: number;
  difficulty_rating?: number;
}

export interface StudySessionResultsListResponseDto {
  results: StudySessionResultDto[];
  total: number;
}

// ------------------------------------------------------------------------------------------------
// User Statistics DTO
// ------------------------------------------------------------------------------------------------
export type UserStatisticsDto = UserStatistics;

// ------------------------------------------------------------------------------------------------
// View Models dla DocumentDetailView
// ------------------------------------------------------------------------------------------------
export interface DocumentDetailViewModel {
  document: DocumentDto | null;
  isLoadingDocument: boolean;
  documentError: Error | null;
  unapprovedAiFlashcardsCount: number;
}

export interface FlashcardsListViewModel {
  flashcards: FlashcardDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
  isLoading: boolean;
  error: Error | null;
  currentSort: import("./components/flashcards/types").FlashcardsSortModel;
}

export interface FlashcardFormViewModel {
  front_original: string;
  back_original: string;
  front_modified?: string;
  back_modified?: string;
  errors: {
    front_original?: string;
    back_original?: string;
    front_modified?: string;
    back_modified?: string;
  };
  isSubmitting: boolean;
  isModified: boolean;
  modificationPercentage: number;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: (() => void) | null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
