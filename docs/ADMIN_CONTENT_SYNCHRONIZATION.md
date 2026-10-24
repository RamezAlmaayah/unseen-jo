# Admin content synchronization — local execution guide and verification

Revision: **23 October 2026**. Target: `dkhwwvoplhfjccvjegty`.

**Implemented locally; no hosted synchronization or deployment performed. Hosted write hold remains in place for this development task.** The website administrator can later execute translation batches from the application's own authenticated browser session. Full content synchronization remains **BLOCKED** by the existing-image approval limitation described below. This tool does not imply production release approval.

## What is available

Local route: **`http://127.0.0.1:4184/admin/content-sync`**. The local Admin sidebar includes **Content synchronization**. Use the exact local origin on which the administrator is already signed in; `localhost`, `127.0.0.1` and different ports have separate browser storage. A signed-in tab on another origin does not confer a session on this page. Use the ordinary existing Admin sign-in when needed; never extract or transfer its session credentials.

- Credential-free, SHA-256 pinned package: 24 destination baselines, all 19 approved Arabic proposals, 30 existing image mappings and four excluded candidates.
- Read-only hosted preview verifies the user with Supabase Auth and the existing `admin_cms_status` server guard. Client-side role metadata is not authorization.
- Every Arabic field has a saved/proposed comparison and expandable English source. All 11 fields are retained, including region, hours, activities, visitor information and guidance.
- Recorded source/licence/creator/identity evidence, original hash and rendition hashes are available for every selected photograph. These are recorded reviews, not a new rights certification.
- Explicit selection, an initially unchecked confirmation, a confirmation dialog and batches of **1, 3 or 5**. No automatic execution on opening, checking, selecting, or cancelling.
- Version-checked updates of existing `ar-JO` rows, followed by the existing translation-review operation and readback. No translation insertion/upsert, duplicate image insertion, uploads or destination status/English mutations.
- Downloadable fresh content snapshot and per-batch result. The snapshot includes all current destination, Arabic, image and category projections and the preview assessment. It excludes sessions, Auth data, reviewer identifiers and private feedback. It is **not** a complete database/Storage backup.
- Live progress, stop-after-current-request, honest partial/ambiguous outcomes, final preservation checks, and repeat detection. No automatic retry of failed mutations or automatic next batch.
- English/Arabic controls, RTL/LTR content blocks, responsive comparisons, native keyboard-accessible confirmation dialog and focus styles. No new animations.

The production build hides the navigation entry and returns an unavailable notice at this route. The execution interface is eliminated from that route's production chunk and the prepared JSON is not copied into `dist`. The local gate is an availability safeguard; existing backend authorization remains the security boundary.

## Exact instructions for later authorized execution

These steps are for the administrator to perform deliberately **after deciding to resume hosted writes**. The development/testing agent has not performed them against hosted data. Existing content approval does not need to be repeated.

