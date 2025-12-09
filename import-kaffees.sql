-- ============================================================
-- Import-Script für Kaffees von amir-kaffeemann.de
-- ============================================================
-- 
-- HINWEISE:
-- 1. UUIDs werden automatisch generiert
-- 2. Slugs werden automatisch generiert (können manuell angepasst werden)
-- 3. Regionen werden zuerst erstellt, dann werden Kaffees mit Regionen verknüpft
-- 4. Geschmacksnoten und Zubereitungsmethoden müssen mit vorhandenen IDs verknüpft werden
-- 5. Prüfen Sie vor dem Import, welche flavor_notes und brew_methods IDs existieren
--
-- ============================================================
-- SCHRITT 1: REGIONEN ERSTELLEN
-- ============================================================

-- Brasilien - Primavera
INSERT INTO public.regions (
    country,
    region_name,
    description
)
SELECT 'Brasilien', 'Primavera', 'Region in Brasilien, bekannt für Brasil Primavera Kaffee'
WHERE NOT EXISTS (
    SELECT 1 FROM public.regions 
    WHERE country = 'Brasilien' AND region_name = 'Primavera'
);

-- Kolumbien - La Claudina
INSERT INTO public.regions (
    country,
    region_name,
    description
)
SELECT 'Kolumbien', 'La Claudina', 'Region in Kolumbien, bekannt für Colombia La Claudina Kaffee'
WHERE NOT EXISTS (
    SELECT 1 FROM public.regions 
    WHERE country = 'Kolumbien' AND region_name = 'La Claudina'
);

-- Kolumbien - Wilder Lazo
INSERT INTO public.regions (
    country,
    region_name,
    description
)
SELECT 'Kolumbien', 'Wilder Lazo', 'Region in Kolumbien, bekannt für Colombia Wilder Lazo Red Tiger Kaffee'
WHERE NOT EXISTS (
    SELECT 1 FROM public.regions 
    WHERE country = 'Kolumbien' AND region_name = 'Wilder Lazo'
);

-- Kolumbien - Samaria
INSERT INTO public.regions (
    country,
    region_name,
    description
)
SELECT 'Kolumbien', 'Samaria', 'Finca Samaria in Kolumbien, bekannt für Sugarcane Decaf Mauricio Osorio'
WHERE NOT EXISTS (
    SELECT 1 FROM public.regions 
    WHERE country = 'Kolumbien' AND region_name = 'Samaria'
);

-- Äthiopien - Yirgacheffe
INSERT INTO public.regions (
    country,
    region_name,
    description
)
SELECT 'Äthiopien', 'Yirgacheffe', 'Hochlandregion in Äthiopien, bekannt für hochwertige Kaffees'
WHERE NOT EXISTS (
    SELECT 1 FROM public.regions 
    WHERE country = 'Äthiopien' AND region_name = 'Yirgacheffe'
);

-- Indien - Monsooned Malabar
INSERT INTO public.regions (
    country,
    region_name,
    description
)
SELECT 'Indien', 'Monsooned Malabar', 'Küstenregion in Indien, bekannt für den speziellen Monsooned Malabar Kaffee'
WHERE NOT EXISTS (
    SELECT 1 FROM public.regions 
    WHERE country = 'Indien' AND region_name = 'Monsooned Malabar'
);

-- Indien - Baba Budangiri
INSERT INTO public.regions (
    country,
    region_name,
    description
)
SELECT 'Indien', 'Baba Budangiri', 'Höhenlagen in Indien, bekannt für India Baba Budangiri Kaffee'
WHERE NOT EXISTS (
    SELECT 1 FROM public.regions 
    WHERE country = 'Indien' AND region_name = 'Baba Budangiri'
);

-- Mexiko - las Chicharras
INSERT INTO public.regions (
    country,
    region_name,
    description
)
SELECT 'Mexiko', 'las Chicharras', 'Region in Mexiko, bekannt für México las Chicharras Kaffee'
WHERE NOT EXISTS (
    SELECT 1 FROM public.regions 
    WHERE country = 'Mexiko' AND region_name = 'las Chicharras'
);

-- Kenia - Masai
INSERT INTO public.regions (
    country,
    region_name,
    description
)
SELECT 'Kenia', 'Masai', 'Region in Kenia, bekannt für Kenia Masai AA Kaffee'
WHERE NOT EXISTS (
    SELECT 1 FROM public.regions 
    WHERE country = 'Kenia' AND region_name = 'Masai'
);

