import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TopicFormModal } from "./topic-form-modal";
import { DeleteTopicDialog } from "./delete-topic-dialog";
import { TopicsList } from "./topics-list";
import { TopicsSorter } from "./topics-sorter";
import { useTopics } from "./hooks/use-topics";
import type { TopicDto, TopicCreateDto } from "@/types";
import { ErrorAlert } from "@/components/ui/error-alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigate } from "@/components/hooks/use-navigate";
import { Pagination } from "@/components/ui/pagination";
import type { TopicsSortModel } from "./types";
import { toast } from "sonner";

export function TopicsListView() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sort, setSort] = useState<TopicsSortModel>({
    sortBy: "name",
    sortOrder: "asc",
  });

  const { topics, loading, error, addTopic, updateTopic, deleteTopic, fetchTopics } = useTopics();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicDto | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Obsługa wygaśnięcia sesji
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
      navigate("/login");
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, [navigate]);

  const handleOpenAddModal = () => {
    setSelectedTopic(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (topic: TopicDto) => {
    setSelectedTopic(topic);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTopic(null);
    setIsEditMode(false);
  };

  const handleOpenDeleteDialog = (topic: TopicDto) => {
    setSelectedTopic(topic);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedTopic(null);
  };

  const handleTopicClick = (topic: TopicDto) => {
    navigate(`/topics/${topic.id}`);
  };

  const handleSubmit = async (data: TopicCreateDto | Partial<{ name: string; description: string }>) => {
    try {
      if (isEditMode && selectedTopic) {
        await updateTopic(selectedTopic.id, data as TopicCreateDto);
        toast.success("Temat został zaktualizowany");
      } else {
        if (!("name" in data) || !data.name) {
          throw new Error("Nazwa tematu jest wymagana");
        }
        await addTopic(data as TopicCreateDto);
        toast.success("Temat został dodany");
      }
      handleCloseModal();
      await fetchTopics();
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
        navigate("/login");
      } else {
        toast.error("Nie udało się zapisać tematu. Spróbuj ponownie później.");
      }
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedTopic) return;

    try {
      await deleteTopic(selectedTopic.id);
      toast.success("Temat został usunięty");
      handleCloseDeleteDialog();
      await fetchTopics();
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        toast.error("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
        navigate("/login");
      } else {
        toast.error("Nie udało się usunąć tematu. Spróbuj ponownie później.");
      }
      throw error;
    }
  };

  const handleSortChange = (newSort: TopicsSortModel) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const sortedTopics = [...topics].sort((a, b) => {
    const aValue = a[sort.sortBy];
    const bValue = b[sort.sortBy];

    if (sort.sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedTopics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTopics = sortedTopics.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="topics-loading-view">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" withCard message="Ładowanie tematów..." />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message={error instanceof Error ? error.message : String(error)} />;
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="topics-list-view">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold" data-testid="topics-heading">
          Tematy
        </h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <TopicsSorter
          currentSort={sort}
          onChange={handleSortChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
        <Button onClick={handleOpenAddModal} data-testid="add-topic-button">
          Dodaj temat
        </Button>
      </div>

      <TopicsList
        topics={paginatedTopics}
        onTopicClick={handleTopicClick}
        onEditClick={handleOpenEditModal}
        onDeleteClick={handleOpenDeleteDialog}
      />

      {totalPages > 1 && (
        <div className="mt-6" data-testid="topics-pagination">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      <TopicFormModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        initialData={selectedTopic}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      <DeleteTopicDialog
        isOpen={isDeleteDialogOpen}
        topic={selectedTopic}
        deleting={false}
        error={null}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  );
}
