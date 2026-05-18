-- Migracja: Zastąpienie flag boolean polem source typu enum
-- Opis: Zastępuje pola is_ai_generated i is_manually_created jednym polem source
-- Data: 2024-05-13

-- Tworzenie typu enum dla źródła fiszki
create type flashcard_source as enum ('ai', 'manual');

-- Komentarz do typu enum
comment on type flashcard_source is 'Typ źródła fiszki: ai - wygenerowana przez AI, manual - utworzona ręcznie';

-- Dodanie kolumny source z domyślną wartością 'manual'
alter table public.flashcards add column source flashcard_source not null default 'manual';

-- Aktualizacja wartości w kolumnie source na podstawie istniejących wartości flag
update public.flashcards set source = 'ai' where is_ai_generated = true;
update public.flashcards set source = 'manual' where is_manually_created = true;

-- Usunięcie starych kolumn
alter table public.flashcards drop column is_ai_generated;
alter table public.flashcards drop column is_manually_created;

-- Dodanie komentarza do kolumny
comment on column public.flashcards.source is 'Źródło pochodzenia fiszki (AI lub ręcznie utworzona)'; 