-- Prüfe Berechtigungen für die Tabellen
-- Führe diese Queries aus um zu sehen, welche Berechtigungen gesetzt sind

-- Prüfe Grants für alle Tabellen
SELECT 
    grantee, 
    table_name, 
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('coffees', 'regions', 'flavor_notes', 'brew_methods', 'coffee_flavor_notes', 'coffee_brew_methods', 'coffee_images')
ORDER BY table_name, grantee;

-- Prüfe ob anon role Berechtigungen hat
SELECT 
    grantee, 
    table_name, 
    privilege_type
FROM information_schema.role_table_grants 
WHERE grantee = 'anon'
AND table_schema = 'public';


