import { useState } from "react";
import { useAuth } from "@/components/auth/hooks/use-auth";
import { UserAvatar } from "@/components/ui/user-avatar";
import { LogoutDialog } from "@/components/auth/logout-dialog";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_CONSTANTS } from "@/constants/app";
import { logger } from "@/lib/services/logger.service";

export function MainNav() {
  const { user, isLoading } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Błąd podczas wylogowania");
      }

      window.location.href = "/login";
    } catch (error) {
      logger.error("Błąd podczas wylogowania", error);
      throw error;
    }
  };

  return (
    <header
      className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-testid="main-navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <a className="flex items-center space-x-2" href="/" data-testid="app-logo">
              <img src="/logo.svg" alt={`${APP_CONSTANTS.name} Logo`} className="h-9 w-9" />
              <span className="font-bold">{APP_CONSTANTS.name}</span>
            </a>
            <NavigationMenu>
              <NavigationMenuList data-testid="navigation-menu">
                <NavigationMenuItem>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()} data-testid="nav-home">
                          Strona główna
                        </NavigationMenuLink>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Przejdź do strony głównej</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NavigationMenuLink
                          href="/topics"
                          className={navigationMenuTriggerStyle()}
                          data-testid="nav-topics"
                        >
                          Fiszki
                        </NavigationMenuLink>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Przeglądaj i zarządzaj fiszkami</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NavigationMenuLink
                          href="/sessions"
                          className={navigationMenuTriggerStyle()}
                          data-testid="nav-sessions"
                        >
                          Sesje nauki
                        </NavigationMenuLink>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rozpocznij sesję nauki z fiszkami</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NavigationMenuLink
                          href="/statistics"
                          className={navigationMenuTriggerStyle()}
                          data-testid="nav-statistics"
                        >
                          Statystyki
                        </NavigationMenuLink>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Zobacz swoje postępy w nauce</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="text-sm text-muted-foreground" data-testid="auth-loading">
                Ładowanie...
              </div>
            ) : user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none" data-testid="user-menu-trigger">
                    <UserAvatar showName={true} className="cursor-pointer hover:opacity-80 transition-opacity" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <a href="/profile" className="cursor-pointer" data-testid="nav-profile">
                        Profil
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/change-password" className="cursor-pointer" data-testid="nav-change-password">
                        Zmień hasło
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsLogoutDialogOpen(true)}
                      className="cursor-pointer"
                      data-testid="nav-logout"
                    >
                      Wyloguj
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <LogoutDialog
                  isOpen={isLogoutDialogOpen}
                  onClose={() => setIsLogoutDialogOpen(false)}
                  onConfirm={handleLogout}
                />
              </>
            ) : (
              <a href="/login" className="text-sm font-medium hover:underline" data-testid="nav-login">
                Zaloguj się
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
