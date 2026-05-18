import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface EmptyTopicsStateProps {
  onCreateTopicClick: () => void;
}

export function EmptyTopicsState({ onCreateTopicClick }: EmptyTopicsStateProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Brak tematów</CardTitle>
        <CardDescription>Nie masz jeszcze żadnych tematów. Zacznij od utworzenia pierwszego tematu.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onCreateTopicClick} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Utwórz pierwszy temat
        </Button>
      </CardContent>
    </Card>
  );
}
