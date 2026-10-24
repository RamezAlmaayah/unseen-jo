# Netlify public-launch preparation

24 October 2026 update: the static Privacy Policy and Terms of Service are finalized as normal bilingual informational pages at the owner's instruction. Earlier draft/owner-approval requirements below are historical for these static pages. No managed-legal activation is required. Current implementation limits are in [STATIC_LEGAL_IMPLEMENTATION_NOTES.md](legal/STATIC_LEGAL_IMPLEMENTATION_NOTES.md); unrelated backup/Auth/deployment findings are unchanged.

For the shortest ordered path, exact Windows backup process, owner fact list and genuine Auth acceptance cases, use [PUBLIC_LAUNCH_OWNER_ACTIONS.md](PUBLIC_LAUNCH_OWNER_ACTIONS.md). That follow-up preserves this build and separates owner execution from preparation.

24 October 2026. Project `dkhwwvoplhfjccvjegty`. **Build prepared; public launch remains NO-GO until the checkpoints below are resolved.** No deployment, hosted data mutation, migration or Auth configuration change was performed.

## Owner checkpoints before publishing

- [ ] **Recovery readiness:** confirm a completed, recoverable full hosted database/Auth backup or valid restore point in Supabase **Database → Backups**, including timestamp, scope, expiry, restore permissions and a validated recovery procedure. The existing scoped legal recovery pack is not a full database backup. Storage object bytes require separate recovery arrangements. Do not test Restore on production. See [pre-activation decision](../PRE_ACTIVATION_DECISION.md).
- [ ] **Publication discrepancy:** a fresh read at 16:25 UTC found **24 Published, 0 Draft, 0 Archived**, with both Admin roles intact. Current anonymous production-browser checks found **8 image-qualified destinations / 16 excluded**, including direct details. The historic 7/17 split is stale because Umm Al-Jimal now has public media. Frontend filtering does **not** archive records: anonymous Data API clients can still read 24 Published records. Reconcile the current image/rights inventory and separately use the authorized Admin → Places workflow if database archival is required. No archival was performed here.
- [x] **Static legal pages:** Privacy Policy and Terms of Service are finalized in EN/AR with the supplied individual-operator name and email, working contact links and no internal draft/review banners. No managed-legal installation is required. Actual implementation limits are in [the short developer note](legal/STATIC_LEGAL_IMPLEMENTATION_NOTES.md).
- [x] **Registration legal links:** Both static pages remain accessible before signup submission. No acceptance ledger or unrelated processing consent is claimed. Existing authentication/security behavior is preserved; no new legal-approval gate is required.
- [ ] **Auth launch readiness:** configure the actual Netlify origin and redirects, verify hosted email templates/sender limits and test genuine confirmation/recovery with an owner-controlled disposable account after explicit authorization. No real email delivery, real Admin login or password change was tested in this task. Hosted email-template installation status remains unverified.
- [ ] **Content/rights:** confirm current tourism facts, estimates and publication rights, including bundled public imagery. Anonymous access and successful rendering are technical checks, not fresh copyright clearance or factual verification.
- [ ] **Open security safeguards:** fresh read-only checks still find no last-Admin removal guard on hosted role/Auth tables; the prepared local hardening is not activated. Preserve both Admins and resolve this through the separate reviewed activation process, after backup readiness. Supabase's current security advisor also warns that leaked-password protection is disabled; [review remediation and plan availability](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No paid upgrade or setting change is authorized by this preparation. See [hosted safety evidence](validation/netlify-hosted-safety.json).

## Build and production configuration

Run from the project folder:

```powershell
npm run build:netlify
```

Output: **`C:\Users\Magic Systems\Desktop\Unseen Jo Project\dist`**. The current build has 305 files, approximately 132.1 MB decimal. Some unused original public images are large (up to 16.4 MB); existing responsive assets are retained. Main JS is approximately 568 kB / 182 kB gzip; lazy MapLibre is approximately 1,090 kB / 295 kB gzip. Vite reports the existing >500 kB chunk advisory. No dependencies were added or unrelated image assets removed.

The Netlify command validates the project and modern **publishable** key, rejects unknown `VITE_` variables, and enforces:

| Variable | Production value |
| --- | --- |
| `VITE_DATA_MODE` | `supabase` |
| `VITE_SUPABASE_URL` | Existing project's HTTPS API origin |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Existing publishable key; public by design, RLS remains essential |
| `VITE_MAP_STYLE_URL` | `/maps/unseen-nature.json` |
| `VITE_LEGAL_CONTENT_SOURCE` | `static` |
| `VITE_PRIVACY_QA` | `false` |
| `VITE_PRIVATE_PROTOTYPE` | `false` |
| `VITE_SITE_URL` | Actual assigned HTTPS Netlify website origin, once known |

