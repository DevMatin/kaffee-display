-- ============================================
-- Prüfe und korrigiere Level 1 Kategorien
-- ============================================
-- 
-- Diese Migration stellt sicher, dass nur die folgenden Level 1 Kategorien existieren:
-- - Blumig
-- - Fruchtig
-- - Sauer / Fermentiert
-- - Grün / Pflanzlich
-- - Sonstiges
-- - Röstig
-- - Würzig
-- - Nussig / Kakao
-- - Süß
--
-- ============================================

-- 1. Zeige aktuelle Level 1 Kategorien
WITH current_level1 AS (
    SELECT 
        id,
        name,
        level,
        parent_id,
        color_hex
    FROM public.flavor_categories
    WHERE level = 1 OR parent_id IS NULL
),
expected_level1 AS (
    SELECT name, color_hex FROM (VALUES
        ('Blumig', '#FFB6C1'),
        ('Fruchtig', '#FF6347'),
        ('Sauer / Fermentiert', '#FFD700'),
        ('Sauer/Fermentiert', '#FFD700'),
        ('Grün / Pflanzlich', '#32CD32'),
        ('Grün/Vegetativ', '#32CD32'),
        ('Sonstiges', '#87CEEB'),
        ('Röstig', '#8B4513'),
        ('Geröstet', '#8B4513'),
        ('Würzig', '#CD853F'),
        ('Gewürze', '#CD853F'),
        ('Nussig / Kakao', '#A0522D'),
        ('Nussig/Kakao', '#A0522D'),
        ('Süß', '#DEB887')
    ) AS t(name, color_hex)
),
-- 2. Finde Level 1 Kategorien, die nicht in der erwarteten Liste sind
unexpected_level1 AS (
    SELECT 
        cl1.id,
        cl1.name,
        cl1.color_hex
    FROM current_level1 cl1
    WHERE NOT EXISTS (
        SELECT 1 
        FROM expected_level1 el1 
        WHERE lower(cl1.name) = lower(el1.name)
    )
),
-- 3. Finde fehlende Level 1 Kategorien
missing_level1 AS (
    SELECT 
        el1.name,
        el1.color_hex
    FROM expected_level1 el1
    WHERE NOT EXISTS (
        SELECT 1 
        FROM current_level1 cl1 
        WHERE lower(cl1.name) = lower(el1.name)
    )
    AND el1.name IN (
        'Blumig',
        'Fruchtig',
        'Sauer / Fermentiert',
        'Grün / Pflanzlich',
        'Sonstiges',
        'Röstig',
        'Würzig',
        'Nussig / Kakao',
        'Süß'
    )
),
-- 4. Erstelle fehlende Level 1 Kategorien
inserted_level1 AS (
    INSERT INTO public.flavor_categories (name, level, parent_id, color_hex)
    SELECT 
        name,
        1,
        NULL,
        color_hex
    FROM missing_level1
    ON CONFLICT (parent_id, name_ci) DO NOTHING
    RETURNING id, name
)
SELECT 
    'Aktuelle Level 1 Kategorien:' AS info,
    (SELECT json_agg(json_build_object('id', id, 'name', name, 'color_hex', color_hex) ORDER BY name) 
     FROM current_level1) AS current_categories,
    'Unerwartete Level 1 Kategorien:' AS info2,
    (SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY name) 
     FROM unexpected_level1) AS unexpected_categories,
    'Fehlende Level 1 Kategorien:' AS info3,
    (SELECT json_agg(json_build_object('name', name, 'color_hex', color_hex) ORDER BY name) 
     FROM missing_level1) AS missing_categories,
    'Erstellte Level 1 Kategorien:' AS info4,
    (SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY name) 
     FROM inserted_level1) AS inserted_categories;

-- ============================================
-- Optional: Lösche unerwartete Level 1 Kategorien
-- ============================================
-- WICHTIG: Nur ausführen, wenn sichergestellt ist, dass keine Level 2/3 Kategorien 
-- diese als parent_id verwenden!
--
-- WITH unexpected_level1 AS (
--     SELECT 
--         id,
--         name
--     FROM public.flavor_categories
--     WHERE level = 1 OR parent_id IS NULL
--     AND name NOT IN (
--         'Blumig',
--         'Fruchtig',
--         'Sauer / Fermentiert',
--         'Sauer/Fermentiert',
--         'Grün / Pflanzlich',
--         'Grün/Vegetativ',
--         'Sonstiges',
--         'Röstig',
--         'Geröstet',
--         'Würzig',
--         'Gewürze',
--         'Nussig / Kakao',
--         'Nussig/Kakao',
--         'Süß'
--     )
--     AND NOT EXISTS (
--         SELECT 1 
--         FROM public.flavor_categories fc2 
--         WHERE fc2.parent_id = flavor_categories.id
--     )
-- )
-- DELETE FROM public.flavor_categories
-- WHERE id IN (SELECT id FROM unexpected_level1);
