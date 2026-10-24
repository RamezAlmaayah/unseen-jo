# Unseen Jo

Phase 07 implements Personalized Discoveries at [/my-discoveries](http://127.0.0.1:4184/my-discoveries): searchable saved places, self-reported visits and account-owned Surprise Me history. The additive hosted migration is applied. Real signed-in Phase 07 write acceptance is pending an available browser session; fixture results are documented separately in the [Phase 07 report](docs/PHASE07_PERSONALIZED_DISCOVERIES_REPORT.md). See the [current MVP roadmap](docs/ROADMAP.md). Phase 08 Lite is not started and requires approval.

Phase 06 supplies the existing animated authentication, profiles, favorites and preference synchronization. The owner confirmed successful same-browser recovery callback and sign-in on 20 October 2026; see [Phase 06 results and remaining acceptance](docs/PHASE06_AUTHENTICATION_AND_PROFILES_REPORT.md) and the [callback investigation](docs/EMAIL_CONFIRMATION_CALLBACK_REPORT.md). A fresh signup/email-confirmation PKCE journey remains separately pending. Phase 05 recommendations remain available to guests.

As verified read-only on 20 October 2026, project `dkhwwvoplhfjccvjegty` has seven active categories and six published destinations. Phase 05 did not change any records, statuses, permissions or media. The secure Admin content studio, MapLibre and approved responsive bilingual design remain intact. React + Vite, JavaScript, Tailwind CSS, React Router, Motion for React, and Lucide React. Earlier phase reports describe historical states rather than the current inventory.

## Local development

Use Node.js 22.12+ (validated with Node 24.19.0) and npm.

```powershell
cd "C:\Users\Magic Systems\Desktop\Unseen Jo Project"
npm ci
npm run dev -- --host 127.0.0.1 --port 4184 --strictPort
```

Open http://127.0.0.1:4184. Use this same origin/browser when requesting and opening Auth email links; localhost and other ports have separate verifier storage. The supplied ignored .env.local selects the verified Supabase project. Public URL/key settings are required for production. Explicit demo mode is available locally; see docs/TOURISM_DATA.md. No login is required for tourism or recommendations.

```powershell
npm run validate
npm run preview
```

`validate` runs lint, asset integrity checks, and a production build. `preview` serves the built site, normally at http://localhost:4173. Individual commands: `npm run lint`, `npm run validate:assets`, `npm run build`.

## Current scope

- Shared Figma header and responsive application layout.
- Landing (`/`), Preferences (`/preferences`), Explore (`/explore`), Surprise Me (`/surprise-me`), Discovery Result (`/discovery-result`), Place Details (`/places/:slug`), My Discoveries (`/my-discoveries`), interactive MapLibre (`/map`), Admin, unified Auth (`/auth`), Profile (`/profile`) and Not Found.
- Explore searches published Supabase data and real categories, with honest empty/error/retry states. Explicit demo mode remains available for historical public-page previews; recommendations always require the live public data connection. Guest favorites stay on the device; signed-in favorites synchronize through owner-protected Supabase records across public pages.
- Surprise Me ranks published destinations using category, estimated visit duration, recorded admission, approximate proximity and supported group tags. Missing transport and total-cost evidence is disclosed. Strict unknowns require an explicit choice to view unverified alternatives.
- Guest preferences survive navigation/refresh in session storage. Signed-in explorers explicitly save or restore account preferences with conflict checks. Recommendation diversity state remains in memory; successful recommendation presentations also create minimal account-owned history records. Show Me Places and Surprise Me work without login. No external AI service is used.
- My Discoveries has Saved / Visited / History tabs. Guest saves stay local. Signed-in visits support an optional date, and paginated history can be cleared independently of favorites and visits. Tourism content and publication states are unchanged.
- Staggered entrance/scroll reveals and restrained hover/press/selection feedback respect reduced motion.
- Locally stored Figma assets, self-hosted fonts, shared theme tokens, control/card/panel recipes, and a button primitive.
- Real account forms validate inputs, use the existing project and distinguish confirmation/recovery outcomes. Separate public-account and Admin session keys preserve their security boundaries. Google is currently disabled in the hosted provider configuration.
- Reduced-motion preference support, keyboard focus and skip navigation.
- Anonymous public Supabase repository with validated models, nested relationships, caching and pagination. The separate account repository uses a verified session and ownership RLS; no service-role key is shipped.
- Vercel build configuration and SPA rewrite prepared; no deployment performed.

## Project organization

```text
public/assets/figma/    Original assets, grouped by source screen
src/components/layout/ Shared header and route layout
src/components/ui/     Reusable UI primitives
src/config/            Navigation configuration
src/data/              Figma asset provenance manifest
src/pages/             Discovery, unified Auth/callback and profile routes
src/features/account/  Session, ownership, synchronization and callback handling
src/styles/            Tokens, global styles, component recipes
scripts/               Asset/content preparation and local/hosted/browser validation
docs/                  Design specifications, inventory and validation reports
src/lib/supabase/      Public configuration validator and lazy browser client
src/features/tourism/  Mode selection, validated models, repository and React hook
supabase/              CLI config, additive migrations, seed and inspection SQL
```

See [Phase 01C delivery and screenshots](docs/PHASE_01C_REPORT.md), [Phase 01B delivery and screenshots](docs/PHASE_01B_REPORT.md), [Phase 01A delivery and screenshots](docs/PHASE_01A_REPORT.md), [design system](docs/DESIGN_SYSTEM.md), [asset inventory](docs/ASSET_INVENTORY.md), [validation results](docs/VALIDATION.md), and [file/dependency report](docs/PHASE_00_REPORT.md).

Backend foundation: [Phase 02A status](docs/PHASE_02A_REPORT.md), [Supabase setup and verified deployment](docs/SUPABASE_SETUP.md), [schema, ERD and security matrix](docs/DATABASE_SCHEMA.md). Run isolated SQL/PostGIS checks with `npm run test:database`. These tests do not contact the remote project or replace hosted Supabase validation. Phase 02B public integration is complete; see [its report](docs/PHASE_02B_REPORT.md) and [data/mode/content guidance](docs/TOURISM_DATA.md). Phase 03 has not started.

`src/data/figma-assets.json` preserves screen-specific destination/image associations. Several original Figma photos are inconsistent with destination labels; do not merge them into one destination mapping without review. Source assets are retained at original resolution; the implemented pages use the original Figma crops, and unrelated screen assets are not loaded.

The one-time asset importer accepts a JSON array through stdin containing fresh MCP asset URLs and source metadata. It uses curl on Windows, checks original format, corrects extensions and writes the local manifest. Expired URLs are not retained. Existing files came from the connected Figma MCP; no stock imagery is used.

Figma's Starter-plan MCP call limit prevented refreshing three screens during this phase. Their earlier successful inspection in the same conversation supplied the design evidence and asset references. All 83 referenced exports downloaded successfully. Original standalone exports for component-only icons/progress were not supplied; see the design-system limitations.

Phase 01C is complete. Phase 02 and later phases require approval.

Optional browser QA: `node scripts/check-phase01a.mjs`. It reuses the temporary Playwright installation from Phase 00; set `PLAYWRIGHT_MODULE` to another installed copy and `QA_BASE_URL` to test a different server. No test dependency is added to the application.


Phase 01B browser QA: `node scripts/check-phase01b.mjs`. It uses the same optional Playwright module/server configuration described above. Demo data is served locally from `public/data/demo-destinations.json`; no Supabase connection or other backend is present.


Phase 01C adds `/places/:slug`, `/my-discoveries`, `/login`, `/register`, `/forgot-password`, `/profile` and a 404 page. Saves and editable demonstration profile values use shared React memory and clear on refresh. My Discoveries starts empty; its explicit sample-collection action loads the original six Figma cards for preview. Authentication, recovery emails, permanent records and directions are unavailable. The original static map remains a preview. Full Ajloun Details content is source-derived; other destinations explicitly handle missing metadata.

Phase 01C browser QA: `node scripts/check-phase01c.mjs`. See the report for screenshots, all validation commands and remaining source limitations. No additional dependency or backend service was introduced.


The global UI scale refinement is complete across all implemented routes: compact shared tokens, a 60px desktop header, 44px standard controls, a 1200px maximum canvas and page-specific responsive density. See [the global scale report and before/after screenshots](docs/GLOBAL_UI_SCALE_REFINEMENT_REPORT.md). The new optional browser check is `node scripts/check-global-ui-scale.mjs`; existing runners remain available with updated size expectations. This is visual refinement only; Phase 02 remains unstarted.

Phase 03: [interactive map setup, provider attribution and location privacy](docs/MAPS.md), [coordinate research](docs/COORDINATE_INVENTORY.md), and [implementation/test report](docs/PHASE_03_REPORT.md). Run `npm run test:map` and `npm run test:map:browser` for geographic utilities and browser validation.
