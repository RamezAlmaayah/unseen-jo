# Phase 04 — Secure Admin Dashboard & Tourism Content Management

## Researched draft population — 19 October 2026

The owner authorized non-destructive completion of the six existing tourism drafts. Their original IDs/names/slugs and draft statuses are preserved. Dedicated project SQL saved the researched fields and pending source/precision evidence, then a read-back compared supported fields and all category links against the manifest. No administrator JWT/actor or completed review was fabricated. [Completion report](TOURISM_CONTENT_COMPLETION_REPORT.md), [field source ledger](TOURISM_CONTENT_SOURCES.md), [image licence register](TOURISM_IMAGE_LICENSE_REGISTER.md) and [publishing workflow](CONTENT_PUBLISHING_WORKFLOW.md) distinguish actual remote content updates, local photograph preparation and still-required genuine-session imports/reviews. The workflow file was missing and has now been documented.

Eleven original photographs were acquired with individually documented compatible permissions and visually inspected; original checksums and metadata snapshots are retained. Smaller presentation variants use deterministic resizing/compression, never generative changes or upscaling. Five covers are proposed; Ajloun's current forest-cover download was rate-limited and remains unresolved. The existing test image is untouched and unapproved. Local authenticated `/admin/content-completion` uploads through the existing repository/Storage operations, verifies file hashes and private retrieval, and never publishes/deletes/approves. No genuine hosted media import is claimed before the user's actual session completes it. Public photo-credit link delivery remains a pre-publication limitation.

No public design, roles, RLS, Storage policies or Auth settings were changed. A narrowly scoped admin-map attribution underline resolves an accessibility finding without changing layout or colour. All six remain drafts; no Phase 05 work.

## Final live content readiness review — 19 October 2026

Owner follow-up: the Umm Qais upload was for testing and has no confirmed source/reuse rights. On explicit instruction, its Rights evidence was marked **UNVERIFIED — TEST UPLOAD ONLY**, keeping approval/licence basis null, cover false and the destination draft. No upload was deleted or replaced. This narrow metadata update used the dedicated trusted SQL connection; no user session or audit actor was fabricated. Original destination rows remain unchanged. [Replacement photograph research](evidence/umm-qais-media/README.md) recommends a visually inspected Bashar Tabbah West Theatre original, 2500 × 1667, with public Wikimedia VRT permission evidence and CC BY-SA 4.0 terms. A second CC BY 2.0 candidate is documented. Both remain local evidence, not hosted content. Public attribution currently displays plain text only in the opened viewer; discoverable source/licence links and browser validation are additional prerequisites before publication. No public UI was modified.

**Umm Qais is recommended for the first publication, but is not publication-ready.** All six live drafts were inspected through the dedicated project MCP without edits. Umm Qais has one uploaded JPEG, but no cover designation, source, attribution, licence evidence or rights approval; its actual identity and pixel dimensions could not be inspected without the private bytes. All six lack saved coordinates, primary categories and completed editorial reviews. Four backend blockers remain for Umm Qais: claims review, primary category, reviewed/sourced coordinates and approved uploaded cover.

The [actionable publication-readiness report](FIRST_PUBLICATION_READINESS.md) includes the six-draft comparison, existing field values, proposed original copy, official source register, provisional official-linked map point, conflicting visitor hours, actual Storage metadata, every remaining action and separate edit/publication approval boundaries. The official point is `32.6556875, 35.6780625`; it is not verified as a visitor entrance. No image reuse rights were inferred from availability. Unknown visitor information can remain blank. No publication approval is requested until content, geography and media evidence are complete.

Fresh verification: 10 isolated database groups, 13 rendered admin browser groups and 4 genuine hosted anonymous groups passed. MapLibre manual/click/drag/keyboard interactions and unsaved Draft Preview passed with CMS fixtures and real map layers; this does not prove the current private image or genuine signed-in Umm Qais preview. Live validator/RPC/trigger definitions confirm backend enforcement including direct writes. RLS remains enabled on all five inspected content/role tables. A fresh genuine authenticated checklist invocation and private-image inspection remain administrator actions because no signed-in browser surface was exposed. Lint/assets/build outcomes are recorded in the readiness validation evidence.

