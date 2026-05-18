-- Wymagaj weryfikacji emaila dla dostępu do danych
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Polityka dostępu wymagająca weryfikacji emaila
CREATE POLICY "Wymagaj weryfikacji emaila" ON public.topics
  FOR ALL
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email_confirmed_at IS NOT NULL
    )
  );

CREATE POLICY "Wymagaj weryfikacji emaila" ON public.documents
  FOR ALL
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email_confirmed_at IS NOT NULL
    )
  );

CREATE POLICY "Wymagaj weryfikacji emaila" ON public.flashcards
  FOR ALL
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email_confirmed_at IS NOT NULL
    )
  );

CREATE POLICY "Wymagaj weryfikacji emaila" ON public.study_sessions
  FOR ALL
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email_confirmed_at IS NOT NULL
    )
  );

CREATE POLICY "Wymagaj weryfikacji emaila" ON public.user_statistics
  FOR ALL
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email_confirmed_at IS NOT NULL
    )
  ); 