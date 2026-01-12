-- RLS Policies für alle Translation Tables
-- Führe dieses Script in Supabase aus, um SELECT-Rechte zu gewähren

-- Regions Translations
alter table regions_translations enable row level security;
drop policy if exists "anon select regions_translations" on regions_translations;
create policy "anon select regions_translations"
  on regions_translations for select 
  to anon, authenticated
  using (true);

-- Coffees Translations
alter table coffees_translations enable row level security;
drop policy if exists "anon select coffees_translations" on coffees_translations;
create policy "anon select coffees_translations"
  on coffees_translations for select 
  to anon, authenticated
  using (true);

-- Brew Methods Translations
alter table brew_methods_translations enable row level security;
drop policy if exists "anon select brew_methods_translations" on brew_methods_translations;
create policy "anon select brew_methods_translations"
  on brew_methods_translations for select 
  to anon, authenticated
  using (true);

-- Flavor Notes Translations
alter table flavor_notes_translations enable row level security;
drop policy if exists "anon select flavor_notes_translations" on flavor_notes_translations;
create policy "anon select flavor_notes_translations"
  on flavor_notes_translations for select 
  to anon, authenticated
  using (true);

-- Processing Methods Translations
alter table processing_methods_translations enable row level security;
drop policy if exists "anon select processing_methods_translations" on processing_methods_translations;
create policy "anon select processing_methods_translations"
  on processing_methods_translations for select 
  to anon, authenticated
  using (true);

-- Varietals Translations
alter table varietals_translations enable row level security;
drop policy if exists "anon select varietals_translations" on varietals_translations;
create policy "anon select varietals_translations"
  on varietals_translations for select 
  to anon, authenticated
  using (true);

-- Flavor Categories Translations
alter table flavor_categories_translations enable row level security;
drop policy if exists "anon select flavor_categories_translations" on flavor_categories_translations;
create policy "anon select flavor_categories_translations"
  on flavor_categories_translations for select 
  to anon, authenticated
  using (true);



