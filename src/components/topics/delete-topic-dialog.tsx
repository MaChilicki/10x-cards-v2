import type { TopicDto } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteTopicDialogProps {
  isOpen: boolean;
  topic: TopicDto | null;
  deleting: boolean;
  error: Error | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteTopicDialog({ isOpen, topic, deleting, error, onClose, onConfirm }: DeleteTopicDialogProps) {
  if (!topic) return null;

  const hasContent = topic.documents_count > 0 || topic.flashcards_count > 0;
  const contentWarning = hasContent && (
    <Alert variant="destructive" className="mt-4" data-testid="delete-topic-content-warning">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {`Nie można usunąć tematu, który zawiera ${topic.documents_count} ${
          topic.documents_count === 1
            ? "dokument"
            : topic.documents_count > 1 && topic.documents_count < 5
              ? "dokumenty"
              : "dokumentów"
        }${
          topic.flashcards_count > 0
            ? ` i ${topic.flashcards_count} ${
                topic.flashcards_count === 1
                  ? "fiszkę"
                  : topic.flashcards_count > 1 && topic.flashcards_count < 5
                    ? "fiszki"
                    : "fiszek"
              }`
            : ""
        }. Usuń najpierw całą zawartość tematu.`}
      </AlertDescription>
    </Alert>
  );

  const errorAlert = error && (
    <Alert variant="destructive" className="mt-4" data-testid="delete-topic-error">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error.message || "Wystąpił błąd podczas usuwania tematu"}</AlertDescription>
    </Alert>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-testid="delete-topic-dialog">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>Usuń temat</DialogTitle>
          </div>
          <DialogDescription>
            Czy na pewno chcesz usunąć temat &quot;{topic.name}&quot;? Tej operacji nie można cofnąć.
          </DialogDescription>
        </DialogHeader>

        {contentWarning}
        {errorAlert}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleting}
            data-testid="delete-topic-cancel-button"
          >
            Anuluj
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting || hasContent}
            data-testid="delete-topic-confirm-button"
          >
            {deleting ? "Usuwanie..." : "Usuń temat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
