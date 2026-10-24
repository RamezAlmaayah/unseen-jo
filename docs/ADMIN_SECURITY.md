# Administrator authorization and first-admin approval

## Current refinement security checkpoint

The project remains `dkhwwvoplhfjccvjegty`. Read-only MCP inspection confirmed that `ramezmayaa@gmail.com` is email-confirmed and already has the administrator role for Auth UUID `914e63a8-a570-4de7-9a14-230d1a7853c8`. The role existed before this refinement; no role assignment was performed. Original Supabase connections, RLS policies, private buckets and Auth settings remain unchanged.

The protected six destinations' full-row digest is unchanged before/after authenticated acceptance: `721101e84b04dd3775a867137e33e214`. Six drafts, zero published destinations, zero images, zero private image objects, zero leftover acceptance destinations and one existing administrator were observed after cleanup. No remote content writes were executed by the agent. The user-confirmed authenticated runner created and deleted only its own isolated QA content. No role, policy, connection or invitation changes occurred.

The polished dashboard uses the same database authorization and caller-privilege RPCs. Charts, filters and row signals confer no authority. Publication readiness comes from `admin_publication_issues`; dirty form values cannot be published from the editor, and the database remains the enforcement boundary. Draft previews are authenticated private editorial views using short-lived signed image URLs, not public preview routes. Manual map selection does not mark coordinates verified. Image metadata edits reset rights approval.

The current admin account/session is not available through connected browser automation. No real token was requested, copied, extracted from browser files, synthesized or exported. Owner SQL inspection is distinguished from actual administrator JWT authorization. Automated successful UI/CRUD/Auth response tests use fixtures, while SQL/RLS tests use disposable Postgres with simulated platform contracts.

The `/admin/acceptance` runner performs real SDK operations only after the logged-in user starts and confirms the exact scope. It checks `getUser` and `admin_cms_status`, snapshots the protected six records, creates a UUID-named isolated draft, writes only that returned ID, uploads a synthetic raster into that ID's folder, records explicit test rights metadata, reads a private signed image, checks publication blockers and audit rows, then removes only its own linked metadata/orphans/draft. Cleanup rechecks the exact UUID, generated slug and draft status; audit history is retained. It never calls role assignment, content publication, review/rights approval or global logout. Reports contain check names/errors and, only when cleanup needs attention, the test UUID; they contain no passwords, access/refresh tokens or signed image URLs. Failure-scope tests cover successful cleanup, partial upload failure and rejection before creation. The user must keep the page open until cleanup finishes and perform the final real logout/incognito checks manually.

The administrator subsequently reported **All checks passed**. Dedicated read-only MCP queries corroborated two isolated runs under the existing administrator's UUID, including creation, edits, category association, image rights metadata and scoped deletion; final database/Storage counts and the protected content digest confirm cleanup and preservation. The latest audit interval was `2026-10-18 17:33:42–17:33:49 UTC`. Private image HTTP retrieval and publication-blocker results are user-run suite evidence, not agent-observed browser requests. Real logout, reload persistence and incognito acceptance remain unconfirmed. No actual publication was attempted.

Hosted anonymous enforcement passed, and isolated SQL tests continue to deny self-promotion and forged audit writes. Current advisors report **Leaked Password Protection Disabled**; this is an existing Auth configuration finding, not an RLS change introduced here. Review the [official password-security guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) and confirm any desired hosted Auth configuration change separately. It was not changed automatically.

No actual publication/public-page integration test was run because approved test tourism content and rights-cleared photography were not supplied. The existing six drafts must not be used as automatic publication fixtures. Phase 05 remains outside scope. Historical account-setup notes below describe earlier checkpoints.

## Invitation callback implementation

`/admin/accept-invite` now establishes a session using the official Supabase SDK and validates the user with Auth before displaying password setup. `/admin/recovery` handles the separate recovery flow, retaining PKCE for same-browser recovery. The default invitation uses session fragments; a custom template can use `token_hash` with `type=invite`. The SDK documentation explicitly notes that `inviteUserByEmail` does not support PKCE initiation. No email template or hosted Auth setting was changed.

Callback parameters are removed from browser history before requests; the app sends no referrer. Error parameters never become successful session evidence, and raw provider errors/tokens are not rendered or logged. Password confirmation and a server-validated, email-confirmed user are required. The user ID is rechecked before the password update. Successful setup signs out the current session and requires a fresh sign-in; failed sign-out can be retried without resubmitting the password. A verified account may resume setup after reload; that is an own-account credential operation, not CMS authorization.

