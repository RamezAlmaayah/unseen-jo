# Public tourism data — Phase 02B

The browser reads project `dkhwwvoplhfjccvjegty` using its modern publishable key and existing RLS. No user session or privileged credential is used. Home, Explore and live Place Details now read the shared repository. My Discoveries reads available places for **in-memory** saves; it never calls the saved_places table.

## Modes

| Configuration | Behavior |
| --- | --- |
| `VITE_DATA_MODE=supabase` | Requires both public settings; errors and empty results stay live |
| `VITE_DATA_MODE=demo` | Explicit original Figma demo; labeled in Home/Explore/Details |
| `VITE_DATA_MODE=auto`, development | Uses Supabase if configured; demo only when both settings are absent |
| Default or auto, production | Requires Supabase; never silently falls back to demo |

A half-configured URL/key pair is an error. Invalid keys, unsafe origins and unknown modes are rejected. `.env.local` is ignored and currently selects **supabase**. A deployment must configure its own public values; this phase did not deploy a website.

To inspect the approved sample UI locally:

```powershell
$env:VITE_DATA_MODE = 'demo'
npm run dev
```

Stop that process and unset the process override to return to the configured live mode:

```powershell
Remove-Item Env:VITE_DATA_MODE -ErrorAction SilentlyContinue
npm run dev
```

Build-time values require rebuilding the production bundle after a mode change. Existing regression suites assume **explicit demo mode**; they must not be pointed at live-empty data and interpreted as failed content imports.

## Repository contract

`src/features/tourism/repository.js` exports `createTourismRepository(client)`:

- `fetchCategories()`: active categories, ordered by sort_order and slug.
- `fetchPublishedPlaces()`: published, non-demo places with category links and image metadata embedded through actual FK relationships.
- `fetchPublishedPlaceBySlug(slug)`: validates the slug; uses a valid catalog cache or a filtered single-place query.
- `fetchPlaceCategories(slug)` and `fetchPlaceImages(slug)`: reuse the detail/catalog cache.
- `searchPlaces({query, categorySlugs, city, maxCost, maxMinutes, group})`: shared validated catalog filters. Category choices use OR semantics and combine with search/properties using AND.
- `fetchFeaturedDestinations(limit=3)`: first published entries in stable slug order. There is no featured/ranking column; this is an editorial preview convention, not personalization.
- `invalidate()`: clear this repository instance's cache for explicit retry.

Home uses the same ordered catalog and three-entry featured convention. Explore exposes the existing name/text search and category controls. City, cost, duration and group filters are prepared service capabilities; no new controls were added to the approved layout. Unknown costs/durations/groups do not satisfy bounded property filters. No driving-time or transport accessibility inference is made.

Requests use a one-minute in-memory promise cache. Independent category/place queries run concurrently; relationships/images are embedded, avoiding per-card queries. Published places paginate in 500-row batches rather than silently truncating at the platform row limit. SDK automatic retries are disabled and each read has a 15-second timeout; the UI offers explicit retry. There is no artificial loading delay, persistent cache, background polling or Realtime subscription.

`model.js` validates the publication status, non-demo flag, categories, slug and numeric fields and adapts actual snake_case columns to the existing card interface. Live IDs are database UUIDs; route slugs are separate. Demo sample IDs remain strings, preventing favorite collisions between a demo place and a real place with the same slug. Unknown optional details stay unavailable rather than becoming zero/free or invented travel advice.

`useTourism.js` keeps queries out of components, prevents stale responses/route data from rendering after navigation, and ignores results after unmount. Direct live Details navigation fetches the requested slug. Missing configuration/network failures render error/retry states; an empty collection renders its own professional empty state.

## Content review and import

Review manifest: [jordan-starter.json](../supabase/content/jordan-starter.json). Six records were imported as **drafts**, with ten editorial category associations:

