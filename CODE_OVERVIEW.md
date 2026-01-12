# Code-Übersicht: Kaffee Katalog

## Projekt-Architektur

### Technologie-Stack
- **Framework**: Next.js 16.0.7 (App Router)
- **React**: 19.2.1
- **TypeScript**: 5.4.0
- **Datenbank**: Supabase (PostgreSQL)
- **Internationalisierung**: next-intl 4.5.8
- **Styling**: Tailwind CSS 3.4.0
- **PWA**: @ducanh2912/next-pwa 10.2.9
- **Visualisierung**: D3.js 7.9.0, Leaflet 1.9.4
- **Animation**: Framer Motion 12.23.25

## Projektstruktur

```
/app
  /(admin)              # Admin-Bereich (geschützt)
    /admin              # Admin-Seiten
    /api/login          # Login-API
  /(catalog)            # Öffentlicher Katalog
  /[locale]             # Lokalisierte Routen
    /(catalog)          # Katalog-Seiten mit i18n
  /api                  # API-Routen
    /admin              # Admin-APIs
    /chat               # Chat-API
    /import-csv         # CSV-Import
    /login              # Login
    /logout             # Logout
  /layout.tsx           # Root Layout
  /manifest.ts          # PWA Manifest
  /offline              # Offline-Seite

/components
  /admin                # Admin-Komponenten
    AdminSidebar.tsx
    CoffeeForm.tsx
    CoffeeTable.tsx
    RegionForm.tsx
    RegionTable.tsx
    FlavorNoteForm.tsx
    FlavorNoteTable.tsx
    FlavorCategoryForm.tsx
    FlavorCategoryTable.tsx
    BrewMethodForm.tsx
    BrewMethodTable.tsx
    CSVImportForm.tsx
  /catalog              # Katalog-Komponenten
    CoffeeCard.tsx
    CoffeeListClient.tsx
    CoffeeChat.tsx
    FilterBar.tsx
    FlavorWheel.tsx
    D3FlavorWheel.tsx
    FlavorWheelSection.tsx
    RegionCard.tsx
    RegionMap.tsx
    AltitudeDisplay.tsx
  /ui                   # Basis-UI-Komponenten
    Button.tsx
    Card.tsx
    Badge.tsx
    Input.tsx
    Select.tsx
    Textarea.tsx
    Loading.tsx
    SafeImage.tsx
    LanguageSwitcher.tsx
  /layout               # Layout-Komponenten
    Header.tsx
    Footer.tsx
    PageContainer.tsx
  ThemeProvider.tsx
  ErrorBoundary.tsx

/lib
  supabase.ts           # Supabase Client (anon + admin)
  types.ts              # TypeScript Interfaces
  queries.ts            # Read-Queries (getCoffees, getRegions, etc.)
  mutations.ts          # Write-Queries (createCoffee, updateCoffee, etc.)
  admin-auth.ts         # Admin-Authentifizierung
  csv-import.ts         # CSV-Import-Logik
  i18n-utils.ts         # i18n-Helper
  logger.ts             # Logging-System
  storage.ts            # Supabase Storage-Helper

/messages               # i18n-Übersetzungen
  de.json
  en.json

/Supabase               # Datenbank-Skripte
  schema.md             # Datenbank-Schema
  *.sql                 # Migrations & Setup-Skripte
```

## Kern-Features

### 1. Katalog-System
- **Kaffee-Übersicht**: Liste aller Kaffees mit Filterung
- **Kaffee-Details**: Vollständige Informationen zu jedem Kaffee
- **Regionen**: Übersicht und Details zu Kaffee-Regionen
- **Filter**: Suche, Region, Röstgrad, Zubereitungsmethode
- **Flavor Wheel**: Interaktive Aromen-Rad-Visualisierung (D3.js)

### 2. Admin-Bereich
- **CRUD-Operationen** für:
  - Kaffees
  - Regionen
  - Aromen (Flavor Notes)
  - Aromen-Kategorien
  - Zubereitungsmethoden (Brew Methods)
