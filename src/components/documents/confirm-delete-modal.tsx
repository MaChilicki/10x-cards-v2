import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorAlert } from "@/components/ui/error-alert";
import type { DocumentViewModel } from "./types";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  document: DocumentViewModel | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  error: Error | null;
}

export function ConfirmDeleteModal({
  isOpen,
  document,
  onClose,
  onConfirm,
  isDeleting,
  error,
}: ConfirmDeleteModalProps) {
  if (!document) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć ten dokument?</AlertDialogTitle>
          <AlertDialogDescription>
            Dokument &quot;{document.name}&quot; zostanie trwale usunięty wraz ze wszystkimi powiązanymi fiszkami. Tej
            operacji nie można cofnąć.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="my-4">
            <ErrorAlert message={error.message} />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? <LoadingSpinner className="h-4 w-4" /> : "Usuń"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
