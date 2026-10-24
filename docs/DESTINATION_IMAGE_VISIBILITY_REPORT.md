# Destination image audit and public visibility

Date: **23 October 2026**. Project: `dkhwwvoplhfjccvjegty`.

**Local visibility fix implemented and verified. Hosted archival is BLOCKED by unavailable authenticated Admin execution access. No hosted status, image, user, role, permission or Storage changes were made. No deployment was started.** The current request authorizes archiving the affected destinations; missing editorial approval is not the blocker.

## Results

| Requested result | Actual outcome |
| --- | ---: |
| Published destinations checked | **24** |
| Destinations with real working approved public images | **7** |
| Working approved public image files | **13** |
| Image records examined, including private/unapproved records | **45** |
| Approved image URLs found broken | **0** |
| Broken links repaired | **0** — none required repair |
| Destinations without any approved public image | **17** |
| Destinations actually changed to Archived in this task | **0 — BLOCKED** |
| Destinations visible through the updated local application | **7** |
| Hosted database rows still marked Published | **24**, until the 17 authorized archival operations can run |

**Names of destinations archived by this task: none.** Do not confuse local filtering with committed database archival or a deployed production change. The 17 pending names are listed individually below.

The seven retained destinations are Ajloun Forest Reserve, Aqaba Marine Reserve, Dana Biosphere Reserve, Iraq Al-Amir, As-Salt Historic Centre, Umm Qais and Mujib Biosphere Reserve. Their records, image approvals, English/Arabic text and relationships were not edited.

## Evidence and method

Fresh management reads inspected all destination/image rows, source paths, approval timestamps, translations, category relationships and the place-images Storage inventory. Private before/after snapshots are retained under the ignored `artifacts/image-removal/` directory. No Auth credentials or user account records were exported.

The anonymous Supabase client then queried the real hosted Data API and requested normal short-lived image signatures for all 45 saved paths. It did not borrow an Admin session. Exactly the 13 approved image records were exposed by RLS; signing of all unapproved paths was denied. All 13 returned **HTTP 200**, image MIME types and actual image bytes that **Chromium decoded successfully with non-zero dimensions**. Storage presence, public-row visibility, signing permission, cover/gallery identity, byte hashes and decoded sizes are recorded per image. No signed URL or key is stored in the public evidence.

An image row or uploaded private candidate was not treated as a usable public photograph. All 17 affected destinations have saved image records but **zero approved/publicly accessible images**. Their private candidates were not promoted or reapproved to avoid archival. Existing approval and copyright evidence was preserved; this task is not a new copyright certification.

Real anonymous browser acceptance tests used the built local application against hosted Supabase, with **no API fixtures**. A request guard allowed only GET/HEAD and read-only Storage signing, blocking any content/Auth write. Tests inspected real rendering in Home, Explore, Maps/popups, seven destination galleries, direct image-less detail routes and recommendation results in English desktop and Arabic mobile. Mobile Explore was switched to **List** view before checking its list photographs; map view was checked independently.

Evidence:

- [Complete 24-destination and 45-image audit](validation/public-destination-image-audit.json).
- [Real anonymous browser results](validation/public-image-visibility-browser.json).
- [SDK visibility/conflict-free retrieval tests](validation/public-image-visibility-unit.json).
- [Fresh hosted preservation and access-blocker results](validation/public-image-removal-preservation.json).

## Every destination

All rows below are still **Published in hosted Supabase**. “Archive pending” is an unapplied operation, not a new publication state.

| Destination | Slug | Saved image rows | Approved images | Working public images | Disposition |
| --- | --- | ---: | ---: | ---: | --- |
| Ajloun Forest Reserve | `ajloun-forest` | 2 | 2 | 2 | Keep Published |
| Baptism Site (Al-Maghtas) | `al-maghtas-baptism-site` | 2 | 0 | 0 | **Archive pending** |
| Amman Citadel | `amman-citadel` | 1 | 0 | 0 | **Archive pending** |
| Amman Roman Theatre | `amman-roman-theatre` | 2 | 0 | 0 | **Archive pending** |
| Aqaba Marine Reserve | `aqaba-marine-reserve` | 2 | 1 | 1 | Keep Published |
| Azraq Wetland Reserve | `azraq-wetland-reserve` | 2 | 0 | 0 | **Archive pending** |
| Dana Biosphere Reserve | `dana-reserve` | 3 | 3 | 3 | Keep Published |
| Iraq Al-Amir | `iraq-al-amir` | 1 | 1 | 1 | Keep Published |
| Jerash Archaeological City | `jerash-archaeological-city` | 2 | 0 | 0 | **Archive pending** |
| Karak Castle | `karak-castle` | 2 | 0 | 0 | **Archive pending** |
| Little Petra (Siq Al-Barid) | `little-petra-siq-al-barid` | 2 | 0 | 0 | **Archive pending** |
| St. George’s Church (Madaba Map) | `madaba-st-georges-church` | 1 | 0 | 0 | **Archive pending** |
| Mount Nebo | `mount-nebo` | 2 | 0 | 0 | **Archive pending** |
| Pella (Tabaqat Fahl) | `pella-tabaqat-fahl` | 1 | 0 | 0 | **Archive pending** |
| Petra | `petra` | 2 | 0 | 0 | **Archive pending** |
| Quseir Amra | `quseir-amra` | 2 | 0 | 0 | **Archive pending** |
| As-Salt Historic Centre | `salt-historic` | 3 | 3 | 3 | Keep Published |
| Shaumari Wildlife Reserve | `shaumari-wildlife-reserve` | 2 | 0 | 0 | **Archive pending** |
| Shobak Castle | `shobak-castle` | 2 | 0 | 0 | **Archive pending** |
| Um er-Rasas (Kastrom Mefa’a) | `um-er-rasas` | 2 | 0 | 0 | **Archive pending** |
| Umm Al-Jimāl | `umm-al-jimal` | 1 | 0 | 0 | **Archive pending** |
| Umm Qais | `umm-qais` | 2 | 1 | 1 | Keep Published |
| Mujib Biosphere Reserve | `wadi-mujib` | 2 | 2 | 2 | Keep Published |
| Wadi Rum Protected Area | `wadi-rum` | 2 | 0 | 0 | **Archive pending** |

