# Compact Explore cards — Phase 04L

Implemented 20 October 2026 for the existing [Explore page](http://127.0.0.1:4184/explore). No Admin Dashboard, destination records, publication states, photographs, rights metadata, database permissions or Storage objects were modified. Phase 05 has not started.

## Changes

Desktop split Map/List browsing now uses a single column of horizontal cards. A 128px photograph appears at the logical start: left in English and right in Arabic. The information column shows the name, category, visit duration and admission cost. Unknown duration/cost remains unavailable. The redundant unknown travel-time row is omitted in this compact variant; the underlying data and the larger card's information are unchanged.

Cards have a 128px minimum height, not a fixed maximum. Normal content fits around 128–134px; longer names, categories and translation warnings grow naturally without truncation or overlapping. Typography remains 16px/22px for headings and 14px/20px for metadata. Favorite actions keep a separate 44px target. Rounded corners, forest green, light surfaces and restrained shadows match the existing design.

A native stretched heading link makes the compact card's image and empty space open its destination. Favorite and Show on map remain independent buttons above that link and do not navigate. Keyboard focus outlines and reduced-motion behavior are retained. The RTL regression exposed and fixed a map-action/favorite collision: the map button now follows the photograph's logical side.

The existing List/Map toggle is also available on desktop. **List** hides the map and restores the larger image-first responsive grid; **Map** returns to the original split composition with compact cards. MapLibre stays mounted while hidden. No new navigation model or map cartography was introduced. Map dimensions in split mode are unchanged.

Below the existing 1024px split breakpoint, the current exclusive List/Map behavior remains: list browsing uses photo-first cards. At narrower desktop panel widths, container queries reduce the thumbnail to 96px, then 72px and relocate the favorite action if necessary. Text can grow rather than clip. List-only grids retain their existing panel-aware one/two-column sizing.

Both variants share destination data, favorites, filters, previews, map selection and detail routes. Compact thumbnails request the existing 320/640 responsive image renditions with automatic rendered-size hints; larger cards retain 640/1280 renditions. Lazy loading, placeholders, immutable original objects and the existing signature/cache service are preserved. No new dependencies, queries, rights approvals or image uploads were added.

## Before/after evidence

The baseline was captured from the unchanged production preview before rebuilding. At **1366×768**, normal cards were **433.5px** tall, with zero complete cards fitting in the visible results area. The compact cards measured **128px**, about **70.5% shorter**, with **two complete cards** visible plus part of the next. The compact measurements and screenshots are recorded in [acceptance results](validation/compact-explore-acceptance.json); the original measurements are in [baseline results](validation/compact-explore-before.json).

| View | Before | After |
| --- | --- | --- |
| Desktop English, 1366×768 | [Tall photo-first card](../artifacts/compact-explore/before-en-1366.png) | [Compact split cards](../artifacts/compact-explore/after-en-1366.png) |
| Desktop Arabic, 1366×768 | [Tall RTL card](../artifacts/compact-explore/before-ar-JO-1366.png) | [Compact RTL cards](../artifacts/compact-explore/after-ar-JO-1366.png) |
| Tablet English, 900×1000 | [Existing list grid](../artifacts/compact-explore/before-en-900.png) | [Retained list grid](../artifacts/compact-explore/after-en-900.png) |
| Mobile English, 390×844 | [Existing mobile list](../artifacts/compact-explore/before-en-390.png) | [Retained mobile list](../artifacts/compact-explore/after-en-390.png) |

Additional Arabic tablet/mobile, narrow-screen and long-copy screenshots are in `artifacts/compact-explore/`. Browser-only stress names and long cost labels were never written to Supabase.

[Desktop list-only photo grid](../artifacts/compact-explore/desktop-list-only.png) shows the larger variant using the same destination data.

## Validation

The browser tests use genuine anonymous hosted Supabase data and real MapLibre in Chromium, without mocked API responses or stored mutations. Both development (`4184`) and production preview (`4190`) are covered. Detailed results are in [layout regressions](validation/compact-explore-layout.json) and [compact acceptance](validation/compact-explore-acceptance.json).

The 12 compact acceptance checks passed: six desktop/tablet/mobile language combinations, four 5-/30-second tab-return checks, and two desktop interaction flows. English and Arabic tab returns retained document identity, the same MapLibre canvas, list scroll, zoom and selected marker, with zero additional destination catalog requests. Desktop List/Map switching also retained the same canvas, selected marker and favorite state without additional catalog requests. All six live destination links remained available.

The 44 layout regressions passed: 20 viewport checks, 16 split-panel resize checks, four long-copy checks and four interaction flows. Eight axe scans reported zero violations, and no browser page errors were recorded. Widths included 1440, 1100, 900, 390 and 320px; resized desktop list panels included 360, 575, 576 and 640px.

After the final locale-cleanup guard, a focused production browser test passed actual English → Arabic → English control clicks: six cards and their selected destination remained available, no additional catalog query ran, and ordinary popup closing still cleared selection correctly. The required locale map rebuild is explicitly recorded rather than reported as canvas reuse: [language-switch evidence](validation/compact-explore-language-switch.json).

The existing map/geography (9 groups), image delivery (6), cache/security (7), localization (6) and tourism/data (15) suites passed. Oxlint, asset validation (83 references, 48 original hashes) and production build passed. The existing large-bundle advisory remains.

React changes were reviewed using the React best-practices skill: no extra fetching effects, subscriptions, dependencies or parent-level state were introduced. The shared card receives a layout prop; stable destination keys and the same map component preserve identity across view changes.

## Limits

The height target applies where content fits. Very long copy and the pre-existing Wadi Mujib Arabic translation-review warning deliberately make cards taller. Small-screen map-only mode does not show a second simultaneous list, consistent with the existing responsive navigation. Headless browser tab scheduling is not identical to visible Chrome; tests cannot guarantee restoration after browser memory-pressure tab discarding.

Language switching retains the existing MapLibre reconstruction for constructor-only native control strings; this task does not claim to eliminate that necessary locale change. A focused check exposed that old-popup cleanup was also clearing selection. A small `MapCanvas.closePopup` guard now distinguishes locale cleanup from a real user close. Cartography and ordinary close behavior are preserved; no map private APIs or security changes are used.

Implementation files: `src/components/discovery/DestinationCard.jsx`, `src/pages/ExplorePage.jsx`, `src/styles/maps.css` and the localized-popup cleanup guard in `src/components/map/MapCanvas.jsx`. Supporting files: the compact baseline/acceptance/language scripts, the updated Explore layout regression script, screenshots, validation artifacts and this report.