| Destination | Categories | Primary source |
| --- | --- | --- |
| Ajloun Forest Reserve | Nature | [RSCN reserve inventory](https://www.rscn.org.jo/reserve/list?lang=en) |
| As-Salt Historic Centre | Culture, History | [UNESCO listing](https://whc.unesco.org/en/list/689/) |
| Mujib Biosphere Reserve | Nature, Adventure | [RSCN reserve inventory](https://www.rscn.org.jo/reserve/list?lang=en) |
| Dana Biosphere Reserve | Nature | [RSCN reserve inventory](https://www.rscn.org.jo/reserve/list?lang=en) |
| Iraq Al-Amir | Culture, History | [Jordan Tourism Board: Amman, Iraq Al-Amir section](https://international.visitjordan.com/wheretogo/amman/) |
| Umm Qais | History, Culture | [Jordan Tourism Board: Umm Qais](https://international.visitjordan.com/wheretogo/umm-qais/) |

Names and short factual descriptions were reviewed on 16 October 2026. Categories are editorial classification, not assertions of access, age/group suitability or available activities. The two conflicting Wadi Mujib landing cards map to one canonical live destination; no duplicate live entry was imported. The corrected reserve/heritage names do not rewrite the original design demo.

All coordinates, prices, durations, city/address fields, visit/access notes, group suitability and final verification fields are NULL. No coordinates were guessed from broad reserve centres, photographs or map labels. No ticket price, opening hour, travel time, operating season or access condition was imported.

`npm run prepare:tourism` validates the manifest and generates [phase02b-starter.sql](../supabase/content/phase02b-starter.sql). It does not connect remotely. The reviewed SQL was applied through the dedicated MCP after inspecting the empty target. Existing slug conflicts do nothing, and category links are created only for newly inserted records. This preserves future editorial changes and publication decisions on replay. Both disposable PostgreSQL tests and a real remote replay verified idempotence. This is content DML, not a schema migration; the original three migrations and all RLS definitions are unchanged.

**Publication remains blocked by media clearance.** No candidate Figma destination photograph has both independently established geographic identity and documented production reuse permission. Names/descriptions alone are not represented as complete destination verification: verified_at remains NULL. Do not publish automatically merely because an import succeeded.

## Images

Original assets and source-screen mappings are unchanged. Candidate associations and known conflicts are recorded in the private-to-the-build review manifest, never silently promoted to live media:

- Ajloun Explore/Result orange-rock and Discoveries castle photographs are excluded from live mapping; the Details forest image remains a review candidate.
- The first orange-rock Wadi Mujib landing image is excluded; the canyon image is a candidate only.
- Salt, Dana, Iraq Al-Amir and Umm Qais images remain candidates pending identity and rights review.

`src/data/tourism-media.js` is an **empty approval registry**. Reviewed local media can later be registered by exact slug with src, alt, attribution and sourceUrl. A matching filename is insufficient evidence. Unapproved media displays the existing labeled image fallback; it never borrows another destination's photo.

The existing place-images bucket stays private. For future real object metadata, the repository signs readable object paths in **one batch**, for five minutes, under the publishable client's existing RLS. It never uses getPublicUrl, stores signed URLs permanently or changes policies. Navigation/reload after the one-minute catalog TTL renews links; there is no polling while a page stays open. Missing/inaccessible objects use the fallback. No local Figma asset was uploaded and no Storage object was created.

Private user avatars remain outside this public catalog. Future user uploads/session ownership are later-phase work. Attribution is retained in the image view model and shown in the gallery dialog when present.

## Demo features and boundaries

Surprise Me and Discovery Result always use the fixed, labeled Figma sample. They never rank live destinations. In live mode their Details link explicitly includes `?sample=figma`, opens a clearly labeled demo page, and keeps demo saves distinct from live UUIDs. Such saves are labeled in My Discoveries and clear on refresh. The sample collection loader is offered only in demo mode.

Preferences remain controlled React state; `mapPreferenceCategories` prepares interest-slug to actual category-ID mapping without saving anything. Account/Profile remain existing previews. Maps remain static and Directions remains disabled; available coordinates can be displayed as data without implying routing.

No Auth UI/session, permanent favorites, live map, recommendation algorithm, admin, weather, trip planning, partner, booking or payment functionality was added.

## Phase 03 interactive geography

Explore and `/map` now share the interactive geographic map and nearby filters described in [MAPS.md](./MAPS.md). City, cost, duration and group controls use the existing shared filter contract. Live data still uses the same publishable-key repository/cache and publication safeguards. Two sourced local demo reference points are documented in [COORDINATE_INVENTORY.md](./COORDINATE_INVENTORY.md); this enrichment does not update the database, grant media rights or verify sample visit information. Details enables maps/directions only for valid coordinates.
