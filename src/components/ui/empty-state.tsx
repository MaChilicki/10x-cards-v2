import React from "react";
import { Button } from "./button";

interface EmptyStateProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <p className="text-lg text-muted-foreground mb-4">{message}</p>
      {actionText && onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
