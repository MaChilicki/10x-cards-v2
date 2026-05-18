# Schemat Bazy Danych dla 10xCards

## 1. Tabele i Kolumny

### users
Zarządzana przez Supabase Auth
- `id` UUID PRIMARY KEY
- `email` TEXT NOT NULL UNIQUE
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### topics
Hierarchiczna struktura tematów
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `name` TEXT NOT NULL
- `description` TEXT
- `parent_id` UUID REFERENCES topics(id) ON DELETE SET NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- CONSTRAINT `unique_name_per_user_parent` UNIQUE (user_id, parent_id, name)

### documents
Dokumenty źródłowe do generowania fiszek
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `topic_id` UUID REFERENCES topics(id) ON DELETE SET NULL
- `name` TEXT NOT NULL
- `content` TEXT NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### flashcards
Fiszki (scalone z user_flashcards)
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `document_id` UUID REFERENCES documents(id) ON DELETE SET NULL
- `topic_id` UUID REFERENCES topics(id) ON DELETE SET NULL
- `front_original` TEXT NOT NULL
- `back_original` TEXT NOT NULL
- `front_modified` TEXT
- `back_modified` TEXT
- `source` flashcard_source NOT NULL -- Typ enuma: 'ai' | 'manual'
- `is_modified` BOOLEAN NOT NULL DEFAULT false
- `is_approved` BOOLEAN NOT NULL DEFAULT false
- `modification_percentage` SMALLINT CHECK (modification_percentage >= 0 AND modification_percentage <= 100)
- `is_disabled` BOOLEAN NOT NULL DEFAULT false
- `spaced_repetition_data` JSONB DEFAULT '{}'
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### study_sessions
Sesje nauki użytkownika
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `topic_id` UUID REFERENCES topics(id) ON DELETE SET NULL
- `start_time` TIMESTAMPTZ NOT NULL DEFAULT now()
- `end_time` TIMESTAMPTZ
- `cards_reviewed` INTEGER NOT NULL DEFAULT 0
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### study_session_results
Wyniki nauki dla poszczególnych fiszek
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `session_id` UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE
- `flashcard_id` UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE
- `is_correct` BOOLEAN NOT NULL
- `response_time` INTEGER NOT NULL
- `difficulty_rating` SMALLINT
- `scheduled_for` TIMESTAMPTZ
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### user_statistics
Zagregowane statystyki użytkownika
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `total_cards_created` INTEGER NOT NULL DEFAULT 0
- `total_cards_studied` INTEGER NOT NULL DEFAULT 0
- `correct_answers` INTEGER NOT NULL DEFAULT 0
- `incorrect_answers` INTEGER NOT NULL DEFAULT 0
- `average_response_time` INTEGER 
- `study_streak_days` INTEGER NOT NULL DEFAULT 0
- `last_study_date` DATE
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- CONSTRAINT `unique_user_stats` UNIQUE (user_id)

## 2. Relacje Między Tabelami

- **users-topics**: Jeden-do-wielu (Użytkownik może mieć wiele tematów)
- **users-documents**: Jeden-do-wielu (Użytkownik może mieć wiele dokumentów)
- **topics-documents**: Jeden-do-wielu (Jeden temat może zawierać wiele dokumentów)
- **users-flashcards**: Jeden-do-wielu (Użytkownik może mieć wiele fiszek)
- **users-study_sessions**: Jeden-do-wielu (Użytkownik może mieć wiele sesji nauki)
- **users-user_statistics**: Jeden-do-jeden (Jeden użytkownik ma jeden rekord statystyk)
- **topics-topics**: Jeden-do-wielu (Hierarchiczna struktura tematów)
- **topics-flashcards**: Jeden-do-wielu (Jeden temat może zawierać wiele fiszek)
- **documents-flashcards**: Jeden-do-wielu (Jeden dokument może być źródłem wielu fiszek)
- **flashcards-study_session_results**: Jeden-do-wielu (Jedna fiszka może mieć wiele wyników)
- **study_sessions-study_session_results**: Jeden-do-wielu (Jedna sesja zawiera wiele wyników fiszek)

