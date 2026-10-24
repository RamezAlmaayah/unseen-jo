# Interactive maps — Phase 03

## Engine and provider

The browser lazy-loads **MapLibre GL JS 6.14.0**, through **react-map-gl 8.1.3**, with **Supercluster 8.0.1** for catalogs exceeding 50 located places. Only one map engine is installed. MapLibre was chosen over React Leaflet because it can restyle actual vector roads, vegetation, water and labels independently. Leaflet with raster tiles would preserve provider styling and could not deliver this palette without replacing the underlying tile style. Both have mature React options; MapLibre has a larger WebGL payload and requires WebGL support. The destination list and useful errors remain available when rendering is unsupported.

The default provider is [OpenFreeMap](https://openfreemap.org/), an OpenMapTiles-compatible service using OpenStreetMap geographic data. [Official setup](https://openfreemap.org/quick_start/) supports direct browser use without an account or API key. The public instance currently advertises no request limits and permits commercial use; this is a free public service without an availability SLA. No paid subscription or account was created. Recheck [terms](https://openfreemap.org/tos/) and [privacy](https://openfreemap.org/privacy/) before changing deployment usage. No tile prefetch/offline pack/bulk download is implemented; requests follow normal viewport navigation and browser/provider caching.

## Style and sources

`public/maps/unseen-nature.json` is a reviewed derivative of OpenFreeMap Liberty, with 114 geographic layers and the original zoom-dependent road/settlement/POI hierarchy. The palette uses sandstone, sage/forest green, ivory roads, muted blue water, dark forest labels and warm halos. Road casings distinguish minor streets, primary roads and highways. Forest/park/land-use/building polygons retain geographic geometry. Natural Earth shaded raster adds subtle low-zoom relief; it is **not a detailed elevation model, contour map or 3D terrain**. Buildings remain flat to reduce rendering cost.

- Vector TileJSON: `https://tiles.openfreemap.org/planet`
- Glyphs and sprites: provider HTTPS endpoints embedded in the committed style.
- Style lineage: [OpenFreeMap styles](https://github.com/hyperknot/openfreemap-styles), [OSM Liberty](https://github.com/maputnik/osm-liberty), [OSM Bright](https://github.com/mapbox/mapbox-gl-styles).
- Original source snapshot and transformation evidence: `scripts/map-source/liberty.json`, `scripts/prepare-map-style.mjs`. Runtime uses the committed style directly; `npm run prepare:map` regenerates it from the pinned source without fetching tiles.
- Attribution remains visible inside each map: OpenFreeMap, OpenMapTiles, OpenStreetMap, Liberty, OSM Bright/Mapbox and inherited design licenses. Code/design/font/icon notices are retained in `public/maps/*LICENSE.md`. New map dependency notices are retained in `public/maps/DEPENDENCIES.txt`. Local custom marker icons use existing Lucide.

Optional `VITE_MAP_STYLE_URL` replaces the style configuration. Default `/maps/unseen-nature.json` requires no token. A replacement must be a compatible, legally usable MapLibre style with its own correct attribution and HTTPS sources. Provider-specific browser tokens, if introduced later, must have appropriate domain restrictions; never place secret credentials in a VITE variable.

English-first names use provider English/Latin fields before original names. Coverage, spellings, business POIs and update frequency depend on the provider/OSM community; missing POIs are not fabricated. No external business search or live hours are claimed. MapLibre 6.14 includes [Arabic shaping/bidirectional text support](https://maplibre.org/maplibre-gl-js/docs/API/functions/setRTLTextPlugin/), so no deprecated external RTL plugin is loaded. English transliteration availability remains provider-dependent; a future fully Arabic application would still need language/editorial review. Provider borders are cartographic source data, not editorial territorial assertions by Unseen Jo.

## Components and behavior

`TourismMap` owns lazy visibility mounting, Suspense and rendering failure containment. `MapCanvas` owns one renderer, viewport navigation, category markers, clustering, controls, legend and load/retry states. `MapViewportController` only moves on initial load, explicit card/marker selection, origin changes or reset. Search/filter updates reuse the map and preserve its viewport. Compact Details uses the same component; popups scroll when necessary to fit the map.

`geography.js` validates numeric WGS84 coordinates (within MapLibre's Mercator latitude range), computes Haversine distance using mean Earth radius 6371.0088 km, filters radius and optionally sorts nearest first. These are approximate straight-line distances, never road distances or durations. No server-side spatial query is necessary for the current cached public catalog. Large remote catalogs may justify future PostGIS bounding/radius queries; the current clustering is a rendering optimization, not a benchmark of unlimited catalog size.

All seven actual categories have a custom icon and color: Nature, History, Adventure, Culture, Food, Photography and Family. Marker buttons are 44px, keyboard labeled and have hover/focus/selected states. Popups show permitted available data, honest placeholders and Details links. No unverified demo photos or sample prices are copied into map popups. Selected markers are intentionally positioned with space above them for an accessible popup. Escape dismisses and restores marker focus.

Explore maintains one filtered array for cards, markers and counts. Search, category OR selection, available city/cost/duration/group filters and Near You radius compose together. Unknown property values do not match a bounded filter. Demo sample cost/duration/group filters are disabled because those values have not been verified. Clear filters resets location and selection too. Tablet/mobile List/Map buttons switch between the existing list and map sections while retaining one shared filter state and an accessible list alternative. Scrolling is protected through cooperative gestures; explicit Enable map gestures permits normal scroll zoom. Zoom/reset controls remain available.

## Location privacy

Near You calls `navigator.geolocation.getCurrentPosition` **only after Use my location**. It makes one reading (10-second timeout, no cached position requested, no continuous watch) under HTTPS/localhost. Permission denied, timeout, unavailable, unsupported and invalid readings have clear errors/manual fallback. Clear location, selecting a city and unmount invalidate late callbacks. Coordinates remain in current React memory; no storage, analytics, console logging, Supabase write or external geocoding occurs.

Selecting Amman, Irbid or Aqaba uses sourced GeoNames reference points. It is labeled an approximate city centre and has a different indicator from GPS. See [coordinate inventory](./COORDINATE_INVENTORY.md). Provider map tile requests naturally reveal the area viewed to the tile service, as explained before location use; this is not an anonymous/offline map. External Directions sends only the destination when the user opens Google Maps, without a user-origin parameter.

## Data and security boundaries

The existing public publishable-key repository and RLS continue to govern tourism rows. Live maps never read drafts or demo files. An empty live collection still displays a geographic map and zero curated markers. No schema migrations, RLS edits, Storage changes, image uploads or draft publication are needed for maps.

Local demo coordinates enrich only two sourced demo records at read time; all other sample records stay unmapped. The existing original asset dataset is unchanged. Coordinate evidence does not imply media rights or content publication clearance. Details with missing/invalid coordinates shows Location unavailable and disables Directions.

No recommendation algorithm, authentication, permanent saves, routing engine, paid service or Phase 04 work is included.

## Validation commands

```powershell
npm run validate
npm run test:database
npm run test:tourism
npm run test:tourism:hosted
npm run test:map
# Start live and explicit demo builds/servers; supply QA_LIVE_URL and QA_BASE_URL:
npm run test:map:browser
npm run test:tourism:browser
npm run test:regression
```

Browser scripts use an externally installed Playwright module, like the established project checks; set `PLAYWRIGHT_MODULE` if needed. Legacy UI suites intercept only the map style with a non-geographic background fixture to isolate page regressions. Phase 03 separately makes actual provider requests, renders geographic tiles and captures desktop/mobile evidence. Synthetic REST catalogs and GPS positions are explicitly labeled test fixtures and never imported. See [Phase 03 report](./PHASE_03_REPORT.md) for actual results and limits.

## Refined Explore composition

The current Explore composition uses a 42/58 desktop split within the original 1200px canvas; tablet/mobile use a real List/Map switch. Map mode places the single shared category control inside More filters, and located-card selection opens the map. `maps.css` contains these Explore-only overrides; global sizing tokens remain unchanged. Empty live data gets collection guidance rather than a large blank list. The 114-layer style preserves flat building footprints above zoom 14 and adds genuine schema-based rock/farmland colors and border halos. Natural Earth shading fades at zoom 10 and remains a coarse regional source.

Run `npm run test:map:visual` with `QA_BASE_URL` (explicit demo) and `QA_LIVE_URL` (live). It captures all six requested live/demo combinations and runs axe-core WCAG A/AA checks. It uses Playwright 1.64.1 and `@axe-core/playwright` 4.11.1 in the external QA module directory, with optional `PLAYWRIGHT_MODULE` / `AXE_MODULE` path overrides. These are test tooling, not application runtime dependencies. See the final visual-refinement section of [the report](./PHASE_03_REPORT.md) for screenshots and actual results.

`npm run test:map:details` verifies compact Details control/scale/attribution clearance, directions and popup dismissal at the three requested viewport sizes.

Final demo quality pass: the four Explore demo records now have documented UNESCO/Jordan Tourism Board reference pins (see COORDINATE_INVENTORY.md). These are local enrichment only, not surveyed entrances or database updates. Wide overview popups use side anchoring and preserve the country camera longitude; smaller/street views use bottom anchoring. The final real-provider quality suite is `npm run test:map:quality` (QA_BASE_URL can target a demo production preview). Screenshots and evidence: docs/screenshots/phase03-quality and docs/validation/phase03-quality-results.json.
