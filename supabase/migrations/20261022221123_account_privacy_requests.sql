-- Prepared locally only. No hosted user is deleted by installing this migration.
create table public.account_privacy_requests(
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete set null,
 status text not null default 'pending' check(status in ('pending','processing','completed')),
 created_at timestamptz not null default now(),
 completed_at timestamptz
);
create unique index privacy_one_open_request on public.account_privacy_requests(user_id) where status <> 'completed';
alter table public.account_privacy_requests enable row level security;
revoke all on public.account_privacy_requests from public,anon,authenticated;
grant select on public.account_privacy_requests to authenticated;
grant all on public.account_privacy_requests to service_role;
create policy privacy_owner_read on public.account_privacy_requests for select to authenticated using(user_id=(select auth.uid()));

create function public.uj_request_account_deletion(target uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not exists(select 1 from auth.users where id=target) then raise exception 'Account unavailable'; end if;
 insert into public.account_privacy_requests(user_id) values(target)
 on conflict(user_id) where status <> 'completed' do update set user_id=excluded.user_id
 returning jsonb_build_object('id',id,'status',status,'created_at',created_at) into result;
 return result;
end $$;
revoke all on function public.uj_request_account_deletion(uuid) from public,anon,authenticated;
grant execute on function public.uj_request_account_deletion(uuid) to service_role;

-- Service-only, explicit reviewed request ID; no arbitrary user ID deletion API.
-- Storage files must first be removed through Storage API, never SQL metadata deletion.
create function public.uj_fulfill_account_deletion(request_id uuid) returns boolean
language plpgsql security definer set search_path='' as $$
declare target uuid;
begin
 select user_id into target from public.account_privacy_requests where id=request_id and status in ('pending','processing') for update;
 if target is null then raise exception 'No active request'; end if;
 -- Serialize role changes and storage writes with the final ownership check/deletion.
 lock table public.user_roles in share row exclusive mode;
 if exists(select 1 from public.user_roles where user_id=target and role='admin') then raise exception 'Administrator accounts require a separate reviewed procedure'; end if;
 perform 1 from auth.users where id=target for update;
 lock table storage.objects in share row exclusive mode;
 if exists(select 1 from storage.objects o where o.owner_id=target::text or to_jsonb(o)->>'owner'=target::text or (bucket_id='profile-avatars' and split_part(name,'/',1)=target::text)) then raise exception 'Owned storage still exists'; end if;
 -- Any unexpected foreign-key dependency fails the whole transaction, not a partial success.
 delete from auth.users where id=target;
 if not found then raise exception 'Account unavailable'; end if;
 update public.account_privacy_requests set user_id=null,status='completed',completed_at=now() where id=request_id;
 return true;
end $$;
revoke all on function public.uj_fulfill_account_deletion(uuid) from public,anon,authenticated;
grant execute on function public.uj_fulfill_account_deletion(uuid) to service_role;

-- Existing JWTs may remain cryptographically valid after Auth deletion. No new orphan avatars.
create policy privacy_avatar_live_account on storage.objects as restrictive for insert to authenticated
 with check(bucket_id<>'profile-avatars' or exists(select 1 from public.profiles where id=(select auth.uid())));

-- Lock the parent profile too: an INSERT waiting behind final deletion must not
-- rely on a pre-deletion statement snapshot. Applies to service uploads as well.
create function unseen_private.privacy_avatar_parent() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.bucket_id='profile-avatars' then
  perform id from public.profiles where id::text=split_part(new.name,'/',1) for key share;
  if not found then raise exception 'Profile required for avatar upload'; end if;
 end if;
 return new;
end $$;
revoke all on function unseen_private.privacy_avatar_parent() from public,anon,authenticated;
create trigger privacy_avatar_parent before insert or update of name,bucket_id on storage.objects
 for each row execute function unseen_private.privacy_avatar_parent();

create function public.uj_export_account_data() returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('generated_at',now(),
 'profile',(select to_jsonb(p) from public.profiles p where id=auth.uid()),
 'preferences',(select to_jsonb(p) from public.user_preferences p where user_id=auth.uid()),
 'interests',coalesce((select jsonb_agg(to_jsonb(p)) from public.user_preference_categories p where user_id=auth.uid()),'[]'::jsonb),
 'saved_places',coalesce((select jsonb_agg(to_jsonb(p)) from public.saved_places p where user_id=auth.uid()),'[]'::jsonb),
 'visits',coalesce((select jsonb_agg(to_jsonb(p)) from public.user_visited_places p where user_id=auth.uid()),'[]'::jsonb),
 'recommendation_history',coalesce((select jsonb_agg(to_jsonb(p)) from public.user_discovery_history p where user_id=auth.uid()),'[]'::jsonb),
 'feedback',coalesce((select jsonb_agg(to_jsonb(p)) from public.recommendation_feedback p where user_id=auth.uid()),'[]'::jsonb),
 'privacy_requests',coalesce((select jsonb_agg(to_jsonb(p)) from public.account_privacy_requests p where user_id=auth.uid()),'[]'::jsonb),
 'avatar_inventory',coalesce((select jsonb_agg(jsonb_build_object('bucket',bucket_id,'name',name)) from storage.objects where bucket_id='profile-avatars' and split_part(name,'/',1)=auth.uid()::text),'[]'::jsonb)) where auth.uid() is not null;
$$;
revoke all on function public.uj_export_account_data() from public,anon;
grant execute on function public.uj_export_account_data() to authenticated;
