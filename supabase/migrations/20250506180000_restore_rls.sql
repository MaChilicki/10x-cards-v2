-- -----------------------------------------------------------------------
-- migration name: restore rls
-- created date: 2024-04-14
-- author: system
-- description: przywraca row level security (rls) i polityki dla wszystkich tabel
-- 
-- affected tables:
--   - topics
--   - documents
--   - flashcards
--   - study_sessions
--   - study_session_results
--   - user_statistics
--
-- notes:
--   - przywraca rls dla wszystkich tabel
--   - przywraca polityki rls dla każdej tabeli
--   - dodaje polityki wymagające weryfikacji emaila
-- -----------------------------------------------------------------------

-- włączenie rls dla wszystkich tabel
alter table public.topics enable row level security;
alter table public.documents enable row level security;
alter table public.flashcards enable row level security;
alter table public.study_sessions enable row level security;
alter table public.study_session_results enable row level security;
alter table public.user_statistics enable row level security;

-- polityki dla topics
create policy "użytkownicy mogą widzieć tylko swoje tematy" 
    on topics for select using (auth.uid() = user_id);

create policy "użytkownicy mogą tworzyć tylko swoje tematy" 
    on topics for insert with check (auth.uid() = user_id);

create policy "użytkownicy mogą aktualizować tylko swoje tematy" 
    on topics for update using (auth.uid() = user_id);

create policy "użytkownicy mogą usuwać tylko swoje tematy" 
    on topics for delete using (auth.uid() = user_id);

-- polityki dla documents
create policy "użytkownicy mogą widzieć tylko swoje dokumenty" 
    on documents for select using (auth.uid() = user_id);

create policy "użytkownicy mogą tworzyć tylko swoje dokumenty" 
    on documents for insert with check (auth.uid() = user_id);

create policy "użytkownicy mogą aktualizować tylko swoje dokumenty" 
    on documents for update using (auth.uid() = user_id);

create policy "użytkownicy mogą usuwać tylko swoje dokumenty" 
    on documents for delete using (auth.uid() = user_id);

-- polityki dla flashcards
create policy "użytkownicy mogą widzieć tylko swoje fiszki" 
    on flashcards for select using (auth.uid() = user_id);

create policy "użytkownicy mogą tworzyć tylko swoje fiszki" 
    on flashcards for insert with check (auth.uid() = user_id);

create policy "użytkownicy mogą aktualizować tylko swoje fiszki" 
    on flashcards for update using (auth.uid() = user_id);

create policy "użytkownicy mogą usuwać tylko swoje fiszki" 
    on flashcards for delete using (auth.uid() = user_id);

-- polityki dla study_sessions
create policy "użytkownicy mogą widzieć tylko swoje sesje nauki" 
    on study_sessions for select using (auth.uid() = user_id);

create policy "użytkownicy mogą tworzyć tylko swoje sesje nauki" 
    on study_sessions for insert with check (auth.uid() = user_id);

create policy "użytkownicy mogą aktualizować tylko swoje sesje nauki" 
    on study_sessions for update using (auth.uid() = user_id);

create policy "użytkownicy mogą usuwać tylko swoje sesje nauki" 
    on study_sessions for delete using (auth.uid() = user_id);

-- polityki dla study_session_results
create policy "użytkownicy mogą widzieć tylko wyniki swoich sesji" 
    on study_session_results for select using (
        exists (
            select 1 from study_sessions 
            where study_sessions.id = session_id 
            and study_sessions.user_id = auth.uid()
        )
    );

create policy "użytkownicy mogą dodawać tylko wyniki swoich sesji" 
    on study_session_results for insert with check (
        exists (
            select 1 from study_sessions 
            where study_sessions.id = session_id 
            and study_sessions.user_id = auth.uid()
        )
    );

create policy "użytkownicy mogą aktualizować tylko wyniki swoich sesji" 
    on study_session_results for update using (
        exists (
            select 1 from study_sessions 
            where study_sessions.id = session_id 
            and study_sessions.user_id = auth.uid()
        )
    );

create policy "użytkownicy mogą usuwać tylko wyniki swoich sesji" 
    on study_session_results for delete using (
        exists (
            select 1 from study_sessions 
            where study_sessions.id = session_id 
            and study_sessions.user_id = auth.uid()
        )
    );

-- polityki dla user_statistics
create policy "użytkownicy mogą widzieć tylko swoje statystyki" 
    on user_statistics for select using (auth.uid() = user_id);

create policy "użytkownicy mogą tworzyć tylko swoje statystyki" 
    on user_statistics for insert with check (auth.uid() = user_id);

create policy "użytkownicy mogą aktualizować tylko swoje statystyki" 
    on user_statistics for update using (auth.uid() = user_id);

-- polityki wymagające weryfikacji emaila
create policy "wymagaj weryfikacji emaila dla topics" 
    on topics for all using (
        auth.uid() = user_id 
        and exists (
            select 1 from auth.users
            where auth.users.id = auth.uid()
            and auth.users.email_confirmed_at is not null
        )
    );

create policy "wymagaj weryfikacji emaila dla documents" 
    on documents for all using (
        auth.uid() = user_id 
        and exists (
            select 1 from auth.users
            where auth.users.id = auth.uid()
            and auth.users.email_confirmed_at is not null
        )
    );

create policy "wymagaj weryfikacji emaila dla flashcards" 
    on flashcards for all using (
        auth.uid() = user_id 
        and exists (
            select 1 from auth.users
            where auth.users.id = auth.uid()
            and auth.users.email_confirmed_at is not null
        )
    );

create policy "wymagaj weryfikacji emaila dla study_sessions" 
    on study_sessions for all using (
        auth.uid() = user_id 
        and exists (
            select 1 from auth.users
            where auth.users.id = auth.uid()
            and auth.users.email_confirmed_at is not null
        )
    );

create policy "wymagaj weryfikacji emaila dla study_session_results" 
    on study_session_results for all using (
        exists (
            select 1 from study_sessions 
            join auth.users on auth.users.id = auth.uid()
            where study_sessions.id = session_id 
            and study_sessions.user_id = auth.uid()
            and auth.users.email_confirmed_at is not null
        )
    );

create policy "wymagaj weryfikacji emaila dla user_statistics" 
    on user_statistics for all using (
        auth.uid() = user_id 
        and exists (
            select 1 from auth.users
            where auth.users.id = auth.uid()
            and auth.users.email_confirmed_at is not null
        )
    );

-- usunięcie komentarzy o wyłączonym rls
comment on table public.topics is null;
comment on table public.documents is null;
comment on table public.flashcards is null;
comment on table public.study_sessions is null;
comment on table public.study_session_results is null;
comment on table public.user_statistics is null; 