Every retained destination also has a working approved cover in this audit. The repository additionally supports a working approved gallery photograph when a cover is unavailable. No unrelated image is substituted.

## Local implementation

The public tourism repository now omits destinations whose public image list is empty or whose anonymous Storage signing fails. The same rule applies to catalog, featured cards, Explore/search, map input and cold/direct detail reads. It does not hardcode a blacklist or silently modify statuses. The normal Admin private prototype preview behavior is retained.

Recommendations now reuse that **same hydrated, image-qualified catalog**, including on a cold load. The former lightweight recommendation projection could rank an image-less Published row before the display layer saw its photographs. The shared cache removes that bypass and avoids separate per-card media requests. It uses a larger shared catalog projection in exchange for consistent eligibility; signatures are batched and media bytes remain loaded by the existing image components.

The existing image delivery/fallback logic is retained: an unavailable cover can fall back to a valid gallery photograph, and transformation failure can use the original. This task repaired no URLs because all existing approved originals and the tested rendered variants already worked. A future image outage still requires investigation; anonymous signing alone is not a perpetual byte-health guarantee. The real-byte audit establishes current image health, not an indefinite uptime guarantee.

Image-less direct URLs now show a bilingual “Place not found” page with an accurate unavailable-destination explanation, rather than incorrectly describing the live website as a local demo collection. No empty destination cards or broken image placeholders were observed in the tested public views. Personal saved/history IDs remain stored; existing generic unavailable-entry handling does not reveal the hidden destination's content and is not replaced with record deletion.

Admin → Places remains unchanged in its status permissions and save flow. Its content signals now include image-record count, approved-record count, the missing-cover/gallery reason and an instruction to keep the destination archived until a public image works. Archived rows retain their name, status selector and editor/preview links. These signals are derived diagnostics, **not** a fabricated persisted archival reason or a claim that approved records have just passed HTTP verification. The timestamped audit/report supplies the observed reason/evidence for this operation.

## Exact archival blocker

1. The requested browser connection was checked twice and returned **no apps or browser tabs**, including after the owner selected the connection option. A connected/signed-in tab has not become available to this executor through that connection.
2. The pre-existing Windows Chrome window was found, but **automatic browser safety review stopped Computer Use because it could not confidently determine the current URL**. No Windows page interaction or status mutation followed that rejection.
3. The project-specific MCP connection still reports an OAuth refresh/parse failure. The existing **Ramez** management connection can read the correct project, but its context is `postgres`, `auth.uid() = NULL`, `unseen_private.is_admin() = false`.
4. The read-only existing `admin_cms_status()` probe returned **SQLSTATE 42501: Administrator session required**. Management access cannot impersonate the application session required by the existing `admin_change_place_status` operation.

No RLS bypass, forged JWT, session/credential extraction, role change, direct privileged status UPDATE, disabled trigger or alternative privileged write was attempted. **This is an execution-access blocker, not a request for renewed content approval.**

## Safe completion through the existing Admin workflow

Once the genuine website Admin session is available to the authorized executor—or the administrator performs these steps directly:

1. Open the existing **Admin → Places**, using the exact local origin/profile where the administrator is signed in. The normal Admin guard must allow access. Do not transfer credentials between tools.
2. Save a fresh scoped backup and recheck each pending destination's current status, version and anonymous image availability. Do not archive a destination that has gained a valid public image since this audit. Stop on conflicting/newer edits.
3. For each of the **17 Archive pending** rows above, select **Archived** in its existing status dropdown and click **Save status**. This calls the existing version/status-checked `admin_change_place_status` through the authenticated application client. Do not delete a destination or clear its images, saved discoveries, translations or related data.
4. Use the **Archived** filter to confirm all 17 records remain available to Admin with their names and image diagnostics. Retain the seven image-qualified destinations as Published.
5. Re-read actual hosted results: expect **7 Published, 17 Archived, 24 total**, unchanged images/translations/category relationships and both existing Admin accounts untouched. Confirm anonymous detail reads for the archived rows are denied by the existing RLS, not merely filtered from this frontend.
6. Repeat anonymous image/browser tests. Keep snapshots and actual results. Do not claim archival completed until the hosted database confirms it. No frontend deployment is authorized or performed by this report.

