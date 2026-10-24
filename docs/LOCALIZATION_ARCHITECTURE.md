# Unseen Jo localization architecture — Phase 04L

Implemented 19 October 2026 for `dkhwwvoplhfjccvjegty`. Supported locales: **English (`en`)** and **Arabic/Jordan (`ar-JO`)**. English tourism fields remain the original source. This is application localization, not browser translation or a DOM text-replacement service.

## UI resources and rendering

- `src/i18n/index.js`: i18next/react-i18next configuration, locale allowlist, persistence, document direction, display translation and Intl utilities.
- `src/i18n/locales/en.json` and `ar-JO.json`: matching `ui` namespace resources. `ui.ar.txt` is the editable English-key/Arabic-value ledger; run `node scripts/localization-resources.mjs` to regenerate both JSON files. There are 1,001 keys in this revision. Do not use an unescaped pipe in a ledger key; page-title separators are handled by the title hook.
- `tx()` calls explicitly localize displayed JSX text, human-facing properties, statuses, dialogs and validation. English source phrases are stable resource keys (`keySeparator` and `nsSeparator` disabled). Named `{{v0}}` placeholders cover legacy dynamic messages; the most specific patterns are matched first. Pass-through handling preserves React elements, arrays and non-text values. It does not change controlled input values, event handlers, routes, database enums or arbitrary DOM nodes.
- Root `useTranslation()` updates the route tree without remounting it. Content and map hooks also subscribe directly. Unsaved English/Arabic editor values survive a language switch.
- `LanguageSwitcher.jsx` is used in the shared public header and administrator/authentication shells. There is no full-page navigation when switching. English remains the default; only a user language selection writes `unseen-jo-language` to localStorage. An existing valid preference survives navigation and reload. Blocked localStorage falls back to in-memory selection.
- `usePageTitle.js` localizes page metadata as well as visible text. The administrator document title is managed separately. Original English page titles are retained in English mode.

Add copy to the resource ledger rather than adding per-component Arabic/English conditionals. The runtime has a deliberate English fallback for unknown UI messages; original provider diagnostics may still be English. Run the resource audit and browser scans to catch missing known copy. Creator names, licence identifiers, original legal evidence, URLs, slugs, UUIDs and code are deliberate exceptions.

Stored tourism prose passes through the destination locale adapter, not UI phrase matching. Descriptions, addresses, visitor notes, original attribution and licence evidence render as content. Generic grammatical patterns such as `{{v0}} of {{v1}}` are prohibited because they can alter English source sentences in an Arabic UI; the pager formats its own translated label. Six individual preview tests compare the complete saved English and Arabic descriptions exactly, including English previews opened while the surrounding UI remains Arabic.

## Persistent destination content

Migration: `supabase/migrations/20261019125402_phase04l_place_translations.sql`.

`public.place_translations` is additive. It stores `place_id`, `locale`, translated name/description/city/geographic address/best-time/transport notes, and visitor guidance. Its primary key is `(place_id, locale)`; this release constrains locale to `ar-JO`. The parent FK preserves referential integrity. Length limits match the English model where fields correspond. Unknown city/best-time values remain NULL. There are no translated numeric prices, coordinates, publication statuses or source-approval flags.

Editorial metadata consists of `source_updated_at`, `editorial_status`, `reviewed_by`, `reviewed_at`, `updated_by` and `updated_at`. A pending row has no reviewer/time. Changes to translated text or its English baseline reset translation review. An explicit review operates on an already-saved row, requires the current English timestamp, a name and a sufficiently long description, and records the actual administrator UID. A client cannot impersonate the reviewer. English changes conservatively make the translation stale; stale text is not silently treated as current.

Arabic research translations are recorded in `supabase/content/phase04l-arabic.json` and saved to the six existing parent IDs. That file is not imported into the public application bundle. Initial trusted population records pending review, not an invented administrator action. The existing English rows and their timestamps did not change.

## Authorization and publication isolation

- RLS is enabled on the new table. Anonymous reads require a published parent, reviewed Arabic and a matching current English timestamp.
- Authenticated public reads have the same public conditions. Administrators may additionally read drafts through the existing `unseen_private.is_admin()` check, which requires an existing administrator role and matching active Auth session.
- Only that administrator check permits INSERT/UPDATE. No client DELETE grant or policy was added. Translation identity is immutable on UPDATE. The existing private audit trigger records changes.
- The new trigger is `SECURITY INVOKER` with a fixed empty search path. No new public privileged RPC, role, Auth flow, Storage policy or bypass was introduced.
- Translation review cannot write `places.status`, factual review, media approvals or Storage objects. The existing publication validators still control publication independently.
- Original table policies are unchanged. Separate anonymous/authenticated read policies avoid exposing the private administrator helper to anonymous callers.

