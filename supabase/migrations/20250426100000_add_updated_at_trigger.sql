-- -----------------------------------------------------------------------
-- migration name: add updated_at trigger
-- created date: 2025-04-20
-- author: system
-- description: add triggers to automatically update the updated_at column
--              for each record update in tables
-- 
-- affected tables:
--   - flashcards
--   - documents
--   - topics
--   - user_statistics
--
-- notes:
--   - this trigger replaces the default Supabase behavior that should
--     automatically update the updated_at column, but for some reason
--     is not working properly
-- -----------------------------------------------------------------------

-- function to update the updated_at column to the current timestamp
create or replace function update_timestamp_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- trigger for flashcards table
drop trigger if exists update_flashcards_timestamp on flashcards;
create trigger update_flashcards_timestamp
before update on flashcards
for each row execute function update_timestamp_column();

-- trigger for documents table
drop trigger if exists update_documents_timestamp on documents;
create trigger update_documents_timestamp
before update on documents
for each row execute function update_timestamp_column();

-- trigger for topics table
drop trigger if exists update_topics_timestamp on topics;
create trigger update_topics_timestamp
before update on topics
for each row execute function update_timestamp_column();

-- trigger for user_statistics table (just in case)
drop trigger if exists update_user_statistics_timestamp on user_statistics;
create trigger update_user_statistics_timestamp
before update on user_statistics
for each row execute function update_timestamp_column();

-- add comment to the function
comment on function update_timestamp_column() is 'Automatically updates the updated_at column on each record modification'; 