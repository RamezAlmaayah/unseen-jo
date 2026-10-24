# Admin dashboard and first-account setup

## Current interactive CMS

The intended account is now email-confirmed and already has administrator access in project `dkhwwvoplhfjccvjegty`. The agent verified this with read-only MCP queries and made no role change. **Do not repeat the historical invitation setup below.** The existing six destination records remain unchanged drafts.

Dashboard: **http://127.0.0.1:4184/admin**. Places: `/admin/places`. Add Place: `/admin/places/new`. Acceptance: `/admin/acceptance`. Use the profile menu to sign out. Dates use English formatting and Amman time.

### Using the editor

1. Select **Create Place**, enter its story, a unique slug, reliable source and category assignments. Choose an active primary category.
2. Click the MapLibre picker to place a pin. Drag the pin or edit latitude/longitude manually; arrow keys on the pin move it in small steps. A pin is a location input, not proof of geographic verification. Save Draft to persist the fields.
3. Record the coordinate source, precision, notes and the explicit location/claims review against the saved draft. Unsaved edits disable saved-record review; saving content resets its review.
4. Upload JPEG, PNG or WebP up to 5 MiB to the saved draft. Add alt text, attribution, HTTPS source, rights basis and evidence. Save metadata before approving saved rights evidence. Changing metadata resets approval. Inspect private media in Preview or Media Library.
5. Use **Preview** to inspect current form values. Unsaved previews do not write content. Uploaded assets use five-minute signed URLs and remain private until the existing publication rules allow public access.
6. Work through **Publication checklist**, whose blockers are returned by the actual database validator. Save before publishing. **Publish destination** stays disabled for unsaved content or blockers, and requires a separate explicit confirmation. Only publish content with verified facts, locations and cleared media rights. Published content must return to draft before editing.

The overview charts/KPIs and review queue use real protected database reads. KPI cards open filtered views; chart tooltips and expandable tables explain current counts. Categories may overlap, and completeness tasks overlap; their totals must not be interpreted as a percentage. No analytics trends are invented.

Search filters after 250ms and is stored in the URL. Category/status/sort filters and pagination remain available. Saved changes refresh the current data and later dashboard views without a page reload. Use **Add Category** in Categories. Media rights and audit history have dedicated pages. The sidebar collapses on desktop, becomes compact on tablet, and opens as a keyboard-accessible drawer on mobile.

### Genuine authenticated acceptance — passed by user-run checks

On 18 October 2026, the administrator reported **All checks passed** from the isolated authenticated runner. Dedicated MCP inspection corroborated two runs under the actual administrator UUID, including draft edits, coordinates, categories, image licensing metadata and complete cleanup. Six original drafts remain unchanged; no acceptance records, images or private image objects remain. Nothing was published and no roles changed. The agent did not directly control the authenticated browser or receive its downloaded JSON report.

For an optional rerun, use your own authenticated browser and never send passwords, tokens, verification links or browser storage:

1. Open **http://127.0.0.1:4184/admin/acceptance**.
2. Choose **Run isolated authenticated checks** and confirm the exact scope shown in the dialog. This creates one private synthetic draft and one owned synthetic PNG, tests actual SDK operations, then deletes only that run's records/files. The original six drafts, roles and publication state are preserved; audit records remain. Keep the page open until cleanup finishes.
3. Review the outcome and **Download credential-free report**. If cleanup fails, retain the reported test UUID and error; do not delete unrelated records. The automated runner never publishes content or approves image rights.
4. Reload the dashboard and confirm your session persists and counts agree with six drafts after cleanup. Open an original draft to inspect the picker and preview **without saving**. Check the new form if you want to exercise manual location entry without touching an original record.
5. Use profile → **Sign out**, reopen `/admin/places` and verify sign-in is required. In an incognito window, check protected routes and confirm the original drafts are absent from Explore.

The user-run all-passed result covers actual authenticated CRUD/Storage behavior; audit and cleanup are independently corroborated. Steps 4–5 (real session persistence, logout and incognito checks) remain unconfirmed, because the runner does not log out or exercise a new browser session. Fixture tests for those guards passed. Actual publication/public integration requires a separately approved, fully verified test destination.

