------------------------------------------------------------
-- 1) REGIONS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.regions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    country text NOT NULL,
    region_name text NOT NULL,
    latitude numeric,
    longitude numeric,
    emblem_url text,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_regions_country ON public.regions(country);
CREATE INDEX IF NOT EXISTS idx_regions_region_name ON public.regions(region_name);


------------------------------------------------------------
-- 2) COFFEES
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coffees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE,
    short_description text,
    description text,
    roast_level text,
    processing_method text,
    varietal text,
    altitude_min int,
    altitude_max int,
    country text,
    region_id uuid REFERENCES public.regions(id) ON DELETE SET NULL,
    image_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coffees_name ON public.coffees(name);
CREATE INDEX IF NOT EXISTS idx_coffees_country ON public.coffees(country);
CREATE INDEX IF NOT EXISTS idx_coffees_region_id ON public.coffees(region_id);

------------------------------------------------------------
-- 2b) COFFEE ↔ REGIONS (Mehrfachzuordnung)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coffee_regions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coffee_id uuid NOT NULL REFERENCES public.coffees(id) ON DELETE RESTRICT,
    region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE RESTRICT,
    created_at timestamptz DEFAULT now(),
    UNIQUE (coffee_id, region_id)
);

CREATE INDEX IF NOT EXISTS idx_coffee_regions_coffee ON public.coffee_regions(coffee_id);
CREATE INDEX IF NOT EXISTS idx_coffee_regions_region ON public.coffee_regions(region_id);


------------------------------------------------------------
-- 3) FLAVOR NOTES
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.flavor_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    icon_url text,
    description text
);

CREATE INDEX IF NOT EXISTS idx_flavor_notes_name ON public.flavor_notes(name);


------------------------------------------------------------
-- 4) COFFEE ↔ FLAVOR NOTES
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coffee_flavor_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coffee_id uuid NOT NULL REFERENCES public.coffees(id) ON DELETE CASCADE,
    flavor_id uuid NOT NULL REFERENCES public.flavor_notes(id) ON DELETE CASCADE,
    UNIQUE (coffee_id, flavor_id)
);


------------------------------------------------------------
-- 5) BREW METHODS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brew_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    icon_url text
);

CREATE INDEX IF NOT EXISTS idx_brew_methods_name ON public.brew_methods(name);


------------------------------------------------------------
-- 6) COFFEE ↔ BREW METHODS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coffee_brew_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coffee_id uuid NOT NULL REFERENCES public.coffees(id) ON DELETE CASCADE,
    brew_id uuid NOT NULL REFERENCES public.brew_methods(id) ON DELETE CASCADE,
    UNIQUE (coffee_id, brew_id)
);


------------------------------------------------------------
-- 7) COFFEE IMAGES
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coffee_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coffee_id uuid NOT NULL REFERENCES public.coffees(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    alt text,
    sort_order int DEFAULT 1
);


------------------------------------------------------------
-- 8) TIMESTAMP UPDATE FUNCTION
------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


------------------------------------------------------------
-- 9) TRIGGERS (drop-if-exists + recreate)
------------------------------------------------------------

-- Regions Trigger
DROP TRIGGER IF EXISTS update_regions_timestamp ON public.regions;

CREATE TRIGGER update_regions_timestamp
BEFORE UPDATE ON public.regions
FOR EACH ROW EXECUTE PROCEDURE public.update_timestamp();


-- Coffees Trigger
DROP TRIGGER IF EXISTS update_coffees_timestamp ON public.coffees;

CREATE TRIGGER update_coffees_timestamp
BEFORE UPDATE ON public.coffees
FOR EACH ROW EXECUTE PROCEDURE public.update_timestamp();

-- Coffee Regions Trigger
DROP TRIGGER IF EXISTS update_coffee_regions_timestamp ON public.coffee_regions;

CREATE TRIGGER update_coffee_regions_timestamp
BEFORE UPDATE ON public.coffee_regions
FOR EACH ROW EXECUTE PROCEDURE public.update_timestamp();

------------------------------------------------------------
-- DONE
------------------------------------------------------------
