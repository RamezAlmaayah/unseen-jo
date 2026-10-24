# Landing Page compact desktop refinement

Completed 15 October 2026. This is the authorized visual refinement of `/`, not a new implementation phase. Existing colors, Inter/Alkatra, original photography, button variants, radii, shadows, animations and interactions are retained. No dependencies, assets, routing configuration, data or other page implementations were changed.

## Before and after

Measurements below are CSS pixels at normal browser scale, device pixel ratio 1. Screenshots were captured against the existing production preview at `http://127.0.0.1:4174`, before editing and after rebuilding.

| Property | Before, 1366 × 768 | After, 1366 × 768 | After, 1440 × 900 |
| --- | --- | --- | --- |
| Desktop Navbar height | 80 | 64 | 64 |
| Combined logo/wordmark width | 173 | 138 | 138 |
| Navigation font | 20 | 16 | 16 |
| Hero height | 544 | 409.8 | 432 |
| Alkatra heading font | 64 | 50 | 52 |
| Hero description font | 24 | 18 | 19 |
| Hero button size | 251 × 69 | 180 × 48 | 180 × 48 |
| Hero button font | 24 | 16 | 16 |
| Featured heading font | 40 | 32.8 | 34 |
| Featured card size | 336.5 × 265 | 320 × 239.5 | 320 × 239.5 |
| Featured cards start at document y | 730 | 571.1 | 594.8 |
| Promotional banner height | 196 | 168 | 168 |

The first featured row begins approximately **159px earlier** on the standard laptop viewport. At 1366 × 768 the entire featured photographs and the beginning of their captions are visible without scrolling or changing zoom; before, only the cards' top edge was visible. At 1440 × 900, the entire first card row is visible and the promotional section begins near the bottom. Wide displays retain the existing centered 1440px canvas instead of enlarging the interface indefinitely.

| Screenshot set | Before | After | Side-by-side |
| --- | --- | --- | --- |
| 1366 × 768 | [Before](./screenshots/landing-refinement/before-1366x768.png) | [After](./screenshots/landing-refinement/after-1366x768.png) | [Comparison](./screenshots/landing-refinement/comparison-1366x768.png) |
| 1440 × 900 | [Before](./screenshots/landing-refinement/before-1440x900.png) | [After](./screenshots/landing-refinement/after-1440x900.png) | [Comparison](./screenshots/landing-refinement/comparison-1440x900.png) |

Additional requested viewports: [1920 × 1080](./screenshots/landing-refinement/after-1920x1080.png), [1024 × 768](./screenshots/landing-refinement/after-1024x768.png), [390 × 844](./screenshots/landing-refinement/after-390x844.png). Full-page screenshots use `before-full-…` and `after-full-…` filenames in the same folder, including [desktop full page](./screenshots/landing-refinement/after-full-1366x768.png) and [mobile full page](./screenshots/landing-refinement/after-full-390x844.png).

## Exact component and CSS changes

1. `src/components/layout/SiteHeader.jsx`: the header receives `site-header--landing` **only when `pathname === '/'`**. This is the only application component change. The existing structure, artwork, links, accessibility labels and Motion configuration remain intact.
2. `src/styles/global.css`: adds one import for `./landing-refinement.css` after the existing page styles. Global tokens and shared component recipes are unchanged.
3. `src/styles/landing-refinement.css`: adds the desktop-only rules detailed below. All selectors are scoped to `.site-header--landing` or `.landing-page`; all rules require at least 1024px width. Existing mobile/tablet behavior below that breakpoint remains in effect.

### Header

- Inner height `63px` plus the existing `1px` border makes a `64px` Navbar.
- Horizontal padding `32px`. A three-column grid, `minmax(0, 1fr) auto minmax(0, 1fr)`, centers navigation independently of the differently sized brand and action groups. The existing main wrapper uses `display: contents` only on this desktop Landing header.
- Logo mark width `44px`, height `auto` to preserve the original PNG aspect ratio. Wordmark slot `90px`, `16px` font, `20px` line height; `4px` mark/text gap gives the combined `138px` brand width.
- Navigation `16px`, automatic link widths, `8px` inline link padding, `32px` group gaps. Existing `44px` minimum link hit areas remain.
- Action gap `16px`, search icon `20 × 20px` within its existing `44px` control, profile artwork/control `44 × 44px`.

### Hero

- Height `clamp(400px, 30vw, 432px)` replaces the oversized fixed `544px` desktop section.
- Content width `min(52%, 560px)`; padding `36px 0 0 clamp(32px, 3.68vw, 53px)`.
- Eyebrow `15px / 28px`.
- Heading `clamp(48px, 3.66vw, 52px)`, `16px` top margin, `1.8px` tracking. Both lines use `1.05` line height without the earlier `7px`/`20px` visual offsets. Original Alkatra weight and green/terracotta split remain.
- Description `clamp(17px, 1.32vw, 19px)`, `1.5` line height, `430px` maximum width, `20px` top margin, `0.4px` tracking; removes the old `9px` top offset.
- CTA gap `24px`, top margin `28px`; each button `180 × 48px`, `16px` font. Original green and outline variants, borders, radii, hover/press motion and destinations remain.
- Original landscape PNG and baked-in gradient fade are unchanged. The artwork scales proportionally inside a right-aligned container whose width is `min(100%, calc(hero-height * 1440 / 544))`, using the original desktop-container ratio. Image height is `auto`, retaining the original top offset and natural image proportions rather than stretching the photo to the shorter hero. Its surrounding container becomes smaller as part of the authorized composition refinement.

