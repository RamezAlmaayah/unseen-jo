BEGIN TRANSACTION READ ONLY;
SELECT jsonb_build_object(
'project','dkhwwvoplhfjccvjegty',
'places',(select coalesce(jsonb_agg(to_jsonb(p) order by id),'[]'::jsonb) from public.places p),
'images',(select coalesce(jsonb_agg(to_jsonb(i) order by id),'[]'::jsonb) from public.place_images i),
'roles',(select coalesce(jsonb_agg(to_jsonb(r) order by user_id),'[]'::jsonb) from public.user_roles r),
'objects',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'bucket_id',bucket_id) order by id),'[]'::jsonb) from storage.objects),
'translations',(select coalesce(jsonb_agg(to_jsonb(t) order by place_id,locale),'[]'::jsonb) from public.place_translations t),
'translation_rls',(select relrowsecurity from pg_class where oid='public.place_translations'::regclass)
) as snapshot;
COMMIT;

BEGIN TRANSACTION READ ONLY;
SELECT jsonb_build_object(
'checked_at',now(),
'policies',(select jsonb_agg(to_jsonb(p) order by schemaname,tablename,policyname) from pg_policies p where schemaname in ('public','storage')),
'table_grants',(select jsonb_agg(to_jsonb(g) order by table_schema,table_name,grantee,privilege_type) from information_schema.role_table_grants g where table_schema in ('public','storage') and grantee in ('anon','authenticated')),
'rls',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'table',c.relname,'enabled',c.relrowsecurity,'forced',c.relforcerowsecurity) order by n.nspname,c.relname) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','storage') and c.relkind='r'),
'buckets',(select jsonb_agg(jsonb_build_object('id',id,'name',name,'public',public,'file_size_limit',file_size_limit,'allowed_mime_types',allowed_mime_types) order by id) from storage.buckets)
) as access_snapshot;
COMMIT;
