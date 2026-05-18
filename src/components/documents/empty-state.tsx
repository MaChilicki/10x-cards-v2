import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "@/components/hooks/use-navigate";

interface EmptyStateProps {
  topicId: string;
}

export function EmptyState({ topicId }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Brak dokumentów</h3>
      <p className="text-muted-foreground mb-6">
        Ten temat nie zawiera jeszcze żadnych dokumentów. Dodaj pierwszy dokument, aby rozpocząć tworzenie fiszek.
      </p>
      <Button onClick={() => navigate(`/documents/new?topicId=${topicId}`)} className="gap-2">
        <Plus className="h-4 w-4" />
        Dodaj pierwszy dokument
      </Button>
    </div>
  );
}
