-- Local activation preparation only. Never executed against hosted data by the audit.
-- A serialized counter avoids count(*) snapshot races when two admins are removed.
lock table public.user_roles in share row exclusive mode;
create table unseen_private.admin_safety_count(
 singleton boolean primary key default true check(singleton),
 total bigint not null check(total>=0)
);
insert into unseen_private.admin_safety_count(singleton,total) select true,count(*) from public.user_roles where role='admin';
revoke all on unseen_private.admin_safety_count from public,anon,authenticated,service_role;
create function unseen_private.guard_last_admin() returns trigger language plpgsql security definer set search_path='' as $$
declare delta integer:=0;
begin
 if tg_op='TRUNCATE' then raise exception 'Role truncation is prohibited'; end if;
 if tg_op in ('DELETE','UPDATE') and old.role='admin' then delta:=delta-1; end if;
 if tg_op in ('INSERT','UPDATE') and new.role='admin' then delta:=delta+1; end if;
 if delta=-1 then
  update unseen_private.admin_safety_count set total=total-1 where singleton and total>1;
  if not found then raise exception 'The last administrator cannot be removed'; end if;
 elsif delta=1 then
  update unseen_private.admin_safety_count set total=total+1 where singleton;
  if not found then raise exception 'Administrator safety state missing'; end if;
 end if;
 return null;
end $$;
revoke all on function unseen_private.guard_last_admin() from public,anon,authenticated,service_role;
create trigger guard_last_admin after insert or update or delete on public.user_roles for each row execute function unseen_private.guard_last_admin();
create trigger guard_role_truncate before truncate on public.user_roles for each statement execute function unseen_private.guard_last_admin();

create or replace function public.uj_request_account_deletion(target uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 lock table public.user_roles in share row exclusive mode;
 if exists(select 1 from public.user_roles where user_id=target and role='admin') then raise exception 'Administrator accounts require a separate reviewed procedure'; end if;
 if not exists(select 1 from auth.users where id=target) then raise exception 'Account unavailable'; end if;
 insert into public.account_privacy_requests(user_id) values(target)
 on conflict(user_id) where status <> 'completed' do update set user_id=excluded.user_id
 returning jsonb_build_object('id',id,'status',status,'created_at',created_at) into result;
 return result;
end $$;
revoke all on function public.uj_request_account_deletion(uuid) from public,anon,authenticated;
grant execute on function public.uj_request_account_deletion(uuid) to service_role;

-- Explicit allowlists: future private columns must not silently enter an export.
create or replace function public.uj_export_account_data() returns jsonb language sql stable security invoker set search_path='' as $$
select jsonb_build_object('generated_at',now(),
'profile',(select to_jsonb(r) from (select id,display_name,avatar_path,preferred_language,created_at,updated_at from public.profiles where id=auth.uid()) r),
'preferences',(select to_jsonb(r) from (select user_id,starting_city,available_minutes,budget_min_jod,budget_max_jod,travel_group,transportation,discovery_settings,created_at,updated_at from public.user_preferences where user_id=auth.uid()) r),
'interests',coalesce((select jsonb_agg(to_jsonb(r)) from (select user_id,category_id,created_at from public.user_preference_categories where user_id=auth.uid()) r),'[]'::jsonb),
'saved_places',coalesce((select jsonb_agg(to_jsonb(r)) from (select user_id,place_id,created_at from public.saved_places where user_id=auth.uid()) r),'[]'::jsonb),
'visits',coalesce((select jsonb_agg(to_jsonb(r)) from (select user_id,place_id,visited_on,created_at from public.user_visited_places where user_id=auth.uid()) r),'[]'::jsonb),
'recommendation_history',coalesce((select jsonb_agg(to_jsonb(r)) from (select user_id,event_id,place_id,created_at from public.user_discovery_history where user_id=auth.uid()) r),'[]'::jsonb),
'feedback',coalesce((select jsonb_agg(to_jsonb(r)) from (select id,user_id,place_id,reaction,comment,created_at,updated_at from public.recommendation_feedback where user_id=auth.uid()) r),'[]'::jsonb),
'privacy_requests',coalesce((select jsonb_agg(to_jsonb(r)) from (select id,user_id,status,created_at,completed_at from public.account_privacy_requests where user_id=auth.uid()) r),'[]'::jsonb),
'avatar_inventory',coalesce((select jsonb_agg(jsonb_build_object('bucket',bucket_id,'name',name)) from storage.objects where bucket_id='profile-avatars' and split_part(name,'/',1)=auth.uid()::text),'[]'::jsonb)) where auth.uid() is not null;
$$;
revoke all on function public.uj_export_account_data() from public,anon;
grant execute on function public.uj_export_account_data() to authenticated;
