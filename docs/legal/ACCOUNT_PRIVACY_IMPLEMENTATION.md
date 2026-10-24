# Privacy & Account implementation

Phase 14 update: production builds now show only an unavailable notice, with no actionable data-export/deletion controls or password collection. The implementation is preserved for explicit `VITE_PRIVACY_QA=true` loopback Vite development fixtures only. See [Phase 14 final QA](../PHASE_14_FINAL_QA_REPORT.md). This supersedes any earlier description below suggesting the production profile can currently submit a request.

Security audit update, 23 October 2026: [PRIVACY_ACTIVATION_READINESS.md](./PRIVACY_ACTIVATION_READINESS.md) is the current activation decision and supersedes the original readiness assumptions below. New local hardening rejects Admin requests at creation, adds a last-Admin safety guard, uses explicit export field allowlists, binds frontend actions to verified identities and bounds Edge request parsing. Both privacy migrations remain undeployed; hosted activation is BLOCKED pending staging and owner workflow configuration.

Revision: 23 October 2026. Implemented locally, **not deployed**. No hosted data, account, password, permission, migration, or Edge Function was changed. Hosted inspection was read-only and returned schema/policy metadata, not user records.

## Experience

Authenticated users open `/profile` → **Privacy & Account**. English and Arabic follow the existing language switcher and direction. They can download a JSON application-record copy or confirm and submit a password-verified deletion request. Confirmation is unchecked by default; passwords are cleared after each attempt and are never persisted or logged by this feature. API errors never produce a pending/success claim. Retry is safe because only one open request can exist per account. Reloading the profile reads the owner’s request status.

Download scope: safe Auth identity fields (ID, email, creation date), profile, preferences, interest links, saves, visits, recommendation events, feedback, deletion-request records and avatar-file inventory. No credentials, access/refresh tokens, recovery links, image binaries, provider logs or backups are included. This is a scoped application export, not a claim to deliver every item held by every provider. The JSON is generated on demand and not uploaded to public Storage.

Deletion is deliberately **a request requiring manual authorized fulfillment**. The UI explicitly says the account still exists while pending/processing. There is no automatic completion, notification, appeal or deadline promise. Passwordless and MFA accounts fail closed and need a separate verified operator process; none is falsely claimed as available. Requests from active administrators can be recorded but fulfillment refuses them to protect Admin access; a separate reviewed procedure is required.

## Audit findings

Confirmed project URL: `https://dkhwwvoplhfjccvjegty.supabase.co`. Inspected hosted foreign keys, Storage ownership columns, and public/Storage policies through the reauthenticated project connector. Existing owner policies protect profiles/preferences/saves/history/visits; admin authorization uses database roles. Auth users cascade to profiles and roles, and profiles cascade to personal records. Editorial references are a mixture of SET NULL, CASCADE and restrictive foreign keys. Unexpected restrictions cause fulfillment to roll back, rather than deleting tourism content to work around them.

