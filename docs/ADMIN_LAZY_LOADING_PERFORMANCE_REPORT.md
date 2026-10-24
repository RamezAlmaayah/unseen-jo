# Admin progressive loading performance report

Date: 20 October 2026. Project: Unseen Jo. Admin URL: http://127.0.0.1:4184/admin.

## Result and verification scope

Implemented route code splitting, permanent scroll-triggered sections, bounded server-side collection queries, and deferred private thumbnail delivery. Existing editors, authentication shell, navigation, publication rules, and public website design remain intact. No hosted destination, publication status, Storage object, license evidence, permission, schema, or index was changed. No publishing operation was run. Phase 05 was not started.

There is no connected signed-in Admin browser exposed to this session. Authenticated browser acceptance below uses intercepted synthetic Auth/REST/Storage fixtures with the actual production application, Chromium, MapLibre, and axe. Fixture saves exercise real frontend operations against simulated responses; they are **not hosted authenticated saves**. No credentials were exported. Genuine hosted checks were anonymous reads against `dkhwwvoplhfjccvjegty`, including rejection of a protected Admin RPC.

## Confirmed bottlenecks

- The Admin entry imported secondary routes and editors eagerly, pulling editor/map dependencies into collection routes.
- Overview downloaded the full destination catalog to summarize it. Places and Translation Review also fetched full records for their queues, including descriptions and nested data that the visible lists did not need.
- Media fetched up to 500 metadata records and prepared original signed URLs as a batch. Existing image lazy loading did not prevent that eager preparation.
- Editors mounted every gallery control and the location picker immediately, including offscreen content. A synthetic 80-image gallery makes this work visible; it is not a claim about the current hosted gallery size.
- Overview charts and review checks were not independently tied to section visibility.

## Loading strategy by route

| Route | Initial work | Deferred or bounded work |
| --- | --- | --- |
| Overview | Authenticated aggregate metrics, exact quality counts, existing eight recent activity entries | Charts and live review queue activate within 400px; chart panels activate independently; queue checks at most eight recent drafts |
| Places | 20 lightweight summaries and small category collection | Server search, filters, stable sorting, exact count and pagination; selected full record only when opening an editor |
| Quick Place Editor | Selected record, categories, text controls and working draft | Map within 400px; each gallery editor near viewport; draft preview module only when opened |
| Advanced Place Editor | Selected record and initial editing controls | Map, individual gallery editors, and explicit draft preview |
| Media Library | 20 metadata records and exact count | Lazy 320/640px thumbnail candidates, signed on demand through existing image delivery; explicit next page |
| Translation Review | 20 narrow queue summaries and selected full record | Debounced server search/status filtering and pagination; selected editable record is independent of queue pages |
| Publishing Workspace | Route-specific controls and existing small run state | Publishing runner imported only on explicit Run; no publication was performed during validation |
| Audit Logs | Existing 20-record server page | Subsequent pages on demand with stable timestamp/id ordering |
| Categories, Acceptance, Content Completion | Small data or existing explicitly invoked workflows | Separate route imports; no unrelated Overview catalog request |

The 400px observer is a preload boundary, not a requirement to wait until something is on screen. Charts may load during initial observation when already within that boundary. This is expected.

`DeferredSection` activates once and retains its children. Scrolling away never unmounts an active form or map. Reserved section heights and image aspect ratios reduce layout jumps. An accessible **Load section** button permits keyboard activation without physical scrolling; focus moves to the retained region before a focused placeholder is removed. Browsers without IntersectionObserver render the section immediately. No scroll-triggered full-screen loader was introduced.

## Data, caching, media and state

Collections use server ranges of 20, exact counts, and deterministic secondary ordering by ID. English/Arabic name search and quality/status/category filters run on the server. Review lists omit full descriptions, image metadata and publication issues; only the selected destination fetches its full editing data. Small category collections remain unpaginated. Audit logs already had pagination and retain it.

Repository reads are coalesced and cached for 30 seconds, limited to 60 keys, in memory within the repository belonging to the current account. Failed reads are evicted. Relevant committed mutations invalidate read and image caches. Private draft autosave does not repeatedly evict catalog data. Explicit Refresh clears caches; an already activated Overview review queue revalidates. No private cache is persisted across accounts. Existing auth verification, revocation and session-refresh behavior are preserved.

Visual previews now pass metadata-only descriptors to the existing responsive delivery path instead of signing all originals up front. Cards use 320/640px candidates, lazy loading, async decoding, and sizes appropriate to the container. Full-resolution originals and the separate signature API remain available for explicit viewing and verification; thumbnails are not substituted for rights/checksum evidence. Original objects, licensing restrictions, derivative generation, public/private delivery rules and attribution were not changed.

