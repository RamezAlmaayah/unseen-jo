# Phase 14 — Final QA and security review

Date: **23 October 2026 (Asia/Amman)**. Application: Unseen Jo, React/Vite. Hosted project: `dkhwwvoplhfjccvjegty`.

## 1. Final decision

**NO-GO for an unrestricted production release.** The principal UI routes, authentication fixtures, role isolation, three-state publishing and accessibility checks work, and the production build succeeds. However, live content is incomplete, legal/operator requirements remain unresolved, real deletion integration is unverified, and several legacy regression suites are failing. There is also no confirmed production origin or complete real-email/real-session release acceptance.

Docker/WSL absence did **not** block the rest of this QA. Neither was installed, started or reconfigured. No account was deleted, no hosted migration/Edge Function was deployed, and no hosted data, credentials, Auth settings, roles or publication state was changed. Hosted operations were metadata/aggregate SELECTs, anonymous read requests and image URL signing/downloads. Storage URL signing is a read-access operation; no object was uploaded/removed. No signed URL or credential is persisted in the report.

This is a scoped non-destructive QA/security review, **not** a penetration-test certificate or a claim of complete real Supabase integration verification.

## 2. Features checked

| Feature | Result and scope |
| --- | --- |
| Homepage/navigation/footer | PASS in built React at desktop/mobile, English/Arabic, keyboard-accessible links and correct direction. Existing approved visual design retained. |
| Explore | PASS route/layout/accessibility; anonymous hosted audit returns all 24 currently published records. Search/filter/model tests pass; some older live browser expectations need updating to the present catalog. |
| Interactive map | PASS MapLibre canvas in all four desktop/mobile language scenarios. Screenshot review shows real basemap/attribution and fixture markers. All 24 stored points lie within configured Jordan bounds. Geolocation/model failure handling tests pass. Coordinates are approximate reference centers, not independently verified entrances. Full road/navigation accuracy is not claimed. |
| Surprise Me | PASS engine/scoring/model regressions and route rendering. Existing live browser suite FAILS its obsolete single-destination expectation (see failures); this is not a full successful end-to-end recommendation acceptance. Unknown costs/time and qualification UI remain necessary. No external AI/booking service introduced. |
| Destination details | PASS representative route in both languages/layouts; real content metadata and all anonymously accessible image files audited. English descriptions/source URLs exist for 24. Image/Arabic completeness gaps below. |
| Login/registration | PASS incorrect-password fixtures, Enter submission, password visibility, loading/errors, responsive/RTL, guest access and registration legal links. No real signup or credential changes performed. |
| Confirmation/recovery/callbacks | PASS fixture PKCE/code/token handling, URL scrubbing, expiry/errors, resend cooldown, password confirmation and session behavior. Real delivery and genuine controlled-inbox callbacks NOT VERIFIED. Same-browser PKCE constraints preserved. |
| My Discoveries | PASS 26 fixture browser groups, including guest merge, saved/visited records, optional dates, history, pagination, failure/retry, language/keyboard/accessibility, account switching and logout. |
| User profile | PASS profile/save/preference/logout/isolation fixtures. Production privacy panel now explicitly unavailable; no password collection or actionable deletion/export controls. |
| Admin Dashboard | PASS current dashboard in four authenticated Admin fixture scenarios: metrics, deferred charts, desktop/mobile, English/Arabic and axe checks. A separate older refinement test has an incomplete API fixture and fails before its UI acceptance completes. |
| Admin Places/publishing | PASS current database suite (8 groups) and English desktop/Arabic mobile browser suite (2 groups). All six directed Published/Draft/Archived transitions, explicit save, persistence, optimistic conflict, error/retry and byte-preservation are tested only on disposable/local fixtures. No live destination changed. No editorial approval gate added. |
| Private-route access | PASS guest/ordinary-user Admin denials and database RLS fixtures. Real Admin credentials were not used; see hosted recognition below. Authentication/account routes retain their established guest/sign-in behavior. |
| Privacy Policy/Terms | PASS 24 legal browser groups: public routes, synchronized paragraph structure, both directions, keyboard contents anchors, links, metadata and accessibility. Review warnings remain visible. |
| Loading/empty/error states | Existing account/history/callback fixtures pass service-error/retry, unavailable records, empty guest state and incomplete recovery handling. Recommendation suite’s later empty/failure scenarios were not reached after its early live expectation failure; do not count them as passed this run. |

