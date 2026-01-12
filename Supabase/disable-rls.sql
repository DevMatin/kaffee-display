-- RLS (Row Level Security) für alle Tabellen DEAKTIVIEREN
-- Führe diese Queries im Supabase SQL Editor aus

-- ============================================
-- COFFEES Tabelle - RLS deaktivieren
-- ============================================
ALTER TABLE public.coffees DISABLE ROW LEVEL SECURITY;

-- ============================================
-- REGIONS Tabelle - RLS deaktivieren
-- ============================================
ALTER TABLE public.regions DISABLE ROW LEVEL SECURITY;

-- ============================================
-- FLAVOR_NOTES Tabelle - RLS deaktivieren
-- ============================================
ALTER TABLE public.flavor_notes DISABLE ROW LEVEL SECURITY;

-- ============================================
-- BREW_METHODS Tabelle - RLS deaktivieren
-- ============================================
ALTER TABLE public.brew_methods DISABLE ROW LEVEL SECURITY;

-- ============================================
-- COFFEE_FLAVOR_NOTES Tabelle - RLS deaktivieren
-- ============================================
ALTER TABLE public.coffee_flavor_notes DISABLE ROW LEVEL SECURITY;

-- ============================================
-- COFFEE_BREW_METHODS Tabelle - RLS deaktivieren
-- ============================================
ALTER TABLE public.coffee_brew_methods DISABLE ROW LEVEL SECURITY;

-- ============================================
-- COFFEE_IMAGES Tabelle - RLS deaktivieren
-- ============================================
ALTER TABLE public.coffee_images DISABLE ROW LEVEL SECURITY;