### Tests and screenshots

Run `npm run test:admin:refinement`, `npm run test:admin:runner`, `npm run test:admin`, `npm run test:admin:browser`, `npm run test:admin:invitation`, `npm run test:admin:hosted`, and `npm run validate`. The browser checks reuse the existing external temporary Playwright/Axe installation. The refinement suite expects the local app on port 4184. Screenshot fixtures are synthetic; screenshot files are real browser renders under `screenshots/phase04-final/`. See [PHASE_04_REPORT.md](PHASE_04_REPORT.md) for evidence and limitations.

Current security advisors warn that leaked-password protection is disabled. No Auth settings were changed; see [ADMIN_SECURITY.md](ADMIN_SECURITY.md).

## Historical pre-activation checkpoint — 18 October 2026

Project: `dkhwwvoplhfjccvjegty`. Intended first administrator: `ramezmayaa@gmail.com`.

The dedicated `supabase_unseen_jo` MCP returned the exact project's API URL and successfully queried Auth and authorization state. The original Supabase connection was not edited or removed. A case-insensitive query of `auth.users` returned no account for the intended email. No duplicate account, password, role assignment or verification bypass was created.

Hosted `/auth/v1/settings` returned HTTP 200: email authentication enabled, signup enabled, email autoconfirm disabled, anonymous authentication disabled. Local `supabase/config.toml` is not evidence of the hosted SMTP or redirect configuration.

**Email delivery: not attempted.** The connected tools do not expose Auth invitations or full hosted Auth/SMTP configuration. No management token or server-side Auth administrator credential is configured in the execution environment. No connected browser was available, and creating an in-app browser returned `Browser is not available: iab`. Do not interpret this as an SMTP delivery failure: no delivery request was made, and the SMTP provider/status is unknown.

**Account activation and live login: not verified.** There is no user ID to approve yet. The requested live authenticated acceptance suite is pending the user completing the official invitation/signup workflow and separately approving promotion of the verified user ID.

## Historical invitation handoff — completed, do not repeat

1. Open the official project's [Auth users dashboard](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/auth/users).
2. Configure the local invitation URLs as specified below. Invitation acceptance uses `/admin/accept-invite`; `/admin/recovery` is reserved for password recovery. Do not mix these routes.
3. Inspect [Auth email settings](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/auth/templates) and SMTP configuration. Supabase's default email service restricts recipients; configure an authorized sender if necessary. Do not paste SMTP passwords or service-role keys into chat or frontend code.
4. Search for the intended email again before creating anything. If absent, use **Invite user** for `ramezmayaa@gmail.com`. Do not use an auto-confirmed account or manually mark email as verified. If the dashboard cannot specify a suitable invitation redirect, finish configuring the official invitation/password-setup flow before sending.
5. Complete the emailed verification/invitation and choose the password privately. If delivery fails, report the displayed error without forwarding verification links, codes or tokens.
6. Tell the agent when verification/password setup is complete. It must query Auth again, show the actual verified email and UUID, and request explicit approval before assigning any administrator role. Email selection alone is not that approval.

## Local access

### Exact hosted URL settings for this local invitation setup

In the project's [URL configuration](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty/auth/url-configuration), use:

| Setting | Exact value |
| --- | --- |
| Site URL (default invitation destination) | `http://127.0.0.1:4184/admin/accept-invite` |
| Redirect URLs: invitation callback | `http://127.0.0.1:4184/admin/accept-invite` |
| Redirect URLs: recovery callback | `http://127.0.0.1:4184/admin/recovery` |

Retain existing Redirect URL entries; add these exact entries without wildcards. No hosted settings or local Supabase config were changed by the agent. The Site URL intentionally points to invitation acceptance for this local setup: dashboard invitations without an explicit `redirectTo` fall back to Site URL. `/admin`, `/admin/login` and the public homepage do not consume invitation credentials. Do not use `localhost` interchangeably with `127.0.0.1`; browser storage and redirect matching depend on the origin.

