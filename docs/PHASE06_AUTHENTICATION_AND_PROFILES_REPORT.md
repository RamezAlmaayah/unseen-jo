# Phase 06 — Authentication, profiles and account synchronization

20 October 2026 · Supabase project `dkhwwvoplhfjccvjegty`

Implementation is delivered. Genuine signup, email-confirmed password login, profile update/refresh, saved destinations and preference saving were exercised against hosted Supabase. **On 20 October 2026, the owner confirmed that the same-browser recovery callback and sign-in worked.** This closes the requested private recovery acceptance check. The original cross-browser signup callback failure remains in the audit history; a fresh signup-confirmation round trip was not separately retested. [Callback investigation](EMAIL_CONFIRMATION_CALLBACK_REPORT.md).

## Existing architecture and preserved boundaries

The previous public Login/Register/Profile surfaces were explicitly nonfunctional previews. The existing foundation already provided owner-scoped profiles, user preferences, category links, saved places, private avatar Storage and the ordinary-user signup trigger. Phase 06 reuses those tables and policies. The Admin controller, active-session role checks, account and session key are unchanged.

There are separate clients for anonymous public tourism reads, established Admin authentication (`unseen-jo-admin-auth`), and the new public account session (`unseen-jo-user-auth`). This separation prevents public queries or caches from accidentally using an Admin token. The new account SDK instance initializes once, uses PKCE, restores/verifies its session, refreshes normally and never assigns permissions from editable user metadata. Sign-out uses the local session scope so that an independent Admin session is preserved.

The dedicated MCP connection returned an OAuth refresh error. The original Supabase connector successfully verified and operated on the explicitly requested project. Neither connection was replaced or reconfigured.

## Routes and animation

- Development: `http://127.0.0.1:4184/auth?mode=login` and `?mode=register`.
- Shared recovery, reset and resend-confirmation modes: `?mode=recovery`, `?mode=reset`, `?mode=confirmation`.
- Callback: `/auth/callback`. Profile: `/profile`. Saved destinations: `/my-discoveries`.
- `/login`, `/register`, `/forgot-password` redirect through React Router, retaining safe internal return targets.
- Production preview used for final checks: `http://127.0.0.1:4190`.

The supplied MP4 was inspected as a visual reference. Its welcome panel swaps sides inside a continuous rounded container. The implementation uses Unseen Jo's existing shared `BrandLogo`, forest/mint/gold palette and typography; no external template branding or social artwork was copied.

Desktop form/welcome panels use transform-based horizontal motion with 620ms easing. Form content coordinates a short fade/translation; welcome text transitions separately. Mobile uses a full-width card with form slide/fade rather than squeezing desktop panels together. The outer shell stays mounted. Values survive mode changes; password values remain only in component memory and clear after successful operations. Outgoing forms become inert and hidden from assistive technology. Focus moves to the active heading; validation focuses the first invalid field. Reduced motion removes travel and transition delays. Browser back/forward changes modes without a document reload.

## Auth operations

Registration uses real `auth.signUp`, with name, email, password and confirmation validation. The UI asks for at least 12 characters including a letter and number; Supabase remains the server authority. Busy guards prevent duplicate submissions. Messages avoid revealing whether an address exists. No successful account/session is simulated.

Password sign-in, logout, session restoration, email-change confirmation, password-recovery request and authenticated password reset use official Supabase methods. Public recommendations and tourism remain accessible to guests. Return paths reject external origins, protocol-relative URLs, control characters, encoded slash tricks and Admin/auth loops.

Email confirmation is enabled in the actual hosted project (`mailer_autoconfirm: false`). Email signup is enabled. Google is **disabled**, so no working Google button is advertised. The implementation supports `signInWithOAuth` only when the real Auth settings report Google enabled. No genuine Google OAuth login was performed.

Callback support includes PKCE codes (and optional `sb_flow_id` captured before URL cleanup), supported token-hash confirmation types, applicable legacy fragments, actual recovery proof from the exchange, and verified existing-session handling on a scrubbed-page refresh. Credentials and raw provider error descriptions are removed from the URL and are not logged. Missing verifier, expired/used link, invalid/cancelled link and connection failures have different handling. A missing verifier never creates a session or authorizes a password reset.