1. Keep the existing private backup and rollback plan in `artifacts/content-sync/`. If the local server is not already running, run `npm run dev -- --host 127.0.0.1 --port 4184` from the project. Do not start a second server on an occupied port. Do not deploy this tool.
2. In the browser/profile used for the normal Unseen Jo Admin session, open **Admin → Content synchronization** at the local route above. The ordinary Admin route guard must allow access. Opening the route alone performs no content write.
3. Confirm the displayed project is `dkhwwvoplhfjccvjegty`. Click **Check hosted preview**. This performs read-only authentication/version checks. If it fails, stop; do not copy tokens or use a management SQL connection as a substitute session.
4. Click **Download fresh content snapshot**, save it privately with a dated name, and retain the original backup. Open the 19 translation comparisons and **Review all image mappings and evidence**. Check IDs, slugs, all text, source versions and recorded review caveats. No image action is executable.
5. If any destination changed, **the entire batch is blocked**. If an Arabic row changed, it is marked **Conflict — skipped** and cannot be selected. Do not renew its timestamps or overwrite it. Reconcile the newer content and prepare a reviewed replacement baseline separately. Regenerating the same old package does not resolve a conflict.
6. Select eligible translations individually or with **Select eligible translations**. Leave the default batch size at 3, or choose 1 or 5. Only the first selected records up to that size are included. Check **I reviewed the preview and want to synchronize this selected batch.**, then click **Review batch confirmation**.
7. Review the exact slugs in the dialog. **Cancel/Escape does not write.** Clicking **Synchronize this batch** is the explicit action that writes the Arabic updates/reviews to hosted Supabase using this browser's existing session. It does not approve images or change destination statuses.
8. Keep the page open. **Stop after the current request** prevents subsequent operations; it cannot undo an in-flight request. Read each result. Download **Download detailed batch result** before beginning another batch; give each downloaded file a distinct dated name. Reports are kept in memory, not silently persisted in browser storage.
9. Click **Check hosted preview** again before the next batch. Already matching, current, reviewed rows are marked **Already applied — skipped**. Select the remaining eligible rows and repeat the explicit confirmation. There is no automatic continuation.
10. After the last batch, check another fresh preview and save its snapshot. For successful translation-only completion all 19 should be **Already applied — skipped**, all 24 destination baselines should still match, and no destination/image/category preservation failure should be reported. Independently review guest Arabic rendering and Admin → Places in the normal website. Image activation remains blocked; do not describe the full content sync as complete.

No migration, SQL command, new provider, password reset or service-role configuration is required for the supported translation operations. If hosted permissions/schema differ from the inspected migrations, stop on the reported denial; do not add privileges or bypass RLS.

### Interpreting failures

| Outcome | Meaning and next action |
| --- | --- |
| Applied and read back | That row's complete proposed Arabic is current and reviewed in the readback. Check final preservation results as well. |
| Already applied — skipped | The desired text/source/review already exists; no repeated mutation was needed. |
| Conflict — skipped | A version or baseline differs. No stale overwrite is attempted. Reconcile separately. |
| Text saved; review pending or unverified | Text saving returned successfully, but review/readback did not complete conclusively. Do not claim public activation. |
| Failed or outcome unverified | A request failed or its reply was lost. The server may have committed it; inspect a fresh preview instead of blindly retrying. |
| Not attempted | Execution stopped before this record. |
| Final verification unavailable/failed | No full preservation claim is possible. Stop, retain the reports and investigate. “passed” verifies the reported readback, not that every selected row succeeded; read individual outcomes. |

A committed text save advances its version. If its review did not complete, a new preview intentionally treats it as a conflict against the original approval baseline. An authorized administrator must inspect the saved text and reconcile/review it through the existing bilingual review interface or prepare a refreshed reviewed baseline. This tool never silently adopts a new timestamp. An ambiguously committed **review** is recognized as already applied if its full text/source/review matches on the next read.

## Existing database limitation: images

The selected 30 photographs are already linked by existing image IDs and paths. There is no missing association to insert. They are unapproved in the saved baseline. All 120 optimized rendition paths were present in the earlier inventory check; this implementation neither reuploads nor exposes them.

Existing migrations establish the following constraints, reproduced in disposable PostgreSQL:

1. `admin_approve_image` requires the real Admin context, saved evidence, Storage presence and expected image version. Its image UPDATE is rejected by published-dependency guards for a Published parent.
2. `admin_save_simple_images` has scoped permission to save an image arrangement while keeping the parent Published. However, `simple_image_payload` forces `rights_confirmed=false` for **existing** image IDs. The RPC approves only newly inserted rows, so it cannot activate the selected existing 30.
3. `admin_apply_quick_edit` performs broader source/status/review changes, including an internal Draft transition. It is not appropriate for this synchronization's preservation requirement and is not called.

Therefore the tool exposes **no image mutation operation**. It does not insert replacement rows to force approval, temporarily change Published/Draft/Archived, manufacture ownership declarations, enable private prototype renditions publicly, or change grants/RLS. Completing image activation requires a separately reviewed supported database operation that can approve existing licensed rows while preserving the parent's content and status. No such operation or migration has been added or authorized for deployment here.

