-- Flavor-Kategorien + Verknüpfung
CREATE TABLE IF NOT EXISTS public.flavor_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    level smallint NOT NULL CHECK (level BETWEEN 1 AND 3),
    parent_id uuid REFERENCES public.flavor_categories(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.flavor_categories
    ADD COLUMN IF NOT EXISTS name_ci text GENERATED ALWAYS AS (lower(name)) STORED;

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

-- Vollständiger Flavor-Wheel-Import (idempotent)
WITH wheel AS (
    VALUES
    -- Floral
    ('Floral','Black Tea','Black Tea'), ('Floral','Floral','Jasmine'), ('Floral','Floral','Rose'), ('Floral','Floral','Chamomile'),
    -- Fruity
    ('Fruity','Berry','Strawberry'), ('Fruity','Berry','Raspberry'), ('Fruity','Berry','Blueberry'), ('Fruity','Berry','Blackberry'),
    ('Fruity','Dried Fruit','Raisin'), ('Fruity','Dried Fruit','Prune'),
    ('Fruity','Other Fruit','Coconut'), ('Fruity','Other Fruit','Cherry'), ('Fruity','Other Fruit','Pomegranate'),
    ('Fruity','Other Fruit','Pineapple'), ('Fruity','Other Fruit','Grape'), ('Fruity','Other Fruit','Apple'),
    ('Fruity','Other Fruit','Peach'), ('Fruity','Other Fruit','Pear'),
    ('Fruity','Citrus Fruit','Grapefruit'), ('Fruity','Citrus Fruit','Orange'), ('Fruity','Citrus Fruit','Lemon'), ('Fruity','Citrus Fruit','Lime'),
    -- Sour/Fermented
    ('Sour/Fermented','Sour','Sour Aromatics'), ('Sour/Fermented','Sour','Acetic Acid'), ('Sour/Fermented','Sour','Butyric Acid'),
    ('Sour/Fermented','Sour','Isovaleric Acid'), ('Sour/Fermented','Sour','Citric Acid'), ('Sour/Fermented','Sour','Malic Acid'),
    ('Sour/Fermented','Alcohol/Fermented','Winey'), ('Sour/Fermented','Alcohol/Fermented','Whiskey'),
    ('Sour/Fermented','Alcohol/Fermented','Fermented'), ('Sour/Fermented','Alcohol/Fermented','Overripe'),
    -- Green/Vegetative
    ('Green/Vegetative','Olive Oil','Olive Oil'),
    ('Green/Vegetative','Green/Vegetative','Peapod'), ('Green/Vegetative','Green/Vegetative','Fresh'),
    ('Green/Vegetative','Green/Vegetative','Dark Green'), ('Green/Vegetative','Green/Vegetative','Vegetative'),
    ('Green/Vegetative','Green/Vegetative','Hay-like'), ('Green/Vegetative','Green/Vegetative','Herb-like'),
    ('Green/Vegetative','Beany','Beany'),
    -- Other
    ('Other','Chemical','Rubber'), ('Other','Chemical','Skunky'), ('Other','Chemical','Petroleum'),
    ('Other','Chemical','Medicinal'), ('Other','Chemical','Salty'),
    ('Other','Paper/Musty','Papery/Cardboard'), ('Other','Paper/Musty','Stale'),
    ('Other','Paper/Musty','Cardboard'), ('Other','Paper/Musty','Woody'),
    ('Other','Paper/Musty','Moldy/Damp'), ('Other','Paper/Musty','Musty/Earthy'),
    ('Other','Paper/Musty','Animalic'), ('Other','Paper/Musty','Meaty Brothy'), ('Other','Paper/Musty','Phenolic'),
    -- Roasted
    ('Roasted','Brown/Roast','Brown'), ('Roasted','Brown/Roast','Roast'),
    ('Roasted','Brown/Roast','Burnt'), ('Roasted','Brown/Roast','Smoky'),
    ('Roasted','Brown/Roast','Ashy'), ('Roasted','Brown/Roast','Acrid'),
    ('Roasted','Cereal','Grain'), ('Roasted','Cereal','Malt'),
    -- Spices
    ('Spices','Pungent','Pungent'), ('Spices','Pepper','Pepper'),
    ('Spices','Brown Spice','Anise'), ('Spices','Brown Spice','Nutmeg'),
    ('Spices','Brown Spice','Cinnamon'), ('Spices','Brown Spice','Clove'),
    -- Nutty/Cocoa
    ('Nutty/Cocoa','Nutty','Peanuts'), ('Nutty/Cocoa','Nutty','Hazelnut'), ('Nutty/Cocoa','Nutty','Almond'),
    ('Nutty/Cocoa','Cocoa','Chocolate'), ('Nutty/Cocoa','Cocoa','Dark Chocolate'),
    -- Sweet
    ('Sweet','Brown Sugar','Molasses'), ('Sweet','Brown Sugar','Maple Syrup'),
    ('Sweet','Brown Sugar','Caramelized'), ('Sweet','Brown Sugar','Honey'),
    ('Sweet','Sweet','Sweet Aromatics'), ('Sweet','Sweet','Vanillin')
),
root AS (
    SELECT DISTINCT column1 AS name FROM wheel
),
ins_root AS (
    INSERT INTO public.flavor_categories(name, level)
    SELECT name, 1 FROM root
    ON CONFLICT (parent_id, name_ci) DO NOTHING
    RETURNING id, name_ci
),
l2 AS (
    SELECT DISTINCT column1 AS level1, column2 AS name FROM wheel
),
ins_l2 AS (
    INSERT INTO public.flavor_categories(name, level, parent_id)
    SELECT l2.name, 2, c1.id
    FROM l2
    JOIN public.flavor_categories c1 ON c1.name_ci = lower(l2.level1) AND c1.parent_id IS NULL
    ON CONFLICT (parent_id, name_ci) DO NOTHING
    RETURNING id, name_ci
),
leaf_raw AS (
    SELECT DISTINCT column2 AS level2, column3 AS name FROM wheel
),
leaf_dedup AS (
    SELECT level2, name
    FROM (
        SELECT level2, name,
               row_number() OVER (PARTITION BY lower(name) ORDER BY level2) AS rn
        FROM leaf_raw
    ) x
    WHERE rn = 1
),
ins_leaf AS (
    INSERT INTO public.flavor_notes(name, category_id)
    SELECT d.name, c2.id
    FROM leaf_dedup d
    JOIN public.flavor_categories c2 ON c2.name_ci = lower(d.level2) AND c2.level = 2
    ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id
    RETURNING id
)
SELECT 'level1' AS stage, count(*) FROM ins_root
UNION ALL
SELECT 'level2', count(*) FROM ins_l2
UNION ALL
SELECT 'flavors', count(*) FROM ins_leaf;