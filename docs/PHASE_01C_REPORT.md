# Phase 01C — Place Details, My Discoveries and account UI

Completed 15 October 2026 in the existing React/Vite project. No project recreation, dependency installation, configuration reset, original-asset replacement, deployment or backend connection occurred. Phase 02 has not started.

## Delivered routes

| Route | Behavior |
| --- | --- |
| `/places/:slug` | Shared demo record, source gallery where available, six information tiles, description, experience photography, static location preview, temporary save/remove, unavailable directions, other demo-place links |
| `/my-discoveries` | Explorer banner, explicitly unearned badge/progress artwork, keyboard-accessible Saved/Visited tabs, temporary collection, empty states, remove actions, destination links |
| `/login` | Email/password validation, password visibility, registration and recovery links; valid input reports authentication unavailable |
| `/register` | Name/email/password/confirmation validation, separate visibility toggles, login link; no account creation |
| `/forgot-password` | Email validation and return-to-login; explicitly does not send a recovery email |
| `/profile` | Labeled demonstration identity, shared interest selections, temporary saved count, editable in-memory profile, account-preview links, unavailable logout |
| Unknown route | Proper 404 page with Home/Explore navigation |
| Unknown place slug | Place-not-found state with available navigation |

Landing, Preferences, Explore, Surprise Me, Discovery Result and the existing static Map shell remain available. The Navbar's original profile artwork now links to `/profile`. Destination card names navigate to the canonical place route; image buttons retain the earlier quick-preview dialog, now with a full-details link. Result's Explore This Place links directly to the displayed destination.

## Figma reference and visual comparison

