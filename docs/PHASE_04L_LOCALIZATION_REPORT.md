# Phase 04L — Arabic and English localization

Date: 19 October 2026. Project: `dkhwwvoplhfjccvjegty`.

The bilingual review workspace is now available at **http://127.0.0.1:4184/admin/translations**. See the [bilingual content review and administrator acceptance report](BILINGUAL_CONTENT_REVIEW_REPORT.md) for the review workflow, preservation evidence and outstanding real-browser acceptance check. All six translations remain pending human review.

## Implementation outcome

English and Arabic/Jordan are implemented across the current public routes and administrator workspace. The shared switcher changes locale without a page reload, preserves the selected language, and updates `html.lang` and LTR/RTL direction. Arabic uses IBM Plex Sans Arabic; English fonts, public artwork, brand colours and compact sizing are retained.

Localized modules include Home, Explore, map, Preferences, Surprise Me, discovery result, Place Details, My Discoveries, public account/profile previews, administrator login/invitation/recovery, overview KPIs/charts, places, categories, media, audit, acceptance, Content Completion, editor, map picker, Draft Preview, dialogs and publication blockers. Existing public account pages remain explicitly labelled previews; this phase did not change their authentication behavior or add a new settings service.

The implementation uses i18next/react-i18next with 1,001 paired UI resource keys, explicit rendering calls, reusable dynamic-message handling, locale-aware utilities and separate persistent content translation. Architecture and maintenance details are in [LOCALIZATION_ARCHITECTURE.md](LOCALIZATION_ARCHITECTURE.md).

## Actual hosted content and preservation

The additive translation migration was applied through the dedicated Unseen Jo MCP connection. Six rows were inserted into `public.place_translations` with locale `ar-JO`, faithful Modern Standard Arabic descriptions and visitor/source uncertainties, and **pending** translation review:

| Existing slug | Arabic name | Arabic description characters | Translation review |
| --- | --- | ---: | --- |
| ajloun-forest | محمية غابات عجلون | 874 | Pending; no reviewer/time |
| salt-historic | وسط السلط التاريخي | 837 | Pending; no reviewer/time |
| wadi-mujib | محمية الموجب للمحيط الحيوي | 932 | Pending; no reviewer/time |
| dana-reserve | محمية ضانا للمحيط الحيوي | 884 | Pending; no reviewer/time |
| iraq-al-amir | عراق الأمير | 829 | Pending; no reviewer/time |
| umm-qais | أم قيس | 815 | Pending; no reviewer/time |

Names, description, geographic description, transport notes and visitor guidance are translated for all six. Five cities and two best-time notes are translated; the remaining NULLs match their English source. Eligibility-dependent prices, dated guidance, editorial duration recommendations and uncertainties retain their distinctions. Translation itself is not source verification.

The successful before/after remote snapshots confirm the original English place rows—including IDs, slugs, status, coordinates and timestamps—are identical. Existing image rows, Storage object references and user-role rows also match exactly. The actual snapshots contain **six drafts, zero published places, 12 unapproved image records, 13 Storage object references and two existing user-role rows**. These are preservation counts, not evidence of image clearance or new role assignments. No pending photograph was imported, no image was approved and the existing unlinked test upload was not deleted or changed. Original connection settings, Auth behavior, original RLS and Storage policies were preserved.

Evidence: `docs/validation/phase04l-before.json` and `phase04l-remote.json`. The initial translation population was a trusted, authorized database operation; it was not attributed to a fabricated administrator JWT. The earlier authentication blocker is now resolved. On 19 October 2026, actual calls through the reauthenticated dedicated `supabase_unseen_jo` MCP server returned `https://dkhwwvoplhfjccvjegty.supabase.co` and completed the final preservation query in an explicit READ ONLY transaction. Full English place rows, image rows and role rows exactly match both saved baselines; all Storage object ID/name/bucket references match both baselines. All six translation rows exactly match the saved remote snapshot, remain pending with no reviewer/time, and are current against their English source timestamps. Translation RLS remains enabled.

Fresh evidence: [preservation result](validation/phase04l-preservation-final.json), [snapshot](validation/phase04l-preservation-snapshot.json), [read-only SQL](validation/phase04l-final-readonly.sql), and [current access metadata](validation/phase04l-access-final.json). Current policies, grants, RLS and bucket configuration were read without changes; a complete historical access-metadata equality comparison is not claimed. Storage bytes were not downloaded or hashed. No remote writes or connector configuration changes were performed during this finalization.

## Independent editing and approval

The editor has a labelled English-source section and a separate Arabic section. Arabic can be incomplete and saved independently. It cannot overwrite English, change publication status or approve sources/media. Saves use optimistic concurrency. Translation text changes reset its review; English changes make it stale. Only a real current administrator session can approve the saved translation, with the actor recorded by the backend.