The four excluded candidates remain `madaba-st-georges-church-1` (reproduction/display identity), `umm-al-jimal-1`/`-2` (underlying interpretation-panel works) and `aqaba-marine-reserve-1` (exact subject/reserve relationship). The older Umm Qais test upload and Wadi Mujib's existing inconsistent Google search citation also remain outside this tool's approvals. See the existing Phase 14.1 image review for full evidence and obligations, including attribution, modifications and ShareAlike.

## Authorization, integrity and reporting

`createContentSyncAdapter` receives the **same** `getAdminClient()` and repository used by the guarded Admin workspace. Before the preview and each mutation boundary, `getUser()` and `admin_cms_status` revalidate the actor and backend Admin context. A sign-out/account change stops further work. RLS, active-session checks and server-derived review identity/time remain unchanged.

The adapter allowlists only the 11 Arabic fields, approved source version and pending status for the text step. Its UPDATE has `place_id`, `locale` and exact `updated_at` filters and expects one returned row. Existing `repo.reviewTranslation` independently checks that saved version. Six proposals need text/source refinements; the other 13 ordinarily need only the review step. PostgreSQL triggers assign reviewer identity/time and clear resolved private feedback. No frontend role declaration or package field grants authority.

Each row is processed sequentially. Before writing, the runner rereads the full 24-destination scope and compares baseline content, IDs/slugs, timestamps and statuses, then rechecks the selected translation and the preview's version. UTC microseconds are preserved in comparison; timestamp parsing does not truncate conflicts. The final read checks destination preservation, image/category preservation, unselected translation preservation and successful reviews. A concurrent unrelated edit can cause final verification to fail; the tool records it rather than trying to restore over newer data.

**Text saving and review are not one transaction.** Neither is a multi-record batch. Storage is not written at all. Timeout/lost-reply states, committed pending text, failed reviews, unattempted records and final-read failures remain distinct. Downloads include expected/saved/verified versions, changed fields, individual outcomes, image limitations, verification flags, warnings, timestamps and the package digest. No cross-Storage/database atomicity is claimed.

## Local verification

All Supabase browser requests in the acceptance tests were intercepted **before navigation**; isolated contexts used synthetic accounts and saved public-content fixtures. Unexpected remote requests were aborted. The user's browser/profile/session was not accessed. Database tests used disposable PGlite with the actual repository migrations, not hosted Supabase or a reset of any linked database.

| Check | Result / evidence |
| --- | --- |
| `npm run test:content-sync` | **13 PASS** groups: package/digest/rights, microsecond versions, read-only preview, confirmation/batch limits, conflicts, all 19 in batches, no repeated writes, CAS race, revocation, lost replies, cancellation/account switch, readback failures and adapter denials. [Evidence](validation/admin-content-sync-model.json). |
| `npm run test:content-sync:database` | **8 PASS** groups: all migrations, 24 disposable Published destinations, guest/ordinary/revoked RLS denial, all 11 fields and server-derived reviewer, duplicate/CAS protection, stale-source rejection, image limitation, preservation of destinations/images/categories/two synthetic Admin memberships. [Evidence](validation/admin-content-sync-database.json). |
| `npm run test:content-sync:browser` with local dev/production preview URLs | **9 PASS** groups: English/Arabic at 1366 and 390px; all comparisons/mappings; downloads without Auth/reviewer credentials; no horizontal page overflow; axe WCAG A/AA checks with no violations in tested states; reduced-motion mobile; Escape cancellation; repeated-click prevention; partial failures/conflicts; guest/non-Admin denial; production unavailability/no package request. [Evidence](validation/admin-content-sync-browser.json). |
| `node scripts/check-auth-premium.mjs` | **PASS** isolated incorrect password, password visibility/Enter, recovery/resend cooldown, Admin login/denial/recovery, English/Arabic desktop/mobile and accessibility regressions. No real mail/account action. |
| `npm run test:accounts` | **PASS** existing nine account/auth/RLS/callback regression groups in disposable PostgreSQL/fixtures. |
| `node scripts/check-quick-edit-model.mjs` | **4 PASS** existing autosave/actor/invalidation/bilingual-field checks. |
| `node scripts/check-destination-status.mjs` | **8 PASS**, including all six directed status transitions and preservation. An initial concurrent run exhausted Node memory; the isolated rerun passed. No test was disabled or weakened. |
| `node scripts/check-destination-status-browser.mjs` | **PASS** Admin → Places in English desktop/Arabic mobile fixtures: three-option dropdown, six directed transitions, explicit save, reload persistence, pagination and conflict/retry handling. No hosted mutation. |
| `node scripts/check-phase14-1-content.mjs` | **5 PASS** groups: 24 IDs/statuses, exact 19 proposals, complete Arabic/null parity, no unsafe HTML/secrets, evidenced private cover mappings. |
| `npm run test:localization` / `npm run audit:localization` | **6 PASS** groups / zero missing static resources. |
| `npm run validate:assets` | **PASS**, 83 references / 48 unique originals. |
| `npm run lint` / `npm run build` | **PASS**. Existing >500 kB main/map bundle warnings remain. No production deployment. |

