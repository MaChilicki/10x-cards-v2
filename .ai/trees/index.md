# Drzewo komponentów strony głównej aplikacji 10xCards

## Proces renderowania strony z middleware

```
Żądanie HTTP
├── middleware/index.ts (Astro middleware)
│   ├── Sprawdzenie parametrów weryfikacyjnych URL
│   │   └── (Warunkowo) Przekierowanie do /verify-email
│   ├── Sprawdzenie czy ścieżka jest publiczna (PUBLIC_PATHS)
│   │   └── (Warunkowo) Pominięcie sprawdzania autoryzacji
│   ├── Inicjalizacja Supabase
│   ├── Uwierzytelnienie i autoryzacja
│   │   ├── Pobranie danych użytkownika (supabase.auth.getUser())
│   │   └── (Warunkowo) Przekierowanie do /login jeśli brak autoryzacji
│   └── Dodanie danych do kontekstu (locals)
│       ├── locals.user (dane użytkownika)
│       ├── locals.supabase (instancja klienta)
│       ├── locals.supabaseUrl (URL do API)
│       └── locals.supabaseAnonKey (klucz publiczny)
└── Renderowanie strony
    └── index.astro (lub inna żądana strona)
```

## index.astro
```
index.astro
├── Layout.astro
│   ├── <head>
│   │   └── <script> (session check)
│   ├── <body>
│   │   ├── MainNav.tsx (React component)
│   │   │   ├── header
│   │   │   │   └── div (container)
│   │   │   │       └── div (flex container)
│   │   │   │           ├── div (logo + nav)
│   │   │   │           │   ├── a (logo link)
│   │   │   │           │   │   ├── img (logo)
│   │   │   │           │   │   └── span (app name)
│   │   │   │           │   └── NavigationMenu
│   │   │   │           │       └── NavigationMenuList
│   │   │   │           │           ├── NavigationMenuItem
│   │   │   │           │           │   └── TooltipProvider -> Tooltip -> TooltipTrigger -> NavigationMenuLink (Strona główna)
│   │   │   │           │           │       └── TooltipContent (Przejdź do strony głównej)
│   │   │   │           │           ├── NavigationMenuItem
│   │   │   │           │           │   └── TooltipProvider -> Tooltip -> TooltipTrigger -> NavigationMenuLink (Fiszki)
│   │   │   │           │           │       └── TooltipContent (Przeglądaj i zarządzaj fiszkami)
│   │   │   │           │           ├── NavigationMenuItem
│   │   │   │           │           │   └── TooltipProvider -> Tooltip -> TooltipTrigger -> NavigationMenuLink (Sesje nauki)
│   │   │   │           │           │       └── TooltipContent (Rozpocznij sesję nauki z fiszkami)
│   │   │   │           │           └── NavigationMenuItem
│   │   │   │           │               └── TooltipProvider -> Tooltip -> TooltipTrigger -> NavigationMenuLink (Statystyki)
│   │   │   │           │                   └── TooltipContent (Zobacz swoje postępy w nauce)
│   │   │   │           └── div (user menu)
│   │   │   │               ├── (Warunkowy) div (loading)
│   │   │   │               ├── (Warunkowy, gdy zalogowany) DropdownMenu
│   │   │   │               │   ├── DropdownMenuTrigger
│   │   │   │               │   │   └── UserAvatar (avatar użytkownika)
│   │   │   │               │   │       ├── Avatar
│   │   │   │               │   │       │   ├── AvatarImage
│   │   │   │               │   │       │   └── AvatarFallback
│   │   │   │               │   └── DropdownMenuContent
│   │   │   │               │       ├── DropdownMenuItem -> a (Profil)
│   │   │   │               │       ├── DropdownMenuItem -> a (Zmień hasło)
│   │   │   │               │       ├── DropdownMenuSeparator
│   │   │   │               │       └── DropdownMenuItem (Wyloguj)
│   │   │   │               ├── (Warunkowy, gdy zalogowany) LogoutDialog (dialog wylogowania)
│   │   │   │               │   └── Dialog
│   │   │   │               │       └── DialogContent
│   │   │   │               │           ├── DialogHeader
│   │   │   │               │           │   ├── DialogTitle
│   │   │   │               │           │   └── DialogDescription
│   │   │   │               │           └── DialogFooter
│   │   │   │               │               ├── Button (Anuluj)
│   │   │   │               │               └── Button (Wyloguj)
│   │   │   │               └── (Warunkowy, gdy niezalogowany) a (Zaloguj się)
│   │   │   │
│   │   ├── <main>
│   │   │   └── <slot> (zawartość strony index.astro)
│   │   │       └── div (content container)
│   │   │           └── div (centered content)
│   │   │               ├── img (logo)
│   │   │               ├── h1 (tytuł)
│   │   │               └── p (treść)
│   │   │
│   │   ├── Footer.tsx (React component)
│   │   │   └── footer
│   │   │       └── div (container)
│   │   │           └── div
│   │   │               ├── img (logo)
│   │   │               └── span (tekst)
│   │   │
│   │   └── Toaster.tsx (React component)
│   │       └── Sonner component
│   │
│   └── <style>
``` 