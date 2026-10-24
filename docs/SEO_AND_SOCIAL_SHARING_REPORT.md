# Unseen Jo SEO and social sharing

## Audit and implementation

Existing: React/Vite JavaScript/JSX SPA, favicon using the approved logo, English initial HTML, viewport, theme color, generic description, client-side page-title hook, and bilingual HTML language/direction synchronization. There was no social preview asset, Open Graph/Twitter metadata, canonical configuration, or private-route indexing policy. No production website origin was configured; the Supabase API origin is not the website origin.

The homepage now uses exactly:

- **Title:** Unseen Jo | Discover Jordan Differently
- **Description:** Discover Jordan differently with Unseen Jo. Explore hidden gems, unique destinations, authentic local experiences, and personalized travel recommendations.

Added one shared metadata owner, build-time HTML generation, bilingual route defaults, destination summaries from the already loaded destination data, and noindex rules for Admin, Auth, account/saved-place and personalized result routes. The existing `usePageTitle` hook feeds the shared owner, keeping browser titles, Open Graph and Twitter text consistent without duplicate tags. Query parameters are excluded from canonical URLs. Sample/prototype views are noindex.

Open Graph includes type, site name, title, description, locale and alternate locale. Twitter uses `summary_large_image`, title and description. With an approved website origin, the same code adds canonical, og:url, absolute HTTPS og:image/twitter:image, PNG MIME type, 1200×630 dimensions and image alt text. No unconfigured provider, account, destination or authentication behavior was changed.

## Preview image

[unseen-jo-social-preview.png](../public/assets/branding/unseen-jo-social-preview.png) is a real 1200×630 PNG. It has a light mint background, large forest-green Unseen Jo wordmark and “Discover Jordan Differently” headline, a forest-green side panel containing the original approved logo on white, and restrained terracotta/gold accents. No stock or placeholder imagery is used. The reproducible composition is in `scripts/create-social-preview.mjs`; it uses the project's existing logo and Inter font. Its browser-rendering dependency is the same local Playwright installation used by the existing project tests; no dependency was added.

## What is in the initial response

The generated `dist/index.html` contains the homepage title/description, robots index directive, all text Open Graph tags, locales and Twitter card/text tags, plus the existing language, viewport, favicon and theme-color tags. These are available without JavaScript.

Because `VITE_SITE_URL` is unset, the current build deliberately contains **no canonical, og:url, og:image or twitter:image URL**. The image is packaged in `dist/assets/branding/unseen-jo-social-preview.png`, but a crawler-facing absolute address cannot be published until the real website origin is configured. The unit tests also exercise a configured origin in isolation and verify the generated absolute URLs and duplicate-free HTML; that fixture origin is not written into the application build.

## Production setup and crawler limits

Set **`VITE_SITE_URL`** to the approved public HTTPS website origin in the production build environment, then rebuild. Use only the real root origin, without a subpath, credentials, query, fragment or port. Local addresses and Supabase API origins are rejected. `.env.example` documents the setting. No domain has been invented, no deployed URL is claimed, and nothing was deployed.

The deployed PNG URL will be the approved origin plus `/assets/branding/unseen-jo-social-preview.png`. After deployment verify anonymous HTTP 200 with image/png and test an actual share preview. Until then a full image card is not claimed to work externally.

Public Explore, Map, Surprise Me, preferences and destination titles/descriptions update after React runs. Arabic metadata, HTML lang/dir and `ar_JO` locale update with the existing language control; initial HTML remains English. Language is stored client-side, so no separate crawlable Arabic URL or misleading hreflang links were introduced.

**This remains a client-rendered SPA.** Direct requests to public routes receive the common homepage HTML. Destination-specific social cards and initial Arabic/destination metadata need prerendering or server rendering; client-side tags do not make them automatically available to non-JavaScript social crawlers. Unknown/missing routes also retain the existing SPA HTTP-status behavior rather than becoming genuine server-side 404s. [Google's JavaScript SEO documentation](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) explains rendered metadata; [Open Graph](https://ogp.me/) defines the sharing fields.

Private routes receive `noindex, nofollow` in the rendered meta tag, with `X-Robots-Tag` middleware for local Vite dev/preview and matching header rules prepared in `vercel.json`. The Vercel header rules require a later deployment to take effect externally. Other hosts must implement the equivalent headers. This avoids relying solely on JavaScript for private-route exclusion. `robots.txt` allows crawling so crawlers can see the noindex directive; it is not an access-control mechanism. Auth guards and RLS remain responsible for access.

## Files created or modified

- `index.html`, `vite.config.js`, `.env.example`, `vercel.json`, `public/robots.txt`.
- `src/seo/model.js`, `src/seo/context.js`, `src/seo/SeoProvider.jsx`, `scripts/seo-vite-plugin.js`.
- `src/App.jsx`, `src/i18n/usePageTitle.js`, `src/pages/LandingPage.jsx`, `src/pages/PlaceDetailsPage.jsx`.
- `public/assets/branding/unseen-jo-social-preview.png`, `scripts/create-social-preview.mjs`.
- `scripts/check-seo.mjs`, `scripts/check-seo-browser.mjs`, this report and validation JSON.

## Verification results

| Check | Result |
| --- | --- |
| `npm run lint` | Passed, no warnings |
| `npm run build` | Passed; existing large-chunk advisory remains |
| `npm run validate:assets` | Passed: 83 references, 48 original assets |
| `node scripts/check-localization.mjs` | Six groups passed |
| `node scripts/check-seo.mjs` | Seven groups passed: initial HTML, absent/configured origin, invalid origins, private/public rules, Arabic/destination metadata, PNG dimensions |
| `QA_BASE_URL=http://127.0.0.1:4193 node scripts/check-seo-browser.mjs` | 16 route/language checks passed, plus live language switching; no page errors |
| TypeScript | Not applicable: no `.ts`/`.tsx` application, `tsconfig`, compiler dependency or existing typecheck script. Oxlint/build verify the current JS/JSX architecture. No unnecessary compiler dependency added. |

The browser checks used the actual production React/router build and isolated existing API fixtures; no hosted writes or live share-card fetches were performed. Private HTTP headers were verified on direct requests, title/OG equality and tag uniqueness were checked, and language/RTL behavior remained intact. Evidence: [SEO tests](validation/seo-tests.json), [browser tests](validation/seo-browser.json).
