# Phase 08 Lite tourism content import report

Updated 2026-10-22T15:22:16.889Z. **All 18 new destinations are imported as private drafts. Publication is paused by the latest instruction; private draft resume is the next authorized action. No Final QA or Deployment phase has begun.**

## Exact hosted versus prepared counts

Hosted read-back: 2026-10-22T15:15:44.415738+00:00; project `dkhwwvoplhfjccvjegty`.

- Original destinations: 6; all 6 published.
- Newly researched/prepared: 18; no duplicate slugs in package.
- Newly imported: 18. Newly published: 0. Hosted new drafts: 18.
- Hosted total: 24; published total: 6.
- Locally prepared private-draft candidates: 18; photo-covered candidates: 17; 1 candidates have additional publication blockers. All still require genuine authorization and mandatory backend checks.
- Prepared media: 30 visually checked, rights-documented photos; 21 hosted private image objects confirmed; 9 additional prepared photos await authorized upload.

[Hosted read-back](validation/phase08-hosted.json); [baseline](validation/phase08-baseline.json); [completeness matrix](PHASE08_DESTINATION_COMPLETENESS_MATRIX.md); [source/media register](PHASE08_SOURCE_AND_MEDIA_REGISTER.md). Fingerprints for the original six place rows, their translations/images, original Storage objects, roles and buckets match the baseline after the genuine Admin import. See phase08-post-import-preservation.json. New rows/objects are counted separately.

## Resumed work and implementation

Read the complete 18-destination dossier, preserved its original bytes/hash, reconciled against the six hosted records and reused the seven existing categories. No new tables, migrations, permission changes or destination writes through management SQL. All 18 original EN/Arabic descriptions, activities, source references, locality/governorate, visitor cautions, qualified fees/hours and approximate coordinates are staged. Numeric universal price fields remain NULL where visitor-category rules differ; optional unavailable facts are explained. Duration guidance is explicitly editorial. No exact entrance, public-transport connection or accessible route is fabricated.

The Admin batch is integrated into the existing Publishing Workspace, with one private-draft import action, per-record partial success, checksum validation, full authorized-dataset duplicate preflight, protected original IDs/slugs, provenance checks, immutable hash-based private uploads and byte read-back. Retry never overwrites changed text or existing publication states. Existing audit triggers and guarded RPCs remain authoritative. Logout/account change stops subsequent writes.

Publication is separate: an unchecked explicit batch review attestation is required to record genuine Admin approval; source preparation is identified as machine-performed. Backend content/location/image-rights/Arabic checks must pass. One blocker does not prevent importing other drafts. No service-role key, forged JWT, SQL impersonation or password export is used.

## Minimal authorized action

