-- READ ONLY. Execute only after verifying the project identity and region.
-- Inspect any unexpected tables/rows, buckets, policies, functions or migration
-- history before deployment. Counts are estimated; inspect real counts if found.
select current_database(),version();
select n.nspname as schema_name,c.relname as table_name,c.reltuples::bigint as estimated_rows,
  c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where c.relkind in ('r','p') and n.nspname not in ('pg_catalog','information_schema')
order by 1,2;
select extname,extversion,n.nspname as schema_name from pg_extension e
join pg_namespace n on n.oid=e.extnamespace order by 1;
select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies
where schemaname in ('public','storage') order by 1,2,3;
select routine_schema,routine_name,security_type from information_schema.routines
where routine_schema in ('public','unseen_private') order by 1,2;
select id,name,public,file_size_limit,allowed_mime_types from storage.buckets;
select count(*) as auth_user_count from auth.users;
select to_regclass('supabase_migrations.schema_migrations') as migration_history;
-- If migration_history exists, inspect its version/name rows separately.
