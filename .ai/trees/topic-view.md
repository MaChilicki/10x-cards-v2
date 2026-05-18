# Drzewo komponentów dla strony widoku tematu

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
    └── src/pages/topics/[id].astro
```

## src/pages/topics/[id].astro
```
src/pages/topics/[id].astro
├── Layout.astro (dziedziczone z poprzedniego przykładu)
│   ├── <head> ... </head>
│   └── <body>
│       ├── MainNav.tsx (React component)
│       │   ├── header
│       │   │   └── div (container)
│       │   │       └── div (flex container)
│       │   │           ├── div (logo + nav)
│       │   │           │   ├── a (logo link)
│       │   │           │   │   ├── img (logo)
│       │   │           │   │   └── span (app name)
│       │   │           │   └── NavigationMenu
│       │   │           │       └── NavigationMenuList
│       │   │           │           ├── NavigationMenuItem
│       │   │           │           │   └── TooltipProvider -> Tooltip -> TooltipTrigger -> NavigationMenuLink (Strona główna)
│       │   │           │           │       └── TooltipContent (Przejdź do strony głównej)
│       │   │           │           ├── NavigationMenuItem
│       │   │           │           │   └── TooltipProvider -> Tooltip -> TooltipTrigger -> NavigationMenuLink (Fiszki)
│       │   │           │           │       └── TooltipContent (Przeglądaj i zarządzaj fiszkami)
│       │   │           │           ├── NavigationMenuItem
│       │   │           │           │   └── TooltipProvider -> Tooltip -> TooltipTrigger -> NavigationMenuLink (Sesje nauki)
│       │   │           │           │       └── TooltipContent (Rozpocznij sesję nauki z fiszkami)
│       │   │           │           └── NavigationMenuItem
│       │   │           │               └── TooltipProvider -> Tooltip -> TooltipTrigger -> NavigationMenuLink (Statystyki)
│       │   │           │                   └── TooltipContent (Zobacz swoje postępy w nauce)
│       │   │           └── div (user menu)
│       │   │               ├── (Warunkowy) div (loading)
│       │   │               ├── (Warunkowy, gdy zalogowany) DropdownMenu
│       │   │               │   ├── DropdownMenuTrigger
│       │   │               │   │   └── UserAvatar (avatar użytkownika)
│       │   │               │   └── DropdownMenuContent
│       │   │               │       ├── DropdownMenuItem -> a (Profil)
│       │   │               │       ├── DropdownMenuItem -> a (Zmień hasło)
│       │   │               │       ├── DropdownMenuSeparator
│       │   │               │       └── DropdownMenuItem (Wyloguj)
│       │   │               ├── (Warunkowy, gdy zalogowany) LogoutDialog (dialog wylogowania)
│       │   │               └── (Warunkowy, gdy niezalogowany) a (Zaloguj się)
│       │   │
│       ├── <main>
│       │   └── <slot> (zawartość strony src/pages/topics/[id].astro)
│       │       └── TopicDetailView.tsx (React component)
│       │           ├── (Warunkowo - błąd tematu) div (error container)
│       │           │   ├── ErrorAlert
│       │           │   └── Button (Spróbuj ponownie)
│       │           │
│       │           ├── (Warunkowo - ładowanie tematu) div (loading container)
│       │           │   └── LoadingSpinner
│       │           │
│       │           ├── (Warunkowo - brak tematu) ErrorAlert
│       │           │
│       │           ├── (Warunkowo - błąd dokumentów) div (error container)
│       │           │   ├── ErrorAlert
│       │           │   └── Button (Spróbuj ponownie)
│       │           │
│       │           ├── (Warunkowo - ładowanie dokumentów) div (loading container)
│       │           │   └── LoadingSpinner
│       │           │
│       │           └── (Główny widok) div (container)
│       │               ├── TopicHeader
│       │               │   ├── header
│       │               │   │   ├── div (back button + breadcrumbs)
│       │               │   │   │   ├── Button (powrót)
│       │               │   │   │   │   └── ChevronLeft
│       │               │   │   │   └── Breadcrumb
│       │               │   │   │       └── BreadcrumbList
│       │               │   │   │           ├── BreadcrumbItem -> BreadcrumbLink (Tematy)
│       │               │   │   │           ├── BreadcrumbSeparator
│       │               │   │   │           ├── (map) BreadcrumbItem -> BreadcrumbLink (breadcrumbs)
│       │               │   │   │           └── BreadcrumbItem -> BreadcrumbPage (current topic)
│       │               │   │   └── div (topic info)
│       │               │   │       ├── h1 (topic name)
│       │               │   │       ├── p (topic description)
│       │               │   │       └── div (statystyki)
│       │               │   │           ├── span (liczba dokumentów)
│       │               │   │           ├── span (separator)
│       │               │   │           └── span (liczba fiszek)
│       │               │
│       │               ├── (Warunkowo - brak dokumentów) EmptyState
│       │               │   └── div (empty state container)
│       │               │       ├── div (icon container)
│       │               │       │   └── FileText (icon)
│       │               │       ├── h3 (tytuł)
│       │               │       ├── p (opis)
│       │               │       └── Button (dodaj dokument)
│       │               │           └── Plus (icon)
│       │               │
│       │               ├── (Warunkowo - są dokumenty) div (document list container)
│       │               │   └── DocumentList
│       │               │       ├── div (sorter + add button)
│       │               │       │   ├── DocumentsSorter
│       │               │       │   │   ├── Select (Sortuj według)
│       │               │       │   │   │   ├── SelectTrigger -> SelectValue
│       │               │       │   │   │   └── SelectContent
│       │               │       │   │   │       ├── SelectGroup (Treść)
│       │               │       │   │   │       │   └── SelectItem (Nazwa dokumentu)
│       │               │       │   │   │       └── SelectGroup (Metadane)
│       │               │       │   │   │           ├── SelectItem (Data utworzenia)
│       │               │       │   │   │           └── SelectItem (Data modyfikacji)
│       │               │       │   │   ├── Select (Kolejność)
│       │               │       │   │   │   ├── SelectTrigger -> SelectValue
│       │               │       │   │   │   └── SelectContent
│       │               │       │   │   │       ├── SelectItem (Rosnąco)
│       │               │       │   │   │       └── SelectItem (Malejąco)
│       │               │       │   │   └── div (items per page)
│       │               │       │   │       ├── span
│       │               │       │   │       └── Select (liczba na stronie)
│       │               │       │   │           ├── SelectTrigger -> SelectValue
│       │               │       │   │           └── SelectContent (map options)
│       │               │       │   └── Button (Dodaj dokument)
│       │               │       │       └── Plus (icon)
│       │               │       │
│       │               │       ├── div (grid)
│       │               │       │   └── (map) DocumentCard
│       │               │       │       └── Card
│       │               │       │           ├── CardHeader
│       │               │       │           │   ├── div (buttons)
│       │               │       │           │   │   ├── TooltipProvider -> Tooltip -> TooltipTrigger -> Button (Edit)
│       │               │       │           │   │   │   └── Edit (icon)
│       │               │       │           │   │   └── TooltipProvider -> Tooltip -> TooltipTrigger -> Button (Delete)
│       │               │       │           │   │       └── Trash2 (icon)
│       │               │       │           │   ├── CardTitle (document name)
│       │               │       │           │   └── CardDescription
│       │               │       │           └── CardContent
│       │               │       │               └── div (details)
│       │               │       │                   ├── div (flashcards)
│       │               │       │                   │   ├── (Warunkowo) TooltipProvider -> Badge (AI fiszki)
│       │               │       │                   │   ├── (Warunkowo) TooltipProvider -> Badge (Własne fiszki)
│       │               │       │                   │   └── (Warunkowo) TooltipProvider -> Badge (Do zatwierdzenia)
│       │               │       │                   ├── div (created at)
│       │               │       │                   └── div (updated at)
│       │               │       │
│       │               │       └── (Warunkowo - paginacja) div (pagination container)
│       │               │           └── div (pagination controls)
│       │               │               ├── Button (Poprzednia)
│       │               │               ├── span (page info)
│       │               │               └── Button (Następna)
│       │               │
│       │               └── ConfirmDeleteModal
│       │                   └── AlertDialog
│       │                       └── AlertDialogContent
│       │                           ├── AlertDialogHeader
│       │                           │   ├── AlertDialogTitle
│       │                           │   └── AlertDialogDescription
│       │                           ├── (Warunkowo) div -> ErrorAlert
│       │                           └── AlertDialogFooter
│       │                               ├── AlertDialogCancel
│       │                               └── AlertDialogAction
│       │                                   └── (Warunkowo) LoadingSpinner
│       │
│       ├── Footer.tsx (React component) ... </Footer.tsx>
│       └── Toaster.tsx (React component) ... </Toaster.tsx>
``` 