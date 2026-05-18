import type { FlashcardSource } from "@/types";
import type { FlashcardsSortModel } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

interface FlashcardsSorterProps {
  currentSort: FlashcardsSortModel;
  onChange: (sort: FlashcardsSortModel) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  sourceFilter?: FlashcardSource | "all";
  onSourceFilterChange?: (source: FlashcardSource | "all") => void;
}

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 36];

export function FlashcardsSorter({
  currentSort,
  onChange,
  itemsPerPage,
  onItemsPerPageChange,
  sourceFilter = "all",
  onSourceFilterChange,
}: FlashcardsSorterProps) {
  const handleSortByChange = (value: string) => {
    onChange({
      ...currentSort,
      sortBy: value as FlashcardsSortModel["sortBy"],
    });
  };

  const handleSortOrderChange = (value: string) => {
    onChange({
      ...currentSort,
      sortOrder: value as "asc" | "desc",
    });
  };

  const handleItemsPerPageChange = (value: string) => {
    onItemsPerPageChange(Number(value));
  };

  const handleSourceFilterChange = (value: string) => {
    onSourceFilterChange?.(value as FlashcardSource | "all");
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <Select value={currentSort.sortBy} onValueChange={handleSortByChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sortuj według" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Treść</SelectLabel>
            <SelectItem value="front_modified">Przód fiszki</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Metadane</SelectLabel>
            <SelectItem value="created_at">Data utworzenia</SelectItem>
            <SelectItem value="updated_at">Data modyfikacji</SelectItem>
            <SelectItem value="source">Źródło</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={currentSort.sortOrder} onValueChange={handleSortOrderChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Kolejność" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Rosnąco</SelectItem>
          <SelectItem value="desc">Malejąco</SelectItem>
        </SelectContent>
      </Select>

      {onSourceFilterChange && (
        <Select value={sourceFilter} onValueChange={handleSourceFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Źródło" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="ai">AI</SelectItem>
            <SelectItem value="manual">Manualne</SelectItem>
          </SelectContent>
        </Select>
      )}

      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Pokaż na stronie:</span>
        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
          <SelectTrigger className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ITEMS_PER_PAGE_OPTIONS.map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