Live data digest before/after this review is unchanged: `ec60507a2fddb950ef46390a6a2cb94e`. Six drafts, zero published, zero review rows, one linked image, two private image objects and one admin. The differing older digest/zero-image counts below predate subsequent administrator activity. No draft, image, role, policy, connection or hosted configuration changes were made. No publication or Phase 05 work occurred.

## Final interactive refinement — 18 October 2026

**Implementation delivered; the administrator reports “All checks passed” for genuine authenticated acceptance.** The dedicated project MCP verified that `ramezmayaa@gmail.com` is confirmed and has an existing administrator role, then independently corroborated the isolated runs through audit history and complete cleanup. No role was assigned or changed by this refinement. The agent could not operate the administrator's actual browser session; the user ran the checks privately. No passwords, session tokens, profile storage or browser credential files were requested or read.

### Editorial workspace and functionality

- Forest-green/mint/warm-neutral application shell with collapsible desktop sidebar, tablet icon navigation, active indicators, sticky topbar, breadcrumbs, profile disclosure, refresh and secure logout. Mobile navigation uses an overlay drawer with inert background, focus containment, Escape and focus restoration.
- Eight linked KPI cards, loading skeletons, success toasts, restrained Motion/CSS interactions and reduced-motion handling. Dates explicitly use English numerals, 24-hour time and `Asia/Amman`.
- Recharts `3.10.1` is pinned in the lockfile and loaded only on the authorized overview. Four responsive charts show status, category membership, overlapping completeness tasks and draft claims review. Tooltips, keyboard accessibility and expandable data tables/legends are provided. No trends, revenue, visitor data or invented analytics are shown.
- KPI/chart data comes from actual paginated protected destination/category/media/review queries. Counts are derived from the same catalog snapshot as the charts; audit activity comes from the existing overview RPC. Claims are considered reviewed only when verification evidence and the review record's `claims_reviewed` flag agree, rather than treating any review timestamp as approval.
- Places has instant URL-backed search with 250ms debounced filtering, status/category filters, sorting, pagination, clear indicators, readable rows, content signals and named preview/edit actions. The six-record collection is fetched in 500-row pages; filtering the loaded catalog avoids repeated network requests while typing. This is client-side list pagination; a much larger catalog should move these filters to the existing server-side list query.
- A quality center links to editors and displays **actual** `admin_publication_issues` results for up to eight recent drafts. Dashboard dimensions and row signals are not presented as a replacement for the database publication gate.
- Add/Edit Place now groups story, categories, visitor information, map location, source review and media rights. A real MapLibre/OpenFreeMap picker supports click selection, a draggable pin, keyboard pin movement, manual decimal coordinate fields and map fallback/retry. Coordinates remain unverified until saved and reviewed against a geographic source and precision.
- Private Draft Preview displays current form values and short-lived signed media, clearly identifies unpublished/unsaved content, and remains accessible before the first save. Preview never saves or publishes content. It is an editorial preview, not an assertion that its layout exactly matches the public Details page.
- Save Draft, Preview and Publish are explicit. Publishing requires a saved record with no database blockers and a separate confirmation dialog. Published records remain locked until returned to draft. Review/rights actions operate on saved values, require appropriate evidence, and re-fetch after success. Validation handles conflicts, invalid numeric ranges, source URLs and image metadata with actionable errors.
- Existing private image upload/association, rights evidence, approval, orphan maintenance and audit permissions are preserved. Signed previews expire after five minutes. No new RLS, role, database or Storage policy was introduced.

### Real hosted observations and data preservation

The dedicated MCP confirmed the correct API URL/project and the existing account's confirmation/admin assignment. Read-only queries after user-run acceptance confirmed **six drafts, zero published places, zero images, zero private image objects, zero leftover acceptance destinations and one existing admin**. The protected six destinations' full-row digest before and after acceptance was identical: `721101e84b04dd3775a867137e33e214`. Original destination modification timestamps remain unchanged. The agent performed no remote mutation; the user-confirmed runner created and cleaned up its own isolated records through the authenticated SDK.

