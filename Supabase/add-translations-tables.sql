------------------------------------------------------------
-- Translation tables for multilingual content (de, en)
------------------------------------------------------------

-- Coffees
CREATE TABLE IF NOT EXISTS public.coffees_translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coffee_id uuid NOT NULL REFERENCES public.coffees(id) ON DELETE CASCADE,
    locale text NOT NULL,
    name text,
    short_description text,
    description text,
    UNIQUE (coffee_id, locale)
);

-- Regions
CREATE TABLE IF NOT EXISTS public.regions_translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
    locale text NOT NULL,
    region_name text,
    description text,
    UNIQUE (region_id, locale)
);

-- Flavor notes
CREATE TABLE IF NOT EXISTS public.flavor_notes_translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    flavor_id uuid NOT NULL REFERENCES public.flavor_notes(id) ON DELETE CASCADE,
    locale text NOT NULL,
    name text,
    description text,
    UNIQUE (flavor_id, locale)
);

-- Brew methods
CREATE TABLE IF NOT EXISTS public.brew_methods_translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brew_id uuid NOT NULL REFERENCES public.brew_methods(id) ON DELETE CASCADE,
    locale text NOT NULL,
    name text,
    UNIQUE (brew_id, locale)
);

-- Processing methods
CREATE TABLE IF NOT EXISTS public.processing_methods_translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    processing_method_id uuid NOT NULL REFERENCES public.processing_methods(id) ON DELETE CASCADE,
    locale text NOT NULL,
    name text,
    description text,
    UNIQUE (processing_method_id, locale)
);

-- Varietals
CREATE TABLE IF NOT EXISTS public.varietals_translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    varietal_id uuid NOT NULL REFERENCES public.varietals(id) ON DELETE CASCADE,
    locale text NOT NULL,
    name text,
    description text,
    UNIQUE (varietal_id, locale)
);

-- Flavor categories
CREATE TABLE IF NOT EXISTS public.flavor_categories_translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    flavor_category_id uuid NOT NULL REFERENCES public.flavor_categories(id) ON DELETE CASCADE,
    locale text NOT NULL,
    name text,
    UNIQUE (flavor_category_id, locale)
);



