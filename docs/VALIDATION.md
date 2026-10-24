# Phase 00 validation

Validated locally on 15 October 2026 with Node.js 24.19.0 and npm 11.5.2.

## Automated project commands

| Command | Result |
| --- | --- |
| `npm run lint` | Passed, no reported issues (Vite template's Oxlint) |
| `npm run validate:assets` | Passed: 83 local references across seven screens, 48 distinct original hashes; no missing/empty/changed files or temporary runtime asset URLs |
| `npm run build` | Passed: Vite production bundle generated in `dist` |
| `npm run validate` | Passed: lint, asset validation and production build |
| `npm audit --omit=dev` | Passed: 0 vulnerabilities reported |

Production application bundle at final build: approximately 264kB JS (84kB gzip) and 16.4kB CSS (4.9kB gzip), plus self-hosted font files and copied public assets. Original Figma assets total 98,948,121 bytes across screen-specific copies; only header artwork is loaded by the shell. Unused destination photography is not fetched on shell load.

## Browser verification

Headless Chromium was run against the development server and the built production preview. Playwright was installed only in a temporary QA directory outside the project; no browser-test dependency was added to package.json. The user-computer browser connector reported no available browsers, so verification used an isolated headless test browser.

- All shell routes render and navigation links change the current route.
- Direct loading/refresh of Explore, Map, and My Discoveries works in local Vite serving.
- Browser back and forward history works.
- Unknown paths render a not-found view; its home link works.
- Active navigation exposes `aria-current="page"`.
- Keyboard Tab reaches the skip link; activating it focuses main content.
- Route changes focus main content without animated scrolling.
- Search and profile controls are disabled, with accessible labels.
- All 83 production asset URLs return HTTP 200 and match their recorded SHA-256 hashes.
- Inter loads locally; both visible header image assets load successfully.
- No console errors, uncaught page errors, failed requests, or HTTP error responses during the smoke flow.
- No horizontal overflow at widths 320, 390, 640, 768, 1023, 1024, 1280 and 1440px, using device scale factor 1 and normal zoom.
- Desktop header height exactly 80px; responsive header height 128px. At 1440px the logo bounding box is x=27, y=13, width=56, height=53; Explore begins at x=556; Search is 24px wide; Profile is 50px wide.
- Reduced-motion media emulation is recognized. The app adds no animations; MotionConfig and CSS safeguards are configured for future work.

Desktop and mobile screenshots and the destination contact sheet were visually inspected. QA screenshots, browser report and the temporary smoke runner are in the ignored `artifacts/` directory. These are local review outputs, not application dependencies.

## Practical limits

This validates the foundation and header only. Seven-page feature flows, touch-device hardware, screen-reader hardware, all browsers, backend connections and live maps are outside Phase 00. Mobile layout is a documented implementation convention because Figma provides desktop frames only. Vercel rewrite configuration is prepared, but a hosted deployment and its deep-link behavior have not been tested. No deployment or external account changes occurred.

The Figma Starter-plan MCP limit prevents additional live design queries. All source asset references available from the seven-screen inspection were downloaded, but component-only icon/progress references did not include original standalone exported files. Source image/destination inconsistencies are documented in DESIGN_SYSTEM.md.

The production preview used port 4174 because port 4173 was already occupied; the existing service was preserved.

## Phase 01A validation

The Phase 00 results above are historical. Landing and Preferences now replace their respective shell content. `npm run validate` still passes without changing its definition: lint, all 83 original asset references, and a production build. No new dependency was installed. A production dependency audit reports zero vulnerabilities.

The additional browser runner is `node scripts/check-phase01a.mjs`. It accepts `QA_BASE_URL` and an optional absolute `PLAYWRIGHT_MODULE` path to an existing Playwright installation; it is not part of runtime dependencies. By default it reuses the temporary QA installation established in Phase 00. It checks all choice controls, native keyboard radio movement, visible focus, cross-route state retention, full-reload reset, honest preview output, existing navigation/history/404 behavior, source geometry, real motion/reduced motion, image loading, and console/request errors.

Both pages passed at 1440, 1366, 1024, 768, 390, 375 and 320px without horizontal overflow. Development checks used port 5173; final production checks used the built preview on 4174. Source images were visually compared with the earlier Figma references; the Preferences reference was also compared side by side after matching screenshot scale. This is not a claim of universal pixel identity or a hosted Vercel verification.

Full results and screenshots: [Phase 01A report](./PHASE_01A_REPORT.md).

## Phase 01B validation

`npm run validate` passes with its existing definition unchanged. Lint reports no warnings, the production build passes, and all 83 original asset references / 48 hashes remain intact. A production dependency audit reports zero vulnerabilities.

The Phase 01A browser suite was retained and updated only for the authorized new route behavior: View all and Surprise Me are now available, and Explore has its full heading. It passes its 14 page/viewport cases and previous functional checks against the final production preview.

`node scripts/check-phase01b.mjs` passes 21 combinations across three pages at 1440, 1366, 1024, 768, 390, 375 and 320px. It tests actual local JSON loading/failure/schema validation/retry, real search/category filtering/clearing, empty states, local favorites, native preview-dialog behavior, shared preferences, validation, positive and mismatch sample reasons, source geometry, images, entrances and reduced motion. Production checks recorded no unexpected errors, no horizontal page overflow and no write requests. Deliberately injected failures and cancelled fetches are distinguished from normal asset-loading failures.

Final production preview: `http://127.0.0.1:4174`. Development verification used port 5173. No new test dependency was added; the optional runner uses the existing temporary Playwright copy or `PLAYWRIGHT_MODULE`, with `QA_BASE_URL` for another server.

All three pages have 1440px screenshots and cached-reference comparison images. The Figma MCP quota still prevents fresh verification; remaining map/crop, text-rasterization and native-control differences are described in [Phase 01B report](./PHASE_01B_REPORT.md). These are local Chromium checks, not a hosted release or a claim of universal pixel identity.


## Phase 01C validation

`npm run validate` passes: Oxlint has no diagnostics, all 83 original asset references / 48 hashes match, nested demo asset paths and route-safe unique destination IDs validate, and the production build succeeds. Existing dependency/configuration files remain unchanged.

Against `http://127.0.0.1:4174`, all three optional Chromium runners pass: Phase 01A (14 viewport/page cases), Phase 01B (21) and Phase 01C (42). The earlier suites were updated only for deliberately enabled Profile/Details routes and the full Discoveries heading. Existing geometry, preference state, search/filter, error/retry, fixed sample and reduced-motion checks remain.

The new suite covers shared temporary saves/removal/refresh reset, explicit six-place source collection, empty Saved/Visited tabs and keyboard navigation, photo viewing/arrows/Escape/focus restoration, unavailable metadata/directions, unknown slugs/routes, injected missing image and dataset error/retry, account validation/password visibility/clearing/unavailable-service messages, Profile apply/cancel/shared interests and empty browser storage. Normal requests have zero unexpected console errors, broken assets or write requests. All seven new page types pass at 1440, 1366, 1024, 768, 390 and 375px without horizontal overflow. It also asserts the directions notice cannot overlap the bottom actions.

Original cached Figma screenshots were visually compared with production Details and Discoveries at 1440px; mobile screenshots and account layouts were reviewed. Key gallery/tile/map/card/banner anchors are asserted numerically. Figma MCP quota still blocks fresh reads; no pixel-identical, all-browser or hosted-deployment claim is made. Full screenshots, commands, scope limitations and evidence are in [PHASE_01C_REPORT.md](./PHASE_01C_REPORT.md). Optional runner: `node scripts/check-phase01c.mjs`, using the same `PLAYWRIGHT_MODULE` and `QA_BASE_URL` settings as earlier phases.


## Global UI scale refinement validation

`npm run validate` passes: lint, the production build, and all 83 asset references / 48 original hashes. The existing Phase 01A (14), Phase 01B (21), Phase 01C (42) and Landing refinement (5) viewport/page suites pass with their authorized geometry expectations updated. Previous functionality and accessibility checks remain. The obsolete Landing-only pixel-isolation expectation is superseded by shared compact-route checks.

`node scripts/check-global-ui-scale.mjs` passes 91 page/viewport combinations: all 13 route types at 1366x768, 1440x900, 1920x1080, 1024x768, 768x1024, 390x844 and 375x812. It additionally checks ten invalid/edit/partial/missing-data states and desktop/mobile dialogs. Checks include normal CSS zoom and device scale, 1200px layout bounds, 60px/104px navigation, readable typography, 44px inputs, no offscreen controls or card metadata collisions, images, console/network errors and real/reduced motion. Normal flows record no unexpected console/asset errors or write requests. Existing suites preserve their search/filter, preferences, save/remove, gallery, form and routing regressions.

Before/after 1366px screenshots exist for every implemented route type. Original image hashes, palette and fonts are unchanged. Final production preview uses port 4174; optional Playwright remains outside runtime dependencies. Full evidence, exact changes, limitations and commands are in [GLOBAL_UI_SCALE_REFINEMENT_REPORT.md](./GLOBAL_UI_SCALE_REFINEMENT_REPORT.md). No hosted/non-Chromium/device-hardware verification is claimed. Phase 02 has not started.

## Phase 02A backend foundation validation

`npm run validate` passes (lint, 83 original asset references / 48 hashes and Vite production build). The existing Phase 01A (14), Phase 01B (21), Phase 01C (42), Landing refinement (five viewports plus shared routes), and global scale (91 page/viewport cases plus ten extra states/dialogs) browser suites pass against the settled production preview on port 4174. The first concurrent Phase 01A run recorded one failed demo JSON request; its isolated rerun passed without changing frontend code or assertions. The passing runs record no unexpected console/asset errors or backend writes. All current demo interactions, routes, responsive geometry and reduced-motion checks remain working.

`npm run test:database` passes **55 grouped checks** on disposable PGlite PostgreSQL 18.6 with PostGIS 3.6.2. The actual migration files execute, RLS/grants/ownership/admin/constraints/triggers/storage policies and geographic operations are exercised, private-record account-deletion cascades are checked, and a second fresh migration replay reproduces schema/policies. Auth/JWT/Storage platform contracts are modeled; these are **not hosted Supabase tests**. Exact results and migration hashes: [database test record](./validation/phase02a-database-tests.json).

The official CLI's local database lint could not connect to 127.0.0.1:54322; no Docker/local Supabase stack is running. On 16 October 2026, the dedicated MCP verified project dkhwwvoplhfjccvjegty, inspected the empty application state and applied the three reviewed migrations once. All 80 hosted rollback-only SQL assertions and 17 Data API/Auth/Storage HTTP checks passed; security advisors returned zero findings and performance advisors returned 14 INFO unused indexes. Final cleanup confirms no test users/sessions/content/objects. Local migration SQL exactly matches remote history and filenames now match assigned remote versions. The 55 local checks and npm run validate passed again. All 60 src files remain unchanged by SHA-256. Real signup/email/JWT session flows and successful authenticated Storage operations remain untested. Full remote evidence: [phase02a-remote-results.json](./validation/phase02a-remote-results.json). See [Phase 02A report](./PHASE_02A_REPORT.md), [schema and RLS matrix](./DATABASE_SCHEMA.md), and [setup/deployment status](./SUPABASE_SETUP.md). Frontend integration remains unchanged; Phase 02B has not started.

## Phase 02B public integration validation — 16 October 2026

All 55 database checks, 15 new local tourism groups, 17 real hosted SDK/HTTP checks, six rollback-only hosted RLS assertions, and eight new browser flow groups / 35 responsive cases passed. Production lint/build and all 83 asset references / 48 original hashes pass. All five existing regression suites pass in an explicit demo build: Phase 01A 14, Phase 01B 21, Phase 01C 42, landing five viewports plus 12 routes, global scale 91 cases plus ten states. Live empty-state screenshots were visually inspected; established sizing styles remain byte-identical. Source/media clearance prevents publication; positive populated HTTP UI tests are explicitly simulated rather than mislabeled as hosted integration. Remote counts are seven categories, six drafts, zero published places and ten category links, with no test fixtures/users/Storage objects and zero security-advisor findings. Full files, evidence, limits and screenshots: [Phase 02B report](./PHASE_02B_REPORT.md). Phase 03 has not started.
