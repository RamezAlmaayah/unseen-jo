# Simple Admin Quick Edit — Phase 04L

Implemented on 19–20 October 2026 (Jordan time) for the existing Unseen Jo app and Supabase project `dkhwwvoplhfjccvjegty`. Phase 05 has not started.

The image workflow described below has been superseded by [Simple Image Management](SIMPLE_IMAGE_MANAGEMENT_REPORT.md): routine image editing no longer presents licensing forms.

## Where to use it

Open [Admin → Places](http://127.0.0.1:4184/admin/places) and choose **Edit** on any destination. Existing Edit actions now open Quick Edit by default. **Create Place** opens the same editor for a new private destination.

Example: [Wadi Mujib Quick Edit](http://127.0.0.1:4184/admin/places/0a905153-1e27-44b0-a2d8-3f9b8cf6b089).

The existing dashboard layout, navigation, branding and public design are retained. The full original review editor remains available under **Advanced Details → Full review tools** (`?advanced=1`). Routine editing does not require visiting it or the separate translation-review screen.

## Editing workflow

**Select Place → Edit → Save Changes.** The page contains:

- English and Arabic name, description, city and region together.
- Actual cover/gallery previews and file upload controls.
- Categories, visit duration and admission price ranges in JOD.
- Confirmed opening hours, activities, visitor information, address, best time and transport in both languages.
- The existing interactive coordinate picker and editable coordinates.
- Preview, status and save feedback on the same page.

Unknown prices and unconfirmed opening hours stay blank. No tourism facts or translations were invented or filled automatically.

Source evidence, geographic precision, review notes, old review tools and audit navigation are inside **Advanced Details**. Image attribution and rights are expandable within each photo, and Storage paths are nested inside **Technical information**. These are not normal editing fields.

English and Arabic remain independent database fields. The editor loads the latest complete bilingual/media snapshot and its concurrency version together. An English edit does not generate or replace Arabic text. Every apply checks English, translation, category-link, media and review versions together; concurrent changes reject the save instead of overwriting newer manual work.

## Save and publication semantics

| Situation | Save result |
| --- | --- |
| Existing destination, ordinary typing | A private working draft autosaves after 1.5 seconds of inactivity. Public rows and caches are unchanged. |
| Published destination, verification unchecked | **Save Changes** saves privately; the existing public destination remains intact. |
| Published destination, single inline verification checked | One atomic operation records the actual Admin's explicit source/location/bilingual verification and applies the changes only if all existing publication checks pass. It remains published. |
| Draft destination | Save updates the private destination and translation. It remains a draft even if the inline review is checked. |
| Archived destination | Save preserves its archived status. |
| New destination | First Save creates a private draft and its Arabic content atomically. Save once before uploading photographs. Subsequent edits can autosave. |
| Failed validation / insufficient rights / stale edit | No partial public update. The transaction rolls back; the private working draft and visible edits remain available. |

The inline verification says: **“I checked the text, location and source evidence, and compared the Arabic and English. Save these as reviewed changes.”** It starts unchecked and is never restored from autosave. This replaces navigating through separate source, translation and publication screens for an already-published update; it does not manufacture a human review.

For a published save, the existing draft-only guards run inside a single database transaction, followed by the existing review and localized-publication validation functions. Other sessions see the old published version until the complete new version commits. There is no externally visible unpublish/re-publish interval. If any step fails, the original publication status and public content remain unchanged.

Existing unpublished destinations cannot be published by the Quick Edit apply operation: only a record that was published at the start can finish published. There is no Publish button in Quick Edit.

Private working drafts are saved in an Admin-only, account-owned table, not browser local storage. They restore after refresh. Pending changes also flush on SPA navigation. A browser refresh before an unsaved draft is stored uses the normal unsaved-change warning. Delayed save requests are bound to the originating account and are rejected after account switching. New records do not autosave before their first explicit creation.

When another editor changes the saved destination, an older private working draft is retained and identified as stale. It is not silently rebased onto newer manual text. Discarding that private draft requires an explicit confirmation and does not alter saved destination content.

## Photographs

The editor provides **Replace Cover Image**, **Upload New Image / Add Gallery Images**, **Select Existing Verified Image**, **Use as cover**, **Remove Image** and gallery up/down controls.

- File upload changes actual image bytes, never a citation URL. It uses a new destination-scoped UUID path and `upsert:false`; linked originals are never overwritten.
- JPEG, PNG and WebP retain their original uploaded bytes within the established 5 MiB limit. Files above that limit are rejected rather than silently recompressed.
- Existing protected image delivery creates responsive 320/640/1280/2400 variants on demand as appropriate. The original remains available separately; no public bucket or paid service was introduced.
- The replacement cover and responsive versions acquire new cache identities. Successful apply clears Admin signing/preview caches and the public catalog/detail/image caches.
- Replacing a cover retains the previous photo in the gallery, with its own evidence and recorded approval. Selecting an already-verified image is limited to this destination's media, avoiding accidental use of another destination's photo.
- New uploads start private and unapproved. Each photo has a single explicit rights confirmation beside attribution, citation, license basis and evidence. The existing approval function still requires saved evidence and an uploaded object. No license is inferred from a URL, filename or previous photograph.
- Editing attribution, alt text or rights metadata marks the working image pending; the backend independently resets approval when that metadata changes. Reordering or changing the cover role alone preserves the existing rights approval on unchanged bytes.
- Unapproved images remain hidden from public queries. A pending cover blocks a published update. Pending gallery uploads do not become public merely because other changes pass validation.
- Remove unlinks the chosen image on Save; its original Storage bytes are retained. Removal of a required cover cannot commit a published destination without another eligible cover.
- Uploaded files are private before association. A failed or abandoned edit can leave a private file for the existing Advanced unlinked-upload maintenance. There is no unsafe automatic deletion after an ambiguous save.

## Public updates and state

The successful apply operation uses the existing same-origin event/BroadcastChannel invalidation. Home, Explore, Place Details and map data refresh from live public Supabase queries. Private autosaves do not invalidate those public caches.

An open Explore preview now resolves its destination from the current catalog rather than retaining an old object. During background revalidation of the same public resource, the last successful published snapshot remains mounted until the fresh read completes. This keeps open previews and map selection available during an Admin update. Changing resources/data modes and explicit retry still follow the normal loading/error paths; no private Admin data enters the public cache.

Home still shows its approved first-three featured selection. It does not automatically feature every edited destination, and the approved hero artwork is independent of destination cover files. Tests use a clearly isolated fixture with Wadi Mujib featured to verify Home cover updates without changing that editorial/design rule.

BroadcastChannel is scoped to the same browser origin. Other browsers or a development/preview origin need a fresh read/reload; the existing public read cache is 60 seconds and signatures are reused for 270 seconds within their 300-second lifetime. This is not a global realtime subscription or retroactive revocation of already-downloaded images.

## Validation evidence

| Check | Result and scope |
| --- | --- |
| `check-quick-edit-database.mjs` | 10 passing disposable PGlite/PostGIS groups: full migration replay, active-session/RLS isolation, owner-only private drafts, autosave concurrency, bilingual creation, draft-status preservation, explicit rights review, atomic published edits, rollback for pending covers/invalid rights/unsafe geography, actual cover-path replacement, verified selection/reorder/unlink, immutable IDs/slugs, stale-dependency rejection, snapshot consistency and cross-account delayed-save rejection. No hosted content writes. |
| `check-quick-edit-model.mjs` | 4 passing groups: incomplete/private drafts, independent manual text, rights confirmations never autosaved, real Arabic resources, real SDK builders with fake transport, no public invalidation on private save, invalidation on apply, account binding and bilingual public visitor-field mapping. |
| `check-quick-edit-browser.mjs` | Four passing full browser flows: desktop English and mobile Arabic in development and production preview. Covered private autosave, refresh restoration, unchecked review after restore, private Save, reviewed live update, pending-cover rejection, actual new image bytes/path, private preview and Home/Explore/Details rendering. Four initial axe audits had zero WCAG A/AA violations; no horizontal overflow or page errors. |
| Focused browser retest (`--focused`) | Passing additional development/desktop flow covering an already-open Explore preview and selected MapLibre popup receiving new text/photo data, gallery reordering, selection of an existing verified cover and explicit image removal. Also reran replacement after the image-metadata pending-state improvement. |
| `check-quick-edit-hosted.mjs` | Genuine anonymous reads confirmed the project, six existing public records and the new public optional columns. All three private Quick Edit RPCs and the private workspace table rejected anonymous access with `42501`. No owner credentials, fake sessions or stored mutations were sent to the hosted project. |
| Existing CMS migration suite | 12 passing groups, including original publication, Storage immutability, RLS and cover-replacement safeguards. |
| Existing localization suite | 6 passing groups; static resource audit reported no missing keys. New resource tests also check that Arabic labels contain actual Arabic characters. |
| Existing performance/security and image-delivery suites | 7 and 6 passing groups respectively; Auth isolation, deduplication, signing, invalidation and original/derivative integrity retained. |
| `npm run validate` | Oxlint without warnings, 83 local asset references / 48 original hashes, and production build passed. Existing large MapLibre/main bundle warnings remain. |

Machine-readable results are under `docs/validation/quick-edit-{database,model,browser,hosted,preservation}.json`. Browser screenshots are under `artifacts/quick-edit/`.

Final genuine public regressions passed all 12 destination/language image flows, with two live accessibility audits reporting zero violations. Wadi Mujib's Arabic fallback was correctly checked against its actual public translation state. The live MapLibre popup retained its canvas, photo URL, selection and zoom after controlled 5- and 30-second visibility returns, with zero new image requests and no page errors. These were anonymous hosted reads, not intercepted public data. See `live-tourism-image-tests.json` and `live-map-image-reuse.json`.

An earlier public run encountered a navigation timeout; the final complete run passed. The older test also assumed every Arabic review was current. It now derives expected fallback behavior from genuine public review data, rather than changing or approving hosted translations to satisfy the test. No before/after speed benchmark is claimed for this editor task.

**Genuine owner-account acceptance was unavailable:** the connection inventory exposed no browser or tabs. Admin browser tests used isolated, fully intercepted Auth/REST/RPC/Storage fixtures; database tests used simulated sessions in a disposable database. These are not presented as hosted authenticated create/edit/upload success. The real hosted checks were read-only/permission denial and structural verification.

## Hosted preservation and remaining reviews

The dedicated MCP connection and original Supabase configuration were preserved. Additive migrations installed the private working-draft table, nullable optional visitor fields and caller-authorized functions; no role assignments, bucket policies, publication guards or existing Storage access controls were weakened.

Hosted fingerprints compare all existing destination fields, translations, image rows and Storage metadata/timestamps before/after, excluding only the newly added nullable columns from the original-row comparison. All four fingerprints matched exactly. There were zero hosted private workspaces after testing. The actual project already had six published destinations at the start; this task did not publish those records or create hosted destinations.

Wadi Mujib has one pre-existing Arabic review issue: its destination timestamp is `2026-10-19T19:24:18.983976Z`, while Arabic points to `2026-10-19T19:22:47.058963Z`. Its public Arabic fallback notice is therefore correct. Compare both languages in Quick Edit and explicitly verify the changes when ready; this task did not advance its review or overwrite its manually written Arabic. The other five translations were current at inspection.

The previously documented Wadi Mujib Google image-result citations also still differ from the retained Wikimedia license evidence. They need human reconciliation before those changed source references can be treated as evidence for different files. No referenced replacement image was downloaded or approved automatically.

Security advisors retained only the existing [leaked-password-protection warning](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No Auth setting was changed.

## Main modified files

- `src/features/admin/QuickPlaceEditor.jsx`, `quickEditModel.js`: default integrated editor, photo controls, source/rights disclosure, preview, private autosave and one save workflow.
- `src/features/admin/AdminApp.jsx`, `repository.js`: default routing, account-scoped repository, draft/apply APIs, immutable uploads and correct cache notifications.
- `supabase/migrations/20261019203241_phase04l_quick_edit.sql`, `20261019204256_phase04l_quick_edit_snapshot_safety.sql`: additive schema, owner RLS, audited atomic operations, consistent snapshots and originating-account checks.
- `src/i18n/destinations.js`, `src/features/tourism/{model,repository,useTourism}.js`, `src/pages/{ExplorePage,PlaceDetailsPage}.jsx`: optional bilingual visitor data and current public preview/revalidation behavior.
- `src/features/admin/DraftPreview.jsx`, `src/styles/admin.css`, bilingual resource source/generated files: matching private previews and responsive/RTL editor layout.
- New `scripts/check-quick-edit-*.mjs`, plus existing live-image and legacy-cover browser checks adjusted to verify actual current translation state / the retained Advanced editor.

No Phase 05 work, publication of draft destinations, tourism research/content rewrite or unrelated image replacement was performed.
