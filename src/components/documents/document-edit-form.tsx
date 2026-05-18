import { TitleInput } from "@/components/ui/title-input";
import { ContentTextarea } from "@/components/ui/content-textarea";
import { SubmitButtonGroup } from "@/components/ui/submit-button-group";
import type { DocumentEditFormProps } from "./types";

const MIN_CONTENT_LENGTH = 1000;
const MAX_CONTENT_LENGTH = 10000;

export function DocumentEditForm({
  initialValues,
  onSubmit,
  onChange,
  onCancel,
  isSaving,
  errors,
}: DocumentEditFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(initialValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TitleInput
        id="name"
        name="name"
        label="Tytuł dokumentu"
        value={initialValues.name}
        onChange={onChange}
        error={errors.name}
        placeholder="Wprowadź tytuł dokumentu..."
        maxLength={100}
      />

      <ContentTextarea
        id="content"
        name="content"
        label="Treść dokumentu"
        value={initialValues.content}
        onChange={onChange}
        error={errors.content}
        placeholder="Wprowadź treść dokumentu..."
        minLength={MIN_CONTENT_LENGTH}
        maxLength={MAX_CONTENT_LENGTH}
        showCounter={true}
      />

      <SubmitButtonGroup onCancel={onCancel} isSaving={isSaving} />
    </form>
  );
}
