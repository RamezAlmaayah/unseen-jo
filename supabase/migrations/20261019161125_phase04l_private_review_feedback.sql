-- Public Arabic must never carry private reviewer feedback. Existing six pending rows are unchanged.
create or replace function unseen_private.prepare_place_translation() returns trigger
language plpgsql security invoker set search_path='' as $$
declare english_updated timestamptz; changed boolean;
begin
 select updated_at into english_updated from public.places where id=new.place_id;
 if english_updated is null then raise exception 'Destination unavailable' using errcode='23503'; end if;
 if tg_op='UPDATE' and (new.place_id is distinct from old.place_id or new.locale is distinct from old.locale) then
  raise exception 'Translation identity is immutable' using errcode='23514';
 end if;
 changed := tg_op='INSERT';
 if tg_op='UPDATE' then
  changed := (to_jsonb(new)-array['editorial_status','reviewed_by','reviewed_at','updated_by','updated_at','review_notes','feedback_by','feedback_at'])
    is distinct from (to_jsonb(old)-array['editorial_status','reviewed_by','reviewed_at','updated_by','updated_at','review_notes','feedback_by','feedback_at']);
  -- Feedback identity and time are always assigned by the server, never the client.
  new.feedback_by:=old.feedback_by; new.feedback_at:=old.feedback_at;
 else new.feedback_by:=null; new.feedback_at:=null;
 end if;
 if changed then
  new.editorial_status:='pending'; new.reviewed_by:=null; new.reviewed_at:=null;
  if tg_op='UPDATE' then new.review_notes:=old.review_notes; else new.review_notes:=null; end if;
 elsif new.editorial_status='reviewed' then
  if not unseen_private.is_admin() then raise exception 'Current administrator session required' using errcode='42501'; end if;
  if new.source_updated_at<>english_updated or nullif(btrim(new.name),'') is null or char_length(coalesce(new.description,''))<80 then
   raise exception 'Review requires a current saved translation with name and description' using errcode='23514';
  end if;
  new.reviewed_by:=(select auth.uid()); new.reviewed_at:=now();
  -- Clear resolved feedback before a row can become public. Status changes are audited.
  new.review_notes:=null; new.feedback_by:=null; new.feedback_at:=null;
 elsif new.editorial_status='needs_changes' then
  if not unseen_private.is_admin() then raise exception 'Current administrator session required' using errcode='42501'; end if;
  if nullif(btrim(new.review_notes),'') is null then raise exception 'Describe the translation changes needed' using errcode='23514'; end if;
  new.feedback_by:=(select auth.uid()); new.feedback_at:=now(); new.reviewed_by:=null; new.reviewed_at:=null;
 else
  new.reviewed_by:=null; new.reviewed_at:=null;
  if tg_op='UPDATE' then new.review_notes:=old.review_notes; end if;
 end if;
 new.updated_at:=now(); new.updated_by:=(select auth.uid()); return new;
end $$;
revoke all on function unseen_private.prepare_place_translation() from public;

alter table public.place_translations add constraint translation_resolved_feedback_private check (editorial_status<>'reviewed' or (review_notes is null and feedback_by is null and feedback_at is null));
