-- Explicit API grants, ownership checks and trusted admin authorization.
grant usage on schema public, extensions to anon, authenticated;
grant select on public.places, public.categories, public.place_categories, public.place_images to anon, authenticated;
grant insert, update, delete on public.places, public.categories, public.place_categories, public.place_images to authenticated;
grant select on public.profiles to authenticated;
grant update(display_name, avatar_path) on public.profiles to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant select, delete on public.user_preferences, public.user_preference_categories, public.saved_places,
  public.recommendation_feedback to authenticated;
grant insert(user_id,starting_city,available_minutes,budget_min_jod,budget_max_jod,travel_group,transportation)
  on public.user_preferences to authenticated;
grant update(starting_city,available_minutes,budget_min_jod,budget_max_jod,travel_group,transportation)
  on public.user_preferences to authenticated;
grant insert(user_id,category_id) on public.user_preference_categories to authenticated;
grant insert(user_id,place_id) on public.saved_places to authenticated;
grant insert(user_id,place_id,reaction,comment) on public.recommendation_feedback to authenticated;
grant update(reaction,comment) on public.recommendation_feedback to authenticated;
grant select on public.admin_audit_logs to authenticated;

create policy uj_profiles_owner_read on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy uj_profiles_owner_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy uj_roles_read on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) or (select unseen_private.is_admin()));
create policy uj_roles_admin_insert on public.user_roles for insert to authenticated
  with check ((select unseen_private.is_admin()));
create policy uj_roles_admin_update on public.user_roles for update to authenticated
  using ((select unseen_private.is_admin())) with check ((select unseen_private.is_admin()));
create policy uj_roles_admin_delete on public.user_roles for delete to authenticated
  using ((select unseen_private.is_admin()));

create policy uj_places_anon_read on public.places for select to anon using (status = 'published');
create policy uj_places_authenticated_read on public.places for select to authenticated
  using (status = 'published' or (select unseen_private.is_admin()));
create policy uj_places_admin_insert on public.places for insert to authenticated
  with check ((select unseen_private.is_admin()));
create policy uj_places_admin_update on public.places for update to authenticated
  using ((select unseen_private.is_admin())) with check ((select unseen_private.is_admin()));
create policy uj_places_admin_delete on public.places for delete to authenticated
  using ((select unseen_private.is_admin()));

create policy uj_categories_anon_read on public.categories for select to anon using (is_active);
create policy uj_categories_authenticated_read on public.categories for select to authenticated
  using (is_active or (select unseen_private.is_admin()));
create policy uj_categories_admin_insert on public.categories for insert to authenticated
  with check ((select unseen_private.is_admin()));
create policy uj_categories_admin_update on public.categories for update to authenticated
  using ((select unseen_private.is_admin())) with check ((select unseen_private.is_admin()));
create policy uj_categories_admin_delete on public.categories for delete to authenticated
  using ((select unseen_private.is_admin()));

create policy uj_place_categories_read on public.place_categories for select to anon, authenticated
  using (exists (select 1 from public.places p where p.id = place_id)
    and exists (select 1 from public.categories c where c.id = category_id));
create policy uj_place_categories_admin_insert on public.place_categories for insert to authenticated
  with check ((select unseen_private.is_admin()));
create policy uj_place_categories_admin_update on public.place_categories for update to authenticated
  using ((select unseen_private.is_admin())) with check ((select unseen_private.is_admin()));
create policy uj_place_categories_admin_delete on public.place_categories for delete to authenticated
  using ((select unseen_private.is_admin()));

create policy uj_place_images_read on public.place_images for select to anon, authenticated
  using (exists (select 1 from public.places p where p.id = place_id));
create policy uj_place_images_admin_insert on public.place_images for insert to authenticated
  with check ((select unseen_private.is_admin()));
create policy uj_place_images_admin_update on public.place_images for update to authenticated
  using ((select unseen_private.is_admin())) with check ((select unseen_private.is_admin()));
create policy uj_place_images_admin_delete on public.place_images for delete to authenticated
  using ((select unseen_private.is_admin()));

create policy uj_preferences_owner_read on public.user_preferences for select to authenticated
  using (user_id = (select auth.uid()));
create policy uj_preferences_owner_insert on public.user_preferences for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy uj_preferences_owner_update on public.user_preferences for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy uj_preferences_owner_delete on public.user_preferences for delete to authenticated
  using (user_id = (select auth.uid()));
create policy uj_interests_owner_read on public.user_preference_categories for select to authenticated
  using (user_id = (select auth.uid()));
create policy uj_interests_owner_insert on public.user_preference_categories for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.categories c where c.id = category_id and c.is_active));
create policy uj_interests_owner_delete on public.user_preference_categories for delete to authenticated
  using (user_id = (select auth.uid()));

create policy uj_saved_owner_read on public.saved_places for select to authenticated
  using (user_id = (select auth.uid()));
create policy uj_saved_owner_insert on public.saved_places for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.places p where p.id = place_id and p.status = 'published'));
create policy uj_saved_owner_delete on public.saved_places for delete to authenticated
  using (user_id = (select auth.uid()));
create policy uj_feedback_owner_read on public.recommendation_feedback for select to authenticated
  using (user_id = (select auth.uid()));
create policy uj_feedback_owner_insert on public.recommendation_feedback for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.places p where p.id = place_id and p.status = 'published'));
create policy uj_feedback_owner_update on public.recommendation_feedback for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy uj_feedback_owner_delete on public.recommendation_feedback for delete to authenticated
  using (user_id = (select auth.uid()));
create policy uj_audit_admin_read on public.admin_audit_logs for select to authenticated
  using ((select unseen_private.is_admin()));
-- No client write grants or policies on audit logs. Trusted triggers append rows.

-- Bucket creation is supported SQL configuration; object bytes/metadata must be
-- changed through the Storage API, never by directly inserting storage.objects.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
  ('place-images','place-images',false,5242880,array['image/jpeg','image/png','image/webp','image/avif']),
  ('profile-avatars','profile-avatars',false,2097152,array['image/jpeg','image/png','image/webp']);

create policy uj_place_objects_public_read on storage.objects for select to anon
  using (bucket_id = 'place-images' and exists (
    select 1 from public.place_images i join public.places p on p.id = i.place_id
    where i.storage_path = storage.objects.name and p.status = 'published'));
create policy uj_place_objects_authenticated_read on storage.objects for select to authenticated
  using (bucket_id = 'place-images' and ((select unseen_private.is_admin()) or exists (
    select 1 from public.place_images i join public.places p on p.id = i.place_id
    where i.storage_path = storage.objects.name and p.status = 'published')));
create policy uj_place_objects_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'place-images' and (select unseen_private.is_admin()) and exists (
    select 1 from public.places p where p.id::text = (storage.foldername(storage.objects.name))[1]));
create policy uj_place_objects_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'place-images' and (select unseen_private.is_admin()))
  with check (bucket_id = 'place-images' and (select unseen_private.is_admin()) and exists (
    select 1 from public.places p where p.id::text = (storage.foldername(storage.objects.name))[1]));
create policy uj_place_objects_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'place-images' and (select unseen_private.is_admin()));

create policy uj_avatar_owner_read on storage.objects for select to authenticated
  using (bucket_id = 'profile-avatars' and (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text);
create policy uj_avatar_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-avatars' and (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text);
create policy uj_avatar_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'profile-avatars' and (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'profile-avatars' and (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text);
create policy uj_avatar_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'profile-avatars' and (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text);
