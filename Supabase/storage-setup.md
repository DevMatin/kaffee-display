# Supabase Storage Setup

## Storage Bucket erstellen

1. Gehe zu deinem Supabase Dashboard
2. Navigiere zu **Storage** im linken Menü
3. Klicke auf **New bucket**
4. Gib den Namen ein: `images`
5. Setze folgende Optionen:
   - **Public bucket**: ✅ Aktiviert (für öffentliche Zugriffe)
   - **File size limit**: 5242880 (5MB) oder größer
   - **Allowed MIME types**: `image/*` (optional, für bessere Sicherheit)

## Storage Policies einrichten

Nach dem Erstellen des Buckets musst du Policies für Uploads und Downloads einrichten:

**WICHTIG:** 
1. Öffne die Datei `storage-policies.sql`
2. Kopiere die SQL-Queries aus **OPTION 1** (ohne die Kommentare)
3. Führe sie im Supabase SQL Editor aus

### Schnellstart (ohne Authentifizierung):

Falls du **KEINE** Authentifizierung verwendest, führe diese Queries aus:

```sql
DROP POLICY IF EXISTS "Public Access All" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

CREATE POLICY "Public Access All"
ON storage.objects FOR ALL
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');
```

Diese Policy erlaubt **allen** (öffentlich) alle Operationen auf dem `images` Bucket.

Siehe `storage-policies.sql` für weitere Optionen.

## Alternative: Öffentlicher Zugriff (für Entwicklung)

Wenn du öffentlichen Zugriff für alle Operationen möchtest (nur für Entwicklung!):

```sql
-- Öffentlicher Zugriff für alle Operationen
CREATE POLICY "Public Access All"
ON storage.objects FOR ALL
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');
```

## Prüfen ob Bucket existiert

Du kannst in der Supabase Console unter Storage prüfen, ob der Bucket `images` existiert und ob die Policies korrekt gesetzt sind.

## WICHTIG: Row Level Security (RLS) deaktivieren

Falls du den Fehler "permission denied for table coffees" bekommst, musst du RLS für die Datenbank-Tabellen deaktivieren.

**Einfachste Lösung:** Führe die Queries aus der Datei `disable-rls.sql` im Supabase SQL Editor aus. Dies deaktiviert RLS für alle Tabellen.

**Alternative:** Falls du RLS aktiv lassen möchtest, nutze `rls-policies.sql` um Policies zu erstellen.

