-- Migracja: Wyłączenie wszystkich polityk
-- Opis: Wyłącza wszystkie wcześniej zdefiniowane polityki RLS
-- Data: 2024-03-27

-- Wyłączenie polityk dla topics
drop policy if exists "Użytkownicy mogą widzieć tylko swoje tematy" on topics;
drop policy if exists "Użytkownicy mogą tworzyć tylko swoje tematy" on topics;
drop policy if exists "Użytkownicy mogą aktualizować tylko swoje tematy" on topics;
drop policy if exists "Użytkownicy mogą usuwać tylko swoje tematy" on topics;

-- Wyłączenie polityk dla documents
drop policy if exists "Użytkownicy mogą widzieć tylko swoje dokumenty" on documents;
drop policy if exists "Użytkownicy mogą tworzyć tylko swoje dokumenty" on documents;
drop policy if exists "Użytkownicy mogą aktualizować tylko swoje dokumenty" on documents;
drop policy if exists "Użytkownicy mogą usuwać tylko swoje dokumenty" on documents;

-- Wyłączenie polityk dla document_topics
drop policy if exists "Użytkownicy mogą zarządzać powiązaniami dokumentów z tematami" on document_topics;

-- Wyłączenie polityk dla flashcards
drop policy if exists "Użytkownicy mogą widzieć tylko swoje fiszki" on flashcards;
drop policy if exists "Użytkownicy mogą tworzyć tylko swoje fiszki" on flashcards;
drop policy if exists "Użytkownicy mogą aktualizować tylko swoje fiszki" on flashcards;
drop policy if exists "Użytkownicy mogą usuwać tylko swoje fiszki" on flashcards;

-- Wyłączenie polityk dla study_sessions
drop policy if exists "Użytkownicy mogą widzieć tylko swoje sesje nauki" on study_sessions;
drop policy if exists "Użytkownicy mogą tworzyć tylko swoje sesje nauki" on study_sessions;
drop policy if exists "Użytkownicy mogą aktualizować tylko swoje sesje nauki" on study_sessions;
drop policy if exists "Użytkownicy mogą usuwać tylko swoje sesje nauki" on study_sessions;

-- Wyłączenie polityk dla study_session_results
drop policy if exists "Użytkownicy mogą widzieć tylko wyniki swoich sesji" on study_session_results;
drop policy if exists "Użytkownicy mogą dodawać tylko wyniki swoich sesji" on study_session_results;
drop policy if exists "Użytkownicy mogą aktualizować tylko wyniki swoich sesji" on study_session_results;
drop policy if exists "Użytkownicy mogą usuwać tylko wyniki swoich sesji" on study_session_results;

-- Wyłączenie polityk dla user_statistics
drop policy if exists "Użytkownicy mogą widzieć tylko swoje statystyki" on user_statistics;
drop policy if exists "Użytkownicy mogą tworzyć tylko swoje statystyki" on user_statistics;
drop policy if exists "Użytkownicy mogą aktualizować tylko swoje statystyki" on user_statistics; 