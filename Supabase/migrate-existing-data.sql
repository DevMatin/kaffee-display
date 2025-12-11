------------------------------------------------------------
-- Seed translations from existing German content
------------------------------------------------------------

-- Coffees -> coffees_translations
INSERT INTO public.coffees_translations (coffee_id, locale, name, short_description, description)
SELECT id, 'de', name, short_description, description
FROM public.coffees
ON CONFLICT (coffee_id, locale) DO NOTHING;

-- Regions -> regions_translations
INSERT INTO public.regions_translations (region_id, locale, region_name, description)
SELECT id, 'de', region_name, description
FROM public.regions
ON CONFLICT (region_id, locale) DO NOTHING;

-- Flavor notes -> flavor_notes_translations
INSERT INTO public.flavor_notes_translations (flavor_id, locale, name, description)
SELECT id, 'de', name, description
FROM public.flavor_notes
ON CONFLICT (flavor_id, locale) DO NOTHING;

-- Brew methods -> brew_methods_translations
INSERT INTO public.brew_methods_translations (brew_id, locale, name)
SELECT id, 'de', name
FROM public.brew_methods
ON CONFLICT (brew_id, locale) DO NOTHING;

-- Processing methods -> processing_methods_translations
INSERT INTO public.processing_methods_translations (processing_method_id, locale, name, description)
SELECT id, 'de', name, description
FROM public.processing_methods
ON CONFLICT (processing_method_id, locale) DO NOTHING;

-- Varietals -> varietals_translations
INSERT INTO public.varietals_translations (varietal_id, locale, name, description)
SELECT id, 'de', name, description
FROM public.varietals
ON CONFLICT (varietal_id, locale) DO NOTHING;

-- Flavor categories -> flavor_categories_translations
INSERT INTO public.flavor_categories_translations (flavor_category_id, locale, name)
SELECT id, 'de', name
FROM public.flavor_categories
ON CONFLICT (flavor_category_id, locale) DO NOTHING;

