import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorAlert } from "@/components/ui/error-alert";

const STORAGE_KEY = "documents-per-page";
const DEFAULT_OPTIONS = [12, 24, 36] as const;
const DEFAULT_VALUE = 24;

interface DocumentsPerPageSelectProps {
  value: (typeof DEFAULT_OPTIONS)[number];
  onChange: (value: (typeof DEFAULT_OPTIONS)[number]) => void;
  options?: typeof DEFAULT_OPTIONS;
}

export const DocumentsPerPageSelect = ({ value, onChange, options = DEFAULT_OPTIONS }: DocumentsPerPageSelectProps) => {
  const [error, setError] = useState<string | null>(null);

  // Inicjalizacja wartości z localStorage tylko przy pierwszym renderowaniu
  useEffect(() => {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      localStorage.setItem(STORAGE_KEY, DEFAULT_VALUE.toString());
    }
    return undefined; // Jawnie zwracamy undefined jako funkcję czyszczącą
  }, []); // Pusta tablica zależności - efekt wykonuje się tylko raz

  const handleChange = (newValue: string) => {
    const parsedValue = parseInt(newValue, 10);
    if (!options.includes(parsedValue as (typeof DEFAULT_OPTIONS)[number])) {
      setError(`Nieprawidłowa wartość: ${newValue}. Dozwolone wartości: ${options.join(", ")}`);
      return;
    }
    setError(null);
    const validValue = parsedValue as (typeof DEFAULT_OPTIONS)[number];
    localStorage.setItem(STORAGE_KEY, validValue.toString());
    onChange(validValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Dokumentów na stronie:</span>
        <Select value={value.toString()} onValueChange={handleChange}>
          <SelectTrigger className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option.toString()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <ErrorAlert message={error} />}
    </div>
  );
};
