# Local privacy integration report

Date: **23 October 2026 — Asia/Amman**.

**Outcome: BLOCKED for real Supabase integration; NOT production-ready.** An isolated workspace and guarded test runner are prepared, but a real Supabase stack could not start. Docker/Podman are unavailable and Windows reports WSL is not installed. The CLI returned `DockerLifecycleInspectError` with `docker: command not found (podman also not found)`. This session is not elevated. No hosted connector was used for this task, no hosted migration/function was deployed, and no real user, password, destination or Storage object was changed.

PGlite/fixture results below are useful security regressions, **not** a replacement for Supabase Auth, Storage, Edge runtime or multi-connection PostgreSQL testing.

## Environment inspected

| Item | Result |
| --- | --- |
| Supabase CLI | Available, version 2.121.0; local Node wrapper `node_modules/supabase/dist/supabase.js` |
| Docker / Podman | Not on PATH; standard all-user and per-user Docker locations checked, no installation found |
| Windows backend | `wsl --status`: Windows Subsystem for Linux is not installed |
| Administrator session | False; enabling Windows features/kernel and any required reboot cannot be completed in this session |
| Native Supabase fallback | Official native runtime guidance does not offer a Windows-native substitute for this full stack |
| Existing migrations | 19 copied in lexical migration order, each SHA-256 recorded; includes both privacy migrations and last-Admin hardening |
| Edge Function | `account-privacy/index.ts` and `handler.js` copied; **not served or deployed** |
| Production linkage | No production `.temp`, project-ref, root `.env`, credentials, seed content, users, backups or Storage copied |

