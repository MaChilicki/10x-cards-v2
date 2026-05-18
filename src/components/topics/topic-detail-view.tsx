import { useState, useEffect } from "react";
import { useTopicDetail } from "./hooks/use-topic-detail";
import { useDocumentsList } from "@/components/documents/hooks/use-documents-list";
import { TopicHeader } from "./topic-header";
import { DocumentList } from "@/components/documents/document-list";
import { EmptyState } from "@/components/documents/empty-state";
import { ConfirmDeleteModal } from "@/components/documents/confirm-delete-modal";
import type { DocumentViewModel } from "@/components/documents/types";
import type { DocumentsSortModel } from "@/components/documents/types";
import { ErrorAlert } from "@/components/ui/error-alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/components/hooks/use-navigate";
import { useSearchParams } from "../hooks/use-search-params";
import { logger } from "@/lib/services/logger.service";
import { toast } from "sonner";

interface TopicDetailViewProps {
  /** ID tematu do wyświetlenia */
  topicId: string;
}

type PerPageValue = 12 | 24 | 36;

const TopicDetailView = ({ topicId }: TopicDetailViewProps) => {
  const navigate = useNavigate();
  const { searchParams, setParams } = useSearchParams();
  const { topic, isLoading: isTopicLoading, error: topicError, refetch: refetchTopic } = useTopicDetail(topicId);

  const [initialSort, setInitialSort] = useState<DocumentsSortModel>({ sortBy: "created_at", sortOrder: "desc" });
  const [initialPage, setInitialPage] = useState(1);
  const [initialItemsPerPage, setInitialItemsPerPage] = useState<number>(24);

  useEffect(() => {
    const sortBy = searchParams.get("sort_by") as DocumentsSortModel["sortBy"];
    const sortOrder = searchParams.get("sort_order") as DocumentsSortModel["sortOrder"];
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "24", 10);

    if (sortBy && sortOrder) {
      setInitialSort({ sortBy, sortOrder });
      setInitialPage(page);
      setInitialItemsPerPage(perPage);
    }
    return undefined;
  }, [searchParams]);

  const {
    documents,
    isLoading: isDocumentsLoading,
    error: documentsError,
    pagination,
    refetch: refetchDocuments,
    setPage,
    setItemsPerPage,
    sort,
    updateSort,
  } = useDocumentsList({
    topicId,
    initialSort,
    initialPage,
    initialItemsPerPage,
  });

  // Obsługa nawigacji wstecz
  useEffect(() => {
    const handlePopState = () => {
      refetchTopic();
      refetchDocuments();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [refetchTopic, refetchDocuments]);

  // Obsługa wygaśnięcia sesji
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
      navigate("/login");
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, [navigate]);

  const [documentToDelete, setDocumentToDelete] = useState<DocumentViewModel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  const handleSort = (newSort: DocumentsSortModel): void => {
    updateSort(newSort);
    setParams({
      sort_by: newSort.sortBy,
      sort_order: newSort.sortOrder,
      page: "1",
    });
  };

  const handlePageChange = (page: number): void => {
    setPage(page);
    setParams({ page: page.toString() });
  };

  const handlePerPageChange = (perPage: number): void => {
    const validatedPerPage = perPage as PerPageValue;
    setItemsPerPage(validatedPerPage);
    setParams({
      per_page: validatedPerPage.toString(),
      page: "1",
    });
  };

  const handleAddDocument = (): void => {
    if (!topic) return;
    navigate(`/documents/new?topicId=${topic.id}&topicTitle=${encodeURIComponent(topic.name)}`);
  };

  const handleEditDocument = (document: DocumentViewModel): void => {
    navigate(`/documents/${document.id}/edit`);
  };

  const handleDeleteDocument = (document: DocumentViewModel): void => {
    setDocumentToDelete(document);
    setDeleteError(null);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!documentToDelete) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      const response = await fetch(`/api/documents/${documentToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
          navigate("/login");
          return;
        }
        const data = await response.json();
        throw new Error(data.error?.message || "Nie udało się usunąć dokumentu");
      }

      toast.success("Dokument został usunięty");
      setDocumentToDelete(null);
      refetchDocuments();
      refetchTopic();
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Wystąpił nieoczekiwany błąd");
      logger.error("Błąd podczas usuwania dokumentu:", err);
      setDeleteError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (topicError) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ErrorAlert message="Wystąpił błąd podczas ładowania tematu" />
        <Button variant="outline" onClick={refetchTopic}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (isTopicLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" withCard message="Ładowanie tematu..." />
        </div>
      </div>
    );
  }

  if (!topic) {
    return <ErrorAlert message="Nie znaleziono tematu" />;
  }

  if (documentsError) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ErrorAlert message="Wystąpił błąd podczas ładowania dokumentów" />
        <Button variant="outline" onClick={refetchDocuments}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (isDocumentsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" withCard message="Ładowanie dokumentów..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TopicHeader topic={topic} onBack={() => navigate("/topics")} />

      {documents.length === 0 && !isDocumentsLoading ? (
        <EmptyState topicId={topicId} />
      ) : (
        <>
          <div className="mt-8">
            <DocumentList
              documents={documents}
              isLoading={isDocumentsLoading}
              pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalItems: pagination.totalItems,
                itemsPerPage: pagination.itemsPerPage,
                availablePerPage: [12, 24, 36],
              }}
              onDelete={handleDeleteDocument}
              onEdit={handleEditDocument}
              onSort={handleSort}
              sort={sort}
              onAddDocument={handleAddDocument}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handlePerPageChange}
            />
          </div>
        </>
      )}

      <ConfirmDeleteModal
        isOpen={!!documentToDelete}
        document={documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
};

export default TopicDetailView;
