-- ============================================
-- RESET: Alle bestehenden Daten löschen
-- ============================================

-- Erst flavor_notes category_id auf NULL setzen (FK-Constraint)
UPDATE public.flavor_notes SET category_id = NULL WHERE category_id IS NOT NULL;

-- Dann alle flavor_categories löschen
DELETE FROM public.flavor_categories;

-- ============================================
-- Flavor-Kategorien + Verknüpfung mit Farben
-- ============================================
CREATE TABLE IF NOT EXISTS public.flavor_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    level smallint NOT NULL CHECK (level BETWEEN 1 AND 3),
    parent_id uuid REFERENCES public.flavor_categories(id) ON DELETE CASCADE,
    color_hex text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.flavor_categories
    ADD COLUMN IF NOT EXISTS name_ci text GENERATED ALWAYS AS (lower(name)) STORED;

ALTER TABLE public.flavor_categories
    ADD COLUMN IF NOT EXISTS color_hex text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'flavor_categories_parent_name_key'
          AND conrelid = 'public.flavor_categories'::regclass
    ) THEN
        ALTER TABLE public.flavor_categories
            ADD CONSTRAINT flavor_categories_parent_name_key
            UNIQUE (parent_id, name_ci);
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_flavor_categories_level
    ON public.flavor_categories(level);

ALTER TABLE public.flavor_notes
    ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.flavor_categories(id) ON DELETE SET NULL;

ALTER TABLE public.flavor_notes
    ADD COLUMN IF NOT EXISTS color_hex text;

CREATE INDEX IF NOT EXISTS idx_flavor_notes_category
    ON public.flavor_notes(category_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'ux_flavor_notes_lower_name'
    ) THEN
        CREATE UNIQUE INDEX ux_flavor_notes_lower_name ON public.flavor_notes (lower(name));
    END IF;
END$$;

