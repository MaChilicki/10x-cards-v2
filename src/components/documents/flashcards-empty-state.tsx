import { Button } from "@/components/ui/button";
import { FileText, RefreshCw } from "lucide-react";

interface FlashcardsEmptyStateProps {
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function FlashcardsEmptyState({ onRegenerate, isRegenerating }: FlashcardsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Brak fiszek</h3>
      <p className="text-muted-foreground mb-6">
        Ten dokument nie zawiera jeszcze żadnych fiszek. Możesz wygenerować fiszki automatycznie na podstawie treści
        dokumentu.
      </p>
      <Button onClick={onRegenerate} className="gap-2" disabled={isRegenerating}>
        <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
        {isRegenerating ? "Generowanie..." : "Wygeneruj fiszki"}
      </Button>
    </div>
  );
}
