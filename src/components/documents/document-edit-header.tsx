import * as React from "react";
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

export interface BreadcrumbItemType {
  id: string;
  name: string;
  href: string;
}

interface DocumentEditHeaderProps {
  /** Tytuł dokumentu (jeśli edytujemy istniejący) */
  documentName?: string;
  /** ID dokumentu (jeśli edytujemy istniejący) */
  documentId?: string;
  /** ID tematu */
  topicId: string;
  /** Tytuł tematu */
  topicTitle: string;
  /** Lista elementów breadcrumb (opcjonalna) */
  breadcrumbs?: BreadcrumbItemType[];
  /** Callback wywoływany po kliknięciu przycisku powrotu */
  onBack: () => void;
}

export const DocumentEditHeader = ({
  documentName,
  documentId,
  topicId,
  topicTitle,
  breadcrumbs,
  onBack,
}: React.ComponentProps<"header"> & DocumentEditHeaderProps) => {
  // Domyślne breadcrumbs, jeśli nie zostały dostarczone
  const defaultBreadcrumbs = [
    { id: "topics", name: "Tematy", href: "/topics" },
    {
      id: topicId,
      name: topicTitle,
      href: `/topics/${topicId}`,
    },
  ];

  // Jeśli mamy dokument (edycja) dodajemy dokument do ścieżki
  if (documentId && documentName) {
    defaultBreadcrumbs.push({
      id: documentId,
      name: documentName,
      href: `/documents/${documentId}`,
    });
    // Dodajemy "Edycja" jako ostatni element
    defaultBreadcrumbs.push({
      id: "edit",
      name: "Edycja dokumentu",
      href: "#",
    });
  } else {
    // Jeśli tworzymy nowy dokument
    defaultBreadcrumbs.push({
      id: "new",
      name: "Nowy dokument",
      href: "#",
    });
  }

  // Używamy dostarczonych breadcrumbs lub domyślnych
  const finalBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

  return (
    <header className="space-y-4 pb-4 border-b">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Powrót</span>
        </Button>

        <Breadcrumb>
          <BreadcrumbList>
            {finalBreadcrumbs.map((item, index) => {
              // Ostatni element
              if (index === finalBreadcrumbs.length - 1) {
                return (
                  <BreadcrumbItem key={item.id}>
                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                );
              }

              // Pozostałe elementy z linkami i separatorem
              return [
                <BreadcrumbItem key={`item-${item.id}`}>
                  <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
                </BreadcrumbItem>,
                <BreadcrumbSeparator key={`sep-${item.id}`} />,
              ];
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {documentId ? `Edycja: ${documentName}` : "Nowy dokument"}
        </h1>
        <p className="text-muted-foreground">
          {documentId ? "Edytuj istniejący dokument" : "Utwórz nowy dokument w temacie"}
        </p>
      </div>
    </header>
  );
};
