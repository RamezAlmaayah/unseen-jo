# Unseen Jo — Phase 01A report

## Delivered scope

Landing at `/` and Preferences at `/preferences` are implemented inside the existing Phase 00 React/Vite project. No configuration reset, application recreation, new dependencies, backend connection or later-phase feature was introduced. The shared header, existing shell routes, skip link, focus management, not-found behavior, local fonts, original assets and validation commands remain in place.

Start Exploring and the promotional Surprise Me button lead to Preferences. Explore Map leads to the existing Map shell with an explicit preview description. View all, Search and Profile are disabled because their functions are outside this phase. Featured cards retain the original content and have restrained hover movement; they do not invent destination-detail routes. No footer was added: the source frame does not contain one.

## Figma source and access

Source: [Unseen Jo copy](https://www.figma.com/design/S8JMnWut3IB6ceoACa07cJ/Unseen-Jo--Copy-?node-id=0-1).

- Landing: frame `1:2`, 1440 × 1392.
- Preferences: frame `9:70`, 1440 × 1922.

A new official Figma MCP request during this phase returned the Starter-plan call-limit error. Implementation therefore used the earlier successful design-context responses and screenshots from this conversation, Phase 00 documentation, and original downloaded assets. A cached Preferences screenshot was available for a local side-by-side comparison. The Landing screenshot shown earlier in the conversation supplied the visual comparison; no fresh Landing export or automated full-image pixel diff was available. No Figma write occurred.

## Files created

- `src/pages/LandingPage.jsx`
- `src/pages/PreferencesPage.jsx`
- `src/components/landing/FeaturedCard.jsx`
- `src/components/ui/ButtonLink.jsx`
- `src/components/ui/Reveal.jsx`
- `src/data/featured-destinations.js`
- `src/features/preferences/PreferencesProvider.jsx`
- `src/features/preferences/context.js`
- `src/features/preferences/usePreferences.js`
- `src/features/preferences/options.js`
- `src/features/preferences/PreferenceChoice.jsx`
- `src/features/preferences/PreferenceGroup.jsx`
- `src/styles/pages.css`
- `scripts/check-phase01a.mjs`
- `docs/PHASE_01A_REPORT.md`
- `docs/screenshots/phase01a/landing-{1440,390,375}.png`
- `docs/screenshots/phase01a/preferences-{1440,390,375}.png`
- `docs/screenshots/phase01a/preferences-preview-1440.png`
- `docs/screenshots/phase01a/preferences-comparison.png` (cached Figma reference on the left, implementation on the right, at matched scale).

## Files modified

- `src/App.jsx`: real Landing/Preferences routes, persistent preferences provider, honest Map preview description.
- `src/components/layout/AppLayout.jsx`: full-width page layouts for the two implemented routes; existing shell padding retained elsewhere.
- `src/components/layout/SiteHeader.jsx`: restrained entrance fade and visual Explore-flow underline on Preferences; original dimensions/navigation retained.
- `src/components/ui/Button.jsx`: shared Motion hover/press feedback with reduced-motion and disabled-state handling.
- `src/styles/global.css`: imports page styling.
- `src/styles/tokens.css`: verified black ink and reusable existing selected-shadow values; all Phase 00 colors/fonts preserved.
- `src/styles/components.css`: shared choice recipe references the selected-shadow token.
- `README.md`, `docs/DESIGN_SYSTEM.md`, `docs/VALIDATION.md`: current scope, behavior, QA and limitations.

`package.json`, `package-lock.json`, environment examples, Vite/Vercel configuration, original exported assets, asset manifest, and asset inventory were preserved. Generated `dist/` and ignored `artifacts/phase01a/` contain local build/QA output, not additional application source. Additional viewport captures and browser metrics are in that ignored QA directory.

## Components and behavior

Landing contains the shared header, original landscape hero, Inter/Alkatra copy, two CTA links, three featured cards, and the original Petra/compass promotion. Hero/card/banner images use source crop dimensions rather than substitute photography. The duplicate Wadi Mujib labels and their two different source photos remain intentionally unchanged. Their geographic inconsistency is documented in the original design-system report.

Preferences contains the Back link, heading/supporting copy, mint panel, native location select, seven interest checkboxes, time/budget/companions/transport radio groups, and the primary CTA. The selected tiles preserve the green inset-shadow treatment. Focus rings are visible on the actual custom-control surface. Labels and fieldset legends preserve accessible names and group semantics.

`PreferencesProvider` stores a structured object with `startingLocation`, `interests`, `availableTime`, `budget`, `travelGroup` and `transportation`. This remains available while navigating between routes. It is not persisted across full reloads and is not sent to a server. Default choices match the screenshot: Amman, Nature, 2 Hours, Under 10 JD, Solo, Public Transportation. Figma supplies no full location dropdown menu; additional Jordanian city options are an implementation assumption for a usable local selector.

Show Me Places reveals a clearly labeled Preferences preview containing the selected values and an explicit message that recommendations are coming later. It performs no scoring, matching, authentication, saving, database call or success simulation.

## Motion

- Navbar fades in without moving header layout.
- Hero copy and CTA buttons enter with short staggered fades/12px movement.
- Featured heading, cards and promotional section reveal on entry to the viewport; cards use small stagger delays.
- Cards lift by 4px on hover; buttons lift by 2px and press to 0.98 scale.
- Preference labels have gentle hover/press feedback and a 180ms selected-shadow transition.
- `useReducedMotion`, the existing `MotionConfig reducedMotion="user"`, and the existing reduced-motion CSS remove movement/transition effects. Reduced-motion content starts visible, including sections below the fold. No continuous animation, blur effect or animated layout shifting is used.

## Visual comparison at 1440px

Screenshots were captured in Chromium at normal zoom/device scale factor 1 after fonts and images loaded, with reduced motion enabled for settled captures. The Preferences screenshot was scaled to the cached Figma screenshot's 768 × 1024 output for a side-by-side review. Images, selection surfaces, typography, spacing, panel geometry and header alignment were inspected. Landing was visually reviewed against the earlier reference image and its source measurements. Font baseline adjustments were made to the Landing display text rather than moving downstream section anchors.

| Anchor | Figma reference | Rendered result |
| --- | --- | --- |
| Shared header | 80px high; logo x=27/y=13, 56 × 53 | Matches |
| Explore navigation origin | x=556 | Matches |
| Hero | y=80, height=544 | Matches |
| Hero eyebrow | x=53, y=121 | Matches |
| Hero CTA row | y=443, buttons 251 × 69 | Matches |
| Featured heading container | x=59, y=600 | Matches |
| Featured cards | y=730, 355 × 265, 90px gaps | Matches; centered row starts x=97.5 rather than x=97 |
| Promotional banner | y=1075, 1245 × 196 | Matches; centered at x=97.5 rather than x=97 |
| Promotional CTA | x=849, y=1134, 316 × 67 | x=849.5; other values match |
| Preferences heading | x=27, y=209 | Matches |
| Preferences panel | x=98, y=386, 1240 × 1422 | Matches |
| Location field | x=150, y=547, 1140 × 75 | Matches |
| Interest tiles | y=716, 128 × 166, 41px gaps | Matches; no forced responsive fixed widths below desktop |
| Time/budget/group/transport legends | y=907 / 1077 / 1253 / 1426 | Matches |
| Final CTA | y=1676, 691 × 69 | Matches; horizontally centered at x=374.5 |
| Total page height | Landing 1392; Preferences 1922 | Matches both before preview expansion |

Remaining visual differences: browser/Figma font rasterization and some text-layer baseline/alignment details are not guaranteed identical; the centered card/promo container differs by half a pixel horizontally. Search/arrows use the existing Lucide dependency where captured responses supplied component references rather than original standalone exports. Functional controls use real native input semantics. A full-image exact pixel-identity claim would not be justified by the available reference resolution and quota limitation.

## Responsive results

Both pages were browser-tested at **1440, 1366, 1024, 768, 390 and 375px**, plus a 320px safety check. All 14 page/viewport combinations had `scrollWidth <= viewport width` and loaded every image. Screenshots were reviewed at desktop, tablet and mobile widths. No horizontal page overflow was found.

The 1440px desktop composition is retained. Smaller desktop/card widths are fluid; interest options reflow when seven fixed-size tiles no longer fit. Tablet/mobile hero imagery stacks above copy to avoid low-contrast overprinting. Mobile cards stack, preference choices use compact grids, transport options become full-width, and button sizes remain usable. The original Petra image is cropped and tinted with the existing brand green for small-screen text legibility. No mobile Figma frames were supplied, so these are responsive adaptations rather than verified alternate source screens.

## Functional and production validation

- `npm run lint`: passed without warnings after separating context/provider exports.
- `npm run validate:assets`: passed; all 83 Phase 00 references / 48 original hashes remain intact; no temporary Figma runtime URLs.
- `npm run build`: passed.
- `npm run validate`: passed with its existing definition unchanged.
- `npm audit --omit=dev`: zero vulnerabilities reported.
- `node scripts/check-phase01a.mjs`: passed against development server `http://127.0.0.1:5173` and production preview `http://127.0.0.1:4174`.
- All seven interest checkboxes can be checked/unchecked; every radio option and every location option was exercised. Radio groups keep exactly one selected option, and keyboard arrow movement updates controlled state.
- Preferences survive navigation to home and back. Full reload resets to the documented defaults. Preview text reflects the chosen values and makes the absence of recommendations explicit.
- Start Exploring, Surprise Me, Back, Map preview, existing navigation routes, direct refresh, browser history, 404 recovery, skip link and visible keyboard focus pass.
- Real entrance/reveal/card-hover Motion behavior was exercised; reduced-motion checks confirmed content starts visible without entrance movement.
- No uncaught page errors, console errors, failed requests or HTTP error responses occurred during the browser flow. No additional runtime external services were introduced.

The optional browser runner uses the existing temporary QA Playwright installation, not a new project dependency. To use another installed copy, set `PLAYWRIGHT_MODULE` to its absolute `index.mjs` path. Set `QA_BASE_URL` when testing a different server. Non-Chromium browsers, hardware screen readers/touch devices and a hosted Vercel deployment were not tested.

## Screenshots

- [Landing — 1440px](./screenshots/phase01a/landing-1440.png)
- [Preferences — 1440px](./screenshots/phase01a/preferences-1440.png)
- [Preferences comparison — reference left, implementation right](./screenshots/phase01a/preferences-comparison.png)
- [Landing — 390px](./screenshots/phase01a/landing-390.png)
- [Preferences — 390px](./screenshots/phase01a/preferences-390.png)
- [Landing — 375px](./screenshots/phase01a/landing-375.png)
- [Preferences — 375px](./screenshots/phase01a/preferences-375.png)
- [Selected preferences and honest preview](./screenshots/phase01a/preferences-preview-1440.png)

## Remaining issues / boundaries

No required Landing/Preferences image asset is missing and there is no local build/runtime blocker. Figma MCP quota still prevents fresh inspection. Original destination/photo inconsistencies remain source issues rather than being silently corrected. The full location menu, mobile designs and interaction/motion specifications are not supplied by Figma; their implementation choices are identified above.

Supabase, authentication, real maps, recommendation logic, admin, weather, trip planning, partner features, Phase 01B and all later phases remain unimplemented. No deployment was performed. Phase 01A stops here pending approval.