Official setup references: [Supabase local CLI](https://supabase.com/docs/guides/local-development/cli/getting-started), [Docker on Windows](https://docs.docker.com/desktop/setup/install/windows-install/). No installer, paid service or Windows feature change was initiated.

## Prepared isolation

Workspace: `.local-privacy/` (ignored by Git). Independent project ID: `unseen-jo-privacy-integration`.

- API `http://127.0.0.1:55431`; database 55432; shadow DB 55430; mail capture 55434; Edge inspector 55438. Studio and analytics are disabled.
- No production seed content. Only schema/function migrations are copied. The local Auth configuration enables disposable email accounts and TOTP testing; production Auth configuration is untouched.
- `isolation.json` records project/API identity and migration hashes. A linked project reference, unexpected old migration, unmarked pre-existing workspace or mismatched snapshot is refused.
- CLI wrapper permits only local start/status. Link, push, reset, deploy and arbitrary flags are rejected. The separate local Edge serve mode uses the fixed workdir/function/env file.
- Hosted Supabase credentials and database-related environment variables are removed from child environments. Docker is pinned to the local Windows named pipe (or Unix socket on supported hosts), ignoring remote Docker contexts. No credentials are printed or written to reports.
- Live runner requires exact API origin, Docker project label and a disposable database marker. It refuses a first run if Auth/tourism data already exists. Prior/interrupted accounts cause refusal rather than silently reusing an unknown population. Test emails are random `example.invalid` addresses and passwords are generated in memory.
- API redirects are disabled. Alternate ports, production URLs, credential-bearing URLs and hosted targets are rejected. The runner does not read the application `.env`.

These guards passed standalone tests. Actual CLI port binding, Docker labels, status JSON shape, managed-schema permissions and Edge execution are **not verified** without the runtime. Before starting a future stack, restrict exposed ports to the local machine using supported Docker/OS firewall settings; no network-level isolation was measured here.

## Test results

| Requirement / check | Status | Evidence |
| --- | --- | --- |
| Separate local Supabase startup | BLOCKED | `docs/validation/local-privacy-stack.json`: Docker lifecycle error; no containers started |
| Apply 19 migrations to real local Supabase | BLOCKED | Prepared snapshot only. All-migration PGlite privacy/account replays pass; managed Auth/Storage permissions remain unverified |
| Create real local password/passwordless/Admin identities | BLOCKED | Runner definitions prepared, no Auth service available; no real/local Supabase identities claimed created |
| Privacy creation, own-data export, request RLS, identity denial, duplicates | PASS — isolated fixtures/PGlite | 8 privacy security groups plus bilingual browser tests; not actual HTTP integration |
| Admin and last-Admin protection | PASS — PGlite | Two synthetic Admins denied ordinary requests; final Admin role/Auth removal and counter tampering fail closed |
| Actual Auth identity verification / session behavior | BLOCKED | Requires real local Auth/Edge; no account/password tested against production |
| Actual Storage uploads, removal and ownership | BLOCKED | API calls prepared, not executed; metadata-only PGlite tests cannot establish file erasure |
| Partial Storage failure / DB failure after cleanup | PASS — simulated DB contract; real integration BLOCKED | Remaining metadata blocks fulfillment; injected FK failure rolls back DB work/status; no claim of cross-service atomicity |
| Interrupted HTTP/runtime operations and concurrent requests/uploads | NOT VERIFIED | Fault/retry contract tested locally; real network interruption, multi-connection isolation and upload/delete races require runtime |
| Isolation safeguards | PASS | `check-local-privacy-guards.mjs`: fixed workspace, URL/port guard, CLI allowlist, stripped hosted credentials, local Docker target |
| Frontend credential boundary / source logging | PASS | 205 source/build files scanned; no service credentials detected; handler has no password/token logging |
| Oxlint | PASS | `npm run lint`, no warnings |
| Production build | PASS | `npm run build`; existing over-500-kB chunk advisory remains |
| Assets / localization audit | PASS | 83 asset references, 48 originals; no missing static translations |
| Fixture browser suites | PASS | Privacy 4 groups; premium Auth 4; account-only 3; legal pages 24; SEO 16; invitation 9 (final run fully intercepted) |
| Broad offline regression run | FAIL overall | 10 of 13 selected suites pass; 3 legacy suites fail as detailed below |
| Passwordless/MFA deletion verification | BLOCKED | Secure design exists; operational alternative is not implemented, so the endpoint fails closed |

`docs/validation/local-privacy-offline-regressions.json` lists every selected suite and its exit status. Private test output is under ignored `artifacts/local-privacy/`. Hosted test scripts were deliberately excluded. The entire repository’s browser/media/hosted suite was **not** certified green; only the fixture-based browser suites listed in the completion evidence were executed. Supabase integration remains blocked even if every fixture passes.

Exception found and corrected: the existing invitation script contained an embedded hosted `/auth/v1/user` negative probe, despite being primarily a local fixture suite. Its initial run rejected a fabricated invalid token; no real credentials or account mutation were used. It now intercepts that denial locally by default; genuine hosted probes require explicit `QA_ALLOW_HOSTED_NEGATIVE=1`. The final rerun used fixtures only. This report does not claim zero hosted HTTP traffic during the initial regression discovery run.

### Regression failures discovered

1. `check-phase04.mjs`: asserts at least three publication issues and later requires an approved cover before publication. Those assertions predate `20261022173255_simple_destination_status.sql`, which intentionally removed editorial approval gates. The first failing assertion is `issues.length >= 3`. No application restriction was reintroduced to satisfy an obsolete test.
2. `check-localization-database.mjs`: generates its test fixture from the same Phase 04 script and fails at that same assertion before its translation checks can complete. The downstream translation checks are not claimed passed.
3. `check-phase08.mjs`: its freshness assertion expects a prepared tourism package and all source/image evidence to be fresh at the current wall clock. They are expired. The initial failure was obscured by an unsettled `db.close()` before PGlite startup; adding `await db.waitReady` now exposes the real expired-evidence assertion. No evidence timestamp, destination, license claim or freshness protection was changed to force a pass. This test still fails and blocks broad Final QA until its fixture clock/expectations and actual evidence requirements are reviewed.

Passing offline suites: foundation/database (55 checks), tourism (15 groups), maps, recommendations, accounts, personal discoveries, global search, localization, privacy security, and SEO. The failure list must be resolved before claiming all application regressions pass.

## Prepared real-stack test runner

`scripts/check-local-privacy-integration.mjs` is **prepared but not integration-validated**. Its current smoke sequence is:

1. Verify project/container/API guards and empty disposable identity population.
2. Require an unauthenticated Edge probe to return 401 before creating identities.
3. Create two password users, one no-password identity and two Admins; no passwords/keys in output.
4. Exercise wrong password, injected target, verified request, parallel duplicate requests, export, another user’s queue access and denied fulfillment.
5. Upload two synthetic PNGs, reject fulfillment while files remain, delete one via Storage API and verify that partial cleanup does not complete the request.
6. Remove the second file, introduce a local FK blocker, verify database rollback, remove the disposable blocker and retry fulfillment. Verify Auth/profile removal, completed-retry denial and stale-token avatar-upload denial.
7. Reject both Admins; remove one synthetic Admin membership and verify the last cannot be removed.

The runner leaves disposable survivors for inspection; it never automatically resets a database. If interrupted or rerun after accounts exist, it refuses destructive reuse. A failed run needs reviewed cleanup **of that exact local project only** before starting from a fresh fixture population. It is not a production deletion job or recovery worker. More detailed relationship, OTP, MFA, JWT-expiry and concurrency tests must be added/executed once the real stack is available; a smoke PASS alone will not satisfy the full matrix.

## Passwordless and MFA status

No real identity was changed to acquire a password. A no-password test identity is defined for the future local stack; its creation and actual sign-in have not occurred.

The current deletion endpoint accepts fresh password proof only and refuses verified MFA factors. For passwordless accounts, implement and test a server-generated single-use deletion challenge bound to verified user ID, initiating session, deletion purpose and nonce. Deliver a fresh OTP to the server-derived verified email with account creation disabled. Enforce expiry/attempt limits and transactional consumption, then verify the resulting Auth identity matches the initiating user. Existing session access or a browser-declared email-verification flag alone is insufficient.

For MFA accounts, require a fresh challenge of an existing verified factor and verified AAL2, bound to the deletion challenge. Do not downgrade to password/email or use Admin override for convenience. The isolated config enables TOTP for future tests only. Expired/reused OTP, wrong session, mismatched identity, missing factors and missing delivery must fail closed. Verify PKCE callbacks and same-browser recovery requirements independently. A monitored manually verified alternative is also not currently operational.

## Non-atomic cleanup and recovery

Storage API removal and PostgreSQL deletion are **not atomic together**. A successful file removal remains removed if the later DB transaction fails. Do not claim restoration or complete erasure based only on a request status.

Maintain a restricted per-request inventory and cleanup journal, record per-file Storage outcomes, quiesce user writes using supported Auth/session controls, and retry only verified owned objects. Re-inventory before DB fulfillment. On SQL/FK failure, leave request pending/processing and investigate rather than deleting destination/editorial data. On a timeout, inspect actual Auth/profile/receipt/file state before retry or completion notice. Backups/provider logs require separate retention decisions. The current manual process is not an automated recovery guarantee.

## Resume safely after the machine prerequisite is resolved

The owner/system administrator must make a supported local Linux-container runtime available and configure required Windows virtualization/WSL support, including any needed restart. This is an OS prerequisite, not approval to use production or paid staging. An existing approved development machine with Docker can also run this repository after installing its dependencies.

From the repository root:

```powershell
node scripts/local-privacy-environment.mjs prepare
node scripts/check-local-privacy-guards.mjs
node scripts/local-privacy-environment.mjs start
```

Only after startup succeeds, serve the local function in a separate terminal:

```powershell
node scripts/local-privacy-environment.mjs serve
```

Then run the guarded smoke sequence:

```powershell
node scripts/check-local-privacy-integration.mjs
```

Do not run `supabase link`, remote reset, database push or production function deployment. Do not paste CLI keys/status output into this report. Review/test the prepared runner against the actual installed CLI’s local status format and Docker labels; it intentionally refuses unexpected formats. Local service startup may download images; no hosted database is required. Keep both original and privacy migrations in their recorded order.

## Required production activation steps and owner decisions

Production activation is **not authorized by this task** and remains blocked until:

- Real local Auth/Storage/Edge/database matrix completes, including concurrency/interruption, passwordless/MFA alternative, managed-schema privileges, real file cleanup, FK/session cascades and retry behavior.
- The three legacy regression failures are resolved without restoring editorial approval requirements or falsely renewing tourism evidence; broader Final QA completes.
- A named, monitored operator workflow, request notifications/escalation, private failure journal, lawful retention, verified contact and completion communication are approved. Queue insertion currently notifies nobody automatically.
- Operator identity, legal contact, lawful processing grounds, retention/deletion boundaries, provider/transfer facts and both languages receive owner/legal review. Legal pages remain drafts.
- A separately approved deployment plan applies `20261022221123_account_privacy_requests.sql` then `20261022225126_privacy_activation_hardening.sql` to the correct hosted baseline, verifies both production Admins and last-Admin safeguards, deploys `account-privacy` with server-only secrets/exact origins, and verifies gateway JWT behavior and log redaction. No step was performed here.

## Files created/changed in this task

- `.gitignore`: exclude `.local-privacy/`.
- `scripts/local-privacy-environment.mjs`: prepare/start/serve isolated local configuration and snapshots.
- `scripts/check-local-privacy-integration.mjs`: guarded real-stack smoke runner, currently BLOCKED.
- `scripts/check-local-privacy-guards.mjs`: executable isolation assertions.
- `scripts/run-local-offline-regressions.mjs`: explicit offline-safe suite selection and result capture.
- `scripts/check-phase08.mjs`: wait for disposable database startup so an early assertion is reported correctly.
- `scripts/check-admin-invitation.mjs`: hosted negative probe is now explicit opt-in; default local runs intercept it.
- This report; `.local-privacy/` ignored workspace; `docs/validation/local-privacy-stack.json`, `local-privacy-integration.json`, `local-privacy-offline-regressions.json`; regenerated existing fixture evidence/artifacts.

No application feature, destination status, Auth permission or hosted record was altered to make tests pass.
