# Production Auth settings and real acceptance plan

24 October 2026. **Prepared, not executed.** No real signup, email, password change, hosted setting or acceptance ledger was created. Use only a disposable owner-controlled account after explicit authorization. Never change either primary Admin password or role.

## Exact settings after the URL exists

Let `ORIGIN` mean the actual assigned `https://…netlify.app` origin, with no path/query/trailing slash. It is a substitution instruction, not a value to save. In this project's [Authentication → URL Configuration](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/auth/url-configuration):

| Setting | Exact value after replacing `ORIGIN` |
| --- | --- |
| Site URL | `ORIGIN` |
| Redirect URL | `ORIGIN/auth/callback` |
| Redirect URL, same path with query | `ORIGIN/auth/callback\?**` |
| Admin recovery redirect | `ORIGIN/admin/recovery` |
| Admin invitation redirect | `ORIGIN/admin/accept-invite` |

Keep the literal backslash in `\?`: Supabase's glob syntax uses it to match the literal query delimiter. The query suffix permits the existing `returnTo`, `flow` and SDK flow parameters without granting redirects to other site paths or hosts. Verify actual callback URLs match; signup normally supplies `/auth/callback?returnTo=%2Fprofile&flow=signup`, recovery uses `flow=recovery`, and Profile email change supplies the base callback. Preserve working development entries. Do not add `https://*.netlify.app/**` or broad production `/**` entries. [Official redirect syntax](https://supabase.com/docs/guides/auth/redirect-urls).

Keep email confirmation required; do not add providers. Actual recent public settings show signup/email enabled, confirmation required and Google disabled. Dashboard SMTP configuration itself remains **NOT VERIFIED**. Supabase's default SMTP only sends to authorized project-team addresses and has a low rate limit; it cannot establish delivery for unrestricted public signup. The owner needs an authorized production sender/custom SMTP (or an explicitly approved supported email-delivery integration), verified sender identity and acceptable recipient/volume limits. A free Netlify subdomain is valid for hosting; it does not grant control of `netlify.app` email/DNS or supply SMTP. Use existing owner-authorized sender infrastructure where possible; no paid purchase or new domain is required by this plan or automatically configured. If no usable sender is available, email-based public registration remains BLOCKED. [Official SMTP restrictions](https://supabase.com/docs/guides/auth/auth-smtp).

Owner: back up and reopen all eight saved hosted email subjects/HTML, comparing with [the full local templates](SUPABASE_EMAIL_COPY_PASTE_READY.md). Their live installation remains unverified. Keep `{{ .ConfirmationURL }}` for signup/recovery/invite/magic-link/email-change, `{{ .Token }}` for reauthentication, and `{{ .SiteURL }}` for notification links. Do not hardcode localhost or replace verification URLs with plain app links. Confirm security-notification switches separately. The public branded-logo PNG passed HTTP 200 in the preceding Netlify audit; recheck it in delivered messages. Disable email click-tracking that rewrites Auth links. Do not add ordinary recipients to the Supabase team to work around SMTP restrictions.

Codex can then set local `VITE_SITE_URL=ORIGIN` and make one final `npm run build:netlify`. Keep `VITE_LEGAL_CONTENT_SOURCE=static` and privacy/prototype flags false. Netlify Drop uploads contain build-time configuration; changing Dashboard environment values alone does not update this bundle.

## Signup issues that require a decision/fix

- **Current static mode permits signup regardless of legal review status.** `AuthPage.jsx` treats static legal content as ready, and `requireRegistrationLegal('static')` returns without checking approval. Current legal documents are drafts. Do not expose this as legally approved registration.
- **No acceptance checkbox, accepted-version record or server-side acceptance/availability rule exists.** Whether explicit assent/version evidence is needed must be decided by the owner/legal reviewer. If required, implement an unchecked validated assent control and a trusted persisted record of the exact static terms version/account/server timestamp, plus server enforcement of required eligibility/acceptance rules. User-editable metadata is not authoritative proof or authorization. The backend check/record must have a documented atomic relationship with the chosen signup or account-activation step, including unconfirmed emails, retries and abandoned signup.
- **A UI-only checkbox/pause cannot prevent direct Supabase signup.** Even the future managed-mode legal read is separate from Auth signup and can be bypassed through direct calls. Do not route a service-role key through the frontend as a workaround. A separately reviewed server-side design and authorized activation are required if backend enforcement is necessary; no new system is implemented in this documentation task.
- If unresolved, the owner may separately authorize disabling **Allow new users to sign up** in Auth settings, with matching truthful local UI. That is a temporary restricted release, **not unrestricted launch**; hiding the Register link alone is insufficient. Keep email confirmation enabled and preserve existing account access.
- Keep unverified privacy deletion disabled. The owner must still have a viable reviewed manual rights-handling process; a disabled control is not a waiver of privacy obligations.