For the default **Invite user** email template, retain the official `{{ .ConfirmationURL }}` link. Supabase verifies that link and redirects the browser to the callback with session credentials in the fragment. If using a trusted server's `inviteUserByEmail` later, its `options.redirectTo` must also be the invitation callback above. The frontend has no invitation-sending endpoint and contains no administrator API key. Custom templates using `token_hash` are also supported on this callback with `type=invite`, but are not required or changed here.

These are local development settings. Keep the Vite server running and open the email on this computer, because `127.0.0.1` points to the device opening the link. If the hosted project already has an active production Site URL, retain that production value and use an explicit invitation `redirectTo` instead; do not redirect production traffic to a local machine. The agent cannot read or verify the hosted redirect allowlist through the current scoped MCP.

### Callback behavior and verification

`/admin/accept-invite` accepts standard invitation fragments through the official SDK's `setSession`, then calls `getUser` against Supabase Auth and requires a confirmed email before showing password setup. It does not check admin roles at this step, since new invitees are ordinary users. `/admin/recovery` accepts standard recovery fragments, custom recovery token hashes, and same-browser PKCE recovery codes. The admin client retains PKCE for app-initiated recovery; callback consumption is explicit rather than automatic to support standard invitations, which do not support PKCE initiation.

Credentials and errors are removed from the address bar before Auth requests. Referrer policy is `no-referrer`. Invalid/expired links show a generic error without a password form. A verified existing session can resume setup after refreshing the cleaned URL. The password form requires at least 12 characters and matching confirmation; Supabase enforces the hosted password policy. Submission revalidates the account, calls `updateUser({ password })`, clears password fields, signs out the current session and directs the user to sign in. No role is granted by these operations.

`npm run test:admin:invitation` passed nine grouped checks: real local routes, real hosted rejection of a fabricated session, fragment acceptance/session persistence, confirmed-password update/sign-out, one-time token-hash exchange, expired/type-mismatched failures, recovery code handling, real SDK PKCE recovery using intercepted HTTP, and continued non-admin denial. Successful Auth/session/password responses are fixtures; this is not a claim that a genuine invitation email was delivered or accepted. Five existing admin browser groups plus lint, asset integrity and production build also passed after the change. Evidence: `validation/admin-invitation-tests.json`.

Opening the callback directly without a valid email link or existing verified session is expected to show an invalid-link error. A successful real invitation remains pending your separately authorized invitation and private password setup. No invitation was sent and no role or remote configuration was changed during this callback implementation.

Dashboard: **http://127.0.0.1:4184/admin**. Login: **http://127.0.0.1:4184/admin/login**. The existing local Vite process served the dashboard route with HTTP 200 during this setup checkpoint. These URLs work only while the local server is running.

To restart at the exact port, run `npm run dev -- --host 127.0.0.1 --port 4184 --strictPort` from the project directory.

## Acceptance testing after approval

Use the real verified account and its issued session to test login, persistence, guarded routes, statistics, six existing drafts, isolated draft creation/editing, category assignment, private media upload, rights evidence, audit records and logout. Credentials must remain private. Use a user-controlled browser session; never request the password in chat.

The current editor provides numeric latitude/longitude fields. A MapLibre coordinate picker and a dedicated unpublished destination preview were not implemented in the previous delivery; they must be implemented and tested before claiming the entire requested Task 4 acceptance list passes.

Subsequent Phase 04L evidence for the now-implemented coordinate picker, unpublished bilingual preview and Arabic workspace is documented in [PHASE_04L_LOCALIZATION_REPORT.md](PHASE_04L_LOCALIZATION_REPORT.md). Select Arabic/English in the workspace header. English source and Arabic content have independent fields/saves; Arabic review is separate from source, image and publication approval. Language switching never starts the private media importer. Refer to that report for current checks and limitations rather than treating this earlier checkpoint as the final state.

No existing draft may be published automatically. A real publication/public integration test requires separately approved, fully verified test content and cleared image rights. Until then, Home/Explore/map/Details publication acceptance remains pending. Preserve RLS, private Storage and the existing content.

Prior fixture and disposable database tests are documented in `PHASE_04_REPORT.md`; they do not prove real authenticated acceptance. Full final validation and regression suites are deferred at this user-intervention checkpoint. The repository uses Oxlint (`npm run lint`), not ESLint; do not report ESLint as executed.