Supabase documents [Auth deletion and dependent storage](https://supabase.com/docs/guides/auth/managing-user-data) and [server-only administrative deletion](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser). Existing JWTs can remain valid until expiry. This implementation adds a restrictive avatar-insert policy requiring a live profile, preventing a deleted identity from creating orphan avatars with an old JWT. Other personal inserts retain their existing profile foreign keys. The final database function deletes the Auth row transactionally; hosted Auth session foreign keys cascade. No security policy is weakened.

A private parent-lock trigger also requires a live profile for avatar insertion/path changes, including service uploads. It locks the profile row to cover an upload waiting across final account deletion; it does not rely solely on an earlier visibility snapshot. Staging must verify the migration role can install the trigger on Storage’s objects table and validate Storage API behavior before activation.

## Server design and boundaries

- `uj_export_account_data()` is SECURITY INVOKER, has no target ID, filters every source by `auth.uid()` and retains RLS. Anonymous execution is revoked.
- `account_privacy_requests` has owner-only SELECT. Browser clients have no INSERT/UPDATE/DELETE grants. No public administrator-facing request queue was added; operators use trusted server tooling/Dashboard.
- Edge Function `account-privacy` validates the bearer token using Auth `getUser`, derives the account/email from that verified user, requires explicit confirmation and a freshly checked password, and rejects additional request keys including a target ID. It refuses verified MFA factors rather than bypassing them. Supabase password sign-in rate limits still apply. Its temporary verification session is signed out after handling; the existing browser/Admin sessions are not replaced.
- Only the Edge server uses the service-role secret to enqueue through `uj_request_account_deletion`. The secret uses the standard Supabase server environment, never a `VITE_` variable. Allowed website origins are explicit, with no wildcard CORS. No request/password/token logging. Responses use `no-store`; raw errors are not shown.
- `uj_fulfill_account_deletion(request_id)` is service-only, with PUBLIC/anon/authenticated execution revoked and a fixed empty search path. It resolves a pending request internally, blocks active Admins, locks role changes and Storage writes during the final check, refuses remaining owned objects (including legacy owner and avatar-path ownership), deletes Auth, then records completion in the same database transaction. A failure rolls back database changes and status. It does not delete Storage metadata directly.
- Auth/profile dependent rows cascade. Public destinations remain; SET NULL references/audit content may remain, while restrictive editorial references block deletion for manual investigation. The completed receipt retains request ID/timestamps/status but clears the account ID. That receipt still needs a justified retention policy.
- Storage and database cannot be one transaction. Operators must inspect and remove owned files through Storage API first, including abandoned/replaced avatars and all owned buckets. If cleanup fails or new files appear, final fulfillment refuses success. Partial Storage cleanup may already have removed files even if database fulfillment subsequently fails; communicate this honestly and retry carefully.

## Remaining activation steps — do not execute without a deployment instruction

1. Review and apply `supabase/migrations/20261022221123_account_privacy_requests.sql` to a disposable Supabase staging project first. The migration creates infrastructure only; it never invokes deletion.
2. Deploy `supabase/functions/account-privacy/` to that staging project. Set `PRIVACY_ALLOWED_ORIGINS` to exact approved origins separated by commas. Preserve existing redirect settings. Standard `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` remain server-only. Keep gateway JWT validation plus explicit handler `getUser` validation. Verify compatibility with the project’s JWT signing configuration in staging.
3. Verify actual Edge runtime, request submission and exports using a controlled staging identity. No real-account deletion was performed here; never use the primary Admin for destructive validation.
4. Assign a monitored operator workflow. Review each request and its identity evidence via trusted tooling. Establish an independent process for passwordless/MFA accounts and active/former editors. No contact address or delivery service is invented.
5. For an approved ordinary-user request, an authorized operator checks authoritative roles, dependent editorial references and any lawful retention obligation. Quiesce the account as appropriate, inventory Storage by `owner_id`/legacy `owner` and the account’s avatar folder, and remove approved owned files using Storage API. Never delete shared/public destination assets merely to satisfy a request. Recheck completion of each cleanup call.
6. Only after that review/cleanup, trusted server tooling or the privileged Supabase SQL Editor may call `select public.uj_fulfill_account_deletion('<reviewed request UUID>'::uuid);`. This is a destructive manual action, **not executed during this task**. Never invoke from frontend code or expose its service credential. Do not mark complete or notify completion unless the transaction returns true and follow-up verification confirms Auth/personal rows and owned files are gone. If a foreign key blocks deletion, investigate; do not cascade tourism records away.
7. Decide how the former user receives a verified completion receipt; the deleted account cannot read an owner-only status row. No completion email or full privacy support inbox is implemented.

## Exact implementation files

Created:

- `src/features/account/PrivacyAccount.jsx`
- `src/features/account/privacyLabels.js`
- `src/features/account/privacy.css`
- `supabase/migrations/20261022221123_account_privacy_requests.sql` (CLI-generated filename)
- `supabase/functions/account-privacy/handler.js`
- `supabase/functions/account-privacy/index.ts`
- `scripts/check-account-privacy.mjs`
- `scripts/check-account-privacy-browser.mjs`
- `docs/legal/ACCOUNT_PRIVACY_IMPLEMENTATION.md`

Modified:

- `src/pages/ProfilePage.jsx` — account section integration.
- `src/components/ui/FormField.jsx` — optional localized password visibility label; existing behavior preserved.
- `src/features/legal/content.js` — bilingual privacy process/retention disclosures, terms cross-reference and 23 October revision; review status retained.
- `supabase/tests/bootstrap.sql` — disposable service-role test contract.
- `scripts/check-phase06-browser.mjs` — fixture for the added owner-status read.
- `docs/legal/PRIVACY_POLICY_REVIEW.md`, `TERMS_OF_SERVICE_REVIEW.md`, `LEGAL_LAUNCH_CHECKLIST.md` — new workflow supersedes historical no-request findings; launch blockers retained.
- Generated evidence: `docs/validation/account-privacy-security.json`, `account-privacy-browser.json`, and existing regression evidence/artifacts.

## Launch blockers

Hosted installation is intentionally pending. The local UI gives an honest unavailable error until server dependencies are installed. Before launch, confirm operator identity/contact and legal review, lawful processing bases, a monitored request process and identity-verification alternatives, retention/deletion rules for receipt/logs/backups/audit data, vendor processing regions/contracts/transfers, completion communications and staging Edge verification. No retention duration, automatic legal compliance, complete backup erasure, or support contact is invented. Both legal documents remain drafts.

## Verification

Results: Oxlint passed without warnings; production build passed (existing chunk-size advisory); account database/model/callback regressions passed (9 groups); privacy security suite passed (6 groups); privacy browser suite passed (4 bilingual desktop/mobile groups, including open-form and pending-state axe checks); premium Auth browser regressions passed (4 groups); account-only browser regression passed (3 groups covering profile/save/logout/identity isolation and PKCE/recovery); localization audit found no missing static strings and localization tests passed. Legal-route browser regression also checks all paired paragraphs, metadata and bilingual layouts. These results do not constitute an actual hosted Edge-runtime or email-delivery test.

See `docs/validation/account-privacy-security.json` and `account-privacy-browser.json`. Tests use disposable PGlite accounts and mocked Auth/Storage responses, not real user data. The security suite exercises ACL/RLS isolation, target injection, idempotency, export scope, wrong identity/MFA/CORS denial, service failure, storage blocking, Admin protection, transactional status, dependent-record cascades, destination preservation and stale-token avatar denial. Browser checks cover both languages at desktop/mobile widths, JSON download, unchecked confirmation, error/retry, pending-not-deleted messaging and axe accessibility. Lint, production build and existing authentication regressions are run separately. Existing large-chunk build advisory remains.
