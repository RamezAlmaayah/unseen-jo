-- Preserve all existing publication checks. Avoid publishing English while its
-- reviewed Arabic is made stale solely by the publication timestamp update.
create function public.admin_publish_localized_place(target uuid, expected_updated_at timestamptz, expected_translation_updated_at timestamptz)
returns void language plpgsql security invoker set search_path='' as $$
declare p public.places; t public.place_translations; issues text[];
begin
 if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
 select * into p from public.places where id=target for update;
 if not found or p.status<>'draft' then raise check_violation using message='A saved draft is required'; end if;
 if p.updated_at is distinct from expected_updated_at then raise serialization_failure using message='Destination changed. Reload before publishing'; end if;
 select * into t from public.place_translations where place_id=target and locale='ar-JO' for update;
 if not found or t.updated_at is distinct from expected_translation_updated_at then raise serialization_failure using message='Translation changed. Reload before publishing'; end if;
 if t.editorial_status<>'reviewed' or t.source_updated_at<>p.updated_at then raise check_violation using message='A reviewed current Arabic translation is required'; end if;
 issues:=public.admin_publication_issues(target);
 if coalesce(cardinality(issues),0)>0 then raise check_violation using message=array_to_string(issues,'; '); end if;
 -- Existing RPC and publication trigger still enforce content, geography and media.
 perform public.admin_set_place_status(target,'published',expected_updated_at);
 select * into p from public.places where id=target;
 update public.place_translations set source_updated_at=p.updated_at where place_id=target and locale='ar-JO';
 -- The normal translation trigger assigns the real current account and time.
 update public.place_translations set editorial_status='reviewed' where place_id=target and locale='ar-JO';
end $$;
revoke all on function public.admin_publish_localized_place(uuid,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.admin_publish_localized_place(uuid,timestamptz,timestamptz) to authenticated;
