-- Storage Policies für den 'images' Bucket
-- Führe diese Queries in der Supabase SQL Editor aus
-- WICHTIG: Kopiere nur die SQL-Queries (ohne Kommentare und Markdown-Syntax)

-- ============================================
-- OPTION 1: Öffentlicher Zugriff (OHNE Authentifizierung)
-- ============================================
-- Nutze diese Policies wenn du KEINE Authentifizierung verwendest:

-- Alle Policies löschen falls sie existieren
DROP POLICY IF EXISTS "Public Access All" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Öffentlicher Zugriff für ALLE Operationen (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Public Access All"
ON storage.objects FOR ALL
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- ============================================
-- OPTION 2: Mit Authentifizierung (nur wenn du Auth verwendest)
-- ============================================
-- Falls du Authentifizierung verwendest, kommentiere Option 1 aus
-- und nutze stattdessen diese Policies:

-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'images');
--
-- CREATE POLICY "Authenticated users can upload"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'images');
--
-- CREATE POLICY "Authenticated users can update"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'images')
-- WITH CHECK (bucket_id = 'images');
--
-- CREATE POLICY "Authenticated users can delete"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'images');

