-- Explicit file replacement, never a remote-source-URL import. Existing policies,
-- publication locks, audit triggers and image approval checks remain in force.
create function public.admin_replace_cover_image(target uuid, expected_updated_at timestamptz, uploaded_path text, replacement_alt_text text)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare previous public.place_images; destination uuid; replacement uuid;
begin
  if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
  select place_id into destination from public.place_images where id=target;
  -- Serialize with publication and other replacements before locking the image.
  perform 1 from public.places where id=destination and status='draft' for update;
  if not found then raise check_violation using message='Return the destination to draft before replacing its cover'; end if;
  select * into previous from public.place_images where id=target for update;
  if not found or previous.updated_at is distinct from expected_updated_at or not previous.is_cover then
    raise check_violation using message='Cover image changed. Reload before replacing.';
  end if;
  if uploaded_path is null or uploaded_path !~ ('^' || destination::text || '/[a-f0-9-]{36}\.(jpg|png|webp)$')
    or not exists(select 1 from storage.objects where bucket_id='place-images' and name=uploaded_path)
    or exists(select 1 from public.place_images where storage_path=uploaded_path) then
    raise check_violation using message='A new private upload for this destination is required';
  end if;
  if replacement_alt_text is null or char_length(btrim(replacement_alt_text)) not between 1 and 500 then
    raise check_violation using message='Replacement alternative text is required';
  end if;
  -- Retain the previous file, attribution, evidence and authentic approval on its
  -- original media row in the gallery. They do not apply to different bytes.
  update public.place_images set is_cover=false where id=target;
  insert into public.place_images(place_id,storage_path,alt_text,sort_order,is_cover)
    values(destination,uploaded_path,btrim(replacement_alt_text),previous.sort_order,true) returning id into replacement;
  return replacement;
end;
$$;
revoke all on function public.admin_replace_cover_image(uuid,timestamptz,text,text) from public,anon,authenticated;
grant execute on function public.admin_replace_cover_image(uuid,timestamptz,text,text) to authenticated;
