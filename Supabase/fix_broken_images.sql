-- Fix broken image URLs in public.coffees
UPDATE public.coffees
SET image_url = '/icon-192x192.png'
WHERE image_url LIKE '%example.com%' OR image_url LIKE '%amir-kaffeemann.de%';

-- Fix broken image URLs in public.coffee_images
UPDATE public.coffee_images
SET image_url = '/icon-192x192.png'
WHERE image_url LIKE '%example.com%' OR image_url LIKE '%amir-kaffeemann.de%';
