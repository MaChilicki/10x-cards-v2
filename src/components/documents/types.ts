import type { DocumentDto, FlashcardDto, PaginationDto, DocumentCreateDto, DocumentUpdateDto } from "@/types";

export interface DocumentsSortModel {
  sortBy: "name" | "created_at" | "updated_at";
  sortOrder: "asc" | "desc";
}

export interface DocumentsQueryModel extends DocumentsSortModel {
  page: number;
  limit: number;
}

export interface PaginationModel {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  availablePerPage: number[];
}

export interface DocumentViewModel extends DocumentDto {
  flashcards_count: number;
  ai_flashcards_count?: number;
  manual_flashcards_count?: number;
  isAiGenerated?: boolean;
  unapproved_flashcards_count: number;
}

export interface FlashcardsSortModel {
  sortBy: "front" | "created_at" | "updated_at" | "source";
  sortOrder: "asc" | "desc";
}

export interface DocumentDetailViewModel {
  document: DocumentDto | null;
  isLoadingDocument: boolean;
  documentError: string | null;
  unapprovedAiFlashcardsCount: number;
}

export interface FlashcardsListViewModel {
  flashcards: FlashcardDto[];
  pagination: PaginationDto | null;
  isLoadingFlashcards: boolean;
  flashcardsError: string | null;
  currentPage: number;
  currentSort: FlashcardsSortModel;
}

export interface FlashcardFormViewModel {
  front: string;
  back: string;
  errors: { front?: string; back?: string };
  isSubmitting: boolean;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: (() => void) | null;
}

// Props dla głównego komponentu DocumentEditView
export interface DocumentEditViewProps {
  documentId?: string;
  topicId?: string;
  topicTitle?: string;
  referrer?: "document_detail";
}

// Props dla formularza edycji dokumentu
export interface DocumentEditFormProps {
  initialValues: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  onChange: (e: { target: { name: string; value: string } }) => void;
  onCancel: () => void;
  isSaving: boolean;
  errors: Record<string, string>;
  referrer?: string;
}

// Wartości formularza - rozszerzamy o typy z DTO
export interface FormValues extends Omit<DocumentCreateDto, "topic_id">, DocumentUpdateDto {
  name: string;
  content: string;
}

// Props dla pola tytułu
export interface TitleInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string;
}

// Props dla pola treści
export interface ContentTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  error?: string;
}

// Props dla licznika znaków
export interface CharacterCounterProps {
  count: number;
  min: number;
  max: number;
}

// Props dla grupy przycisków
export interface SubmitButtonGroupProps {
  onCancel: () => void;
  isSaving: boolean;
}

// Stan dialogu nawigacji
export interface NavigationPromptState {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Stan dialogu regeneracji fiszek
export interface FlashcardsRegenerationDialogState {
  isOpen: boolean;
  hasExistingAIFlashcards: boolean;
  aiFlashcardsCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}
