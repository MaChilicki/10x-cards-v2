import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EditFlashcardModal } from "./flashcard-edit-modal";
import { Repeat, Pencil, Trash2 } from "lucide-react";
import type { FlashcardDto, FlashcardUpdateDto } from "@/types";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface FlashcardCardProps {
  flashcard: FlashcardDto;
  onEdit: (updates: Partial<FlashcardDto>) => Promise<void>;
  onDelete: () => Promise<void>;
  isFlipped: boolean;
  onFlip: () => void;
  mode?: "learn" | "approve" | "view";
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onApprove?: () => Promise<void>;
}

export function FlashcardCard({
  flashcard,
  onEdit,
  onDelete,
  isFlipped,
  onFlip,
  mode = "view",
  isSelected = false,
  onToggleSelect,
  onApprove,
}: FlashcardCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data: FlashcardUpdateDto) => {
    await onEdit(data);
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const frontContent = flashcard.front_modified || flashcard.front_original;
  const backContent = flashcard.back_modified || flashcard.back_original;

  const renderCard = (side: "front" | "back") => {
    const content = side === "front" ? frontContent : backContent;
    const bgColor = side === "front" ? "bg-sky-100/90" : "bg-yellow-100/90";

    return (
      <div className={`flashcard-face flashcard-${side}`}>
        <Card className={cn("w-full h-full shadow-lg", bgColor)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "text-white",
                  flashcard.source === "ai" ? "bg-sky-700 hover:bg-sky-800" : "bg-red-700 hover:bg-red-800"
                )}
              >
                {flashcard.source === "ai" ? "AI" : "Własna"}
              </Badge>
              {mode === "approve" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect?.()}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "ml-2 border-2 bg-white cursor-pointer border-gray-400 hover:border-gray-500",
                          "data-[state=checked]:bg-white data-[state=checked]:text-primary"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Zaznacz fiszkę</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onFlip} className="h-8 w-8" aria-label="Obróć fiszkę">
                      <Repeat className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Obróć fiszkę</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEdit}
                      className="h-8 w-8"
                      aria-label="Edytuj fiszkę"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edytuj fiszkę</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label="Usuń fiszkę"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Usuń fiszkę</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent
            role="button"
            tabIndex={0}
            className="pt-6 cursor-pointer h-[calc(100%-80px)] flex flex-col"
            onClick={onFlip}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onFlip();
              }
            }}
          >
            <h3 className="text-lg font-semibold text-left mb-4">{side === "front" ? "Przód" : "Tył"}</h3>
            <div className="flex-1 min-h-0 rounded-lg bg-white/50">
              <div className="h-full p-6 overflow-y-auto flex items-center justify-center">
                <p
                  className={cn(
                    "text-center whitespace-pre-wrap break-words",
                    side === "front" ? "text-xl font-medium" : "text-xs md:text-sm font-normal"
                  )}
                >
                  {content}
                </p>
              </div>
            </div>
            {mode === "approve" && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove?.();
                  }}
                >
                  Zatwierdź
                </Button>
              </div>
            )}
            <div className="mt-2 text-xs text-muted-foreground pt-2">
              <div>
                Utworzono: {new Date(flashcard.created_at).toLocaleDateString()}{" "}
                {new Date(flashcard.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div>
                Zaktualizowano: {new Date(flashcard.updated_at).toLocaleDateString()}{" "}
                {new Date(flashcard.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      <div
        className={cn(
          "flashcard-container",
          mode === "approve" &&
            isSelected &&
            cn("ring-2 rounded-lg", flashcard.source === "ai" ? "ring-sky-700" : "ring-red-700")
        )}
      >
        <div className={`flashcard-inner ${isFlipped ? "is-flipped" : ""}`}>
          {renderCard("front")}
          {renderCard("back")}
        </div>
      </div>

      <style>{`
        .flashcard-container {
          width: 100%;
          height: 500px;
          perspective: 1000px;
        }

        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flashcard-inner.is-flipped {
          transform: rotateY(180deg);
        }

        .flashcard-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden; /* Safari */
        }

        .flashcard-front {
          z-index: 2;
        }

        .flashcard-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <EditFlashcardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        flashcard={flashcard}
        mode="edit"
      />
    </>
  );
}
