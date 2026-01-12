-- ============================================
-- Migration: Entferne alte flavor_id Spalte
-- ============================================
-- 
-- Diese Migration entfernt die alte flavor_id Spalte aus coffee_flavor_notes,
-- nachdem alle Daten erfolgreich zu flavor_category_id migriert wurden.
--
-- WICHTIG: Nur ausführen, wenn:
-- 1. Alle Daten erfolgreich zu flavor_category_id migriert wurden
-- 2. Keine NULL-Werte in flavor_category_id existieren
-- 3. Die Migration migrate-coffee-flavor-notes-to-categories.sql erfolgreich war
--
-- ============================================

-- 1. Prüfe ob alle Daten migriert wurden
DO $$
DECLARE
    unmigrated_count integer;
    total_count integer;
BEGIN
    SELECT COUNT(*) INTO total_count FROM public.coffee_flavor_notes;
    SELECT COUNT(*) INTO unmigrated_count 
    FROM public.coffee_flavor_notes 
    WHERE flavor_category_id IS NULL;
    
    IF unmigrated_count > 0 THEN
        RAISE EXCEPTION 'Es gibt noch % nicht migrierte Datensätze von insgesamt %. Bitte zuerst alle Daten migrieren.', unmigrated_count, total_count;
    END IF;
    
    RAISE NOTICE 'Alle % Datensätze sind erfolgreich migriert. Entferne flavor_id Spalte...', total_count;
END$$;

-- 2. Entferne Foreign Key Constraint auf flavor_id (falls vorhanden)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'coffee_flavor_notes_flavor_id_fkey'
          AND conrelid = 'public.coffee_flavor_notes'::regclass
    ) THEN
        ALTER TABLE public.coffee_flavor_notes
        DROP CONSTRAINT coffee_flavor_notes_flavor_id_fkey;
        RAISE NOTICE 'Foreign Key Constraint coffee_flavor_notes_flavor_id_fkey entfernt';
    END IF;
END$$;

-- 3. Entferne Unique Constraint auf (coffee_id, flavor_id) falls vorhanden
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'coffee_flavor_notes_coffee_id_flavor_id_key'
          AND conrelid = 'public.coffee_flavor_notes'::regclass
    ) THEN
        ALTER TABLE public.coffee_flavor_notes
        DROP CONSTRAINT coffee_flavor_notes_coffee_id_flavor_id_key;
        RAISE NOTICE 'Unique Constraint coffee_flavor_notes_coffee_id_flavor_id_key entfernt';
    END IF;
END$$;

-- 4. Entferne Index auf flavor_id (falls vorhanden)
DROP INDEX IF EXISTS public.idx_coffee_flavor_notes_flavor;

-- 5. Entferne die alte flavor_id Spalte
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'coffee_flavor_notes'
          AND column_name = 'flavor_id'
    ) THEN
        ALTER TABLE public.coffee_flavor_notes
        DROP COLUMN flavor_id;
        RAISE NOTICE 'Spalte flavor_id erfolgreich entfernt';
    ELSE
        RAISE NOTICE 'Spalte flavor_id existiert nicht mehr';
    END IF;
END$$;

-- ============================================
-- Zusammenfassung
-- ============================================
SELECT 
    (SELECT COUNT(*) FROM public.coffee_flavor_notes) AS total_records,
    (SELECT COUNT(*) FROM public.coffee_flavor_notes WHERE flavor_category_id IS NOT NULL) AS records_with_category_id,
    (SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'coffee_flavor_notes'
          AND column_name = 'flavor_id'
    )) AS flavor_id_still_exists;