## Additive database migration

`supabase/migrations/20261020162409_phase06_user_accounts.sql` was created with the CLI, replayed in disposable PostgreSQL/PostGIS and then applied through the working Supabase connector.

- `profiles.preferred_language`: constrained to `en` or `ar-JO`; column-level owner update grant.
- `user_preferences.discovery_settings`: bounded, allowlisted JSON preserving exact Phase 05 selections, custom amounts/hours and strict requirements.
- Private immutable JSON validation helper with explicit execution grants.
- `uj_save_preferences`: **security invoker**, existing owner RLS, authenticated identity, active-category validation, transactional category-link replacement and expected-version conflict checks. Per-owner transaction locking prevents concurrent lost updates.

No new user-role path, public profile view, service-role browser key, database reset, content mutation, publication change or Storage-policy change was introduced. Hosted verification confirmed the two columns and invoker semantics. Existing profile and preference policies continue to use owner identity in both read/write checks. User-controlled role metadata remains ineffective.

## Profiles, favorites and preferences

Profile editing supports name, language, optional private avatar and verified email changes. Profile updates use an expected timestamp; background refresh never replaces an active edit draft. A deliberate “Discard edits and reload” action resolves stale profile data. An explicit browser language choice wins; a fresh device can use the saved profile language.

Avatar uploads validate type, size, signature and decoded dimensions, prepare a metadata-free image up to 768px, and use immutable paths in the existing private `profile-avatars` bucket. Signed URLs are reused briefly and cleared on identity change. Removing an avatar clears the profile association; it does not delete old Storage objects. Upload/signing/removal were fixture-tested and ownership was exercised in disposable PostgreSQL; no hosted avatar was uploaded.

Guest favorites persist on the device. Authenticated favorites use `saved_places`, with the existing composite unique key, owner RLS and published-place checks. Guest UUIDs are checked against current published places, merged with conflict-ignore inserts and removed from the guest queue only after success. Other account favorites never become guest favorites at logout. Writes update shared favorite state across Explore, Details, recommendation results and My Discoveries, with rollback/error feedback on failure. Small account collections load together; saved IDs use stable 500-row pages for larger accounts.

Guest preferences remain local to the browser visit/session. Account saving is explicit. Guest/account conflicts offer “Use account preferences” or “Keep current preferences.” Background detection of a changed account version also requires a choice; it cannot silently advance the save version over unsaved local values. Explicit saves are transactional and version checked. Legacy normalized rows are imported without interpreting absent budget/time values as confirmed selections; unsupported older city strings need a current location selection. The recommendation engine itself is unchanged. Its repeat history is scoped to account identity and resets on account switching.

Private account refresh uses a 30-second focus cooldown and retains visible content/forms. Auth token refresh is not disabled. Ordinary focus changes do not remount the application or map. Another device's saves/preferences become visible on refresh or after the focus cooldown; this is not a realtime subscription.

## Genuine hosted acceptance and limitations

The supplied mailbox already belongs to the existing Admin. It was left untouched. A distinct Gmail test alias was verified absent, registered as an ordinary account and confirmed privately by the owner. Read-only hosted inspection subsequently confirmed `email_confirmed_at` and a single `user` role for that account.

`docs/validation/phase06-live-browser.json` records genuine accepted signup, verified login/profile read, profile save surviving refresh, a real saved place surviving My Discoveries refresh, and the real preference RPC save. The runner later stopped on an incorrect historical test expectation that `/admin` must redirect to `/admin/login`; the existing application deliberately renders the signed-out Admin shell at `/admin`. That harness expectation is fixed for future runs. **The raw stopped-run artifact is retained; genuine Admin denial and logout/relogin are not retroactively marked passed for that run.** Those flows passed with explicit fixtures and the database policies were tested independently.

The owner's later confirmation, **“Recovery callback and sign-in worked,”** is recorded separately in [owner acceptance evidence](validation/phase06-owner-callback-acceptance.json). The browser journey is owner-confirmed, not agent-observed. The subsequent read-only hosted check verified the confirmed email, ordinary role, six published destinations and unchanged Admin role fingerprint. Its timestamp comparison does not independently establish a new post-recovery password login; that distinction remains explicit in the evidence.

