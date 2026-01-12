-- Fix für fehlende Kategorien und Flavor Notes unter "Braune Gewürze"
-- 
-- Problem:
-- - Es fehlt "Braune Gewürze - Pfeffer - Scharf"
-- - Es fehlt "Braune Gewürze - Pfeffer - Pfeffer"  
-- - Es fehlt "Braune Gewürze - Scharf - Scharf"

-- 1. Finde die "Braune Gewürze" Kategorie (Level 2)
WITH braune_gewuerze AS (
  SELECT id, name 
  FROM flavor_categories 
  WHERE name = 'Braune Gewürze' AND level = 2
  LIMIT 1
),
-- 2. Erstelle Level 3 Kategorie "Pfeffer" unter "Braune Gewürze" (falls nicht vorhanden)
pfeffer_category AS (
  INSERT INTO flavor_categories (name, level, parent_id, color_hex)
  SELECT 'Pfeffer', 3, bg.id, '#8B0000'
  FROM braune_gewuerze bg
  WHERE NOT EXISTS (
    SELECT 1 FROM flavor_categories 
    WHERE parent_id = bg.id AND name = 'Pfeffer' AND level = 3
  )
  RETURNING id, name
),
-- 3. Erstelle Level 3 Kategorie "Scharf" unter "Braune Gewürze" (falls nicht vorhanden)
scharf_category AS (
  INSERT INTO flavor_categories (name, level, parent_id, color_hex)
  SELECT 'Scharf', 3, bg.id, '#FF4500'
  FROM braune_gewuerze bg
  WHERE NOT EXISTS (
    SELECT 1 FROM flavor_categories 
    WHERE parent_id = bg.id AND name = 'Scharf' AND level = 3
  )
  RETURNING id, name
),
-- 4. Hole alle Level 3 Kategorien unter "Braune Gewürze" (inkl. neu erstellte)
all_level3_categories AS (
  SELECT fc.id, fc.name
  FROM flavor_categories fc
  JOIN braune_gewuerze bg ON fc.parent_id = bg.id
  WHERE fc.level = 3
  UNION
  SELECT id, name FROM pfeffer_category
  UNION
  SELECT id, name FROM scharf_category
),
-- 5. Aktualisiere oder erstelle Flavor Note "Pfeffer" für "Pfeffer" Kategorie (Level 3 unter Braune Gewürze)
pfeffer_pfeffer_update AS (
  UPDATE flavor_notes fn
  SET category_id = pc.id, color_hex = '#8B0000'
  FROM all_level3_categories pc
  WHERE pc.name = 'Pfeffer'
    AND lower(fn.name) = 'pfeffer'
    AND (fn.category_id IS NULL OR fn.category_id != pc.id)
  RETURNING fn.id, fn.name
),
pfeffer_pfeffer_insert AS (
  INSERT INTO flavor_notes (name, category_id, color_hex)
  SELECT 'Pfeffer', pc.id, '#8B0000'
  FROM all_level3_categories pc
  WHERE pc.name = 'Pfeffer'
    AND NOT EXISTS (
      SELECT 1 FROM flavor_notes WHERE lower(name) = 'pfeffer'
    )
  ON CONFLICT (name) DO NOTHING
  RETURNING id, name
),
-- 6. Aktualisiere Flavor Note "Scharf" für "Scharf" Kategorie (Level 3 unter Braune Gewürze)
-- WICHTIG: Dies muss ZUERST ausgeführt werden, damit "Scharf" unter "Scharf" ist
scharf_scharf_update AS (
  UPDATE flavor_notes fn
  SET category_id = sc.id, color_hex = '#FF4500'
  FROM all_level3_categories sc
  WHERE sc.name = 'Scharf'
    AND lower(fn.name) = 'scharf'
    AND (fn.category_id IS NULL OR fn.category_id != sc.id)
  RETURNING fn.id, fn.name
),
-- 7. Aktualisiere Flavor Note "Scharf" für "Pfeffer" Kategorie (Level 3 unter Braune Gewürze)
-- HINWEIS: Da ein Flavor Note nur eine category_id haben kann, wird dies die vorherige Zuordnung überschreiben
-- Wenn "Scharf" unter "Scharf" bleiben soll, dann sollte dieser Schritt nicht ausgeführt werden
pfeffer_scharf_update AS (
  UPDATE flavor_notes fn
  SET category_id = pc.id, color_hex = '#8B4513'
  FROM all_level3_categories pc
  WHERE pc.name = 'Pfeffer'
    AND lower(fn.name) = 'scharf'
    AND (fn.category_id IS NULL OR fn.category_id != pc.id)
  RETURNING fn.id, fn.name
)
SELECT 
  (SELECT count(*) FROM pfeffer_category) as pfeffer_category_created,
  (SELECT count(*) FROM scharf_category) as scharf_category_created,
  (SELECT count(*) FROM pfeffer_scharf_update) as pfeffer_scharf_note_updated,
  (SELECT count(*) FROM pfeffer_pfeffer_update) + (SELECT count(*) FROM pfeffer_pfeffer_insert) as pfeffer_pfeffer_note_updated,
  (SELECT count(*) FROM scharf_scharf_update) as scharf_scharf_note_updated;