Main route sweep: **64/64 PASS**, no recorded browser errors or horizontal overflow, and zero detected axe WCAG A/AA violations in that sweep. Routes included `/`, `/explore`, `/map`, `/surprise-me`, a destination detail, login/register/recovery/callback, `/my-discoveries`, `/profile`, Admin entry/guard, `/privacy-policy`, `/terms-of-service`, and a missing-page route. Tests used widths 1366 and 390, both languages; dedicated Auth/discovery tests additionally covered 320/820 and other existing widths. These route checks use API fixtures; they do not certify every live backend interaction.

## 3. Hosted destination and Admin audit

Read-only observations are recorded in `docs/validation/phase14-destinations-readonly.json`, `phase14-content-review.json`, `phase14-english-content.json` and `phase14-anonymous-readonly.json`.

| Audit item | Result |
| --- | --- |
| Destination count / status | **24 total; 24 Published; 0 Draft; 0 Archived**. Observed, not changed. |
| Demo flags | All 24 have `is_demo=false`. This flag alone is not evidence that tourism claims are verified. |
| English/source metadata | 24 have nonempty names, descriptions at least 80 characters and HTTPS source URLs; no replacement-character corruption detected in those English fields. Source reachability/current factual accuracy was not independently re-researched for every destination. |
| Arabic | 24 translation rows exist: **5 reviewed/current**, **1 reviewed/stale** (`wadi-mujib`), **18 pending/current**. Anonymous API exposes only the 5 current reviewed translations. Existing UI warns and falls back to English for unavailable/pending Arabic; no unreviewed translation was approved. |
| Stored/public images | 45 image rows, **13 approved/publicly readable files across 7 destinations**, 32 not approved. All 13 tested public files load with an image MIME type and real image signature; zero read failures. **17 destinations have no approved public image** and use the honest unavailable-image presentation. No unapproved file was made public. |
| Numeric prices | Both numeric price fields are NULL for all 24. Contextual visitor text sometimes quotes a source or planning estimate; do not reinterpret NULL as free admission or a confirmed total trip price. |
| Opening hours | 20 NULL; 4 contain qualified operator/source text (`petra`, `al-maghtas-baptism-site`, `mount-nebo`, `little-petra-siq-al-barid`). Those schedules still require current-source confirmation and are not guaranteed live feeds. |
| Coordinates / factual review | All 24 within configured Jordan bounds, all `approximate_center`. Six have reviewed claim/location flags and a verification date; 18 have false review flags/no verification date. A pin’s validity/range does not certify an entrance, access, road or safety condition. |
| Public/private visibility | Anonymous published query returns 24, draft/archive query returns none. Because there are no live unpublished rows, that empty result alone is not a positive live draft-isolation test. Disposable DB/model tests cover actual draft/archive/private-overlay records. Anonymous profile/role queries fail closed. |
| Admin recognition | **2 Admin role memberships, 2 matching profiles, 2 non-banned Auth identities**. Recognition is based on authoritative server data, not editable user metadata. Genuine Admin browser sign-in remains a manual acceptance step; no password was requested/reset or role changed. |
| Hosted RLS | No public base table with RLS disabled was found. Local ACL/owner/session tests pass; this does not replace exhaustive live permission testing. |

### Destination-by-destination release notes

All rows are currently Published, have valid-range approximate coordinates and NULL numeric prices. The following table identifies the public-image/translation/review gaps without changing publication states.