Nine callback checks and five existing admin browser groups passed at the callback implementation checkpoint. Successful session/password responses were intercepted fixtures. A fabricated session was rejected by real hosted Auth. No invitation, real password update, role assignment or remote configuration change occurred during that implementation. The account has since been activated and user-run authenticated CMS acceptance passed as recorded above; invitation email delivery was not independently observed. Exact local Site URL/redirect entries are documented in `ADMIN_DASHBOARD.md`.

## Historical pre-activation database boundary — 18 October 2026

Dedicated MCP project: `dkhwwvoplhfjccvjegty`. The original Supabase connection is preserved. The existing `public.user_roles` table is empty. The intended email `ramezmayaa@gmail.com` has no matching Auth row at this checkpoint; no UUID, email confirmation, password or successful login can be claimed.

`unseen_private.is_admin()` requires all of:

- A non-null `auth.uid()`.
- A trusted `public.user_roles` row for that UUID with `role = 'admin'`.
- An `auth.sessions` row owned by that UUID matching the JWT `session_id`, whose `not_after` is null or in the future.

The helper uses `SECURITY DEFINER` with an empty fixed search path to read the protected lookup/session tables. Public CMS RPCs run with caller privileges and check this helper. No frontend email or user-editable metadata is used to establish administrator authority.

Role INSERT requires the helper to return true. Role UPDATE requires it in both USING and WITH CHECK. Role DELETE also requires it. An ordinary account can read its own role rows but cannot promote itself. This policy was inspected on the live database; normal-user mutation tests previously passed in disposable PostgreSQL. A genuine ordinary-user HTTP self-promotion rejection is still pending an issued non-admin session; policy inspection alone is not reported as that test.

## Narrow first-admin bootstrap after explicit approval

The first administrator cannot bootstrap through the ordinary user's Data API session because RLS correctly denies that operation. After verification and the user's explicit confirmation, use the trusted project-scoped administrative database channel to insert the approved UUID into the existing `public.user_roles` table. Keep all existing policies, grants and audit triggers intact. Do not add a registration endpoint, relax RLS or expose a secret key.

Before preparing the final executable assignment:

1. Requery `auth.users` case-insensitively for the intended email. Require exactly one row and a non-null `email_confirmed_at`; inspect actual login status and ensure the account is not banned/deleted.
2. Show the verified email and actual Auth UUID to the user. Ask for explicit approval to assign `admin` to precisely that UUID in this project. Do not treat the current request or selected email as approval of the final privileged change.
3. Only after approval, use a transaction that rechecks UUID, email and confirmation, then inserts only `(user_id, role)` for the approved UUID, with conflict handling to avoid duplicate assignments. The existing audit trigger records the role insert. `assigned_by` must identify a real authorized actor if supplied; never fabricate an actor UUID. A trusted administrative operation without an Auth JWT has a null audit actor, which must be documented.
4. Verify the exact resulting role row, its audit record and that `is_admin()` succeeds only with a genuine matching issued session. Verify normal users still cannot grant roles.

No executable UUID-specific assignment is prepared yet because no Auth UUID exists. Do not insert an email-derived or invented UUID.

## Email and session handling

The public Auth settings confirm email verification is required, but do not disclose hosted SMTP credentials, redirect allowlists or full Auth policy. The scoped MCP exposes no invitation/configuration operation. Do not create or modify `auth.users` directly via SQL, generate a password for the user, set `email_confirmed_at`, generate a verification token, or obtain a session through a database impersonation shortcut for live acceptance testing.

Use the official Auth invitation/signup/confirmation and password-setting flows. Passwords, email codes, magic links and session tokens stay out of chat and committed artifacts. Keep service-role/secret keys out of React. The separate browser admin client stores its Auth session under `unseen-jo-admin-auth`; public tourism reads remain anonymous.

## Content and test restrictions

Remote content remains six original drafts and no published or archived destinations. Only isolated acceptance records were created and cleaned up by the authorized user-run suite. Preserve existing RLS and private bucket restrictions. The current leaked-password-protection warning is recorded above; the earlier no-findings observation was historical. Signed media URLs may remain usable until expiry; expiry is five minutes in the CMS preview flow.

User-run authenticated CRUD and Storage acceptance passed, with audit and cleanup corroborated. Real logout, session persistence, incognito checks, publication and published-content public integration remain unconfirmed. Real publication requires explicit approval of a fully verified test destination with cleared media rights. Do not use any of the existing six drafts as an automatic publication test. Do not start Phase 05.
