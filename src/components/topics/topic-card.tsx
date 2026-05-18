import type { TopicDto } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FolderClosed } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TopicCardProps {
  topic: TopicDto;
  onTopicClick: (topic: TopicDto) => void;
  onEditClick: (topic: TopicDto) => void;
  onDeleteClick: (topic: TopicDto) => void;
}

export function TopicCard({ topic, onTopicClick, onEditClick, onDeleteClick }: TopicCardProps) {
  return (
    <Card className="hover:bg-accent/5" data-testid="topic-item" data-topicid={topic.id}>
      <CardHeader className="relative">
        <div className="absolute right-6 top-6 flex gap-2" data-testid="topic-actions">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="edit-topic-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(topic);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edytuj temat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="delete-topic-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(topic);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Usuń temat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardTitle
          className="cursor-pointer hover:underline"
          onClick={() => onTopicClick(topic)}
          data-testid="topic-title"
        >
          <div className="flex items-center gap-2">
            <FolderClosed className="h-4 w-4 text-muted-foreground" />
            {topic.name}
          </div>
        </CardTitle>
        {topic.description && <div className="text-sm text-muted-foreground line-clamp-2">{topic.description}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={cn("text-white bg-sky-700 hover:bg-sky-800")}>Dokumenty: {topic.documents_count}</Badge>
              <Badge className={cn("text-white bg-red-700 hover:bg-red-800")}>Fiszki: {topic.flashcards_count}</Badge>
            </div>
            <div className="text-xs">
              <div>
                Utworzono: {new Date(topic.created_at).toLocaleDateString()}{" "}
                {new Date(topic.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div>
                Zaktualizowano: {new Date(topic.updated_at).toLocaleDateString()}{" "}
                {new Date(topic.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