The new RLS/public-review conditions were exercised in disposable PostgreSQL/PostGIS with simulated sessions, and real anonymous SDK requests were checked against the hosted project. No real destination was published for testing.

## Bilingual editing and fallback

The existing editor labels its original English section explicitly. `TranslationEditor.jsx` provides separate Arabic fields, independent save, translation status, saved-text editorial review and Arabic preview. Incomplete Arabic is valid draft content and does not prevent saving English. Arabic saves allowlist only translation fields, use optimistic `updated_at` checks and never call the English save/status/media operations. Independent saves keep unsaved English form values intact.

`src/i18n/destinations.js` resolves current/missing/pending/stale/reviewed states. Administrators can preview pending Arabic with its status shown. Public Arabic uses only current reviewed translations returned under RLS; otherwise the original English remains with an explicit fallback notice. Missing individual translated fields also cause the notice. Category IDs, numeric/filter properties, geographic values, links and photo attribution survive the adapter unchanged. Arabic search uses the localized public content; administrator search checks both stored English and Arabic names.

Draft Preview has explicit English/Arabic controls. Form preview does not save, approve or publish. A translation review is an editorial/language approval, not a new verification of historical claims or safety/access advice.

## RTL, typography and formatting

`src/styles/localization.css` adds self-hosted IBM Plex Sans Arabic (400/500/600/700) and RTL-specific rules; the original English typography and brand palette remain. Existing box edges and text alignment use logical CSS properties where equivalent in English. Sidebar position, mobile drawer movement, profile menus, dropdowns, breadcrumbs and directional arrows respond to RTL. Logos, photography and map geography are not mirrored.

The hero's RTL text stays in the photograph's existing clear area. The same imagery, dimensions and approved public layout remain. Native file-input chrome is visually hidden behind its existing accessible upload label, avoiding browser-English “Choose file” text; keyboard focus is shown on the label.

Email/URL/password/numeric controls, explicit coordinate and slug fields, file paths, code, profile emails and original legal evidence use LTR/isolation. Arabic form text uses RTL. `Intl.NumberFormat` and `Intl.DateTimeFormat` handle counts, JOD, dates and Amman time; distances and chart ticks use locale-aware formatting. Numeric values stored in PostgreSQL are unchanged. Native map scale numerals may remain provider/control-generated Latin digits; its units are Arabic.

## Map language

`mapLanguage.js` updates name-bearing symbol layers using `name:ar`, `name_ar`, then the provider's original/English name fallback. Route reference labels and non-name symbols are preserved. MapLibre 6 shapes Arabic and bidirectional text itself; no external RTL plugin is downloaded. See the [MapLibre API documentation](https://maplibre.org/maplibre-gl-js/docs/API/functions/setRTLTextPlugin/).

Native control locale strings, geolocation messages, legends, filters, popups and custom controls are localized. Because constructor locale options are not hot-updatable through the existing React wrapper, the map instance is recreated on a language change with the saved camera. The page, filter state and selected destination are retained. The initial Jordan fit is not reapplied over a saved camera.

Live OpenFreeMap TileJSON advertises Arabic place names, and a decoded live vector tile contains Arabic names. Final real renders show Arabic Jordan/Syria/Damascus labels. Coverage is feature-dependent, not guaranteed globally. An absent Arabic name falls back to provider text; no fabricated Arabic geographic labels are inserted. Evidence: `docs/validation/phase04l-map-language.json`.

## Licensing workflow

Content Completion translates preparation instructions, proposed-cover/gallery labels, image-identity and quality notes, source links, import status and review actions. It adds an Arabic explanation of CC BY/CC BY-SA/CC0/PD conditions, alongside the unchanged original creator, licence identifier, attribution and rights evidence in isolated English/legal text.

The importer still requires the administrator's explicit action and existing secure session. Localization never starts it, changes approvals or edits any existing image record. The original `um.jfif` warning and unapproved status remain.

## Verification and maintenance

See `PHASE_04L_LOCALIZATION_REPORT.md` for actual results and screenshots. Core commands are `node scripts/localization-resources.mjs`, `node scripts/audit-localization-resources.mjs`, `node scripts/check-localization.mjs`, and the database/hosted/browser/interaction/accessibility scripts named `check-localization-*.mjs`.

Keep fixture and hosted evidence distinct. Browser fixtures render the actual researched bilingual text and real map layers but do not prove a genuine new administrator save on Supabase. A human should review Arabic wording, use the real signed-in editor and then approve saved translation text when satisfied. This does not authorize publication or the pending media import.
