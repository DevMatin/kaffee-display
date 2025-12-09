------------------------------------------------------------
-- Tabellen für Verarbeitungsmethoden und Varietäten
-- mit Beschreibungen hinzufügen
------------------------------------------------------------

-- 1) PROCESSING METHODS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.processing_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_processing_methods_name ON public.processing_methods(name);

-- 2) VARIETALS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.varietals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_varietals_name ON public.varietals(name);

-- 3) COFFEE ↔ PROCESSING METHODS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coffee_processing_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coffee_id uuid NOT NULL REFERENCES public.coffees(id) ON DELETE CASCADE,
    processing_method_id uuid NOT NULL REFERENCES public.processing_methods(id) ON DELETE CASCADE,
    UNIQUE (coffee_id, processing_method_id)
);

-- 4) COFFEE ↔ VARIETALS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coffee_varietals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coffee_id uuid NOT NULL REFERENCES public.coffees(id) ON DELETE CASCADE,
    varietal_id uuid NOT NULL REFERENCES public.varietals(id) ON DELETE CASCADE,
    UNIQUE (coffee_id, varietal_id)
);

-- 5) TRIGGERS
------------------------------------------------------------
DROP TRIGGER IF EXISTS update_processing_methods_timestamp ON public.processing_methods;
CREATE TRIGGER update_processing_methods_timestamp
BEFORE UPDATE ON public.processing_methods
FOR EACH ROW EXECUTE PROCEDURE public.update_timestamp();

DROP TRIGGER IF EXISTS update_varietals_timestamp ON public.varietals;
CREATE TRIGGER update_varietals_timestamp
BEFORE UPDATE ON public.varietals
FOR EACH ROW EXECUTE PROCEDURE public.update_timestamp();

------------------------------------------------------------
-- MIGRATION: Bestehende Daten migrieren
------------------------------------------------------------

-- Verarbeitungsmethoden aus coffees extrahieren und in processing_methods einfügen
INSERT INTO public.processing_methods (name, description)
SELECT DISTINCT 
    processing_method as name,
    CASE 
        WHEN LOWER(processing_method) LIKE '%gewaschen%' THEN 
            'Bei der gewaschenen Verarbeitung werden die Kaffeekirschen entpulpt und fermentiert, bevor die Bohnen getrocknet werden. Dies führt zu einem sauberen, klaren Geschmacksprofil.'
        WHEN LOWER(processing_method) LIKE '%natürlich%' OR LOWER(processing_method) LIKE '%natural%' THEN 
            'Bei der natürlichen Verarbeitung werden die Kaffeekirschen in der Sonne getrocknet, bevor die Bohnen entfernt werden. Dies verleiht dem Kaffee fruchtige, süße Noten.'
        WHEN LOWER(processing_method) LIKE '%honey%' THEN 
            'Bei der Honey-Verarbeitung wird ein Teil des Fruchtfleisches an der Bohne belassen, was zu einem ausgewogenen Geschmacksprofil zwischen gewaschen und natürlich führt.'
        ELSE 
            'Die Verarbeitungsmethode bestimmt maßgeblich das Geschmacksprofil des Kaffees und beeinflusst Süße, Körper und Komplexität.'
    END as description
FROM public.coffees
WHERE processing_method IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Varietäten aus coffees extrahieren und in varietals einfügen
-- Achtung: varietal kann mehrere Varietäten enthalten (kommagetrennt)
INSERT INTO public.varietals (name, description)
SELECT DISTINCT 
    TRIM(unnested_varietal) as name,
    'Die Kaffeevarietät bestimmt die genetischen Eigenschaften der Pflanze und beeinflusst Geschmack, Ertrag und Widerstandsfähigkeit. Verschiedene Varietäten haben charakteristische Aromen und Eigenschaften.' as description
FROM (
    SELECT unnest(string_to_array(varietal, ',')) as unnested_varietal
    FROM public.coffees
    WHERE varietal IS NOT NULL
) sub
WHERE TRIM(unnested_varietal) != ''
ON CONFLICT (name) DO NOTHING;

-- Verknüpfungen zwischen Kaffees und Verarbeitungsmethoden erstellen
INSERT INTO public.coffee_processing_methods (coffee_id, processing_method_id)
SELECT 
    c.id as coffee_id,
    pm.id as processing_method_id
FROM public.coffees c
JOIN public.processing_methods pm ON c.processing_method = pm.name
WHERE c.processing_method IS NOT NULL
ON CONFLICT DO NOTHING;

-- Verknüpfungen zwischen Kaffees und Varietäten erstellen
INSERT INTO public.coffee_varietals (coffee_id, varietal_id)
SELECT DISTINCT
    c.id as coffee_id,
    v.id as varietal_id
FROM public.coffees c
CROSS JOIN LATERAL unnest(string_to_array(c.varietal, ',')) as varietal_name
JOIN public.varietals v ON TRIM(varietal_name) = v.name
WHERE c.varietal IS NOT NULL
ON CONFLICT DO NOTHING;

------------------------------------------------------------
-- BERECHTIGUNGEN SETZEN
------------------------------------------------------------

-- RLS aktivieren
ALTER TABLE public.processing_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.varietals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_processing_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_varietals ENABLE ROW LEVEL SECURITY;

-- RLS Policies erstellen
DROP POLICY IF EXISTS "Public Access All" ON public.processing_methods;
CREATE POLICY "Public Access All" ON public.processing_methods FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access All" ON public.varietals;
CREATE POLICY "Public Access All" ON public.varietals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access All" ON public.coffee_processing_methods;
CREATE POLICY "Public Access All" ON public.coffee_processing_methods FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access All" ON public.coffee_varietals;
CREATE POLICY "Public Access All" ON public.coffee_varietals FOR ALL USING (true) WITH CHECK (true);

-- Grants für anon und authenticated roles
GRANT ALL ON public.processing_methods TO anon;
GRANT ALL ON public.processing_methods TO authenticated;

GRANT ALL ON public.varietals TO anon;
GRANT ALL ON public.varietals TO authenticated;

GRANT ALL ON public.coffee_processing_methods TO anon;
GRANT ALL ON public.coffee_processing_methods TO authenticated;

GRANT ALL ON public.coffee_varietals TO anon;
GRANT ALL ON public.coffee_varietals TO authenticated;

------------------------------------------------------------
-- DONE
------------------------------------------------------------

