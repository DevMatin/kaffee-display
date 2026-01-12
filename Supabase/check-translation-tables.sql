-- Prüfe ob Translation Tables existieren und welche Policies gesetzt sind

-- 1. Check ob Tabellen existieren
select table_name 
from information_schema.tables 
where table_schema = 'public' 
  and table_name like '%_translations'
order by table_name;

-- 2. Check RLS Status
select 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
  and tablename like '%_translations'
order by tablename;

-- 3. Check Policies
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
from pg_policies
where schemaname = 'public'
  and tablename like '%_translations'
order by tablename, policyname;

-- 4. Check Grants/Permissions
select 
  table_name,
  grantee,
  privilege_type
from information_schema.table_privileges
where table_schema = 'public'
  and table_name like '%_translations'
order by table_name, grantee, privilege_type;



