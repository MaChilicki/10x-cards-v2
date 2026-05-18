import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { DocumentActions } from "./document-actions";
import type { DocumentDto } from "@/types";
import { pluralizeFlashcard } from "@/lib/utils/pluralize";

interface BreadcrumbItem {
  id: string;
  name: string;
  href: string;
}

interface DocumentHeaderProps {
  /** Dokument do wyświetlenia */
  document: DocumentDto | null;
  /** Lista elementów breadcrumb */
  breadcrumbs?: BreadcrumbItem[];
  /** Czy pokazywać "Fiszki do zatwierdzenia" jako ostatni element breadcrumb */
  showApprovalBreadcrumb?: boolean;
  /** Liczba niezatwierdzonych fiszek AI */
  unapprovedCount: number;
  /** Liczba zatwierdzonych fiszek AI */
  aiFlashcardsCount: number;
  /** Liczba fiszek manualnych */
  manualFlashcardsCount: number;
  /** Callback wywoływany po kliknięciu przycisku powrotu */
  onBack?: () => void;
  /** Callback wywoływany po kliknięciu przycisku edycji */
  onEdit?: () => void;
  /** Callback wywoływany po kliknięciu przycisku usuwania */
  onDelete?: () => void;
  /** Callback wywoływany po kliknięciu przycisku regeneracji fiszek */
  onRegenerate?: () => void;
  /** Czy trwa ładowanie danych */
  isLoading?: boolean;
  /** Czy pokazywać akcje dokumentu (edycja, usuwanie, regeneracja) */
  showActions?: boolean;
}

export function DocumentHeader({
  document,
  breadcrumbs,
  showApprovalBreadcrumb = false,
  unapprovedCount,
  aiFlashcardsCount,
  manualFlashcardsCount,
  onBack,
  onEdit,
  onDelete,
  onRegenerate,
  isLoading = false,
  showActions = true,
}: DocumentHeaderProps) {
  if (!document) {
    return null;
  }

  // Budujemy domyślne breadcrumbs jeśli nie zostały dostarczone
  const defaultBreadcrumbs = [
    { id: "topics", name: "Tematy", href: "/topics" },
    {
      id: document.topic_id || "",
      name: document.topic_title || "Temat",
      href: `/topics/${document.topic_id}`,
    },
  ];

  const finalBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

  return (
    <header className="space-y-6 pb-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Powrót</span>
            </Button>
          )}

          <Breadcrumb>
            <BreadcrumbList>
              {finalBreadcrumbs.map((item) => [
                <BreadcrumbItem key={`item-${item.id}`}>
                  <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
                </BreadcrumbItem>,
                <BreadcrumbSeparator key={`sep-${item.id}`} />,
              ])}
              <BreadcrumbItem>
                <BreadcrumbLink href={`/documents/${document.id}`}>{document.name}</BreadcrumbLink>
              </BreadcrumbItem>
              {showApprovalBreadcrumb && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Fiszki do zatwierdzenia</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {showActions && (onEdit || onDelete || onRegenerate) && (
          <DocumentActions
            id={document.id}
            onEdit={onEdit}
            onDelete={onDelete}
            onRegenerate={onRegenerate}
            isLoading={isLoading}
            unapprovedCount={unapprovedCount}
            totalAiFlashcardsCount={(document.ai_flashcards_count || 0) + (unapprovedCount || 0)}
          />
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{document.name}</h1>
        {document.content && <p className="text-sm text-muted-foreground line-clamp-2">{document.content}</p>}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Fiszki:</span>
        <Badge className="bg-sky-700 hover:bg-sky-800 cursor-default">
          AI: {aiFlashcardsCount} {pluralizeFlashcard(aiFlashcardsCount)}
        </Badge>
        <Badge className="bg-red-700 hover:bg-red-800 cursor-default">
          Własne: {manualFlashcardsCount} {pluralizeFlashcard(manualFlashcardsCount)}
        </Badge>
        {unapprovedCount > 0 && (
          <Badge className="bg-lime-600 hover:bg-lime-700 cursor-default">
            Do zatwierdzenia: {unapprovedCount} {pluralizeFlashcard(unapprovedCount)}
          </Badge>
        )}
      </div>
    </header>
  );
}