- **CSV-Import**: Bulk-Import von Kaffee-Daten
- **Bild-Upload**: Supabase Storage Integration
- **Passwort-geschützt**: Admin-Authentifizierung

### 3. Internationalisierung
- **Sprachen**: Deutsch (Standard), Englisch
- **Lokalisierung**: Alle Texte, Kaffee-Beschreibungen, Regionen
- **URL-Struktur**: `/[locale]/kaffees/[slug]`
- **Middleware**: Automatische Locale-Erkennung

### 4. PWA-Funktionalität
- **Service Worker**: Offline-Funktionalität
- **Caching-Strategien**:
  - HTML: NetworkFirst
  - Bilder: CacheFirst
  - API: NetworkFirst mit Timeout
- **Offline-Seite**: Fallback bei fehlender Verbindung

### 5. Chat-Feature
- **Barista Chat**: KI-gestützte Kaffee-Empfehlungen
- **OpenAI Integration**: GPT-basierte Beratung
- **Präferenzen**: Geschmack, Röstgrad, Zubereitung

## Datenmodell

### Haupt-Entitäten

#### Coffee
```typescript
- id: uuid
- name: string
- slug: string (unique)
- short_description: string
- description: string
- roast_level: string
- processing_method: string
- varietal: string
- altitude_min/max: number
- country: string
- region_id: uuid (FK)
- image_url: string
- Commerce-Felder: sku, price, stock, etc.
- Relations: regions[], flavor_notes[], brew_methods[], etc.
```

#### Region
```typescript
- id: uuid
- country: string
- region_name: string
- latitude/longitude: number
- emblem_url: string
- description: string
```

#### FlavorNote
```typescript
- id: uuid
- name: string
- icon_url: string
- description: string
- category_id: uuid (FK)
- color_hex: string
```

#### FlavorCategory
```typescript
- id: uuid
- name: string
- level: number (1-3)
- parent_id: uuid (FK, hierarchisch)
- color_hex: string
```

#### BrewMethod
```typescript
- id: uuid
- name: string
- icon_url: string
```

### Relations
- `coffee_regions`: Many-to-Many (Coffee ↔ Region)
- `coffee_flavor_notes`: Many-to-Many (Coffee ↔ FlavorNote)
- `coffee_brew_methods`: Many-to-Many (Coffee ↔ BrewMethod)
- `coffee_processing_methods`: Many-to-Many
- `coffee_varietals`: Many-to-Many

### Translation-Tabellen
Alle Haupt-Entitäten haben Translation-Tabellen:
- `coffees_translations`
- `regions_translations`
- `flavor_notes_translations`
- `flavor_categories_translations`
- `brew_methods_translations`
- `processing_methods_translations`
- `varietals_translations`

## API-Routen

### Öffentliche APIs
- `GET /api/chat` - Chat-API für Kaffee-Empfehlungen
- `POST /api/import-csv` - CSV-Import (Admin)

### Admin-APIs
- `POST /api/login` - Admin-Login
- `POST /api/logout` - Admin-Logout
- `POST /api/admin/generate-coffee-content` - KI-generierte Inhalte

## Datenbank-Queries

### Read-Queries (`lib/queries.ts`)
- `getCoffees(locale)` - Alle Kaffees mit Relations
- `getCoffeeBySlug(slug, locale)` - Kaffee nach Slug
- `getCoffeeById(id, locale)` - Kaffee nach ID
- `getRegions(locale)` - Alle Regionen
- `getRegionById(id, locale)` - Region nach ID
- `getFlavorNotes(locale)` - Alle Aromen
- `getFlavorCategories(locale)` - Alle Aromen-Kategorien
- `getFlavorCategoryById(id, locale)` - Aromen-Kategorie nach ID
- `getBrewMethods(locale)` - Alle Zubereitungsmethoden
- `getFlavorWheel(locale)` - Flavor Wheel Struktur

