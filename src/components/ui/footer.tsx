import { cn } from "@/lib/utils";
import { APP_CONSTANTS } from "@/constants/app";

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("fixed bottom-0 left-0 right-0 w-full border-t border-border bg-background", className)}>
      <div className="container mx-auto px-4 py-2 text-center">
        <div className="mb-2 text-sm">
          <img src="/logo.svg" alt={`${APP_CONSTANTS.name} Logo`} className="inline-block h-8 w-8 mr-1 align-middle" />
          <span className="font-bold text-sm">{APP_CONSTANTS.name}</span>
          <span className="text-muted-foreground"> — {APP_CONSTANTS.slogan}</span>
          <span className="text-muted-foreground">
            &nbsp;© {new Date().getFullYear()} {APP_CONSTANTS.name}. Udostępniono na licencji{" "}
            <a
              href="https://opensource.org/license/mit"
              className="underline hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              MIT
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
