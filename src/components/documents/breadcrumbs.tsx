import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  id: string;
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  currentDocumentTitle: string;
}

export function Breadcrumbs({ items, currentDocumentTitle }: BreadcrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item) => (
          <BreadcrumbItem key={item.id}>
            <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{currentDocumentTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
