# Phase 03 — Interactive tourism map and Near You

**Latest update:** Explore now uses a spacious 42/58 desktop composition and a compact List/Map interface. See the visual-refinement section below for the current screenshots and validation.

Date: 18 October 2026. Project: `C:\Users\Magic Systems\Desktop\Unseen Jo Project`. Supabase target: `dkhwwvoplhfjccvjegty`.

## Delivered behavior

Explore and `/map` now render a real, reusable MapLibre geographic map with a distinctive forest-green/sandstone palette, genuine geographic roads/settlements/water/vegetation/POIs, custom category markers, selected popups, keyboard controls, zoom/pan/reset, and large-catalog clustering. Card and marker selection are synchronized. One shared filtered collection governs search, category/property filters, counts, nearby results and markers; ordinary filter changes preserve the viewport.

Near You requests a single browser position after an explicit action, provides sourced manual city alternatives, radius filtering, nearest sorting and approximate Haversine distances. Clear invalidates pending position callbacks. Place Details renders the same map and an external destination-only Directions link only for valid coordinates; unknown locations retain an honest unavailable state.

The approved header, typography, cards, galleries, animations, preferences, temporary save behavior and compact scale remain. Explore's additional 44px location/filter row adds 54px before the cards. The existing map column is retained; the geographic-source caption wraps to two lines. No global token or scale stylesheet was edited.

## Technology and provider decision

Chosen: MapLibre GL JS **6.14.0**, react-map-gl **8.1.3**, Supercluster **8.0.1**. One renderer is used. Vector styling supplies independent roads, labels, land-cover and water controls, which raster Leaflet tiles could not provide without choosing another externally rendered style. Tradeoffs are WebGL requirements and a larger lazy-loaded payload. The renderer, worker and CSS load when a map approaches view; failures preserve the destination list.

