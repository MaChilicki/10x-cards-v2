import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { TopicDto } from "@/types";
import { pluralizeDocument, pluralizeFlashcard } from "@/lib/utils/pluralize";

interface TopicHeaderProps {
  /** Temat do wyświetlenia */
  topic: TopicDto;
  /** Callback wywoływany po kliknięciu przycisku powrotu */
  onBack: () => void;
}

export const TopicHeader = ({ topic, onBack }: TopicHeaderProps) => {
  return (
    <header className="space-y-4 pb-4 border-b">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Powrót</span>
        </Button>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/topics">Tematy</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            {topic.breadcrumbs.slice(0, -1).map((item) => (
              <BreadcrumbItem key={item.id}>
                <BreadcrumbLink href={`/topics/${item.id}`}>{item.name}</BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
            ))}

            <BreadcrumbItem>
              <BreadcrumbPage>{topic.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{topic.name}</h1>
        {topic.description && <p className="text-muted-foreground">{topic.description}</p>}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {topic.documents_count} {pluralizeDocument(topic.documents_count)}
          </span>
          <span>•</span>
          <span>
            {topic.flashcards_count} {pluralizeFlashcard(topic.flashcards_count)}
          </span>
        </div>
      </div>
    </header>
  );
};
