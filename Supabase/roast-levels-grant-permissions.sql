-- Grants für roast_levels Tabellen
-- Führe diese Queries im Supabase SQL Editor aus

-- Grants für roast_levels Tabelle
GRANT ALL ON public.roast_levels TO anon;
GRANT ALL ON public.roast_levels TO authenticated;
GRANT ALL ON public.roast_levels TO service_role;

-- Grants für roast_levels_translations Tabelle
GRANT ALL ON public.roast_levels_translations TO anon;
GRANT ALL ON public.roast_levels_translations TO authenticated;
GRANT ALL ON public.roast_levels_translations TO service_role;

-- Sequence Grants (falls verwendet)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
