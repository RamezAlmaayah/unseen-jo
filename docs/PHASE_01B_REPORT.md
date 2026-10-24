# Unseen Jo — Phase 01B report

## Delivered scope and routes

Phase 01B implements the three authorized pages inside the existing React/Vite application:

| Route | Page | Behavior |
| --- | --- | --- |
| `/explore` | Explore | Four local Figma demo entries; name search, multiple category filters, clearing, local favorites, details preview, static map, Surprise Me link |
| `/surprise-me` | Surprise Me | Six functional fields sharing the existing preference context; validation; explicitly labeled fixed-sample submission |
| `/discovery-result` | Discovery Result | One fixed Ajloun Figma sample, consistent preference comparisons, details preview and return-to-form action |

Landing, Preferences, the Map shell, My Discoveries shell, shared navigation, focus/skip-link behavior, existing validation commands and the Phase 00 design tokens/assets remain available. Landing's View all now links to Explore, and its Surprise Me promotion now links to the implemented Surprise Me route. Start Exploring still leads to Preferences. No application recreation, dependency installation, configuration reset, deployment or external data integration occurred.

## Figma references and access limitation

Source: [Unseen Jo copy](https://www.figma.com/design/S8JMnWut3IB6ceoACa07cJ/Unseen-Jo--Copy-?node-id=0-1).

| Screen | Frame | Desktop reference |
| --- | --- | --- |
| Explore | `14:272` | 1440 × 1670 |
| Surprise Me | `14:514` | 1440 × 1670 |
| Discovery Result | `30:981` | 1440 × 1152 |

An official Figma MCP read during this phase returned the Starter-plan call-limit error. Cached original screenshots and high-fidelity design-context responses were available for all three frames from the earlier inspection. These, the existing documentation and original local exports supplied the visual reference. No new Figma export, component-library inspection, original image-transform matrix extraction or Figma modification was possible/performed.

## Files added

- `public/data/demo-destinations.json`
- `src/pages/ExplorePage.jsx`
- `src/pages/SurpriseMePage.jsx`
- `src/pages/DiscoveryResultPage.jsx`
- `src/features/discovery/useDemoDestinations.js`
- `src/features/discovery/usePreviewFavorites.js`
- `src/features/discovery/sample.js`
- `src/components/discovery/SectionHeading.jsx`
- `src/components/discovery/CategoryFilter.jsx`
- `src/components/discovery/ContentState.jsx`
- `src/components/discovery/DestinationCard.jsx`
- `src/components/discovery/DestinationPreview.jsx`
- `src/components/discovery/DiscoveryPromo.jsx`
- `src/components/discovery/PreferenceField.jsx`
- `src/components/discovery/MatchingReasons.jsx`
- `src/components/discovery/DiscoveryResultContent.jsx`
- `src/styles/discovery.css`
- `scripts/check-phase01b.mjs`
- `docs/PHASE_01B_REPORT.md`
- `docs/screenshots/phase01b/{explore,surprise,result}-1440.png`
- `docs/screenshots/phase01b/{explore,surprise,result}-375.png`
- `docs/screenshots/phase01b/{explore,surprise,result}-comparison.png`

## Files modified

- `src/App.jsx`: three completed routes replace/add the appropriate screens.
- `src/components/layout/AppLayout.jsx`: shared full-width layout for the three pages; existing shell padding retained on remaining shell routes.
- `src/components/layout/SiteHeader.jsx`: source-accurate flow underlines on Surprise Me and Discovery Result.
- `src/pages/LandingPage.jsx`: connects View all and Surprise Me to their available pages.
- `src/features/preferences/options.js`: shared additional 4 Hours and 20 JD choices from the Surprise Me source.
- `src/features/preferences/PreferenceGroup.jsx`: displays a selected additional shared choice when returning from Surprise Me, without altering the original default layout.
- `src/pages/PreferencesPage.jsx`: its existing preview can display those exact shared choices.
- `src/styles/global.css`: imports the new page styles and the existing isolated checkmark font rules.
- `src/styles/tokens.css`: adds the source floating-panel shadow token.
- `src/styles/checkmarks.css`: updates the usage comment now that the result checklist exists.
- `scripts/check-phase01a.mjs`: retains regression coverage while updating obsolete expectations for the now-enabled View all/Surprise Me routes and completed Explore heading.
- `README.md`, `docs/DESIGN_SYSTEM.md`, `docs/VALIDATION.md`: current scope, behavior, evidence and limitations.

Existing package manifests/lockfile, environment examples, Vite/Vercel configuration, the 83 original asset exports, asset manifest and asset inventory were preserved. Build output and additional QA files are generated under ignored `dist/` and `artifacts/phase01b/`. The existing Phase 01A regression runner also refreshes its screenshot outputs.

## Original assets used

All paths below are local. No expiring Figma URLs, stock imagery, new map tiles or invented destination photographs were added.

| Page | Assets |
| --- | --- |
| Explore | `public/assets/figma/explore/ajloun-card-original.jpg`, `salt-historic.jpg`, `wadi-mujib-adventure.jpg`, `dana-biosphere-reserve.jpg`, `favorite.png`, `travel-time.png`, `duration.png`, `cost.png`, `filters.png`, `jordan-map.png`, `petra-promo-banner.png`, `compass.png` |
| Surprise Me | `public/assets/figma/surprise/waterfall-hero.png`, `location.png`, `stopwatch.png`, `budget.png`, `interest.png`, `transportation.png`, `companions.png`, `surprise-action.png` |
| Discovery Result | `public/assets/figma/result/ajloun-card-original.jpg`, `favorite.png`, `travel-time.png`, `duration.png`, `cost.png` |
| Shared header | Existing `public/assets/figma/preferences/brand-logo.png` and `profile.svg`; existing Lucide icons where the MCP supplied component references |
| Details preview | The same selected entry's original Explore photograph; no separate later-phase page imagery is fabricated |

The Ajloun-labeled card/result photograph depicts orange rock formations, as in the source, rather than the forest photography on the later details frame. This known source inconsistency remains preserved. No required exported image for this phase is missing. Separate original vector exports for some component-only chevrons/search/arrow references are still unavailable; the existing Lucide library supplies these interface primitives.

## Local demonstration data and interactions

The four JSON entries reproduce the destination names, categories, displayed travel times, visit durations and estimated costs from the Explore source. Additional group/transport flags on the fixed Ajloun sample support the source's Friends/Family and Car demonstration. These are explicitly identified as illustrative Figma values, not verified production tourism records or live pricing. No origin, distance, geolocation or route calculation is asserted for the printed sample travel-time labels.

Explore fetches the local static JSON file asynchronously. Loading, HTTP failure, malformed-data and retry behavior therefore correspond to real local-file requests rather than artificial timers or developer-only UI toggles. Names, paths, numeric costs/durations and unique IDs are checked before rendering. Empty results are produced by genuine filters. Search is case-insensitive and trims surrounding whitespace; selected categories are combined with OR semantics, and combined with the name search using AND semantics. All clears categories; explicit clearing restores the initial four entries. Categories with no sample entries, such as Food, correctly produce the empty state.

Favorites are reversible, page-local preview state. They do not save records or persist across navigation/reload. Their accessible names and announcements state this. The shared native details dialog is clearly labeled as a demo preview; it contains the original image and short demo metadata, states that full details are future work, supports keyboard/Escape/close behavior, and does not implement the Phase 01C page.

The map is the original static Figma image. The visible plus/minus decorations are not buttons, are hidden from assistive technology, and have no zoom handlers. A visible caption states that there is no live location, zoom or directions. On narrow layouts the map moves below the cards.

## Shared preferences and fixed sample semantics

Surprise Me uses the existing `PreferencesProvider` and the same six canonical fields. No second preference store was created. It retains multi-selected interests through a keyboard-accessible native disclosure containing checkboxes. Other fields use native selects. Existing Phase 01A range values remain supported; the exact 4 Hours and 20 JD choices from Figma are additional shared values. When a user returns to Preferences with one of these selected, that selection is exposed as a real checked radio option. The original default Phase 01A composition is unchanged.

Validation requires a supported location, at least one supported interest, and supported time, budget, transportation and group values. It focuses the first invalid field, associates inline error text with the control and announces the form error. The form identifies its action as a demo before submission. Public Transportation is abbreviated to Public transport in its compact select; the canonical stored value is unchanged.

Submission always opens the same fixed `ajloun-forest` sample. It does not iterate through, select from, score or rank the dataset. The result carries the submitted preference snapshot in route history and displays an explicit fixed-sample/not-personalized disclosure. Direct visits use current shared demo preferences. In-memory form preferences retain Phase 01A's reload-reset behavior; an existing submitted snapshot can survive a browser-history reload independently of that store.

`buildSampleRecommendation` only describes the fixed sample's relation to the submitted values. A positive mark is shown only if supported by those values:

- The sample category appears among selected interests.
- The 8 JD sample cost fits the selected budget range or explicit 20 JD ceiling.
- The full 2–3 hour sample duration fits the selected available time (the upper bound must fit).
- The selected travel group is among the sample's explicit Friends/Family flags.
- The selected transport is the sample's explicit Car flag.

Otherwise a neutral dash and a factual mismatch are shown. For example, Free / 30 min / Food / Solo / Public transport yields zero positive marks, still displays the same Ajloun sample, and explains the differences. There are no matching percentages, invented scores, claims of exhaustive Jordanian coverage or production personalization.

`DiscoveryResultContent` accepts a presentation object with `kind`, `place`, `preferenceSnapshot` and `reasons` (`id`, `fits`, `text`). A future recommendation response can be adapted to that boundary without replacing the visual page. No recommendation endpoint or engine was implemented.

## Visual comparison at 1440px

Chromium screenshots were captured at normal zoom/device scale factor 1 after local fonts and images loaded. Reduced motion was enabled for settled captures. Each cached Figma screenshot was placed beside the corresponding implementation at the same output scale. The screenshots linked below show reference on the left and implementation on the right.

For Surprise Me and Result source-comparison captures, the form was selected through its real controls to match Figma: Ajloun, Nature, 4 Hours, 20 JD, Car, Friends. Normal first visits still reflect the shared Phase 01A defaults; the application does not overwrite them just to match a screenshot. Mismatch-heavy result states can grow vertically to keep explanations readable.

| Anchor | Figma / final browser geometry |
| --- | --- |
| Shared header | Existing 80px desktop height and navigation geometry retained |
| Explore heading | x=27, y=127; 64px Inter Bold |
| Explore search | x=48, y=286; 816 × 60 |
| Explore categories | x=17, y=395; 1082px total reference width |
| Explore cards | First x=64/y=559; 344 × 310; second x=493; 76px row gap |
| Explore static map | x=1024/y=286; 381 × 949 |
| Explore promotion | x=95/y=1336; 1245 × 196 |
| Surprise hero | y=80; height=677; original lower 100px corner radii |
| Surprise title/copy | Title x=83/y=161, 100px Alkatra Medium; supporting copy y=440 |
| Surprise panel | x=129/y=622; 1200 × 980 |
| Surprise fields | First group x=196; 502px width; two-column source layout |
| Surprise primary action | x=447/y=1422; button 509 × 71 |
| Result heading | x=27/y=149; 64px Inter Bold |
| Result card | x=38/y=327; 722 × 546 |
| Result explanation | x=810/y=327; 575 × 546 in the source-matching state |
| Result checklist | First line origin approximately x=838/y=457; 65px desktop line spacing |
| Result actions | First x=165/y=949; 469 × 66 buttons and 100px gap |
| Source-matching page heights | Explore 1670, Surprise Me 1670, Result 1152 |

Visual review corrected collapsing margins that initially changed total page heights, metadata icon geometry, transportation font size, some label alignment and mobile card whitespace. The original hero/card crop percentages were used where present in captured context. Typography, panel placement, colors, radii and shadows were checked against the references.

Remaining differences are explicit: demo/map disclosures are added to make UI behavior honest; native select text placement and browser/Figma font rasterization differ slightly; the static map's crop/mask and some small icon/text alignment details are not identical to the reference export. The full original transform/mask data could not be reverified under the quota. Irish Grover is assigned only to the source checklist marks; fallback glyph rendering can differ. No universal pixel-perfect claim is made.

## Responsive and motion verification

All three pages passed browser checks at **1440, 1366, 1024, 768, 390 and 375px**, plus a 320px safety check: 21 page/viewport combinations with no horizontal page overflow and all image elements loaded. Desktop geometry uses the Figma reference; smaller layouts reflow rather than scaling the entire canvas. Explore cards reduce columns and its map moves below the content, Surprise Me fields stack, and Result card/explanation/actions stack. Longer mismatch copy expands its panel rather than clipping it.

The existing Motion helpers supply page entrances and staggered cards. Category buttons have restrained press/color feedback; card layout changes animate; cards lift slightly on hover. Surprise Me has staggered hero/panel entrance, and Result reveals its two panels and actions. Native select/disclosure interactions remain usable without animation. MotionConfig, `useReducedMotion`, and the existing reduced-motion CSS are retained; reduced-motion content starts visible. No looping effect, heavy blur or continuous animation was added.

## Validation evidence

| Command/check | Final result |
| --- | --- |
| `npm run lint` | Passed without warnings |
| `npm run validate:assets` | Passed: 83 local references, 48 unique original hashes, no temporary runtime URLs |
| `npm run build` | Passed |
| `npm run validate` | Passed using its unchanged Phase 00 definition |
| `npm audit --omit=dev` | Zero reported vulnerabilities |
| `node scripts/check-phase01a.mjs` | Passed on production preview: 14 page/viewport cases plus existing route/state/keyboard/motion regressions |
| `node scripts/check-phase01b.mjs` | Passed on development and final production preview: 21 page/viewport cases and new interaction tests |

Final browser preview base was `http://127.0.0.1:4174`; development base was `http://127.0.0.1:5173`. The existing servers were reused. The optional runners use the existing temporary Playwright installation or a supplied absolute `PLAYWRIGHT_MODULE` path; no package dependency was added. Set `QA_BASE_URL` to test another running server.

New tests exercised loading, an injected HTTP 503 and retry, an invalid-schema response and retry, case-insensitive name search, category union/deselection/All, clearing, empty results, focus shortcuts, reversible favorites, modal/Escape/close behavior, shared exact preference retention back into Phase 01A, empty-interest validation, fixed sample submission, five supported positive reasons, zero-positive mismatch reasons, source geometry, required widths, image loading, real entrance motion and reduced motion. Normal flows had no unexpected console errors, failed requests or HTTP errors. Intentional HTTP failures are isolated as expected test fixtures; cancelled local fetches on unmount are not broken assets. The browser recorded **zero write requests**.

The source-matching desktop capture is not the only supported state: a direct/default Result view can be taller than 1152px because several truthful mismatch explanations wrap. This is intentional readability behavior rather than a forced screenshot-sized clip. Non-Chromium browsers, hardware screen readers/touch devices and hosted Vercel behavior were not tested.

## Screenshots

| Page | Desktop | Mobile | Reference comparison |
| --- | --- | --- | --- |
| Explore | [1440px](./screenshots/phase01b/explore-1440.png) | [375px](./screenshots/phase01b/explore-375.png) | [Reference left / implementation right](./screenshots/phase01b/explore-comparison.png) |
| Surprise Me | [1440px](./screenshots/phase01b/surprise-1440.png) | [375px](./screenshots/phase01b/surprise-375.png) | [Reference left / implementation right](./screenshots/phase01b/surprise-comparison.png) |
| Discovery Result | [1440px](./screenshots/phase01b/result-1440.png) | [375px](./screenshots/phase01b/result-375.png) | [Reference left / implementation right](./screenshots/phase01b/result-comparison.png) |

Additional width captures, mismatch-state screenshot, geometry and machine-readable browser reports are under ignored `artifacts/phase01b/`.

## Remaining limitations and stop point

No local build/runtime blocker or required raster-asset download is missing. Figma quota still blocks fresh reads. The source's destination/photo inconsistencies, unavailable standalone component exports and lack of mobile design frames remain documented limitations. Local demo records are not verified travel data; favorites are not saved; map decorations are not live controls; details are only a small labeled preview; the displayed result is one fixed sample.

Supabase, authentication, real maps/Leaflet, recommendation selection or ranking, admin, weather, trip planning, partner features, Phase 01C and later phases remain unimplemented. Phase 01B is complete and stops pending approval.
