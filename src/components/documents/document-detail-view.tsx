import { useEffect, useState } from "react";
import { useDocumentDetail } from "./hooks/use-document-detail";
import { useFlashcardsList } from "../flashcards/hooks/use-flashcards-list";
import { DocumentHeader } from "./document-header";
import { FlashcardsList, FlashcardsSorter } from "../flashcards";
import { Button } from "../ui/button";
import { ErrorAlert } from "../ui/error-alert";
import { useConfirmDialog } from "./hooks/use-confirm-dialog";
import { AlertConfirmDialog } from "../ui/alert-confirm-dialog";
import { EditFlashcardModal } from "../flashcards/flashcard-edit-modal";
import { FlashcardsEmptyState } from "./flashcards-empty-state";
import { Plus } from "lucide-react";
import type { FlashcardsSortModel } from "../flashcards/types";
import type { FlashcardDto, FlashcardCreateDto, FlashcardsListResponseDto, AiRegenerateResponseDto } from "@/types";
import { logger } from "@/lib/services/logger.service";
import { LoadingSpinner } from "../ui/loading-spinner";
import { toast } from "sonner";
import { useNavigate } from "@/components/hooks/use-navigate";

interface DocumentDetailViewProps {
  documentId: string;
}

export function DocumentDetailView({ documentId }: DocumentDetailViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingFlashcard, setIsAddingFlashcard] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationError, setRegenerationError] = useState<Error | null>(null);

  const {
    document,
    isLoadingDocument,
    documentError,
    actions: documentActions,
    refetch: refetchDocument,
  } = useDocumentDetail(documentId);

  const initialSort: FlashcardsSortModel = {
    sortBy: "created_at",
    sortOrder: "desc",
  };

  const {
    flashcards,
    isLoading,
    error,
    pagination,
    setPage,
    setItemsPerPage,
    sort,
    updateSort,
    refetch: refetchFlashcards,
  } = useFlashcardsList({
    documentId,
    initialSort,
    initialPage: 1,
    initialItemsPerPage: 24,
    is_approved: true,
    is_disabled: false,
  });

  const { actions: dialogActions, dialogState } = useConfirmDialog();
  const [actionError, setActionError] = useState<Error | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (documentId) {
      refetchDocument();
      refetchFlashcards();
    }
    return undefined;
  }, [documentId, refetchDocument, refetchFlashcards]);

  // Obsługa wygaśnięcia sesji
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
      navigate("/login");
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, [navigate]);

  const handleAddFlashcard = async (data: FlashcardCreateDto) => {
    setIsAddingFlashcard(true);
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flashcards: [
            {
              front_original: data.front_original,
              back_original: data.back_original,
              document_id: documentId,
              source: "manual",
              is_approved: true,
            },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
          navigate("/login");
          return;
        }
        toast.error("Nie udało się dodać fiszki");
        return;
      }

      toast.success("Fiszka została dodana");
      setIsAddModalOpen(false);
      await Promise.all([refetchFlashcards(), refetchDocument()]);
    } catch (error) {
      logger.error("Błąd podczas dodawania fiszki:", error);
      toast.error("Wystąpił błąd podczas dodawania fiszki");
    } finally {
      setIsAddingFlashcard(false);
    }
  };

  const handleEditFlashcard = async (flashcardId: string, updates: Partial<FlashcardDto>) => {
    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
          navigate("/login");
          return;
        }
        toast.error("Nie udało się zaktualizować fiszki");
        return;
      }

      toast.success("Fiszka została zaktualizowana");
      await Promise.all([refetchFlashcards(), refetchDocument()]);
    } catch (error) {
      logger.error("Błąd podczas edycji fiszki:", error);
      toast.error("Wystąpił błąd podczas aktualizacji fiszki");
    }
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    const flashcard = flashcards.find((f) => f.id === flashcardId);
    if (!flashcard) {
      toast.error(`Nie znaleziono fiszki o ID: ${flashcardId}`);
      return Promise.reject();
    }

    return new Promise<void>((resolve) => {
      dialogActions.openDialog({
        title: "Usuń fiszkę",
        description: "Czy na pewno chcesz usunąć tę fiszkę? Tej operacji nie można cofnąć.",
        confirmText: "Usuń",
        onConfirm: async () => {
          try {
            const response = await fetch(`/api/flashcards/${flashcardId}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ source: flashcard.source }),
            });

            if (!response.ok) {
              if (response.status === 401) {
                toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
                navigate("/login");
                return resolve();
              }
              toast.error("Nie udało się usunąć fiszki");
              return resolve();
            }

            toast.success("Fiszka została usunięta");
            await Promise.all([refetchFlashcards(), refetchDocument()]);
            resolve();
          } catch (error) {
            logger.error("Błąd podczas usuwania fiszki:", error);
            toast.error("Wystąpił błąd podczas usuwania fiszki");
            resolve();
          }
        },
      });
    });
  };

  const handleDeleteDocument = async () => {
    try {
      await documentActions.deleteDocument();
      toast.success("Dokument został usunięty");
      window.location.href = "/documents";
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
        navigate("/login");
      } else {
        setActionError(error instanceof Error ? error : new Error("Nieznany błąd podczas usuwania dokumentu"));
      }
    }
  };

  const handleRegenerateFlashcards = async () => {
    try {
      // Usuwam flagę regeneracji z początku funkcji
      setRegenerationError(null);

      // Pobierz fiszki AI
      const params = new URLSearchParams({
        document_id: documentId,
        source: "ai",
        is_disabled: "false",
        limit: "1000",
      });

      const response = await fetch(`/api/flashcards?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Nie udało się pobrać fiszek AI");
      }

      const data: FlashcardsListResponseDto = await response.json();

      // Przygotuj treść dialogu
      const dialogContent = `
        <div class="space-y-4">
          <p class="text-base">Czy na pewno chcesz zregenerować fiszki AI? Ta operacja:</p>
          <ul class="list-disc list-inside space-y-2">
            <li>Usunie wszystkie istniejące fiszki AI (${data.data.length})</li>
            <li>Wygeneruje nowe fiszki na podstawie treści dokumentu</li>
          </ul>
          ${
            data.data.length > 0
              ? `
            <div class="mt-4">
              <p class="font-semibold mb-2">Istniejące fiszki AI:</p>
              <div class="space-y-2 max-h-60 overflow-y-auto">
                ${data.data
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
          `
              : ""
          }
        </div>
      `;

      // Wyświetl dialog z pełną informacją
      dialogActions.openDialog({
        title: "Regeneruj fiszki AI",
        description: dialogContent,
        confirmText: "Regeneruj",
        dangerousHTML: true,
        onConfirm: async () => {
          // Zamknij dialog przed rozpoczęciem generowania
          dialogActions.closeDialog();

          try {
            // Ustawiam flagę regeneracji po potwierdzeniu przez użytkownika
            setIsRegenerating(true);

            // Flaga zapobiegająca wielokrotnym przekierowaniom
            let redirected = false;

            // Dodaj timeout dla requestu
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minut timeout

            const response = await fetch("/api/flashcards/ai-regenerate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                document_id: documentId,
              }),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              const errorData = await response.json().catch(() => null);
              throw new Error(errorData?.error?.message || `Nie udało się zregenerować fiszek (${response.status})`);
            }

            const result: AiRegenerateResponseDto = await response.json();
            logger.info(`Usunięto ${result.deleted_count} fiszek i wygenerowano ${result.flashcards.length} nowych`);

            // Sprawdzamy czy faktycznie wygenerowano fiszki
            if (result.flashcards && result.flashcards.length > 0 && !redirected) {
              redirected = true;
              // Przekierowanie bezpośrednio po otrzymaniu odpowiedzi
              logger.info(`Wygenerowano ${result.flashcards.length} fiszek, przekierowuję do widoku zatwierdzania...`);
              // Nie ustawiamy stanu przed przekierowaniem
              window.location.replace(`/documents/${documentId}/flashcards/approve`);
              return; // Przerywamy wykonanie funkcji po przekierowaniu
            } else if (!redirected) {
              // Tylko w przypadku braku fiszek pokazujemy toast
              if (!flashcards || flashcards.length === 0) {
                logger.error("Nie wygenerowano żadnych fiszek, przekierowanie anulowane");
                return;
              }
              toast.error("Wygenerowano 0 fiszek. Spróbuj ponownie później.");
              setIsRegenerating(false);
            }
          } catch (error) {
            logger.error("Błąd podczas regeneracji fiszek:", error);

            if (error instanceof Error) {
              if (error.name === "AbortError") {
                setRegenerationError(new Error("Przekroczono czas oczekiwania na odpowiedź (5 minut)"));
                toast.error("Przekroczono czas oczekiwania na odpowiedź. Spróbuj ponownie później.");
              } else {
                setRegenerationError(error);
                toast.error(error.message);
              }
            } else {
              setRegenerationError(new Error("Nieznany błąd podczas regeneracji fiszek"));
              toast.error("Wystąpił nieznany błąd podczas regeneracji fiszek");
            }
            // W przypadku błędu zamykamy tryb regeneracji
            setIsRegenerating(false);
          }
        },
      });
    } catch (error) {
      logger.error("Błąd podczas pobierania fiszek AI:", error);
      setRegenerationError(error instanceof Error ? error : new Error("Nieznany błąd podczas pobierania fiszek AI"));
      toast.error("Nie udało się pobrać listy fiszek AI");
      setIsRegenerating(false);
    }
  };

  if (documentError) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ErrorAlert message={`Błąd podczas ładowania dokumentu: ${documentError}`} />
        <Button variant="outline" onClick={refetchDocument}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ErrorAlert message={`Błąd podczas ładowania fiszek: ${error.message}`} />
        <Button variant="outline" onClick={refetchFlashcards}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" withCard message="Ładowanie fiszek..." />
        </div>
      </div>
    );
  }

  if (isLoadingDocument) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" withCard message="Ładowanie dokumentu..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-8 flex-1">
        <DocumentHeader
          document={document}
          breadcrumbs={[
            { id: "topics", name: "Tematy", href: "/topics" },
            {
              id: document?.topic_id || "",
              name: document?.topic_title || "Temat",
              href: `/topics/${document?.topic_id}`,
            },
          ]}
          unapprovedCount={document?.pending_flashcards_count || 0}
          aiFlashcardsCount={document?.ai_flashcards_count || 0}
          manualFlashcardsCount={document?.manual_flashcards_count || 0}
          onBack={() => (window.location.href = `/topics/${document?.topic_id}`)}
          onEdit={documentActions.editDocument}
          onDelete={() =>
            dialogActions.openDialog({
              title: "Usuń dokument",
              description: "Czy na pewno chcesz usunąć ten dokument? Tej operacji nie można cofnąć.",
              confirmText: "Usuń",
              onConfirm: handleDeleteDocument,
            })
          }
          onRegenerate={handleRegenerateFlashcards}
          isLoading={isLoadingDocument}
        />

        {actionError && (
          <div className="mt-4">
            <ErrorAlert message={actionError.message} />
          </div>
        )}

        {regenerationError && (
          <div className="mt-4">
            <ErrorAlert message={regenerationError.message} />
          </div>
        )}

        {flashcards.length === 0 && !isLoading ? (
          <FlashcardsEmptyState onRegenerate={handleRegenerateFlashcards} isRegenerating={isRegenerating} />
        ) : (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <FlashcardsSorter
                currentSort={sort}
                onChange={updateSort}
                itemsPerPage={pagination?.itemsPerPage || 24}
                onItemsPerPageChange={setItemsPerPage}
              />
              <Button onClick={() => setIsAddModalOpen(true)} className="mb-6">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj fiszkę ręcznie
              </Button>
            </div>

            <FlashcardsList
              flashcards={flashcards}
              isLoading={isLoading}
              mode="view"
              pagination={
                pagination || {
                  currentPage: 1,
                  totalPages: 1,
                  totalItems: 0,
                  itemsPerPage: 24,
                }
              }
              onEditFlashcard={handleEditFlashcard}
              onDeleteFlashcard={handleDeleteFlashcard}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {isRegenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-lg font-medium">Generowanie fiszek...</p>
            <p className="text-sm text-muted-foreground">Proszę czekać, to może chwilę zająć.</p>
          </div>
        </div>
      )}

      <div className="mt-auto">
        <AlertConfirmDialog
          isOpen={dialogState.isOpen}
          title={dialogState.title}
          description={typeof dialogState.description === "string" ? dialogState.description : ""}
          confirmText={dialogState.confirmText}
          onConfirm={dialogActions.handleConfirm}
          onClose={dialogActions.closeDialog}
        />

        <EditFlashcardModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={async (data) => {
            if ("source" in data) {
              await handleAddFlashcard({
                ...data,
                document_id: documentId,
              });
            }
          }}
          isSubmitting={isAddingFlashcard}
          mode="add"
        />
      </div>
    </div>
  );
}
