-- Migracja: Dodatkowe polityki i ograniczenia
-- Opis: Dodaje brakujące polityki RLS, ograniczenia i indeksy
-- Data: 2024-03-27

-- Dodatkowe polityki RLS dla study_sessions
create policy "Użytkownicy mogą usuwać tylko swoje sesje nauki" 
    on study_sessions for delete using (auth.uid() = user_id);

-- Dodatkowe polityki RLS dla study_session_results
create policy "Użytkownicy mogą aktualizować tylko wyniki swoich sesji" 
    on study_session_results for update using (
        exists (
            select 1 from study_sessions 
            where study_sessions.id = session_id 
            and study_sessions.user_id = auth.uid()
        )
    );

create policy "Użytkownicy mogą usuwać tylko wyniki swoich sesji" 
    on study_session_results for delete using (
        exists (
            select 1 from study_sessions 
            where study_sessions.id = session_id 
            and study_sessions.user_id = auth.uid()
        )
    );

-- Dodanie ograniczenia dla difficulty_rating
alter table study_session_results
    add constraint check_difficulty_rating 
    check (difficulty_rating >= 1 and difficulty_rating <= 5);

-- Dodanie indeksu dla last_study_date
create index idx_user_statistics_last_study_date 
    on user_statistics(last_study_date);

-- Funkcja i wyzwalacz do aktualizacji total_cards_created
create or replace function update_total_cards_created()
returns trigger as $$
begin
    -- Próba aktualizacji istniejącego rekordu
    update user_statistics
    set 
        total_cards_created = total_cards_created + 1,
        updated_at = now()
    where user_id = new.user_id;
    
    -- Jeśli rekord nie istnieje, tworzymy nowy
    if not found then
        insert into user_statistics (
            user_id,
            total_cards_created
        ) values (
            new.user_id,
            1
        );
    end if;
    
    return new;
end;
$$ language plpgsql;

create trigger trigger_update_total_cards_created
    after insert on flashcards
    for each row execute function update_total_cards_created(); 