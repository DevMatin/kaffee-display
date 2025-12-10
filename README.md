# Kaffee Katalog

Next.js 14 App für die Verwaltung und Darstellung eines Specialty Coffee Katalogs.

## Features

- **Katalog-Ansicht**: Durchstöbern von Kaffees mit Filter und Suche
- **Detail-Ansicht**: Vollständige Informationen zu jedem Kaffee
- **Regionen**: Übersicht und Details zu Kaffee-Regionen
- **Admin-Bereich**: Vollständiges CRUD für Kaffees, Regionen, Aromen und Zubereitungen
- **Logging**: Umfassendes Logging-System für Debugging

## Setup

1. Dependencies installieren:
```bash
npm install
```

2. Environment Variables einrichten:
Erstelle eine `.env.local` Datei:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PASSWORD=starkes_admin_passwort
```

Der Adminbereich prüft das Passwort gegen `ADMIN_PASSWORD`, setze also in allen Umgebungen dasselbe sichere Geheimnis.

3. Datenbank-Schema einrichten:
Führe das SQL-Schema aus `Supabase/schema.md` in deiner Supabase-Datenbank aus.

4. Development Server starten:
```bash
npm run dev
```

Die App läuft dann auf [http://localhost:3000](http://localhost:3000)

## Projektstruktur

```
/app
  /(catalog)        # Katalog-Seiten (öffentlich)
  /(admin)          # Admin-Bereich
/components
  /ui               # Basis-Komponenten
  /catalog          # Katalog-Komponenten
  /admin            # Admin-Komponenten
  /layout           # Layout-Komponenten
/lib
  /supabase.ts      # Supabase Client
  /types.ts         # TypeScript Interfaces
  /queries.ts       # Read-Queries
  /mutations.ts     # Write-Queries
  /logger.ts        # Logging-System
/styles
  /globals.css      # Design System
```

## Design System

Das Design System verwendet CSS Variables für alle Farben, Spacing und andere Design-Tokens. Siehe `styles/globals.css` für Details.

## Logging

Das Logging-System loggt automatisch alle Datenbank-Queries mit Timing-Informationen. In Development-Mode werden alle Logs in der Konsole ausgegeben.


