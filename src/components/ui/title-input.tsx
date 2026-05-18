import { Input } from "./input";
import { Label } from "./label";

export interface TitleInputProps {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
}

export function TitleInput({
  id = "title",
  name = "title",
  label = "Tytuł",
  value,
  onChange,
  onBlur,
  error,
  placeholder = "Wprowadź tytuł...",
  maxLength = 100,
}: TitleInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>
      <Input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={error ? "border-destructive" : ""}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
