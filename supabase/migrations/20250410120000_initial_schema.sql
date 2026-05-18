-- Migracja: Inicjalizacja schematu bazy danych dla 10xCards
-- Opis: Tworzy podstawową strukturę tabel, relacji, indeksów i polityk bezpieczeństwa
-- Data: 2024-03-27

-- Włączenie niezbędnych rozszerzeń
create extension if not exists "uuid-ossp";

-- Tabela topics (hierarchiczna struktura tematów)
create table topics (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    description text,
    parent_id uuid references topics(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint unique_name_per_user_parent unique (user_id, parent_id, name)
);

-- Włączenie RLS dla topics
alter table topics enable row level security;

-- Polityki RLS dla topics
create policy "Użytkownicy mogą widzieć tylko swoje tematy" 
    on topics for select using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć tylko swoje tematy" 
    on topics for insert with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować tylko swoje tematy" 
    on topics for update using (auth.uid() = user_id);

create policy "Użytkownicy mogą usuwać tylko swoje tematy" 
    on topics for delete using (auth.uid() = user_id);

-- Tabela documents (dokumenty źródłowe)
create table documents (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    content text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Włączenie RLS dla documents
alter table documents enable row level security;

-- Polityki RLS dla documents
create policy "Użytkownicy mogą widzieć tylko swoje dokumenty" 
    on documents for select using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć tylko swoje dokumenty" 
    on documents for insert with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować tylko swoje dokumenty" 
    on documents for update using (auth.uid() = user_id);

create policy "Użytkownicy mogą usuwać tylko swoje dokumenty" 
    on documents for delete using (auth.uid() = user_id);

-- Tabela document_topics (relacja wiele-do-wielu)
create table document_topics (
    document_id uuid not null references documents(id) on delete cascade,
    topic_id uuid not null references topics(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (document_id, topic_id)
);

-- Włączenie RLS dla document_topics
alter table document_topics enable row level security;

-- Polityki RLS dla document_topics
create policy "Użytkownicy mogą zarządzać powiązaniami dokumentów z tematami" 
    on document_topics for all using (
        exists (
            select 1 from documents 
            where documents.id = document_id 
            and documents.user_id = auth.uid()
        )
    );

-- Tabela flashcards (fiszki)
create table flashcards (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    document_id uuid references documents(id) on delete set null,
    topic_id uuid references topics(id) on delete set null,
    front_original text not null,
    back_original text not null,
    front_modified text,
    back_modified text,
    is_ai_generated boolean not null default false,
    is_manually_created boolean not null default false,
    is_modified boolean not null default false,
    modification_percentage smallint check (modification_percentage >= 0 and modification_percentage <= 100),
    is_disabled boolean not null default false,
    spaced_repetition_data jsonb default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Włączenie RLS dla flashcards
alter table flashcards enable row level security;

-- Polityki RLS dla flashcards
create policy "Użytkownicy mogą widzieć tylko swoje fiszki" 
    on flashcards for select using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć tylko swoje fiszki" 
    on flashcards for insert with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować tylko swoje fiszki" 
    on flashcards for update using (auth.uid() = user_id);

create policy "Użytkownicy mogą usuwać tylko swoje fiszki" 
    on flashcards for delete using (auth.uid() = user_id);

-- Tabela study_sessions (sesje nauki)
create table study_sessions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    topic_id uuid references topics(id) on delete set null,
    start_time timestamptz not null default now(),
    end_time timestamptz,
    cards_reviewed integer not null default 0,
    created_at timestamptz not null default now()
);

-- Włączenie RLS dla study_sessions
alter table study_sessions enable row level security;

-- Polityki RLS dla study_sessions
create policy "Użytkownicy mogą widzieć tylko swoje sesje nauki" 
    on study_sessions for select using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć tylko swoje sesje nauki" 
    on study_sessions for insert with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować tylko swoje sesje nauki" 
    on study_sessions for update using (auth.uid() = user_id);

-- Tabela study_session_results (wyniki nauki)
create table study_session_results (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid not null references study_sessions(id) on delete cascade,
    flashcard_id uuid not null references flashcards(id) on delete cascade,
    is_correct boolean not null,
    response_time integer not null,
    difficulty_rating smallint,
    scheduled_for timestamptz,
    created_at timestamptz not null default now()
);

-- Włączenie RLS dla study_session_results
alter table study_session_results enable row level security;

-- Polityki RLS dla study_session_results
create policy "Użytkownicy mogą widzieć tylko wyniki swoich sesji" 
    on study_session_results for select using (
        exists (
            select 1 from study_sessions 
            where study_sessions.id = session_id 
            and study_sessions.user_id = auth.uid()
        )
    );

create policy "Użytkownicy mogą dodawać tylko wyniki swoich sesji" 
    on study_session_results for insert with check (
        exists (
            select 1 from study_sessions 
            where study_sessions.id = session_id 
            and study_sessions.user_id = auth.uid()
        )
    );

-- Tabela user_statistics (statystyki użytkownika)
create table user_statistics (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    total_cards_created integer not null default 0,
    total_cards_studied integer not null default 0,
    correct_answers integer not null default 0,
    incorrect_answers integer not null default 0,
    average_response_time integer,
    study_streak_days integer not null default 0,
    last_study_date date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint unique_user_stats unique (user_id)
);

-- Włączenie RLS dla user_statistics
alter table user_statistics enable row level security;

-- Polityki RLS dla user_statistics
create policy "Użytkownicy mogą widzieć tylko swoje statystyki" 
    on user_statistics for select using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć tylko swoje statystyki" 
    on user_statistics for insert with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować tylko swoje statystyki" 
    on user_statistics for update using (auth.uid() = user_id);

-- Indeksy
create index idx_topics_user_id on topics(user_id);
create index idx_topics_parent_id on topics(parent_id);
create index idx_documents_user_id on documents(user_id);
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_document_id on flashcards(document_id);
create index idx_flashcards_topic_id on flashcards(topic_id);
create index idx_flashcards_is_disabled on flashcards(is_disabled);
create index idx_study_sessions_user_id on study_sessions(user_id);
create index idx_study_sessions_topic_id on study_sessions(topic_id);
create index idx_study_session_results_session_id on study_session_results(session_id);
create index idx_study_session_results_flashcard_id on study_session_results(flashcard_id);
create index idx_study_session_results_scheduled_for on study_session_results(scheduled_for);

-- Funkcje i wyzwalacze
create or replace function calculate_modification_percentage()
returns trigger as $$
begin
    if new.front_modified is not null or new.back_modified is not null then
        new.is_modified := true;
        
        if new.front_modified is not null and new.back_modified is not null then
            new.modification_percentage := 100;
        elsif new.front_modified is not null then
            new.modification_percentage := 50;
        elsif new.back_modified is not null then
            new.modification_percentage := 50;
        end if;
    else
        new.is_modified := false;
        new.modification_percentage := 0;
    end if;
    
    return new;
end;
$$ language plpgsql;

create trigger trigger_calculate_modification_percentage
    before insert or update on flashcards
    for each row execute function calculate_modification_percentage();

create or replace function update_user_statistics()
returns trigger as $$
begin
    update user_statistics
    set 
        total_cards_studied = total_cards_studied + 1,
        correct_answers = case when new.is_correct then correct_answers + 1 else correct_answers end,
        incorrect_answers = case when not new.is_correct then incorrect_answers + 1 else incorrect_answers end,
        average_response_time = (average_response_time * (total_cards_studied) + new.response_time) / (total_cards_studied + 1),
        last_study_date = current_date,
        study_streak_days = case 
            when last_study_date = current_date - interval '1 day' then study_streak_days + 1
            when last_study_date = current_date then study_streak_days
            else 1
        end,
        updated_at = now()
    where user_id = (
        select user_id from study_sessions where id = new.session_id
    );
    
    if not found then
        insert into user_statistics (
            user_id, 
            total_cards_studied, 
            correct_answers, 
            incorrect_answers, 
            average_response_time, 
            last_study_date, 
            study_streak_days
        )
        select 
            user_id,
            1,
            case when new.is_correct then 1 else 0 end,
            case when not new.is_correct then 1 else 0 end,
            new.response_time,
            current_date,
            1
        from study_sessions 
        where id = new.session_id;
    end if;
    
    return new;
end;
$$ language plpgsql;

create trigger trigger_update_user_statistics
    after insert on study_session_results
    for each row execute function update_user_statistics();

create or replace function update_cards_reviewed_count()
returns trigger as $$
begin
    update study_sessions
    set cards_reviewed = cards_reviewed + 1
    where id = new.session_id;
    
    return new;
end;
$$ language plpgsql;

create trigger trigger_update_cards_reviewed
    after insert on study_session_results
    for each row execute function update_cards_reviewed_count(); 