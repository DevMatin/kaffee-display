-- ============================================
-- Lösche englische Level 3 Kategorien
-- ============================================
-- 
-- Diese Migration löscht englische Level 3 Kategorien, wenn es eine 
-- entsprechende deutsche Version gibt.
--
-- ============================================

WITH english_german_mapping AS (
    SELECT 
        english_name,
        german_name
    FROM (VALUES
        ('Woody', 'Holzig'),
        ('Moldy/Damp', 'Schimmelig/Feucht'),
        ('Musty/Earthy', 'Muffig/Erdig'),
        ('Nutmeg', 'Muskatnuss'),
        ('Olive Oil', 'Olivenöl'),
        ('Overripe', 'Überreif'),
        ('Papery/Cardboard', 'Papierig/Pappe'),
        ('Peach', 'Pfirsich'),
        ('Peanuts', 'Erdnüsse'),
        ('Peapod', 'Erbsenschote'),
        ('Pear', 'Birne'),
        ('Pepper', 'Pfeffer'),
        ('Phenolic', 'Phenolisch'),
        ('Pineapple', 'Ananas'),
        ('Pomegranate', 'Granatapfel'),
        ('Prune', 'Pflaume'),
        ('Pungent', 'Scharf'),
        ('Raisin', 'Rosine'),
        ('Raspberry', 'Himbeere'),
        ('Roast', 'Geröstet'),
        ('Rubber', 'Gummi'),
        ('Salty', 'Salzig'),
        ('Skunky', 'Stinktierartig'),
        ('Smoky', 'Räucherig'),
        ('Sour Aromatics', 'Saure Aromen'),
        ('Stale', 'Abgestanden'),
        ('Strawberry', 'Erdbeere'),
        ('Sweet Aromatics', 'Süße Aromen'),
        ('Vegetative', 'Vegetativ'),
        ('Winey', 'Weinig')
    ) AS t(english_name, german_name)
),
english_level3_to_delete AS (
    SELECT 
        fc.id,
        fc.name,
        fc.parent_id
    FROM public.flavor_categories fc
    JOIN english_german_mapping egm ON lower(fc.name) = lower(egm.english_name)
    WHERE fc.level = 3
        AND EXISTS (
            SELECT 1 
            FROM public.flavor_categories fc_de
            WHERE fc_de.level = 3
                AND lower(fc_de.name) = lower(egm.german_name)
                AND (fc_de.parent_id = fc.parent_id OR (fc_de.parent_id IS NULL AND fc.parent_id IS NULL))
        )
),
-- Prüfe ob coffee_flavor_notes diese IDs verwenden
coffee_flavor_notes_check AS (
    SELECT 
        cfn.flavor_id,
        COUNT(*) as usage_count
    FROM public.coffee_flavor_notes cfn
    JOIN english_level3_to_delete e3 ON cfn.flavor_id = e3.id
    GROUP BY cfn.flavor_id
),
-- Aktualisiere coffee_flavor_notes, um auf deutsche Versionen zu verweisen
updated_coffee_flavor_notes AS (
    UPDATE public.coffee_flavor_notes cfn
    SET flavor_id = fc_de.id
    FROM english_level3_to_delete e3
    JOIN english_german_mapping egm ON lower(e3.name) = lower(egm.english_name)
    JOIN public.flavor_categories fc_de ON 
        fc_de.level = 3
        AND lower(fc_de.name) = lower(egm.german_name)
        AND (fc_de.parent_id = e3.parent_id OR (fc_de.parent_id IS NULL AND e3.parent_id IS NULL))
    WHERE cfn.flavor_id = e3.id
    RETURNING cfn.id, cfn.coffee_id, cfn.flavor_id
),
-- Lösche englische Level 3 Kategorien
deleted_level3 AS (
    DELETE FROM public.flavor_categories
    WHERE id IN (SELECT id FROM english_level3_to_delete)
    RETURNING id, name
)
SELECT 
    (SELECT count(*) FROM deleted_level3) AS deleted_count,
    (SELECT count(*) FROM updated_coffee_flavor_notes) AS coffee_flavor_notes_updated,
    (SELECT array_agg(name ORDER BY name) FROM deleted_level3) AS deleted_names;
