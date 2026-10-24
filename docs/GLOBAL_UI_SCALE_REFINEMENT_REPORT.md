# Global UI scale refinement

Completed 15 October 2026. This is a visual-density refinement across the existing application, not Phase 02. No backend feature, dependency, authenticated session, permanent save, live map or recommendation logic was added.

The supplied desktop size targets informed the refinement. ChatGPT was a reference for comfortable interface density only; its branding/layout was not copied and no claim is made about its internal design measurements. Unseen Jo keeps its original palette, branding, Inter/Alkatra, photography, page compositions, component shapes, Motion behavior, routes and demo interactions.

## Desktop before and after

The baseline is the application immediately before this task, including the already compacted Landing Page. Measurements are actual CSS pixels at **1366 × 768**, device pixel ratio 1 and CSS zoom 1. Values are rounded where appropriate.

| Element | Before | After |
| --- | --- | --- |
| Navbar | 80px on most pages; 64px Landing | 60px throughout desktop/tablet |
| Brand mark + wordmark | 173px; 138px Landing | 126px |
| Navigation | 20px; 16px Landing | 14px |
| Main maximum width | 1440px | 1200px, with narrower content-specific containers |
| Standard actions | Typically 58–71px high, 20–32px text | 44px high, 15px text |
| Main page headings | Often 61–64px; account/profile 48px | 28px desktop, 26px mobile |
| Landing hero heading | 50px | 43.7px (40–44px responsive range) |
| Landing description | 18px | 16px |
| Landing hero | 409.8px high | 360px high |
| Landing cards | 320 × 239.5px, starting y571.1 | 290 × 215.6px, starting y502 |
| Preferences panel | 1180.3 × 1422px, starting y386 | 1040 × 724px, starting y228 |
| Preferences location control | 75px high | 44px high |
| Interest tile | 166px high | 84px high, with full-tile selection target |
| Other preference choices | 67px high | 44px high |
| Explore cards | Approximately 379 × 310px at this width | 290 × 268px |
| Explore first cards | y559 | y400 |
| Explore static map image | 949px high | 680px high, 320px wide |
| Surprise Me hero/type | 677px / 100px | 340px / 43.7px |
| Surprise Me form panel | Approximately 1147 × 980px, y622 | 980 × 424px, y340 |
| Surprise Me selects | 114px high | 44px high, 16px values |
| Result destination panel | Approximately 705 × 546px | Approximately 511 × 346px |
| Result primary action | y998.7 in the default mismatch state | y590.3 |
| Details photo gallery | 398px high, y195 | 296px high, y136 |
| Details information tiles | 125px high, 27–32px values | 80px high, 18px values |
| Saved destination cards | Approximately 409 × 257px, y673 | 300 × 226px, y486 |
| Account inputs | 58px high | 44px high |
| Registration primary action | y850 | y630 |

More meaningful content is visible on a standard laptop: Landing shows the full featured row, Explore shows its first complete result row and the start of the next, Preferences shows the group options near the fold, and Surprise Me shows the full form and primary action. Registration's primary action and login link fit within the primary viewport. Details keeps a large gallery without consuming the entire first screen.

## Shared tokens

The palette and font-family declarations in `src/styles/tokens.css` are unchanged. The original eight specified brand colors, text/border colors, source black and original shadows remain. Typography and dimensions now use these reusable values:

