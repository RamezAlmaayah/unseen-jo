# Tab switching performance and state preservation

19 October 2026 · Unseen Jo

## Outcome and measured scope

The dashboard no longer replaces a same-account workspace with its checking screen on routine Supabase session recovery. Public navigation reuses warm data and valid signed image URLs. Live public view preferences can survive a genuine reload; private administrator edits and GPS coordinates are not persisted.

The comparison uses the real React app and bundled Supabase client in separate Chromium browser contexts, with explicitly isolated Auth/API responses. MapLibre and geographic provider rendering were real. No genuine owner browser was available: browser discovery exposed no browsers/tabs. The headless browser kept both targets “visible” even after `bringToFront`, so **this is not claimed as an end-to-end reproduction in the owner's Chrome/ChatGPT tabs**. Controlled standard `visibilitychange` and `focus` events exercised the actual SDK recovery path, with real 5-second and 30-second waits. Genuine anonymous hosted/public rendering is recorded separately.

## Root cause

The old dashboard subscribed to every Auth notification with `setAccess('checking')`, then verified permission again. Supabase's visibility recovery can emit `SIGNED_IN` for the same existing account. The checking state removed the dashboard subtree, losing editor state and refetching its data. A focus listener and Auth callback could also start overlapping checks. This was a **component unmount/revalidation cycle**, not a full document navigation in the measured case. The actual installed SDK recovery path was inspected alongside the [Supabase Auth event documentation](https://supabase.com/docs/reference/javascript/auth-onauthstatechange).

Before editing the application, the controlled recovery test lost an unsaved Arabic name, inserted three skeleton-bearing DOM nodes and requested Auth/permission/catalog data again. The public Explore/Map baseline already kept state and did not refetch on focus; no public focus bug was invented to justify changes.

## Before and after

Each row below applies to English and Arabic. The full matrix covers Explore, Map and the administrator translation workspace in Vite development (`4184`) and production preview (`4190`), with two return intervals per case: **24 observations per run**.

| Observation on return | Before | Verified after |
| --- | --- | --- |
| Dashboard, 5 seconds: Supabase requests | 6 development / 5 preview | 0 in both modes |
| Dashboard, 30 seconds: Supabase requests | 6 development / 5 preview | 2 in both modes; one Auth/permission check pair |
| Dashboard skeleton-bearing node insertions per return | 3 | 0 |
| Initial unsaved Arabic edit | Lost on the first return | Retained through both returns |
| Public Explore/Map Supabase requests | 0 | 0 |
| Document reloads in the observed event path | 0 | 0 |
| New MapLibre canvas mounts on return | 0 | 0 |
| Image requests / vector-tile requests on verified return samples | No optimization claimed from the baseline | 0 / 0 |
| Search, selected marker, zoom and language | Public baseline retained these | Retained in all final samples |

Evidence: [before matrix](validation/tab-performance-before.json), [verified matrix](validation/tab-performance-verified.json), [access/cache security tests](validation/performance-security-tests.json) and [reload/GPS tests](validation/public-restoration-tests.json). All final verified samples have unchanged document tokens, zero skeleton additions, zero map mounts and retained relevant state. Console page-error arrays are empty.

The observer counts inserted nodes containing a skeleton; “3” is not represented as three independent loading-screen durations. Each return has a recorded observation window and request scheduling times, but those are not a reliable internet speed or paint-latency benchmark. No millisecond speed multiplier, FPS improvement or memory-saving percentage is claimed. Production-preview CDP traffic was zero for the public return samples; development traffic can include tooling and outstanding resource completions. Its nonzero transport byte counts are retained rather than described as zero network activity. The zero image-request result does not rely on claiming a cold download was a cache hit.

An intermediate development run overlapped source-file edits and showed selection resets; it remains in `tab-performance-final.json` and is excluded as a clean focus comparison. The subsequent verified run passed all 24 state/return observations. Vite updates triggered by editing code are distinct from ordinary tab return.

## Implementation

**Administrator access:** `accessController.js` and `useAdminAccess.js` coalesce concurrent checks and keep the same allowed account mounted during background verification. A 30-second reuse window prevents repeated focus/Auth checks; the existing 60-second forced permission polling remains. Supabase token refresh is still enabled. Failed permission checks fail closed. Sign-out and identity changes clear access immediately; generation checks reject stale in-flight results. Workspace keys include the account ID so a different account cannot inherit the prior editor component. No global private data cache was introduced. Mutation authorization remains enforced by the backend on every operation.

