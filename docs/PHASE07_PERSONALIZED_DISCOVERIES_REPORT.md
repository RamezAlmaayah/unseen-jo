# Phase 07 — Personalized Discoveries (MVP)

Date: 21 October 2026. Project: `dkhwwvoplhfjccvjegty`.

**Implementation and hosted additive schema are delivered. Genuine signed-in Phase 07 write acceptance remains pending because no authorized browser session was connected.** Automated browser fixtures, disposable PostgreSQL tests and genuine anonymous hosted checks are distinguished below. Phase 08 Lite has not started.

Review locally: **http://127.0.0.1:4184/my-discoveries**. Direct sections: `?tab=visited` and `?tab=history`. Production-preview verification used port 4190.

## Existing implementation audit

| Capability | Existing implementation | Phase 07 action |
|---|---|---|
| Authentication/profiles | Phase 06 verified public account provider; separate Admin client/session key; owner-only profiles | Reused. No Auth, PKCE, role or profile-policy changes. |
| Favorites | `saved_places` unique `(user_id,place_id)`; published-only insertion; shared public favorite context; persistent local guest IDs | Reused existing storage and merge. Added `created_at` retrieval for truthful recent-save sorting. |
| Guest merge | Published IDs checked before an additive, duplicate-safe upsert; only successfully merged local IDs removed | Preserved. Reloads account save metadata after merging without changing original save timestamps. |
| Preferences | Phase 06 explicit save/restore and conflict resolution | Preserved; no new preference store. |
| Recommendations | Phase 05 deterministic ranking, weighted evidence and in-memory repeat avoidance | Algorithm untouched. Added a presentation UUID to the existing session and a separate persistence hook. |
| My Discoveries | Saved cards plus illustrative badges/progress; Visited placeholder; fixed sample ordering; obsolete removal feedback | Replaced with an account-aware Saved / Visited / History dashboard. Removed illustrative achievements from this personal dashboard. |
| Feedback table | `recommendation_feedback`: one reaction per user/place, including `visited`, interested or not interested | Retained unchanged. Using it for independent visits would overwrite another reaction, so a separate visit relationship is necessary. |
| Discovery history | No compatible persisted table; diversity IDs had neither recommendation dates nor durable ownership | Added minimal owner-only history. Existing diversity state keeps its original purpose. |
| Public catalog/media | Published non-demo repository, cache, localization adapter, responsive `AssetImage` and signed-URL reuse | Reused throughout. No destination, image, rights or Storage changes. |

## Delivered experience

### Saved Places

- Existing guest or account favorites, with live published photographs, localized names, category and city where available.
- Place Details links, remove/save action, search by displayed name/location/category, category filter and recent/name sorting.
- Account recent sorting uses the existing database save timestamp. Guests use their local insertion order; no historical dates are invented.
- Signed-in users can mark a saved destination visited, optionally entering a date. Favorites and visits are independent: removing a favorite keeps its visit.
- Pending favorite buttons cannot submit repeatedly. Failed account saves roll back their optimistic change, preserve the backend record and use the existing shared error notice. Fixed the old permanent “Updating…” feedback and outdated recommendation save announcement.
- Saved/visited references that no longer resolve through the public catalog remain manageable as neutral unavailable entries. Their private content is never queried or exposed, and users can remove their own designation without deleting a destination. Legacy local sample IDs are not silently converted into live records.

### Visited Places

- Separate list/count, optional date and remove-visited action.
- Explicitly labelled **self-reported**, never physically verified. No geolocation request or background tracking.
- Writes are confirmed before showing a successful visit. On failure, the entered date stays in the open form for retry.
- Dates must be real calendar dates from 1900 through the current day; the database also rejects future dates. To replace a date, remove the visit and mark it again.
- Visits are account-only. Guests get a contextual, optional sign-in link returning to the same section.

### Discovery History

- Records a signed-in recommendation only after a ranked candidate has successfully loaded its published Place Details data for presentation.
- Normal Place Details views, Explore browsing and guest recommendations do not write history.
- Each presentation has a UUID; React effect replay and retries use the same UUID and cannot duplicate that presentation. Repeated recommendations on distinct deliberate selections may appear separately.
- Stores only owner, presentation UUID, destination ID and a database-generated timestamp. No preference snapshots, scores, precise locations or page-view trail.
- Includes recommendation date, details and existing shared favorite actions. Unpublished/unavailable destinations show a neutral unavailable entry rather than private content.
- Reads 20 entries plus one look-ahead row, with a **Load more** action and a `(created_at,event_id)` cursor. Does not fetch the entire history on initial load.
- Clear has an explicit confirmation, cancellation, pending and retry states. It deletes only the current owner's history and retains favorites and visits. In-flight history writes are settled before clearing; cleared presentations remain suppressed in the current session.
- History write failure does not block the recommendation; a concise retry action is shown.

