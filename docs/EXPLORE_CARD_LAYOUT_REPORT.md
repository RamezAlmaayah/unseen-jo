# Explore destination card layout

Verified 20 October 2026 (Jordan time), within Phase 04L. No destination content, publication states, Storage objects, licensing evidence, authentication rules or database schema were changed. Phase 05 has not started.

The split-view card presentation below is superseded by [Compact Explore Cards](COMPACT_EXPLORE_CARDS_REPORT.md). These measurements describe the preceding layout fix; its panel-aware photo-first grid is retained in list-only browsing.

## Root cause and fix

The split workspace uses about 42% of its width for the list. At a 1440px viewport, that leaves a 473.75px content panel. Viewport-based rules still forced two 224.875px cards into it. Three metadata columns were only 61.625px wide each, while nonwrapping labels and their nonshrinking icons required more space. A card's measured scroll width reached 267px against a 225px client width. Card height was also forced to 244px and metadata absolutely anchored to its bottom. Longer titles and the Arabic translation notice could therefore collide with bottom content.

Legacy rules in `discovery.css`, `ui-scale.css` and `maps.css` contributed fixed heights, narrow metadata columns and viewport-only grid sizing. The old title-button white-space rule did not solve this: current card titles are links, and allowing title wrapping alone could not reserve space above absolutely positioned metadata.

The Explore-specific layout now:

- Uses a named inline-size container on the actual results panel. One column is the default; two columns start at a **576px panel content width**, independent of viewport size. Two columns remain the maximum.
- Removes Explore's fixed card heights and bottom-positioned metadata. Cards grow naturally; cards within a grid row stretch consistently, with metadata following the text and optional translation notice.
- Retains the approved photograph crop ratio of **344:179**, rounded corners, colors, shadows and existing optimized image delivery.
- Places the title/category and favorite button in separate grid tracks. Titles wrap with a 1.4 line height, and long words can break safely.
- Places travel availability, duration and price in separate readable rows, using a fixed icon track and flexible wrapping text with a 10px gap. Unknown labels remain intact and readable.
- Uses 16px content padding and a 24px grid gap. Narrow-screen legacy width caps are overridden for this grid; overflow is resolved by layout rather than clipping text.
- Allows lazy-loaded images to advertise their actual rendered size with `sizes="auto, …"`, retaining explicit fallbacks and the existing 640/1280 responsive variants. Original media and signatures are untouched.

The separate large result card and other page designs are unchanged. MapLibre, filters, Near You, preview/detail navigation and favorite behavior remain in place.

## Measured layout results

| Viewport | Actual list content width | Before/after behavior |
| --- | --- | --- |
| 1440px desktop split | 473.75px | Before: two 224.875px cards with overflowing metadata. After: one 473.75px card, no horizontal overflow |
| 1100px desktop split | 431.75px | One content-safe column |
| 900px tablet list | 852px | Two columns |
| 390px mobile list | 358px | One column |
| 320px narrow mobile list | 288px | One column |

At a fixed 1440px viewport, browser-only split resizing also tested list widths 360, 575, 576 and 640px. One column remained below 576px and two appeared at/above it. This specifically checks that viewport breakpoints do not decide card capacity.

Every measured card was checked for title/category separation, title/favorite separation, metadata below its text body, metadata within the card, icon/text gaps, row separation and image ratio. Page, list and card horizontal-overflow checks passed. DOM-only long English/Arabic names and long admission-availability labels also passed without editing hosted content.

## Why six published destinations appear

The dedicated MCP resolves to `https://dkhwwvoplhfjccvjegty.supabase.co`. Both development and production configurations resolve to **Supabase mode**. Genuine anonymous queries for `status=published` and `is_demo=false` return these six existing records:

| Destination | Slug | Current status |
| --- | --- | --- |
| Ajloun Forest Reserve | `ajloun-forest` | Published, non-demo |
| Dana Biosphere Reserve | `dana-reserve` | Published, non-demo |
| Iraq Al-Amir | `iraq-al-amir` | Published, non-demo |
| As-Salt Historic Centre | `salt-historic` | Published, non-demo |
| Umm Qais | `umm-qais` | Published, non-demo |
| Mujib Biosphere Reserve | `wadi-mujib` | Published, non-demo |

The existing repository explicitly filters published/non-demo records, and normalization rejects other states. Empty or failed live queries do not fall back to demo data. Browser checks observed the real filtered requests and six rendered cards in both builds.

Consequently, **“Published destinations” and the six-destination count are accurate now**. The old automated-publishing report captured an earlier zero-published state. It now carries a historical-snapshot notice pointing here; its original evidence has been retained. This investigation establishes current state, not who performed the intervening publication. No publication operation was invoked. Before/after record IDs, slugs, statuses, demo flags and update timestamps match: [hosted state evidence](validation/explore-publication-state.json).

The pre-existing Wadi Mujib Arabic version warning remains visible when appropriate; this layout change does not approve or rewrite translations.

## Validation and screenshots

`node scripts/check-explore-card-layout.mjs` uses real Chromium, MapLibre and anonymous hosted Supabase data, with no API interception or stored mutations. Development (`4184`) and production preview (`4190`) were tested in English and Arabic/RTL:

- 20 viewport checks across the five widths above.
- 16 fixed-viewport split-resize checks.
- Four long-copy stress checks, with browser-only text substitutions.
- Four interaction flows covering search/reset, favorites, map selection without canvas recreation, preview opening/closing and valid detail links.
- Eight axe scans at desktop/mobile widths, with zero WCAG A/AA violations in those scans. No browser page errors.

Visual screenshots were inspected at desktop split, tablet two-column list, Arabic mobile and Arabic long-copy split widths. Representative evidence:

- [Before: overlapping desktop metadata](../artifacts/explore-layout/before-en-1440.png)
- [Desktop split after](../artifacts/explore-layout/development-en-1440.png)
- [Tablet two-column list](../artifacts/explore-layout/development-en-900.png)
- [Arabic desktop](../artifacts/explore-layout/development-ar-JO-1440.png)
- [Arabic mobile](../artifacts/explore-layout/development-ar-JO-390.png)
- [Arabic long-copy stress](../artifacts/explore-layout/development-ar-JO-long-copy.png)

All production screenshots and measured bounds are listed in [browser results](validation/explore-card-layout.json). The original measurements are in [baseline bounds](validation/explore-layout-before.json). These are layout measurements, not claims of faster network performance.

Additional passing regression suites: 15 tourism/data groups, nine map/geography groups, six image-delivery groups, seven performance/cache/security groups and six localization groups. `npm run validate` passed Oxlint, asset validation (83 references, 48 original hashes) and production build. The existing large-bundle build advisory remains.

Modified implementation: `src/styles/maps.css` and the responsive `sizes` hint in `src/components/discovery/DestinationCard.jsx`. Supporting changes: layout diagnostic/regression scripts, screenshots/validation artifacts, this report and the historical notice in `AUTOMATED_CONTENT_PUBLISHING_REPORT.md`.

Open [Explore](http://127.0.0.1:4184/explore) to review. Narrow layouts retain the existing List/Map toggle; resizing the panel in tests does not add a new dashboard or map-resize UI.