## 3. Indeksy

- `idx_topics_user_id` ON topics(user_id)
- `idx_topics_parent_id` ON topics(parent_id)
- `idx_documents_user_id` ON documents(user_id)
- `idx_documents_topic_id` ON documents(topic_id)
- `idx_flashcards_user_id` ON flashcards(user_id)
- `idx_flashcards_document_id` ON flashcards(document_id)
- `idx_flashcards_topic_id` ON flashcards(topic_id)
- `idx_flashcards_is_disabled` ON flashcards(is_disabled)
- `idx_study_sessions_user_id` ON study_sessions(user_id)
- `idx_study_sessions_topic_id` ON study_sessions(topic_id)
- `idx_study_session_results_session_id` ON study_session_results(session_id)
- `idx_study_session_results_flashcard_id` ON study_session_results(flashcard_id)
- `idx_study_session_results_scheduled_for` ON study_session_results(scheduled_for)

## 4. Zasady Row Level Security (RLS)

### topics
```sql
CREATE POLICY "Użytkownicy mogą widzieć tylko swoje tematy" 
  ON topics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą tworzyć tylko swoje tematy" 
  ON topics FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą aktualizować tylko swoje tematy" 
  ON topics FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą usuwać tylko swoje tematy" 
  ON topics FOR DELETE 
  USING (auth.uid() = user_id);
```

### documents
```sql
CREATE POLICY "Użytkownicy mogą widzieć tylko swoje dokumenty" 
  ON documents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą tworzyć tylko swoje dokumenty" 
  ON documents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą aktualizować tylko swoje dokumenty" 
  ON documents FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą usuwać tylko swoje dokumenty" 
  ON documents FOR DELETE 
  USING (auth.uid() = user_id);
```

### flashcards
```sql
CREATE POLICY "Użytkownicy mogą widzieć tylko swoje fiszki" 
  ON flashcards FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą tworzyć tylko swoje fiszki" 
  ON flashcards FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą aktualizować tylko swoje fiszki" 
  ON flashcards FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą usuwać tylko swoje fiszki" 
  ON flashcards FOR DELETE 
  USING (auth.uid() = user_id);
```

### study_sessions i study_session_results
```sql
CREATE POLICY "Użytkownicy mogą widzieć tylko swoje sesje nauki" 
  ON study_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą tworzyć tylko swoje sesje nauki" 
  ON study_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą aktualizować tylko swoje sesje nauki" 
  ON study_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą widzieć tylko wyniki swoich sesji" 
  ON study_session_results FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM study_sessions 
      WHERE study_sessions.id = session_id 
      AND study_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Użytkownicy mogą dodawać tylko wyniki swoich sesji" 
  ON study_session_results FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_sessions 
      WHERE study_sessions.id = session_id 
      AND study_sessions.user_id = auth.uid()
    )
  );
```

### user_statistics
```sql
CREATE POLICY "Użytkownicy mogą widzieć tylko swoje statystyki" 
  ON user_statistics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą tworzyć tylko swoje statystyki" 
  ON user_statistics FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą aktualizować tylko swoje statystyki" 
  ON user_statistics FOR UPDATE 
  USING (auth.uid() = user_id);
```

## 5. Wyzwalacze (Triggers) i Funkcje

### Obliczanie procentu modyfikacji fiszki
```sql
CREATE OR REPLACE FUNCTION calculate_modification_percentage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.front_modified IS NOT NULL OR NEW.back_modified IS NOT NULL THEN
    NEW.is_modified := TRUE;
    
    -- Przykładowa logika obliczania procentu modyfikacji
    -- W praktyce mogłaby być bardziej złożona
    IF NEW.front_modified IS NOT NULL AND NEW.back_modified IS NOT NULL THEN
      -- Obie strony zmodyfikowane
      NEW.modification_percentage := 100;
    ELSIF NEW.front_modified IS NOT NULL THEN
      -- Tylko front zmodyfikowany
      NEW.modification_percentage := 50;
    ELSIF NEW.back_modified IS NOT NULL THEN
      -- Tylko back zmodyfikowany
      NEW.modification_percentage := 50;
    END IF;
  ELSE
    NEW.is_modified := FALSE;
    NEW.modification_percentage := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_modification_percentage
BEFORE INSERT OR UPDATE ON flashcards
FOR EACH ROW EXECUTE FUNCTION calculate_modification_percentage();
```