| Token / family | Current value |
| --- | --- |
| `--layout-max` / `--header-height` | 1200px / 60px |
| `--page-gutter` | `clamp(16px, 2vw, 24px)` |
| `--ui-body` / `--ui-support` / `--ui-caption` | 15px / 13px / 12px |
| `--ui-label` / `--ui-button` | 14px / 15px |
| `--ui-card-title` / `--ui-emphasis` | 18px / 20px |
| `--ui-section` / `--ui-page-title` | 24px / 28px; page title 26px below 768px |
| `--ui-hero` | `clamp(40px, 3.2vw, 44px)` |
| Tailwind `text-navigation`, `text-body`, `text-subtitle` | 14px, 15px, 16px |
| Tailwind `text-section`, `text-page`, `text-hero`, `text-surprise` | Responsive compact equivalents, preserving display-font usage |
| `--control-height` / `--target-size` / `--icon-size` | 44px / 44px / 20px |
| `--page-space` / `--section-space` | 32px / 32px; page space 24px on mobile |
| `--panel-padding` / `--grid-gap` | 24px / 24px; 20px on mobile |
| `--space-1…16` | Existing 4/8/12/16/24/32/48/64px steps, with 20px added as `--space-5` |
| `--card-width` / `--saved-card-width` | 290px / 300px |
| `--landing-hero-height` / `--surprise-hero-height` | 360px / 340px |
| `--gallery-height` | 296px; two supporting rows derive from this token |
| `--explore-map-width` / `--explore-map-height` | 320px / 680px |
| Control / Explore-card / card / panel radius | 14px / 14px / 20px / 28px |
| Named navigation / action / featured gaps | 24px / 12px / 24px |

Body line height is 1.5; paragraph text generally uses 22–24px line height. Card titles are 16–18px; the featured Result title and demonstration profile identity retain 20px emphasis. Section headings generally use 24–28px. Supporting explanations and metadata use 12–14px rather than the previous 10–11px metadata in some cards. Account inputs and mobile search use 16px where appropriate to retain readable native input presentation. Small visual checkbox/radio indicators sit inside comfortably sized labels; they are not the only clickable area.

No page uses CSS zoom, a parent scale transform, a changed root font size to shrink everything, or browser zoom adjustments. Existing small press/hover transforms remain interaction effects only.

## Page-specific treatment

- **Navbar:** one compact shared desktop treatment replaces the Landing-only exception. Navigation is centered between the original mark/wordmark and action icons. At widths below 768px, the existing two-row navigation remains, at 104px total with 44px navigation targets. No hamburger or alternate navigation flow was introduced.
- **Landing:** Alkatra, green/terracotta split, original landscape and baked-in gradient remain. The artwork retains natural proportions in a smaller right-aligned container; card image viewports retain their original aspect ratio and percentage crop rules. Featured headings, three-card spacing and the original Petra promotion are compacted independently.
- **Preferences:** retains its stacked fieldsets, mint surfaces, selected inset shadows and seven interest tiles. Non-interest options are 44px high; interest tiles remain 84px high to comfortably show icon and label. Controls reflow to two columns and interests to three on phones; transport choices stack. No choice or field was removed.
- **Explore:** retains two cards beside the original static map on desktop, with useful 12px metadata. Search is 44px, category chips are compact and wrap, and the map moves below the results below 1024px. Mobile category targets expand to 44px. All filtering, clear, favorite and preview behavior remains.
- **Surprise Me:** retains the original landscape, three-line Alkatra heading, two-column desktop form, overlapping white panel, original icons and terracotta action. Form values use 44px controls. Error text participates in normal flow so validation can expand safely. Phones stack fields with consistent 20px gaps.
- **Discovery Result:** retains its destination/reason columns and original image crop. The two panels stretch to the same row height on desktop; long truthful mismatch reasons wrap instead of clipping. On phones they stack. The CTA pair uses standard 44px controls.
- **Place Details:** retains the main image/supporting pair, six gold tiles, story/experience section, map preview and bottom actions. Gallery, tiles and experience cards have independent sizing, not a uniform percentage reduction. Directions remains unavailable; its explanatory text flows before subsequent actions.
- **My Discoveries:** retains the explorer summary, original composite achievement artwork, progress illustration, tabs and three-column collection. Saved cards are 300px wide on desktop, two columns on tablet and one on mobile. Saves remain temporary; visits and badges remain explicitly unearned previews.
- **Login, Registration, Recovery:** centered 960px maximum composition with the existing brand introduction and form; 44px inputs/actions, smaller headings and consistent field spacing. Single-column mobile layout remains. No real authentication or reset email is simulated.
- **Profile:** 300px summary alongside settings at desktop, compact demonstration avatar/identity, editable shared interests, temporary-save count, and the original honest account limitations. The form and summary stack on phones.
- **Not Found / unknown destinations / Map shell:** smaller headings, padding and actions, clear messages and working navigation. The Map route remains the previous future-phase preview.
- **Dialogs and empty/error states:** smaller headings, copy and padding; 44px close/navigation targets; viewport-constrained dialogs. The enlarged original photo viewer remains intentionally larger than a normal card. No fake loading or success behavior was added.

