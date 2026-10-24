# Phase 08 complete private MVP publication report

Updated 2026-10-22T16:55:48.710Z. Project: dkhwwvoplhfjccvjegty. **The complete 24-destination implementation is ready. The one authenticated Admin batch action remains pending; hosted activation is not claimed.** No deployment or unrelated phase started.

## Exact current result

Latest actual hosted SELECT: 2026-10-22T16:43:34.422911+00:00.

| Measure | Actual hosted state | Prepared / fixture verification |
| --- | --- | --- |
| Tourism records | 24 | 24 existing IDs and slugs; no new duplicate tourism records |
| Actually published | 6 | No synthetic fact or new media was approved for public publication |
| Draft tourism records | 18 | Draft status does not block authorized private prototype display |
| Enabled private overlays | 0 | 24 complete overlays prepared; all 24 work in isolated Admin browser tests |
| Prototype Storage objects | 0 | Only the real Admin batch uploads them; fixture uploads are not hosted uploads |
| Avoidable empty supported English fields | See hosted overlay read-back after activation | 0 across 17 existing content attributes per prepared destination |
| Missing prepared bilingual descriptions | See hosted overlay read-back after activation | 0; all 24 English and Arabic descriptions are distinct |
| Private audit entries | 0 | Current genuine Admin is recorded by existing audit triggers |

The six public originals and 18 draft records retain their statuses. “Enabled privately” is a separate access state and is not a database claim of publication. This deliberately uses the owner-authorized private prototype option instead of marking synthetic tourism facts as verified public guidance.

## One-click completion

