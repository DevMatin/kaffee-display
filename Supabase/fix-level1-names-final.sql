-- ============================================
-- Finale Korrektur: Level 1 Kategorien umbenennen
-- ============================================
-- 
-- Diese Migration benennt die verbleibenden Level 1 Kategorien 
-- auf die Standard-Namen um.
--
-- ============================================

WITH current_level1 AS (
    SELECT 
        id,
        name,
        color_hex
    FROM public.flavor_categories
    WHERE level = 1 OR parent_id IS NULL
),
name_fixes AS (
    SELECT 
        fc.id,
        fc.name AS current_name,
        CASE 
            WHEN lower(fc.name) = 'sauer/fermentiert' THEN 'Sauer / Fermentiert'
            WHEN lower(fc.name) = 'grün/vegetativ' THEN 'Grün / Pflanzlich'
            WHEN lower(fc.name) = 'geröstet' THEN 'Röstig'
            WHEN lower(fc.name) = 'gewürze' THEN 'Würzig'
            WHEN lower(fc.name) = 'nussig/kakao' THEN 'Nussig / Kakao'
            ELSE fc.name
        END AS target_name
    FROM current_level1 fc
    WHERE lower(fc.name) IN (
        'sauer/fermentiert',
        'grün/vegetativ',
        'geröstet',
        'gewürze',
        'nussig/kakao'
    )
),
updated_level1 AS (
    UPDATE public.flavor_categories fc
    SET name = nf.target_name
    FROM name_fixes nf
    WHERE fc.id = nf.id
        AND fc.name != nf.target_name
    RETURNING fc.id, fc.name AS new_name, nf.current_name AS old_name
)
SELECT 
    count(*) AS renamed_count,
    json_agg(json_build_object('id', id, 'old_name', old_name, 'new_name', new_name) ORDER BY old_name) AS renamed_categories
FROM updated_level1;
