import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorTopicsStateProps {
  error: Error;
  onRetry: () => void;
}

export function ErrorTopicsState({ error, onRetry }: ErrorTopicsStateProps) {
  return (
    <Card className="w-full max-w-md mx-auto border-destructive">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle>Wystąpił błąd</CardTitle>
        </div>
        <CardDescription>{error.message || "Nie udało się załadować tematów. Spróbuj ponownie."}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onRetry} variant="outline" className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Spróbuj ponownie
        </Button>
      </CardContent>
    </Card>
  );
}