No owner password, confirmation link, token, browser session export or service-role secret was requested/read. The ordinary acceptance password existed only inside the temporary test process/browser. The browser was closed after the stopped run. The test account's own profile/save/preference rows remain; no account or audit history was deleted. The owner can claim/reset that test account privately through the recovery screen in their normal browser.

Full Auth redirect allowlist inspection through `supabase config diff --project-ref dkhwwvoplhfjccvjegty` was blocked by unavailable CLI management authentication. Public Auth settings and the actual arrival at `127.0.0.1:4184/auth/callback` were verified. No URL configuration was guessed or overwritten.

## Validation

Automated callback coverage uses the real installed SDK and React/browser against clearly simulated endpoints: same-browser signup code exchange, missing verifier with zero token requests, token-hash and legacy-fragment formats, recovery authorization, expired/cancelled links, URL scrubbing, StrictMode idempotence and later distinct callbacks. These are not genuine mailbox acceptance.

Nine Phase 06 unit/database groups pass, including complete migration replay, spoofed-role rejection, profile column grants, two-user ownership, invalid JSON/categories, atomic preference saves, stale writes, unique published-only favorites, private avatar access and forbidden Admin RPCs. Foundation (55 checks), Admin database (12 groups), recommendation model (11 groups), tourism repository (15 groups), map model, localization, asset validation and lint/build were also run. Detailed final browser/performance evidence is listed below.

- [Development browser evidence](validation/phase06-browser-4184.json): 11 groups passed, including English/Arabic at 1366, 820, 390 and 320px; account/guest isolation, avatar upload/removal, preference conflict choices, tab-return draft preservation, real-SDK callback formats and error handling. Keyboard focus/Enter/Tab and reduced-motion behavior were checked.
- [Production-preview browser evidence](validation/phase06-browser-4190.json): 11 groups passed using the built application and simulated Auth/REST. No page errors or automated WCAG violations were found in the tested views. This is not manual screen-reader or genuine mailbox acceptance.
- [Hosted HTTP checks](validation/phase06-hosted-http.json): real settings, anonymous private-table/RPC denial and all six public destinations pass.
- [Phase 06 SQL/unit checks](validation/phase06-unit-database.json): nine groups pass. [Localization SQL replay](validation/phase04l-database-tests.json): 16 groups pass.
- [Recommendation browser regression](validation/phase06-recommendation-regression.json): two genuine anonymous English/Arabic mobile journeys plus five explicit fixture edge cases pass.
- [Admin progressive browser regression](validation/admin-progressive-browser.json): English desktop/Arabic mobile interactions pass; its seven query/cache model groups also pass. [Shared logo checks](validation/admin-brand.json): six language/width combinations pass. Existing Admin invitation/recovery checks and isolated acceptance-runner tests pass.
- Final Oxlint has no diagnostics, asset integrity validates 83 references/48 unique originals, localization audit reports no missing static strings, and the production build passes. Existing shared/MapLibre chunk size advisories remain.

Older `check-admin-refinement.mjs` expects the pre-pagination REST fixture and stops on an unhandled `place_categories` request; it is not evidence of a new Admin production failure. The current progressive Admin suites are the relevant regression checks. The localization database fixture incorrectly appended public-translation checks after a later image-replacement test had returned its parent place to draft. Those checks now run while that fixture parent is published; timestamp projections also retain PostgreSQL precision. All 16 groups pass without changing database policies or hosted records.

The Supabase security advisor reports the existing disabled leaked-password protection setting. No database RLS warnings were returned. The optional protection can be reviewed in [Supabase password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection); no plan or Auth setting was changed automatically.

## Screenshots and measured performance

Before screenshots render the archived original nonfunctional account preview in isolation: [desktop](../artifacts/phase06/before-login-preview-desktop.png), [mobile](../artifacts/phase06/before-login-preview-mobile.png). They are visual comparisons, not historical network benchmarks.

After: [English desktop login](../artifacts/phase06/login-en-1366-4190.png), [desktop registration](../artifacts/phase06/register-en-1366-4190.png), [Arabic 320px registration](../artifacts/phase06/register-ar-JO-320-4190.png), [missing-verifier recovery](../artifacts/phase06/callback-cross-browser-signin.png). Desktop/tablet/mobile screenshots for both languages are in `artifacts/phase06`.

