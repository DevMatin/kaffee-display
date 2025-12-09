-- Row Level Security (RLS) Policies für alle Tabellen
-- Führe diese Queries im Supabase SQL Editor aus
-- WICHTIG: Diese Policies erlauben öffentlichen Zugriff (ohne Authentifizierung)

-- ============================================
-- COFFEES Tabelle
-- ============================================

-- RLS aktivieren (falls noch nicht aktiviert)
ALTER TABLE public.coffees ENABLE ROW LEVEL SECURITY;

-- Alte Policies löschen falls sie existieren
DROP POLICY IF EXISTS "Public Access All" ON public.coffees;
DROP POLICY IF EXISTS "Public SELECT" ON public.coffees;
DROP POLICY IF EXISTS "Public INSERT" ON public.coffees;
DROP POLICY IF EXISTS "Public UPDATE" ON public.coffees;
DROP POLICY IF EXISTS "Public DELETE" ON public.coffees;

-- Öffentlicher Zugriff für alle Operationen
CREATE POLICY "Public Access All"
ON public.coffees FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- REGIONS Tabelle
-- ============================================

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access All" ON public.regions;

CREATE POLICY "Public Access All"
ON public.regions FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- FLAVOR_NOTES Tabelle
-- ============================================

ALTER TABLE public.flavor_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access All" ON public.flavor_notes;

CREATE POLICY "Public Access All"
ON public.flavor_notes FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- BREW_METHODS Tabelle
-- ============================================

ALTER TABLE public.brew_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access All" ON public.brew_methods;

CREATE POLICY "Public Access All"
ON public.brew_methods FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- COFFEE_FLAVOR_NOTES Tabelle
-- ============================================

ALTER TABLE public.coffee_flavor_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access All" ON public.coffee_flavor_notes;

CREATE POLICY "Public Access All"
ON public.coffee_flavor_notes FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- COFFEE_BREW_METHODS Tabelle
-- ============================================

ALTER TABLE public.coffee_brew_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access All" ON public.coffee_brew_methods;

CREATE POLICY "Public Access All"
ON public.coffee_brew_methods FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- COFFEE_IMAGES Tabelle
-- ============================================

ALTER TABLE public.coffee_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access All" ON public.coffee_images;

CREATE POLICY "Public Access All"
ON public.coffee_images FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- PROCESSING_METHODS Tabelle
-- ============================================

ALTER TABLE public.processing_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access All" ON public.processing_methods;

CREATE POLICY "Public Access All"
ON public.processing_methods FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- VARIETALS Tabelle
-- ============================================

ALTER TABLE public.varietals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access All" ON public.varietals;

CREATE POLICY "Public Access All"
ON public.varietals FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- COFFEE_PROCESSING_METHODS Tabelle
-- ============================================

ALTER TABLE public.coffee_processing_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access All" ON public.coffee_processing_methods;

CREATE POLICY "Public Access All"
ON public.coffee_processing_methods FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- COFFEE_VARIETALS Tabelle
-- ============================================

ALTER TABLE public.coffee_varietals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access All" ON public.coffee_varietals;

CREATE POLICY "Public Access All"
ON public.coffee_varietals FOR ALL
USING (true)
WITH CHECK (true);


