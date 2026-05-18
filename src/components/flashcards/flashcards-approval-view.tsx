import React, { useEffect } from "react";
import { useFlashcardsApproval } from "./hooks/use-flashcards-approval";
import { DocumentHeader } from "@/components/documents/document-header";
import { BulkActionsBar } from "@/components/flashcards/bulk-actions-bar";
import { FlashcardsSorter } from "./flashcards-sorter";
import { FlashcardsList } from "./flashcards-list";
import { EditFlashcardModal } from "./flashcard-edit-modal";
import { AlertConfirmDialog } from "../ui/alert-confirm-dialog";
import { LoadingSpinner } from "../ui/loading-spinner";
import { ErrorAlert } from "../ui/error-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { useNavigate } from "@/components/hooks/use-navigate";

interface FlashcardsApprovalViewProps {
  documentId: string;
}

export function FlashcardsApprovalView({ documentId }: FlashcardsApprovalViewProps) {
  const navigate = useNavigate();
  const {
    // Stan
    document,
    isLoadingDocument,
    documentError,
    flashcards,
    isLoadingFlashcards,
    flashcardsError,
    pagination,
    sort,
    selectedFlashcards,
    selectedCount,
    allSelected,
    editModalState,
    confirmDialogState,

    // Akcje
    actions,

    // Efekty
    fetchDocument,
    fetchFlashcards,
  } = useFlashcardsApproval(documentId);

  // Obsługa wygaśnięcia sesji
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
      navigate("/login");
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, [navigate]);

  // Efekt pobierający dane przy montowaniu komponentu
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchDocument(), fetchFlashcards()]);
    };
    void fetchData();
    return undefined;
  }, [fetchDocument, fetchFlashcards]);

  // Efekt odświeżający fiszki przy zmianie sortowania lub paginacji
  useEffect(() => {
    const refreshFlashcards = async () => {
      await fetchFlashcards();
    };
    void refreshFlashcards();
    return undefined;
  }, [fetchFlashcards, sort, pagination.currentPage, pagination.itemsPerPage]);

  // Obsługa stanu ładowania dokumentu
  if (isLoadingDocument) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" withCard message="Ładowanie dokumentu..." />
        </div>
      </div>
    );
  }

  // Obsługa błędu ładowania dokumentu
  if (documentError) {
    if (documentError.message.includes("401")) {
      toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
      navigate("/login");
      return null;
    }
    return (
      <ErrorAlert title="Błąd ładowania" message={`Nie udało się załadować dokumentu: ${documentError.message}`} />
    );
  }

  // Obsługa błędu ładowania fiszek
  if (flashcardsError) {
    if (flashcardsError.message.includes("401")) {
      toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
      navigate("/login");
      return null;
    }
    return <ErrorAlert title="Błąd ładowania" message={`Nie udało się załadować fiszek: ${flashcardsError.message}`} />;
  }

  // Obsługa braku dokumentu
  if (!document) {
    return (
      <EmptyState
        message="Nie znaleziono dokumentu"
        actionText="Powrót do listy dokumentów"
        onAction={() => navigate("/documents")}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <DocumentHeader
          document={document}
          unapprovedCount={document.pending_flashcards_count || 0}
          aiFlashcardsCount={document.ai_flashcards_count || 0}
          manualFlashcardsCount={document.manual_flashcards_count || 0}
          isLoading={isLoadingDocument}
          showActions={false}
          onBack={() => navigate(`/documents/${document.id}`)}
          showApprovalBreadcrumb
        />

        <BulkActionsBar
          selectedCount={selectedCount}
          totalCount={flashcards.length}
          allSelected={allSelected}
          onSelectAll={actions.handleSelectAll}
          onApproveSelected={async () => {
            try {
              await actions.approveSelectedFlashcards();
              toast.success("Wybrane fiszki zostały zatwierdzone");
            } catch (error) {
              if (error instanceof Error && error.message.includes("401")) {
                toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
                navigate("/login");
              } else {
                toast.error("Nie udało się zatwierdzić wybranych fiszek");
              }
            }
          }}
          onApproveAll={async () => {
            try {
              await actions.approveAllFlashcards();
              toast.success("Wszystkie fiszki zostały zatwierdzone");
            } catch (error) {
              if (error instanceof Error && error.message.includes("401")) {
                toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
                navigate("/login");
              } else {
                toast.error("Nie udało się zatwierdzić wszystkich fiszek");
              }
            }
          }}
          isLoading={isLoadingFlashcards}
          selectedFlashcards={flashcards.filter((f) => selectedFlashcards[f.id])}
          allFlashcards={flashcards}
        />

        <FlashcardsSorter
          currentSort={sort}
          onChange={actions.handleSortChange}
          itemsPerPage={pagination.itemsPerPage}
          onItemsPerPageChange={actions.handleItemsPerPageChange}
        />

        <FlashcardsList
          flashcards={flashcards}
          isLoading={isLoadingFlashcards}
          mode="approve"
          selectedFlashcards={selectedFlashcards}
          pagination={pagination}
          onEditFlashcard={async (id, updates) => {
            const existingFlashcard = flashcards.find((f) => f.id === id);
            if (!existingFlashcard) {
              throw new Error(`Nie znaleziono fiszki o ID: ${id}`);
            }
            try {
              await actions.handleEditFlashcard({
                ...existingFlashcard,
                ...updates,
                is_modified: true,
              });
              toast.success("Fiszka została zaktualizowana");
            } catch (error) {
              if (error instanceof Error && error.message.includes("401")) {
                toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
                navigate("/login");
              } else {
                toast.error("Nie udało się zaktualizować fiszki");
              }
              throw error;
            }
          }}
          onDeleteFlashcard={async (id) => {
            try {
              await actions.handleDeleteFlashcard(id);
              toast.success("Fiszka została usunięta");
            } catch (error) {
              if (error instanceof Error && error.message.includes("401")) {
                toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
                navigate("/login");
              } else {
                toast.error("Nie udało się usunąć fiszki");
              }
              throw error;
            }
          }}
          onPageChange={actions.handlePageChange}
          onToggleSelect={actions.handleToggleSelect}
          onApproveFlashcard={async (id) => {
            const flashcard = flashcards.find((f) => f.id === id);
            if (!flashcard) return;

            return new Promise<void>((resolve) => {
              actions.showConfirmDialog(
                "Zatwierdź fiszkę",
                `Czy na pewno chcesz zatwierdzić tę fiszkę?<br/><br/>
                <div class="space-y-4">
                  <div>
                    <strong>Przód:</strong>
                    <div class="mt-2 rounded-lg border border-border bg-muted/50 p-3">
                      ${flashcard.front_modified}
                    </div>
                  </div>
                  <div>
                    <strong>Tył:</strong>
                    <div class="mt-2 rounded-lg border border-border bg-muted/50 p-3">
                      ${flashcard.back_modified}
                    </div>
                  </div>
                </div>`,
                async () => {
                  try {
                    await actions.approveFlashcard(id);
                    toast.success("Fiszka została zatwierdzona");
                    resolve();
                  } catch (error) {
                    if (error instanceof Error && error.message.includes("401")) {
                      toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
                      navigate("/login");
                    } else {
                      toast.error("Nie udało się zatwierdzić fiszki");
                    }
                    throw error;
                  }
                },
                "Zatwierdź"
              );
            });
          }}
        />

        <EditFlashcardModal
          isOpen={editModalState.isOpen}
          onClose={actions.handleCloseEdit}
          onSubmit={async (data) => {
            try {
              await actions.handleSaveEdit(editModalState.flashcard?.id || "", data);
              toast.success("Fiszka została zaktualizowana");
            } catch (error) {
              if (error instanceof Error && error.message.includes("401")) {
                toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
                navigate("/login");
              } else {
                toast.error("Nie udało się zaktualizować fiszki");
              }
              throw error;
            }
          }}
          flashcard={editModalState.flashcard}
          isSubmitting={editModalState.isSubmitting}
          mode="edit"
        />

        <AlertConfirmDialog
          isOpen={confirmDialogState.isOpen}
          title={confirmDialogState.title}
          description={confirmDialogState.description}
          confirmText={confirmDialogState.confirmText}
          onConfirm={confirmDialogState.onConfirm ?? (() => Promise.resolve())}
          onClose={actions.closeConfirmDialog}
        />
      </div>
    </div>
  );
}
