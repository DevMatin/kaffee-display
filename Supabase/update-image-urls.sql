-- SQL Query um zu sehen, welche Kaffees noch alte URLs haben
-- Führe diese Query aus um alle Kaffees mit example.com URLs zu finden

SELECT 
    id,
    name,
    image_url,
    CASE 
        WHEN image_url LIKE '%example.com%' THEN 'Alte URL'
        WHEN image_url LIKE '%supabase.co%' THEN 'Supabase URL'
        WHEN image_url IS NULL OR image_url = '' THEN 'Kein Bild'
        ELSE 'Andere URL'
    END as url_status
FROM public.coffees
ORDER BY created_at DESC;

-- Um alle alten URLs zu löschen (falls du die Bilder neu hochladen willst):
-- UPDATE public.coffees 
-- SET image_url = NULL 
-- WHERE image_url LIKE '%example.com%';




