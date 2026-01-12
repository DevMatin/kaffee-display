------------------------------------------------------------
-- Migration: Separate roast_levels table with translations
------------------------------------------------------------

-- 1. Create roast_levels table
CREATE TABLE IF NOT EXISTS public.roast_levels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roast_levels_name ON public.roast_levels(name);

-- 2. Create roast_levels_translations table
CREATE TABLE IF NOT EXISTS public.roast_levels_translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    roast_level_id uuid NOT NULL REFERENCES public.roast_levels(id) ON DELETE CASCADE,
    locale text NOT NULL,
    name text,
    description text,
    UNIQUE (roast_level_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_roast_levels_translations_roast_level_id ON public.roast_levels_translations(roast_level_id);
CREATE INDEX IF NOT EXISTS idx_roast_levels_translations_locale ON public.roast_levels_translations(locale);

-- 3. Insert standard roast levels
INSERT INTO public.roast_levels (name) VALUES
    ('light'),
    ('medium'),
    ('dark'),
    ('omni')
ON CONFLICT (name) DO NOTHING;

-- 4. Insert translations for roast levels
INSERT INTO public.roast_levels_translations (roast_level_id, locale, name, description)
SELECT 
    rl.id,
    'de',
    CASE rl.name
        WHEN 'light' THEN 'Hell'
        WHEN 'medium' THEN 'Mittel'
        WHEN 'dark' THEN 'Dunkel'
        WHEN 'omni' THEN 'Omniröstung'
    END,
    CASE rl.name
        WHEN 'light' THEN 'Helle Röstung betont die ursprünglichen Aromen der Bohne mit fruchtigen und floralen Noten sowie höherer Säure.'
        WHEN 'medium' THEN 'Mittlere Röstung bietet ein ausgewogenes Geschmacksprofil mit harmonischen Aromen, moderater Säure und guter Süße.'
        WHEN 'dark' THEN 'Dunkle Röstung entwickelt kräftige, röstige Aromen mit weniger Säure, mehr Körper und Bitterkeit.'
        WHEN 'omni' THEN 'Omniröstung ist eine ausgewogene Röstung, die sowohl für Filterkaffee als auch für Espresso geeignet ist. Sie verbindet die Klarheit heller Röstungen mit der Körperhaftigkeit dunklerer Röstungen.'
    END
FROM public.roast_levels rl
WHERE rl.name IN ('light', 'medium', 'dark', 'omni')
ON CONFLICT (roast_level_id, locale) DO NOTHING;

INSERT INTO public.roast_levels_translations (roast_level_id, locale, name, description)
SELECT 
    rl.id,
    'en',
    CASE rl.name
        WHEN 'light' THEN 'Light'
        WHEN 'medium' THEN 'Medium'
        WHEN 'dark' THEN 'Dark'
        WHEN 'omni' THEN 'Omni-roast'
    END,
    CASE rl.name
        WHEN 'light' THEN 'Light roast highlights the bean''s origin flavors with fruity and floral notes and higher acidity.'
        WHEN 'medium' THEN 'Medium roast offers a balanced flavor profile with harmonious aromas, moderate acidity, and good sweetness.'
        WHEN 'dark' THEN 'Dark roast develops bold, roasty flavors with less acidity, more body, and bitterness.'
        WHEN 'omni' THEN 'Omni-roast is a balanced roast suitable for both filter coffee and espresso. It combines the clarity of lighter roasts with the body of darker roasts.'
    END
FROM public.roast_levels rl
WHERE rl.name IN ('light', 'medium', 'dark', 'omni')
ON CONFLICT (roast_level_id, locale) DO NOTHING;

-- 5. Add new roast_level_id column to coffees table
ALTER TABLE public.coffees 
ADD COLUMN IF NOT EXISTS roast_level_id uuid REFERENCES public.roast_levels(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_coffees_roast_level_id ON public.coffees(roast_level_id);

-- 6. Migrate existing data from roast_level (text) to roast_level_id (uuid)
-- First check if roast_level column exists, if not check for roast_level_old
DO $$
BEGIN
    -- Check if roast_level column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'coffees' 
        AND column_name = 'roast_level'
    ) THEN
        -- Migrate from roast_level column
        UPDATE public.coffees c
        SET roast_level_id = rl.id
        FROM public.roast_levels rl
        WHERE 
            c.roast_level IS NOT NULL
            AND (
                LOWER(TRIM(c.roast_level)) = LOWER(rl.name)
                OR (
                    LOWER(TRIM(c.roast_level)) LIKE '%light%' AND rl.name = 'light'
                )
                OR (
                    LOWER(TRIM(c.roast_level)) LIKE '%medium%' AND rl.name = 'medium'
                )
                OR (
                    LOWER(TRIM(c.roast_level)) LIKE '%dark%' AND rl.name = 'dark'
                )
                OR (
                    LOWER(TRIM(c.roast_level)) LIKE '%omni%' AND rl.name = 'omni'
                )
            );
        
        -- Rename old column as backup (don't delete yet)
        ALTER TABLE public.coffees 
        RENAME COLUMN roast_level TO roast_level_old;
    ELSIF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'coffees' 
        AND column_name = 'roast_level_old'
    ) THEN
        -- Migrate from roast_level_old column (if migration was partially run)
        UPDATE public.coffees c
        SET roast_level_id = rl.id
        FROM public.roast_levels rl
        WHERE 
            c.roast_level_old IS NOT NULL
            AND (
                LOWER(TRIM(c.roast_level_old)) = LOWER(rl.name)
                OR (
                    LOWER(TRIM(c.roast_level_old)) LIKE '%light%' AND rl.name = 'light'
                )
                OR (
                    LOWER(TRIM(c.roast_level_old)) LIKE '%medium%' AND rl.name = 'medium'
                )
                OR (
                    LOWER(TRIM(c.roast_level_old)) LIKE '%dark%' AND rl.name = 'dark'
                )
                OR (
                    LOWER(TRIM(c.roast_level_old)) LIKE '%omni%' AND rl.name = 'omni'
                )
            );
    END IF;
END $$;

-- 7. Add comments to document the migration
COMMENT ON TABLE public.roast_levels IS 'Roast levels master table';
COMMENT ON TABLE public.roast_levels_translations IS 'Translations for roast levels (name and description)';
COMMENT ON COLUMN public.coffees.roast_level_id IS 'Reference to roast_levels table (replaces old roast_level text column)';
COMMENT ON COLUMN public.coffees.roast_level_old IS 'DEPRECATED: Old roast_level text column, kept as backup. Use roast_level_id instead.';
