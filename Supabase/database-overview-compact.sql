-- ============================================
-- KOMPAKTE DATENBANK-ÜBERSICHT
-- Alle Tabellen, Spalten und Beziehungen auf einen Blick
-- ============================================

-- ============================================
-- ALLE TABELLEN MIT SPALTEN UND BEZIEHUNGEN
-- ============================================
SELECT 
    t.table_name as "Tabelle",
    c.column_name as "Spalte",
    c.data_type || 
        CASE 
            WHEN c.character_maximum_length IS NOT NULL 
            THEN '(' || c.character_maximum_length || ')'
            ELSE ''
        END as "Typ",
    CASE 
        WHEN c.is_nullable = 'NO' THEN 'NOT NULL'
        ELSE 'NULL'
    END as "Null",
    COALESCE(c.column_default, '') as "Default",
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PK'
        WHEN fk.referenced_table IS NOT NULL 
        THEN 'FK → ' || fk.referenced_table || '.' || fk.referenced_column
        ELSE ''
    END as "Key"
FROM 
    information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name
    LEFT JOIN (
        SELECT ku.table_name, ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku 
            ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
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
          AND tc.table_schema = 'public'
    ) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE 
    t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY 
    t.table_name, 
    c.ordinal_position;

-- ============================================
-- BEZIEHUNGS-ÜBERSICHT (FOREIGN KEYS)
-- ============================================
SELECT
    tc.table_name as "Von",
    kcu.column_name as "Spalte",
    '→' as "→",
    ccu.table_name as "Zu",
    ccu.column_name as "Spalte",
    rc.delete_rule as "ON DELETE"
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
    ccu.table_name;

-- ============================================
-- TABELLEN-HIERARCHIE
-- ============================================
SELECT 
    'Ebene 1: Basis-Tabellen' as "Kategorie",
    'regions' as "Tabelle",
    'Keine Abhängigkeiten' as "Beziehung"
UNION ALL
SELECT 
    'Ebene 2: Abhängig von Ebene 1',
    'coffees',
    'region_id → regions.id'
UNION ALL
SELECT 
    'Ebene 2: Abhängig von Ebene 1',
    'coffee_images',
    'coffee_id → coffees.id'
UNION ALL
SELECT 
    'Ebene 3: Junction-Tabellen (N:M)',
    'coffee_flavor_notes',
    'coffee_id → coffees.id, flavor_id → flavor_notes.id'
UNION ALL
SELECT 
    'Ebene 3: Junction-Tabellen (N:M)',
    'coffee_brew_methods',
    'coffee_id → coffees.id, brew_id → brew_methods.id'
UNION ALL
SELECT 
    'Ebene 3: Junction-Tabellen (N:M)',
    'coffee_processing_methods',
    'coffee_id → coffees.id, processing_method_id → processing_methods.id'
UNION ALL
SELECT 
    'Ebene 3: Junction-Tabellen (N:M)',
    'coffee_varietals',
    'coffee_id → coffees.id, varietal_id → varietals.id'
UNION ALL
SELECT 
    'Ebene 4: Referenz-Tabellen',
    'flavor_notes',
    'category_id → flavor_categories.id'
UNION ALL
SELECT 
    'Ebene 4: Referenz-Tabellen',
    'brew_methods',
    'Keine Abhängigkeiten'
UNION ALL
SELECT 
    'Ebene 4: Referenz-Tabellen',
    'processing_methods',
    'Keine Abhängigkeiten'
UNION ALL
SELECT 
    'Ebene 4: Referenz-Tabellen',
    'varietals',
    'Keine Abhängigkeiten'
UNION ALL
SELECT 
    'Ebene 4: Referenz-Tabellen (selbstreferenzierend)',
    'flavor_categories',
    'parent_id → flavor_categories.id (selbstreferenzierend)';

