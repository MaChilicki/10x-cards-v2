import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import type { DocumentViewModel } from "./types";
import { useNavigate } from "@/components/hooks/use-navigate";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DocumentCardProps {
  document: DocumentViewModel;
  onDelete: (document: DocumentViewModel) => void;
  onEdit: (document: DocumentViewModel) => void;
  unapproved_flashcards_count: number;
}

export function DocumentCard({ document, onDelete, onEdit, unapproved_flashcards_count }: DocumentCardProps) {
  const navigate = useNavigate();

  return (
    <Card key={document.id} className="hover:bg-accent/5">
      <CardHeader className="relative">
        <div className="absolute right-6 top-6 flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(document);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edytuj dokument</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(document);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Usuń dokument</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardTitle className="cursor-pointer hover:underline" onClick={() => navigate(`/documents/${document.id}`)}>
          {document.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-2"></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              Fiszki:
              {(document.ai_flashcards_count ?? 0) > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className={cn("text-white bg-sky-700 hover:bg-sky-800 cursor-default")}>
                        AI: {document.ai_flashcards_count}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fiszki wygenerowane przez AI</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {(document.manual_flashcards_count ?? 0) > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className={cn("text-white bg-red-700 hover:bg-red-800 cursor-default")}>
                        Własne: {document.manual_flashcards_count}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fiszki utworzone ręcznie</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {(unapproved_flashcards_count ?? 0) > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className={cn("text-white bg-lime-600 hover:bg-lime-700 cursor-default")}>
                        Do zatwierdzenia: {unapproved_flashcards_count}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fiszki oczekujące na zatwierdzenie</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {(document.ai_flashcards_count ?? 0) <= 0 &&
                (document.manual_flashcards_count ?? 0) <= 0 &&
                (unapproved_flashcards_count ?? 0) <= 0 && <span>0</span>}
            </div>
            <div>
              Utworzono: {new Date(document.created_at).toLocaleDateString()}{" "}
              {new Date(document.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div>
              Zaktualizowano: {new Date(document.updated_at).toLocaleDateString()}{" "}
              {new Date(document.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