No private keys, passwords, service-role keys or tokens belong in `VITE_` variables. Keep `.env.local` local. Drop uploads are prebuilt files: changing Netlify Dashboard environment variables does not rewrite their JavaScript. Update the local build environment and rebuild.

**No production origin is currently configured.** The generated initial HTML deliberately omits canonical, `og:url`, `og:image` and `twitter:image` URLs. Other homepage SEO/social tags exist. Once the real Netlify origin is allocated, set `VITE_SITE_URL` to that exact HTTPS origin without a path/query and rebuild. Do not use localhost, a proposed unreserved hostname or the Supabase API origin. The existing validator supports a real `netlify.app` origin.

`public/_redirects` supplies `/* /index.html 200`, preserving direct React paths and callback queries without a forced redirect. `public/_headers` supplies security headers, private-route noindex headers and content-addressed image caching. Both files are present at the root of `dist`, so Drop does not depend on a repository build. `netlify.toml` documents build command/output for optional future repository builds. The old `vercel.json` is not copied to `dist` and is not used.

Legal management remains uninstalled/unactivated. Privacy fulfillment remains impossible to activate in a production bundle under the existing DEV/loopback guard; no request or password-entry controls appear. Prepared future implementation is preserved.

## Supabase Auth: owner configuration after the real URL is known

In [Authentication → URL Configuration](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/auth/url-configuration), use the **actual assigned Netlify origin** as Site URL. In the table below, replace `ORIGIN` with that exact `https://…netlify.app` origin; do not paste `ORIGIN` literally.

Add these narrowly scoped Redirect URLs, preserving working development entries:

| Redirect entry | Use |
| --- | --- |
| `ORIGIN/auth/callback` | Email-address change / base callback |
| `ORIGIN/auth/callback\?**` | Same callback path with signup/recovery/returnTo and SDK flow query parameters |
| `ORIGIN/admin/recovery` | Existing Admin password recovery |
| `ORIGIN/admin/accept-invite` | Existing Admin invitation flow, when the authorized sender explicitly selects this redirect |

The backslash in `\?` escapes a literal query delimiter in Supabase's documented glob syntax. The wildcard is restricted to the callback query, not all website paths/hosts. For example, the app generates `/auth/callback?returnTo=%2Fprofile&flow=signup` and `…&flow=recovery`; other safe return paths and SDK flow IDs can vary. Verify the allowlist accepts the actual generated links. Do not use `https://*.netlify.app/**` or broad production-origin `/**` entries. Keep existing explicit local origins/paths needed for development; do not replace them blindly.

In [Authentication → Email Templates](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/auth/templates), back up existing configuration and inspect the saved templates before any separately authorized edits. [Complete copy/paste templates](SUPABASE_EMAIL_COPY_PASTE_READY.md) and [installation guide](AUTH_EMAIL_FINAL_INSTALLATION_GUIDE.md) already exist. Confirmation, recovery, invitation, magic-link and email-change templates use `{{ .ConfirmationURL }}`; reauthentication uses `{{ .Token }}`; notification links use `{{ .SiteURL }}`. Preserve these variables. Do not replace confirmation/recovery links with a hardcoded website URL or append another callback path to them. The two security notifications require their corresponding enable switches if desired; installing HTML does not enable a login provider.

The real email logo now returns **HTTP 200, image/png, 10,952 bytes**:

`https://dkhwwvoplhfjccvjegty.supabase.co/storage/v1/object/public/brand-assets/unseen-jo-email-logo-v1.png`

This fresh result supersedes the old installation guide's historical HTTP 400 observation. No upload was needed or performed. A working logo does not prove templates are installed or emails delivered. Current public Auth settings report email enabled, confirmation required, signup enabled, Google disabled. No provider or SMTP configuration was changed; review public-email delivery restrictions/limits before launch.

Keep PKCE enabled. Request a **new** recovery/confirmation email from the final origin; finish recovery in the same browser profile and site origin that initiated it. Localhost verifier storage does not transfer to Netlify or another browser profile. Do not reuse expired/consumed links or change the primary Admin password for testing.

## Manual publication — only after the checkpoints above

1. Sign into the owner's Netlify account on the free plan. Open [Netlify Drop](https://app.netlify.com/drop). Dropping files can make the site public immediately; it is not a private staging step.
2. Drag **only the generated `dist` folder** containing `index.html`, `_redirects`, `_headers` and assets. Do not drag the project root, `.env` files, `src`, `supabase`, `docs` or recovery artifacts. No paid domain is needed.
3. Record the actual assigned `*.netlify.app` HTTPS origin. If the URL was unavailable before the first owner-authorized upload, treat that upload as a bootstrap, not a verified launch: configure the origin/Auth callbacks, rebuild locally, and upload the refreshed `dist` to **the same project's Deploys dropzone**, not a new Drop project. Avoid announcing registration until genuine Auth checks pass.
4. Open and reload `/explore`, `/map`, an eligible `/places/<slug>`, both legal pages, `/auth/callback`, `/admin/recovery` and `/admin/accept-invite`. Verify direct-route HTTP behavior, HTTPS, images, RTL/mobile, guest/private guards, and Netlify's deployed `_headers` (including noindex). Local Vite preview does not emulate Netlify's response-header engine; CDN behavior still needs this check.
5. With a controlled test account and fresh emails, verify signup → confirmation, login/logout and forgot-password → same-profile reset, including expired/invalid link handling. Never use the primary Admin for password-changing tests. Confirm no image-less detail is accessible and no privacy-deletion submission UI exists.

