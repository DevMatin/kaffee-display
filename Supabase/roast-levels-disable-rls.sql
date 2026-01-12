-- Alternative: RLS komplett deaktivieren für roast_levels Tabellen
-- Falls die Policies nicht funktionieren, führe diese aus

-- RLS deaktivieren für roast_levels
ALTER TABLE public.roast_levels DISABLE ROW LEVEL SECURITY;

-- RLS deaktivieren für roast_levels_translations
ALTER TABLE public.roast_levels_translations DISABLE ROW LEVEL SECURITY;
