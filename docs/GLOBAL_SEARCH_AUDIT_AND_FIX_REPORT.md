# Global search audit and repair

Date: 21 October 2026. Project: `dkhwwvoplhfjccvjegty`. Development: `http://127.0.0.1:4184`; production preview: `http://127.0.0.1:4190`.

## Scope and inventory

The source audit found **four search-input implementations**, with two shared route/state variants, and one disabled search entry point. All existing search implementations were repaired; no new search screens were added.

| Existing control | Complete flow and scope | Findings and repair |
| --- | --- | --- |
| Explore `/explore` and Map `/map` | `ExplorePage.query` → shared `filterPlaces` → existing Near You/attribute/category filters → the same `filtered` array passed to cards and MapLibre | Display-language-only name/city/description matching missed the other language and common Mujib names. Both languages now search immutable source names, eligible Arabic names, city, region, category labels and supported aliases. |
| My Discoveries Saved and Visited | `PersonalDashboard.query` → current user's/guest's collection from favorites or visits → `filterPersonalPlaces` → category/sort → cards | Previously matched displayed name/city/category only. Now shares the bilingual matcher, includes region and has an explicit accessible Clear Search control. Search never expands the owner's collection. |
| Admin Places `/admin/places` | existing URL `q` → Workspace 250 ms debounce → `repo.collection` → PostgREST predicates/count → stable ordered 20-row range → table | Already used server-side filtering before pagination. It was **not** limited to the loaded page. Predicates were limited to literal English/Arabic names; repaired city/region/slug coverage, Arabic normalization and common names. Search controls stay mounted on failures. |
| Admin Bilingual Review `/admin/translations` | local `query` → 250 ms debounced `search` → same server-side collection query plus review-status filter → 20-row queue | Same matching gaps. Queue loading is now independent from the active editor; canceled initial selection no longer leaves editor busy. Search errors/retry and no-results remain in the queue without discarding unsaved Arabic text. |
| Public header magnifying glass | Existing disabled “Search (coming later)” button | Now a same-design SPA link to `/explore#destination-search`, focusing the existing input. No new modal, backend endpoint or search field. |

There are **no existing text searches** in the Home body, Media Library, Publishing Workspace, Audit Log, Categories, Discovery History, Profile or authentication forms. These routes were inspected; no decorative icon or URL parameter was misclassified as a missing search implementation. Near You's city/radius selectors remain geographic filters. The media and audit lists retain existing server pagination.

## Confirmed causes

1. Public filters searched localized presentation fields after localization had replaced English names. Consequently Arabic names failed in English mode and English names failed in Arabic mode. Personal saved-place filtering had the same limitation.
2. Literal lowercase matching did not remove Arabic vowel marks/tatweel or normalize common alef/ya/hamza variants. Partial Arabic queries therefore depended on the exact spelling.
3. The stored canonical name is “Mujib Biosphere Reserve”; “Wadi Mujib” and “وادي الموجب” were not searchable synonyms. Public RLS correctly hides Mujib's stale Arabic translation, so that row could not legitimately be used as a public search index.
4. Admin server predicates searched English and translated names but omitted city/region/slug and normalized Arabic matching. Existing exact counts, RLS and 20-row server pagination were already present and were retained.
5. Translation queue loading and initial editor selection shared a busy flag. An interrupted initial selection could leave that flag set. Separate queue state and active-request guards fix this without changing save/review permissions.
6. Places request failures replaced the input with an error panel. The repaired list retains usable controls, shows the error and avoids claiming a failed request is a genuine empty result.
7. The header search action was explicitly disabled. It now opens the existing working search. A stricter browser check also found that AppLayout's normal route focus overrode the first input-focus effect. Scheduling input focus in a cancellable animation frame preserves the intended keyboard target after route focus completes.

No evidence identified Supabase authentication, RLS, Storage signing, image caching or MapLibre as the cause of the text-matching failures.

## Implementation

### Shared public and personal matching

`src/features/search/destinationSearch.js` normalizes Unicode NFKC, English case, whitespace, Arabic diacritics/tatweel, alef variants, ya variants and common hamza/ta-marbuta forms. Query terms use AND semantics across searchable fields, support substrings and ignore surrounding whitespace. Empty input restores the current filtered collection; punctuation-only input matches nothing. Input is bounded to 160 characters and 12 normalized terms. User punctuation is never treated as a wildcard or executable regular expression.

The public adapter builds immutable searchable source fields **before** display localization. Translation fields are included only when reviewed and tied to the current English timestamp. Existing public RLS is an additional boundary. No stale/pending translation is approved or exposed by this change.