## Verification and limits

Evidence: [build/artifact audit](validation/netlify-build.json), [current public-browser audit](validation/netlify-public-browser.json), [configuration/URL audit](validation/netlify-configuration.json). The artifact audit includes a SHA-256 file manifest; it contains no key values or session URLs.

Passed: Oxlint; asset validation (83 references / 48 originals); localization audit/model checks; public-image isolation fixtures; account/database/PKCE regressions; tourism/recommendation/discovery tests; SEO checks; static legal EN/AR responsive/keyboard/axe checks; premium Auth fixtures; production privacy-disabled checks; frontend/build credential scan. Browser fixtures simulate Auth and never write hosted accounts. Current public-media tests use real anonymous read/signing operations, 8 real image galleries, all 16 excluded searches and direct details, maps and recommendations, in EN desktop and AR mobile.

| Command/check actually run | Result |
| --- | --- |
| `npm run lint` | PASS, Oxlint |
| `npm run build:netlify`, then `npm run build` with the same safe flags | PASS, Vite 8.3.4; existing chunk-size advisory |
| `npm run test:netlify` | PASS, 6 artifact/configuration checks; 305-file credential/manifest audit |
| `npm run validate:assets` | PASS, 83 references / 48 originals |
| `npm run audit:localization`, `npm run test:localization` | PASS, no missing static translations; 6 model groups |
| `npm run test:public-images` | PASS, 7 deterministic groups using historical seven-place fixtures, distinct from fresh hosted counts |
| `npm run test:accounts` | PASS, 9 local database/model/PKCE groups |
| `npm run test:tourism` | PASS, 15 local groups |
| `npm run test:recommendations`, `npm run test:discoveries` | PASS, 11 and 10 groups |
| `node scripts/check-seo.mjs` | PASS, 7 groups |
| `node scripts/check-netlify-public.mjs` | PASS, 28 browser groups; fresh hosted read-only inventory 8/16, zero browser errors or attempted mutations |
| `node scripts/check-legal-browser.mjs` | PASS, 24 static legal layout/route/keyboard/axe groups, EN/AR at 1366/768/390/320 px |
| `node scripts/check-auth-premium.mjs` | PASS, 4 EN/AR desktop/mobile fixture scenarios, including Admin denial/login/recovery and accessibility |
| `node scripts/check-phase06-browser.mjs` | PASS, 11 fixture groups including 8 bilingual layouts and callback/recovery/account regressions |
| `node scripts/check-account-privacy-browser.mjs` | PASS, 4 EN/AR desktop/mobile production-unavailable checks, no password collection/submission |
| `node scripts/check-privacy-source-security.mjs` | PASS, 221 frontend/build files and handler logging-source check |
| `npm run preview -- --host 127.0.0.1 --port 4196 --strictPort` | PASS, local production preview; 12 directly opened routes and 4 local asset URLs returned HTTP 200 with expected content |

No TypeScript check applies: the existing project uses JavaScript/JSX and has no TypeScript compiler/configuration. No Docker/WSL, hosted destructive tests or real deletion integration were run. These selected regressions do not constitute a full security certification. Screenshots from the real anonymous media checks are in `artifacts/netlify/browser/`.

Initial HTML serves homepage metadata on SPA routes. Route-specific legal/destination metadata is applied after JavaScript: Netlify rewrites do not provide SSR/prerendered social previews or real per-route HTTP 404s. Social crawlers may show homepage defaults. The approved 1200×630 PNG is at `/assets/branding/unseen-jo-social-preview.png`; an absolute sharing-image URL requires the configured real origin and deployment.

**Release decision: technically Netlify-ready artifact; public launch still needs the separate recovery, production Auth and deployment checks documented here; static legal pages do not require an approval workflow.** No hosted writes or deployment were performed.

References: [Netlify manual deploys](https://docs.netlify.com/deploy/create-deploys/), [SPA rewrites](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/), [response headers](https://docs.netlify.com/manage/routing/headers/), [Supabase redirect rules](https://supabase.com/docs/guides/auth/redirect-urls), [Auth email variables](https://supabase.com/docs/guides/auth/auth-email-templates), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow).