## Visual evidence

Every implemented route type has a before/after viewport capture at 1366 × 768. Full-page versions are in the same folder using `before-full-…` and `after-full-…`. Comparisons place the baseline on the left and the refined page on the right at identical capture scale.

| Page | Before | After | Comparison |
| --- | --- | --- | --- |
| Landing | [Before](./screenshots/global-ui-scale/before-landing-1366.png) | [After](./screenshots/global-ui-scale/after-landing-1366.png) | [Compare](./screenshots/global-ui-scale/comparison-landing-1366.png) |
| Preferences | [Before](./screenshots/global-ui-scale/before-preferences-1366.png) | [After](./screenshots/global-ui-scale/after-preferences-1366.png) | [Compare](./screenshots/global-ui-scale/comparison-preferences-1366.png) |
| Explore | [Before](./screenshots/global-ui-scale/before-explore-1366.png) | [After](./screenshots/global-ui-scale/after-explore-1366.png) | [Compare](./screenshots/global-ui-scale/comparison-explore-1366.png) |
| Surprise Me | [Before](./screenshots/global-ui-scale/before-surprise-1366.png) | [After](./screenshots/global-ui-scale/after-surprise-1366.png) | [Compare](./screenshots/global-ui-scale/comparison-surprise-1366.png) |
| Discovery Result | [Before](./screenshots/global-ui-scale/before-result-1366.png) | [After](./screenshots/global-ui-scale/after-result-1366.png) | [Compare](./screenshots/global-ui-scale/comparison-result-1366.png) |
| Place Details | [Before](./screenshots/global-ui-scale/before-details-1366.png) | [After](./screenshots/global-ui-scale/after-details-1366.png) | [Compare](./screenshots/global-ui-scale/comparison-details-1366.png) |
| My Discoveries | [Before](./screenshots/global-ui-scale/before-discoveries-1366.png) | [After](./screenshots/global-ui-scale/after-discoveries-1366.png) | [Compare](./screenshots/global-ui-scale/comparison-discoveries-1366.png) |
| Login | [Before](./screenshots/global-ui-scale/before-login-1366.png) | [After](./screenshots/global-ui-scale/after-login-1366.png) | [Compare](./screenshots/global-ui-scale/comparison-login-1366.png) |
| Registration | [Before](./screenshots/global-ui-scale/before-register-1366.png) | [After](./screenshots/global-ui-scale/after-register-1366.png) | [Compare](./screenshots/global-ui-scale/comparison-register-1366.png) |
| Recovery | [Before](./screenshots/global-ui-scale/before-recovery-1366.png) | [After](./screenshots/global-ui-scale/after-recovery-1366.png) | [Compare](./screenshots/global-ui-scale/comparison-recovery-1366.png) |
| Profile | [Before](./screenshots/global-ui-scale/before-profile-1366.png) | [After](./screenshots/global-ui-scale/after-profile-1366.png) | [Compare](./screenshots/global-ui-scale/comparison-profile-1366.png) |
| Not Found | [Before](./screenshots/global-ui-scale/before-not-found-1366.png) | [After](./screenshots/global-ui-scale/after-not-found-1366.png) | [Compare](./screenshots/global-ui-scale/comparison-not-found-1366.png) |
| Map preview | [Before](./screenshots/global-ui-scale/before-map-1366.png) | [After](./screenshots/global-ui-scale/after-map-1366.png) | [Compare](./screenshots/global-ui-scale/comparison-map-1366.png) |

The Discoveries reference capture uses its existing explicit **Load Figma sample collection** action; the initial empty state has not been replaced with invented user activity. Result captures use the fixed sample and current default choices, including honest mismatch explanations.

