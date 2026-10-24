-- READ ONLY; run AFTER the owner manually applies the legal migration.
-- This is schema/seed verification, not proof of an authenticated Admin session.
select d.document_key,d.revision_count,d.lock_version,r.version,
       r.content->'en'->>'title' as english_title,
       r.content->'ar-JO'->>'title' as arabic_title,
       jsonb_array_length(r.content->'en'->'sections') as english_sections,
       jsonb_array_length(r.content->'ar-JO'->'sections') as arabic_sections,
       r.approved_at,r.revoked_at,r.content->'review' as review_checklist
from public.legal_documents d join public.legal_revisions r using(document_key)
order by d.document_key,r.version;
-- Immediately after installation: 2 rows, version 1, 12/14 sections in both
-- languages, no approval/revocation, all review flags false, zero events.
select count(*) as events_before_editor_actions from public.legal_events;
select count(*) as publicly_readable_revisions from public.legal_revisions
where approved_at is not null and revoked_at is null;
select c.relname,c.relrowsecurity,
       has_table_privilege('anon',c.oid,'SELECT') as anon_table_select,
       has_table_privilege('authenticated',c.oid,'SELECT') as authenticated_table_select,
       has_table_privilege('anon',c.oid,'INSERT,UPDATE,DELETE') as anon_any_write
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('legal_documents','legal_revisions','legal_events')
order by c.relname;
select tablename,policyname,roles,cmd,qual,with_check from pg_policies
where schemaname='public' and tablename in ('legal_documents','legal_revisions','legal_events')
order by tablename,policyname;
select n.nspname,p.proname,p.prosecdef as security_definer,
       has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
       has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('admin_legal_state','admin_save_legal_draft','admin_publish_legal','admin_revoke_legal','admin_restore_legal')
order by p.proname;
-- Expected: 5 invoker RPCs, anon_execute false, authenticated_execute true.
-- Authenticated execution still requires a current trusted Admin under RLS.
select count(*) as admins,count(u.id) as existing_auth_identities,
       jsonb_agg(md5(r.user_id::text) order by md5(r.user_id::text)) as identity_fingerprints
from public.user_roles r left join auth.users u on u.id=r.user_id where r.role='admin';
select count(*) as destinations,
       md5(coalesce(string_agg(id::text||':'||slug||':'||status::text,'|' order by id),'')) as id_slug_status_fingerprint
from public.places;
select status,count(*) from public.places group by status order by status;
