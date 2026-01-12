-- ============================================
-- Benenne Level 1 Kategorien auf Standard-Namen um
-- ============================================
-- 
-- Diese Migration benennt Level 1 Kategorien von alten Namen auf die 
-- Standard-Namen um:
--
-- - "Sauer/Fermentiert" → "Sauer / Fermentiert"
-- - "Grün/Vegetativ" → "Grün / Pflanzlich"
-- - "Geröstet" → "Röstig"
-- - "Gewürze" → "Würzig"
-- - "Nussig/Kakao" → "Nussig / Kakao"
--
-- ============================================

WITH name_mapping AS (
    SELECT 
        old_name,
        new_name
    FROM (VALUES
        ('Sauer/Fermentiert', 'Sauer / Fermentiert'),
        ('Grün/Vegetativ', 'Grün / Pflanzlich'),
        ('Geröstet', 'Röstig'),
        ('Gewürze', 'Würzig'),
        ('Nussig/Kakao', 'Nussig / Kakao')
    ) AS t(old_name, new_name)
),
updated_level1 AS (
    UPDATE public.flavor_categories fc
    SET name = nm.new_name
    FROM name_mapping nm
    WHERE fc.level = 1
        AND lower(fc.name) = lower(nm.old_name)
        AND fc.name != nm.new_name
    RETURNING fc.id, fc.name AS old_name, nm.new_name
)
SELECT 
    count(*) AS renamed_count,
    json_agg(json_build_object('id', id, 'old_name', old_name, 'new_name', new_name) ORDER BY old_name) AS renamed_categories
FROM updated_level1;
