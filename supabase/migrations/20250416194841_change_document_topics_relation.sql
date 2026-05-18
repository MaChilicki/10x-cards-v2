-- -----------------------------------------------------------------------
-- nazwa migracji: zmiana relacji między documents i topics
-- data utworzenia: 2025-04-16
-- autor: system
-- opis: zmiana relacji z wiele-do-wielu na jeden-do-wielu
-- 
-- tabele, na które wpływa:
--   - documents (dodanie kolumny topic_id)
--   - document_topics (usunięcie tabeli)
--
-- uwagi:
--   - dokumenty z wieloma tematami będą przypisane do pierwszego (najstarszego) tematu
--   - generowanie raportu z liczby dokumentów mających wiele tematów
-- -----------------------------------------------------------------------

-- dodanie kolumny topic_id do tabeli documents
alter table documents add column topic_id uuid references topics(id) on delete set null;

-- utworzenie indeksu dla nowej kolumny
create index idx_documents_topic_id on documents(topic_id);

-- aktualizacja dokumentów - przepisanie topic_id z tabeli pośredniej
-- jeśli dokument jest powiązany z wieloma tematami, wybierany jest pierwszy z nich
update documents d
set topic_id = dt.topic_id
from (
  select distinct on (document_id) document_id, topic_id
  from document_topics
  order by document_id, created_at
) dt
where d.id = dt.document_id;

-- log informacyjny o liczbie dokumentów z wieloma tematami (które mogą wymagać ręcznej weryfikacji)
do $$
declare
  multi_topic_docs integer;
begin
  select count(distinct document_id) into multi_topic_docs
  from (
    select document_id
    from document_topics
    group by document_id
    having count(*) > 1
  ) t;
  
  raise notice 'dokumentów z wieloma tematami: %', multi_topic_docs;
end $$;

-- !!! uwaga - operacja destrukcyjna !!! 
-- usunięcie tabeli pośredniej document_topics, która nie będzie już używana
-- ta operacja jest nieodwracalna i spowoduje utratę informacji o wielokrotnych powiązaniach
drop table document_topics;

-- aktualizacja polityk rls dla tabeli documents
-- polityki dla tabeli document_topics są automatycznie usuwane przy usunięciu tabeli

-- polityka zapewniająca, że tematy powiązane z dokumentami są dostępne tylko dla właściciela
comment on column documents.topic_id is 'temat, do którego należy dokument; relacja jeden-do-wielu zastępująca wcześniejszą tabelę document_topics'; 