import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface ErrorAlertProps extends React.ComponentPropsWithoutRef<typeof Alert> {
  title?: string;
  message: string;
  className?: string;
}

export function ErrorAlert({ className, title = "Błąd", message, ...props }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={cn("flex items-center gap-2", className)} {...props}>
      <AlertTriangle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
    </Alert>
  );
}
