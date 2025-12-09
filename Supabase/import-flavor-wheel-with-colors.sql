-- Flavor-Kategorien + Verknüpfung mit Farben
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

-- Optional: case-insensitive Eindeutigkeit für flavor_notes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'ux_flavor_notes_lower_name'
    ) THEN
        CREATE UNIQUE INDEX ux_flavor_notes_lower_name ON public.flavor_notes (lower(name));
    END IF;
END$$;

-- Vollständiger Flavor-Wheel-Import mit Farben (idempotent)
WITH wheel(level1, level1_color, level2, level2_color, flavor, flavor_color) AS (
    VALUES
    -- Floral (level1, level1_color, level2, level2_color, level3, level3_color)
    ('Floral','#FFB6C1','Black Tea','#E6E6FA','Black Tea','#DDA0DD'), 
    ('Floral','#FFB6C1','Floral','#FFC0CB','Jasmine','#FFB6C1'), 
    ('Floral','#FFB6C1','Floral','#FFC0CB','Rose','#FF69B4'), 
    ('Floral','#FFB6C1','Floral','#FFC0CB','Chamomile','#F0E68C'),
    -- Fruity
    ('Fruity','#FF6347','Berry','#DC143C','Strawberry','#FF1493'), 
    ('Fruity','#FF6347','Berry','#DC143C','Raspberry','#DC143C'), 
    ('Fruity','#FF6347','Berry','#DC143C','Blueberry','#4169E1'), 
    ('Fruity','#FF6347','Berry','#8B008B','Blackberry','#8B008B'),
    ('Fruity','#FF6347','Dried Fruit','#8B0000','Raisin','#8B0000'), 
    ('Fruity','#FF6347','Dried Fruit','#8B0000','Prune','#6B0000'),
    ('Fruity','#FF6347','Other Fruit','#FF4500','Coconut','#FFF8DC'), 
    ('Fruity','#FF6347','Other Fruit','#FF4500','Cherry','#DC143C'), 
    ('Fruity','#FF6347','Other Fruit','#FF4500','Pomegranate','#DC143C'),
    ('Fruity','#FF6347','Other Fruit','#FF4500','Pineapple','#FFD700'), 
    ('Fruity','#FF6347','Other Fruit','#FF4500','Grape','#9370DB'), 
    ('Fruity','#FF6347','Other Fruit','#FF4500','Apple','#FF6347'),
    ('Fruity','#FF6347','Other Fruit','#FF4500','Peach','#FFDAB9'), 
    ('Fruity','#FF6347','Other Fruit','#FF4500','Pear','#D3D3D3'),
    ('Fruity','#FF6347','Citrus Fruit','#FFA500','Grapefruit','#FF6347'), 
    ('Fruity','#FF6347','Citrus Fruit','#FFA500','Orange','#FFA500'), 
    ('Fruity','#FF6347','Citrus Fruit','#FFA500','Lemon','#FFFF00'), 
    ('Fruity','#FF6347','Citrus Fruit','#32CD32','Lime','#32CD32'),
    -- Sour/Fermented
    ('Sour/Fermented','#FFD700','Sour','#FFFF00','Sour Aromatics','#FFFF00'), 
    ('Sour/Fermented','#FFD700','Sour','#FFFF00','Acetic Acid','#FFEB3B'), 
    ('Sour/Fermented','#FFD700','Sour','#FFFF00','Butyric Acid','#FFF9C4'),
    ('Sour/Fermented','#FFD700','Sour','#FFFF00','Isovaleric Acid','#FFF59D'), 
    ('Sour/Fermented','#FFD700','Sour','#FFFF00','Citric Acid','#FFC107'), 
    ('Sour/Fermented','#FFD700','Sour','#FFFF00','Malic Acid','#FFD54F'),
    ('Sour/Fermented','#FFD700','Alcohol/Fermented','#DAA520','Winey','#722F37'), 
    ('Sour/Fermented','#FFD700','Alcohol/Fermented','#DAA520','Whiskey','#8B4513'),
    ('Sour/Fermented','#FFD700','Alcohol/Fermented','#DAA520','Fermented','#DAA520'), 
    ('Sour/Fermented','#FFD700','Alcohol/Fermented','#DAA520','Overripe','#B8860B'),
    -- Green/Vegetative
    ('Green/Vegetative','#32CD32','Olive Oil','#556B2F','Olive Oil','#556B2F'),
    ('Green/Vegetative','#32CD32','Green/Vegetative','#228B22','Peapod','#90EE90'), 
    ('Green/Vegetative','#32CD32','Green/Vegetative','#228B22','Fresh','#00FF00'),
    ('Green/Vegetative','#32CD32','Green/Vegetative','#228B22','Dark Green','#006400'), 
    ('Green/Vegetative','#32CD32','Green/Vegetative','#228B22','Vegetative','#228B22'),
    ('Green/Vegetative','#32CD32','Green/Vegetative','#228B22','Hay-like','#9ACD32'), 
    ('Green/Vegetative','#32CD32','Green/Vegetative','#228B22','Herb-like','#6B8E23'),
    ('Green/Vegetative','#32CD32','Beany','#90EE90','Beany','#90EE90'),
    -- Other
    ('Other','#87CEEB','Chemical','#4682B4','Rubber','#000000'), 
    ('Other','#87CEEB','Chemical','#4682B4','Skunky','#2F4F4F'), 
    ('Other','#87CEEB','Chemical','#4682B4','Petroleum','#191970'),
    ('Other','#87CEEB','Chemical','#4682B4','Medicinal','#4169E1'), 
    ('Other','#87CEEB','Chemical','#4682B4','Salty','#B0C4DE'),
    ('Other','#87CEEB','Paper/Musty','#808080','Papery/Cardboard','#D3D3D3'), 
    ('Other','#87CEEB','Paper/Musty','#808080','Stale','#A9A9A9'),
    ('Other','#87CEEB','Paper/Musty','#808080','Cardboard','#BC8F8F'), 
    ('Other','#87CEEB','Paper/Musty','#808080','Woody','#8B4513'),
    ('Other','#87CEEB','Paper/Musty','#808080','Moldy/Damp','#696969'), 
    ('Other','#87CEEB','Paper/Musty','#808080','Musty/Earthy','#556B2F'),
    ('Other','#87CEEB','Paper/Musty','#808080','Animalic','#654321'), 
    ('Other','#87CEEB','Paper/Musty','#808080','Meaty Brothy','#8B4513'), 
    ('Other','#87CEEB','Paper/Musty','#808080','Phenolic','#8B0000'),
    -- Roasted
    ('Roasted','#8B4513','Brown/Roast','#654321','Brown','#A0522D'), 
    ('Roasted','#8B4513','Brown/Roast','#654321','Roast','#654321'),
    ('Roasted','#8B4513','Brown/Roast','#654321','Burnt','#000000'), 
    ('Roasted','#8B4513','Brown/Roast','#654321','Smoky','#2F4F4F'),
    ('Roasted','#8B4513','Brown/Roast','#654321','Ashy','#C0C0C0'), 
    ('Roasted','#8B4513','Brown/Roast','#654321','Acrid','#8B4513'),
    ('Roasted','#8B4513','Cereal','#D2B48C','Grain','#F5DEB3'), 
    ('Roasted','#8B4513','Cereal','#D2B48C','Malt','#D2B48C'),
    -- Spices
    ('Spices','#CD853F','Pungent','#FF4500','Pungent','#FF4500'), 
    ('Spices','#CD853F','Pepper','#8B0000','Pepper','#8B0000'),
    ('Spices','#CD853F','Brown Spice','#A0522D','Anise','#A0522D'), 
    ('Spices','#CD853F','Brown Spice','#A0522D','Nutmeg','#8B4513'),
    ('Spices','#CD853F','Brown Spice','#A0522D','Cinnamon','#D2691E'), 
    ('Spices','#CD853F','Brown Spice','#A0522D','Clove','#8B0000'),
    -- Nutty/Cocoa
    ('Nutty/Cocoa','#A0522D','Nutty','#D2691E','Peanuts','#D2691E'), 
    ('Nutty/Cocoa','#A0522D','Nutty','#D2691E','Hazelnut','#DA9100'), 
    ('Nutty/Cocoa','#A0522D','Nutty','#D2691E','Almond','#E6D5B8'),
    ('Nutty/Cocoa','#A0522D','Cocoa','#3D2817','Chocolate','#7B3F00'), 
    ('Nutty/Cocoa','#A0522D','Cocoa','#3D2817','Dark Chocolate','#3D2817'),
    -- Sweet
    ('Sweet','#DEB887','Brown Sugar','#D2691E','Molasses','#8B4513'), 
    ('Sweet','#DEB887','Brown Sugar','#D2691E','Maple Syrup','#D2691E'),
    ('Sweet','#DEB887','Brown Sugar','#D2691E','Caramelized','#D2691E'), 
    ('Sweet','#DEB887','Brown Sugar','#D2691E','Honey','#FFC125'),
    ('Sweet','#DEB887','Sweet','#F5DEB3','Sweet Aromatics','#F5DEB3'), 
    ('Sweet','#DEB887','Sweet','#F5DEB3','Vanillin','#FFF8DC')
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
    RETURNING c.id, c.name_ci
),
ins_root AS (
    INSERT INTO public.flavor_categories(name, level, color_hex)
    SELECT r.name, 1, r.color
    FROM root_dedup r
    LEFT JOIN public.flavor_categories c ON c.parent_id IS NULL AND c.name_ci = r.lname
    WHERE c.id IS NULL
    RETURNING id, name_ci
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
    JOIN public.flavor_categories p ON p.parent_id IS NULL AND p.name_ci = d.l1
    WHERE c.parent_id = p.id
      AND c.name_ci = d.l2
      AND c.level = 2
    RETURNING c.id, c.name_ci
),
ins_l2 AS (
    INSERT INTO public.flavor_categories(name, level, parent_id, color_hex)
    SELECT d.name, 2, p.id, d.color
    FROM l2_dedup d
    JOIN public.flavor_categories p ON p.parent_id IS NULL AND p.name_ci = d.l1
    LEFT JOIN public.flavor_categories c ON c.parent_id = p.id AND c.name_ci = d.l2 AND c.level = 2
    WHERE c.id IS NULL
    RETURNING id, name_ci
),
leaf_raw AS (
    SELECT level2, flavor AS name, flavor_color AS color FROM wheel
),
leaf_dedup AS (
    SELECT
        (array_agg(level2 ORDER BY level2))[1] AS level2,
        (array_agg(name ORDER BY name))[1] AS name,
        (array_agg(color ORDER BY color))[1] AS color
    FROM leaf_raw
    GROUP BY lower(name)
),
updated_flavors AS (
    UPDATE public.flavor_notes fn
    SET category_id = c2.id,
        color_hex   = d.color
    FROM leaf_dedup d
    JOIN public.flavor_categories c2 ON c2.name_ci = lower(d.level2) AND c2.level = 2
    WHERE lower(fn.name) = lower(d.name)
    RETURNING fn.id
),
inserted_flavors AS (
    INSERT INTO public.flavor_notes(name, category_id, color_hex)
    SELECT d.name, c2.id, d.color
    FROM leaf_dedup d
    JOIN public.flavor_categories c2 ON c2.name_ci = lower(d.level2) AND c2.level = 2
    LEFT JOIN public.flavor_notes fn ON lower(fn.name) = lower(d.name)
    WHERE fn.id IS NULL
    RETURNING id
)
SELECT 'level1' AS stage, count(*) FROM ins_root
UNION ALL
SELECT 'level2', count(*) FROM ins_l2
UNION ALL
SELECT 'flavors_updated', count(*) FROM updated_flavors
UNION ALL
SELECT 'flavors_inserted', count(*) FROM inserted_flavors;