Official source: [Unseen Jo copy](https://www.figma.com/design/S8JMnWut3IB6ceoACa07cJ/Unseen-Jo--Copy-?node-id=0-1).

| Screen | Original frame | Reference size |
| --- | --- | --- |
| Place Details | `32:1128` | 1440 × 1741 |
| My Discoveries | `34:1283` | 1440 × 1374 |

A fresh official Figma MCP design-context request returned the Starter-plan tool-call limit. Implementation and comparison therefore used the successful earlier MCP reference code, measurements, original frame screenshots and locally exported original assets. No further source properties could be reverified live. Account screens are new compositions using the existing design system, not claimed Figma originals. There are no supplied mobile frames.

Rendered production screenshots were inspected beside cached source screenshots. The review corrected a 6px gallery baseline offset, badge-image fitting, information-tile line breaks and a mobile directions-notice overlap. Geometry assertions at 1440px verify:

| Element | Implementation desktop anchor |
| --- | --- |
| Details gallery | x33, y195, 1375 × 398 overall; 881px main and 472px supporting column |
| Six information tiles | x17, y765, 1401 × 125 overall, approximately 210px per tile |
| Details static map | x836, y937, 564 × 415 image |
| Experience cards | first x24, y1242, 239 × 217 |
| Details bottom actions | x209, y1569, 1038 × 66 overall |
| Explorer banner | x27, y312, 1381 × 254 |
| Composite badge artwork | x669, y332, 712 × 194 |
| Saved grid | first x27, y673, approximately 416 × 257; three columns with 66px gaps, second row y965 |

The existing Inter/Alkatra fonts, green/terracotta/mint/gold tokens, original desktop radii and shadows are reused. Irish Grover remains confined to the existing checklist use. Components use document flow and responsive grids rather than absolute page positioning.

Intentional differences and practical limits:

- Explicit temporary-save, illustrative-data, static-map and unearned-badge disclosures are added. The explorer shows zero visits rather than pretending the source's three visits happened.
- My Discoveries starts empty. **Load Figma sample collection** explicitly adds the six source cards to the temporary collection; the source-comparison screenshot uses this state.
- A compact remove button is added to saved cards. Missing verified coordinates keep Get Directions disabled; its original green styling is retained with an adjacent unavailable explanation.
- More demo-destination links follow the source Details composition to satisfy related-place navigation. This makes the full Details page taller than the original frame. These are other local entries, not algorithmic recommendations.
- Only Ajloun has the source's full Details record and three-photo gallery. Other places use their own original image and available source metadata; missing descriptions, supporting photographs, travel times, transport, groups, best-time and location information are explicitly unavailable. No Ajloun gallery is reused for unrelated destinations.
- Original photograph/destination inconsistencies are preserved per screen. The Ajloun Explore/Result orange rock photograph, Details forest gallery and Discoveries castle photograph remain distinct; their geographic identity is not newly verified.
- Small text-baseline/rasterization, icon/progress reconstruction, optical alignment and source-image rendering differences remain. No claim of universal pixel-perfect fidelity is made. Responsive layouts are adaptations of the desktop design.

## Assets used

All assets were already downloaded in Phase 00. There are no new remote runtime URLs or stock substitutions. All 83 manifest references / 48 original hashes remain intact.

| Page | Original local files under `public/assets/figma/` |
| --- | --- |
| Place Details, Ajloun | `details/ajloun-main.png`, `ajloun-gallery-top.jpg`, `ajloun-gallery-bottom.jpg`, `ajloun-location-map.png`, `hidden-trails.jpg`, `scenic-viewpoints.jpg`, `local-experiences.jpg` |
| My Discoveries | `discoveries/explorer-avatar.png`, `achievement-badges.png`, `ajloun-card-original.jpg`, `salt-historic.jpg`, `wadi-mujib-adventure.jpg`, `iraq-al-amir.jpg`, `dana-biosphere-reserve.jpg`, `umm-qais.jpg`, `duration.png`, `cost.png` |
| Partial destination details | That destination's existing `explore/` or `discoveries/` image from the shared record |
| Account/Profile/404 | Existing branding and shared header; Profile reuses `discoveries/explorer-avatar.png`; 404 does not add photography |

The combined achievement image is decorative source artwork, not four earned badges or an activity service. Standalone progress/component exports remain unavailable; progress is a clearly labeled CSS illustration. No required original raster is missing. No verified coordinates or additional Details datasets were available. Image failures render a labeled Image unavailable surface without substituting another photograph.

## State, validation and reusable components

`DemoDiscoveriesProvider` is above the routes beside the existing preference provider. `usePreviewFavorites` now consumes that single context. Explore, Result, Details, My Discoveries and Profile therefore share the same reversible saves. Empty initial favorites and demonstration identity reset on full refresh; there are no localStorage/sessionStorage writes. The explicit sample-collection action merges the original six IDs without duplicates.

The single `public/data/demo-destinations.json` collection now contains six records: the four earlier Explore entries plus Iraq Al-Amir and Umm Qais from the Discoveries frame. The two additional entries are marked outside the original Explore collection, preserving its four-card composition and search/filter behavior. Details and per-screen photographs are record properties, not duplicated destination objects in components. Unavailable travel time or numeric duration may be null. Existing Figma sample prices are illustrative, not newly researched prices or booking offers.

Profile applies edits only to that temporary demonstration identity. Interest changes use the existing Preferences provider and remain consistent in the earlier preference flow. Cancel discards the draft. No authentication state is introduced.

Account forms prevent submission to the network, associate field errors with inputs, focus the first invalid field, offer password visibility toggles and announce unavailable-service results. Registration's documented UI-only password rule is eight characters with a letter and number; confirmation must match. This is not a future Supabase policy. Passwords exist only in component memory while entered and are cleared after valid preview submission; they are never placed in storage, URLs, logs or context. No login, registration, reset-email or logout success is simulated.

New reusable components: `PhotoGallery`, `PlaceInfoTile`, `SavedPlaceCard`, `AssetImage`, `EmptyState`, `FormField` (including password presentation). Reused: `SiteHeader`, `AppLayout`, `DestinationCard`, `DestinationPreview`, `ContentState`, `Reveal`, `Button`, `ButtonLink`, canonical preferences and discovery loading. `AccountPage` provides three distinct route modes without duplicating form implementation. Existing Motion supports entrances, scroll reveals, gallery fades, card hover/reorder/removal and tab content entrance; the existing `MotionConfig` and CSS respect reduced motion. Native inputs, buttons and dialogs provide keyboard access; tabs support arrows/Home/End and roving focus. No new dependency was installed.

## Files created

- `src/features/discovery/DemoDiscoveriesContext.js`, `DemoDiscoveriesProvider.jsx`, `formValidation.js`.
- `src/components/discovery/PhotoGallery.jsx`, `PlaceInfoTile.jsx`, `SavedPlaceCard.jsx`.
- `src/components/ui/AssetImage.jsx`, `EmptyState.jsx`, `FormField.jsx`.
- `src/pages/PlaceDetailsPage.jsx`, `MyDiscoveriesPage.jsx`, `AccountPage.jsx`, `ProfilePage.jsx`, `NotFoundPage.jsx`.
- `src/styles/places.css`, `src/styles/accounts.css`.
- `scripts/check-phase01c.mjs`, `docs/PHASE_01C_REPORT.md`.
- `docs/screenshots/phase01c/`: desktop/mobile captures for seven screens, two comparison images, empty/visited/validation/edit states (listed below).

## Files modified

- `src/App.jsx`: provider and routes.
- `src/components/layout/AppLayout.jsx`, `SiteHeader.jsx`: full-width page layout and profile/detail navigation.
- `src/components/discovery/DestinationCard.jsx`, `DestinationPreview.jsx`, `DiscoveryResultContent.jsx`: details links, shared-save descriptions, image fallback, retained quick preview.
- `src/features/discovery/usePreviewFavorites.js`, `useDemoDestinations.js`: shared state and legitimate nullable missing metadata.
- `src/pages/ExplorePage.jsx`: preserve the original four entries and announce temporary shared saves.
- `src/styles/global.css`: import the two added stylesheets.
- `public/data/demo-destinations.json`: canonical source-derived details and Discoveries entries/photo variants.
- `scripts/check-phase01a.mjs`, `check-phase01b.mjs`: preserve regression assertions while updating intentionally activated Profile, new heading and Details link behavior.
- `scripts/validate-assets.mjs`: additionally verify public demo JSON asset provenance, unique route-safe IDs and absence of temporary asset URLs.
- `README.md`, `docs/DESIGN_SYSTEM.md`, `docs/ASSET_INVENTORY.md`, `docs/VALIDATION.md`: current phase/state/route/asset/validation notes.
- Previous-phase screenshot outputs may be refreshed by their existing regression runners. Original source assets, manifest, dependencies, lockfile, Vite/Tailwind configuration and safe environment example are unchanged.

The workspace has no Git repository, so this inventory records the actual edited paths rather than a Git diff. Ignored `artifacts/phase01c/` contains source-reference PNGs, additional viewport captures, geometry/browser evidence and an inspection helper. `dist/` was regenerated by the production build.

## Validation results

| Check | Result |
| --- | --- |
| `npm run lint` | Passed, no diagnostics |
| `npm run validate:assets` | Passed: 83 references / 48 original hashes; demo references/IDs and runtime URL checks |
| `npm run build` | Passed |
| `npm run validate` | Passed with existing command definition |
| `node scripts/check-phase01a.mjs` | Passed on production preview; 14 viewport/page cases plus prior Landing/Preferences/navigation/state/keyboard/motion checks |
| `node scripts/check-phase01b.mjs` | Passed on production preview; 21 viewport/page cases plus search/category/clear/loading/error/retry/preferences/sample-result checks |
| `node scripts/check-phase01c.mjs` | Passed on production preview; 42 viewport/page cases plus new interaction, state, error and geometry checks |

Production browser base: `http://127.0.0.1:4174`. All seven new page types were checked at **1440, 1366, 1024, 768, 390 and 375px** with no horizontal overflow, broken normal-flow image loads or controls outside the viewport. Details reflows three gallery images into a main image plus supporting pair, six tiles into three/two columns, and stacks map/content/cards on narrow layouts. Discoveries reflows three/two/one card columns; forms and Profile stack for readability. Both existing suites also retain their 320px checks. A directions-notice/action overlap assertion supplements the page-overflow check.

The Phase 01C flow checks actual save/remove propagation, empty saved/visited states, sample collection, gallery next/arrow/Escape/focus restoration, missing Details metadata, unknown slugs/routes, a real injected dataset 503 and retry, a missing-image fixture, account invalid/valid-preview behavior, visibility toggles, password clearing, no browser-storage keys, Profile apply/cancel/refresh behavior and shared interests. It exercises real motion separately and verifies reduced-motion content remains visible. Normal flows recorded **zero unexpected console/request errors and zero non-GET/HEAD requests**. Injected failures are isolated expected fixtures; aborted fetches during route changes are excluded from broken-asset reports.

The optional browser runners reuse the prior external temporary Playwright installation, or an absolute `PLAYWRIGHT_MODULE` override; Playwright was not added to this project's dependencies. Tests ran in local headless Chromium, not physical mobile devices, other browser engines, hardware screen readers or a hosted Vercel deployment.

## Screenshots

| Page/state | 1440px | 375px / comparison |
| --- | --- | --- |
| Place Details | [Desktop](./screenshots/phase01c/details-1440.png) | [Mobile](./screenshots/phase01c/details-375.png), [source left / implementation right](./screenshots/phase01c/details-comparison.png) |
| My Discoveries sample collection | [Desktop](./screenshots/phase01c/discoveries-1440.png) | [Mobile](./screenshots/phase01c/discoveries-375.png), [source left / implementation right](./screenshots/phase01c/discoveries-comparison.png) |
| Login | [Desktop](./screenshots/phase01c/login-1440.png) | [Mobile](./screenshots/phase01c/login-375.png) |
| Registration | [Desktop](./screenshots/phase01c/register-1440.png) | [Mobile](./screenshots/phase01c/register-375.png) |
| Password recovery | [Desktop](./screenshots/phase01c/recovery-1440.png) | [Mobile](./screenshots/phase01c/recovery-375.png) |
| Profile | [Desktop](./screenshots/phase01c/profile-1440.png) | [Mobile](./screenshots/phase01c/profile-375.png) |
| Not Found | [Desktop](./screenshots/phase01c/not-found-1440.png) | [Mobile](./screenshots/phase01c/not-found-375.png) |

Additional desktop states: [empty saves](./screenshots/phase01c/discoveries-empty-1440.png), [visited empty](./screenshots/phase01c/discoveries-visited-1440.png), [registration validation](./screenshots/phase01c/register-validation-1440.png), [profile edit](./screenshots/phase01c/profile-edit-1440.png).

## Run locally and remaining limitations

```powershell
Set-Location -LiteralPath 'C:\Users\Magic Systems\Desktop\Unseen Jo Project'
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://127.0.0.1:5173`. To validate the production bundle:

```powershell
npm run validate
npm run preview -- --host 127.0.0.1 --port 4174 --strictPort
```

Run browser QA in another terminal against that preview:

```powershell
$env:QA_BASE_URL = 'http://127.0.0.1:4174'
node scripts/check-phase01a.mjs
node scripts/check-phase01b.mjs
node scripts/check-phase01c.mjs
```

No local implementation/build blocker remains. Figma quota blocks fresh design verification; geographic identity, coordinates and missing destination metadata remain unverified. Authentication, permanent favorites, live maps, recommendation logic and every later-phase feature remain unavailable as required. Phase 01C stops here, pending approval for Phase 02.
