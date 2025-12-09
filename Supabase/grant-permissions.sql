-- Berechtigungen für anon role setzen (falls RLS deaktiviert ist)
-- Führe diese Queries im Supabase SQL Editor aus

-- Grants für COFFEES
GRANT ALL ON public.coffees TO anon;
GRANT ALL ON public.coffees TO authenticated;

-- Grants für REGIONS
GRANT ALL ON public.regions TO anon;
GRANT ALL ON public.regions TO authenticated;

-- Grants für FLAVOR_NOTES
GRANT ALL ON public.flavor_notes TO anon;
GRANT ALL ON public.flavor_notes TO authenticated;

-- Grants für BREW_METHODS
GRANT ALL ON public.brew_methods TO anon;
GRANT ALL ON public.brew_methods TO authenticated;

-- Grants für COFFEE_FLAVOR_NOTES
GRANT ALL ON public.coffee_flavor_notes TO anon;
GRANT ALL ON public.coffee_flavor_notes TO authenticated;

-- Grants für COFFEE_BREW_METHODS
GRANT ALL ON public.coffee_brew_methods TO anon;
GRANT ALL ON public.coffee_brew_methods TO authenticated;

-- Grants für COFFEE_REGIONS
GRANT ALL ON public.coffee_regions TO anon;
GRANT ALL ON public.coffee_regions TO authenticated;

-- Grants für COFFEE_IMAGES
GRANT ALL ON public.coffee_images TO anon;
GRANT ALL ON public.coffee_images TO authenticated;

-- Grants für PROCESSING_METHODS
GRANT ALL ON public.processing_methods TO anon;
GRANT ALL ON public.processing_methods TO authenticated;

-- Grants für VARIETALS
GRANT ALL ON public.varietals TO anon;
GRANT ALL ON public.varietals TO authenticated;

-- Grants für COFFEE_PROCESSING_METHODS
GRANT ALL ON public.coffee_processing_methods TO anon;
GRANT ALL ON public.coffee_processing_methods TO authenticated;

-- Grants für COFFEE_VARIETALS
GRANT ALL ON public.coffee_varietals TO anon;
GRANT ALL ON public.coffee_varietals TO authenticated;

-- Sequence Grants (für auto-increment IDs falls verwendet)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;