## Account synchronization and caching

`UserAccountProvider` remains the single favorite/preference authority for Explore, details, recommendations, Profile and My Discoveries. The legacy `usePreviewFavorites` hook remains compatible; its documentation now reflects the actual persistent provider.

The new personal provider scopes data and in-flight operations to the verified public account ID. A different identity sees an empty derived state immediately; cleanup discards the previous cache and late responses cannot update the next owner. Only the personal dashboard's editing/filter state resets on identity changes. Public routes, maps and authentication callbacks remain mounted.

Visits load when My Discoveries needs them; history waits until its tab opens. Requests deduplicate, completed reads remain cached, and scrolling/tab navigation does not refetch them. Writes update or invalidate the relevant personal cache. Explicit Refresh restores other-device changes without enabling continuous activity tracking or repeated focus queries. This MVP provides refresh-based synchronization rather than Realtime subscriptions or an offline write queue.

An existing Auth regression caught an intermediate cache-boundary implementation remounting the callback page. The final provider uses owner-scoped lifecycle guards without remounting the route tree; PKCE, token-hash, fragment and recovery fixture regressions subsequently passed. Auth implementation files and security behavior were not edited.

## Database and security

CLI-created migration: [`20261021122225_phase07_personal_discoveries.sql`](../supabase/migrations/20261021122225_phase07_personal_discoveries.sql). Replayed locally before applying successfully to the verified hosted project using the original Supabase connection. No connection was replaced.

| Table | Data and constraints | Access |
|---|---|---|
| `user_visited_places` | Profile/place FKs with cascade; primary key `(user_id,place_id)`; optional constrained date; server creation timestamp; place FK index | RLS owner SELECT/INSERT/UPDATE/DELETE. INSERT requires a published non-demo place. UPDATE grant permits only the date, never owner/place/timestamp. |
| `user_discovery_history` | Profile/place FKs with cascade; primary key `(user_id,event_id)`; server creation timestamp; owner/recent/cursor and place FK indexes | RLS owner SELECT/INSERT/DELETE. INSERT requires a published non-demo place. No UPDATE grant or policy. Client cannot supply creation timestamps. |

