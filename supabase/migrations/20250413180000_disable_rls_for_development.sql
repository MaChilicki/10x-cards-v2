-- Migracja: Tymczasowe wyłączenie RLS dla developmentu
-- Opis: Wyłącza Row Level Security (RLS) dla wszystkich tabel w schemacie public
-- Data: 2024-04-13
-- UWAGA: Ta migracja jest przeznaczona TYLKO dla środowiska developerskiego!

-- Wyłączenie RLS dla wszystkich tabel w schemacie public
alter table public.topics disable row level security;
alter table public.documents disable row level security;
alter table public.document_topics disable row level security;
alter table public.flashcards disable row level security;
alter table public.study_sessions disable row level security;
alter table public.study_session_results disable row level security;
alter table public.user_statistics disable row level security;

comment on table public.topics is 'UWAGA: RLS wyłączone na czas developmentu';
comment on table public.documents is 'UWAGA: RLS wyłączone na czas developmentu';
comment on table public.document_topics is 'UWAGA: RLS wyłączone na czas developmentu';
comment on table public.flashcards is 'UWAGA: RLS wyłączone na czas developmentu';
comment on table public.study_sessions is 'UWAGA: RLS wyłączone na czas developmentu';
comment on table public.study_session_results is 'UWAGA: RLS wyłączone na czas developmentu';
comment on table public.user_statistics is 'UWAGA: RLS wyłączone na czas developmentu'; 