| Destination slug | Approved public images | Arabic state | Tourism review |
| --- | ---: | --- | --- |
| ajloun-forest | 2 | reviewed / current | Recorded reviewed |
| al-maghtas-baptism-site | 0 | pending / current | Unverified |
| amman-citadel | 0 | pending / current | Unverified |
| amman-roman-theatre | 0 | pending / current | Unverified |
| aqaba-marine-reserve | 1 | pending / current | Unverified |
| azraq-wetland-reserve | 0 | pending / current | Unverified |
| dana-reserve | 3 | reviewed / current | Recorded reviewed |
| iraq-al-amir | 1 | reviewed / current | Recorded reviewed |
| jerash-archaeological-city | 0 | pending / current | Unverified |
| karak-castle | 0 | pending / current | Unverified |
| little-petra-siq-al-barid | 0 | pending / current | Unverified |
| madaba-st-georges-church | 0 | pending / current | Unverified |
| mount-nebo | 0 | pending / current | Unverified |
| pella-tabaqat-fahl | 0 | pending / current | Unverified |
| petra | 0 | pending / current | Unverified |
| quseir-amra | 0 | pending / current | Unverified |
| salt-historic | 3 | reviewed / current | Recorded reviewed |
| shaumari-wildlife-reserve | 0 | pending / current | Unverified |
| shobak-castle | 0 | pending / current | Unverified |
| um-er-rasas | 0 | pending / current | Unverified |
| umm-al-jimal | 0 | pending / current | Unverified |
| umm-qais | 1 | reviewed / current | Recorded reviewed |
| wadi-mujib | 2 | reviewed / stale | Recorded reviewed |
| wadi-rum | 0 | pending / current | Unverified |

Unknown tourism values and prototype data are visibly qualified in existing detail/preview/recommendation components. Private prototype data remains development/Admin-scoped and is not promoted to verified public content. Keep the existing demo labels, English fallback notices, unknown-cost/time labels and confirm-before-visiting text. An owner content review is needed; **do not introduce an additional editorial approval workflow into the status dropdown**.

## 4. Privacy and legal safety

**Safe local fix:** production bundles now always render an unavailable Privacy & Account notice. No export/deletion button, password field or request form is shown, and the inactive backend is not queried by that panel. `VITE_PRIVACY_QA=true` can expose the preserved UI only on a loopback Vite **development** server; it cannot enable the production bundle. Browser tests verify both the unavailable production panel and preserved QA behavior. The flag is a UI availability policy, not a substitute for backend authorization.

The source implementation, Edge handler, migrations and service-only fulfillment remain preserved for future activation. No backend was activated. The public policy now describes the unavailable production state in both languages. Legal draft warnings/operator/contact gaps remain. There is no invented privacy email, retention period, legal compliance declaration or promise of immediate deletion.

Actual deletion integration, passwordless/MFA deletion proof, Storage recovery, provider logs/backups, monitored requests, completion delivery and a verified rights-request contact remain unresolved. Storage and database operations are not a single transaction. Keeping the UI unavailable prevents a false operational promise; it does not itself satisfy the owner’s privacy-rights obligations.

## 5. Security findings by severity

No confirmed critical exploit was established by this review. The following findings and limitations must not be read as a full-security clearance.

