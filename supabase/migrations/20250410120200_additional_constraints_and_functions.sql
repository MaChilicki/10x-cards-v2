-- Migracja: Dodatkowe ograniczenia i funkcje pomocnicze
-- Opis: Dodaje dodatkowe ograniczenia walidacji, indeksy i funkcje pomocnicze
-- Data: 2024-03-27

-- Dodatkowe ograniczenia dla study_session_results
alter table study_session_results
    add constraint check_response_time
    check (response_time >= 0);

-- Dodatkowe ograniczenia dla study_sessions
alter table study_sessions
    add constraint check_cards_reviewed
    check (cards_reviewed >= 0);

-- Dodatkowe ograniczenia dla user_statistics
alter table user_statistics
    add constraint check_total_cards_created
    check (total_cards_created >= 0),
    add constraint check_total_cards_studied
    check (total_cards_studied >= 0),
    add constraint check_correct_answers
    check (correct_answers >= 0),
    add constraint check_incorrect_answers
    check (incorrect_answers >= 0),
    add constraint check_study_streak_days
    check (study_streak_days >= 0),
    add constraint check_average_response_time
    check (average_response_time >= 0);

-- Dodatkowe indeksy dla wyszukiwania
create index idx_topics_name on topics(name);
create index idx_documents_name on documents(name);
create index idx_topics_created_at on topics(created_at);
create index idx_documents_created_at on documents(created_at);
create index idx_flashcards_created_at on flashcards(created_at);
create index idx_study_sessions_created_at on study_sessions(created_at);

-- Funkcja do obliczania aktualnego streaka użytkownika
create or replace function get_current_streak(p_user_id uuid)
returns integer as $$
declare
    v_streak integer;
    v_last_study_date date;
begin
    select last_study_date, study_streak_days
    into v_last_study_date, v_streak
    from user_statistics
    where user_id = p_user_id;

    if v_last_study_date is null then
        return 0;
    end if;

    if v_last_study_date < current_date - interval '1 day' then
        return 0;
    end if;

    return v_streak;
end;
$$ language plpgsql;

-- Funkcja do obliczania statystyk dla konkretnego tematu
create or replace function get_topic_statistics(p_topic_id uuid)
returns table (
    total_flashcards bigint,
    total_study_sessions bigint,
    total_correct_answers bigint,
    total_incorrect_answers bigint,
    average_response_time numeric,
    last_studied_at timestamptz
) as $$
begin
    return query
    select
        count(distinct f.id) as total_flashcards,
        count(distinct ss.id) as total_study_sessions,
        count(case when ssr.is_correct then 1 end) as total_correct_answers,
        count(case when not ssr.is_correct then 1 end) as total_incorrect_answers,
        avg(ssr.response_time)::numeric as average_response_time,
        max(ss.created_at) as last_studied_at
    from topics t
    left join flashcards f on f.topic_id = t.id
    left join study_session_results ssr on ssr.flashcard_id = f.id
    left join study_sessions ss on ss.id = ssr.session_id
    where t.id = p_topic_id
    group by t.id;
end;
$$ language plpgsql;

-- Indeks dla optymalizacji zapytań o statystyki tematu
create index idx_flashcards_topic_id_created_at 
    on flashcards(topic_id, created_at);

-- Funkcja do czyszczenia starych sesji nauki
create or replace function cleanup_old_study_sessions(p_days_old integer)
returns void as $$
begin
    delete from study_sessions
    where created_at < current_date - (p_days_old || ' days')::interval
    and end_time is not null;
end;
$$ language plpgsql; 