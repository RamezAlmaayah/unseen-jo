# Phase 02B — React + Supabase public tourism integration

Completed **16 October 2026 (Asia/Amman)**. Public React data integration and starter draft preparation are complete. **The live project contains 7 categories, 6 draft destinations and 0 published destinations.** Home/Explore show an honest empty collection. Publication awaits destination-media identity and production reuse-rights evidence; no sample content was disguised as live data.

Phase 03 has not started. No Auth sessions/UI, permanent saves, live maps, recommendation engine, admin, weather, trip planning, partner, booking or payment feature was implemented.

## Inspection and connection

Reviewed the Phase 00–02A reports, both visual-refinement reports, schema/setup documentation, routes, existing destination/card state and original asset inventory. The dedicated `supabase_unseen_jo` MCP returned `https://dkhwwvoplhfjccvjegty.supabase.co`; hosted schema/FKs/RLS and actual public SDK/HTTP access were inspected. Before this phase there were seven categories and zero places.

An enabled modern publishable key was retrieved from that verified connection and saved with the URL and `VITE_DATA_MODE=supabase` in ignored `.env.local`. No secret/service-role key, DB password, management token or signing key was retrieved. Original Supabase registration and unrelated projects were not used or modified.

The existing pinned SDK **2.118.0** was reused; no dependency installation/change or project recreation was necessary. Production bundles were built for validation; no website was deployed. Database schema, three migration files/history, RLS definitions and private Storage policies are unchanged. Before/after comparisons verified all 48 policy definitions exactly.

## Public data layer

Added validated mode/model/repository/hook modules under `src/features/tourism/`. Components call the shared layer, with no embedded SQL or scattered SDK queries.

The repository supports published/non-demo catalog reads, single-slug reads, active categories, place-category/image relationships, text search, category/property filters and a three-entry featured preview. It uses actual deployed columns and nested FK selects, concurrent category/place requests, one-minute promise caching, explicit invalidation/retry, 500-row pagination and 15-second read timeouts. Automatic SDK retries are disabled to avoid hidden repeated requests. No per-card queries occur.

Unknown costs, duration, coordinates, visit/access notes and group suitability stay unknown. Live UUIDs are separate from slugs/demo IDs. The schema has no featured column, so Home uses a documented stable slug-order preview; it does not claim ranking or personalization. Additional city/cost/duration/group filters are prepared service operations without adding unapproved UI controls.

The SDK client is lazy-loaded into its own production chunk. The main JavaScript bundle is approximately **469 kB** (148 kB gzip); the SDK chunk is approximately **215 kB** (55 kB gzip). The final build has no large-chunk warning.

## Data modes and pages

| Page/feature | Final behavior |
| --- | --- |
| Home | Shared live featured preview; unchanged hero/promotion/layout; honest loading/error/retry/empty states |
| Explore | Real active categories; published places, shared search/filtering and clear controls; unchanged static map/card composition |
| Place Details | Published slug query; related category/image metadata, available source/details, missing-field/image fallbacks, proper missing-place state |
| Preferences | Original controlled in-memory state; prepared category-slug to database-ID mapping; no persistence |
| My Discoveries | Temporary in-memory saves resolve against the selected catalog; no remote saved_places writes; fixed sample saves explicitly labeled |
| Surprise Me / Discovery Result | Original fixed Figma demonstration, original comparison logic; no live ranking/recommendation |
| Account/Profile/Map shell | Existing previews and static behavior retained |

Production defaults to Supabase. `auto` uses Supabase when configured and permits development demo only if both settings are absent; production auto still requires live configuration. `demo` is an explicit override with labels. Empty responses and request failures **never** select demo fallback. Missing/incomplete/unsafe settings render an actionable error.

In live mode, fixed-result Details links include `?sample=figma` and show a labeled sample page. Its string IDs remain distinct from live UUID saves. The sample collection loader is offered only in demo mode. All saves reset on refresh; neither mode creates user activity or accounts.

## Tourism content and review

Six canonical records were imported using reviewed, additive content DML:

| Slug | Name | Editorial categories |
| --- | --- | --- |
| ajloun-forest | Ajloun Forest Reserve | Nature |
| salt-historic | As-Salt Historic Centre | Culture, History |
| wadi-mujib | Mujib Biosphere Reserve | Nature, Adventure |
| dana-reserve | Dana Biosphere Reserve | Nature |
| iraq-al-amir | Iraq Al-Amir | Culture, History |
| umm-qais | Umm Qais | History, Culture |

