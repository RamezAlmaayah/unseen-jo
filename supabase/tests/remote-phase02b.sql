-- Hosted anonymous RLS checks; fixtures never commit and do not reach HTTP.
begin;
insert into public.places(slug,name,status,is_demo) values
('phase02b-rls-public','Rollback RLS fixture','published',false),
('phase02b-rls-draft','Rollback RLS fixture','draft',false),
('phase02b-rls-archived','Rollback RLS fixture','archived',false);
set local role anon;
do $$
begin
 assert (select count(*)=1 from public.places where slug='phase02b-rls-public'), 'Published record not publicly readable';
 assert (select count(*)=0 from public.places where slug in ('phase02b-rls-draft','phase02b-rls-archived')), 'Unpublished record exposed';
 assert (select count(*)=1 from public.places), 'Imported drafts exposed';
 begin perform id from public.profiles; raise exception 'Private profile accessible'; exception when insufficient_privilege then null; end;
 begin update public.places set name='Intrusion' where slug='phase02b-rls-public'; raise exception 'Public update allowed'; exception when insufficient_privilege then null; end;
 begin insert into public.places(slug,name) values('phase02b-intrusion','Intrusion'); raise exception 'Public insert allowed'; exception when insufficient_privilege then null; end;
end $$;
select jsonb_build_object('passed',6,'checks',jsonb_build_array('published publicly readable','draft and archived hidden','imported drafts hidden','private profiles denied','public updates denied','public inserts denied'),'scope','Hosted PostgreSQL anonymous role; transaction-only fixtures, not hosted HTTP positive content') as hosted_rls_results;
rollback;