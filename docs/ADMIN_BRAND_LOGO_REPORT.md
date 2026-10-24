# Shared public/Admin logo

20 October 2026

The public Navbar's original symbol is `/assets/figma/preferences/brand-logo.png`; its wordmark is the existing `.brand span` text. Both now come from `src/components/layout/BrandLogo.jsx`. The public asset, wordmark styles, colors, dimensions and language behavior were preserved.

The Admin sidebar uses that component with an `/admin` destination and a localized accessible name identifying Unseen Jo and Overview. The hand-built `uj` symbol and its styling were removed. Expanded desktop and mobile drawers display the full logo. Explicit desktop collapse and the existing compact tablet sidebar display the original symbol alone. Activating the logo with Enter opens Overview and closes the mobile drawer. Existing sidebar layout and navigation remain intact.

Changed application files:

- `src/components/layout/BrandLogo.jsx` (new shared component)
- `src/components/layout/SiteHeader.jsx`
- `src/features/admin/AdminApp.jsx`
- `src/styles/admin.css`
- `src/styles/localization.css`

## Verification

`node scripts/check-admin-brand.mjs` passed six production-preview Chromium scenarios: English and Arabic at 1440, 820 and 390px. Checks compare the public and Admin logo asset path, wordmark, image dimensions, computed font family/size/weight/line height, color and direction. They also verify expanded/collapsed/mobile visibility, containment, accessible names, keyboard focus outlines, Overview navigation, mobile drawer closure and no horizontal overflow. Six axe WCAG A/AA scans passed in normal non-hover states. The screenshots were visually inspected.

Authenticated Admin rendering used intercepted fixtures, not the owner's hosted Admin session. No hosted writes or changes to Supabase, destination records, permissions, images or publication states were performed. Phase 05 was not started.

`npm run validate` passed: Oxlint, asset validation (83 references / 48 original image hashes), and production build. The existing unrelated large-chunk build advisory remains.

Evidence: [test results](validation/admin-brand.json), [public logo](../artifacts/admin-brand/public-en-1440.png), [expanded desktop](../artifacts/admin-brand/admin-en-1440.png), [collapsed desktop](../artifacts/admin-brand/collapsed-en-1440.png), [Arabic mobile drawer](../artifacts/admin-brand/admin-ar-JO-390.png).