[Measured production evidence](validation/phase06-animation-performance.json) uses real anonymous Auth settings, headless Chromium, fresh contexts and a local production server. Mobile 4x CPU is simulation, not a physical handset.

| View / simulated CPU | Usable UI | LCP | Frame-gap p95 | Intervals >50ms | CLS |
|---|---:|---:|---:|---:|---:|
| en, 1366px, 1x | 638ms | 472ms | 16.7ms | 0 | 0.00000 |
| ar-JO, 1366px, 1x | 258ms | 304ms | 16.8ms | 1 | 0.00000 |
| en, 390px, 4x | 1005ms | 484ms | 16.8ms | 0 | 0.00000 |
| ar-JO, 320px, 1x, reduced motion | 273ms | 272ms | 16.8ms | 0 | 0.00019 |

Every sample had zero mode-switch requests, zero document reloads and a zero-pixel shell-height range during switching. The two logo uses coalesced to one image request. Observable subresource transfer was 453,216 bytes in English and 618,832 in Arabic (additional font resources). JavaScript encoded-body bytes, including module preloads, were 314,292; this is compressed network body size, not raw bundle size. These sums exclude HTML navigation and cross-origin resources whose timing is opaque. The Arabic desktop sample contained one frame interval over 50ms; the measured p95 remained 16.8ms.

Lazy route chunks: AuthCallbackPage 3,937 raw / 1,629 gzip bytes; AuthPage 9,477 raw / 3,656 gzip bytes; ProfilePage 7,626 raw / 2,804 gzip bytes. Shared app/runtime/Auth SDK chunks are additional; the route sizes are not whole-application payloads.

No before/after speedup or hardware frame-rate guarantee is claimed. Ordinary tab return is tested; browser tab discard can still reload the document. Existing shared/MapLibre large-chunk build advisories remain. No new dependency or paid service was added.

## Configuration and remaining manual acceptance

Use one origin consistently while requesting and opening email links. `localhost`, `127.0.0.1`, different ports and different browser profiles have separate storage. PKCE requires the browser/device that initiated the request. An already-confirmed email can sign in normally; no verifier should be copied between browsers.

For URL configuration, retain existing Admin and production entries. Development commonly needs `http://127.0.0.1:4184/**`; production should allow the deployed `/auth/callback` and approved return destinations only. Add preview origins only when actually testing them. These are setup recommendations, not a claim about the uninspected full hosted allowlist. [Official redirect guidance](https://supabase.com/docs/guides/auth/redirect-urls).

For Google, create a Google Web OAuth client in the owner's project, set its authorized callback to `https://dkhwwvoplhfjccvjegty.supabase.co/auth/v1/callback`, configure the ID/secret only in Supabase Auth → Providers → Google, enable it and retain the application's approved redirects. Then perform genuine provider acceptance. No secret belongs in frontend environment variables. [Official Google setup](https://supabase.com/docs/guides/auth/social-login/auth-google).

The owner completed the private same-browser recovery/callback and sign-in check on 20 October 2026. A fresh signup-confirmation round trip remains separate additional coverage; the earlier failed signup callback is preserved accurately. A connected browser would allow direct observation without exporting credentials. Google, a real two-device session, private avatar HTTP upload, verified email change and the owner Admin session remain manual acceptance items.

## Main changed files

- `src/features/account/`: separate client, Auth/account providers, owner repository, validation/callback model, navigation, conflict notice and preference save controls.
- `src/pages/AuthPage.jsx`, `AuthCallbackPage.jsx`, `ProfilePage.jsx`; archived previous account preview under `scripts/fixtures/`.
- `src/App.jsx`, shared header/layout, preference provider, recommendation session scope, My Discoveries and saved-status labels in public cards/details.
- `src/styles/user-accounts.css`, global import, bilingual locale resources.
- Additive migration, Phase 06 test/measurement scripts, validation artifacts, README and reports.

All six destination records, images, translations, category associations, Admin role rows, Storage objects and bucket definitions have matching pre/post hosted fingerprints. [Preservation evidence](validation/phase06-hosted-preservation.json). Phase 07 was not started.