[OpenFreeMap](https://openfreemap.org/) provides real OpenMapTiles/OSM data. Its [official setup](https://openfreemap.org/quick_start/) currently requires no account, key or paid subscription. No charges or paid commitments were made. Public service availability has no SLA; provider limits/terms can change. Attribution remains visible and links to OpenFreeMap, OpenMapTiles, OpenStreetMap, Liberty and OSM Bright/Mapbox. Inherited code/design notices are retained in `public/maps/*LICENSE.md`.

The committed `public/maps/unseen-nature.json` customizes 111 real geographic layers. TileJSON is `https://tiles.openfreemap.org/planet`; glyph/sprite/shaded-raster HTTPS resources are configured in the style. Optional `VITE_MAP_STYLE_URL` replaces it. No bulk tile downloading, secret map token or custom account setup is used. See [MAPS.md](./MAPS.md) for pricing/policy links, licenses, configuration, architecture and privacy.

Natural Earth shading supplies subtle low-zoom relief. This phase does not claim detailed DEM elevation, contours, 3D terrain, hand-painted infinite detail or complete business/POI coverage. Provider geographic features are clearly separated from curated Unseen Jo records. English-first label fields retain zoom-dependent density; the installed MapLibre includes Arabic shaping/bidirectional text support without a separate plugin. A fully Arabic UI/editorial localization is outside this phase.

## Supabase verification and content integrity

Fresh real hosted public SDK/HTTP checks on **18 October** passed **17 checks**, against the exact expected URL with the legitimate publishable key. They returned **7 active categories, 0 publicly readable places and 0 public place-image metadata rows**. Private application tables and public tourism writes remained denied. Live production-preview pages made actual public requests and never downloaded demo destinations as fallback.

The dedicated `supabase_unseen_jo` MCP was attempted and retried, but its OAuth refresh returned `Failed to parse server response`. This phase therefore **does not claim a fresh privileged database/policy/Storage audit**. The last privileged results are preserved in [Phase 02B evidence](./validation/phase02b-remote-results.json): 11 RLS tables, 6 drafts, 0 published places, 0 coordinate pairs, 0 place-image rows and private Storage buckets. Public results today are consistent with that state but cannot independently establish current hidden draft counts.

No database migration, content update, publication, RLS alteration, Storage policy edit, asset upload or unrelated connector/project change was performed. Migration hashes still match the Phase 02B record. The original Supabase connection was preserved. `.env.local` remains ignored and selects live mode; no confidential credential is in the browser bundle.

All six draft destinations were reviewed in [COORDINATE_INVENTORY.md](./COORDINATE_INVENTORY.md). Two proposed reference points are supported by UNESCO/Jordan Tourism Board evidence and enrich **local demo data only**: As-Salt heritage-property reference point and Iraq Al-Amir tourism-board location pin. Neither is presented as a surveyed entrance. Four destinations remain unmapped because an appropriate visitor point was not established. The remote draft/import data remains untouched.

Manual Amman, Irbid and Aqaba centres use independently opened GeoNames records and visible CC BY 4.0 attribution. No geocoder receives the user's position. Browser tiles naturally reveal the viewed area to the provider; the location explanation says so. No position is logged or persisted. Directions opens Google Maps with only the destination, after user action.

Original Figma sample images and sample visit information remain in the explicitly labeled demo cards. Popups avoid unverified sample photos/prices/travel times and use the approved unavailable-image treatment. Existing rights/publication safeguards remain in force; coordinates do not clear imagery or content for publication.

## Verification results

| Layer | Actual result |
| --- | --- |
| Lint, asset validation, production build | Passed; 83 asset references / 48 original hashes preserved |
| Map utility/style/provenance checks | 9 grouped checks passed |
| Existing tourism service checks | 15 grouped checks passed |
| Database/PostGIS/RLS/Storage replay | 55 local PGlite PostgreSQL/PostGIS checks passed; Auth/Storage service contracts are simulated, not a fresh remote audit |
| Real hosted publishable-key HTTP | 17 passed; current public counts 7 categories / 0 places |
| Phase 03 real geographic rendering | Real provider TileJSON, vector tiles, glyphs, sprites and low-zoom shaded tiles returned HTTP 200; geographic canvas rendered in Chromium |
| Phase 03 browser flows | 17 groups passed: 3 real-provider groups plus 14 final fixture/demo/emulated groups; 7 requested viewport sizes |
| Phase 02B browser regressions | 8 groups / 35 responsive cases passed on production previews |
| Earlier frontend suites | Phase 01A: 14 cases; 01B: 21; 01C: 42; Landing: 5 viewports + 12 shared routes; Global scale: 91 cases + 10 extra states; all passed |
| Client bundle scan | Zero secret-key prefix matches and zero service-role JWTs |

Phase 03 browser coverage separates actual geographic provider/public Supabase requests from synthetic published catalogs, style fixtures and emulated GPS. It covers initialization, real tiles/attribution, zoom/pan/reset, custom category markers, invalid/missing coordinates, popup/card synchronization, search/categories/property filters, location radius/sorting/clear, late callback cancellation, permission denial/unavailable/timeout/unsupported, Details map/directions, clustering, retry and responsive/touch/keyboard interactions.

The seven requested viewports were exercised: 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 390×844 and 375×812. Assertions check no horizontal overflow, popup bounds, header/heading scale and mobile filter-panel bounds. Chromium touch/GPS emulation exercises browser APIs and UI; it does not verify physical GPS accuracy or physical-device performance. No non-Chromium or hosted website deployment test is claimed.

Legacy page suites use a non-geographic map-style fixture to isolate earlier UI behavior. They are not counted as real tile integration tests. Static-map route assertions were updated to the authorized interactive page; Explore geometry expectations account for the new controls/caption. Existing gallery/card dimensions and unrelated behavior checks remain.

## Visual evidence

Reviewed real geographic screenshots:

- [Live Jordan desktop](./screenshots/phase03/live-jordan-desktop.png)
- [Live Jordan mobile](./screenshots/phase03/live-jordan-mobile.png)
- [Sourced local demo selection, desktop](./screenshots/phase03/demo-salt-streets-desktop.png)
- [Sourced local demo selection, mobile](./screenshots/phase03/demo-salt-streets-mobile.png)
- [Mobile popup close-up](./screenshots/phase03/salt-popup-map-mobile.png), [street-level geometry](./screenshots/phase03/salt-street-detail-map.png), [real Amman street labels](./screenshots/phase03/amman-real-streets-pois-map.png) and [Iraq Al-Amir Details context](./screenshots/phase03/iraq-al-amir-real-detail-map.png), and additional geographic context captures accompany the report.
- [Consolidated local/regression/integrity evidence](./validation/phase03-results.json), [map browser results](./validation/phase03-map-tests.json), [hosted public results](./validation/phase03-hosted-public.json), [map unit checks](./validation/phase03-unit-tests.json), and [visual comparison](./validation/phase03-visual-comparison.json).

Visual inspection confirms the warm nature palette, real road geometry, differentiated geographic features, readable label halos, custom marker, scrollable popup and visible attribution. Popup anchoring, filter-panel overflow and the gesture-mode handler update discovered during testing were fixed. Pixel comparison covered 156 historical captures: 116 were exact matches, including 105 unrelated-page captures. Seventeen Landing comparisons differ only in the existing Phase 02B ?view all ? demo? label absent from older preserved images. Three other unrelated comparisons have 64, 5 and 25 changed pixels respectively (image-edge/focus painting), with unchanged geometry. Authorized Explore/map/Details differences account for the other changed captures. No approved global sizing stylesheet was changed. Prior-phase screenshot records are restored and hash-verified; new evidence lives under `docs/screenshots/phase03/`.

## Files created and modified

Created:

- `src/features/map/{geography,categories,useLocation}.js`
- `src/components/map/{TourismMap,MapCanvas,DestinationPopup,NearYouControl,AttributeFilters}.jsx`
- `src/styles/maps.css`
- `public/maps/unseen-nature.json`, three inherited style license documents and map dependency notices
- `scripts/map-source/liberty.json`, `scripts/prepare-map-style.mjs`, `check-phase03.mjs`, `check-phase03-browser.mjs`, `map-test-helpers.mjs`
- This report, `docs/MAPS.md`, `docs/COORDINATE_INVENTORY.md`, validation evidence and Phase 03 screenshots

Modified:

- `src/App.jsx`, `src/components/layout/AppLayout.jsx`
- `src/pages/ExplorePage.jsx`, `src/pages/PlaceDetailsPage.jsx`
- `src/components/discovery/DestinationCard.jsx`, `src/features/tourism/useTourism.js`
- `src/styles/global.css` (new scoped map stylesheet import)
- `package.json`, `package-lock.json`, `.env.example`
- Six existing browser regression scripts (map fixture/renderer launch setup; obsolete static-map expectations and required load readiness)
- README and relevant tourism/Supabase technical documentation

No original asset, demo JSON, global design token/scale file, SQL migration or content import manifest was changed.

## Limits and stop point

The live map intentionally has **zero curated markers** until real content is verified and published separately. Remaining coordinate/access/media research is editorial work, not silently fabricated map data. Privileged remote inspection requires repairing the dedicated MCP OAuth session; no Phase 03 database write depends on it.

The map's lazy chunk is about 1.11 MB minified / 303 KB gzip, plus a 508 KB worker. Vite reports its standard large-chunk warning; lazy visibility mounting keeps this out of initial non-map routes. Hardware/browser diversity, large-catalog throughput, offline packs, detailed terrain and Arabic map localization remain unclaimed.

No authentication, permanent saved places, recommendation algorithm, admin UI, full routing, booking or other Phase 04 work was implemented. Phase 03 stops here for user review before Phase 04.

## Visual refinement — spacious Nature Atlas (18 October 2026)

This section supersedes the initial Phase 03 Explore geometry and screenshots above. The user authorized a wider map and refined local composition while retaining the approved global scale. No Phase 04 work is included.

### Composition and controls

The old static-map recipe constrained the workspace to two cards plus a 320px map. Explore now uses the existing 1200px main canvas with a 1152px inner workspace, a 24px gap and a **42/58 split** of the remaining width. At 1440×900 the map is approximately **654×680px**, compared with the former 320×680px. Desktop height follows a 620–740px clamp. Search and filters remain on the left; the destination list scrolls independently within the balanced left panel. Its cards use the original assets, typography and actions, with an Explore-only 244px height at wide desktop widths and a single 320px card column at narrower desktop widths. No global header, type-scale or token stylesheet was changed.

The empty production panel now has a compact, truthful collection message and useful atlas guidance instead of a large blank results area. Guidance never invents attractions or implies that base-map POIs are curated recommendations. Empty content remains readable rather than clipped inside a scrolling list.

The map has a refined compass/title treatment, a small curated-count badge, a single grouped zoom/reset control and a compact lower toolbar. The key distinguishes geographic palette swatches from the seven destination categories. Gesture mode has a hand icon, descriptive accessible labels and an explicit active state. The toolbar yields while a popup is open; zoom/reset and legal attribution remain available. Popups retain a fixed accessible close button while their contents scroll.

Below 1024px, List/Map is a real view switch. Explicit demo Explore starts in List; live Explore and the Map route start in Map. Selecting a located card switches to Map and focuses the corresponding marker. Map mode moves the existing category control into More filters (one instance and one filter state), preserving map space. List mode retains the familiar category row and cards. The renderer is retained across switches and its native ResizeObserver adapts the canvas; search and filter changes do not recreate it.

### Geographic styling and accuracy

The updated style contains **114 genuine geographic layers**, including new rock/farmland fills and a country-boundary halo using existing OpenMapTiles geometries. Sandstone, muted vegetation, soft blue water, ivory/gold road classes and forest-colored label halos improve differentiation. Natural Earth relief is more visible at regional zoom and fades through zoom 10; this is deliberately identified as coarse geographic shading, not a detailed DEM or contour map. Existing zoom-dependent city, street, POI and road hierarchy remains.

A real defect was corrected: the original flat building layer ended at zoom 14, while 3D buildings had been disabled for performance. Flat footprints now remain visible at street zoom, restoring genuine urban detail. No buildings, land-cover polygons, coordinates or terrain geometry were invented. Schema references: [OpenMapTiles land-cover/building definitions](https://openmaptiles.org/docs/schema/) and [MapLibre layer specification](https://maplibre.org/maplibre-style-spec/layers/).

The existing provider, legal notices and attribution remain. No new provider, subscription, API key, map engine or runtime dependency was introduced. Local demo marker validation still uses only the documented As-Salt reference point and Iraq Al-Amir point in [the coordinate inventory](./COORDINATE_INVENTORY.md). Drafts and unverified locations were not published or given invented coordinates.

### Actual visual and accessibility review

Real OpenFreeMap rendering and actual public live-data requests were reviewed, not screenshots of a fixture background. Six requested live/demo combinations were captured at **1440×900, 768×1024 and 390×844**. Each includes a viewport capture, a full-page capture and a close map region under `docs/screenshots/phase03-refinement/`.

| Size | Live empty collection | Explicit demo with selected marker/popup |
| --- | --- | --- |
| Desktop 1440×900 | [Viewport](./screenshots/phase03-refinement/live-1440-viewport.png) / [full page](./screenshots/phase03-refinement/live-1440-full.png) | [Viewport](./screenshots/phase03-refinement/demo-1440-viewport.png) / [map](./screenshots/phase03-refinement/demo-1440-map.png) |
| Tablet 768×1024 | [Viewport](./screenshots/phase03-refinement/live-768-viewport.png) / [full page](./screenshots/phase03-refinement/live-768-full.png) | [Viewport](./screenshots/phase03-refinement/demo-768-viewport.png) / [map](./screenshots/phase03-refinement/demo-768-map.png) |
| Mobile 390×844 | [Viewport](./screenshots/phase03-refinement/live-390-viewport.png) / [map](./screenshots/phase03-refinement/live-390-map.png) | [Viewport](./screenshots/phase03-refinement/demo-390-viewport.png) / [map](./screenshots/phase03-refinement/demo-390-map.png) |

Compared with the documented Minimal Nature Cartography brief and the approved Unseen Jo interface, the result has a substantially wider map, visible geographic relief and land-cover differences, stronger road/boundary hierarchy, restrained floating controls and preserved brand typography/colors. The existing Figma card imagery remains explicitly demonstration material.

Automated axe-core WCAG A/AA scans detected **zero violations in all six live/demo size combinations**, including the selected popup states. Tests also check popup bounds, map/control/attribution clearance, desktop map proportion/height, category key completeness, compact view switching and absence of horizontal overflow. Existing keyboard/permission/touch tests supplement this; automated scanning is not a complete accessibility certification.

### Validation and boundaries

Final regression, hosted public-read and integrity results are recorded in the refinement validation evidence. Existing geometric assertions now describe the user-authorized wider map and adaptive height. Legacy image/geometry checks consider visible content, while the new view-switch tests explicitly exercise both compact views; hidden lazy images are not forced to load merely for a screenshot test.

No Supabase schema, RLS, Storage policy, destination record, publication state, connection setting or unrelated project was modified. The live collection remains honest and does not silently fall back to demo content. No permanent saves, authentication, recommendations, routing service or Phase 04 feature was added.

Remaining limitations are unchanged in kind: zero published tourism content, incomplete destination coordinate/media research, provider-dependent POI coverage, coarse relief, no offline guarantee/SLA and no physical-device/GPS accuracy certification. The lazy MapLibre payload still produces Vite's large-chunk advisory. Detailed street data depends on underlying mapped coverage, and political/geographic labels remain provider data.

**Final refinement validation:** lint, asset integrity (83 references / 48 originals), live and demo production builds passed. Map unit checks: 9 groups; tourism services: 15; local PostgreSQL/PostGIS/RLS/Storage replay: 55; hosted public SDK checks: 17; Phase 03 map browser checks: 17; Phase 02B browser checks: 8 groups / 35 responsive cases. Earlier regressions passed: Phase 01A 14 cases, 01B 21, 01C 42, Landing 5 viewports / 12 shared routes, Global Scale 91 cases / 10 extra states. All six requested real live/demo visual/axe cases passed with zero detected WCAG A/AA violations. An additional three compact Details checks passed for control/scale/attribution clearance, popup dismissal and sourced directions. The final compact Details scale/gesture overlap found during close review was corrected without changing the page layout.

[Consolidated refinement evidence](./validation/phase03-refinement-results.json) includes the actual provider/hosted/local scopes, geometry, accessibility counts, regression summaries and protected-file hashes. [Visual comparison evidence](./validation/phase03-refinement-visual-comparison.json) records 166 historical comparisons, with 124 exact matches including 107 unrelated-page captures; authorized map/Explore changes and existing demo-label differences are distinguished from geometry checks. All 166 historical screenshot files were restored and hash-verified. New captures remain in the dedicated refinement folder. [Street-level Details capture](./screenshots/phase03-refinement/street-detail-map.png) records actual provider geography at zoom 16.

Refinement files: ExplorePage, MapCanvas, AttributeFilters, the scoped maps.css, the map-style generator and generated style; shared browser-test view helpers, palette/building assertions and authorized Explore geometry expectations; new `check-phase03-refinement.mjs` and `check-phase03-details-controls.mjs`; package test scripts, MAPS.md, this report and validation/screenshots. Legacy image checks now decode/inspect visible images rather than forcing intentionally hidden List-view images to load. Runtime dependencies, original Figma assets, demo JSON, global sizing tokens and all SQL migration hashes remain unchanged. No secret credentials were found in the production bundle.

Final review previews: live `http://127.0.0.1:4192/explore`, explicitly labeled demo `http://127.0.0.1:4193/explore`. No external website deployment was performed. **Visual refinement stops here; Phase 04 has not started.**

## Final demo-map quality pass — 18 October 2026

This pass changes local demo presentation and map framing only. No database, publication state, RLS, Storage policy, Supabase connection or Phase 04 functionality was modified. An actual production live-build browser check issued only GET requests to project `dkhwwvoplhfjccvjegty`: **7 public categories, 0 published places, 0 destination markers**. Private draft counts were not re-audited.

### Destination photography review

All four Explore demo records were compared against the existing original asset inventory. Ajloun's red-rock hoodoo cover is an obvious geographic mismatch, and its saved-place cover depicts a castle rather than the forest reserve. Those three demo cover mappings (Explore, result and saved cover) now resolve to no photograph. Explore/result use the existing licensed Lucide category icon and a “Photo pending verification” placeholder. The original asset files and Details gallery remain preserved; gallery photographs continue to be explicitly identified as Figma demonstration material.

As-Salt's historic stone street, Mujib's water canyon and Dana's mountainous landscape are visually plausible but **not independently identified or rights-cleared**. Their existing demo mappings remain, with visible “Unverified demo photo” badges. No replacement photograph in the existing inventory had both documented geographic identity and documented reuse permission, so none is represented as verified or newly licensed. Production media approval remains unchanged and empty. The six starter records were not edited or published. This is the remaining photography approval limitation, rather than a claim that all four photographs have been verified.

### Sourced local demo coordinates

The four Explore destinations now have sourced reference points: As-Salt uses UNESCO's published heritage coordinate; Ajloun, Dana and Mujib use the feature coordinates in the Jordan Tourism Board's respective Location links. See [coordinate inventory](./COORDINATE_INVENTORY.md) and [source evidence and validation](./validation/phase03-quality-results.json). The official links were retrieved directly from source HTML; feature `!3d`/`!4d` values were used rather than the offset map-camera position after `@`. Some Google map pages redirect to consent, so independent visual confirmation of arrival suitability remains unavailable. Popups explicitly call these reference pins, not surveyed entrances, access guarantees or reserve boundaries. No costs, opening hours or travel times were inferred from coordinates.

### Presentation and interaction

- All four card location controls select, highlight and focus their own correct markers at detail zoom. The same category icon/color is used in each marker and demo popup.
- Initial/reset country framing retains the complete Jordan bounds while reducing edge padding from 112/108px to 64/64px. At 1440px the initial zoom is approximately 6.23. Wide-screen overview marker selection retains the country camera longitude; only card/detail selection zooms into the selected point. Neighboring geography remains visible where required by aspect ratio and real geography, especially on mobile.
- Wide overview popups sit beside their actual marker with a correctly anchored pointer; compact/street views use the bottom popup placement. Brand/count overlays temporarily hide while the popup is open, preventing overlap. Existing gesture controls, Escape dismissal, filters, Near You and temporary saves remain.
- Cards visibly label sample metadata, retain the page's explicit Figma sample-values notice, and flag unverified photography. Demo popup covers use category artwork instead of an unverified photo. Popups omit sample prices/travel times and link directly to the location source. Details already labels demonstration cost, duration and travel values.
- Global sizing tokens, approved UI-scale rules, original Figma asset bytes and all SQL migrations remain unchanged. The demo validator now explicitly permits a NULL image so an honest missing-photo state cannot break the collection.

### Validation and screenshots

Lint, original asset integrity (83 references / 48 unique originals), live and demo production builds, 9 map unit groups and 15 tourism-service groups passed. The 15 service groups include a **local** PGlite import replay; this is not a hosted database import. The existing full map browser suite passed 17 groups during this pass; its final fixture-only rerun passed 14 groups covering synchronization, filters, manual location, GPS permission/failure/cancellation, Details maps, clustering, seven responsive widths, touch gestures and provider retry. Fixture requests and emulated GPS are expressly simulated.

The dedicated final quality suite uses the real OpenFreeMap provider and frozen production demo build at 1440x900, 768x1024 and 390x844. It tests all four card selections at each size, validates marker coordinate identity, selected-card identity, focus, source links and popup containment, and captures multiple unobscured marker centers with one popup open. Automated WCAG A/AA checks supplement visual review; they are not a full accessibility certification. Results are recorded in the linked validation JSON.

Actual browser captures (not generated mockups):

- [Desktop overview with markers and popup](./screenshots/phase03-quality/demo-1440-viewport.png), [map crop](./screenshots/phase03-quality/demo-1440-markers-popup.png).
- [Tablet overview](./screenshots/phase03-quality/demo-768-viewport.png), [map crop](./screenshots/phase03-quality/demo-768-markers-popup.png).
- [Mobile overview](./screenshots/phase03-quality/demo-390-viewport.png), [map crop](./screenshots/phase03-quality/demo-390-markers-popup.png).
- [Production live empty state](./screenshots/phase03-quality/live-1440-viewport.png).

Historical Phase 03 screenshots were restored after regression runs; new captures have a dedicated folder. Vite still reports the existing lazy MapLibre large-chunk advisory. Real physical GPS accuracy, destination arrival/access suitability and photograph identity/reuse clearance remain unverified. No external deployment was made.

Files changed: `public/data/demo-destinations.json`; `src/features/map/geography.js`; `src/features/discovery/useDemoDestinations.js`; `src/components/discovery/DestinationCard.jsx`; `src/components/map/MapCanvas.jsx` and `DestinationPopup.jsx`; scoped `src/styles/maps.css`; map test assertions/scripts and the new `check-phase03-quality.mjs` command; `package.json`; coordinate/asset/map documentation; this report, validation evidence and screenshots. Dependencies were not added or upgraded.

Review previews: live `http://127.0.0.1:4194/explore`; explicit demo `http://127.0.0.1:4195/explore`. **Phase 04 has not started.**

**Final production-build quality results:** all 3 requested viewport cases passed, including all 12 destination-card selections, popup containment, actual provider tile loading and zero automated WCAG A/AA violations. Screenshots contain 4 unobscured marker centers at desktop, 4 at tablet and 2 at mobile, with one popup open. Historical Phase 03 screenshot hashes (10 files) match their saved originals. Final lint and asset validation passed again after the last popup adjustment. Evidence is consolidated in `docs/validation/phase03-quality-results.json`.