## Real-world acceptance matrix

Use a controlled inbox **outside the Supabase organization/team**, not a customer or primary Admin. Record only case/result/time, final origin, redacted provider message ID/delivery timing and UI outcome. Never capture full callback URLs, passwords, session payloads or tokens in screenshots/reports. Owner authorizes the test account creation/reset first; no automatic cleanup/deletion is included.

| Case | Action | Required result |
| --- | --- | --- |
| Signup and legal rule | On the final HTTPS origin, read both finalized documents; submit valid new-account fields and the chosen legally required assent. Exercise the rejected/missing-assent case safely in isolation. | Correct validation; exactly one account/profile on success; actual required legal-version record if implemented. Current missing backend rule cannot be counted as passing. |
| Real external delivery | Submit signup for the controlled non-team inbox once. | Branded confirmation received within the owner's agreed delivery window, usable logo/button, correct site callback, no sandbox/team-only restriction. Receipt/delivery success proves more than an API success response. |
| Before confirmation | Attempt ordinary login with that unconfirmed disposable account. | Clear confirmation-required state; no privileged or falsely verified session. |
| Confirm once | Open the fresh email in the browser profile/origin that requested it. | Supabase confirms email; callback completes/scrubs credentials; correct regular-user return route and session. No Admin role. |
| Reuse/invalid/expired | Reopen consumed link; use a deliberately incomplete callback; let a disposable link expire according to actual configured expiry. | Verified/signed-in state or safe invalid/expired guidance as appropriate; no false success, raw errors or token disclosure. A bare callback must not create a session. Never log real link values. |
| Login/error/session | Login with disposable credentials, try one incorrect password, reload/close/reopen browser as applicable. | Correct success/error, Enter/loading behavior, expected remembered session and account isolation; no rate-limit probing. |
| Logout | Sign out, reload and revisit Profile/My Discoveries. | Previous private account data unavailable; correct guest/sign-in behavior; no silent reauthentication from an obsolete session. Guest saves may remain under existing rules. |
| Recovery request | From the final origin/profile request one new reset email; separately use an owner-approved unused address if needed. | Neutral account-existence wording, no false password-change success; controlled account receives branded email; resend cooldown/repeated-click guard works. |
| Recovery completion | Open latest link in the initiating profile; set a strong matching password on disposable account only. | PKCE exchange succeeds, tokens scrubbed, save completes; after logout old password fails and new password succeeds. Check user/session outcome against existing app behavior. |
| Wrong profile/site | Initiate a separate fresh disposable recovery flow; open in a fresh different browser profile (not the primary Admin's). | Clear same-browser/site guidance or safe invalid-link state; cannot set a password without valid recovery proof. Request another fresh link in the intended profile. |
| Access control | As guest and disposable regular user, open `/admin` and `/admin/legal`; both existing Admins separately sign in with their unchanged credentials when authorized. | Ordinary access denied; established Admin access preserved. Managed legal remains unactivated; do not treat a migration-needed screen as installed management. No role writes. |
| Netlify and localization | Directly open/reload callbacks, public legal pages, map and details; check EN desktop and AR mobile, links, deployed noindex/security headers and assets. | SPA fallback preserves queries/fragments; no broken assets/overflow; all 8 eligible places render and all 16 excluded details remain unavailable; deletion/export submission controls absent. |

PKCE verifier state belongs to the initiating browser profile/site origin. A localhost request cannot be completed using a different Netlify origin merely by editing its link; request a fresh email. [Official PKCE explanation](https://supabase.com/docs/guides/auth/sessions/pkce-flow). Real delivery/session cases are **NOT RUN**; the existing fixture/browser results remain valid within their documented scope.
