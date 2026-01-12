-- Prüfe welche image_urls in der Datenbank gespeichert sind
-- Führe diese Query aus um zu sehen, welche URLs aktuell gespeichert sind

SELECT 
    id,
    name,
    image_url,
    CASE 
        WHEN image_url LIKE '%supabase.co%' THEN '✅ Supabase URL'
        WHEN image_url LIKE '%example.com%' THEN '❌ Alte Mockup URL'
        WHEN image_url LIKE '%amir-kaffeemann.de%' THEN '⚠️ Externe URL'
        WHEN image_url IS NULL OR image_url = '' THEN '❌ Kein Bild'
        ELSE '❓ Andere URL'
    END as url_status,
    created_at,
    updated_at
FROM public.coffees
ORDER BY updated_at DESC;