Text, image selections, validation and autosave remain owned by the parent editor. Gallery wrappers have stable image keys and remain mounted after activation. Translation paging/search does not replace the selected form; saving revalidates the queue and preserves the selected saved translation. Existing confirmation on switching away from dirty destination edits remains intact.

No database indexes were added under the database-structure restriction. Existing primary/foreign-key, category and audit indexes remain. Wildcard name search, description completeness regexes and exact counts can still scan rows on a very large catalog; these require future workload-specific database analysis rather than an unsupported index change here. Filter construction follows the existing SDK and the [PostgREST embedding/null-filter API](https://docs.postgrest.org/en/stable/references/api/resource_embedding.html) and [filter operators](https://docs.postgrest.org/en/stable/references/api/tables_views.html).

## Before/after measurements

Production preview on port 4190; identical synthetic 240-destination/80-image fixtures; separate cold Chromium contexts per route. Chrome DevTools Protocol records encoded transfers and requests through 1.5 seconds after the workspace heading appears and its initial skeleton disappears. “Usable” measures that heading/skeleton milestone, not completion of every background request. Values below are one paired sample, not statistical benchmarks. Fixtures do not reproduce hosted Supabase latency. OS/server caches and test scheduling were not controlled.

| Route / viewport width | Total initial transfer KiB, before → after | Initial JS KiB, before → after | Network requests, before → after | Usable milestone ms, before → after |
| --- | ---: | ---: | ---: | ---: |
| Overview / 1440 | 2411 → 579 | 428 → 406 | 40 → 54 | 2114 → 986 |
| Overview / 390 | 2411 → 573 | 428 → 406 | 40 → 36 | 1296 → 1093 |
| Places / 1440 | 2309 → 484 | 327 → 305 | 21 → 22 | 1035 → 1071 |
| Media / 1440 | 9957 → 9901 | 327 → 305 | 101 → 100 | 1143 → 1338 |
| Translations / 1440 | 2389 → 578 | 327 → 314 | 22 → 31 | 1031 → 1237 |
| Quick editor / 1440 | 3264 → 2929 | 615 → 310 | 57 → 52 | 1224 → 997 |
| Audit / 1440 | 496 → 474 | 327 → 305 | 19 → 20 | 1906 → 944 |
| Publishing / 1440 | 494 → 468 | 327 → 302 | 17 → 17 | 1028 → 942 |

| Route / width | Supabase-related requests, before → after | Initial images, before → after | Observed CLS, before → after |
| --- | ---: | ---: | ---: |
| Overview / 1440 | 14 → 20 | 0 → 0 | 0.16931 → 0.01900 |
| Overview / 390 | 14 → 11 | 0 → 0 | 0.03606 → 0.02191 |
| Places / 1440 | 5 → 5 | 0 → 0 | 0.02012 → 0.02012 |
| Media / 1440 | 53 → 52 | 16 → 16 | 0.02011 → 0.02015 |
| Translations / 1440 | 4 → 7 | 0 → 0 | 0.03253 → 0.02177 |
| Quick editor / 1440 | 22 → 21 | 6 → 4 | 0.02228 → 0.02012 |
| Audit / 1440 | 4 → 4 | 0 → 0 | 0.01744 → 0.01744 |
| Publishing / 1440 | 3 → 3 | 0 → 0 | 0.00112 → 0.00112 |

Overview trades some additional bounded aggregate/category/approaching-review requests for much smaller responses. Translation Review adds a selected-record request instead of transferring all full records. Reduced transfer does not imply fewer requests or faster timing on every route: Places, Media and Translations had slower usable milestones in this sample. No universal speedup is claimed.

The Admin entry emitted by Vite decreased from 142.72kB raw / 41.96kB gzip to approximately 45.34kB raw / 15.12kB gzip. Its measured script transfer fell from 42,161 to 15,421 bytes. Shared app code still loads; these are **entry chunk**, not whole-application reductions. Quick editor initial total JS approximately halved because the offscreen map dependency no longer loads initially. Minor final correctness and 600px breakpoint fixes followed the recorded transfer sample; the JSON artifacts identify the measured chunk hashes.

Media's measured image transfer did **not** improve meaningfully: the synthetic fixture serves the same large PNG bytes for every requested rendition width, and existing images were already lazy. This cannot establish real hosted thumbnail byte savings or download speed. It does establish bounded metadata, no batch original signing, appropriate requested candidates and no repeat downloads on upward scrolling. Initial image counts also depend on the observation time and preload proximity.

At first gallery observation, only 12 of 80 editor controls mounted on desktop and 5 on Arabic mobile. Scrolling toward the end activates upcoming controls; scrolling back retains edits and does not refetch already displayed images. No before/after FPS or long-task benchmark was captured, so no quantified scrolling-frame-rate claim is made.

Evidence: [before measurements](validation/admin-progressive-before.json), [after measurements](validation/admin-progressive-after.json). Screenshots: [desktop before](../artifacts/admin-progressive/before-overview-1440.png), [desktop after](../artifacts/admin-progressive/after-overview-1440.png), [mobile before](../artifacts/admin-progressive/before-overview-390.png), [mobile after](../artifacts/admin-progressive/after-overview-390.png), [media after](../artifacts/admin-progressive/after-media-1440.png). These show synthetic content, not the owner's hosted records.

## Validation

- Query/cache model: 7 groups passed, including stable ranges/counts, bilingual quoted search, quality relation filters, missing translations, request coalescing, account isolation, failure eviction and mutation invalidation.
- Browser fixtures: English 1440px and Arabic 390px flows cover gradual scrolling, permanent activation, media/Places/Audit pagination, server search, 80-image gallery, unsaved text/autosave, retained map instance, browser-tab return, translation paging/save, and no horizontal overflow. Explicit Refresh is tested on desktop; its existing header control is hidden on mobile. Results: [browser evidence](validation/admin-progressive-browser.json).
- Additional responsive checks: English/Arabic tablet 820px, English mobile 390px, Arabic desktop 1440px across Overview/Places/Media, plus observer-independent keyboard activation: 13 cases passed. A separate 600px breakpoint test passed with the correct two-column chart reserve. Evidence: [responsive](validation/admin-progressive-responsive.json), [600px boundary](validation/admin-progressive-tablet-600.json).
- Axe WCAG A/AA scans passed on five routes in each full browser language flow, 12 additional responsive route cases and the 600px case. The existing Media caption contrast failure discovered during testing was corrected. Automated checks do not replace manual screen-reader acceptance.
- Existing disposable Postgres Admin/security checks: 12 groups passed. Existing auth/cache/security regression: 7 groups passed. Localization: 6; responsive image delivery: 6; Quick Edit model: 4 groups passed.
- Existing focused Quick Edit browser fixture suite passed create/private draft save/refresh, independent text saves, authorized image selection/upload/reorder/remove and actual displayed cover updates across public page fixtures. Test actions only mutated fixtures. Its scrolling selectors were adapted to progressive controls and the existing compact Explore image/link structure.
- Genuine hosted anonymous checks: bilingual name filtering, approved-cover anti-join and description-completeness filter syntax passed; `admin_overview` correctly denied anonymous access with `42501`. [Hosted read evidence](validation/admin-progressive-hosted.json). Twelve genuine public destination/language image-detail checks also passed: [public checks](validation/live-tourism-image-tests.json).
- `npm run validate`: Oxlint passed with zero warnings; asset validation passed (83 references, 48 image hashes); production build passed. Existing large-chunk build advisory remains. Static localization resource audit reported no missing static strings.

## Files changed

Application:

- `src/features/admin/AdminApp.jsx`, `repository.js`
- `DeferredSection.jsx` (new), `AdminPreviewImage.jsx` (new)
- `Overview.jsx`, `OverviewCharts.jsx`, `Management.jsx`
- `QuickPlaceEditor.jsx`, `PlaceEditor.jsx`, `DraftPreview.jsx`
- `TranslationReview.jsx`, `AutomatedPublishing.jsx`
- `src/styles/admin.css`
- `src/i18n/locales/review.ar.txt`, generated English/Arabic locale resources

Validation:

- New `scripts/admin-progressive-fixture.mjs`, `measure-admin-progressive.mjs`, `check-admin-progressive-model.mjs`, `check-admin-progressive-browser.mjs`, `check-admin-progressive-responsive.mjs`, `check-admin-progressive-tablet.mjs`, `check-admin-progressive-hosted.mjs`, `diagnose-admin-progressive-a11y.mjs`
- Existing `scripts/localization-browser-fixtures.mjs` exposes Content-Range in simulated CORS responses; `scripts/check-quick-edit-browser.mjs` uses current visible controls and scrolling behavior
- This report, validation JSON and screenshots under `artifacts/admin-progressive/`

## Remaining limitations

Real authenticated owner-account scroll/save/refresh acceptance and real hosted Admin latency measurements remain unperformed because no signed-in browser was connected. These are distinct from the completed fixture flows and anonymous hosted checks. Recharts remains a substantial separate chunk and loads whenever its section approaches the viewport. The public/shared application bundle retains its existing build size advisory. Exact counts and wildcard searches need reassessment if the catalog grows substantially. Native browser tab discard can still reload the document; this work preserves ordinary tab-return behavior and does not bypass browser memory management.