| ID / severity | Finding | Evidence / disposition |
| --- | --- | --- |
| H1 — High, fixed locally | Unactivated privacy backend previously had actionable UI | Production availability gate added and tested: no controls/password collection/request submission; QA source preserved. No live site deployment was performed, so only the reviewed source/build state is established. |
| H2 — High, open operational safeguard | Hosted last-Admin protection is absent | Hosted role table has only its audit trigger; current Admins have existing role-management permissions. Local `20261022225126_privacy_activation_hardening.sql` blocks removal of the final Admin, but is **not installed**. Its concurrent/managed-platform behavior remains unverified. No privilege change made during QA. |
| H3 — High release readiness | Legal/operator/rights arrangements incomplete | Operator/contact/legal review unresolved; real data-request/deletion process unverified and unavailable. Keep review warnings and disabled UI. Owner/legal decision required. |
| M1 — Medium, open | Leaked-password protection disabled | Supabase security advisor WARN. [Official remediation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No hosted setting changed. |
| M2 — Medium, partly addressed locally | Security-header baseline incomplete | Added local Vercel configuration for `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and camera/microphone denial with self geolocation. Deployed headers NOT VERIFIED. CSP/frame-embedding policy needs a tested decision covering MapLibre workers, Storage images and inline styles; no untested CSP was enforced. |
| M3 — Medium review limitation | Persisted browser sessions depend on browser/XSS security | User/Admin sessions intentionally persist in separate localStorage keys with PKCE/refresh. No service-role key or raw recovery token logging found. Client storage is not an encrypted vault and closing a tab is not logout; existing UI/legal wording reflects this. |
| M4 — Medium, open verification | Real Auth/email/platform logging not accepted end-to-end | Fixture callbacks/guards pass; no genuine controlled-inbox confirmation/recovery or real Admin session acceptance. Gateway/APM token/body redaction, hosted redirects/templates and complete session revocation semantics are not established by static tests. |
| L1 — Low/maintenance | Legacy tests/copy lag current behavior | Old publication-gate assertions, old Auth shell selector, recommendation catalog pin and incomplete Admin fixture. Selector fixed; remaining failures listed below. Some Overview review-center wording still says “publication blockers” and should be clarified as content-quality guidance without adding a gate. |

Additional static results:

- **Secrets:** frontend/build scan passes (206 JS/HTML/JSON source/build files in the scan). Public publishable keys are expected in Vite output; no secret/service-role value or embedded service-role JWT detected. No key values are reproduced here. VITE variables must never carry privileged credentials.
- **Dependency audit:** `npm audit --json` returned **0 known vulnerabilities** (0 critical/high/moderate/low) in the current lockfile. This registry result is not proof that dependencies have no unknown flaws. No package upgrade was forced.
- **Escalation/access control:** authoritative Admin role/session checks, owner predicates, RLS and scoped avatar paths exercised in local DB fixtures. Ordinary metadata cannot grant Admin. No destructive hosted probe was run.
- **XSS/HTML:** no `dangerouslySetInnerHTML`, raw HTML assignment or eval-style rendering sink found in application source search. React text rendering, HTTPS source validation and safe external-link handling are present. Third-party map attribution HTML is library/configuration-controlled; no broad XSS guarantee is made.
- **Uploads:** existing validation rejects SVG/executable types and enforces image type/signature/size/dimension rules; avatar conversion and private signed access are preserved. Actual managed Storage upload/deletion integration remains unverified.
- **Failure truthfulness:** callback URL scrubbing, bad-password messages, pending-not-completed states, user-scoped history clear and service failures pass fixtures. No real password, account or Storage cleanup was attempted.

## 6. UI/UX, accessibility and visual review

Main route sweep and modern Admin checks pass English/Arabic direction, desktop/mobile widths, navigation and axe A/AA checks. Existing Auth transitions, keyboard submission, visible focus, reduced-motion behavior, password visibility, resend rate/cooldown and form preservation are covered by dedicated fixtures. Legal links open separately before registration submission. The public footer and legal pages remain bilingual.

Representative screenshots are in `docs/screenshots/phase14/`. Visual inspection included the English desktop map and Arabic mobile registration; map branding/controls/attribution and approved auth composition are retained. Missing live destination photos are a **content** gap, not silently substituted stock/demo imagery. No claim is made that automated axe checks replace manual screen-reader and real-device testing.

## 7. SEO, environment and performance

- Default title/description, language/direction, viewport/theme, Open Graph and Twitter card structure pass existing metadata tests without duplicates.
- Social preview is an actual **1200 × 630 PNG** at `public/assets/branding/unseen-jo-social-preview.png`, based on approved branding.
- No approved production origin is configured in the current build. Canonical/`og:url`/absolute social-image URLs are therefore omitted rather than pointing at localhost or an invented domain. Set reviewed `VITE_SITE_URL` and rebuild before release.
- Public legal routes are recognized. Private routes use noindex metadata and configured `X-Robots-Tag`; robots.txt allows crawling so crawlers can observe noindex. These are indexing controls, not access controls.
- This remains a client-rendered SPA. Initial `dist/index.html` contains homepage metadata; destination/legal route metadata is applied after React. Non-JavaScript social crawlers may show homepage defaults. Prerendering/SSR or a crawler-compatible initial-HTML strategy requires an explicit Phase 15 decision; dynamic social cards are not claimed solved.
- Build passes. Main JS is approximately **557 kB / 178 kB gzip**, MapLibre approximately **1.09 MB / 295 kB gzip**, with a roughly 508-kB worker. Existing >500-kB advisory remains. Deferred maps/charts reduce initial work but do not remove the need for performance budgeting. No Lighthouse/Core Web Vitals or production network/field performance certification is claimed.
- Vercel config is prepared locally; the actual hosting provider/domain/HTTP-header behavior remains unverified. Any other host must reproduce SPA fallback, private noindex headers and the reviewed security headers.

## 8. Executed tests and honest failures

| Suite | Result |
| --- | --- |
| Oxlint | PASS, final run without warnings |
| Production build | PASS; chunk advisory retained |
| Dependency audit | PASS: 0 known vulnerabilities |
| Asset validation / localization audit | PASS: 83 references/48 originals; no missing static translations |
| Broad offline suite runner | **10/13 PASS, 3 FAIL**: foundation, tourism, maps, recommendation engine, accounts, discoveries, search, localization, privacy and SEO pass |
| Privacy security | PASS: 9 groups, including production/remote-host UI activation denial |
| Current status database / browser | PASS: 8 DB groups and 2 bilingual browser groups; no hosted writes |
| Main-route browser / modern Admin Dashboard | PASS: 64 route/layout/axe groups plus 4 Admin dashboard groups |
| Production privacy unavailable / preserved development QA | PASS: 4 groups each, separately recorded |
| Premium Auth / account-only | PASS: 4 and 3 fixture groups |
| My Discoveries | PASS after safe stale-selector correction: 26 groups |
| Invitation/recovery | PASS: 9 fixture groups; hosted negative probe is opt-in and was not enabled |
| Legal pages / SEO browser / SEO unit | PASS: 24 / 16 / 7 groups |
| Anonymous hosted audit | PASS: 24 records, private boundaries, coordinate ranges and all 13 accessible image files |
| Real deletion integration | NOT RUN / UNVERIFIED by instruction; no Docker/WSL attempt |

Failures retained rather than hidden:

1. **`scripts/check-phase04.mjs`**: legacy `issues.length >= 3` publication-gate expectation conflicts with simplified status/content validation. Current dedicated status suite passes. Do not restore editorial approval gates to appease this test.
2. **`scripts/check-localization-database.mjs`**: reuses that legacy Phase 04 fixture and fails at the same assertion before its later translation checks. The normal localization and UI language suites pass; downstream DB checks in this suite are not claimed complete.
3. **`scripts/check-phase08.mjs`**: stored package/source/image evidence is expired at current wall clock; test expects it fresh. Preserve actual freshness protections and do not renew evidence merely by changing timestamps. The earlier PGlite startup diagnostic fix exposes the assertion correctly.
4. **`scripts/check-phase05-browser.mjs`**: live catalog recommendation assertion pins Iraq Al-Amir from an older catalog; current 24-record result is Amman Citadel. The engine suite passes, but the live browser sequence stops at this assertion. Reconcile expectations against the current catalog/algorithm and separately exercise the later image/empty/error/recommend-again cases before acceptance; do not simply declare all recommendation behavior passed.
5. **`scripts/check-admin-refinement.mjs`**: fixture lacks the current `/rest/v1/place_categories` request and aborts. Its initial model-series check passes, but subsequent UI cases are unverified in that script. The new modern dashboard and current status browser suites independently pass their stated scopes.
6. **Initial My Discoveries run**: waited for obsolete `.admin-auth-shell`; corrected to the actual shared `.auth-admin-page .auth-shell`. Full rerun passes 26 groups. No guard behavior was weakened.

Hosted mutation suites, account deletion, real password updates, live publication transitions, aggressive scanning and full unmanaged integration tests were excluded. No complete “all tests green” claim is made. Browser fixtures establish UI behavior under modeled responses; they cannot establish deployed Auth templates, real emails, live role-session acceptance or Storage transaction semantics.

Evidence: `docs/validation/phase14-*.json`, current destination-status/security/account/Auth/legal/SEO/phase07 browser evidence, `docs/validation/local-privacy-offline-regressions.json` and ignored fixture screenshots/logs. Two older report files can contain a historical failure; this report records the corrected My Discoveries rerun explicitly.

## 9. Changes made and exact files requiring follow-up

Safe local changes this phase:

- `src/features/account/privacyAvailability.js` — new production-denying, development-loopback QA policy.
- `src/features/account/PrivacyAccount.jsx` — truthful unavailable production panel; active implementation retained in a separate child component.
- `.env.example` — documented development-only `VITE_PRIVACY_QA=false`.
- `src/features/legal/content.js` — both languages now accurately describe unavailable production tools; draft status retained.
- `docs/legal/ACCOUNT_PRIVACY_IMPLEMENTATION.md`, `docs/legal/PRIVACY_ACTIVATION_READINESS.md` — cross-references clarify that earlier actionable-UI descriptions are superseded by the production availability gate.
- `vercel.json` — three conservative security-header settings; not deployed.
- `scripts/check-account-privacy.mjs`, `scripts/check-account-privacy-browser.mjs` — activation denial and separate production/development evidence.
- `scripts/check-phase07-browser.mjs` — verified Auth-shell selector correction.
- `scripts/check-phase14-readonly.mjs`, `scripts/check-phase14-browser.mjs`, `scripts/check-phase14-admin.mjs` — scoped QA evidence runners.
- This report, destination/content/security/npm audit JSON and screenshots under `docs/validation/` and `docs/screenshots/phase14/`.

Follow-up changes/decisions:

| Exact file/location | Required work |
| --- | --- |
| `scripts/check-phase04.mjs`, `scripts/check-localization-database.mjs` | Align obsolete fixtures/assertions with current simplified status semantics while preserving negative ACL/content-validation coverage |
| `scripts/check-phase08.mjs`, `docs/evidence/phase08/import-package.json` | Separate deterministic fixture-clock tests from real evidence currency; owner must genuinely revalidate relevant sources/rights before representing freshness |
| `scripts/check-phase05-browser.mjs`, `scripts/check-admin-refinement.mjs` | Reconcile current-catalog expectation and current API fixture coverage; rerun full suites |
| Hosted `places`, `place_translations`, `place_images` | Owner-controlled content/translation/media review for the exact gaps below; no automatic status changes |
| `src/features/admin/Overview.jsx` plus locale resources | Clarify review-center copy as quality guidance, not an editorial gate |
| `docs/legal/*`, `src/features/legal/content.js` | Confirm operator/contact, request handling, legal wording and retention; only then remove draft warnings |
| Both privacy SQL migrations and `supabase/functions/account-privacy/*` | Complete isolated integration and operator process before separately approved activation; do not deploy now |
| `.env`/deployment environment, `src/seo/*`, `index.html` | Approve real origin, callback redirects and crawler strategy; verify initial HTML/social image after deployment |
| `vercel.json` or actual host configuration | Verify headers, framing/CSP decision, SPA fallback and private route indexing on approved hosting |

## 10. Phase 15 priorities / release gates

1. Keep privacy tools unavailable; do not activate deletion to resolve QA cosmetically. Complete safe isolated integration when feasible, passwordless/MFA proof, non-atomic cleanup recovery, monitored handling and completion communications. Obtain separate hosted activation authorization.
2. Confirm legal operator/contact and qualified bilingual legal review; establish usable rights-request handling and justified retention/provider/transfer practices.
3. Resolve 18 pending/1 stale Arabic versions and 17 missing approved public photo sets; review 18 unverified tourism records, hours/pricing qualifications and current sources. This is an owner content decision, not a new status-approval workflow.
4. Repair the retained failing test assumptions/fixtures and complete full recommendation/Admin regressions. Keep current publication semantics and real freshness checks intact.
5. Perform genuine, non-destructive controlled-inbox signup/confirmation/recovery and both Admin session acceptance with owner-supplied test access; never change primary Admin credentials. Review leaked-password protection and last-Admin safeguards through a separately approved settings/migration plan.
6. Approve production domain/hosting/redirects, crawler/social rendering and security-header/CSP strategy. Measure production-like mobile performance and conduct manual screen-reader/real-device acceptance.

**Release gate:** reassess GO only after these unresolved items have explicit evidence and owner decisions. A successful Vite build, zero npm advisories and passing fixtures alone are insufficient to approve the current unrestricted release.
