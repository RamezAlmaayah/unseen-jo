# Unseen Jo — authentication UI and email branding

Implemented directly in the existing application at `http://127.0.0.1:4184`. No application deployment, hosted Auth configuration change, account mutation, password change or tourism-content edit was performed.

## Screens and shared components

Redesigned public Login/Register, registration verification pending, confirmation resend, Forgot Password, Reset Password, password-update success, callback verification/success/error, expired/incomplete links and session-restoration failure. Redesigned Admin login, recovery request, invitation/password setup, password-update/sign-out confirmation, initialization and unauthorized-access states.

Reused `BrandLogo`, `FormField` (including visibility controls), `Button`, Motion for React, existing routes, localization, public/Admin Supabase clients and callback exchange helpers. New `AuthPresentation` components share the form frame, landscape panel and feedback states. Public and Admin session storage, refresh, logout and database-enforced role checks remain separate and intact.

The compact white/mint composition uses forest green, warm gold details, the existing landscape artwork, responsive form sizing and visible input focus. Login/Register still slide in one mounted shell with entered values retained. Exiting panels are inert. Reduced motion is respected. The delayed heading-focus handoff now preserves focus when a visitor has already entered a field, avoiding interference with typing or Enter submission.

Success screens distinguish email requested from email actually confirmed. Recovery/resend responses do not reveal account existence. A 60-second per-browser-tab cooldown prevents repeated email requests and survives reload; Supabase remains the server rate-limit authority. Existing persistent sessions are described honestly rather than adding a nonfunctional “Remember me” option. No new provider was added.

## Brand assets and email package

Actual symbol: `public/assets/figma/preferences/brand-logo.png`, with the existing shared wordmark. The visual panel uses the existing `public/assets/figma/landing/landscape-hero.png`.

Email-optimized symbol: `public/assets/branding/unseen-jo-email-logo-v1.png`, 112×106 PNG, 10,952 bytes, displayed at 56×53. It is a resized original, not a replacement logo. Reproduce with `python scripts/prepare-auth-brand-assets.py`.

`supabase/templates/auth/` contains **eight** email types: signup confirmation, recovery, invitation, magic link, email change, reauthentication, password-changed notification and email-changed notification. Each has English, Arabic RTL and bilingual HTML, subject and plain-text companion files. Generate with `node scripts/build-auth-emails.mjs`.

The delivered HTML uses tables, inline CSS, explicit backgrounds, a restrained 560px maximum width, branded CTA, security footer, meaningful image alt text and visible text branding when images are blocked. Action emails preserve `{{ .ConfirmationURL }}`; reauthentication uses `{{ .Token }}`; notifications use `{{ .SiteURL }}`. Email change uses the supported `{{ .NewEmail }}`. Bilingual defaults need no metadata-based routing or authorization. Optional templates do not enable new sign-in methods or notifications.

## Hosted integration status

**Templates deployed to Supabase: none.** The connector does not expose hosted Auth-config/template updates or binary Storage uploads, and no Management API credential is available in the process environment. Public Auth settings were read successfully: email signup enabled, confirmation required, social providers disabled. Hosted template contents, notification enablement, Site URL and redirect allowlist could not be inspected with the available capabilities. They were not changed.

**Logo hosting: pending.** Intended URL:

`https://dkhwwvoplhfjccvjegty.supabase.co/storage/v1/object/public/brand-assets/unseen-jo-email-logo-v1.png`

It currently returns **HTTP 400** because the dedicated branding bucket/object is absent. The templates are ready for that URL after upload; they are not yet ready for hosted use with a visible image. Do not expose either existing private bucket. The text wordmark and message remain readable without images.

Local `supabase/config.toml` now points to the branded action templates and documents the current 4184 development callbacks while preserving the previous development aliases. It was not pushed remotely. No production domain was invented. Notifications and SMTP settings were not enabled or changed.

## Verification and scope

- Nine disposable PostgreSQL/account test groups: owner isolation, role enforcement, safe redirects, callback scrubbing/idempotency, supported token formats, PKCE and missing-verifier behavior.
- Public account browser regressions: Login/Register sliding and preserved values, validation, signup pending, sign-in, logout, account isolation, verification success, reset success, invalid/expired callbacks, network failures and reduced-motion keyboard navigation. Uses real React/Supabase SDK with isolated HTTP fixtures.
- Nine Admin invitation/recovery groups: invalid links fail closed, fabricated session rejected by real hosted Auth, fragment/token-hash handling, reload, confirmation mismatch, password-save/local-sign-out fixture, PKCE exchange and ordinary-user denial. No real password was changed.
- Premium browser acceptance: incorrect credentials, show/hide password, Enter submission, focus preservation during the slide, cooldown/resend/reload behavior, Admin login/denial/recovery, English/Arabic desktop/mobile and axe accessibility. Successful Auth responses are fixtures.
- Responsive layout checks cover nine auth/callback states in both languages at 1366×768, 1280×720, 390×844 and 320×740. No horizontal overflow or clipped controls; laptop controls fit the tested viewport. Validation can increase height naturally.
- **48 email HTML renders**: eight types × three language variants × two widths. Supported placeholders, inline markup, logo rendering via the local asset, Arabic direction, mobile width, blocked images and a head-stripped/dark-preference preview checked. These are browser simulations, not actual Gmail/Outlook desktop certification or delivered-email tests.
- Oxlint, asset integrity, localization parity/audit and production build passed. Resource regeneration now preserves later account/discovery translations; an idempotency check confirms keys are retained. The existing large-bundle advisory remains.
- Genuine hosted anonymous checks confirm signup/confirmation settings and rejection of protected Admin RPCs. The security advisor still reports the existing disabled leaked-password-protection warning; no protection was weakened.

All **24 destinations and their publication states** are preserved. The full-row checksum is unchanged: `6fd52e310bb663a8f8a9fb58b108b802`. Existing RLS and private buckets remain intact. No real email delivery or controlled-account email round trip was tested because no connected test inbox/account was available.

Evidence: [premium UI](validation/auth-premium-browser.json), [account browser regressions](validation/phase06-browser-4191.json), [layout checks](validation/auth-sizing-premium-final-4191.json), [Admin callbacks](validation/admin-invitation-tests.json), [email previews](validation/auth-email-branding.json), [hosted inspection](validation/auth-hosted-inspection.json), [content preservation](validation/auth-branding-preservation.json). Screenshots: `artifacts/auth-branding/`, `artifacts/auth-sizing/premium-final-4191/` and `artifacts/phase06/`.

## Remaining manual actions

Follow [the exact Dashboard installation guide](../supabase/templates/auth/README.md): upload the branding PNG to the dedicated public branding bucket, verify anonymous HTTPS access, install the matching HTML/subjects and reopen them to verify saved values. Review the existing hosted Site URL and development callback allowlist without removing working entries. Install security notifications only where already enabled. Finally use a separate controlled account/inbox to verify genuine signup/recovery deliveries and the latest email links in the same browser profile and site origin; do not use the primary Admin for destructive tests.

No deployment was started.
