-- =============================================================================
-- QUERIES DE AUDITORIA DE SEGURANÇA DO BANCO DE DADOS (SUPABASE POSTGRESQL)
-- =============================================================================

-- 1. TABELAS NO SCHEMA PUBLIC SEM ROW LEVEL SECURITY (RLS) HABILITADO
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND rowsecurity = false
ORDER BY tablename;

-- 2. TABELAS COM RLS HABILITADO, MAS SEM NENHUMA POLICY CONFIGURADA
SELECT 
  t.schemaname,
  t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
GROUP BY t.schemaname, t.tablename
HAVING count(p.policyname) = 0
ORDER BY t.tablename;

-- 3. POLICIES COM 'USING (true)' OU PERMISSIVAS DEMAIS (SELECT/INSERT/UPDATE/DELETE IRRESTRITO)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual = 'true' 
    OR with_check = 'true'
    OR 'anon' = ANY(roles)
    OR 'public' = ANY(roles)
  )
ORDER BY tablename, policyname;

-- 4. VIEWS NO SCHEMA PUBLIC SEM 'security_invoker = true' (QUE IGNORAM RLS)
SELECT 
  c.relname AS view_name,
  pg_catalog.pg_get_userbyid(c.relowner) AS view_owner,
  CASE 
    WHEN c.reloptions IS NULL THEN 'DEFAULT (SECURITY DEFINER - RISCO DE BYPASS DE RLS)'
    WHEN 'security_invoker=true' = ANY(c.reloptions) THEN 'SEGURO (SECURITY INVOKER)'
    ELSE 'RISCO (SECURITY DEFINER)'
  END AS status_invoker
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind IN ('v', 'm')
ORDER BY c.relname;

-- 5. FUNÇÕES 'SECURITY DEFINER' SEM 'search_path' FIXO (VULNERABILIDADE DE SEARCH PATH HIJACKING)
SELECT 
  p.proname AS function_name,
  pg_catalog.pg_get_userbyid(p.proowner) AS function_owner,
  p.prosecdef AS is_security_definer,
  p.proconfig AS configuration_search_path
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND (p.proconfig IS NULL OR NOT ARRAY['search_path=%']::text[] && p.proconfig)
ORDER BY p.proname;

-- 6. GRANTS EXCESSIVOS PARA OS PAPÉIS 'anon' E 'authenticated' NO SCHEMA PUBLIC
SELECT 
  table_schema,
  table_name,
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'PUBLIC')
  AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES')
ORDER BY table_name, grantee, privilege_type;

-- 7. BUCKETS DE STORAGE SEM POLICIES DE PROTEÇÃO EM storage.objects
SELECT 
  b.id AS bucket_id,
  b.name AS bucket_name,
  b.public AS is_public,
  count(p.policyname) AS total_policies
FROM storage.buckets b
LEFT JOIN pg_policies p ON p.schemaname = 'storage' 
  AND p.tablename = 'objects' 
  AND p.qual LIKE '%' || b.id || '%'
GROUP BY b.id, b.name, b.public
ORDER BY b.name;
