import type { DocumentsSortModel } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

interface DocumentsSorterProps {
  currentSort: DocumentsSortModel;
  onChange: (sort: DocumentsSortModel) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 36];

export function DocumentsSorter({ currentSort, onChange, itemsPerPage, onItemsPerPageChange }: DocumentsSorterProps) {
  const handleSortByChange = (value: string) => {
    onChange({
      ...currentSort,
      sortBy: value as DocumentsSortModel["sortBy"],
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

  return (
    <div className="flex items-center gap-4 mb-6">
      <Select value={currentSort.sortBy} onValueChange={handleSortByChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sortuj według" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Treść</SelectLabel>
            <SelectItem value="name">Nazwa dokumentu</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Metadane</SelectLabel>
            <SelectItem value="created_at">Data utworzenia</SelectItem>
            <SelectItem value="updated_at">Data modyfikacji</SelectItem>
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