-- Peru - Chanchamayo
INSERT INTO public.regions (
    country,
    region_name,
    description
)
SELECT 'Peru', 'Chanchamayo', 'Chanchamayo-Tal in Peru, bekannt für hochwertige Kaffees'
WHERE NOT EXISTS (
    SELECT 1 FROM public.regions 
    WHERE country = 'Peru' AND region_name = 'Chanchamayo'
);

-- Ruanda - Rugali
INSERT INTO public.regions (
    country,
    region_name,
    description
)
SELECT 'Ruanda', 'Rugali', 'Region in Ruanda, bekannt für Rwanda Rugali Honey Kaffee'
WHERE NOT EXISTS (
    SELECT 1 FROM public.regions 
    WHERE country = 'Ruanda' AND region_name = 'Rugali'
);

-- Honduras - Finca Rio Colardo
INSERT INTO public.regions (
    country,
    region_name,
    description
)
SELECT 'Honduras', 'Finca Rio Colardo', 'Finca Rio Colardo in Honduras'
WHERE NOT EXISTS (
    SELECT 1 FROM public.regions 
    WHERE country = 'Honduras' AND region_name = 'Finca Rio Colardo'
);

-- ============================================================
-- SCHRITT 2: KAFFEES ERSTELLEN
-- ============================================================

-- 1. Shiraz Blend
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Shiraz Blend',
    'shiraz-blend',
    'Kraftvolle Mischung aus Brasilien, Indien und Guatemala',
    'Eine kraftvolle Kaffeemischung aus Brasilien, Indien und Guatemala mit intensivem Geschmack und tiefen Noten von Nüssen und Schokolade. Wenig Säure und eine reiche, ölige Textur.',
    'dark',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 2. Erlangener Mischung
