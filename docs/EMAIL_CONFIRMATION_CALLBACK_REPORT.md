# Email confirmation callback investigation

20 October 2026 · project `dkhwwvoplhfjccvjegty`

## Actual failure

The acceptance signup was initiated in a temporary automation browser. The owner opened its confirmation email in their normal browser. Supabase successfully confirmed the ordinary test user's email, then redirected to the correct local callback. That browser did not hold the original PKCE verifier under `unseen-jo-user-auth`.

The installed SDK raises `AuthPKCECodeVerifierMissingError`, code `pkce_code_verifier_not_found`, before making a token exchange request. An actual-SDK reproduction with empty verifier storage produced that exact code and **zero network requests**. The callback previously mapped this condition to a generic account-service/connection error. That message incorrectly implied the email confirmation itself had failed.

Read-only hosted inspection after the owner's report found the test account confirmed and assigned only `user`. No Auth confirmation flag, password, role or user record was manually altered to manufacture success. The owner Admin's complete role-row fingerprint remains unchanged.

Auth-log aggregates for the original verification interval show verification events and no `/token` exchange events. Only aggregate classifications were retrieved; raw log URLs, IP addresses, tokens and confirmation links were not printed. This supports the locally failing code exchange diagnosis. The owner's browser network/console was not directly observable because no browser connection was available.

## Origin and configuration

Public settings from the correct project's real `/auth/v1/settings` report email signup enabled, confirmation required and Google disabled. The owner actually arrived at `http://127.0.0.1:4184/auth/callback`, so that redirect was honored in this attempt. There is no observed redirect to another project or to `localhost`.

Full management allowlist inspection was attempted read-only with the CLI config-diff command, but CLI management authentication was unavailable. The dedicated MCP refresh was also unavailable; the original Supabase connector supplied project/account/log verification. No redirect, provider, Admin callback or email-template setting was overwritten.

`localhost` and `127.0.0.1` also have separate browser storage. Switching hostname, port, profile or device can produce the same missing-verifier condition. Moving a verifier between browsers would defeat the intended browser binding and is not part of this fix. [Supabase PKCE requirements](https://supabase.com/docs/guides/auth/sessions/pkce-flow).

## Exact fix

- `callback.js` now recognizes the missing-verifier result and returns a safe `signin_required` outcome. It does not invent a session or claim the address is confirmed without verification.
- The callback shows **Finish signing in**, explains the browser mismatch and offers normal password sign-in, a fresh confirmation request or recovery. The specific test address is known confirmed from the hosted audit; an anonymous callback does not expose an account-status lookup.
- `AuthPage` supports `mode=confirmation` with official `auth.resend({type:'signup', ...})`. The installed SDK generates a fresh verifier/challenge in the current browser. Responses remain enumeration-safe and instruct users to use the latest link in the same browser/site origin.
- Optional `sb_flow_id` is captured before URL scrubbing and passed explicitly to `exchangeCodeForSession`. This prevents future overlapping flows from accidentally selecting the most recent legacy verifier; it is an additional compatibility correction, not the observed cross-browser cause.
- Supported token-hash types and applicable fragment flows are handled explicitly. Admin invitations remain on their existing separate route.
- Recovery authorization comes from the verified exchange/type, not merely a `flow=recovery` query label.
- Expired/used links, invalid/cancelled links, missing verifier and connection errors are distinguished. Raw provider descriptions are never rendered.
- Reloading an already scrubbed callback safely recognizes a verified existing session or explains that the email details are no longer on the page.
- StrictMode consumes one callback once; a later different callback can still be processed.

## Tests and genuine status

Real SDK/browser fixtures cover same-browser signup PKCE exchange, missing-verifier/no-token-request behavior, supported token hashes, fragments, callback refresh, recovery reset, invalid links and URL scrubbing. Unit checks cover explicit flow selection and reject unsupported invitation handling on the public callback.

Genuine email delivery and confirmation occurred. Subsequent genuine hosted password login, profile persistence, saved-place persistence and preference RPC saving passed. The initial genuine signup callback **failed**; that historical result is retained.

On 20 October 2026 (Asia/Amman), the owner confirmed: **“Recovery callback and sign-in worked.”** This records successful genuine same-browser recovery/callback acceptance as reported by the owner, separately from agent-observed automation. A read-only hosted check confirmed the test email remains verified, its role remains `user`, all six destinations remain published, and the Admin role fingerprint is unchanged. [Acceptance evidence](validation/phase06-owner-callback-acceptance.json).

The timestamp comparison between the account's last sign-in and latest recovery request did not independently corroborate a later password login. It is retained in the evidence rather than treated as proof or disproof of the owner's browser result. A fresh same-browser signup-confirmation callback was not separately retested; recovery success does not rewrite the original signup failure.

The temporary runner later stopped on its outdated assumption that a denied `/admin` route must redirect to `/admin/login`; the existing application renders the Admin sign-in shell inline. The harness is corrected, the raw result is retained, and no genuine Admin/logout acceptance is fabricated from it.

## Owner acceptance completed

The requested private recovery callback and sign-in check is accepted on the owner's confirmation. Passwords, links, verifiers and browser credentials remained private. A fresh signup-confirmation round trip remains separate additional coverage; it is not required to repeat the successful recovery check.

The animated interface, Admin authentication, RLS, email verification setting, tourism content, publication states and Storage controls remain preserved. No Phase 07 work was started.