Admins can preview pending Arabic with a clear editorial status and switch the preview to English. Public Arabic is available only for a published parent with a reviewed, current translation; absent or incomplete Arabic produces an explicit English fallback. No real draft was exposed to obtain public screenshots.

## RTL and media review

The right-side Arabic sidebar, mobile drawer, navigation/breadcrumbs, profile menu, forms, filters and dialogs retain the established design. Directional arrows respond to RTL; logos, maps and photos do not flip. The hero text uses the existing light area of the unmirrored image. Dropdowns use bounded RTL positioning. Technical values and original legal evidence are isolated LTR.

Content Completion is readable in Arabic, including its private-import explanation, proposed cover/gallery distinctions, image-identity and quality notes, source/permission links and manual action. Original legal attribution/licence text and creator names remain unchanged. Arabic explanatory text does not substitute for the actual licence or imply CMS approval. No upload starts when selecting Arabic.

## Map validation

The existing MapLibre implementation retains markers, coordinate selection, drag/keyboard movement, zoom/pan, filtering, directions and location controls. Arabic provider-name expressions and native/custom control labels are implemented. Language switching keeps the map camera and current UI state. Final map screenshots show real Arabic provider labels rather than mocked Arabic map tiles.

OpenFreeMap live metadata and decoded vector data were inspected for `name:ar`; evidence and observed names are in `phase04l-map-language.json`. Arabic labels are not universal: unnamed/untranslated features fall back to provider-native/English text. Native scale numerals can remain Latin, with Arabic units. No coordinates, numbers or geographic names were invented for localization.

## Test evidence

Results are recorded separately by scope:

| Scope | Result / evidence |
| --- | --- |
| Locale resources, fallback, six-source preservation, Intl, immutable media/map adapters | 6 groups passed; `phase04l-unit-tests.json` |
| Full existing CMS security fixture plus new translation RLS/review/uniqueness/session/audit checks | 14 groups passed; `phase04l-database-tests.json`; disposable PostgreSQL/PostGIS only |
| Real hosted translation visibility, nested published reads, denied anonymous insert | 3 passed; `phase04l-hosted-tests.json`; no stored changes |
| Existing real hosted CMS anonymous checks | 4 passed; `phase04-hosted-tests.json` |
| Bilingual public/admin routes at 1440, 820 and 390px, direction, overflow, persistence and screenshots | 116 cases passed; `phase04l-browser.json` |
| Arabic search, independent saves, unsaved-field preservation, bilingual preview, fallback, map interaction/camera and mobile keyboard/reduced-motion checks | 7 groups passed; `phase04l-interactions.json`; Auth/HTTP and writes are fixtures |
| Arabic Home/Explore artwork placement refinement | 6 viewport cases passed; `phase04l-visual-refinement.json` |
| Real Arabic provider data and map screenshots | Passed; `phase04l-map-language.json` |
| Automated administrator WCAG scans | Overview, editor and Content Completion: zero reported violations in the bilingual browser run |
| Individual saved Arabic/English editor previews for all six destinations | 6 passed; `phase04l-destination-previews.json`; exact complete descriptions compared, coordinates preserved, publication disabled, zero writes |
| Public Arabic WCAG/title checks | 22 desktop/mobile route cases passed with zero reported violations; `phase04l-public-accessibility.json` |
| Legacy suites | Final outcomes are listed in the validation addendum below and linked JSON artifacts |

The final validation addendum records remaining suite results without treating an earlier run or a fixture as hosted administrator evidence. Screenshots are actual browser renders of the local app; protected screens use explicit Auth/API fixtures and the researched bilingual data. Public destination examples use fixture-published responses, because all six real destinations remain private drafts.

## Screenshots

All captures: `docs/screenshots/phase04l/`, with English/Arabic and desktop/tablet/mobile variants. Required Arabic examples:

1. [Home](screenshots/phase04l/ar-JO-home-1440.png)
2. [Explore](screenshots/phase04l/ar-JO-explore-1440.png)
3. [Map with Arabic provider labels](screenshots/phase04l/ar-JO-map-1440.png)
4. [Place Details](screenshots/phase04l/ar-JO-place-details-1440.png)
5. [Admin Overview](screenshots/phase04l/ar-JO-admin-overview-1440.png)
6. [Places Management](screenshots/phase04l/ar-JO-admin-places-1440.png)
7. [Edit Place / bilingual content](screenshots/phase04l/ar-JO-admin-edit-1440.png)
8. [Content Completion / rights review](screenshots/phase04l/ar-JO-admin-content-completion-1440.png)
9. [Mobile Admin](screenshots/phase04l/ar-JO-admin-overview-390.png) and [mobile Map](screenshots/phase04l/ar-JO-map-390.png)