The final production route chunk is **764 bytes**, contains the unavailable notice, contains neither the execution function nor the prepared-package path, and `dist/supabase/content/phase14-admin-sync.json` does not exist. Local screenshots were visually reviewed in English desktop and Arabic mobile. Temporary QA servers used ports 4197/4195; the user's application on 4184 was not stopped or replaced.

PGlite exercises real PostgreSQL triggers/RLS with minimal local Auth/Storage contracts. It does not verify hosted migration parity, genuine Supabase Auth session behavior, real Storage bytes/public delivery or the actual administrator's connected tab. Those remain deliberate authorized execution/acceptance checks, not claims made by fixture tests. No Docker/WSL installation was attempted.

## Files added or changed

Implementation:

- `src/features/admin/ContentSynchronization.jsx` — local-only guarded workspace UI, comparisons, selection/confirmation, downloads and results.
- `src/features/admin/contentSyncModel.js` — package/rights checks, precise versions, conflict/idempotency rules and redacted diagnostics.
- `src/features/admin/contentSyncExecutor.js` — existing-client adapter, guarded sequential translation batches, cancellation and readback/preservation reporting.
- `src/features/admin/contentSyncPackage.js` and `supabase/content/phase14-admin-sync.json` — generated credential-free package/digest; no private backup embedded.
- `scripts/prepare-admin-content-sync.mjs` — local package preparation only (`npm run prepare:content-sync`).
- `src/features/admin/AdminApp.jsx` — lazy route/local navigation, existing guard/session/repository retained.
- `src/styles/admin.css` — scoped responsive review styling.
- `src/i18n/locales/en.json`, `src/i18n/locales/ar-JO.json` — synchronized UI translations.
- `package.json` — prepare/model/database/browser commands; no new dependency.

Verification/documentation:

- `scripts/content-sync-test-fixture.mjs`, `scripts/check-admin-content-sync.mjs`, `scripts/check-admin-content-sync-database.mjs`, `scripts/check-admin-content-sync-browser.mjs`.
- `docs/validation/admin-content-sync-{model,database,browser}.json` and regenerated evidence from the existing regression scripts above.
- This guide and the appended local-tool status in `docs/PHASE_14_CONTENT_SYNC_BLOCKER.md`.
- Ignored `artifacts/content-sync/browser/` screenshots and local build/diagnostic logs; original private backups/rollback artifacts retained.

**No migration, Edge Function, hosted role/account/Auth setting, RLS policy, destination, image approval or Storage object changed. Hosted translations updated: 0. Hosted images inserted/associated/approved: 0.**
