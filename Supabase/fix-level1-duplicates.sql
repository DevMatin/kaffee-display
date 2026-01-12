-- ============================================
-- Fix: Level 1 Duplikate beheben und umbenennen
-- ============================================
-- 
-- Diese Migration:
-- 1. Benennt alte Level 1 Kategorien um
-- 2. Aktualisiert parent_id Verweise von Level 2/3 Kategorien
-- 3. Löscht die Duplikate
--
-- ============================================

WITH name_mapping AS (
    SELECT 
        t.old_name,
        t.new_name,
        old_fc.id AS old_id,
        new_fc.id AS new_id
    FROM (VALUES
        ('Sauer/Fermentiert', 'Sauer / Fermentiert'),
        ('Grün/Vegetativ', 'Grün / Pflanzlich'),
        ('Geröstet', 'Röstig'),
        ('Gewürze', 'Würzig'),
        ('Nussig/Kakao', 'Nussig / Kakao')
    ) AS t(old_name, new_name)
    JOIN public.flavor_categories old_fc ON 
        old_fc.level = 1 
        AND lower(old_fc.name) = lower(t.old_name)
    JOIN public.flavor_categories new_fc ON 
        new_fc.level = 1 
        AND lower(new_fc.name) = lower(t.new_name)
),
-- 1. Aktualisiere parent_id von Level 2/3 Kategorien, die auf neue (Duplikat) Level 1 verweisen
--    auf die alten Level 1 Kategorien
updated_children_from_new_to_old AS (
    UPDATE public.flavor_categories fc
    SET parent_id = nm.old_id
    FROM name_mapping nm
    WHERE fc.parent_id = nm.new_id
        AND nm.new_id != nm.old_id
    RETURNING fc.id, fc.name, fc.level
),
-- 2. Lösche die Duplikate (die neu erstellten)
deleted_duplicates AS (
    DELETE FROM public.flavor_categories
    WHERE id IN (
        SELECT nm.new_id 
        FROM name_mapping nm
        WHERE nm.new_id != nm.old_id
    )
    RETURNING id, name
),
-- 3. Benenne alte Level 1 Kategorien um
renamed_level1 AS (
    UPDATE public.flavor_categories fc
    SET name = nm.new_name
    FROM name_mapping nm
    WHERE fc.id = nm.old_id
        AND fc.name != nm.new_name
    RETURNING fc.id, fc.name AS old_name, nm.new_name AS new_name
)
SELECT 
    (SELECT count(*) FROM updated_children_from_new_to_old) AS children_updated,
    (SELECT count(*) FROM deleted_duplicates) AS duplicates_deleted,
    (SELECT count(*) FROM renamed_level1) AS level1_renamed,
    (SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY name) 
     FROM deleted_duplicates) AS deleted_categories,
    (SELECT json_agg(json_build_object('id', id, 'old_name', old_name, 'new_name', new_name) ORDER BY old_name) 
     FROM renamed_level1) AS renamed_categories;