All thirteen route types also have mobile captures with `after-full-<name>-375.png` filenames, for example [mobile Preferences](./screenshots/global-ui-scale/after-full-preferences-375.png), [mobile Explore](./screenshots/global-ui-scale/after-full-explore-375.png), [mobile Surprise Me](./screenshots/global-ui-scale/after-full-surprise-375.png) and [mobile Result](./screenshots/global-ui-scale/after-full-result-375.png). Registration errors, Surprise Me validation, Profile editing, quick previews and photo-viewer captures are saved for both 1366px and 375px. Other responsive screenshots and metrics remain under ignored `artifacts/global-ui-scale/`.

Visual review covered the desktop captures and mobile form/result/card arrangements. Existing assets, including deliberate source photograph inconsistencies, remain associated with their original screen/destination variants. No stock substitutions, altered source-image files or new photographs were used.

## Responsive and functional validation

| Viewport | Route types checked | Result |
| --- | --- | --- |
| 1366 × 768 | All 13 | Passed; primary density/above-fold review |
| 1440 × 900 | All 13 | Passed |
| 1920 × 1080 | All 13 | Passed; bounded, centered content |
| 1024 × 768 | All 13 | Passed |
| 768 × 1024 | All 13 | Passed; one-row compact Navbar, appropriate content reflow |
| 390 × 844 | All 13 | Passed; two-row navigation, readable fields and touch targets |
| 375 × 812 | All 13 | Passed; stacked forms/cards/galleries without horizontal overflow |

`check-global-ui-scale.mjs` passed **91 page/viewport cases**, ten additional form/data states and the desktop/mobile dialog checks. It verifies normal capture scale, a maximum 1200px main container, consistent Navbar/brand dimensions, no horizontal page overflow, no controls outside the viewport, no checked UI text below 12px or above 44px, no card-category/metadata collisions, input sizing, image loading, reduced-motion visibility and real entrance/reveal behavior. Rasterized text inside source images is not measured as DOM typography.

Additional states cover invalid registration, empty-interest Surprise Me validation, editable Profile, partial destination data and unknown slugs at laptop/mobile sizes. Dialog captures cover the preserved quick preview and original-photo enlargement. The existing suites continue to exercise full navigation/state/filter/validation flows.

| Command | Result |
| --- | --- |
| `npm run lint` | Passed, no diagnostics |
| `npm run validate:assets` | Passed: 83 references, 48 unique original hashes; local data provenance and route IDs intact |
| `npm run build` | Passed |
| `npm run validate` | Passed |
| `node scripts/check-phase01a.mjs` | Passed: 14 viewport/page cases and Landing/Preferences/state/navigation/keyboard/motion checks |
| `node scripts/check-phase01b.mjs` | Passed: 21 viewport/page cases and loading/error/retry/search/category/preferences/sample-result checks |
| `node scripts/check-phase01c.mjs` | Passed: 42 viewport/page cases and save/remove/gallery/account/profile/error checks |
| `node scripts/check-landing-refinement.mjs` | Passed: five viewport cases, twelve shared-scale route checks, navigation/state/keyboard/motion |
| `node scripts/check-global-ui-scale.mjs` | Passed: 91 viewport/page cases plus additional states and dialog review |

Existing geometry expectations were updated to the expressly authorized compact dimensions; functional assertions were retained. The prior Landing-only exact-pixel isolation contract is intentionally superseded by this global request, so that runner now checks the shared compact header on other routes instead of requiring their old oversized screenshots to match. The original natural-image-ratio assertion now uses fractional rendered rectangles to avoid integer rounding of the smaller brand image.

Across the suites, normal flows have no unexpected console errors or broken asset loads. Global and relevant previous-phase runners recorded **zero non-GET/HEAD requests**. Injected failure fixtures in earlier suites remain isolated expected tests, not unexplained asset failures. Native selection, shared preferences, temporary favorites, sample recommendation honesty, password toggles/validation, profile apply/cancel, unknown-route handling and reduced-motion behavior remain functional. No browser-storage persistence or authentication success was introduced.

Tests use the existing external Playwright installation and local headless Chromium against `http://127.0.0.1:4174`; no test dependency was added. `PLAYWRIGHT_MODULE` and `QA_BASE_URL` overrides remain supported. Production assets were built before the browser suites ran. Physical devices, non-Chromium engines, hardware screen readers and hosted deployment behavior were not newly tested.

