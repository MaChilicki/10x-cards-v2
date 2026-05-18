import { Button } from "./button";
import { LoadingSpinner } from "./loading-spinner";
import type { SubmitButtonGroupProps } from "@/components/documents/types";

export function SubmitButtonGroup({ onCancel, isSaving }: SubmitButtonGroupProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
        Anuluj
      </Button>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4" />
            Zapisywanie...
          </>
        ) : (
          "Zapisz"
        )}
      </Button>
    </div>
  );
}