-- Hinweis: Mischung aus zwei Regionen, daher keine spezifische region_id
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Erlangener Mischung',
    'erlangener-mischung',
    'Kombination aus 50% Brasil Primavera und 50% Colombia La Claudina',
    'Eine Kombination aus 50% Brasil Primavera und 50% Colombia La Claudina. Ausgewogener Geschmack mit nussigen und schokoladigen Noten sowie einem Hauch von Zitrusfrüchten.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 3. Perse Polis
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Perse Polis',
    'perse-polis',
    'Kräftiges Aroma von reichhaltigem Kakao mit süßlichem Abgang',
    'Kräftiges Aroma von reichhaltigem Kakao, gefolgt von einem süßlichen Abgang. Mischung aus Bohnen aus Mexiko, Brasilien und Indien. Tiefes und intensives Geschmackserlebnis, ideal für Liebhaber von kräftigem Espresso.',
    'dark',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 4. India Monsooned Malabar
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'India Monsooned Malabar',
    'india-monsooned-malabar',
    'Außergewöhnlicher Kaffee mit süßen, floralen und schokoladigen Aromen',
    'Außergewöhnlicher Kaffee mit süßen, floralen und schokoladigen Aromen. Angebaut in den Höhenlagen von 1.200 bis 1.400 Metern in Indien. Die Pacamara-Varietät wird gewaschen verarbeitet und bringt klare, reine Geschmacksnoten hervor.',
    NULL,
    'gewaschen',
    'Pacamara',
    1200,
    1400,
    'Indien',
    (SELECT id FROM public.regions WHERE country = 'Indien' AND region_name = 'Monsooned Malabar'),
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 5. Natürlich Entkoffeiniert (CR3)
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Natürlich Entkoffeiniert',
    'natuerlich-entkoffeiniert',
    'Koffeinfreier Kaffee mit vollem Geschmack',
    'Genießen Sie den CR3 Natürlich Entkoffeinierten Kaffee, der ohne Koffein, aber voller Geschmack daherkommt. Durch ein spezielles Entkoffeinierungsverfahren mit Kohlendioxid wird der Kaffee schonend entkoffeiniert, wobei sein reichhaltiges Aroma erhalten bleibt.',
    NULL,
    'CO₂-Entkoffeinierung',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 6. Ethiopia Yirgacheffe Adado Grade 1
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Ethiopia Yirgacheffe Adado Grade 1',
    'ethiopia-yirgacheffe-adado-grade-1',
    'Hochwertiger Kaffee aus den Höhen von Yirgacheffe',
    'Erleben Sie den Ethiopia Yirgacheffe Adado Grade 1, der mit Aromen von schwarzem Tee, Brombeere und süßer Blaubeere begeistert. Dieser hochwertige Kaffee, der in den Höhen von Yirgacheffe wächst, verbindet traditionelle Anbauweisen mit erstklassiger Qualität.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Äthiopien',
    (SELECT id FROM public.regions WHERE country = 'Äthiopien' AND region_name = 'Yirgacheffe'),
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 7. México las Chicharras
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'México las Chicharras',
    'mexico-las-chicharras',
    'Exquisite Mischung aus süßen, floralen Noten mit einem Hauch von Schokolade',
    'Entdecken Sie México las Chicharras Kaffee, eine exquisite Mischung aus süßen, floralen Noten mit einem Hauch von Schokolade, der einen vollen Körper und ein reiches Geschmacksprofil bietet. Dieser vielseitige Kaffee aus Höhenlagen zwischen 1.200 und 1.400 Metern eignet sich hervorragend für diverse Brühmethoden, von Herdkochern über Siebträger bis hin zu Aeropress und Chemex.',
    NULL,
    NULL,
    NULL,
    1200,
    1400,
    'Mexiko',
    (SELECT id FROM public.regions WHERE country = 'Mexiko' AND region_name = 'las Chicharras'),
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 8. Weihnachts Röstung
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Weihnachts Röstung',
    'weihnachts-roestung',
    'Exklusive Kaffeebohnenmischung aus hochwertigen Arabica-Bohnen',
    'Die "Weihnachtsröstung" ist eine exklusive Kaffeebohnenmischung aus hochwertigen Arabica-Bohnen aus Kolumbien.',
    NULL,
    NULL,
    'Arabica',
    NULL,
    NULL,
    'Kolumbien',
    NULL,
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 9. Colombia Wilder Lazo Red Tiger
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Colombia Wilder Lazo Red Tiger',
    'colombia-wilder-lazo-red-tiger',
    'Symphonie der Sinne mit Honig, Pfirsich und blumigem Finale',
    'Eine Symphonie der Sinne, die flüssigen Honig mit lebhaften Pfirsicharomen verbindet und durch geheimnisvolle Noten gewürzt wird, abgerundet durch ein blumiges Finale und belebt durch die frische Säure reifer Grapefruits.',
    NULL,
    'anaerob (100 Stunden)',
    NULL,
    NULL,
    NULL,
    'Kolumbien',
    (SELECT id FROM public.regions WHERE country = 'Kolumbien' AND region_name = 'Wilder Lazo'),
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 10. India Baba Budangiri
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'India Baba Budangiri',
    'india-baba-budangiri',
    'Harmonisches Zusammenspiel von Nougat- und Haselnussnoten',
    'Genießen Sie den exquisiten India Baba Budangiri, einen einzigartigen Kaffee, der in den Höhenlagen Indiens sorgfältig angebaut wird. Dieser Kaffee verführt mit einem harmonischen Zusammenspiel von Nougat- und Haselnussnoten, unterstrichen durch einen Hauch von Kakao, der ein intensives, aber ausgewogenes Geschmackserlebnis schafft.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Indien',
    (SELECT id FROM public.regions WHERE country = 'Indien' AND region_name = 'Baba Budangiri'),
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 11. Surprise Box
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Surprise Box',
    'surprise-box',
    'Überraschungspaket für Kaffeekenner',
    'Ideal für Kaffeekenner, die gerne Neues entdecken, oder als das perfekte Geschenk für den Kaffeeliebhaber in Ihrem Leben. Lassen Sie sich überraschen und genießen Sie jeden Schluck der Vielfalt, die unsere "Surprise Box" zu bieten hat.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 12. Kaffee & Espresso Probepackung
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Kaffee & Espresso Probepackung',
    'kaffee-espresso-probepackung',
    'Probepackung nach Geschmacksrichtung',
    'Wir verschicken euch nach euren Geschmacksrichtung eine Probepackung zu.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 13. Kenia Masai AA
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Kenia Masai AA',
    'kenia-masai-aa',
    'Symphonie der Sinne mit Honig, Pfirsich und blumigem Finale',
    'Eine Symphonie der Sinne, die flüssigen Honig mit lebhaften Pfirsicharomen verbindet und durch geheimnisvolle Noten gewürzt wird, abgerundet durch ein blumiges Finale und belebt durch die frische Säure reifer Grapefruits.',
    NULL,
    'gewaschen',
    'SL 28, SL 34, Ruiru 11',
    1650,
    1850,
    'Kenia',
    (SELECT id FROM public.regions WHERE country = 'Kenia' AND region_name = 'Masai'),
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 14. Surprise Box Primär Edition
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Surprise Box Primär Edition',
    'surprise-box-primaer-edition',
    'Überraschungspaket für Kaffeekenner - Primär Edition',
    'Ideal für Kaffeekenner, die gerne Neues entdecken, oder als das perfekte Geschenk für den Kaffeeliebhaber in Ihrem Leben. Lassen Sie sich überraschen und genießen Sie jeden Schluck der Vielfalt, die unsere "Surprise Box" zu bieten hat.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 15. Peru Amazonas Decaf
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Peru Amazonas Decaf',
    'peru-amazonas-decaf',
    'Ausgewogener, schokoladiger Kaffee aus hohen Lagen',
    'Peru Villa Rica ist ein ausgewogener, schokoladiger Kaffee, der in hohen Lagen im Chanchamayo-Tal angebaut wird. Er hat einen vollen Körper und eine dezente Säure.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Peru',
    (SELECT id FROM public.regions WHERE country = 'Peru' AND region_name = 'Chanchamayo'),
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 16. Jorge Rojas & Milton Sánchez
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Jorge Rojas & Milton Sánchez',
    'jorge-rojas-milton-sanchez',
    'Symphonie der Sinne mit Honig, Pfirsich und blumigem Finale',
    'Eine Symphonie der Sinne, die flüssigen Honig mit lebhaften Pfirsicharomen verbindet und durch geheimnisvolle Noten gewürzt wird, abgerundet durch ein blumiges Finale und belebt durch die frische Säure reifer Grapefruits.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 17. Sugarcane Decaf Mauricio Osorio
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Sugarcane Decaf Mauricio Osorio',
    'sugarcane-decaf-mauricio-osorio',
    'Natürlich entkoffeiniert mit Aromen von Honig, Karamell und Milchschokolade',
    'Ein natürlich entkoffeinierter Kaffee aus Kolumbien, Finca Samaria, von Farmer Mauricio Osorio. Angebaut auf 1.600 m Höhe, Varietät Tabi. Fermentation 24 Stunden im Fruchtfleisch, Verarbeitung mit EA Sugarcane Decaf Verfahren, Trocknung 12 Tage auf Trocknungsbetten. SCA-Score: 85 Punkte. Aromen von Honig, Karamell und Milchschokolade. Seidiger und ausgewogener Körper, langer, süßer und samtiger Nachklang, milde und harmonische Säure.',
    NULL,
    'EA Sugarcane Decaf',
    'Tabi',
    1600,
    1600,
    'Kolumbien',
    (SELECT id FROM public.regions WHERE country = 'Kolumbien' AND region_name = 'Samaria'),
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 18. Rwanda Rugali Honey
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Rwanda Rugali Honey',
    'rwanda-rugali-honey',
    'Symphonie der Sinne mit Honig, Pfirsich und blumigem Finale',
    'Eine Symphonie der Sinne, die flüssigen Honig mit lebhaften Pfirsicharomen verbindet und durch geheimnisvolle Noten gewürzt wird, abgerundet durch ein blumiges Finale und belebt durch die frische Säure reifer Grapefruits.',
    NULL,
    'Honey',
    NULL,
    NULL,
    NULL,
    'Ruanda',
    (SELECT id FROM public.regions WHERE country = 'Ruanda' AND region_name = 'Rugali'),
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 19. Peru Kuelap Especial
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Peru Kuelap Especial',
    'peru-kuelap-especial',
    'Ausgewogener, schokoladiger Kaffee aus hohen Lagen',
    'Peru Villa Rica ist ein ausgewogener, schokoladiger Kaffee, der in hohen Lagen im Chanchamayo-Tal angebaut wird. Er hat einen vollen Körper und eine dezente Säure.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Peru',
    (SELECT id FROM public.regions WHERE country = 'Peru' AND region_name = 'Chanchamayo'),
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- 20. Honduras Finca Rio Colardo
INSERT INTO public.coffees (
    name,
    slug,
    short_description,
    description,
    roast_level,
    processing_method,
    varietal,
    altitude_min,
    altitude_max,
    country,
    region_id,
    image_url
) VALUES (
    'Honduras Finca Rio Colardo',
    'honduras-finca-rio-colardo',
    'Noten von braunem Zucker, Cashews und Schokolade',
    'Braune Zucker, Cashews und Noten von Schokolade',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Honduras',
    NULL,
    NULL
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    roast_level = EXCLUDED.roast_level,
    processing_method = EXCLUDED.processing_method,
    varietal = EXCLUDED.varietal,
    altitude_min = EXCLUDED.altitude_min,
    altitude_max = EXCLUDED.altitude_max,
    country = EXCLUDED.country,
    region_id = EXCLUDED.region_id,
    image_url = EXCLUDED.image_url,
    updated_at = now();

-- ============================================================
-- Geschmacksnoten-Verknüpfungen
-- ============================================================
-- 
-- HINWEIS: Die folgenden INSERT-Statements müssen angepasst werden,
-- um die tatsächlichen flavor_notes IDs zu verwenden.
-- 
-- Beispiel-Struktur:
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'shiraz-blend' AND f.name IN ('Nüsse', 'Schokolade');
--
-- ============================================================

-- Shiraz Blend: Nüsse, Schokolade
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'shiraz-blend' AND f.name IN ('Nüsse', 'Schokolade');

-- Erlangener Mischung: Nussig, Schokolade, Zitrusfrüchte
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'erlangener-mischung' AND f.name IN ('Nussig', 'Schokolade', 'Zitrusfrüchte');

-- Perse Polis: Kakao, süßlich
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'perse-polis' AND f.name IN ('Kakao', 'süßlich');

-- India Monsooned Malabar: Süß, floral, Schokolade
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'india-monsooned-malabar' AND f.name IN ('Süß', 'floral', 'Schokolade');

-- Ethiopia Yirgacheffe Adado Grade 1: Schwarzer Tee, Brombeere, Blaubeere
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'ethiopia-yirgacheffe-adado-grade-1' AND f.name IN ('Schwarzer Tee', 'Brombeere', 'Blaubeere');

-- México las Chicharras: Süß, floral, Schokolade
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'mexico-las-chicharras' AND f.name IN ('Süß', 'floral', 'Schokolade');

-- Colombia Wilder Lazo Red Tiger: Honig, Pfirsich, blumig, Grapefruit
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'colombia-wilder-lazo-red-tiger' AND f.name IN ('Honig', 'Pfirsich', 'blumig', 'Grapefruit');

-- India Baba Budangiri: Nougat, Haselnuss, Kakao
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'india-baba-budangiri' AND f.name IN ('Nougat', 'Haselnuss', 'Kakao');

-- Kenia Masai AA: Honig, Pfirsich, blumig, Grapefruit
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'kenia-masai-aa' AND f.name IN ('Honig', 'Pfirsich', 'blumig', 'Grapefruit');

-- Sugarcane Decaf Mauricio Osorio: Honig, Karamell, Milchschokolade
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'sugarcane-decaf-mauricio-osorio' AND f.name IN ('Honig', 'Karamell', 'Milchschokolade');

-- Rwanda Rugali Honey: Honig, Pfirsich, blumig, Grapefruit
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'rwanda-rugali-honey' AND f.name IN ('Honig', 'Pfirsich', 'blumig', 'Grapefruit');

-- Peru Kuelap Especial: Schokolade
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'peru-kuelap-especial' AND f.name = 'Schokolade';

-- Honduras Finca Rio Colardo: Brauner Zucker, Cashews, Schokolade
-- INSERT INTO public.coffee_flavor_notes (coffee_id, flavor_id)
-- SELECT c.id, f.id
-- FROM public.coffees c, public.flavor_notes f
-- WHERE c.slug = 'honduras-finca-rio-colardo' AND f.name IN ('Brauner Zucker', 'Cashews', 'Schokolade');

-- ============================================================
-- Zubereitungsmethoden-Verknüpfungen
-- ============================================================
-- 
-- HINWEIS: Die folgenden INSERT-Statements müssen angepasst werden,
-- um die tatsächlichen brew_methods IDs zu verwenden.
-- 
-- Beispiel-Struktur:
-- INSERT INTO public.coffee_brew_methods (coffee_id, brew_id)
-- SELECT c.id, b.id
-- FROM public.coffees c, public.brew_methods b
-- WHERE c.slug = 'mexico-las-chicharras' AND b.name IN ('Siebträger', 'Aeropress', 'Chemex');
--
-- ============================================================

-- México las Chicharras: Herdkocher, Siebträger, Aeropress, Chemex
-- INSERT INTO public.coffee_brew_methods (coffee_id, brew_id)
-- SELECT c.id, b.id
-- FROM public.coffees c, public.brew_methods b
-- WHERE c.slug = 'mexico-las-chicharras' AND b.name IN ('Siebträger', 'Aeropress', 'Chemex');

-- Sugarcane Decaf Mauricio Osorio: Filterkaffee, French Press, Siebträgermaschine
-- INSERT INTO public.coffee_brew_methods (coffee_id, brew_id)
-- SELECT c.id, b.id
-- FROM public.coffees c, public.brew_methods b
-- WHERE c.slug = 'sugarcane-decaf-mauricio-osorio' AND b.name IN ('Filterkaffee', 'French Press', 'Siebträger');

-- ============================================================
-- ENDE DES IMPORTS
-- ============================================================

