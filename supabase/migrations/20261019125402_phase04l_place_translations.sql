-- Additive Arabic editorial content. English and publication/media approvals are unchanged.
create table public.place_translations (
 place_id uuid not null references public.places(id) on delete cascade,
 locale text not null check (locale = 'ar-JO'),
 name text check (char_length(name) between 1 and 160),
 description text check (char_length(description) <= 20000),
 city text check (char_length(city) <= 100),
 address text check (char_length(address) <= 500),
 best_time_to_visit text check (char_length(best_time_to_visit) <= 1000),
 transportation_notes text check (char_length(transportation_notes) <= 2000),
 visitor_guidance text check (char_length(visitor_guidance) <= 6000),
 source_updated_at timestamptz not null,
 editorial_status text not null default 'pending' check (editorial_status in ('pending','reviewed')),
 reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
 updated_by uuid references auth.users(id), updated_at timestamptz not null default now(),
 primary key (place_id,locale),
 constraint translation_review_evidence check ((editorial_status='pending' and reviewed_by is null and reviewed_at is null) or (editorial_status='reviewed' and reviewed_by is not null and reviewed_at is not null))
);
alter table public.place_translations enable row level security;
revoke all on public.place_translations from anon,authenticated;
grant select on public.place_translations to anon,authenticated;
grant insert,update on public.place_translations to authenticated;
create policy translation_anon_read on public.place_translations for select to anon using (
 editorial_status='reviewed' and exists (
 select 1 from public.places p where p.id=place_id and p.status='published' and p.updated_at=source_updated_at)
);
create policy translation_authenticated_read on public.place_translations for select to authenticated using (
 (select unseen_private.is_admin()) or (editorial_status='reviewed' and exists (
 select 1 from public.places p where p.id=place_id and p.status='published' and p.updated_at=source_updated_at))
);
create policy translation_admin_insert on public.place_translations for insert to authenticated with check ((select unseen_private.is_admin()));
create policy translation_admin_update on public.place_translations for update to authenticated using ((select unseen_private.is_admin())) with check ((select unseen_private.is_admin()));
create function unseen_private.prepare_place_translation() returns trigger language plpgsql security invoker set search_path='' as $$
declare english_updated timestamptz; changed boolean;
begin
 select updated_at into english_updated from public.places where id=new.place_id;
 if english_updated is null then raise exception 'Destination unavailable' using errcode='23503'; end if;
 if tg_op='UPDATE' and (new.place_id is distinct from old.place_id or new.locale is distinct from old.locale) then raise exception 'Translation identity is immutable' using errcode='23514'; end if;
 changed := tg_op='INSERT';
 if tg_op='UPDATE' then changed := (to_jsonb(new)-array['editorial_status','reviewed_by','reviewed_at','updated_by','updated_at']) is distinct from (to_jsonb(old)-array['editorial_status','reviewed_by','reviewed_at','updated_by','updated_at']); end if;
 if changed then new.editorial_status:='pending'; new.reviewed_by:=null; new.reviewed_at:=null;
 elsif new.editorial_status='reviewed' then
  if not unseen_private.is_admin() then raise exception 'Current administrator session required' using errcode='42501'; end if;
  if new.source_updated_at<>english_updated or nullif(btrim(new.name),'') is null or char_length(coalesce(new.description,''))<80 then raise exception 'Review requires a current saved translation with name and description' using errcode='23514'; end if;
  new.reviewed_by:=(select auth.uid()); new.reviewed_at:=now();
 else new.reviewed_by:=null; new.reviewed_at:=null;
 end if;
 new.updated_at:=now(); new.updated_by:=(select auth.uid()); return new;
end $$;
revoke all on function unseen_private.prepare_place_translation() from public;
create trigger prepare_translation before insert or update on public.place_translations for each row execute function unseen_private.prepare_place_translation();
create trigger audit_translation after insert or update or delete on public.place_translations for each row execute function unseen_private.audit_change();
comment on table public.place_translations is 'Locale-specific editorial text; no authority to publish a place or approve source/media evidence. Public Arabic must be reviewed and current against English.';
