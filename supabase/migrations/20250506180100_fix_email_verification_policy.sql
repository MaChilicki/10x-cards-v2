-- -----------------------------------------------------------------------
-- migration name: fix email verification policy
-- created date: 2024-04-14
-- author: system
-- description: poprawia politykę weryfikacji emaila, aby używała email_verified z metadanych
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
--   - zmienia sposób sprawdzania weryfikacji emaila z email_confirmed_at na email_verified
--   - usuwa stare polityki i tworzy nowe
-- -----------------------------------------------------------------------

-- usunięcie starych polityk
drop policy if exists "wymagaj weryfikacji emaila dla topics" on topics;
drop policy if exists "wymagaj weryfikacji emaila dla documents" on documents;
drop policy if exists "wymagaj weryfikacji emaila dla flashcards" on flashcards;
drop policy if exists "wymagaj weryfikacji emaila dla study_sessions" on study_sessions;
drop policy if exists "wymagaj weryfikacji emaila dla study_session_results" on study_session_results;
drop policy if exists "wymagaj weryfikacji emaila dla user_statistics" on user_statistics;

-- nowe polityki używające email_verified z metadanych
create policy "wymagaj weryfikacji emaila dla topics" 
    on topics for all using (
        auth.uid() = user_id 
        and (auth.jwt()->>'email_verified')::boolean = true
    );

create policy "wymagaj weryfikacji emaila dla documents" 
    on documents for all using (
        auth.uid() = user_id 
        and (auth.jwt()->>'email_verified')::boolean = true
    );

create policy "wymagaj weryfikacji emaila dla flashcards" 
    on flashcards for all using (
        auth.uid() = user_id 
        and (auth.jwt()->>'email_verified')::boolean = true
    );

create policy "wymagaj weryfikacji emaila dla study_sessions" 
    on study_sessions for all using (
        auth.uid() = user_id 
        and (auth.jwt()->>'email_verified')::boolean = true
    );

create policy "wymagaj weryfikacji emaila dla study_session_results" 
    on study_session_results for all using (
        exists (
            select 1 from study_sessions 
            where study_sessions.id = session_id 
            and study_sessions.user_id = auth.uid()
            and (auth.jwt()->>'email_verified')::boolean = true
        )
    );

create policy "wymagaj weryfikacji emaila dla user_statistics" 
    on user_statistics for all using (
        auth.uid() = user_id 
        and (auth.jwt()->>'email_verified')::boolean = true
    ); 