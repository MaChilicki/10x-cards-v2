-- Migracja: Wyłączenie RLS dla tabeli documents
-- Opis: Wyłącza Row Level Security dla tabeli documents na etapie developmentu
-- Data: 2024-03-27

alter table documents disable row level security; 