### Featured section and promotion

- Featured section top margin `0`; heading row width `min(calc(100% - 64px), 1152px)`, automatic height and `24px` flex gap.
- Main section heading `clamp(30px, 2.4vw, 34px)` with `1.2` line height. Supporting text `17px / 26px`, `8px` top margin, no visual top offset. View-all link `16px / 24px` with `24px` arrow and `8px` gap.
- Card grid width `min(calc(100% - 64px), 1080px)`, `24px` top margin, `60px` column gaps; gaps become `32px` from 1024px to below 1280px. This yields `320px` cards on the requested larger desktops and approximately `299px` at 1024px.
- Cards have automatic height. Image viewport keeps the original **355:188 aspect ratio**; the original image `283.21%` height and `-101.98%` crop offset are unchanged. No photograph or image crop was replaced. Copy minimum height `70px`, padding `4px 13px 12px`; title line height `28px`, category `24px` with zero top margin. Both retain their original `16px` font, radii and shadows.
- Landing-only promotional wrapper uses the same `1080px` maximum width and `48px` top margin. Banner `168px` high, columns `88px minmax(0, 1fr) 220px`, `28px` gaps and `32px` inline padding. Compass width `88px`, natural height; copy `22px / 32px`, vertically centered. Gold action `220 × 48px`, `18px` font, centered without the former positional margins. Original Petra background, percentage crop rules, colors and rounded surface remain.
- Landing-only minimum page height becomes `0` and bottom padding `64px`, removing the old forced minimum height and excessive bottom spacing.

## Validation and scope isolation

| Check | Result |
| --- | --- |
| 1366 × 768 | Passed; 64px Navbar, approximately 50px hero text, 320px cards starting at y571.1 |
| 1440 × 900 | Passed; 52px hero text, complete featured cards visible |
| 1920 × 1080 | Passed; centered maximum-width canvas, no oversized scaling |
| 1024 × 768 | Passed; approximately 299px cards, no overlapping Navbar items or clipped controls |
| 390 × 844 | Passed; existing two-row navigation and stacked mobile content preserved |
| Browser zoom / device scale | CSS zoom 1, device pixel ratio 1; no zoom adjustment used |
| Console / assets | No console errors, failed normal-flow requests or broken images |
| Motion / accessibility | Entrances, scroll reveal, card hover, reduced motion, skip link and keyboard focus passed |
| Navigation / state | Start Exploring, Explore Map, View all, Surprise Me, return navigation and retained preferences passed |
| Non-Landing appearance | **12 full-page screenshots have exactly matching SHA-256 hashes before/after** at 1366 × 768 |
| `npm run lint` | Passed |
| `npm run build` | Passed |
| `npm run validate:assets` | Passed: all 83 references / 48 original hashes intact |
| `npm run validate` | Passed |
| `node scripts/check-landing-refinement.mjs` | Passed: five requested viewports, isolation, navigation, state, imagery and motion checks |
| `node scripts/check-phase01a.mjs` | Passed; existing 14 viewport/page cases and functionality checks, with authorized Landing geometry expectations updated |

The 12 unchanged screenshot routes are Preferences, Explore, Surprise Me, Discovery Result, Ajloun Details, My Discoveries, Login, Registration, Recovery, Profile, Map and Not Found. Their components and styles were not modified. Tests also verify the header returns to its original 80px desktop height when leaving Landing. The comparison validates rendered appearance at the specified laptop viewport; it is not an all-browser or physical-device claim.

The original seven-screen Figma identity is preserved, while the user-authorized Landing dimensions intentionally supersede that page's original desktop measurements. No fresh Figma MCP query was required for this refinement; existing assets and styling supplied the reference, and the earlier quota limitation remains. No new product functionality or later phase was started.

## Complete change inventory

- Added `src/styles/landing-refinement.css`.
- Modified `src/components/layout/SiteHeader.jsx` and `src/styles/global.css` as described above.
- Added `scripts/check-landing-refinement.mjs`; it reuses the existing external Playwright installation. If the local pre-change evidence is available, it additionally compares the other routes' exact screenshot hashes. No test/runtime package was installed.
- Updated only Landing geometry expectations in `scripts/check-phase01a.mjs`; the remainder of its checks remains intact.
- Added this report and `docs/screenshots/landing-refinement/` captures/comparisons; appended the Landing-specific override note to `docs/DESIGN_SYSTEM.md`.
- Local ignored `artifacts/landing-refinement/` holds baseline metrics/hashes, browser results and the capture helper. Existing Phase 01A screenshot artifacts may be refreshed by its regression runner. `dist/` was regenerated by the build.

Re-run browser checks against a running production preview with:

```powershell
$env:QA_BASE_URL = 'http://127.0.0.1:4174'
node scripts/check-landing-refinement.mjs
node scripts/check-phase01a.mjs
```

Refinement complete. No other page refinement or new phase has begun.
