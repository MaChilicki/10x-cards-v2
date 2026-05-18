# Drzewo komponentów dla strony listy tematów

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
    └── src/pages/topics/index.astro
```

## src/pages/topics/index.astro
```
src/pages/topics/index.astro
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
│       │   └── <slot> (zawartość strony src/pages/topics/index.astro)
│       │       └── TopicsListView.tsx (React component)
│       │           ├── (Warunkowo) LoadingSpinner.tsx
│       │           │   └── (Warunkowo) Card
│       │           │       └── div (spinner + message)
│       │           │           └── Loader2 (lucide-react)
│       │           ├── (Warunkowo) ErrorAlert.tsx
│       │           │   └── Alert (variant="destructive")
│       │           │       ├── AlertTriangle (lucide-react)
│       │           │       ├── AlertTitle
│       │           │       └── AlertDescription
│       │           ├── div (container)
│       │           │   ├── div (header: Tytuł "Tematy")
│       │           │   ├── div (controls: Sorter + Button)
│       │           │   │   ├── TopicsSorter.tsx
│       │           │   │   │   ├── Select (Sortuj według)
│       │           │   │   │   │   ├── SelectTrigger
│       │           │   │   │   │   │   └── SelectValue
│       │           │   │   │   │   └── SelectContent
│       │           │   │   │   │       ├── SelectGroup (Treść)
│       │           │   │   │   │       │   └── SelectItem (Nazwa tematu)
│       │           │   │   │   │       └── SelectGroup (Metadane)
│       │           │   │   │   │           ├── SelectItem (Data utworzenia)
│       │           │   │   │   │           └── SelectItem (Data modyfikacji)
│       │           │   │   │   ├── Select (Kolejność)
│       │           │   │   │   │   ├── SelectTrigger
│       │           │   │   │   │   │   └── SelectValue
│       │           │   │   │   │   └── SelectContent
│       │           │   │   │   │       ├── SelectItem (Rosnąco)
│       │           │   │   │   │       └── SelectItem (Malejąco)
│       │           │   │   │   └── div (Items per page)
│       │           │   │   │       ├── span
│       │           │   │   │       └── Select (Pokaż na stronie)
│       │           │   │   │           ├── SelectTrigger
│       │           │   │   │           │   └── SelectValue
│       │           │   │   │           └── SelectContent
│       │           │   │   │               └── SelectItem (mapowane opcje)
│       │           │   │   └── Button (Dodaj temat)
│       │           │   ├── TopicsList.tsx
│       │           │   │   └── div (grid)
│       │           │   │       └── (map) TopicCard.tsx
│       │           │   │           └── Card
│       │           │   │               ├── CardHeader
│       │           │   │               │   ├── div (przyciski Edytuj/Usuń)
│       │           │   │               │   │   ├── TooltipProvider -> Tooltip -> TooltipTrigger -> Button (Edit)
│       │           │   │               │   │   │   └── Edit (lucide-react)
│       │           │   │               │   │   └── TooltipProvider -> Tooltip -> TooltipTrigger -> Button (Trash2)
│       │           │   │               │   │       └── Trash2 (lucide-react)
│       │           │   │               │   ├── CardTitle
│       │           │   │               │   │   └── FolderClosed (lucide-react)
│       │           │   │               │   └── div (description)
│       │           │   │               └── CardContent
│       │           │   │                   └── div (details)
│       │           │   │                       ├── Badge (Dokumenty)
│       │           │   │                       ├── Badge (Fiszki)
│       │           │   │                       ├── div (Utworzono)
│       │           │   │                       └── div (Zaktualizowano)
│       │           │   ├── (Warunkowo) div (pagination container)
│       │           │   │   └── Pagination.tsx
│       │           │   │       └── nav
│       │           │   │           └── PaginationContent
│       │           │   │               ├── (Warunkowo) PaginationItem -> PaginationPrevious
│       │           │   │               │   └── ChevronLeftIcon
│       │           │   │               ├── (map) PaginationItem -> PaginationLink
│       │           │   │               ├── (Warunkowo) PaginationItem -> PaginationEllipsis
│       │           │   │               │   └── MoreHorizontalIcon
│       │           │   │               └── (Warunkowo) PaginationItem -> PaginationNext
│       │           │   │                   └── ChevronRightIcon
│       │           │   ├── TopicFormModal.tsx
│       │           │   │   └── Dialog
│       │           │   │       └── DialogContent
│       │           │   │           └── form
│       │           │   │               ├── DialogHeader
│       │           │   │               │   ├── DialogTitle
│       │           │   │               │   └── DialogDescription
│       │           │   │               ├── div (inputs)
│       │           │   │               │   ├── Input (Nazwa tematu)
│       │           │   │               │   └── Textarea (Opis tematu)
│       │           │   │               ├── (Warunkowo) p (error general)
│       │           │   │               └── DialogFooter
│       │           │   │                   ├── Button (Anuluj)
│       │           │   │                   └── Button (Zapisz/Utwórz)
│       │           │   └── DeleteTopicDialog.tsx
│       │           │       └── Dialog
│       │           │           └── DialogContent
│       │           │               ├── DialogHeader
│       │           │               │   ├── AlertCircle (lucide-react)
│       │           │               │   ├── DialogTitle
│       │           │               │   └── DialogDescription
│       │           │               ├── (Warunkowo) Alert (contentWarning)
│       │           │               │   ├── AlertCircle (lucide-react)
│       │           │               │   └── AlertDescription
│       │           │               ├── (Warunkowo) Alert (errorAlert)
│       │           │               │   ├── AlertCircle (lucide-react)
│       │           │               │   └── AlertDescription
│       │           │               └── DialogFooter
│       │           │                   ├── Button (Anuluj)
│       │           │                   └── Button (Usuń temat)
│       ├── Footer.tsx (React component) ... </Footer.tsx>
│       └── Toaster.tsx (React component) ... </Toaster.tsx>
``` 