### Aktualizacja statystyk użytkownika
```sql
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Aktualizacja statystyk po dodaniu nowego wyniku
  UPDATE user_statistics
  SET 
    total_cards_studied = total_cards_studied + 1,
    correct_answers = CASE WHEN NEW.is_correct THEN correct_answers + 1 ELSE correct_answers END,
    incorrect_answers = CASE WHEN NOT NEW.is_correct THEN incorrect_answers + 1 ELSE incorrect_answers END,
    average_response_time = (average_response_time * (total_cards_studied) + NEW.response_time) / (total_cards_studied + 1),
    last_study_date = CURRENT_DATE,
    study_streak_days = CASE 
      WHEN last_study_date = CURRENT_DATE - INTERVAL '1 day' THEN study_streak_days + 1
      WHEN last_study_date = CURRENT_DATE THEN study_streak_days
      ELSE 1
    END,
    updated_at = now()
  WHERE user_id = (
    SELECT user_id FROM study_sessions WHERE id = NEW.session_id
  );
  
  -- Jeśli nie istnieje rekord statystyk, utwórz nowy
  IF NOT FOUND THEN
    INSERT INTO user_statistics (
      user_id, 
      total_cards_studied, 
      correct_answers, 
      incorrect_answers, 
      average_response_time, 
      last_study_date, 
      study_streak_days
    )
    SELECT 
      user_id,
      1,
      CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
      CASE WHEN NOT NEW.is_correct THEN 1 ELSE 0 END,
      NEW.response_time,
      CURRENT_DATE,
      1
    FROM study_sessions 
    WHERE id = NEW.session_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_statistics
AFTER INSERT ON study_session_results
FOR EACH ROW EXECUTE FUNCTION update_user_statistics();
```

### Aktualizacja licznika kart w sesji
```sql
CREATE OR REPLACE FUNCTION update_cards_reviewed_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE study_sessions
  SET cards_reviewed = cards_reviewed + 1
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cards_reviewed
AFTER INSERT ON study_session_results
FOR EACH ROW EXECUTE FUNCTION update_cards_reviewed_count();
```

## 6. Dodatkowe Uwagi

1. Pole `spaced_repetition_data` w tabeli `flashcards` używa typu JSONB do przechowywania metadanych algorytmu spaced repetition, co umożliwia elastyczne dostosowanie do różnych implementacji (ts-fsrs, supermemo lub femto-fsrs).

2. Zastosowano mechanizm "soft delete" dla fiszek poprzez pole `is_disabled`, co pozwala na ukrywanie fiszek bez faktycznego usuwania ich z bazy danych.

3. Hierarchiczna struktura tematów realizowana jest poprzez samo-referencyjną relację w tabeli `topics` (pole `parent_id`).

4. Obliczanie procentu modyfikacji fiszek realizowane jest przez wyzwalacz, w praktyce logika może wymagać bardziej zaawansowanych algorytmów porównujących tekst.

5. Statystyki użytkownika są automatycznie aktualizowane przy dodawaniu nowych wyników sesji nauki.

6. Struktura bazy danych zapewnia elastyczność w zakresie implementacji różnych algorytmów spaced repetition dzięki wykorzystaniu JSONB do przechowywania metadanych.

7. Wszystkie tabele posiadają odpowiednie zasady Row Level Security (RLS) zapewniające, że użytkownicy mają dostęp tylko do własnych danych.

8. Indeksy zostały dodane dla pól, które będą często używane w zapytaniach, co poprawia wydajność zapytań. 