## Exact file inventory

### Application files

- **Modified** `src/styles/tokens.css`: compact typography, radii, spacing aliases, layout bounds and reusable size tokens; original colors/font families/shadows retained.
- **Added** `src/styles/ui-scale.css`: shared header/control rules and page-specific density/responsive treatment across all implemented views and dialogs.
- **Modified** `src/styles/global.css`: replaces the Landing-only refinement import with the global scale import.
- **Modified** `src/components/layout/SiteHeader.jsx`: removes the superseded Landing-only conditional class; all routes use the same shared header styling. Navigation, markup and Motion behavior otherwise remain.
- **Removed** `src/styles/landing-refinement.css`: the identified previous Landing-only override, now replaced by global rules and tokens. Its prior report/screenshots remain historical evidence.
- **Modified** `public/data/demo-destinations.json`: corrects the previously misencoded apostrophe in the original Ajloun description (`Jordan?s` → `Jordan’s`). No records, prices, travel metadata, IDs or image associations changed.

### Validation and documentation

- **Modified** `scripts/check-phase01a.mjs`, `scripts/check-phase01b.mjs`, `scripts/check-phase01c.mjs`: current compact geometry expectations; previous behavioral checks retained.
- **Modified** `scripts/check-landing-refinement.mjs`: current global scale expectations and shared-route checks, replacing obsolete Landing-only isolation assumptions.
- **Added** `scripts/check-global-ui-scale.mjs`: all requested route/viewport combinations, readable-scale and error/dialog-state checks.
- **Added** `docs/GLOBAL_UI_SCALE_REFINEMENT_REPORT.md` and `docs/screenshots/global-ui-scale/` evidence.
- **Modified** `docs/DESIGN_SYSTEM.md`, `docs/VALIDATION.md`, `README.md`: current global scale and verification notes; older phase reports remain historical.
- Existing previous-phase screenshot files may be refreshed by their regression runners. Ignored `artifacts/global-ui-scale/` contains the pre-change capture helper, baseline measurements, comparison geometry and machine-readable final results. `dist/` was regenerated by the production build.

No package/lockfile, environment example, route definition, backend configuration, original Figma asset or asset-manifest file changed. No component/state architecture was recreated. The original page style files remain for composition and source crop rules; the final imported scale sheet centralizes the authorized density instead of rewriting those original references wholesale.

## Remaining limits and visual exceptions

- Longer actual text, truthful mismatch reasons and validation errors can expand panels; they are not forced into screenshot-sized clipping. A normal enlarged-photo dialog intentionally uses more image area than a card.
- The saved collection stays three columns on desktop, while Explore keeps its original two-column-plus-map composition. Result's featured title/profile identity use 20px emphasis; this is a deliberate hierarchy exception to regular 16–18px card titles.
- Original bitmap achievement artwork contains baked-in labels that become smaller on phones; it retains descriptive alt text and a readable unearned-preview caption. It is not editable DOM typography. Original maps remain static graphic previews, including their printed labels and markers.
- Source photograph identity inconsistencies and missing destination information remain documented. Figma MCP quota previously prevented fresh reads; this refinement uses the available original design evidence and existing assets and does not claim a newly reverified pixel-identical Figma result.
- No local build/runtime blocker remains. Browser/OS text rendering can differ, and no exact comparison with ChatGPT's internal measurements is claimed.

## Re-run locally

```powershell
Set-Location -LiteralPath 'C:\Users\Magic Systems\Desktop\Unseen Jo Project'
npm run validate
npm run preview -- --host 127.0.0.1 --port 4174 --strictPort
```

In another terminal, run browser checks after the build/preview is ready:

```powershell
$env:QA_BASE_URL = 'http://127.0.0.1:4174'
node scripts/check-phase01a.mjs
node scripts/check-phase01b.mjs
node scripts/check-phase01c.mjs
node scripts/check-landing-refinement.mjs
node scripts/check-global-ui-scale.mjs
```

For development use `npm run dev -- --host 127.0.0.1 --port 5173`. Global visual refinement is complete. Phase 02 has not started; further implementation waits for approval.