### Write-Queries (`lib/mutations.ts`)
- `createCoffee(data, regionIds)` - Kaffee erstellen
- `updateCoffee(id, data, regionIds)` - Kaffee aktualisieren
- `deleteCoffee(id)` - Kaffee löschen
- `manageCoffeeRegions(coffeeId, regionIds)` - Regionen verwalten
- `manageCoffeeFlavorNotes(coffeeId, flavorNoteIds)` - Aromen verwalten
- `manageCoffeeBrewMethods(coffeeId, brewMethodIds)` - Zubereitungen verwalten
- CRUD für Region, FlavorNote, FlavorCategory, BrewMethod

## Komponenten-Architektur

### Admin-Komponenten
- **CoffeeForm**: Umfassendes Formular für Kaffee-CRUD
- **CoffeeTable**: Tabelle mit Sortierung und Aktionen
- **RegionForm/Table**: Region-Verwaltung
- **FlavorNoteForm/Table**: Aromen-Verwaltung
- **FlavorCategoryForm/Table**: Aromen-Kategorien-Verwaltung
- **BrewMethodForm/Table**: Zubereitungsmethoden-Verwaltung
- **CSVImportForm**: CSV-Import-Interface
- **AdminSidebar**: Navigation im Admin-Bereich

### Katalog-Komponenten
- **CoffeeCard**: Kaffee-Karte für Listen
- **CoffeeListClient**: Client-seitige Liste mit Filterung
- **FilterBar**: Such- und Filter-Interface
- **CoffeeChat**: Chat-Interface für Empfehlungen
- **FlavorWheel**: Interaktives Aromen-Rad (D3.js)
- **RegionMap**: Karte mit Leaflet
- **RegionCard**: Region-Karte
- **AltitudeDisplay**: Höhen-Anzeige

### UI-Komponenten
- **Button**: Styled Button mit Varianten
- **Card**: Container-Komponente
- **Badge**: Badge/Label-Komponente
- **Input/Select/Textarea**: Form-Elemente
- **Loading**: Loading-Spinner
- **SafeImage**: Bild-Komponente mit Fallback
- **LanguageSwitcher**: Sprach-Umschalter

## Logging-System

Das Logging-System (`lib/logger.ts`) protokolliert:
- Alle Datenbank-Queries mit Timing
- Fehler mit Kontext
- Debug-Informationen (nur Development)

## Authentifizierung

- **Admin-Auth**: Passwort-basiert (`ADMIN_PASSWORD` Env-Variable)
- **Session-Management**: Cookie-basiert
- **Middleware**: Route-Protection für Admin-Bereich

## Storage

- **Supabase Storage**: Für Bilder (Kaffees, Regionen, Icons)
- **Helper-Funktionen**: Upload, Delete, URL-Generierung

## Konfiguration

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
OPENAI_API_KEY (für Chat)
```

### Next.js Config
- **PWA**: Service Worker, Caching-Strategien
- **i18n**: next-intl Integration
- **Images**: Remote Patterns für Supabase & externe Domains

## Design System

- **CSS Variables**: Zentrale Design-Tokens in `styles/globals.css`
- **Tailwind CSS**: Utility-First Styling
- **Dark Mode**: Theme-Switching Support
- **Responsive**: Mobile-First Design

## Performance

- **Server Components**: Next.js App Router
- **Image Optimization**: Next.js Image Component
- **Caching**: PWA-Caching für statische Assets
- **Query-Optimierung**: Effiziente Supabase-Queries mit Relations

## Deployment

- **Vercel**: Konfiguration in `vercel.json`
- **PWA**: Manifest & Service Worker
- **Environment**: Production/Development-Unterschiede

## Wichtige Dateien

- `middleware.ts`: i18n-Routing
- `i18n.ts`: i18n-Konfiguration
- `next.config.js`: Next.js & PWA-Config
- `tailwind.config.ts`: Tailwind-Konfiguration
- `tsconfig.json`: TypeScript-Konfiguration
