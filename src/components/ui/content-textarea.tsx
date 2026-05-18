import { Textarea } from "./textarea";
import { Label } from "./label";
import { CharacterCounter } from "./character-counter";

export interface ContentTextareaProps {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  showCounter?: boolean;
}

export function ContentTextarea({
  id = "content",
  name = "content",
  label = "Treść",
  value,
  onChange,
  onBlur,
  error,
  placeholder = "Wprowadź treść...",
  minLength = 0,
  maxLength = 10000,
  showCounter = true,
}: ContentTextareaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>
      <Textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`h-[400px] resize-none overflow-y-auto ${error ? "border-destructive" : ""}`}
        placeholder={placeholder}
      />
      <div className="space-y-1">
        {showCounter && <CharacterCounter count={value.length} min={minLength} max={maxLength} />}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
