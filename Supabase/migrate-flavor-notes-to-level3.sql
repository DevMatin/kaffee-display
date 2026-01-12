-- ============================================
-- Migration: ALLE Flavor Notes zu Level 3 Kategorien
-- ============================================
-- 
-- Diese Migration migriert ALLE Flavor Notes (name und color_hex) aus der 
-- flavor_notes Tabelle zu Level 3 Kategorien in flavor_categories.
--
-- Struktur:
-- - Level 1: Root-Kategorien (z.B. "Gewürze", "Sonstiges")
-- - Level 2: Unterkategorien (z.B. "Braune Gewürze", "Chemisch")
-- - Level 3: Flavor Notes (z.B. "Salzig", "Pfeffer", "Anis")
--
-- ============================================

-- 0. Entferne Foreign Key Constraint von coffee_flavor_notes
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'coffee_flavor_notes_flavor_id_fkey'
    ) THEN
        ALTER TABLE public.coffee_flavor_notes
        DROP CONSTRAINT coffee_flavor_notes_flavor_id_fkey;
    END IF;
END$$;

-- 1. Erstelle Level 3 Kategorien aus ALLEN Flavor Notes
WITH all_flavor_notes AS (
    SELECT 
        fn.id AS flavor_note_id,
        fn.name,
        fn.color_hex,
        fn.category_id AS level2_category_id
    FROM public.flavor_notes fn
),
existing_level3 AS (
    SELECT 
        fc.id,
        fc.name_ci,
        fc.parent_id
    FROM public.flavor_categories fc
    WHERE fc.level = 3
),
-- Flavor Notes MIT category_id → Level 3 mit parent_id
insert_level3_with_parent AS (
    INSERT INTO public.flavor_categories (name, level, parent_id, color_hex)
    SELECT DISTINCT
        afn.name,
        3 AS level,
        afn.level2_category_id AS parent_id,
        afn.color_hex
    FROM all_flavor_notes afn
    LEFT JOIN existing_level3 el3 ON 
        el3.parent_id = afn.level2_category_id 
        AND el3.name_ci = lower(afn.name)
    WHERE el3.id IS NULL
        AND afn.level2_category_id IS NOT NULL
    RETURNING id, name, parent_id
),
-- Flavor Notes OHNE category_id → Level 3 mit parent_id = NULL
insert_level3_without_parent AS (
    INSERT INTO public.flavor_categories (name, level, parent_id, color_hex)
    SELECT DISTINCT
        afn.name,
        3 AS level,
        NULL::uuid AS parent_id,
        afn.color_hex
    FROM all_flavor_notes afn
    LEFT JOIN existing_level3 el3 ON 
        el3.parent_id IS NULL
        AND el3.name_ci = lower(afn.name)
    WHERE el3.id IS NULL
        AND afn.level2_category_id IS NULL
    RETURNING id, name, parent_id
),
insert_level3 AS (
    SELECT id, name, parent_id FROM insert_level3_with_parent
    UNION ALL
    SELECT id, name, parent_id FROM insert_level3_without_parent
),
update_level3 AS (
    UPDATE public.flavor_categories fc
    SET color_hex = afn.color_hex
    FROM all_flavor_notes afn
    JOIN existing_level3 el3 ON 
        (el3.parent_id = afn.level2_category_id OR (el3.parent_id IS NULL AND afn.level2_category_id IS NULL))
        AND el3.name_ci = lower(afn.name)
    WHERE fc.id = el3.id
        AND (fc.color_hex IS NULL OR fc.color_hex != afn.color_hex)
    RETURNING fc.id, fc.name
),
all_level3 AS (
    SELECT id, name, parent_id, lower(name) AS name_ci FROM insert_level3
    UNION ALL
    SELECT fc.id, fc.name, fc.parent_id, fc.name_ci
    FROM public.flavor_categories fc
    WHERE fc.level = 3
        AND fc.id NOT IN (SELECT id FROM insert_level3)
),
-- 2. Erstelle Mapping zwischen alten flavor_notes IDs und neuen Level 3 Kategorien
flavor_note_mapping AS (
    SELECT 
        fn.id AS old_flavor_note_id,
        fc3.id AS new_level3_category_id,
        fn.name
    FROM public.flavor_notes fn
    JOIN all_level3 fc3 ON 
        (fc3.parent_id = fn.category_id OR (fc3.parent_id IS NULL AND fn.category_id IS NULL))
        AND fc3.name_ci = lower(fn.name)
),
-- 3. Aktualisiere coffee_flavor_notes, um auf Level 3 Kategorien zu verweisen
-- HINWEIS: Dies setzt voraus, dass coffee_flavor_notes.flavor_id auf flavor_notes.id verweist
-- Falls die Struktur anders ist, muss dieser Teil angepasst werden
updated_coffee_flavor_notes AS (
    UPDATE public.coffee_flavor_notes cfn
    SET flavor_id = fnm.new_level3_category_id
    FROM flavor_note_mapping fnm
    WHERE cfn.flavor_id = fnm.old_flavor_note_id
        AND cfn.flavor_id != fnm.new_level3_category_id
    RETURNING cfn.id, cfn.coffee_id
)
SELECT 
    (SELECT count(*) FROM insert_level3) AS level3_categories_created,
    (SELECT count(*) FROM update_level3) AS level3_categories_updated,
    (SELECT count(*) FROM updated_coffee_flavor_notes) AS coffee_flavor_notes_updated,
    (SELECT count(*) FROM flavor_note_mapping) AS flavor_notes_mapped,
    (SELECT count(*) FROM all_flavor_notes) AS total_flavor_notes;

-- 4. Erstelle neuen Foreign Key Constraint auf flavor_categories
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'coffee_flavor_notes_flavor_id_fkey'
    ) THEN
        ALTER TABLE public.coffee_flavor_notes
        ADD CONSTRAINT coffee_flavor_notes_flavor_id_fkey
        FOREIGN KEY (flavor_id) 
        REFERENCES public.flavor_categories(id) 
        ON DELETE CASCADE;
    END IF;
END$$;

-- ============================================
-- Optional: Cleanup - Entferne alte flavor_notes Einträge, die jetzt als Level 3 existieren
-- ============================================
-- WICHTIG: Nur ausführen, wenn coffee_flavor_notes bereits aktualisiert wurde!
-- 
-- DELETE FROM public.flavor_notes fn
-- WHERE EXISTS (
--     SELECT 1 
--     FROM public.flavor_categories fc3
--     WHERE fc3.level = 3
--         AND fc3.name_ci = lower(fn.name)
--         AND fc3.parent_id = fn.category_id
-- )
-- AND NOT EXISTS (
--     SELECT 1 
--     FROM public.coffee_flavor_notes cfn
--     WHERE cfn.flavor_id = fn.id
-- );