Names and short factual descriptions were checked against [RSCN](https://www.rscn.org.jo/reserve/list?lang=en), [UNESCO's As-Salt listing](https://whc.unesco.org/en/list/689/), and Jordan Tourism Board pages for [Amman/Iraq Al-Amir](https://international.visitjordan.com/wheretogo/amman/) and [Umm Qais](https://international.visitjordan.com/wheretogo/umm-qais/). Category assignments are editorial classifications. No trail access/safety, operating season or suitability claim is inferred.

The duplicated Wadi Mujib landing labels become one canonical live draft. Accurate reserve/heritage names were used without rewriting the original Figma demo. All costs, durations, coordinates, city/address, visit/access notes, group suitability and final verification fields are **NULL**. Source URLs are stored; a separate manifest records review date, source scope, candidate media and missing evidence. Partial text review is not represented as complete verification.

`npm run prepare:tourism` creates `supabase/content/phase02b-starter.sql` from the review manifest and does not connect remotely. The SQL uses conflict-safe inserts, never updates existing slugs, and creates category links only for newly inserted rows. It was tested twice in disposable PostgreSQL, including preservation of a simulated editorial change. The real remote import was replayed once and produced an exactly unchanged snapshot, including UUIDs, links and audit count.

Final remote state:

- **7 categories; 6 drafts; 0 published; 0 archived.**
- **10 place-category links; 0 image metadata rows; 0 Storage objects; 0 Auth users.**
- **23 audit events:** seven prior category events plus six new place and ten relationship insert events.
- Hosted RLS fixtures were rolled back; none remain.

## Images and publication blocker

All 83 Figma asset references and 48 original hashes remain intact. No asset was uploaded, replaced or deleted. Existing hero/promo/static map artwork and explicit demo screen mappings were preserved.

The Ajloun orange-rock/castle photos and duplicated Wadi Mujib associations are known source conflicts. Matching filenames do not establish geographic accuracy or production reuse rights. No candidate destination photo currently has both forms of evidence, so **all imported places remain drafts** with verified_at NULL.

`src/data/tourism-media.js` is an empty approval registry. Live pages use only reviewed exact-slug local mappings or existing private Storage metadata with authorized signed URLs; unapproved/missing imagery shows a labeled fallback. The repository prepares one batch of five-minute signed URLs under existing RLS, never public bucket URLs. It does not upload anything or weaken policies. Attribution is retained and displayed when provided.

See [TOURISM_DATA.md](./TOURISM_DATA.md) and [the review manifest](../supabase/content/jordan-starter.json) for per-destination candidates and publication requirements. Media clearance is a content prerequisite, not a technical reason to silently fill the live site with demo records.

## Verification actually executed

| Check | Actual result |
| --- | --- |
| Existing database suite | **55 grouped checks passed** on disposable PostgreSQL/PostGIS |
| New local tourism suite | **15 grouped checks passed**: config/modes, SDK request shapes, joins/cache/pagination, empty/search/filter/slug/media/NULL/error/retry behavior, preference mapping, import replay |
| Real hosted publishable-key SDK/HTTP suite | **17 checks passed** |
| Rollback-only hosted anonymous-role RLS suite | **6 assertions passed** |
| New browser suite | **8 flow groups, 35 responsive cases passed** |
| Existing Phase 01A browser suite | **14 cases passed** |
| Existing Phase 01B browser suite | **21 cases passed** |
| Existing Phase 01C browser suite | **42 cases plus flow assertions passed** |
| Landing refinement suite | **5 viewports plus 12 shared-route checks passed** |
| Global UI scale suite | **91 page/viewport cases plus 10 extra states passed** |
| Lint, production build, asset validation | **Passed** |
| Hosted security advisor | **0 findings** |
| Final client bundle credential scan | **Passed** |
| Established tokens/page/component/account/UI-scale styles | **All eight files unchanged by SHA-256** |

Hosted HTTP checks used the actual modern publishable key: seven categories load, real nested place reads return empty, even an **unfiltered** public place request hides all six drafts, draft/unknown slugs return unavailable, seven private tables deny access, public category inserts/place updates/deletes are forbidden, and image metadata is empty under RLS.

The hosted SQL suite inserted published/draft/archived fixtures inside one transaction, verified published visibility and unpublished/private/write denial as anon, then rolled back. **Positive published-place HTTP rendering was simulated locally**, because no media-cleared production record exists; no fake published destination was left online for a test. SDK mocks and browser interceptions are explicitly labeled and are not described as hosted tests.

Real-browser flows trace production page → SDK → hosted API → empty UI, verify two shared catalog requests across Home/Explore navigation, and prove there is no demo-file fallback. Separate intercepted fixtures cover successful published cards/details, missing metadata/images, search/categories/clear, network failure/retry and live temporary saves. Explicit demo builds run all previous navigation, gallery, preferences, account-preview, motion and responsive regressions. New live/fixture checks span 320–1920px.

Initial test issues were resolved: SDK automatic retries multiplied an injected-failure test; repository reads now use deliberate user retry. Browser synchronization was corrected to wait for the new route and settled viewport layout. Final runs passed without weakening security or UI behavior.

## Visual results

Approved compact sizing remains: approximately 60px desktop navbar, 14px navigation, 15px body, 44px form controls, 40–44px hero headings and a 1200px main-width cap. Reduced motion and the static map remain intact.

Regression captures for Explore, Details, Discoveries, Preferences, Result, Surprise Me, account/Profile/Not Found and Map pages at 1366px/375px match the existing global-scale screenshots byte-for-byte. Home differs only for the intentional visible demo label; preview dialog text was reviewed and its original demo formatting retained. The final mobile dialog capture is byte-identical; desktop differs by 20 background-image pixels within a 13×14px corner region, with dialog layout/text unchanged. Live empty desktop/mobile screenshots were visually inspected. Existing screenshot documentation is restored from its byte-for-byte backup; new Phase 02B evidence is separate.

## Files created and modified

Created:

- `src/features/tourism/{mode.js,model.js,repository.js,useTourism.js}`
- `src/data/tourism-media.js`; `src/styles/tourism.css` (async state/fallback styling only)
- `supabase/content/{jordan-starter.json,phase02b-starter.sql}`
- `supabase/tests/remote-phase02b.sql`
- `scripts/{prepare-tourism-import,check-phase02b,check-phase02b-hosted,check-phase02b-browser,run-phase02b-regressions}.mjs`
- `docs/TOURISM_DATA.md`, this report, Phase 02B validation JSON and screenshots

Modified:

- Pages: `LandingPage`, `ExplorePage`, `PlaceDetailsPage`, `MyDiscoveriesPage`, `DiscoveryResultPage`
- Components: `FeaturedCard`, `DestinationCard`, `DestinationPreview`, `SavedPlaceCard`, `ContentState`, `CategoryFilter`, `DiscoveryResultContent`, `PhotoGallery`, `AssetImage`
- `useDemoDestinations.js` (optional enabling); `src/lib/supabase/client.js` (current phase comment)
- `src/styles/global.css` (imports only the new async-state stylesheet)
- `package.json` (test/import scripts only); `.env.example`; ignored `.env.local`
- README, schema/setup/asset-inventory/validation documentation

Unchanged: package-lock/dependencies, routes/App, design tokens/global UI scale, original assets/provenance, demo dataset/featured records, preference logic, existing regression assertions, schema migrations and all RLS/Storage policies. Generated logs/builds/backups remain under ignored `artifacts/phase02b/` and `dist/`.

## Evidence, remaining limits and stop point

- [Remote state, import replay, unchanged policies, migration inventory and hosted RLS results](./validation/phase02b-remote-results.json)
- [Consolidated local/hosted/browser/regression/integrity evidence](./validation/phase02b-tests.json)
- [Live empty desktop](./screenshots/phase02b/live-empty-desktop.png) / [mobile](./screenshots/phase02b/live-empty-mobile.png)
- [Data contract, usage and source/media review](./TOURISM_DATA.md)

There is no remaining local implementation/test blocker. The public collection intentionally has no published content until media identification/reuse rights and final editorial verification are satisfied. Coordinates and detailed visit information are still missing and remain NULL. Successful real published-content HTTP/gallery flows cannot be claimed yet; those paths have local fixtures and hosted SQL authorization coverage.

No email/signup/JWT session, authenticated Storage lifecycle, non-Chromium/hardware testing or hosted website deployment is claimed. Private bucket signing is tested with local SDK fixtures; no real published image object exists. Large-catalog performance beyond pagination fixtures is not benchmarked. Current one-minute catalog caching refreshes on navigation/reload, not through polling.

**Phase 02B stops here. Phase 03 requires separate approval.**
