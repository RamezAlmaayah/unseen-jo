-- Read-only baseline for the owner's protected backup/recovery record.
-- Run with native psql, --no-psqlrc and ON_ERROR_STOP=1, writing to a PRIVATE file.
-- No user emails, hashes, tokens, passwords or object contents are selected.
-- This is not a backup or a substitute for actual restore/data verification.
begin read only;

select current_setting('server_version') as server_version;
select extname,extversion from pg_extension order by extname;
select nspname from pg_namespace
where nspname not like 'pg_%' and nspname <> 'information_schema'
order by nspname;

-- psql executes only generated COUNT SELECTs, over identifiers quoted by format.
-- No instructions or SQL from table contents are used.
select format('select %L as relation_name, count(*) as row_count from %I.%I;',
              n.nspname || '.' || c.relname,n.nspname,c.relname)
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where c.relkind='r'
  and n.nspname in ('public','unseen_private','auth','storage','supabase_migrations','vault')
order by n.nspname,c.relname
\gexec

select id,slug,status from public.places order by id;
select role,count(*) from public.user_roles group by role order by role;

select n.nspname,c.relname,c.relrowsecurity,c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where c.relkind in ('r','p')
  and n.nspname in ('public','unseen_private','auth','storage')
order by n.nspname,c.relname;

select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check
from pg_policies where schemaname in ('public','unseen_private','storage')
order by schemaname,tablename,policyname;

select table_schema,table_name,grantee,privilege_type
from information_schema.role_table_grants
where table_schema in ('public','unseen_private','storage')
order by table_schema,table_name,grantee,privilege_type;

select n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef,md5(pg_get_functiondef(p.oid)) as definition_fingerprint
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in ('public','unseen_private') and p.prokind='f'
order by n.nspname,p.proname,pg_get_function_identity_arguments(p.oid);

select n.nspname,c.relname,t.tgname,pg_get_triggerdef(t.oid) as definition
from pg_trigger t join pg_class c on c.oid=t.tgrelid
join pg_namespace n on n.oid=c.relnamespace
where not t.tgisinternal and n.nspname in ('public','unseen_private','auth','storage')
order by n.nspname,c.relname,t.tgname;

commit;
