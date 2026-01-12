-- ============================================
-- Fix: Level 3 Kategorien ohne parent_id zuordnen
-- ============================================
-- 
-- Diese Migration ordnet Level 3 Kategorien ohne parent_id den richtigen
-- Level 2 Kategorien zu, basierend auf der Flavor Wheel Struktur.
--
-- ============================================

WITH flavor_mapping AS (
    SELECT 
        level3_name,
        level2_name,
        level1_name
    FROM (VALUES
        -- Blumig
        ('Schwarzer Tee', 'Schwarzer Tee', 'Blumig'),
        ('Jasmin', 'Blumig', 'Blumig'),
        ('Rose', 'Blumig', 'Blumig'),
        ('Kamille', 'Blumig', 'Blumig'),
        -- Fruchtig
        ('Erdbeere', 'Beeren', 'Fruchtig'),
        ('Himbeere', 'Beeren', 'Fruchtig'),
        ('Heidelbeere', 'Beeren', 'Fruchtig'),
        ('Brombeere', 'Beeren', 'Fruchtig'),
        ('Rosine', 'Trockenfrüchte', 'Fruchtig'),
        ('Pflaume', 'Trockenfrüchte', 'Fruchtig'),
        ('Kokosnuss', 'Andere Früchte', 'Fruchtig'),
        ('Kirsche', 'Andere Früchte', 'Fruchtig'),
        ('Granatapfel', 'Andere Früchte', 'Fruchtig'),
        ('Ananas', 'Andere Früchte', 'Fruchtig'),
        ('Traube', 'Andere Früchte', 'Fruchtig'),
        ('Apfel', 'Andere Früchte', 'Fruchtig'),
        ('Pfirsich', 'Andere Früchte', 'Fruchtig'),
        ('Birne', 'Andere Früchte', 'Fruchtig'),
        ('Grapefruit', 'Zitrusfrüchte', 'Fruchtig'),
        ('Orange', 'Zitrusfrüchte', 'Fruchtig'),
        ('Zitrone', 'Zitrusfrüchte', 'Fruchtig'),
        ('Limette', 'Zitrusfrüchte', 'Fruchtig'),
        -- Sauer/Fermentiert
        ('Saure Aromen', 'Sauer', 'Sauer/Fermentiert'),
        ('Essigsäure', 'Sauer', 'Sauer/Fermentiert'),
        ('Buttersäure', 'Sauer', 'Sauer/Fermentiert'),
        ('Isovaleriansäure', 'Sauer', 'Sauer/Fermentiert'),
        ('Zitronensäure', 'Sauer', 'Sauer/Fermentiert'),
        ('Apfelsäure', 'Sauer', 'Sauer/Fermentiert'),
        ('Weinig', 'Alkohol/Fermentiert', 'Sauer/Fermentiert'),
        ('Whiskey', 'Alkohol/Fermentiert', 'Sauer/Fermentiert'),
        ('Fermentiert', 'Alkohol/Fermentiert', 'Sauer/Fermentiert'),
        ('Überreif', 'Alkohol/Fermentiert', 'Sauer/Fermentiert'),
        -- Grün/Vegetativ
        ('Olivenöl', 'Olivenöl', 'Grün/Vegetativ'),
        ('Erbsenschote', 'Grün/Vegetativ', 'Grün/Vegetativ'),
        ('Frisch', 'Grün/Vegetativ', 'Grün/Vegetativ'),
        ('Dunkelgrün', 'Grün/Vegetativ', 'Grün/Vegetativ'),
        ('Vegetativ', 'Grün/Vegetativ', 'Grün/Vegetativ'),
        ('Heuartig', 'Grün/Vegetativ', 'Grün/Vegetativ'),
        ('Kräuterartig', 'Grün/Vegetativ', 'Grün/Vegetativ'),
        ('Bohnig', 'Bohnig', 'Grün/Vegetativ'),
        -- Sonstiges
        ('Gummi', 'Chemisch', 'Sonstiges'),
        ('Stinktierartig', 'Chemisch', 'Sonstiges'),
        ('Petroleum', 'Chemisch', 'Sonstiges'),
        ('Medizinisch', 'Chemisch', 'Sonstiges'),
        ('Salzig', 'Chemisch', 'Sonstiges'),
        ('Papierig/Pappe', 'Papierig/Muffig', 'Sonstiges'),
        ('Abgestanden', 'Papierig/Muffig', 'Sonstiges'),
        ('Pappe', 'Papierig/Muffig', 'Sonstiges'),
        ('Holzig', 'Papierig/Muffig', 'Sonstiges'),
        ('Schimmelig/Feucht', 'Papierig/Muffig', 'Sonstiges'),
        ('Muffig/Erdig', 'Papierig/Muffig', 'Sonstiges'),
        ('Tierisch', 'Papierig/Muffig', 'Sonstiges'),
        ('Fleischig/Brühe', 'Papierig/Muffig', 'Sonstiges'),
        ('Phenolisch', 'Papierig/Muffig', 'Sonstiges'),
        -- Geröstet
        ('Braun', 'Braun/Geröstet', 'Geröstet'),
        ('Geröstet', 'Braun/Geröstet', 'Geröstet'),
        ('Verbrannt', 'Braun/Geröstet', 'Geröstet'),
        ('Räucherig', 'Braun/Geröstet', 'Geröstet'),
        ('Aschig', 'Braun/Geröstet', 'Geröstet'),
        ('Scharf', 'Braun/Geröstet', 'Geröstet'),
        ('Getreide', 'Getreide', 'Geröstet'),
        ('Malz', 'Getreide', 'Geröstet'),
        -- Gewürze
        ('Scharf', 'Scharf', 'Gewürze'),
        ('Pfeffer', 'Pfeffer', 'Gewürze'),
        ('Anis', 'Braune Gewürze', 'Gewürze'),
        ('Muskatnuss', 'Braune Gewürze', 'Gewürze'),
        ('Zimt', 'Braune Gewürze', 'Gewürze'),
        ('Nelke', 'Braune Gewürze', 'Gewürze'),
        -- Nussig/Kakao
        ('Erdnüsse', 'Nussig', 'Nussig/Kakao'),
        ('Haselnuss', 'Nussig', 'Nussig/Kakao'),
        ('Mandel', 'Nussig', 'Nussig/Kakao'),
        ('Schokolade', 'Kakao', 'Nussig/Kakao'),
        ('Dunkle Schokolade', 'Kakao', 'Nussig/Kakao'),
        -- Süß
        ('Melasse', 'Brauner Zucker', 'Süß'),
        ('Ahornsirup', 'Brauner Zucker', 'Süß'),
        ('Karamellisiert', 'Brauner Zucker', 'Süß'),
        ('Honig', 'Brauner Zucker', 'Süß'),
        ('Süße Aromen', 'Süß', 'Süß'),
        ('Sweet Aromatics', 'Süß', 'Süß'),
        ('Vanillin', 'Süß', 'Süß'),
        -- Englische Varianten
        ('Woody', 'Papierig/Muffig', 'Sonstiges'),
        ('Moldy/Damp', 'Papierig/Muffig', 'Sonstiges'),
        ('Musty/Earthy', 'Papierig/Muffig', 'Sonstiges'),
        ('Nutmeg', 'Braune Gewürze', 'Gewürze'),
        ('Olive Oil', 'Olivenöl', 'Grün/Vegetativ'),
        ('Overripe', 'Alkohol/Fermentiert', 'Sauer/Fermentiert'),
        ('Papery/Cardboard', 'Papierig/Muffig', 'Sonstiges'),
        ('Peach', 'Andere Früchte', 'Fruchtig'),
        ('Peanuts', 'Nussig', 'Nussig/Kakao'),
        ('Peapod', 'Grün/Vegetativ', 'Grün/Vegetativ'),
        ('Pear', 'Andere Früchte', 'Fruchtig'),
        ('Pepper', 'Pfeffer', 'Gewürze'),
        ('Phenolic', 'Papierig/Muffig', 'Sonstiges'),
        ('Pineapple', 'Andere Früchte', 'Fruchtig'),
        ('Pomegranate', 'Andere Früchte', 'Fruchtig'),
        ('Prune', 'Trockenfrüchte', 'Fruchtig'),
        ('Pungent', 'Scharf', 'Gewürze'),
        ('Raisin', 'Trockenfrüchte', 'Fruchtig'),
        ('Raspberry', 'Beeren', 'Fruchtig'),
        ('Roast', 'Braun/Geröstet', 'Geröstet'),
        ('Rubber', 'Chemisch', 'Sonstiges'),
        ('Salty', 'Chemisch', 'Sonstiges'),
        ('Skunky', 'Chemisch', 'Sonstiges'),
        ('Smoky', 'Braun/Geröstet', 'Geröstet'),
        ('Sour Aromatics', 'Sauer', 'Sauer/Fermentiert'),
        ('Stale', 'Papierig/Muffig', 'Sonstiges'),
        ('Strawberry', 'Beeren', 'Fruchtig'),
        ('Vegetative', 'Grün/Vegetativ', 'Grün/Vegetativ'),
        ('Winey', 'Alkohol/Fermentiert', 'Sauer/Fermentiert')
    ) AS t(level3_name, level2_name, level1_name)
),
level2_categories AS (
    SELECT 
        fc.id AS level2_id,
        fc.name AS level2_name,
        fc.parent_id AS level1_id,
        fc1.name AS level1_name
    FROM public.flavor_categories fc
    JOIN public.flavor_categories fc1 ON fc.parent_id = fc1.id
    WHERE fc.level = 2
),
updated_level3 AS (
    UPDATE public.flavor_categories fc3
    SET parent_id = l2.level2_id
    FROM flavor_mapping fm
    JOIN level2_categories l2 ON 
        l2.level2_name = fm.level2_name
        AND l2.level1_name = fm.level1_name
    WHERE fc3.level = 3
        AND fc3.parent_id IS NULL
        AND lower(fc3.name) = lower(fm.level3_name)
    RETURNING fc3.id, fc3.name, fc3.parent_id
)
SELECT 
    count(*) AS level3_categories_updated,
    array_agg(name ORDER BY name) AS updated_names
FROM updated_level3;
