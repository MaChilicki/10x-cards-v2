import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, Trash2, FileCheck2, Wand2 } from "lucide-react";

interface DocumentActionsProps {
  id: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
  unapprovedCount: number;
  totalAiFlashcardsCount: number;
}

export function DocumentActions({
  id,
  onEdit,
  onDelete,
  onRegenerate,
  isLoading = false,
  unapprovedCount,
  totalAiFlashcardsCount,
}: DocumentActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {onEdit && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                disabled={isLoading}
                className="gap-2"
                aria-label="Edytuj dokument"
              >
                <Pencil className="h-4 w-4" />
                <span>Edytuj</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edytuj dokument</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {onDelete && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                disabled={isLoading}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive"
                aria-label="Usuń dokument"
              >
                <Trash2 className="h-4 w-4" />
                <span>Usuń</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Usuń dokument</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {unapprovedCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = `/documents/${id}/flashcards/approve`)}
                disabled={isLoading}
                className="gap-2 text-lime-600 hover:text-lime-700 hover:bg-lime-50 border-lime-600 hover:border-lime-700"
              >
                <FileCheck2 className="h-4 w-4" />
                <span>Zatwierdź fiszki ({unapprovedCount})</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zatwierdź fiszki wygenerowane przez AI</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {onRegenerate && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerate}
                disabled={isLoading}
                className="gap-2 text-sky-700 hover:text-sky-800 hover:bg-sky-50 border-sky-700 hover:border-sky-800"
              >
                <Wand2 className="h-4 w-4" />
                <span>{totalAiFlashcardsCount === 0 ? "Generuj fiszki" : "Generuj nowe"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Wygeneruj nowe fiszki AI dla tego dokumentu</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