In the existing signed-in Admin browser, open [Complete private MVP](http://127.0.0.1:4184/admin/publishing#private-prototype) and click **Complete and enable all 24 privately** / **إكمال الوجهات الأربع والعشرين وإتاحتها بشكل خاص**. Keep the page open until the counter finishes. Then use **Open private prototype** or open [Explore](http://127.0.0.1:4184/explore) in the same browser profile. No field-by-field reviews, passwords, tokens or editorial confirmations are required.

The action resumes missing prepared private photos, adds the original Aqaba illustration, creates responsive variants and stores complete overlays, independently per destination. It never calls source/Arabic/image approval or public publication RPCs. Retry is idempotent: unchanged originals and variants are reused, and the overlay upsert does not add duplicate records or duplicate audit entries. Errors remain per destination so a retry can finish partial work.

The browser connector exposes no connected session. A previous native browser attempt was stopped because its URL could not be verified; no credentials were exported or bypass attempted. The hosted count is still 0/24, so the authenticated hosted content action has not yet been verified. The schema installation is genuine, not a fixture.

## What was completed

- All 24 names, IDs, slugs and sourced identity remain associated with the same hosted places. Distinct source-background prose is combined with original, destination-specific visitor guidance in English and Arabic. Original tourism descriptions and source evidence remain unchanged in their original tables.
- All existing supported destination content fields are populated in the overlay: name, description, locality, governorate/region, address, coordinates, admission range, visit duration, hours, best visiting season, transportation, activities, visitor information and suitable groups. Existing category associations are reused.
- Existing visitor-information text carries Jordanian/international/child fee scenarios, local day budgets, daily/weekend schedules, seasonal guidance, time of day, parking, arrival reference, physical difficulty, access limitations, safety, booking, facilities, refreshments, group guidance and nearby suggestions. These do not add unnecessary columns to places.
- The private presentation adds a compact day-budget card and access guidance using the existing visitor-card component. Arabic multi-category subtitles, group labels and equal-price formatting are handled naturally. Unknown travel labels become explicitly tracked synthetic driving scenarios from Amman; no real road routing is claimed.
- Aqaba has complete bilingual visitor content and a genuine original vector illustration rendered to PNG, plus responsive variants. It is labeled as an illustration, never a photograph or an exact beach/entrance depiction. Its public research blockers do not prevent private prototype use.

| Existing content field | Empty before (actual source snapshot) | Empty after (prepared overlay) |
| --- | --- | --- |
| name | 0 | 0 |
| description | 0 | 0 |
| city | 1 | 0 |
| region | 6 | 0 |
| address | 0 | 0 |
| opening_hours | 20 | 0 |
| activities | 6 | 0 |
| visitor_information | 6 | 0 |
| best_time_to_visit | 22 | 0 |
| transportation_notes | 0 | 0 |
| price_min_jod | 24 | 0 |
| price_max_jod | 24 | 0 |
| duration_min_minutes | 3 | 0 |
| duration_max_minutes | 3 | 0 |
| suitable_groups | 23 | 0 |
| latitude | 0 | 0 |
| longitude | 0 | 0 |

## Synthetic data and real facts

Each payload has designation=private_prototype, version=1, retainedSourceUrl, original place identity and an explicit syntheticFields array. There are 336 field-level designations across the 24 records; nested planning values have their own stated basis. Operational values are demonstration scenarios, not operator tariffs, current availability, accessibility certification or verified travel times. Coordinates retain the existing approximate geographic references; no exact surveyed entrance is invented. Original citations are retained as background references and are not fabricated to support synthetic prices or schedules.

A single restrained notice identifies the private catalog throughout tourism pages; the visitor cards do not repeat an unavailable warning on each populated field. The private Arabic translations have a prototype presentation status, not a forged reviewed status. Original translation editorial states and English-source timestamps remain unchanged.

## Security and production separation

The additive migration creates only private_prototype_places and two security-invoker RPCs: admin_save_private_prototype and admin_private_prototype_catalog. Strict RLS uses the existing session-aware unseen_private.is_admin helper. Anonymous and ordinary accounts cannot read/write the overlays or execute the private catalog. No service-role browser credential, SQL impersonation, role assignment, public Storage policy or publishing-guard exception is introduced. Existing role records, favorites, histories, user accounts and public destination policies are preserved.

Private mode requires all three frontend conditions: Vite development, the explicit local VITE_PRIVATE_PROTOTYPE=true setting, and a loopback hostname. It also requires actual current Admin authentication and backend authorization. Production preview ignores the flag even when the same-shaped Admin session exists. The docs research packages and artwork are not embedded as a production catalog. Turning off the local flag or signing out returns to the normal public catalog.

Repositories are scoped to the verified Admin identity; logout/account changes invalidate private caches and immediately mask private rows. Existing public requests remain anonymous. Prototype-only saves are separate per-Admin, device-local IDs; they do not overwrite existing guest/account favorites or attempt to put unpublished drafts into the normal account favorites table. Existing account visits/history and public-user authentication remain unchanged. Recommendations use the same weights and ranking/diversity rules, accept the explicitly private catalog only on the authorized path and explain synthetic planning evidence.

Backend checks enforce current source versions, bilingual content, numeric ranges, Jordan coordinates, actual stored media with rights evidence, and stored responsive variants. They do not require synthetic facts to pretend to have fresh official sources. Public publishing validation remains strict.

## Media, ownership and quality

30 selected Phase 08 photographs retain their individual Commons sources, photographers, compatible licence terms, original hashes and attribution. No unknown third-party rights were approved. The old um.jfif test image is not promoted. Six current public covers were genuinely downloaded anonymously, decoded and hash-recorded; their hosted objects and selections were not changed. Original files remain intact.

The private batch uploads only missing selected originals, a new Aqaba illustration and content-addressed 320/640/1280/2400 WebP variants where the original supports the size. Images are not upscaled. Existing prepared derivatives are reused; original-six covers are converted at quality 92 in-browser, retaining original full-resolution viewing. Every uploaded byte sequence is read back and hashed. Signed URLs are short-lived, cached in memory, and never stored in reports or payloads. Responsive variants are ordinary private Storage objects, so they do not require a paid transform service.

Genuine public-cover checks: [six actual covers](validation/private-prototype-public-covers.json). Original art: [Aqaba SVG](evidence/private-prototype/aqaba-illustration.svg). All new Phase 08 file-level credits remain in [the source/media register](PHASE08_SOURCE_AND_MEDIA_REGISTER.md).

## Problems fixed

- Optional missing operational information no longer leaves the private prototype unfinished; all supported fields have coherent, explicitly designated demonstration values.
- Draft and pending-translation states remain truthful while the authorized private renderer can display completed content in both languages. Public readers still cannot see drafts.
- JSONB read-back compares canonical object keys while retaining strict text, numeric and array-order equality; PostgreSQL key ordering cannot falsely reject a saved overlay.
- Newly populated Arabic names remain searchable without admitting pending translations into public search. Search results and map markers stay synchronized.
- The 24-card split view exposed an absolute screen-reader status escaping its scroll container and extending the document to 3847px despite a 1154.5px body. A positioned list container fixes the containing block: measured document height 1155px, list viewport unchanged at 418px, all 24 cards remain scrollable. No card or MapLibre design was changed.
- Private account favorites are not sent into published-only account RLS paths; existing saves remain intact and prototype saves work in My Discoveries.

## Tests and verification

| Evidence | Passed checks | Scope |
| --- | --- | --- |
| private-prototype-unit.json | 7 | Real disposable PostgreSQL with all migrations, RLS, current-session authorization and strict validation; synthetic isolated accounts/media |
| private-prototype-browser.json | 8 | Real React UI and browser; isolated Auth/REST/Storage, never a hosted publication claim |
| private-prototype-public-security.json | 4 | Genuine anonymous hosted reads: six public originals, hidden drafts and denied private REST/RPC |
| private-prototype-public-covers.json | 6 | Genuine current public cover download, image decode, dimensions and unchanged original hashes |
| Existing recommendation/search/map/personal regressions | 11 / 6 / 9 / 10 groups | Scoring, Unicode search, MapLibre geographic helpers and account-private personal records |
| Localization / asset validation / Oxlint / production build | Passed | Bilingual resources and existing frontend build; normal large MapLibre chunk advisory retained |

The browser suite covers all 24 detail pages in English and Arabic at desktop, mobile samples including Aqaba, 24 synchronized map markers, header/Arabic/English search, empty/clear results, private favorites, My Discoveries, Surprise Me/Again, responsive images, Axe and horizontal overflow. A five-second tab-away test preserves document, search, MapLibre instance and query count. Logout and denied Admin access restore the public six. Production preview cannot activate the private catalog.

The one-click batch fixture additionally performs actual browser image decoding/WebP generation and byte/hash read-back, then retries without further uploads. Its fixture original-six input bytes are deliberately test media; this proves the pipeline, not hosted destination identity. The page screenshots use actual prepared destination imagery and the original illustration, with intercepted private Storage. No genuine signed-in account acceptance is claimed without the corresponding hosted audit/read-back.

Screenshots: [Explore desktop](../artifacts/private-prototype/explore-en-1366.png), [Arabic desktop](../artifacts/private-prototype/explore-ar-JO-1366.png), [mobile](../artifacts/private-prototype/explore-en-390.png), [Aqaba illustration in details](../artifacts/private-prototype/aqaba-en-1366.png), [Arabic Aqaba](../artifacts/private-prototype/aqaba-ar-JO-390.png), [batch fixture](../artifacts/private-prototype/admin-batch.png). All are fixture UI screenshots, not your account.

Supabase security advisor found no new database RLS/security issue. Its existing leaked-password-protection warning remains a separate Auth configuration item; no Auth settings were changed. [Official remediation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Per-destination preparation and actual visibility

| Destination | ID / slug preserved | Bilingual complete | Prepared private fee range / budget (JOD) | Actual private enabled |
| --- | --- | --- | --- | --- |
| Ajloun Forest Reserve | 6f3ca842-ebdf-42a3-a590-987ae577e759 / ajloun-forest | Yes | 3–8 / 15–28 | Awaiting the one Admin batch |
| As-Salt Historic Centre | 189dc346-58af-42b5-b2da-c862c95f0fca / salt-historic | Yes | 0–0 / 8–18 | Awaiting the one Admin batch |
| Mujib Biosphere Reserve | 0a905153-1e27-44b0-a2d8-3f9b8cf6b089 / wadi-mujib | Yes | 16–23 / 30–50 | Awaiting the one Admin batch |
| Dana Biosphere Reserve | a6b63635-d609-411d-86e2-ccd2ec0bd6af / dana-reserve | Yes | 5–10 / 18–38 | Awaiting the one Admin batch |
| Iraq Al-Amir | 4ec8a105-00a5-4f4b-b410-dbf864343826 / iraq-al-amir | Yes | 0–1 / 7–16 | Awaiting the one Admin batch |
| Umm Qais | 066dbed9-ca25-421e-8187-00fbc78fcda3 / umm-qais | Yes | 1–5 / 12–25 | Awaiting the one Admin batch |
| Petra | 7f3b73ce-008d-4bfa-a75d-68ed3a135392 / petra | Yes | 1–50 / 25–85 | Awaiting the one Admin batch |
| Wadi Rum Protected Area | d278185d-b952-406d-8371-5569816e30e6 / wadi-rum | Yes | 1–5 / 35–75 | Awaiting the one Admin batch |
| Jerash Archaeological City | 3498d3c9-a7ed-41fb-99e2-0296e4664fc4 / jerash-archaeological-city | Yes | 1–10 / 15–30 | Awaiting the one Admin batch |
| Amman Citadel | af3f7f7c-eba4-455b-b334-5009734da5b1 / amman-citadel | Yes | 0.25–3 / 8–18 | Awaiting the one Admin batch |
| Amman Roman Theatre | d2eb511f-3678-4276-9ed7-0ac5d0eac6e8 / amman-roman-theatre | Yes | 0.25–2 / 6–15 | Awaiting the one Admin batch |
| St. George’s Church (Madaba Map) | c8e5e14c-b6fd-42f0-bb82-58e8365cc321 / madaba-st-georges-church | Yes | 1–1 / 6–14 | Awaiting the one Admin batch |
| Mount Nebo | 73ed5471-2ea1-44b8-82df-44c55a62296d / mount-nebo | Yes | 1–3 / 8–18 | Awaiting the one Admin batch |
| Baptism Site (Al-Maghtas) | 240eb332-8372-4da5-a08e-8e7fb05bf75c / al-maghtas-baptism-site | Yes | 3–12 / 18–32 | Awaiting the one Admin batch |
| Karak Castle | 9f3588e1-5674-4bc9-b799-d89b8526b722 / karak-castle | Yes | 0.25–2 / 9–20 | Awaiting the one Admin batch |
| Shobak Castle | 27ef186e-0a77-45e2-a917-d6693b20af62 / shobak-castle | Yes | 0.25–1 / 8–18 | Awaiting the one Admin batch |
| Quseir Amra | c6112825-e51c-49ee-b1eb-aa3202e85cd7 / quseir-amra | Yes | 0.25–3 / 10–22 | Awaiting the one Admin batch |
| Um er-Rasas (Kastrom Mefa’a) | 8babd902-5fd7-4398-bc3e-eca4374deafe / um-er-rasas | Yes | 0–3 / 10–23 | Awaiting the one Admin batch |
| Azraq Wetland Reserve | 9a54d97a-6906-40fa-9c89-bc0bf9656c3f / azraq-wetland-reserve | Yes | 2–8 / 15–30 | Awaiting the one Admin batch |
| Shaumari Wildlife Reserve | 3f2ee950-ff23-4bd7-9078-4e51a3b4b57b / shaumari-wildlife-reserve | Yes | 8–18 / 25–45 | Awaiting the one Admin batch |
| Pella (Tabaqat Fahl) | 16997697-cb9e-4126-b359-b83f1bde762c / pella-tabaqat-fahl | Yes | 0–2 / 8–19 | Awaiting the one Admin batch |
| Umm Al-Jimāl | 15e5f707-72e2-49a7-a908-07c1bbe703c8 / umm-al-jimal | Yes | 0.5–2 / 9–20 | Awaiting the one Admin batch |
| Little Petra (Siq Al-Barid) | 16ebeb33-af96-4da0-854e-b5bea53eebb5 / little-petra-siq-al-barid | Yes | 0–5 / 10–25 | Awaiting the one Admin batch |
| Aqaba Marine Reserve | 242a298c-250a-4ac3-b3eb-fa4ce4fe47f7 / aqaba-marine-reserve | Yes | 0–0 / 20–45 | Awaiting the one Admin batch |

## Files changed and stopping point

Implementation: src/features/prototype/{runtime,model,batch,favorites}.js, PrivatePrototypeNotice.jsx; src/features/admin/PrivatePrototypeBatch.jsx and existing Publishing Workspace insertion; tourism repository/model/hook/visitor cards; bilingual destination/search adapters; recommendation data/features/explanations; relevant page labels; local-only prototype configuration; small Explore scroll containing-block fix. Schema: supabase/migrations/20261022160724_private_mvp_prototype.sql. Preparation and tests: scripts/prepare-private-prototype.mjs, private-prototype-editorial.js, original SVG/raster renderer, public-cover verification/derivatives, isolated fixture/browser/database/security tests and this report generator.

Only the current authenticated Admin browser action remains before the hosted private catalog can be declared 24/24. Actual publication remains 6; original drafts remain 18. No destination is blocked in the prepared private package by optional facts or Aqaba research freshness. No Final QA, deployment or unrelated feature work was started.
