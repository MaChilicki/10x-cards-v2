import React, { useEffect, useState, useCallback } from "react";
import { DocumentEditForm } from "./document-edit-form";
import { useNavigationPrompt } from "./hooks/use-navigation-prompt";
import { ErrorAlert } from "@/components/ui/error-alert";
import { AlertConfirmDialog } from "@/components/ui/alert-confirm-dialog";
import { logger } from "@/lib/services/logger.service";
import type {
  DocumentDto,
  DocumentCreateDto,
  DocumentUpdateDto,
  FlashcardsListResponseDto,
  AiRegenerateResponseDto,
} from "@/types";
import type { DocumentEditViewProps, FormValues } from "./types";
import { useNavigate } from "@/components/hooks/use-navigate";
import { DocumentEditHeader } from "./document-edit-header";
import { useConfirmDialog } from "./hooks/use-confirm-dialog";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

/**
 * Widok edycji dokumentu - umożliwia tworzenie lub edycję dokumentu
 */
export function DocumentEditView({ documentId, topicId, topicTitle, referrer }: DocumentEditViewProps) {
  const navigate = useNavigate();
  const { actions: dialogActions, dialogState } = useConfirmDialog();

  const [document, setDocument] = useState<DocumentDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({ name: "", content: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationError, setRegenerationError] = useState<Error | null>(null);

  // Efekt inicjalizujący wartości formularza po załadowaniu dokumentu
  useEffect(() => {
    if (document) {
      setFormValues({
        name: document.name || "",
        content: document.content || "",
      });
    }
    return undefined;
  }, [document]);

  // Funkcja walidująca formularz
  const validate = (values: FormValues): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!values.name.trim()) {
      newErrors.name = "Tytuł jest wymagany";
    } else if (values.name.length > 100) {
      newErrors.name = "Tytuł nie może przekraczać 100 znaków";
    }

    if (!values.content.trim()) {
      newErrors.content = "Treść jest wymagana";
    } else if (values.content.length < 1000) {
      newErrors.content = "Treść musi zawierać co najmniej 1000 znaków";
    } else if (values.content.length > 10000) {
      newErrors.content = "Treść nie może przekraczać 10000 znaków";
    }

    return newErrors;
  };

  // Funkcja obsługująca zmiany w polach formularza
  const handleFormChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    // Czyścimy błędy dla zmienionego pola
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Funkcja sprawdzająca, czy treść dokumentu została zmieniona
  const hasContentChanged = useCallback(() => {
    if (documentId) {
      // Dla istniejącego dokumentu sprawdzamy czy treść się zmieniła
      return document?.content !== formValues.content || document?.name !== formValues.name;
    }
    // Dla nowego dokumentu sprawdzamy czy cokolwiek zostało wpisane
    return formValues.content.trim() !== "" || formValues.name.trim() !== "";
  }, [document, formValues, documentId]);

  // Użycie hasContentChanged w warunku wyświetlania komunikatu o niezapisanych zmianach
  const shouldShowDirtyWarning = isDirty && hasContentChanged();

  const { dialogState: navigationDialogState, handleNavigation } = useNavigationPrompt(shouldShowDirtyWarning);

  useEffect(() => {
    let isMounted = true;

    const fetchAndSetDocument = async () => {
      if (!documentId) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
        }
        const response = await fetch(`/api/documents/${documentId}`);
        if (!response.ok) {
          throw new Error("Nie udało się pobrać dokumentu");
        }

        const data = await response.json();
        if (isMounted) {
          setDocument(data);
          setIsDirty(false);
        }
      } catch (error) {
        logger.error("Błąd podczas pobierania dokumentu:", error);
        if (isMounted) {
          setError(error instanceof Error ? error : new Error("Nieznany błąd"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchAndSetDocument();

    // Funkcja czyszcząca
    return () => {
      isMounted = false;
    };
  }, [documentId, navigate]);

  // Obsługa wygaśnięcia sesji
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
      navigate("/login");
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, [navigate]);

  const submitDocument = async (values: FormValues): Promise<void> => {
    const newErrors = validate(values);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Formularz zawiera błędy walidacji");
      return Promise.resolve();
    }

    try {
      setIsSubmitting(true);
      setIsSaving(true);
      if (documentId) {
        const updateData: DocumentUpdateDto = values;

        const response = await fetch(`/api/documents/${documentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
            navigate("/login");
            return;
          }
          const errorMsg = "Nie udało się zaktualizować dokumentu";
          toast.error(errorMsg);
          setActionError(new Error(errorMsg));
          return;
        }

        const updatedDocument = await response.json();
        setDocument(updatedDocument);
        setIsDirty(false);
        toast.success("Dokument został zaktualizowany");

        // Sprawdź czy treść dokumentu została zmieniona
        if (document?.content !== values.content) {
          // Pobierz istniejące fiszki AI
          const params = new URLSearchParams({
            document_id: documentId,
            source: "ai",
            is_disabled: "false",
            limit: "1000",
          });

          const flashcardsResponse = await fetch(`/api/flashcards?${params.toString()}`);
          if (!flashcardsResponse.ok) {
            throw new Error("Nie udało się pobrać fiszek AI");
          }

          const flashcardsData: FlashcardsListResponseDto = await flashcardsResponse.json();
          const existingFlashcards = flashcardsData.data;

          // Przygotuj treść dialogu
          let dialogContent = `
            <div class="space-y-4">
              <p class="text-base">Dokument został pomyślnie zapisany. Treść dokumentu została zmieniona.</p>
              <p class="text-base">Czy chcesz wygenerować nowe fiszki AI?</p>
          `;

          if (existingFlashcards.length > 0) {
            dialogContent += `
              <div class="mt-4">
                <p class="font-semibold mb-2">Uwaga: Ta operacja usunie wszystkie istniejące fiszki AI (${existingFlashcards.length}):</p>
                <div class="space-y-2 max-h-60 overflow-y-auto">
                  ${existingFlashcards
                    .map(
                      (flashcard, index) => `
                    <div class="p-3 bg-muted rounded-lg">
                      <p class="text-sm font-medium text-muted-foreground">${index + 1}. ${flashcard.front_modified || flashcard.front_original}</p>
                      <div class="flex gap-2 mt-1">
                        ${
                          flashcard.is_approved
                            ? '<span class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Zatwierdzona</span>'
                            : '<span class="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">Niezatwierdzona</span>'
                        }
                        ${
                          flashcard.is_disabled
                            ? '<span class="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">Wyłączona</span>'
                            : ""
                        }
                      </div>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `;
          }

          dialogContent += `</div>`;

          // Wyświetl dialog z pełną informacją
          dialogActions.openDialog({
            title: "Wygeneruj nowe fiszki AI",
            description: dialogContent,
            confirmText: "Generuj",
            dangerousHTML: true,
            redirectUrl: `/documents/${documentId}`,
            onConfirm: async () => {
              // Zamknij dialog przed rozpoczęciem generowania
              dialogActions.closeDialog();
              setIsRegenerating(true);

              try {
                const regenerateResponse = await fetch("/api/flashcards/ai-regenerate", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    document_id: documentId,
                  }),
                });

                if (!regenerateResponse.ok) {
                  throw new Error("Nie udało się zregenerować fiszek");
                }

                const result: AiRegenerateResponseDto = await regenerateResponse.json();
                logger.info(
                  `Usunięto ${result.deleted_count} fiszek i wygenerowano ${result.flashcards.length} nowych`
                );

                // Przekierowanie do widoku zatwierdzania
                navigate(`/documents/${documentId}/flashcards/approve`);
              } catch (error) {
                logger.error("Błąd podczas regeneracji fiszek:", error);
                setActionError(error instanceof Error ? error : new Error("Nieznany błąd podczas regeneracji fiszek"));
              } finally {
                setIsRegenerating(false);
              }
            },
          });
        } else {
          // Jeśli treść nie została zmieniona, przejdź do widoku dokumentu
          navigate(`/documents/${documentId}`);
        }
      } else {
        const createData: DocumentCreateDto = {
          ...values,
          topic_id: topicId || "",
        };

        const response = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createData),
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
            navigate("/login");
            return;
          }
          const errorMsg = "Nie udało się utworzyć dokumentu";
          toast.error(errorMsg);
          setActionError(new Error(errorMsg));
          return;
        }

        const newDocument = await response.json();
        toast.success("Dokument został utworzony");
        navigate(`/documents/${newDocument.id}/flashcards/approve`);
      }
      return Promise.resolve();
    } catch (error) {
      logger.error("Błąd podczas zapisywania dokumentu:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
      setIsSaving(false);
    }
  };

  const handleCancel = async (): Promise<void> => {
    const navigateBack = async (): Promise<void> => {
      if (referrer === "document_detail") {
        navigate(`/documents/${documentId}`);
      } else if (documentId) {
        navigate(`/documents/${documentId}`);
      } else {
        navigate(`/topics/${topicId}`);
      }
    };

    if (shouldShowDirtyWarning) {
      await handleNavigation(navigateBack);
    } else {
      await navigateBack();
    }
  };

  const handleRegenerateFlashcards = async () => {
    setIsRegenerating(true);
    setRegenerationError(null);

    try {
      const response = await fetch("/api/flashcards/ai-regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: documentId,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
          navigate("/login");
          return;
        }
        throw new Error("Nie udało się zregenerować fiszek");
      }

      const result: AiRegenerateResponseDto = await response.json();
      logger.info(`Usunięto ${result.deleted_count} fiszek i wygenerowano ${result.flashcards.length} nowych`);
      toast.success("Fiszki zostały wygenerowane");

      // Przekierowanie do widoku zatwierdzania
      navigate(`/documents/${documentId}/flashcards/approve`);
    } catch (error) {
      logger.error("Błąd podczas regeneracji fiszek:", error);
      setRegenerationError(error instanceof Error ? error : new Error("Nieznany błąd podczas regeneracji fiszek"));
    } finally {
      setIsRegenerating(false);
    }
  };

  if (error) {
    return <ErrorAlert message={error.message} />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" withCard message="Ładowanie dokumentu..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DocumentEditHeader
        documentId={documentId}
        documentName={document?.name}
        topicId={topicId || document?.topic_id || ""}
        topicTitle={topicTitle || document?.topic_title || ""}
        onBack={handleCancel}
        onRegenerate={handleRegenerateFlashcards}
      />

      <div className="mt-8">
        <DocumentEditForm
          initialValues={formValues}
          onSubmit={submitDocument}
          onChange={handleFormChange}
          onCancel={handleCancel}
          isSaving={isSubmitting}
          errors={errors}
        />
      </div>

      <LoadingOverlay
        isVisible={isRegenerating || isSaving}
        message={isSaving ? "Zapisywanie dokumentu..." : "Generowanie fiszek..."}
      />

      {regenerationError && (
        <div className="mt-4">
          <ErrorAlert message={regenerationError.message} />
        </div>
      )}

      <AlertConfirmDialog
        isOpen={navigationDialogState.isOpen}
        title="Niezapisane zmiany"
        description="Masz niezapisane zmiany. Czy na pewno chcesz opuścić tę stronę?"
        confirmText="Opuść"
        onConfirm={async () => {
          navigationDialogState.onConfirm();
          return Promise.resolve();
        }}
        onClose={navigationDialogState.onCancel}
      />

      <AlertConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        description={typeof dialogState.description === "string" ? dialogState.description : ""}
        confirmText={dialogState.confirmText}
        onConfirm={dialogActions.handleConfirm}
        onClose={dialogActions.closeDialog}
        onCancel={dialogActions.handleCancel}
      />

      {actionError && (
        <div className="mt-4">
          <ErrorAlert message={actionError.message} />
        </div>
      )}
    </div>
  );
}