The small Mujib naming-alias map uses the [Jordan Tourism Board's Wadi Mujib page](https://ar.visitjordan.com/wheretogo/wadi-mujib/). It adds naming vocabulary only; it cannot create a result, replace Supabase content, approve a translation or supply demo data. A matching destination must already be present in the published catalog or authorized collection.

Local search is immediate against the existing cached published catalog. My Discoveries filters the entire already-loaded saved/visited collection, not a visible card page. Existing owner-scoped loading, save/visit synchronization, sorting and category filters remain in place.

### Admin filtering and race handling

`src/features/search/adminSearch.js` constructs controlled PostgreSQL case-insensitive `imatch` patterns from normalized letters/numbers. Arabic variant classes allow matching stored names without altering database text. Per-term empty translation embeds allow English **or** authorized Arabic fields to match without dropping English-only destinations through an inner join. All terms, status, category, quality and review filters are applied before exact count and `.range()`.

Both current collection reads and the older `listPlaces` repository path use the shared predicate. Existing 30-second repository caching and in-flight deduplication remain intact. No large-table download or supplementary all-ID lookup was added. No migration, new index, RPC, permission or RLS modification was necessary for six destinations. Regex predicates may warrant measured index/search-column work if the authorized inventory becomes large; no unmeasured database optimization was applied here.

The 250 ms network debounce is retained once per input. Query/filter changes reset pagination. Old effect completions are ignored, avoiding stale rows after rapid typing. Queue pending state is distinct from editor saving state. Searching, paging, retrying or clearing the queue does not remount the selected Arabic editor.

Official references for the existing API features: [PostgREST table filters](https://docs.postgrest.org/en/stable/references/api/tables_views.html) and [empty embeds / null filtering](https://docs.postgrest.org/en/v12/references/api/resource_embedding.html).

### Feedback, accessibility and state

Clear Search removes only the query; existing Clear Filters removes the complete filter set. Search fields and clear buttons have localized accessible names. Status messages and `aria-busy` describe pending requests, and pagination is disabled while a query is pending. Decorative icons cannot intercept Clear clicks. RTL logical padding keeps input text away from its clear action. No new animation or redesign was introduced.

The public catalog remains anonymous and published/non-demo only. There is no hidden fallback from a failed hosted request to demo results. Admin access still uses the existing independently verified Admin session. Personal data remains owner-scoped and existing logout/account-switch cache cleanup remains unchanged.

## Before and after evidence

The before run used the actual anonymous hosted catalog, recorded in [search-before.json](validation/search-before.json).

| Search / display language | Before | After |
| --- | --- | --- |
| `عجلون` / English | 0 cards and markers | Ajloun found in either display language |
| `Ajloun` / Arabic | 0 cards and markers | Ajloun found in either display language |
| `Wadi Mujib` / either | 0 cards and markers | Actual published `wadi-mujib` record |
| `وادي الموجب` / either | 0 cards and markers | Same actual published record |
| `Umm Qais` / Arabic | 0 cards and markers | Actual published Umm Qais record |
| `أم قيس` / English | 0 cards and markers | Same record, including unaccented `ام قيس` |
| Admin city/region or marked Arabic name | Missing from previous name-only/literal predicate | Matching authorized record, including a fixture on page three |
| Clear / no match | Language-dependent subset | Zero cards and markers for no match; clear restores the collection under remaining filters |

The baseline sampled cards after 80 ms: its first English Ajloun entry captured exiting animated cards (6 cards versus 1 marker). That transient count is **not** reported as a steady-state filtering defect. After tests wait for settled rendering.

Screenshots: [before English](../artifacts/search/before-en.png), [before Arabic](../artifacts/search/before-ar-JO.png), [public desktop](../artifacts/search/public-en-1366-4190.png), [public Arabic mobile](../artifacts/search/public-ar-JO-390-4190.png), [Admin desktop fixture](../artifacts/search/admin-places-en-1366-4190.png), [Admin Arabic mobile fixture](../artifacts/search/admin-places-ar-JO-390-4190.png), [translation queue fixture](../artifacts/search/admin-translations-en-1366-4190.png).

## Verification

No protected operation is considered genuine authenticated acceptance from a fixture alone.

| Check | Result / evidence |
| --- | --- |
| Search model and PostgreSQL regex | 6 grouped checks passed, including Unicode, missing/stale translations, hostile punctuation and owner-subset filtering. [Results](validation/search-unit.json). |
| Live anonymous catalog and actual PostgREST predicates | 39 cases passed against the correct hosted project. Public projection and RLS, not an Admin token. [Results](validation/search-hosted.json). |
| Complete production-preview search browser suite | **14 groups passed**, covering 4 live public cases, 4 guest/account saved/visited fixture cases, 4 Admin pagination/filter cases, error recovery and ordinary-user denial. [Results](validation/search-browser-4190.json). |
| Development search browser suite | **14 groups passed** across independent subsets: [8 public/personal groups](validation/search-browser-4184-public.json), with the protected subset documented below: [public/personal results](validation/search-browser-4184-public.json), [6 Admin groups passed](validation/search-browser-4184-admin.json). |
| Direct `/map`, EN/AR, desktop/mobile, dev/preview | 8 cases passed: correct Mujib alias, synchronized cards/markers, List/Map switching, no results and clear. One initial catalog request in each context and **zero additional catalog requests** during search and view changes. [Results](validation/search-map.json). |
| Current My Discoveries browser regression | 18 fixture groups passed in production preview, including guest merge, visited persistence, owner switching, history, filters, 320/390/820/1366 px, RTL and scoped accessibility. [Results](validation/phase07-browser-4190.json). |
| Existing unit/disposable database suites | Discoveries 10, accounts 9, Admin 12, database 55, localization database 16, map 9, recommendations 11, tourism 15 and localization 6 grouped checks passed. These are isolated tests, not hosted account writes. |
| Oxlint / asset validation / build | Passed. Asset validation checked 83 references / 48 unique originals. Production build retains the existing large MapLibre chunk warning. |
| Historical `npm run test:regression` | **Not passing:** all five Phase 01 scripts failed on the current live target. The runner expects three demo Home cards, a demo loading heading and the retired `Visited` tab; its scale/image checks require every offscreen lazy image to be complete. Logs are retained in `artifacts/phase02b/regressions/`. These scripts need a separate update to the current product/fixture contract; no application behavior was reverted to satisfy historical expectations. |

Browser search coverage includes exact/partial names in both languages, diacritics, uppercase, surrounding whitespace, no results, clear, category/status/review filters, page-three matches, rapid input, delayed stale responses, language switching, tab return, zero document reloads, scoped Axe WCAG checks and viewport overflow checks. Admin fixtures contain **45 destinations**, while list requests remain capped at **20 rows** with exact counts. The rapid-input assertion checks one final debounced request after settling, rather than assuming fixed wall-clock completion on a busy test machine.

Network-error fixtures verify that Places search remains editable after a failed request and recovers with a changed query. Translation queue retry retains unsaved Arabic form text. Queue searches and pagination also retain that text during successful requests. Tests perform no real content, image, email or publication operations.

No connected signed-in browser was available. Authenticated Admin/account search is therefore **fixture-verified; genuine existing-account acceptance remains unverified**. Public browser cases use actual anonymous hosted data with no REST interception. The full browser evidence explicitly labels both scopes. No Auth emails were sent and no secrets were requested or exported.

The tab-return check switches to a second tab and returns after one second. It verifies query, document identity, canvas identity and absence of extra requests. It is not a memory-discard or long-background performance benchmark. Existing MapLibre locale changes intentionally reconstruct the localized map and restore camera state; this behavior was preserved. Searching and ordinary tab return do not recreate it.

Intermediate harness failures were corrected rather than counted as passes: an empty queue was initially awaited as visibly sized rather than attached; rapid-input timing was changed to await settled results rather than a fixed 500 ms; and the header test now verifies actual focus instead of focusing the field itself. The latter exposed the route-focus issue fixed above. Final evidence files, rather than interrupted/intermediate runs, are the acceptance results linked here.

Run the targeted suites with `npm run test:search`, `npm run test:search:hosted`, `npm run test:search:browser` and `npm run test:search:map`. Browser scripts use the existing external Playwright/Axe test installation and do not install runtime dependencies. Set `QA_BASE_URL=http://127.0.0.1:4190` for preview browser checks. `QA_SEARCH_PUBLIC_ONLY=1` and `QA_SEARCH_ADMIN_ONLY=1` select independent subsets.

[Final validation summary](validation/search-final-summary.json).

### Hosted preservation

Actual read-only Supabase checks confirm six published, non-demo destinations: `ajloun-forest`, `dana-reserve`, `iraq-al-amir`, `salt-historic`, `umm-qais`, `wadi-mujib`; zero drafts, 13 image records, three role records including one Admin, and 15 Storage objects. RLS remains enabled on the inspected public, profile, role, saved, visited and history tables.

Final whole-row destination/image/Admin-role/Storage object and bucket fingerprints match the prior Phase 06 preservation evidence. Translation fingerprints match between two SELECTs during final validation; historical differently ordered/formatted hashes are not compared directly. [Query and final results](validation/search-preservation.json). This search task made **zero hosted writes**.

### Modified files

- Shared matching: `src/features/search/destinationSearch.js`, `src/features/search/adminSearch.js` (new).
- Public and personal adapters: `src/features/tourism/model.js`, `src/features/personal/model.js`.
- Existing public controls: `src/components/layout/SiteHeader.jsx`, `src/pages/ExplorePage.jsx`, `src/pages/MyDiscoveriesPage.jsx`.
- Admin: `src/features/admin/repository.js`, `AdminApp.jsx`, `Management.jsx`, `TranslationReview.jsx`, `ui.jsx`.
- Feedback styles and locales: `src/styles/search.css` (new), `src/styles/global.css`, `src/i18n/locales/en.json`, `src/i18n/locales/ar-JO.json`.
- Tests: `scripts/check-global-search-before.mjs`, `check-global-search.mjs`, `check-global-search-hosted.mjs`, `check-global-search-browser.mjs`, `check-global-search-map.mjs`, `search-test-fixtures.mjs`; npm `test:search`, `test:search:hosted`, `test:search:browser`, `test:search:map` scripts in `package.json`.
- This report and `docs/validation/search-*.json`, with screenshots under `artifacts/search/`.

No tourism facts, publication statuses, media/rights records, account roles or database permissions were modified. Phase 08 Lite was not started.
