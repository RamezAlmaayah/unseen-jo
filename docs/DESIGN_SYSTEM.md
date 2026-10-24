# Unseen Jo — Phase 00 design system

> Current scale: the authorized global UI refinement now supersedes the original fixed desktop sizing and the earlier Landing-only exception. All routes use a 60px desktop header, 126px brand, 14px navigation, 44px standard controls, 15px body and 40–44px decorative hero text inside a maximum 1200px canvas. Colors, fonts and original imagery remain. See [Global UI scale report](./GLOBAL_UI_SCALE_REFINEMENT_REPORT.md) for exact tokens, screenshots and validation.

Source: [Unseen Jo Figma copy](https://www.figma.com/design/S8JMnWut3IB6ceoACa07cJ/Unseen-Jo--Copy-?node-id=0-1). Inspected through the official connected Figma MCP server on 15 October 2026.

## Scope and evidence

Phase 00 establishes React/Vite, routing, a shared header, style foundations, asset provenance, and documentation. The seven full pages and future authentication, maps, recommendations, Supabase, and database features are deliberately deferred. The shell routes contain only headings. Search/profile are visibly retained in the Figma header but disabled until their functionality is authorized.

All seven screens were inspected with design context, metadata, and reference screenshots earlier in this conversation. This phase refreshed Preferences, Surprise Me, Discovery Result, and Place Details. The server then reported the Starter-plan MCP call limit for Landing, Explore, and My Discoveries. Their earlier successful responses supplied their specifications and still-valid asset download sources. No Figma content was modified.

## Verified desktop frames

All measurements are CSS pixels at the 1440px desktop reference, not screenshot-scaled dimensions.

| Screen | Frame ID | Canvas | Reusable patterns |
| --- | --- | --- | --- |
| Landing | `1:2` | 1440 × 1392 | Shared header, photo hero, paired CTA buttons, three featured cards, promotional banner |
| Preferences | `9:70` | 1440 × 1922 | Back navigation, pale mint panel, location field, seven interest tiles, option rows, primary CTA |
| Explore | `14:272` | 1440 × 1670 | Search/filter field, category pills, two-column place cards, illustrated map, promotional banner |
| Surprise Me | `14:514` | 1440 × 1670 | Waterfall hero, overlapping white panel, six icon-led fields in two columns, terracotta CTA |
| Discovery Result | `30:981` | 1440 × 1152 | Large place card, matching explanation panel, primary/outlined CTA pair |
| Place Details | `32:1128` | 1440 × 1741 | Three-image gallery, six gold information tiles, text/experience cards, map image, CTA pair |
| My Discoveries | `34:1283` | 1440 × 1374 | Profile/progress panel, achievement artwork, Saved/Visited tabs, three-column card grid |

## Colors

Roles below describe actual usage, not verified named Figma variables. The user explicitly specified text and border tokens; black text and a black header border also occur in Figma. The header preserves its black border and navigation text.

| Token / Tailwind utility | Exact value | Role / evidence |
| --- | --- | --- |
| `primary` | `#164F3F` | Brand, headings, CTA backgrounds, outlines |
| `terracotta` | `#D66A4A` | Hero emphasis and Surprise Me action |
| `mint` | `#B7E0D5` | Preference controls |
| `pale-mint` | `#F1F9F7` | Panels, supporting cards and fields |
| `gold` | `#F4D58D` | Promotional CTA |
| `pale-gold` | `#FCE5AF` | Place-detail information tiles |
| `white` | `#FFFFFF` | Canvas, cards, inverse text |
| `text` | `#1E1E1E` | User-required body token; verified icon variable |
| `border` | `#D9D9D9` | User-required shared border token; not independently verified as a named variable |

Variable extraction across all seven screens returned only `--sds-color-icon-default-default: #1E1E1E`. There is no verified complete token collection, theme switching, or semantic color naming scheme in the responses.

## Typography

Fonts are self-hosted through Fontsource packages, so the application does not request Google Fonts at runtime. Font licenses are included in their packages. No Figma font binaries were supplied.

| Role | Figma specification |
| --- | --- |
| Logo text | Inter Black 900, 20px, approximately 23px line box |
| Navigation | Inter Regular 400, 20px, normal line height |
| Main page heading | Inter Bold 700, 64px / 77px |
| Main page subtitle | Inter Regular or Medium, 32px; several layers use a 77px line box |
| Section title | Inter Bold/Extra Bold, 40px; 40px or 58px leading by screen |
| Primary button | Inter Medium 500, 24px; original text layers use 58px leading |
| Form section heading | Inter Bold 700, 24px; original layers frequently use 77px leading |
| Preference label | Inter Semi Bold 600, 20px; Photography uses 19px |
| Card heading | Inter Bold 700, 16px on Landing, 24px on Explore/Discoveries, 18px on detail experience cards |
| Card supporting text | Inter Regular, 14–16px; metadata 15px on Discoveries and 10px on Explore |
| Landing display | Alkatra Regular 400, 64px; letter spacing 3.2px; 40px/60px line-height differences within the heading |
| Surprise display | Alkatra Medium 500, 100px; letter spacing 5px |
| Surprise supporting copy | Inter Regular, 36px; letter spacing 3.6px |
| Result checkmarks only | Irish Grover Regular 400, checkmark spans with 65px leading |

Inter is the default, Alkatra is available through `font-display`. Irish Grover is not globally loaded or used for interface text: `src/styles/checkmarks.css` is reserved for the actual result checklist in a later phase. Text token sizes use fluid clamps up to the verified desktop values. The shell uses the 40px section heading scale, avoiding oversized placeholder content.

## Shared header

- 1440 × 80px desktop reference, 1px black bottom border, white background.
- Inner frame starts at x=27, y=13, width=1381, height=53; right outer gap=32px.
- Main brand/navigation group width=971px. Brand width=173px: logo 56 × 53, gap=5px, wordmark width=112px.
- Navigation widths=82px, 82px, 178px, with 50px gaps. At 1440px, Explore begins at x=556.
- Search icon=24 × 24; profile artwork=50 × 50; action gap=30px. Search has an expanded 44px hit area without moving its 24px visual slot.
- Active navigation is an approximately 2px terracotta underline. Its response was exported as SVG; CSS expresses the same primitive without introducing an image request.
- The desktop layout uses flexible groups capped at 1440px rather than absolute positioning. At narrower widths the navigation becomes a second row. Header matching is for the header only; this phase does not reproduce page bodies.

## Layout, spacing, and surfaces

| Element | Verified desktop measurements |
| --- | --- |
| Landing hero | Full width, 544px high below the header |
| Landing buttons | 251 × 69px |
| Landing cards / gap | 355 × 265px / 90px horizontal |
| Promotional banner | 1245 × 196px, 50px radius |
| Preferences panel | 1240 × 1422px, x=98, 50px radius |
| Preferences content | Approximately 50px internal side padding; location field=1140 × 75px |
| Interest tile / gap | 128 × 166px / 41px |
| Preference option / gap | Usually 169 × 67px / 36px; transport options have wider individual widths |
| Explore cards / map | 344 × 310px / 381 × 949px |
| Surprise form panel | 1200 × 980px, x=129, y=622; fields approximately 502 × 145px |
| Result card / match panel / gap | 722 × 546px / 575 × 546px / 50px |
| Detail gallery | Main=881 × 398px; side images=472 × 188px, with 22px gaps |
| Detail information tile | 210 × 125px, approximately 28px gaps |
| Detail experience card | 239 × 217px; image=239 × 140px |
| Saved-place card | 416–417 × 257px; image=416 × 150px; column gap≈66px; row gap=35px |

Radii: 10px small map controls; 15px Explore cards; 20px controls, buttons and detail images; 30px large cards; 50px major panels; Surprise hero has 100px lower corners. Shadows: `0 4px 4px 0 rgba(0,0,0,.25)` on standard cards; paired ±4px offsets on featured/result cards; field shadows use green at .61 opacity. Selected options use green inset shadows over mint; they are not a separate verified flat-color token.

The project adds a conventional 4px spacing scale (4, 8, 12, 16, 24, 32, 48, 64px) for new shell structure. This is an implementation convention, not an inferred Figma spacing system. Exact reference gaps (30, 50, 90px) also have named tokens. Desktop reference sizes should guide future pages, not force unresponsive widths.

## Responsive and accessibility conventions

No mobile/tablet designs were present on the supplied page. Breakpoints are implementation choices: sm=640px, md=768px, lg=1024px, xl=1280px, desktop=1440px. Header height=80px on desktop and 128px below 1024px. At mobile widths the brand logo becomes 44 × 42px, wordmark 18px, and links 14px. No horizontal scrolling is intended at widths of 320px and above.

Use semantic landmarks, native links/buttons, active-route `aria-current`, visible keyboard focus, a skip link, and route-change focus on main content. Motion is configured with `reducedMotion="user"`; CSS disables animation/transition motion when requested. No decorative animation is added in Phase 00. Hover/focus visuals are implementation accessibility conventions, not supplied Figma variants.

## Assets and destination associations

Assets live under `public/assets/figma/{landing,preferences,explore,surprise,result,details,discoveries}`. The full inventory is in [ASSET_INVENTORY.md](./ASSET_INVENTORY.md) and the machine-readable `src/data/figma-assets.json`. Each record preserves screen, frame ID, source layer, placement node IDs, available image/crop classes, local path, actual format, byte count, SHA-256, and duplicate relationship. PNG-looking source URLs sometimes return original JPEG files; local extensions reflect actual format. No expiring MCP asset URLs are used in application code or saved in the manifest.

- Landing: landscape hero, first and third Wadi Mujib-labeled card photographs, Iraq Al-Amir photo, Petra banner, compass, brand/profile artwork.
- Preferences: nature, food, history, culture, adventure, photography, family, stopwatch, companion, car and location icons; brand/profile artwork and divider SVGs.
- Explore: Ajloun-labeled original card photo, Salt Historic, Wadi Mujib Adventure, Dana Biosphere Reserve, illustrated Jordan map, filter/favorite/metadata icons, promotional artwork.
- Surprise: waterfall hero and location/time/budget/interest/transport/companion/action icons.
- Result: Ajloun-labeled original photo, favorite and travel/duration/cost icons.
- Details: Ajloun gallery images, location-map screenshot, Hidden Trails, Scenic Viewpoints, and Local Experiences thumbnails.
- Discoveries: Ajloun-labeled original, Salt, Wadi Mujib, Iraq Al-Amir, Dana, Umm Qais; explorer avatar and achievement badges. The badges are supplied as a combined image, not separate editable badge assets.

**Source inconsistency:** the Ajloun-labeled card on Explore/Result depicts orange rock formations; My Discoveries uses a castle image; Place Details uses forest/landscape photography. Landing's first and third cards share the Wadi Mujib label but different photographs. These exact source associations are preserved in separate screen-specific files. No global destination-to-photo assignment has been invented. Geographic authenticity of these images cannot be established from Figma alone; confirm before full-page implementation.

The header uses the real local Figma logo/profile artwork. Search is rendered with the requested Lucide library at the verified 24px size; Figma supplied a Simple Design System component reference rather than an independent Search image URL. Arrow, chevron, and progress components were likewise surfaced as component references. Their original standalone SVG exports are not available in the captured responses; this is an asset limitation, not a missing download. No stock photographs or replacement imagery were added.

## Structure and extension points

`src/components/layout` contains the header and route layout. `src/components/ui` contains shared primitives. `src/config` owns navigation configuration. `src/pages` currently contains only the minimal shell route component. `src/styles` holds theme tokens, global base styles, component recipes, and the isolated checkmark font. `src/data` holds asset provenance, not application tourism data. Add future domain features when those phases are authorized; do not pre-create mock services or databases.

The `.env.example` contains blank public `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` variables. It is not consumed by the application. No Supabase SDK, secrets, database, authentication or credentials are configured. Local environment files are ignored. Vercel configuration prepares Vite output and SPA deep-link rewrites; no deployment has occurred.

## Undetermined properties and access limitations

- MCP Starter-plan call limit prevents a further live refresh of three frames and additional component/library queries.
- No verified full component variant sets, semantic variable collections, spacing tokens, motion specifications, or complete prototype interaction contract.
- Asset node provenance is retained; full original imageTransform matrices are not exposed by the captured reference code. Generated crop/position classes are retained where available; Landing crop details are summarized by the earlier context rather than a persisted raw response.
- Original image licensing and geographic identity are not established by access to the design.
- The supplied page does not include a separate full Map screen, despite the navigation label. No map implementation is inferred.

## Technical references

- [Tailwind Vite integration](https://tailwindcss.com/docs/installation/using-vite)
- [React Router declarative installation](https://reactrouter.com/start/declarative/installation)
- [MotionConfig and reduced motion](https://motion.dev/docs/react-motion-config)

See [VALIDATION.md](./VALIDATION.md) for the actual validation results and remaining limitations. Phase 01 requires the user's approval.

## Phase 01A extension

Phase 01A was authorized and implements only Landing (`/`) and Preferences (`/preferences`). Their desktop composition uses frames `1:2` and `9:70`. Phase 00 tokens and assets remain intact. `src/styles/pages.css` owns page-specific layout and optical text-baseline corrections. The verified black Figma text is now exposed as `--color-ink`; the two existing selected-state inset shadows have reusable tokens.

Responsive adaptations retain the same imagery and visual language: below 1024px the hero stacks image and copy for contrast; below 768px featured cards stack, preference options reflow, and the promotional background uses a brand-green tint over the original Petra crop for readable white text. These are implementation conventions; no mobile source frames exist. Desktop images retain their exported Figma crop percentages and original files.

Preferences use native checkbox/radio/select semantics and controlled in-memory React context above the routes. Interests support multiple selection; other groups are single selection. Defaults match the source. Route navigation preserves choices; full reload resets them. Only Amman is specified in Figma's location field; additional local city choices are illustrative UI options without geolocation or a data service. The final CTA displays an explicitly labeled local preference preview, not recommendations.

Motion uses the existing dependency: header fade, staggered hero entrance, section/card reveals, hover/press feedback, and selection transitions. All respect reduced motion. The footer is omitted because none appears in the source. Start Exploring and Surprise Me lead to Preferences; Explore Map leads to the existing clearly labeled Map preview. View all, Search, and Profile remain disabled.

See [PHASE_01A_REPORT.md](./PHASE_01A_REPORT.md) for screenshots, exact changes, visual comparisons, tests and remaining deviations. Phase 01B and later phases still require approval.

## Phase 01B extension

Phase 01B implements Explore (`14:272`), Surprise Me (`14:514`) and Discovery Result (`30:981`) at `/explore`, `/surprise-me` and `/discovery-result`. The original local images and palette remain unchanged. `src/styles/discovery.css` contains their reference geometry, responsive reflows and shared discovery components. The floating-panel shadow is a new named token derived from the source; Irish Grover's existing stylesheet is now used for the actual result checklist marks.

Source-sized desktop cards are 344 × 310px, the static map is 381 × 949px, the overlapping Surprise Me panel is 1200 × 980px, and the Result panels are 722 × 546px and 575 × 546px in the source-matching state. Cached screenshots were compared side by side with rendered output; map/mask, native-control and font-rendering differences remain documented rather than claimed pixel-identical.

Demo disclosures are deliberately added. Explore uses four local JSON entries and functional name/category filtering. The map is explicitly static; favorites are page-local; the details dialog is a short preview. Surprise Me reuses the existing preference context, including additional exact source options 4 Hours and 20 JD. Its action always opens one fixed sample. Result reasons state supported fits or truthful mismatches without selecting/ranking destinations. Long mismatches expand the layout. No backend, authentication, live map or real recommendation algorithm is connected.

Landing's View all now opens Explore and its Surprise Me promotion opens the implemented form. Existing Phase 01A features and regression checks remain in place. See [PHASE_01B_REPORT.md](./PHASE_01B_REPORT.md) for full behavior, source assets, visual comparisons, screenshots, validation and limitations. Phase 01C and later phases still require approval.


## Phase 01C extension

Place Details (`32:1128`, 1440 ? 1741) and My Discoveries (`34:1283`, 1440 ? 1374) now use their original source imagery and measured desktop layout. `src/styles/places.css` contains responsive page composition and source-sized gallery/tiles/cards; `accounts.css` extends existing tokens for account and 404 screens. Account screens have no original Figma frames. No palette, font or asset replacement was introduced.

Shared in-memory demo saves now persist across route navigation through `DemoDiscoveriesProvider`, replacing Phase 01B's page-local favorite state. They clear on refresh and never reach browser storage or an account. My Discoveries initially shows an honest empty collection; its explicit Load Figma sample collection action recreates the six-card reference state. Progress and composite badge artwork are unearned illustrations; there is no visited history.

Card names and the Result primary action open `/places/:slug`; quick image previews remain available with a Details link. Only Ajloun has the complete original Details gallery/description/experiences/static map; other demo records show their own image and available source metadata, with missing information explicitly unavailable. Coordinates are unverified and Directions stays disabled. Per-screen Ajloun photograph differences are preserved.

Login, Registration and Recovery validate inputs without sending credentials or simulating success. Profile edits update only a temporary demonstration identity; interests reuse the existing preference store. The original Profile navigation artwork now links to `/profile`. New content uses existing Motion with reduced-motion support, visible focus states, keyboard tabs and native dialogs. Figma quota prevented fresh reads; actual side-by-side comparisons used cached original exports. Desktop geometry matches the documented anchors, with deliberate demo disclosures and related-entry navigation additions. See [Phase 01C report](./PHASE_01C_REPORT.md) for comparisons and remaining deviations. Phase 02 has not started.


## Global compact UI scale

The latest authorized visual refinement applies across all implemented pages, dialogs and empty/error states. `tokens.css` owns the shared typography, radii, layout bounds, control sizes and spacing; `ui-scale.css` is imported last to apply page-specific density while retaining original composition and crop rules. The old Landing-only override was removed. Desktop/tablet navigation is 60px high; phones retain two-row navigation at 104px. Standard actions/fields use 44px targets; interest tiles retain 84px height; mobile inputs remain readable at 16px where appropriate.

Original Figma desktop measurements in earlier sections are historical source references, not current runtime dimensions. Card/photo, form and gallery proportions were evaluated independently; the application is not scaled with zoom or a parent transform. The full palette, Inter/Alkatra families, original shadows and per-screen image associations are retained. Existing Irish Grover checklist usage remains. No backend work or new phase occurred. See [GLOBAL_UI_SCALE_REFINEMENT_REPORT.md](./GLOBAL_UI_SCALE_REFINEMENT_REPORT.md) for before/after values, all requested viewports, current tokens and remaining visual exceptions.
