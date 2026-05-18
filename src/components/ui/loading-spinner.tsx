import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Card } from "./card";

export interface LoadingSpinnerProps extends React.ComponentPropsWithoutRef<"div"> {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "primary";
  withCard?: boolean;
  message?: string;
  "data-testid"?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  default: "h-6 w-6",
  lg: "h-8 w-8",
} as const;

const variantClasses = {
  default: "text-muted-foreground",
  primary: "text-primary",
} as const;

export function LoadingSpinner({
  className,
  size = "default",
  variant = "default",
  withCard = false,
  message = "Ładowanie...",
  "data-testid": dataTestId = "loading-spinner",
  ...props
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      role="status"
      className={cn("flex flex-col items-center gap-2", "animate-pulse", className)}
      data-testid={dataTestId}
      {...props}
    >
      <div className="relative">
        <div className={cn("absolute inset-0 rounded-full", "bg-current opacity-20", "animate-ping")} />
        <Loader2 className={cn("animate-spin", sizeClasses[size], variantClasses[variant], "relative")} />
      </div>
      {message && (
        <div className="text-sm text-muted-foreground" data-testid={`${dataTestId}-message`}>
          {message}
        </div>
      )}
      <span className="sr-only">{message}</span>
    </div>
  );

  if (!withCard) return spinner;

  return (
    <Card className="p-4" data-testid={`${dataTestId}-card`}>
      {spinner}
    </Card>
  );
}
