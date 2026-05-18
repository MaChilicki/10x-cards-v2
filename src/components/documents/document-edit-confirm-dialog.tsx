import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";

interface DocumentEditConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  dangerousHTML?: boolean;
}

export function DocumentEditConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Potwierdź",
  onConfirm,
  onCancel,
  dangerousHTML = false,
}: DocumentEditConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {dangerousHTML ? (
            <DialogDescription className="text-foreground/80" dangerouslySetInnerHTML={{ __html: description }} />
          ) : (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isConfirming}>
            Anuluj
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Przetwarzanie...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