-- Vollständiger Flavor-Wheel-Import mit Farben (idempotent) - Deutsche Namen
WITH wheel(level1, level1_color, level2, level2_color, flavor, flavor_color) AS (
    VALUES
    -- Blumig
    ('Blumig','#FFB6C1','Schwarzer Tee','#E6E6FA','Schwarzer Tee','#DDA0DD'), 
    ('Blumig','#FFB6C1','Blumig','#FFC0CB','Jasmin','#FFB6C1'), 
    ('Blumig','#FFB6C1','Blumig','#FFC0CB','Rose','#FF69B4'), 
    ('Blumig','#FFB6C1','Blumig','#FFC0CB','Kamille','#F0E68C'),
    -- Fruchtig
    ('Fruchtig','#FF6347','Beeren','#DC143C','Erdbeere','#FF1493'), 
    ('Fruchtig','#FF6347','Beeren','#DC143C','Himbeere','#DC143C'), 
    ('Fruchtig','#FF6347','Beeren','#DC143C','Heidelbeere','#4169E1'), 
    ('Fruchtig','#FF6347','Beeren','#8B008B','Brombeere','#8B008B'),
    ('Fruchtig','#FF6347','Trockenfrüchte','#8B0000','Rosine','#8B0000'), 
    ('Fruchtig','#FF6347','Trockenfrüchte','#8B0000','Pflaume','#6B0000'),
    ('Fruchtig','#FF6347','Andere Früchte','#FF4500','Kokosnuss','#FFF8DC'), 
    ('Fruchtig','#FF6347','Andere Früchte','#FF4500','Kirsche','#DC143C'), 
    ('Fruchtig','#FF6347','Andere Früchte','#FF4500','Granatapfel','#DC143C'),
    ('Fruchtig','#FF6347','Andere Früchte','#FF4500','Ananas','#FFD700'), 
    ('Fruchtig','#FF6347','Andere Früchte','#FF4500','Traube','#9370DB'), 
    ('Fruchtig','#FF6347','Andere Früchte','#FF4500','Apfel','#FF6347'),
    ('Fruchtig','#FF6347','Andere Früchte','#FF4500','Pfirsich','#FFDAB9'), 
    ('Fruchtig','#FF6347','Andere Früchte','#FF4500','Birne','#D3D3D3'),
    ('Fruchtig','#FF6347','Zitrusfrüchte','#FFA500','Grapefruit','#FF6347'), 
    ('Fruchtig','#FF6347','Zitrusfrüchte','#FFA500','Orange','#FFA500'), 
    ('Fruchtig','#FF6347','Zitrusfrüchte','#FFA500','Zitrone','#FFFF00'), 
    ('Fruchtig','#FF6347','Zitrusfrüchte','#32CD32','Limette','#32CD32'),
    -- Sauer/Fermentiert
    ('Sauer/Fermentiert','#FFD700','Sauer','#FFFF00','Saure Aromen','#FFFF00'), 
    ('Sauer/Fermentiert','#FFD700','Sauer','#FFFF00','Essigsäure','#FFEB3B'), 
    ('Sauer/Fermentiert','#FFD700','Sauer','#FFFF00','Buttersäure','#FFF9C4'),
    ('Sauer/Fermentiert','#FFD700','Sauer','#FFFF00','Isovaleriansäure','#FFF59D'), 
    ('Sauer/Fermentiert','#FFD700','Sauer','#FFFF00','Zitronensäure','#FFC107'), 
    ('Sauer/Fermentiert','#FFD700','Sauer','#FFFF00','Apfelsäure','#FFD54F'),
    ('Sauer/Fermentiert','#FFD700','Alkohol/Fermentiert','#DAA520','Weinig','#722F37'), 
    ('Sauer/Fermentiert','#FFD700','Alkohol/Fermentiert','#DAA520','Whiskey','#8B4513'),
    ('Sauer/Fermentiert','#FFD700','Alkohol/Fermentiert','#DAA520','Fermentiert','#DAA520'), 
    ('Sauer/Fermentiert','#FFD700','Alkohol/Fermentiert','#DAA520','Überreif','#B8860B'),
    -- Grün/Vegetativ
    ('Grün/Vegetativ','#32CD32','Olivenöl','#556B2F','Olivenöl','#556B2F'),
    ('Grün/Vegetativ','#32CD32','Grün/Vegetativ','#228B22','Erbsenschote','#90EE90'), 
    ('Grün/Vegetativ','#32CD32','Grün/Vegetativ','#228B22','Frisch','#00FF00'),
    ('Grün/Vegetativ','#32CD32','Grün/Vegetativ','#228B22','Dunkelgrün','#006400'), 
    ('Grün/Vegetativ','#32CD32','Grün/Vegetativ','#228B22','Vegetativ','#228B22'),
    ('Grün/Vegetativ','#32CD32','Grün/Vegetativ','#228B22','Heuartig','#9ACD32'), 
    ('Grün/Vegetativ','#32CD32','Grün/Vegetativ','#228B22','Kräuterartig','#6B8E23'),
    ('Grün/Vegetativ','#32CD32','Bohnig','#90EE90','Bohnig','#90EE90'),
    -- Sonstiges
    ('Sonstiges','#87CEEB','Chemisch','#4682B4','Gummi','#000000'), 
    ('Sonstiges','#87CEEB','Chemisch','#4682B4','Stinktierartig','#2F4F4F'), 
    ('Sonstiges','#87CEEB','Chemisch','#4682B4','Petroleum','#191970'),
    ('Sonstiges','#87CEEB','Chemisch','#4682B4','Medizinisch','#4169E1'), 
    ('Sonstiges','#87CEEB','Chemisch','#4682B4','Salzig','#B0C4DE'),
    ('Sonstiges','#87CEEB','Papierig/Muffig','#808080','Papierig/Pappe','#D3D3D3'), 
    ('Sonstiges','#87CEEB','Papierig/Muffig','#808080','Abgestanden','#A9A9A9'),
    ('Sonstiges','#87CEEB','Papierig/Muffig','#808080','Pappe','#BC8F8F'), 
    ('Sonstiges','#87CEEB','Papierig/Muffig','#808080','Holzig','#8B4513'),
    ('Sonstiges','#87CEEB','Papierig/Muffig','#808080','Schimmelig/Feucht','#696969'), 
    ('Sonstiges','#87CEEB','Papierig/Muffig','#808080','Muffig/Erdig','#556B2F'),
    ('Sonstiges','#87CEEB','Papierig/Muffig','#808080','Tierisch','#654321'), 
    ('Sonstiges','#87CEEB','Papierig/Muffig','#808080','Fleischig/Brühe','#8B4513'), 
    ('Sonstiges','#87CEEB','Papierig/Muffig','#808080','Phenolisch','#8B0000'),
    -- Geröstet
    ('Geröstet','#8B4513','Braun/Geröstet','#654321','Braun','#A0522D'), 
    ('Geröstet','#8B4513','Braun/Geröstet','#654321','Geröstet','#654321'),
    ('Geröstet','#8B4513','Braun/Geröstet','#654321','Verbrannt','#000000'), 
    ('Geröstet','#8B4513','Braun/Geröstet','#654321','Räucherig','#2F4F4F'),
    ('Geröstet','#8B4513','Braun/Geröstet','#654321','Aschig','#C0C0C0'), 
    ('Geröstet','#8B4513','Braun/Geröstet','#654321','Scharf','#8B4513'),
    ('Geröstet','#8B4513','Getreide','#D2B48C','Getreide','#F5DEB3'), 
    ('Geröstet','#8B4513','Getreide','#D2B48C','Malz','#D2B48C'),
    -- Gewürze
    ('Gewürze','#CD853F','Scharf','#FF4500','Scharf','#FF4500'), 
    ('Gewürze','#CD853F','Pfeffer','#8B0000','Pfeffer','#8B0000'),
    ('Gewürze','#CD853F','Braune Gewürze','#A0522D','Anis','#A0522D'), 
    ('Gewürze','#CD853F','Braune Gewürze','#A0522D','Muskatnuss','#8B4513'),
    ('Gewürze','#CD853F','Braune Gewürze','#A0522D','Zimt','#D2691E'), 
    ('Gewürze','#CD853F','Braune Gewürze','#A0522D','Nelke','#8B0000'),
    -- Nussig/Kakao
    ('Nussig/Kakao','#A0522D','Nussig','#D2691E','Erdnüsse','#D2691E'), 
    ('Nussig/Kakao','#A0522D','Nussig','#D2691E','Haselnuss','#DA9100'), 
    ('Nussig/Kakao','#A0522D','Nussig','#D2691E','Mandel','#E6D5B8'),
    ('Nussig/Kakao','#A0522D','Kakao','#3D2817','Schokolade','#7B3F00'), 
    ('Nussig/Kakao','#A0522D','Kakao','#3D2817','Dunkle Schokolade','#3D2817'),
    -- Süß
    ('Süß','#DEB887','Brauner Zucker','#D2691E','Melasse','#8B4513'), 
    ('Süß','#DEB887','Brauner Zucker','#D2691E','Ahornsirup','#D2691E'),
    ('Süß','#DEB887','Brauner Zucker','#D2691E','Karamellisiert','#D2691E'), 
    ('Süß','#DEB887','Brauner Zucker','#D2691E','Honig','#FFC125'),
    ('Süß','#DEB887','Süß','#F5DEB3','Süße Aromen','#F5DEB3'), 
    ('Süß','#DEB887','Süß','#F5DEB3','Vanillin','#FFF8DC')
),
root_dedup AS (
    SELECT
        (array_agg(level1 ORDER BY level1))[1]       AS name,
        (array_agg(level1_color ORDER BY level1_color))[1] AS color,
        lower(level1) AS lname
    FROM wheel
    GROUP BY lower(level1)
),
upd_root AS (
    UPDATE public.flavor_categories c
    SET color_hex = r.color
    FROM root_dedup r
    WHERE c.parent_id IS NULL
      AND c.name_ci = r.lname
    RETURNING c.id, c.name_ci, c.name
),
ins_root AS (
    INSERT INTO public.flavor_categories(name, level, color_hex)
    SELECT r.name, 1, r.color
    FROM root_dedup r
    LEFT JOIN public.flavor_categories c ON c.parent_id IS NULL AND c.name_ci = r.lname
    WHERE c.id IS NULL
    RETURNING id, name_ci, name
),
all_level1 AS (
    SELECT id, name_ci, name FROM upd_root
    UNION ALL
    SELECT id, name_ci, name FROM ins_root
    UNION ALL
    SELECT c.id, c.name_ci, c.name
    FROM public.flavor_categories c
    WHERE c.parent_id IS NULL
      AND c.id NOT IN (SELECT id FROM upd_root UNION ALL SELECT id FROM ins_root)
),
l2_dedup AS (
    SELECT
        (array_agg(level2 ORDER BY level2))[1]            AS name,
        (array_agg(level2_color ORDER BY level2_color))[1] AS color,
        lower(level1) AS l1,
        lower(level2) AS l2
    FROM wheel
    GROUP BY lower(level1), lower(level2)
),
upd_l2 AS (
    UPDATE public.flavor_categories c
    SET color_hex = d.color
    FROM l2_dedup d
    JOIN all_level1 p ON p.name_ci = d.l1
    WHERE c.parent_id = p.id
      AND c.name_ci = d.l2
      AND c.level = 2
    RETURNING c.id, c.name_ci, c.name
),
ins_l2 AS (
    INSERT INTO public.flavor_categories(name, level, parent_id, color_hex)
    SELECT d.name, 2, p.id, d.color
    FROM l2_dedup d
    JOIN all_level1 p ON p.name_ci = d.l1
    LEFT JOIN public.flavor_categories c ON c.parent_id = p.id AND c.name_ci = d.l2 AND c.level = 2
    WHERE c.id IS NULL
    RETURNING id, name_ci, name
),
all_level2 AS (
    SELECT id, name_ci, name FROM upd_l2
    UNION ALL
    SELECT id, name_ci, name FROM ins_l2
    UNION ALL
    SELECT c.id, c.name_ci, c.name
    FROM public.flavor_categories c
    WHERE c.level = 2
      AND c.id NOT IN (SELECT id FROM upd_l2 UNION ALL SELECT id FROM ins_l2)
),
leaf_raw AS (
    SELECT level2, flavor AS name, flavor_color AS color FROM wheel
),
leaf_dedup AS (
    SELECT
        (array_agg(level2 ORDER BY level2))[1] AS level2,
        (array_agg(name ORDER BY name))[1] AS name,
        (array_agg(color ORDER BY color))[1] AS color,
        lower((array_agg(name ORDER BY name))[1]) AS name_lower,
        lower((array_agg(level2 ORDER BY level2))[1]) AS level2_lower
    FROM leaf_raw
    GROUP BY lower(name)
),
updated_flavors AS (
    UPDATE public.flavor_notes fn
    SET category_id = c2.id,
        color_hex   = d.color
    FROM leaf_dedup d
    JOIN all_level2 c2 ON c2.name_ci = d.level2_lower
    WHERE lower(fn.name) = d.name_lower
    RETURNING fn.id
),
inserted_flavors AS (
    INSERT INTO public.flavor_notes(name, category_id, color_hex)
    SELECT d.name, c2.id, d.color
    FROM leaf_dedup d
    JOIN all_level2 c2 ON c2.name_ci = d.level2_lower
    LEFT JOIN public.flavor_notes fn ON lower(fn.name) = d.name_lower
    WHERE fn.id IS NULL
    RETURNING id
),
fix_missing_categories AS (
    UPDATE public.flavor_notes fn
    SET category_id = c2.id,
        color_hex = COALESCE(fn.color_hex, d.color)
    FROM leaf_dedup d
    JOIN all_level2 c2 ON c2.name_ci = d.level2_lower
    WHERE lower(fn.name) = d.name_lower
      AND (fn.category_id IS NULL OR fn.category_id != c2.id)
    RETURNING fn.id
)
SELECT 'level1' AS stage, count(*) FROM ins_root
UNION ALL
SELECT 'level2', count(*) FROM ins_l2
UNION ALL
SELECT 'flavors_updated', count(*) FROM updated_flavors
UNION ALL
SELECT 'flavors_inserted', count(*) FROM inserted_flavors
UNION ALL
SELECT 'flavors_fixed', count(*) FROM fix_missing_categories;

