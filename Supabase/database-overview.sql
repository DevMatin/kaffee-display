-- ============================================
-- VOLLSTÄNDIGE DATENBANK-ÜBERSICHT
-- Zeigt alle Tabellen, Spalten, Beziehungen und Constraints
-- ============================================

-- ============================================
-- 1. ALLE TABELLEN MIT SPALTEN
-- ============================================
SELECT 
    '=== TABELLEN-ÜBERSICHT ===' as info;

SELECT 
    t.table_name as "Tabelle",
    c.column_name as "Spalte",
    c.data_type as "Datentyp",
    c.character_maximum_length as "Max. Länge",
    c.is_nullable as "NULL erlaubt",
    c.column_default as "Standardwert",
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY → ' || fk.referenced_table || '(' || fk.referenced_column || ')'
        ELSE ''
    END as "Constraint"
FROM 
    information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name
    LEFT JOIN (
        SELECT ku.table_name, ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku 
            ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
    ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
    LEFT JOIN (
        SELECT 
            ku.table_name,
            ku.column_name,
            ccu.table_name AS referenced_table,
            ccu.column_name AS referenced_column
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS ku
            ON tc.constraint_name = ku.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
    ) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE 
    t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY 
    t.table_name, 
    c.ordinal_position;

-- ============================================
-- 2. FOREIGN KEY BEZIEHUNGEN (DETAILIERT)
-- ============================================
SELECT 
    '=== FOREIGN KEY BEZIEHUNGEN ===' as info;

SELECT
    tc.table_name as "Von Tabelle",
    kcu.column_name as "Von Spalte",
    ccu.table_name as "Zu Tabelle",
    ccu.column_name as "Zu Spalte",
    tc.constraint_name as "Constraint Name",
    rc.delete_rule as "ON DELETE",
    rc.update_rule as "ON UPDATE"
FROM 
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY 
    tc.table_name, 
    kcu.column_name;

-- ============================================
-- 3. BEZIEHUNGS-DIAGRAMM (TEXT-BASIERT)
-- ============================================
SELECT 
    '=== BEZIEHUNGS-DIAGRAMM ===' as info;

WITH relationships AS (
    SELECT
        tc.table_name as from_table,
        ccu.table_name as to_table,
        kcu.column_name as from_column,
        ccu.column_name as to_column
    FROM 
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
    WHERE 
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
)
SELECT 
    from_table || ' ──[' || from_column || ']──> ' || to_table || '(' || to_column || ')' as "Beziehung"
FROM relationships
ORDER BY from_table, to_table;

-- ============================================
-- 4. ALLE INDIZES
-- ============================================
SELECT 
    '=== INDIZES ===' as info;

SELECT
    t.relname as "Tabelle",
    i.relname as "Index Name",
    a.attname as "Spalte",
    am.amname as "Index Typ",
    idx.indisunique as "Eindeutig",
    idx.indisprimary as "Primary Key"
FROM 
    pg_class t
    JOIN pg_index idx ON t.oid = idx.indrelid
    JOIN pg_class i ON i.oid = idx.indexrelid
    JOIN pg_am am ON i.relam = am.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(idx.indkey)
WHERE 
    t.relkind = 'r'
    AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY 
    t.relname, 
    i.relname, 
    a.attnum;

-- ============================================
-- 5. UNIQUE CONSTRAINTS
-- ============================================
SELECT 
    '=== UNIQUE CONSTRAINTS ===' as info;

SELECT
    tc.table_name as "Tabelle",
    tc.constraint_name as "Constraint Name",
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as "Spalten"
FROM 
    information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
WHERE 
    tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
GROUP BY 
    tc.table_name, 
    tc.constraint_name
ORDER BY 
    tc.table_name;

-- ============================================
-- 6. CHECK CONSTRAINTS
-- ============================================
SELECT 
    '=== CHECK CONSTRAINTS ===' as info;

SELECT
    tc.table_name as "Tabelle",
    tc.constraint_name as "Constraint Name",
    cc.check_clause as "Bedingung"
FROM 
    information_schema.table_constraints tc
    JOIN information_schema.check_constraints cc
        ON tc.constraint_name = cc.constraint_name
WHERE 
    tc.constraint_type = 'CHECK'
    AND tc.table_schema = 'public'
ORDER BY 
    tc.table_name, 
    tc.constraint_name;

-- ============================================
-- 7. TRIGGER
-- ============================================
SELECT 
    '=== TRIGGER ===' as info;

SELECT
    t.trigger_name as "Trigger Name",
    t.event_object_table as "Tabelle",
    t.event_manipulation as "Event",
    t.action_timing as "Timing",
    t.action_statement as "Aktion"
FROM 
    information_schema.triggers t
WHERE 
    t.trigger_schema = 'public'
ORDER BY 
    t.event_object_table, 
    t.trigger_name;

-- ============================================
-- 8. FUNKTIONEN
-- ============================================
SELECT 
    '=== FUNKTIONEN ===' as info;

SELECT
    p.proname as "Funktionsname",
    pg_get_function_result(p.oid) as "Rückgabetyp",
    pg_get_function_arguments(p.oid) as "Parameter"
FROM 
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE 
    n.nspname = 'public'
ORDER BY 
    p.proname;

-- ============================================
-- 9. TABELLEN-STATISTIKEN
-- ============================================
SELECT 
    '=== TABELLEN-STATISTIKEN ===' as info;

SELECT
    schemaname as "Schema",
    tablename as "Tabelle",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "Gesamtgröße",
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as "Tabellengröße",
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as "Indexgröße",
    n_live_tup as "Zeilen (geschätzt)"
FROM 
    pg_stat_user_tables
WHERE 
    schemaname = 'public'
ORDER BY 
    pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 10. ZUSAMMENFASSUNG: TABELLEN-HIERARCHIE
-- ============================================
SELECT 
    '=== TABELLEN-HIERARCHIE (ZENTRALE TABELLEN) ===' as info;

-- Zeigt die zentrale Struktur: coffees als Haupttabelle
SELECT 
    'regions' as "Ebene 1",
    'coffees' as "Ebene 2",
    'Junction-Tabellen' as "Ebene 3",
    'Referenz-Tabellen' as "Ebene 4"
UNION ALL
SELECT 
    'regions (id, country, region_name, ...)',
    'coffees (id, name, slug, region_id → regions.id, ...)',
    'coffee_flavor_notes (coffee_id → coffees.id, flavor_id → flavor_notes.id)',
    'flavor_notes (id, name, category_id → flavor_categories.id)'
UNION ALL
SELECT 
    '',
    '',
    'coffee_brew_methods (coffee_id → coffees.id, brew_id → brew_methods.id)',
    'brew_methods (id, name)'
UNION ALL
SELECT 
    '',
    '',
    'coffee_processing_methods (coffee_id → coffees.id, processing_method_id → processing_methods.id)',
    'processing_methods (id, name)'
UNION ALL
SELECT 
    '',
    '',
    'coffee_varietals (coffee_id → coffees.id, varietal_id → varietals.id)',
    'varietals (id, name)'
UNION ALL
SELECT 
    '',
    'coffee_images (coffee_id → coffees.id, ...)',
    '',
    ''
UNION ALL
SELECT 
    '',
    '',
    '',
    'flavor_categories (id, name, level, parent_id → flavor_categories.id) [selbstreferenzierend]';

-- ============================================
-- 11. VISUELLES ER-DIAGRAMM (TEXT)
-- ============================================
SELECT 
    '=== VISUELLES ER-DIAGRAMM ===' as info;

SELECT 
'
┌─────────────────┐
│    regions      │
│  ─────────────  │
│  id (PK)        │
│  country        │
│  region_name    │
│  latitude       │
│  longitude      │
└────────┬────────┘
         │
         │ region_id
         │
         ▼
┌─────────────────┐
│    coffees      │◄──┐
│  ─────────────  │   │
│  id (PK)        │   │
│  name           │   │
│  slug           │   │
│  region_id (FK) │   │
│  ...            │   │
└────────┬────────┘   │
         │            │
         │            │
    ┌────┴────┬───────┴──────┬─────────────┐
    │         │              │             │
    ▼         ▼              ▼             ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│coffee_  │ │coffee_  │ │coffee_  │ │coffee_  │
│flavor_  │ │brew_    │ │process. │ │varietals│
│notes    │ │methods  │ │methods  │ │         │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │          │           │           │
     ▼          ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│flavor_  │ │brew_    │ │process. │ │varietals│
│notes    │ │methods  │ │methods  │ │         │
└────┬────┘ └─────────┘ └─────────┘ └─────────┘
     │
     │ category_id
     ▼
┌─────────────────┐
│flavor_categories│◄──┐
│  ─────────────  │   │
│  id (PK)        │   │
│  name           │   │
│  level          │   │
│  parent_id (FK) │───┘ (selbstreferenzierend)
└─────────────────┘
' as "ER-Diagramm";

-- ============================================
-- ENDE
-- ============================================