No schema migration, new editorial stage, new permission, new Auth provider or account modification is required. Restoring a destination later uses the normal Admin image-management and status workflow after a usable public image is established.

## Preservation and backup

Fresh before/after hosted snapshots are byte-equivalent **within the inspected data**:

- 24 destinations, all Published, same IDs/slugs/English/content versions/statuses.
- 45 image records, including approval fields and image relationships.
- 24 translations; newer owner-reviewed translations were preserved.
- 48 category relationships and 211 Storage inventory entries.
- Admin membership count remains **2**; no account or role mutation was executed.
- Duplicate destination IDs, image IDs and translation keys: **0**.

Private backup `artifacts/image-removal/before.json`: **362,258 bytes**, SHA-256 `1d23cc03151b6ecb0be1a644a7e7ad681d3e637054f2e557147614c96e1888cb`.

The after snapshot has the same data and a later capture timestamp; its file hash is `ebda553511de6ea51141bb55701d5603d856e681071eb5bcf25285fd64812c2c`. These are scoped content/inventory backups, not Auth backups or copies of every Storage object's bytes. Rollback is currently a **no-op**, because hosted writes are **0**.

## Verification

| Check | Result |
| --- | --- |
| `npm run audit:public-images` | **PASS**: 24 destinations / 45 image records; 13 approved real images decoded, HTTP 200; 7 eligible destinations; 17 without public media; 0 approved broken images; 0 unapproved publicly readable files. Uses a fresh private management snapshot prepared separately. |
| `npm run test:public-images` | **7 PASS** groups: 24-to-7 visibility, direct/search/featured exclusion, cold/warm recommendations, denied signatures, cover-to-gallery fallback, archival refresh without deletion, cache expiry/no mutation. Offline installed-SDK fixtures use the committed content baseline; no private backup required. |
| `npm run test:public-images:browser` | **26 PASS** route/result groups: real anonymous English 1366px / Arabic 390px, 34 excluded searches, 34 excluded detail URLs, 14 real galleries, 7 map markers per language and real popup photographs/recommendations. Zero recorded page errors and zero attempted content/Auth mutations. Explore axe WCAG A/AA: zero violations; no horizontal page overflow. English pass retained while the mobile List-view test was corrected and rerun for Arabic. |
| `npm run test:tourism` | **15 PASS** groups, including actual disposable PostgreSQL draft-import preservation. |
| `npm run test:recommendations` | **11 PASS** groups, including shared image-qualified pagination/cache; ranking regressions and CPU measurements retained. |
| `node scripts/check-image-delivery.mjs` | **6 PASS** groups: signatures, failure/retry, concurrency, account isolation, derivative integrity and immutable replacement behavior. |
| `node scripts/check-destination-status-browser.mjs` | **PASS**, English desktop / Arabic mobile isolated Admin fixtures: all six directed transitions, explicit save, persistence, pagination, error/retry. No hosted Admin mutation. |
| `npm run test:localization` / `npm run audit:localization` | **6 PASS** groups / zero missing static resources. |
| `npm run validate:assets` | **PASS**, 83 references / 48 unique originals. |
| `npm run lint` / `npm run build` | **PASS**. Existing large main/map bundle warnings remain; no deployment. |

Legacy tests were updated only where the new explicit requirement supersedes prior behavior: image-less public cards are no longer expected, positive catalog fixtures now supply signed public media, and recommendations must include media eligibility rather than a separate image-blind projection. Existing ranking, pagination, validation and database tests were not disabled or deleted.

## Files changed

- `src/features/tourism/repository.js` — shared image-qualified public catalog/details/recommendations.
- `src/features/admin/PublicImageSignal.jsx`, `src/features/admin/Management.jsx` — missing-image reason/count signals while retaining normal status controls.
- `src/pages/NotFoundPage.jsx` — accurate live unavailable-destination wording.
- `src/styles/admin.css` — scoped diagnostic styling.
- `src/i18n/locales/en.json`, `src/i18n/locales/ar-JO.json` — bilingual signals/unavailable explanation.
- `scripts/audit-public-destination-images.mjs`, `scripts/check-public-image-visibility.mjs`, `scripts/check-public-image-visibility-browser.mjs` — actual image audit, SDK tests and read-only live browser tests.
- `scripts/check-phase02b.mjs`, `scripts/check-phase05.mjs` — updated superseded image-less fixture/projection expectations.
- `package.json` — image audit/test commands; no new dependency.
- This report, the four `docs/validation/public-*image*` evidence files linked above, and refreshed evidence from the regression scripts.
- Ignored `artifacts/image-removal/` scoped backups, screenshots and build log.

**Final status: local visibility work verified; hosted archival BLOCKED. The complete request is not yet fulfilled until the 17 authorized Admin status changes are committed and verified.**