Open [Admin batch import](http://127.0.0.1:4184/admin/publishing#phase08-import) in the same browser profile where your Admin sign-in works. Click **Reload package and hosted status**, then **Import or resume private drafts**, and keep the page open. This resumes the same 18 IDs, uploads only missing prepared media and repeats read-back; it does not restart the import. Review individual results; download the credential-free log. This imports draft content and private media without publication approvals.

**Publication is paused by your latest instruction. Do not publish now.** The next action is private draft resume only. Any later publication still requires a genuine explicit Admin attestation, fresh evidence and every existing backend safeguard. No attestation is inferred from password recovery or these automated checks.

The browser connector currently exposes no browser or authenticated session, so we cannot execute that account-bound action remotely. No password, token or cookie is needed in chat. Background research, media preparation and isolated testing continue independently.

## Confirmed import blockers and full hosted audit

The four reported bilingual failures were not missing translations: Wadi Rum, Al-Maghtas, Quseir Amra and Umm Al-Jimal retained exact bilingual content. PostgreSQL float8 values are binary-identical to the prepared coordinates, while extra_float_digits=0 emits 15 significant digits in JSON. Exact JSON-number comparison produced false failures. Aqaba has the same representation. The fix canonicalizes only finite latitude/longitude numbers to that proven representation; every text, category and provenance check stays strict. No coordinate or translation rewrite is necessary. Tests reject text changes, numeric strings and meaningful coordinate changes. See validation/phase08-coordinate-roundtrip.json and validation/phase08-hosted-audit.json.

All 18 actual IDs, slugs, EN/Arabic fields, category associations, coordinate bytes, source notes and linked image evidence were audited. All 21 linked image objects exist in private Storage with expected file sizes and evidence. No new image is approved. The current hosted ready-to-publish count is **0** because explicit source/location/Arabic/image approvals are pending. **17** candidates have complete prepared covers and no package-level critical blockers; this is eligibility for explicit review, not a publication success. Aqaba remains blocked.

## Photography and delivery

Original licensed files are archived unchanged locally; no stock or generated substitute used. Original hashes are checked against file-level Commons metadata. Responsive WebP sizes 320/640/1280/2400 are generated without upscaling at quality 92. Oversized upload copies fit the existing 5 MiB restriction with disclosed proportional JPEG conversion; full-resolution sources remain archived. Supabase private signed transform delivery and cache invalidation are reused; no paid feature or public draft bucket enabled. Actual hosted derivative/image URL checks remain pending the Admin operation.

## Historical regression repair

The five scripts previously asserted retired demo counts, removed account/Visited placeholders, fixed obsolete card geometry and eager decoding of offscreen images. Their exact historical implementations remain as *.legacy.mjs and can be selected using QA_LEGACY_DEMO=1. Default coverage now follows the actual application: responsive route/keyboard/Axe checks; Phase 05 preference/ranking/failure journeys; Phase 06 auth/recovery/account/reduced-motion fixtures; Phase 07 merge/saved/visited/history/isolation fixtures; current landing and global responsive geometry. Static sample card counts are not a valid hosted inventory assertion. Current tests still reject overflow, lost focus, runtime errors, wrong privacy behavior and broken interactions. This is test maintenance, not authorization to change the approved design.

## Validation results

| Evidence | Result | Scope |
| --- | --- | --- |
| phase08-browser.json | 5 passed entries | Real browser and application UI with isolated fixture Auth/REST/Storage; no genuine account or hosted import accepted |
| phase08-coordinate-roundtrip.json | 0 passed entries | Actual hosted SELECT, original float8 wire bytes; no updates |
| phase08-current-all.json | 90 passed entries | Read individual results for scope |
| phase08-current-landing.json | 6 passed entries | Read individual results for scope |
| phase08-current-scale.json | 90 passed entries | Read individual results for scope |
| phase08-expiry-audit.json | 0 passed entries | Read individual results for scope |
| phase08-freshness.json | 12 passed entries | Pure expiry/security tests against actual revalidation metadata; no hosted writes or approvals |
| phase08-media.json | 30 passed entries | Real local downloaded files and genuine Pillow decoding/hash checks; no hosted upload, approval or rendering claim |
| phase08-post-import-preservation.json | 0 passed entries | Read individual results for scope |
| phase08-public-browser.json | 8 passed entries | Real anonymous hosted/browser reads. New-destination public acceptance only counts actually published records. |
| phase08-regression-summary.json | 5 passed entries | Historical demo contracts retained; current replacement suites genuinely executed. First attempt failure retained; only failed responsive suite rerun after test correction. |
| phase08-storage-readback.json | 0 passed entries | Read individual results for scope |
| phase08-unit-database.json | 10 passed entries | Local package validation and real disposable PostgreSQL with real RLS; zero hosted writes. Synthetic test users never exist in hosted Supabase. |

Browser tests exercise real React UI with intercepted isolated Auth/REST/Storage when identified. Disposable PostgreSQL replays real migrations and RLS with synthetic test accounts. Neither proves hosted import/publication. Genuine hosted reads confirm all 24 records: six originals published and 18 new drafts. Public integration for new destinations remains pending actual publication; existing Home, Explore, search, map and recommendation tests must be read within their stated scope.

## Files and limitations

Primary implementation: src/features/admin/Phase08Import.jsx; src/features/admin/phase08Import.js; existing AutomatedPublishing.jsx insertion; bilingual locale keys. Preparation: supabase/content/phase08-editorial.js, phase08-destinations.json; scripts/research-phase08*.mjs, prepare-phase08-package.mjs, prepare-phase08-media.mjs, phase08-image-derivatives.py, checkpoint/finalize/review scripts. Validation: check-phase08.mjs, phase08-browser-fixture.mjs, check-phase08-browser.mjs, current regression helpers. Evidence remains under docs/evidence/phase08; screenshots under artifacts/phase08.

Remaining now: authorized resume for missing private media and hosted read-back. Publication stays paused; later explicit approval and eligible publication would be followed by genuine new-destination public integration checks. All five reported missing-cover cases have prepared licensed covers. Aqaba remains blocked by legal visitor arrival and exact photo identity. Optional unavailable fees/hours/facilities remain honestly unknown. Wikimedia throttling is respected rather than bypassed. The approximately 24-destination target is not a reason to fabricate completion.

## Evidence expiry repair and current window

The quoted warning came from the **original-six** workflow, src/features/admin/automatedPublishing.js, not a failed Phase 08 import. Its package was built 2026-10-19T18:11:37.728Z; its six combined source/licence records date from 19 October. Those checks are expired and were deliberately left unchanged. That workflow is now a collapsed, explicitly labeled previous package; its expired publish action remains disabled. Its warning no longer appears as a Phase 08 error.

Phase 08 source checks were genuinely performed on **21 October 2026**, not renewed by report generation on 22 October. The revalidation ledger covers all 18 destination content hashes and 34 individually checked Commons originals, of which 30 photos remain selected. Original acquisition dates, licence evidence and stored content hashes are preserved. Current freshness: **18/18** at 2026-10-22T15:22:16.897Z. The earliest required check expires **2026-10-22T19:15:32.151Z**, or **Thursday, 22 October 2026 at 22:15:32 GMT+3**. This is the existing 24-hour rule, unchanged. After that time a genuine evidence refresh is required for publication; private draft resume remains available.

Rebuilding a package cannot renew source or licence timestamps. Publication checks require per-source proof fingerprints and matching content, and per-file response fingerprints, revision, original hash and unchanged licence metadata. Missing, future, failed or expired checks block publication. The UI rechecks freshness every minute and resets the review attestation when the package reloads. No approval, publication or hosted write was performed during this repair.

Evidence: [expiry audit](validation/phase08-expiry-audit.json), [source/licence ledger](evidence/phase08/verification-ledger.json), [captured live checks](evidence/phase08/revalidation-current.json), [explicit source reinspection notes](evidence/phase08/revalidation-observations.json). Failed origin requests are retained as failures; alternative successful official-page inspections are separately identified. Assistant evidence checks are not personal administrator approval.

## Expiry-repair validation and exact next action

- Fresh hosted SELECT at 2026-10-22T15:15:44.415738+00:00: 24 destinations, 6 originals published, 18 imported, 18 new drafts, **0 newly published**. All 18 bilingual read-backs pass; original-six full rows and relationships are unchanged. Storage objects were separately reread; historical role/bucket fingerprint checks retain their original verification date.
- 17 prepared candidates have no package-level critical blocker; **0 hosted drafts are ready for publication**, since mandatory source/location/Arabic/image approvals remain pending. Aqaba remains blocked by exact legal arrival/zoning evidence and a suitable visually verified cover.
- 12 pure freshness/security cases pass, including exact expiry boundary, rebuilding stale evidence, content changes and changed/failed image checks. Five browser fixture groups pass: EN/Arabic at desktop/mobile plus stale-to-fresh Reload behavior; private resume and refresh, no full document reload, safe retry, Axe checks and blocked Aqaba. These use isolated Auth/REST/Storage, not your signed-in account.
- Disposable database/RLS tests, existing regressions, media hashes/dimensions, localization, asset validation, Oxlint and production build passed. Genuine anonymous public checks cover the existing six; new-destination public acceptance remains pending because none is published.
- Browser screenshots: artifacts/phase08/batch-*.png. No authenticated browser session is exposed to the tool, so the real resume operation remains yours to execute.

Open [the Phase 08 Admin panel](http://127.0.0.1:4184/admin/publishing#phase08-import). Click **Reload package and hosted status**, then **Import or resume private drafts**. Keep the page open until completion. This preserves all 18 IDs and uploads only the 9 missing selected photos; it does not approve or publish. Do not use the previous original-six publishing action.

Expiry-repair files: src/features/admin/phase08Freshness.js; Phase08Import.jsx; phase08Import.js; AutomatedPublishing.jsx; bilingual locale keys; scripts/revalidate-phase08.mjs; record-phase08-reinspection.mjs; compile-phase08-revalidation.mjs; prepare-phase08-package.mjs; check-phase08-freshness.mjs; check-phase08-browser.mjs; document-phase08-revalidation.mjs. Existing source content, database schema, permissions and publication states are unchanged. No Phase 14 or 15 work started.
