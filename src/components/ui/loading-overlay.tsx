interface LoadingOverlayProps {
  isVisible: boolean;
  message: string;
  subMessage?: string;
  "data-testid"?: string;
}

export function LoadingOverlay({
  isVisible,
  message,
  subMessage = "Proszę czekać, to może chwilę zająć.",
  "data-testid": dataTestId = "loading-overlay",
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100]"
      data-testid={dataTestId}
    >
      <div
        className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-lg"
        data-testid={`${dataTestId}-container`}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
          data-testid={`${dataTestId}-spinner`}
        />
        <p className="text-lg font-medium" data-testid={`${dataTestId}-message`}>
          {message}
        </p>
        <p className="text-sm text-muted-foreground" data-testid={`${dataTestId}-submessage`}>
          {subMessage}
        </p>
      </div>
    </div>
  );
}
