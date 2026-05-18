import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface EmptyStateProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      {actionText && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionText}
        </Button>
      )}
    </div>
  );
}