**Public data:** the existing architecture was retained without adding a query library. In-flight reads deduplicate, valid resolved catalog/detail snapshots are available synchronously, and route mounts avoid a loading-only frame when data is already warm. The existing 60-second public data TTL remains; expired data is revalidated when requested, not on every focus. Cache entries are bounded. Errors are not cached. Successful Admin mutations, including atomic publication, invalidate public data in the current app and signal other tabs through a credential-free BroadcastChannel message. No rows or user identities are broadcast.

**Images:** catalog and detail reads share valid private-bucket signed URLs for the same paths, with a safety margin before their existing five-minute expiry. Signing still passes Storage RLS. Data invalidation clears signing caches. Stable `src` values avoid unnecessary `AssetImage` remounts/flicker. Existing lazy loading and image sharpness remain. Twelve licensed originals and thirty-six responsive derivatives were prepared for the content workflow, but those derivatives are not represented as uploaded or active responsive Storage delivery while publishing is blocked. No paid image transformation service was added.

**MapLibre/React:** map instances already survived public focus in the baseline. The Nature Cartography style, worker, gestures, controls, Near You behavior, tile sources, markers and language behavior were retained. Localized destination/category arrays now remain stable when their underlying data and locale do not change, avoiding avoidable map/filter recomputation. Maps can restore a saved public camera after a true reload, while their ordinary resize handling remains intact. No speculative remount/reuse mechanism or blanket memoization was introduced.

**Public view restoration:** live Explore/Map use per-tab session storage for public search, category/attribute filters, view, selected public identifier, scroll and a non-GPS map camera. Data rows, Auth tokens, accounts, administrator fields and location permissions are not stored there. GPS use clears camera persistence and suppresses subsequent GPS-derived camera writes for that mounted view. The separate Figma demo retains its original no-persistence behavior. Public descriptions render paragraph escapes as prose without rewriting English source records.

## Testing and limitations

* Seven access/cache groups passed: cooldown/concurrency, sign-out and account-switch races, permission revocation, warm cache snapshots, URL stability/expiry and mutation invalidation/error recovery. Real SDK query builders also verify that successful Admin writes invalidate public data while read RPCs do not.
* Four browser restoration/accessibility groups passed, including a real document reload, actual MapLibre state restoration, browser-emulated one-shot GPS privacy and both publishing-interface languages.
* Twelve bilingual-review browser checks and seven existing localization interaction groups passed. All 32 existing regression jobs passed; unit, database, hosted, map, accessibility and layout suite results are listed individually in [the regression index](validation/publishing-performance-regressions.json). Genuine hosted operations are labelled separately from fixture tests.
* A legacy GPS test was updated to allow only the new public preference key and explicitly assert that GPS coordinates/origin are absent; it no longer equates all session storage with location storage. Demo persistence compatibility was fixed in the application before rerunning the affected legacy checks.
* Oxlint, asset validation and the production build pass. The existing large MapLibre bundle warning remains. Hardware/WebGL/provider behavior can still affect initial map startup; no unsupported claim of eliminating those costs is made.

Chrome can discard inactive tabs and reload their documents under Memory Saver or memory pressure. Application code cannot promise to prevent that. The [Chrome developer guidance](https://developer.chrome.com/blog/memory-and-energy-saver-mode?hl=en) distinguishes this browser behavior from a normal rerender. Actual owner-Chrome discarding was not feasible without a connected browser and was not simulated by crashing a tab. The reload test demonstrates restoration of safe public state, not guaranteed preservation of unsaved administrator work after browser discard. Admin edits intentionally stay in memory and must be saved to survive a real reload; GPS is intentionally reacquired only by user action.

Main changed files: `src/features/admin/accessController.js`, `useAdminAccess.js`, `AdminApp.jsx`, `repository.js`; `src/features/tourism/catalogEvents.js`, `repository.js`, `useTourism.js`, `exploreState.js`; `src/pages/ExplorePage.jsx`, `PlaceDetailsPage.jsx`; `src/components/map/MapCanvas.jsx`; associated QA scripts. Branding, layout styles, RTL support, Auth configuration, RLS and Storage controls were preserved. No paid dependency was added, no external deployment was performed and Phase 05 was not started.