Both tables explicitly deny anonymous access. Ownership uses `auth.uid()`, not editable user metadata. No new privileged RPC, service-role browser key, Admin override, role assignment or Storage policy was introduced. Existing public destination visibility still controls all displayed destination data. The implementation follows the existing architecture and [Supabase ownership-policy guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

Actual hosted anonymous requests to both new tables returned `42501`. Hosted schema inspection confirms RLS and seven ownership policies. The security advisor reported no new table/RLS issue; its existing [disabled leaked-password protection warning](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) remains a launch/configuration decision. No Auth setting or paid service was changed.

### Preservation evidence

Before/after whole-row fingerprints match for destinations, image records, translations, all user roles and Storage object metadata. Final hosted counts: **6 published destinations, 13 image records, 3 role records including 1 Admin, 15 Storage objects**. The new private tables contain **zero rows** because no real account writes were performed during acceptance testing.

All six remain publicly available: Ajloun Forest Reserve, Dana Biosphere Reserve, Iraq Al-Amir, As-Salt Historic Centre, Umm Qais and Mujib Biosphere Reserve. Existing IDs/slugs, publication states, licensing evidence and Admin access were preserved. See [schema verification](validation/phase07-hosted-schema.json), [final preservation](validation/phase07-final-preservation.json) and [real HTTP checks](validation/phase07-hosted-http.json).

## Bilingual, responsive and accessible behavior

The dashboard uses the existing translation architecture, brand colors, responsive image pipeline and public Navbar. Added Arabic interface labels, including short failure/loading/confirmation text, preserve UTF-8. The Arabic test matrix caught and corrected an encoding issue before delivery; a Unicode regression check now covers the new core labels.

Desktop has three card columns, tablet two and mobile one. Tabs have labelled icons, counts, roving keyboard focus, Home/End and direction-aware arrows. Inputs have accessible labels, pending controls are disabled, errors/status are announced, and clear-history confirmation receives focus. Existing global reduced-motion support and restrained Button interactions are reused. No global button animation system was introduced.

**Existing content review:** five hosted Arabic translations are reviewed against the current English source. Wadi Mujib's stored translation is marked reviewed but its source timestamp is stale. The existing adapter therefore shows English and the dashboard explicitly explains that fallback. Reconcile/review Wadi Mujib's Arabic against the current English source manually; Phase 07 did not change either translation or review status. [Read-only translation evidence](validation/phase07-translation-read.json).

## Screenshots

Before screenshots are genuine guest views of the previous implementation. Live after screenshots use actual anonymous Supabase destinations/Storage; six favorite IDs were placed only in the isolated browser's local storage. No account or backend save was created.

| View | Before | After |
|---|---|---|
| Desktop English | [Previous guest dashboard](../artifacts/phase07/before-en-1366.png) | [Real public photographs and local saves](../artifacts/phase07/after-saved-live-en-1366-4190.png) |
| Mobile Arabic | [Previous guest dashboard](../artifacts/phase07/before-ar-JO-390.png) | [RTL dashboard with real public photographs](../artifacts/phase07/after-saved-live-ar-JO-390-4190.png) |

Account-state screenshots below use **simulated Auth/REST and synthetic image fixtures**. They verify layout and interaction; they are not genuine signed-in acceptance or production photographs.

- [Visited desktop](../artifacts/phase07/visited-en-1366-4190.png), [Visited Arabic mobile](../artifacts/phase07/visited-ar-JO-390-4190.png).
- [History desktop](../artifacts/phase07/history-en-1366-4190.png), [History Arabic mobile](../artifacts/phase07/history-ar-JO-390-4190.png).

## Measured performance

| Measurement | Observed result | Scope |
|---|---|---|
| Route JS | 13,716 bytes; 4,601 bytes gzip | Actual production My Discoveries chunk, lazy imported rather than eagerly bundled into public routes. Shared runtime excluded. |
| Account dashboard usable | Development median 814 ms; preview median 406 ms across eight EN/AR viewport cases | Real browser/React with intercepted APIs. These are fixture timings, not hosted response guarantees. |
| Initial visited/history requests | 1 visited request, 0 history requests on Saved | Authenticated fixture with a small visit collection. History fetched only when requested. |
| History pagination | 20 → 40 → 45 displayed entries | Seeded fixture; first query capped at 21 rows. Stable timestamp ties also tested in PostgreSQL. |
| Real public preview, desktop | 1,591 ms usable; 19 resource entries; 460,655 same-origin transfer bytes | Single headless live-network run, EN 1366×768. Cross-origin transfers are not included in the byte total. |
| Real public preview, mobile | 1,008 ms usable; 25 resource entries; 626,271 same-origin transfer bytes | Single headless live-network run, Arabic 390×844. |
| Tab return | 0 document reloads and 0 extra Supabase requests | Genuine anonymous browser, 5-second switch-away tests at desktop/mobile. Fixture account query/filter stability also tested. |

Responsive source sets, placeholders, async decoding, lazy image signing/loading and cached URLs are reused. Live screenshots were scrolled through before capture to allow offscreen images to load. No full-resolution viewer or original file was altered.

The before capture recorded 1,786/3,240 ms including an additional 700 ms settle wait in development. Its methodology differs from the after usable-state timer, and development/prod assets and network conditions differ. These observations **do not establish a before/after speedup**. No unsupported percentage improvement is claimed. Existing MapLibre/shared chunk-size warnings remain; Phase 07 does not change the map bundle or browser tab-discard behavior.

## Tests and verification

| Command / check | Result | Evidence scope |
|---|---|---|
| `npm run test:discoveries` | 10 groups passed | Full disposable PostgreSQL/PostGIS replay, owner isolation, spoofed writes, immutable columns, dates, deduplication, published-only inserts, cursor ties, independent clears, filtering and Unicode. |
| `npm run test:discoveries:browser` | 18 groups passed on each of 4184 and 4190 | Guest merge with existing/new/duplicate saves; dates; refresh; failure/retry; history; cross-page favorites; unavailable saved/visited records; logout/identity isolation; ordinary-user Admin barrier. EN/AR at 1366, 820, 390 and 320px. |
| Axe scans within Phase 07 browser suite | No WCAG A/AA violations in scanned states | Saved, visited, history and clear-confirmation; desktop/mobile; reduced-motion cases. Automated scans are not human accessibility certification. |
| `npm run test:accounts` | 9 groups passed | Existing account/profile/preferences/Auth/RLS regressions, all migrations included. |
| `test:accounts:browser` with `QA_ACCOUNT_ONLY=1`, preview | 3 account/callback/recovery groups passed | Existing simulated account save/refresh/merge and SDK callback flows; no real emails sent. |
| `npm run test:database` | 55 checks passed | Existing foundation security suite; disposable database, not hosted writes. |
| `npm run test:tourism` | 15 groups passed | Public repository, pagination, image eligibility, cache and missing-data handling. |
| `npm run test:admin` | 12 groups passed | Existing Admin/security/publication/media safeguards in local database. |
| `npm run test:recommendations` | 11 groups passed | Original scoring, evidence and diversity behavior. |
| `test:recommendations:browser`, preview | 11 groups passed | Six real guest language/viewport journeys and five simulated edge cases. |
| `npm run test:map` | 9 groups passed | Existing geographic/style/permission-error logic. Explore/map entry and list controls also exercised in Phase 07 browser tests. |
| `npm run test:localization` | 6 groups passed | Resource parity, Arabic text, content fallback and format behavior. |
| `npm run test:localization:database` | 16 groups passed | Existing translation visibility, stale-source, approval and publication boundaries in disposable PostgreSQL. |
| `node scripts/check-phase07-hosted.mjs` | Passed | Genuine anonymous API denials and all six actual published destinations/images. |
| `npm run test:accounts:hosted` | 7 checks passed | Genuine public Auth settings and anonymous private-access denials. |
| `node scripts/capture-phase07-live.mjs` | Passed | Actual public data/images, local guest saves, tab return, responsive source sets and overflow checks. |
| Oxlint / asset validation / production build | Passed | Zero lint warnings; 83 asset references/48 unique originals retain integrity; existing large-chunk warnings only. |

Detailed browser results: [development](validation/phase07-browser-4184.json), [preview](validation/phase07-browser-4190.json), [unit/database](validation/phase07-unit-database.json), [real live preview](validation/phase07-live-browser-4190.json), [existing callback regressions](validation/phase06-browser-4190-account.json). Historical suites not listed here were not claimed rerun; obsolete Phase 01 demo assumptions are not acceptance evidence for this account-connected implementation.

## Changed files

- `src/features/personal/`: new context, repository, pure date/filter model and identity-scoped provider.
- `src/pages/MyDiscoveriesPage.jsx`: dashboard, tabs, filters, visits, history and guest prompts.
- `src/pages/DiscoveryResultPage.jsx`, `src/features/recommendations/RecommendationProvider.jsx`: minimal successful-presentation history integration; scoring engine unchanged.
- `src/features/account/repository.js`, `UserAccountProvider.jsx`: existing save timestamp retrieval, post-merge refresh and pending/rollback metadata.
- `src/features/discovery/usePreviewFavorites.js`, `src/components/discovery/DiscoveryResultContent.jsx`: corrected obsolete persistence descriptions.
- `src/App.jsx`: personal provider and lazy dashboard route; existing Auth routes preserved.
- `src/styles/personal-discoveries.css`, `global.css`; `src/i18n/locales/en.json`, `ar-JO.json`: scoped layout and bilingual labels.
- Additive migration above; `scripts/check-phase07*.mjs`, `capture-phase07-live.mjs`, `package.json`: repeatable validation. Existing Phase 06 browser fixture/selectors updated for the new dashboard.
- This report, `docs/ROADMAP.md`, README current status, validation JSON and screenshot artifacts.

No application dependency was added. The button audit/CSV remain historical documentation and were not rewritten.

## Remaining acceptance and MVP launch requirements

1. **Genuine Phase 07 account writes / second device:** connect or privately use an existing ordinary test account. Save/remove a destination, mark a dated visit, refresh and sign in again, receive a Surprise Me result, inspect/clear test history, and restore on another device. Current browser inventory exposed no signed-in sessions. Fixtures and local RLS tests do not replace this acceptance.
2. **Fresh signup PKCE/email confirmation:** remains separately pending. Preserve the owner's actual 20 October confirmation that recovery callback and sign-in worked; do not relabel that completed recovery check as unverified. No new real signup or verification email was attempted in Phase 07.
3. **Wadi Mujib Arabic review:** reconcile the stale source linkage/content through the existing review workflow. No automatic approval or tourism edit occurred.
4. **Production configuration:** verify deployed Auth redirect origins and email delivery; Google is disabled until deliberately configured/tested. Review the existing leaked-password advisor warning and hosting configuration without assuming paid-service authorization.
5. **MVP limitations:** visits are manually reported; history begins with this implementation and is not backfilled from browsing. Account changes synchronize on load/sign-in or explicit Refresh, not in real time. No offline write queue, itinerary planner, weather, reviews or advanced personalization is implemented. Full authenticated Admin acceptance and browser-discard restoration were not repeated in this phase.

The [roadmap](ROADMAP.md) records implementation versus remaining acceptance. **Stop here and await approval before Phase 08 Lite.**