Each saved Arabic destination was also opened separately in the editor and Draft Preview. Its complete Arabic description and original English description were compared exactly, its original coordinates were checked, and no save or publish request was made:

| Destination | Individual Arabic preview | Result |
| --- | --- | --- |
| Ajloun Forest Reserve | [محمية غابات عجلون](screenshots/phase04l/ar-JO-preview-ajloun-forest.png) | Passed; pending review |
| As-Salt Historic Centre | [وسط السلط التاريخي](screenshots/phase04l/ar-JO-preview-salt-historic.png) | Passed; pending review |
| Mujib Biosphere Reserve | [محمية الموجب للمحيط الحيوي](screenshots/phase04l/ar-JO-preview-wadi-mujib.png) | Passed; pending review |
| Dana Biosphere Reserve | [محمية ضانا للمحيط الحيوي](screenshots/phase04l/ar-JO-preview-dana-reserve.png) | Passed; pending review |
| Iraq Al-Amir | [عراق الأمير](screenshots/phase04l/ar-JO-preview-iraq-al-amir.png) | Passed; pending review |
| Umm Qais | [أم قيس](screenshots/phase04l/ar-JO-preview-umm-qais.png) | Passed; pending review |

These captures use the prepared saved content and isolated Auth/API fixtures. They demonstrate rendering, not a new authenticated hosted transaction. Empty image placeholders in fixtures do not imply that existing hosted media has been removed.

## Final validation addendum

The resumed final run passed the 116 bilingual browser cases, 7 interaction groups, 6 individual production-build preview cases, 22 public Arabic accessibility/title cases, 6 unit groups, 14 disposable database security groups and 3 actual hosted anonymous checks. All three administrator accessibility scans reported zero violations. The resource audit found zero missing known static UI keys; brand letters and original GeoNames legal attribution are deliberate exceptions. Live provider data and real MapLibre renders passed again at desktop/tablet/mobile widths.

`npm run validate` exited successfully: Oxlint, asset validation (83 references / 48 originals) and the production build. This project uses Oxlint; ESLint was not run. The existing large map chunk warning remains.

Previously completed regression evidence was inspected rather than discarded or recreated. Foundation/database (55 checks), tourism (15 local and 17 hosted checks), map unit (9), invitation (9), acceptance runner (3), hosted CMS (4), administrator browser (5), refinement (13) and the public foundation/layout suites passed. The nine recorded remaining regression jobs all have exit code 0: Phase 01C, global UI scale, hosted tourism, tourism browser, map browser, map visual refinement, map details controls, map quality and administrator browser. The five foundation/landing/global regression job results also remain successful. These suites have overlapping coverage and are not added into an inflated single test total.

Evidence index: [final results](validation/phase04l-final-results.json), [remaining regression jobs](validation/phase04l-remaining-regressions.json), [individual previews](validation/phase04l-destination-previews.json), [public accessibility](validation/phase04l-public-accessibility.json), and [final preservation verification](validation/phase04l-preservation-final.json). Fixture database publication checks execute only in disposable PostgreSQL; they do not publish hosted places. Production-build preview checks use isolated Auth/API responses and perform no writes.

Phase 04L is finalized: implementation, automated rendering checks and the final authenticated read-only preservation check are complete. New genuine signed-in hosted translation saves/reviews remain a manual acceptance step; fixture success is not represented as a hosted administrator test.

## Remaining human actions and limitations

1. Open the running application?s **/admin** route, select Arabic, and inspect all six Arabic sections (the previously used local address was http://127.0.0.1:4184/admin). Have a human review wording and compare the source cautions before approving saved translation text. Pending Arabic is intentional, not an automatic source-verification claim.
2. Exercise an Arabic-only save in the real signed-in browser when an approved editorial correction is needed. The agent had no genuine authenticated browser session available; new hosted administrator saves/reviews are not claimed from fixture success. Do not share passwords, tokens or verification links.
3. The pre-existing media import remains a separate manual action at **http://127.0.0.1:4184/admin/content-completion**. Localization does not authorize its execution or image approval.
4. Future administrator-created categories, photos or new UI copy need their own translation resources/content. Unknown external provider diagnostics can remain in their original language. Geographic labels depend on available provider data; legal attribution and technical identifiers deliberately remain original.
5. Supabase security advisors found no new localization-table RLS issue. The existing Auth leaked-password-protection advisory remains unchanged: [Supabase remediation guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No authentication setting was changed.
6. The existing large MapLibre chunk warning remains a build warning, not a build failure. Automated WCAG tests are not a substitute for human accessibility/Arabic-language review.
7. Final privileged preservation is complete through `supabase_unseen_jo`; no reconnection or content change is required. The original Supabase connection remains untouched.

No destination was published, no pending media was imported, no role was granted, and Phase 05 was not started. Publication still requires its separate completed content/media checks and explicit approval.
