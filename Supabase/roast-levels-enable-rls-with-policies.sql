-- RLS wieder aktivieren mit korrekten Policies für roast_levels Tabellen
-- Führe diese Queries im Supabase SQL Editor aus

-- ============================================
-- ROAST_LEVELS Tabelle
-- ============================================

-- Grants setzen (wichtig, bevor RLS aktiviert wird)
GRANT ALL ON public.roast_levels TO anon;
GRANT ALL ON public.roast_levels TO authenticated;
GRANT ALL ON public.roast_levels TO service_role;

-- RLS aktivieren
ALTER TABLE public.roast_levels ENABLE ROW LEVEL SECURITY;

-- Alte Policies löschen falls sie existieren
DROP POLICY IF EXISTS "Public Access All" ON public.roast_levels;
DROP POLICY IF EXISTS "Public SELECT" ON public.roast_levels;
DROP POLICY IF EXISTS "Public INSERT" ON public.roast_levels;
DROP POLICY IF EXISTS "Public UPDATE" ON public.roast_levels;
DROP POLICY IF EXISTS "Public DELETE" ON public.roast_levels;

-- Öffentlicher Zugriff für SELECT (Lesen) - für anon und authenticated
CREATE POLICY "Public SELECT"
ON public.roast_levels FOR SELECT
TO public, anon, authenticated
USING (true);

-- Öffentlicher Zugriff für INSERT (Erstellen) - für anon und authenticated
CREATE POLICY "Public INSERT"
ON public.roast_levels FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

-- Öffentlicher Zugriff für UPDATE (Aktualisieren) - für anon und authenticated
CREATE POLICY "Public UPDATE"
ON public.roast_levels FOR UPDATE
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

-- Öffentlicher Zugriff für DELETE (Löschen) - für anon und authenticated
CREATE POLICY "Public DELETE"
ON public.roast_levels FOR DELETE
TO public, anon, authenticated
USING (true);

-- ============================================
-- ROAST_LEVELS_TRANSLATIONS Tabelle
-- ============================================

-- Grants setzen (wichtig, bevor RLS aktiviert wird)
GRANT ALL ON public.roast_levels_translations TO anon;
GRANT ALL ON public.roast_levels_translations TO authenticated;
GRANT ALL ON public.roast_levels_translations TO service_role;

-- RLS aktivieren
ALTER TABLE public.roast_levels_translations ENABLE ROW LEVEL SECURITY;

-- Alte Policies löschen falls sie existieren
DROP POLICY IF EXISTS "Public Access All" ON public.roast_levels_translations;
DROP POLICY IF EXISTS "Public SELECT" ON public.roast_levels_translations;
DROP POLICY IF EXISTS "Public INSERT" ON public.roast_levels_translations;
DROP POLICY IF EXISTS "Public UPDATE" ON public.roast_levels_translations;
DROP POLICY IF EXISTS "Public DELETE" ON public.roast_levels_translations;

-- Öffentlicher Zugriff für SELECT (Lesen) - für anon und authenticated
CREATE POLICY "Public SELECT"
ON public.roast_levels_translations FOR SELECT
TO public, anon, authenticated
USING (true);

-- Öffentlicher Zugriff für INSERT (Erstellen) - für anon und authenticated
CREATE POLICY "Public INSERT"
ON public.roast_levels_translations FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

-- Öffentlicher Zugriff für UPDATE (Aktualisieren) - für anon und authenticated
CREATE POLICY "Public UPDATE"
ON public.roast_levels_translations FOR UPDATE
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

-- Öffentlicher Zugriff für DELETE (Löschen) - für anon und authenticated
CREATE POLICY "Public DELETE"
ON public.roast_levels_translations FOR DELETE
TO public, anon, authenticated
USING (true);