Audit entries corroborate two isolated runs by Auth UUID `914e63a8-a570-4de7-9a14-230d1a7853c8`. The latest ran from `2026-10-18 17:33:42` to `17:33:49 UTC`, recording draft creation, detail/coordinate changes, category association, image creation and licensing/attribution metadata changes, then image/category/draft deletion. The user's all-passed result also covers authenticated identity checks, private Storage upload/download, publication blocker checks, audit reads and preservation checks. Those HTTP outcomes were reported by the user-run suite rather than directly observed by agent browser automation. Evidence is recorded in `validation/phase04-final-results.json`.

Hosted anonymous HTTP tests passed for CMS RPC denial, private review/audit denial, hidden drafts/images and seven readable categories. These are genuine anonymous HTTP tests, not authenticated administrator CRUD evidence.

Current security advisors report one warning: **Leaked Password Protection Disabled**. The Auth setting was preserved. See [Supabase's password-security guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Earlier sections reporting no advisor findings describe their earlier checkpoints.

### Validation and screenshots

- Enhanced stateful browser suite: 13 grouped checks cover chart math, KPI navigation, debounced filters, map click/drag/keyboard, save/refetch, private preview, conflict preservation, category refresh, mobile/tablet layout, reduced motion, logout, and accessibility. Successful CMS requests use intercepted HTTP fixtures; map rendering uses genuine MapLibre and OpenFreeMap layers.
- Axe WCAG 2 A/AA and 2.1 AA scans: dashboard, places, editor and private preview. The WebGL canvas pixels are excluded from editor scans; actual map keyboard controls, dragging and legal attribution are independently exercised. Automated scans supplement rather than replace manual accessibility review.
- Existing admin browser suite: 5 groups; invitation/recovery suite: 9; isolated SQL/PostGIS admin security: 10; database foundation: 55; tourism: 15; map utilities: 9; real anonymous hosted checks: 4.
- Acceptance-runner cleanup/authorization failure tests: 3 in-memory checks. These prove test-record scoping and cleanup behavior under simulated failures, not live Storage authorization.
- Lint, all 83 asset references and production build pass. The existing large MapLibre bundle warning remains. Charts and picker are lazy-loaded; public pages were not redesigned.
- Public regression runner was exercised on a separate explicit demo server. Phase 01A (14 viewport cases), Phase 01B (21), Phase 01C (42), landing refinement, and global shared-scale (91 viewport cases plus 10 states) pass across the runner and individual corrected-test reruns. Historical Phase 01B focus timing and Phase 01C directions/map-height assertions were updated to the already-approved Phase 03 behavior; bringing the legacy test page forward before capture resolved a headless screenshot stall. `validation/phase04-final-results.json` records the combined final outcomes. No public UI source was changed to satisfy an old assertion.

Actual browser renders are saved under `docs/screenshots/phase04-final/`: `dashboard-1440.png`, `dashboard-834.png`, `dashboard-390.png`, `places-1440.png`, `add-place-1440.png`, `edit-place-1440.png`, `edit-place-390.png`, `map-picker-1440.png`, `draft-preview-1440.png`, and `draft-preview-390.png`. These are actual React UI screenshots with clearly synthetic CMS fixtures, not generated design mockups or evidence of a real privileged session. Desktop, map and mobile preview renders were visually inspected.

### Authenticated acceptance and remaining boundary

The administrator ran **http://127.0.0.1:4184/admin/acceptance** and reported **All checks passed**. The runner uses the existing legitimate session, creates one private synthetic draft and owned test PNG, exercises draft CRUD/category assignment/coordinates/Storage preview/rights metadata/audit reads/publication blockers, and removes only that run's records and files. It preserves the original six drafts, keeps audit history, never approves/publishes the synthetic content, never changes roles and never exports credentials. Database audit and cleanup were independently verified after the reported success; the downloaded browser JSON report was not supplied to the agent.

Then manually reload to confirm persistence; inspect picker/preview without saving an original draft; sign out through the profile menu; revisit protected routes and check an incognito window. The automated fixture logout test passed, but logout of the user's real session remains a manual acceptance step.

No actual publication or subsequent Home/Explore/map/Details published-content integration was tested. That requires separately approved, fully verified test content and image rights; none was published here. Phase 05 was not started. No deployment, invitation, connection edit or unrelated-project action occurred.

The sections below are the historical implementation/setup record and are superseded by this refinement where applicable.

Implemented 18 October 2026. Dashboard entry: `/admin`. Frontend changes are local; no site deployment was performed.

## Invitation callback follow-up

Implemented `/admin/accept-invite` with explicit SDK session establishment and Auth-verified confirmed-user checks before password setup. Corrected `/admin/recovery` to use the same verification boundary, while retaining same-browser PKCE recovery. The previous ungated recovery form was removed. Password confirmation, callback URL cleanup, session revalidation, password update and sign-out are covered by `npm run test:admin:invitation` (nine grouped checks). Five existing admin browser groups and lint/assets/build passed. The existing large map-bundle build warning remains.

The actual localhost callback routes serve HTTP 200 and reject missing credentials. Real hosted Auth rejected a fabricated callback session. Successful Auth exchanges and password updates use HTTP fixtures; genuine invitation delivery/acceptance was not performed. No invitation, admin grant, database change, email-template update or hosted configuration change occurred. Exact local Site URL and Redirect URL values and the standard invitation template requirements are in [ADMIN_DASHBOARD.md](ADMIN_DASHBOARD.md). Those recommendations supersede the earlier suggestion to route invitations to `/admin/recovery`.

## First administrator setup checkpoint — 18 October 2026

The intended email is `ramezmayaa@gmail.com`. The dedicated MCP was reverified against `dkhwwvoplhfjccvjegty`; the original connection remains untouched. A case-insensitive Auth query returned no matching account. `public.user_roles` is empty. No account, password, verification bypass or role assignment was created.

The real Auth settings endpoint confirms email auth/signup enabled and email autoconfirm disabled. Full hosted SMTP and redirect configuration cannot be inspected through the available scoped MCP. Auth invitation tools and administrative Auth credentials are unavailable, and the browser tool reports no available browser. No email was sent; this is a capability/access blocker, not a diagnosed SMTP delivery failure. The user must complete the official invitation/verification and private password setup before the agent can show the verified UUID and request final privileged-role approval.

Local dashboard `http://127.0.0.1:4184/admin` was verified to serve HTTP 200. Security advisors returned no findings. Live authenticated login, session persistence, CRUD, Storage, publication/public integration and the requested final regression run remain pending this explicit intervention checkpoint. Prior fixture/local test results below are historical and are not live account acceptance results. The current editor uses numeric coordinate fields; a MapLibre coordinate picker and dedicated draft preview still need implementation for the newly requested full acceptance scope.

See [dashboard setup and handoff](ADMIN_DASHBOARD.md) and [authorization and privileged approval procedure](ADMIN_SECURITY.md). No Phase 05 work has started.

## Connection and remote database

The dedicated `supabase_unseen_jo` MCP connection successfully executed `get_project_url`, `list_migrations`, `list_tables`, `execute_sql`, and advisors against project `dkhwwvoplhfjccvjegty`. Its API URL is `https://dkhwwvoplhfjccvjegty.supabase.co`. No connection configuration was edited or removed; the original Supabase connection was preserved.

Applied `phase04_admin_cms` through the dedicated MCP with remote migration version `20261018154102`. Local filename matches that recorded version. Existing rows were preserved: six drafts, seven categories, zero images, zero published destinations, and zero admins after deployment. Security advisors returned no findings. Preflight performance advisors reported eight informational unused indexes; these were retained because the project has no published traffic.

The migration adds primary categories, image rights metadata and review records. It tightens administrator authorization to require a database role assignment plus an active matching Auth session. Public RPC functions use caller privileges and enforce administrator access. RLS remains enabled. Review, media and publication operations use timestamp conflict checks. Publication fails unless the saved record has sourced claims, reviewed Jordan coordinates, an active primary category, and an uploaded cover with saved rights approval. Published records and linked media/categories/reviews require returning the destination to draft before editing. Linked object replacement/deletion is restricted. Unlinked uploads can be reviewed and separately confirmed for deletion through Storage APIs.

## Dashboard

- Dedicated Supabase password login, sign-out and password recovery; separate admin session storage from anonymous public tourism reads.
- Database permission check before rendering protected content, repeated on Auth changes, focus and every minute. Database authorization applies to every request independently of the UI.
- Overview counts; destination search, status/category filters, sorting and pagination.
- Draft creation/editing with explicit payload allowlist, category assignment, primary category, pricing, duration, coordinates, sources and visitor information.
- Explicit claims/location review, publication checklist and confirmation for publish/archive/draft changes.
- Category creation, editing, ordering and activation; conflict detection on edits.
- Private raster uploads with file signature, MIME and size validation; media metadata, cover/order, rights evidence and explicit approval. No automatic image approval or byte cleanup after ambiguous failures.
- Private five-minute signed previews in Media and read-only paginated audit history.
- Desktop/mobile layouts, keyboard focus, loading/error/retry/empty states. Admin code is loaded separately from public pages.

## Verification evidence

| Boundary | Result | Evidence |
| --- | --- | --- |
| MCP → correct project | Passed | Dedicated project URL, schema and migration calls |
| SQL authorization/publication | Passed | 10 grouped disposable PostgreSQL/PostGIS checks in `validation/phase04-database-tests.json` |
| Hosted anonymous SDK → RLS/RPC | Passed | 4 read-only grouped checks in `validation/phase04-hosted-tests.json` |
| Browser → SDK → UI | Passed | 5 grouped checks in `validation/phase04-browser-tests.json` |
| Regression checks | Passed | Phase 02A: 55; Phase 02B: 15; map utilities: 9 |
| Build and integrity | Passed | Lint, 83 asset references and production build |

Browser tests use the real hosted anonymous sign-in guard. Authorized and denied account flows use intercepted HTTP fixtures; no real account, administrator role, media or public destination was created. Local SQL tests create synthetic users, roles, sessions and publication records only in a disposable PGlite database with simulated Supabase platform tables. These do not prove live authenticated Auth/Storage behavior.

Screenshots were rendered and visually inspected at 1440px and 390px: `screenshots/phase04/overview-1440.png`, `editor-1440.png`, `editor-390.png`. Browser runtime errors: zero.

## Approval-dependent work remaining

No administrator has been granted. The project owner must approve a specific existing Auth user before any role assignment. A real administrator login and authenticated upload/save/review flow remain unverified until that approval. Password recovery also requires the actual deployment origin's `/admin/recovery` URL in the project's redirect allowlist and configured email delivery; no email was sent during testing.

No destination was published and no destructive remote database operation was executed. Future publication requires actual content/media clearance and explicit approval; the dashboard confirmation does not substitute for an owner approval outside the app. No role-management UI is provided. Signed media links remain accessible until their five-minute expiry, even after access changes, as described in the [Supabase Storage documentation](https://supabase.com/docs/guides/storage/serving/downloads).

Production build retains the pre-existing large map bundle warning. No production deployment was requested or performed.

Run `npm run test:admin`, `npm run test:admin:hosted` and, with Vite serving at `http://127.0.0.1:4184`, `npm run test:admin:browser`. Browser checks reuse the existing temporary Playwright installation; `PLAYWRIGHT_MODULE` and `QA_BASE_URL` can override it.

## Phase 04L localization addendum — 19 October 2026

The subsequent bilingual implementation and its current evidence are recorded in [PHASE_04L_LOCALIZATION_REPORT.md](PHASE_04L_LOCALIZATION_REPORT.md) and [LOCALIZATION_ARCHITECTURE.md](LOCALIZATION_ARCHITECTURE.md). That report covers English/Arabic rendering, independent Arabic editing, six pending translation rows, RTL/map behavior, preservation evidence and the final MCP authentication limitation. Localization does not approve content, media or publication. Earlier checkpoint statements above describe their delivery date, not the current bilingual acceptance evidence.
