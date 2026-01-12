-- ============================================
-- Migration: coffee_flavor_notes von flavor_notes zu flavor_categories
-- ============================================
-- 
-- Diese Migration ändert coffee_flavor_notes so, dass sie direkt auf
-- flavor_categories verweist statt auf flavor_notes.
--
-- Änderungen:
-- 1. Entfernt Foreign Key Constraint auf flavor_notes
-- 2. Benennt Spalte flavor_id zu flavor_category_id um
-- 3. Erstellt neuen Foreign Key Constraint auf flavor_categories
-- 4. Migriert bestehende Daten (falls flavor_id noch auf flavor_notes verweist)
--
-- ============================================

-- 1. Entferne alten Foreign Key Constraint auf flavor_notes (falls vorhanden)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'coffee_flavor_notes_flavor_id_fkey'
          AND conrelid = 'public.coffee_flavor_notes'::regclass
    ) THEN
        ALTER TABLE public.coffee_flavor_notes
        DROP CONSTRAINT coffee_flavor_notes_flavor_id_fkey;
    END IF;
END$$;

-- 2. Prüfe ob flavor_id bereits auf flavor_categories verweist
-- Falls ja, müssen wir nur umbenennen
-- Falls nein, müssen wir die Daten migrieren

-- 3. Füge neue Spalte flavor_category_id hinzu (falls noch nicht vorhanden)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'coffee_flavor_notes'
          AND column_name = 'flavor_category_id'
    ) THEN
        ALTER TABLE public.coffee_flavor_notes
        ADD COLUMN flavor_category_id uuid;
    END IF;
END$$;

-- 4. Migriere Daten: Falls flavor_id noch auf flavor_notes verweist,
-- finde die entsprechende flavor_category (Level 3) basierend auf name und category_id
DO $$
DECLARE
    needs_migration boolean;
BEGIN
    -- Prüfe ob es Einträge gibt, die noch auf flavor_notes verweisen
    SELECT EXISTS (
        SELECT 1 
        FROM public.coffee_flavor_notes cfn
        WHERE cfn.flavor_category_id IS NULL
          AND EXISTS (
              SELECT 1 FROM public.flavor_notes fn WHERE fn.id = cfn.flavor_id
          )
    ) INTO needs_migration;
    
    IF needs_migration THEN
        -- Migriere: Finde Level 3 Kategorie basierend auf flavor_note name und category_id
        UPDATE public.coffee_flavor_notes cfn
        SET flavor_category_id = fc3.id
        FROM public.flavor_notes fn
        LEFT JOIN public.flavor_categories fc3 ON 
            fc3.level = 3
            AND fc3.name_ci = lower(fn.name)
            AND (
                (fc3.parent_id = fn.category_id) 
                OR (fc3.parent_id IS NULL AND fn.category_id IS NULL)
            )
        WHERE cfn.flavor_id = fn.id
          AND cfn.flavor_category_id IS NULL
          AND fc3.id IS NOT NULL;
        
        -- Falls flavor_id bereits auf flavor_categories verweist, kopiere direkt
        UPDATE public.coffee_flavor_notes cfn
        SET flavor_category_id = cfn.flavor_id
        WHERE cfn.flavor_category_id IS NULL
          AND EXISTS (
              SELECT 1 FROM public.flavor_categories fc 
              WHERE fc.id = cfn.flavor_id
          );
    ELSE
        -- Falls flavor_id bereits auf flavor_categories verweist, kopiere direkt
        UPDATE public.coffee_flavor_notes cfn
        SET flavor_category_id = cfn.flavor_id
        WHERE cfn.flavor_category_id IS NULL
          AND EXISTS (
              SELECT 1 FROM public.flavor_categories fc 
              WHERE fc.id = cfn.flavor_id
          );
    END IF;
END$$;

-- 5. Entferne alte flavor_id Spalte (nach erfolgreicher Migration)
-- WICHTIG: Nur ausführen, wenn flavor_category_id erfolgreich gefüllt wurde!
-- DO $$
-- BEGIN
--     IF EXISTS (
--         SELECT 1 FROM information_schema.columns
--         WHERE table_schema = 'public'
--           AND table_name = 'coffee_flavor_notes'
--           AND column_name = 'flavor_id'
--     ) AND NOT EXISTS (
--         SELECT 1 FROM public.coffee_flavor_notes
--         WHERE flavor_category_id IS NULL
--     ) THEN
--         ALTER TABLE public.coffee_flavor_notes
--         DROP COLUMN flavor_id;
--     END IF;
-- END$$;

-- 6. Erstelle neuen Foreign Key Constraint auf flavor_categories
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'coffee_flavor_notes_flavor_category_id_fkey'
          AND conrelid = 'public.coffee_flavor_notes'::regclass
    ) THEN
        ALTER TABLE public.coffee_flavor_notes
        ADD CONSTRAINT coffee_flavor_notes_flavor_category_id_fkey
        FOREIGN KEY (flavor_category_id) 
        REFERENCES public.flavor_categories(id) 
        ON DELETE CASCADE;
    END IF;
END$$;

-- 7. Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_coffee_flavor_notes_category 
ON public.coffee_flavor_notes(flavor_category_id);

-- 8. Erstelle Unique Constraint für (coffee_id, flavor_category_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'coffee_flavor_notes_coffee_category_unique'
          AND conrelid = 'public.coffee_flavor_notes'::regclass
    ) THEN
        ALTER TABLE public.coffee_flavor_notes
        ADD CONSTRAINT coffee_flavor_notes_coffee_category_unique
        UNIQUE (coffee_id, flavor_category_id);
    END IF;
END$$;

-- ============================================
-- Zusammenfassung
-- ============================================
SELECT 
    (SELECT count(*) FROM public.coffee_flavor_notes WHERE flavor_category_id IS NOT NULL) AS migrated_records,
    (SELECT count(*) FROM public.coffee_flavor_notes WHERE flavor_category_id IS NULL) AS unmigrated_records,
    (SELECT count(*) FROM public.coffee_flavor_notes) AS total_records;
