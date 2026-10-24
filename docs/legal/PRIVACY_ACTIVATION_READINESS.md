# Privacy activation readiness

Phase 14 update: unverified privacy controls are unavailable in production bundles. The source implementation remains available only for explicit loopback development QA; no hosted backend was activated. See [Phase 14 final QA](../PHASE_14_FINAL_QA_REPORT.md) for current release blockers and verification scope. Legal review warnings remain.

Audit date: **23 October 2026 (Asia/Amman)**. Project: `dkhwwvoplhfjccvjegty`.

**Decision: BLOCKED for hosted activation.** Local security defects have been corrected and isolated tests run, but no staging deployment or complete operating process has been verified. Nothing was deployed, no paid infrastructure was created, and no real account, password, destination or Storage object was changed/deleted. Hosted checks were SELECT-only metadata/aggregates; no password hashes, tokens, email addresses or user identifiers were extracted.

Status meanings: **PASS** = supported by the stated evidence within its scope; **FAIL** = a demonstrated gap; **BLOCKED** = prerequisite/owner action missing; **NOT VERIFIED** = insufficient access or no real-environment test. A local PASS does not imply hosted installation.

## Requirement classification

| Requirement | Status | Exact evidence and limit |
| --- | --- | --- |
| Export only caller’s records | PASS | `uj_export_account_data()` is SECURITY INVOKER, no target argument, explicit `auth.uid()` filtering and existing RLS. `check-account-privacy.mjs` exports as two identities and verifies the second has none of the first’s saves/history/requests. |
| No credentials/other-user data in exports | PASS | Explicit field allowlists added in hardening migration. A synthetic future `profiles.internal_secret` column is excluded. Export contains safe Auth identity fields only, no session/user metadata object. Browser checks verify mismatched profile identity produces no download. Image inventory contains paths, not bearer/signed URLs or binaries. |
| Frontend account-switch race | PASS | Fixed in `PrivacyAccount.jsx`: verified identity before and after export, returned profile ID must match; request uses a captured token verified against the mounted profile. The explicit Authorization header pins submission to that token. |
| Deletion requires secure identity proof | PASS | Handler validates bearer token using `getUser`, derives email/ID server-side, requires confirmation plus fresh password verification and same returned user ID; verified MFA factors fail closed. Passwordless/MFA alternative is BLOCKED below. |
| A user cannot target/delete another account | PASS | Request rejects extra body keys, no client-supplied target. Request/fulfillment RPCs revoke PUBLIC/anon/authenticated execution. Queue has owner-only SELECT, no browser mutation grants. Local permission and injection tests pass. |
| Ordinary workflow protects both current Admins | PASS | Read-only aggregate confirmed **2** active Admin identities. New request hardening rejects any current Admin; fulfillment already blocks all current Admins, regardless of count. Tests exercise two synthetic Admins. No real Admin credentials were used. Hosted privacy workflow is absent, not silently active. |
| Last Admin protection through privacy fulfillment | PASS | All Admins are rejected under a role-table lock, before Auth deletion. |
| Existing hosted last-Admin protection outside privacy | FAIL | Hosted role policies permit authorized Admin UPDATE/DELETE; only application audit trigger was found. No last-Admin safeguard was present. **No hosted permission/trigger change was made.** |
| Local last-Admin hardening | PASS | New private serialized count and triggers protect role demotion/removal, Auth-cascade deletion and role truncation. Local tests verify rollback, counter tampering denial and preservation of the last Admin. Atomic counter writes serialize competing changes; production concurrency behavior remains NOT VERIFIED. A database owner can deliberately disable triggers/change safety state; no application can promise protection against an unrestricted owner. |
| Service/secret keys absent from frontend | PASS | `check-privacy-source-security.mjs` scans frontend source and production JS/HTML/JSON for forbidden key references, secret-key values and embedded service-role JWTs. Only server `index.ts` reads the service key. Evidence JSON contains no key values. |
| No password/token logging by feature code | PASS | Handler has no console logging, bodies are never inserted into database records, generic errors only, no-store replies. Password is cleared in UI after every attempt. Temporary verification session signout is attempted in finally, including mismatched fresh identities. |
| Gateway/APM/provider logging configuration | NOT VERIFIED | Source inspection cannot establish whether external tooling records bodies/headers. Owner must confirm redaction and disable request-body capture for this endpoint. |
| Pending/failure never claims completion | PASS | UI pending/processing says account still exists; identity/service failure produces error. Fulfillment updates completion only in the same successful DB transaction as deletion. Browser failure/retry/pending tests and FK rollback tests pass. |
| Duplicate and retry safety | PASS | Partial unique index on open `user_id`, idempotent upsert returns the same request, completed receipt cannot trigger a second deletion. Concurrent real HTTP duplication still requires staging verification. |
| RLS and missing permissions | PASS | Anonymous export execute revoked; ordinary users cannot enqueue, mutate queue or fulfill; service-role execute checked. Hosted personal tables inspected have RLS enabled. Tests use actual local PostgreSQL ACL/RLS. |
| Foreign keys and deletion order | PASS | Metadata reviewed; local migrations replay and cascade tests cover Auth/profile/saves/visits/history, preservation of another identity and tourism records. An unexpected FK causes full database rollback and leaves request pending. Full managed Auth schema behavior remains NOT VERIFIED in real Supabase. |
| Storage/database atomicity | BLOCKED | There is **no cross-service transaction**. Storage must be inventoried/cleaned before final DB deletion; partially removed files cannot be rolled back by PostgreSQL. Manual recovery/journaling is required below. No automatic reliable Storage recovery worker is implemented. |
| Storage ownership and stale JWTs | PASS | Final check covers `owner_id`, legacy `owner`, and avatar-folder ownership, including abandoned avatars. Storage table lock protects the final check. Restrictive insert policy and parent-lock trigger prevent orphan avatar creation after profile deletion. Isolated tests pass; actual Storage API/concurrency tests are NOT VERIFIED. |
| Passwordless-user discovery | PASS | Aggregate: 3 accounts with a nonempty stored password, **1 without**, all 4 identity-provider rows are `email`; zero anonymous users. No hashes/identifiers retrieved. The no-password account might be an unactivated invitation rather than an active passwordless user; actual sign-in history is NOT VERIFIED. |
| Secure alternative identity design | PASS | Session-bound single-use email challenge and MFA design below; it does not accept metadata/email possession claims from the browser. Design only. |
| Alternative verification operational | BLOCKED | Current endpoint intentionally refuses unsupported verification. No challenge table, delivery flow or operator identity-verification channel is installed. Do not activate a universally available deletion request promise until resolved. |
| Isolated staging branch | BLOCKED | Scoped `list_branches` returned `[]`. No branch was created. |
| Separate staging project inventory | BLOCKED | CLI lacks a token, but subsequent read-only project lists through both connected accounts succeeded. The account containing Unseen Jo has only `dkhwwvoplhfjccvjegty`; the other account’s two projects are unrelated and cannot be treated as staging. No suitable staging project was identified in accessible inventory. An unconnected/private environment remains NOT VERIFIED; owner must identify one or approve a safe environment. |
| Hosted privacy installation | BLOCKED | Read-only `to_regclass('public.account_privacy_requests')` returned absent; scoped Edge inventory returned `functions: []`. Final read-only recheck still found 2 Admins and no privacy table. Neither migration nor function deployed during audit. |
| Request recipient, monitoring and responsibility | BLOCKED | No recipient, notification integration, assigned staff or automated monitor exists. Queue rows do not notify either Admin. Owner must assign monitored handling and escalation. |
| Fulfillment/receipt operation | BLOCKED | Service-only DB procedure exists locally; trusted operator must review, clean Storage, verify results and communicate completion independently. Deleted user cannot read owner-only request row. No completion delivery is implemented. |
| Failure handling/record retention | BLOCKED | DB failures remain pending and retryable; external Storage progress/incident journal, reviewed retention schedule and recovery accountability require owner configuration. Minimal completion receipt clears account ID but retains request ID/times/status; this is not an anonymity/legal-compliance guarantee. |
| Arabic/English/responsive/accessibility | PASS | Privacy browser suite: both languages at 1366/320 widths, download, mismatched identity, checkbox, password failure, retry, pending status, localized visibility controls and zero axe A/AA violations. |
| Existing authentication/Admin behavior | PASS | Local account SQL/model/callback regression and premium Auth/account browser fixtures. No real emails/password resets/sign-ins/deletions were tested. |
| Production build/lint/localization | PASS | Commands/results below. Existing Vite chunk-size advisory remains. |
| Edge runtime/gateway compatibility and real Auth/Storage integration | NOT VERIFIED | Node-injected handler tests and PGlite are not a Supabase Edge/Auth/Storage deployment. Stage runtime, JWT signing-key compatibility, Storage trigger permissions, privilege defaults and session cascades before approval. |
| Operator/legal readiness | BLOCKED | Legal identity/contact, legal review, processing bases, retention, rights-response arrangements and transfer/provider facts remain unconfirmed. Legal pages remain review drafts. |

## Defects fixed locally during this audit

1. Export could combine one profile’s identity fields with another session’s RPC response during an account change. Added pre/post identity and returned-profile checks; browser regression rejects mismatched data.
2. Deletion submission could pick up a different current SDK session. Captured and verified the token and passed it explicitly to the function; target is still derived only by the server.
3. `request.text()` checked size only after allocating the entire body. Stream reader now caps bytes at 2048, cancels oversize bodies and returns 400 for malformed/null/array payloads.
4. Fresh-session cleanup was skipped when reauthentication returned a mismatched identity. Moved validation inside cleanup’s try/finally.
5. Whole-row JSON export could silently add future sensitive columns. Added explicit column allowlists.
6. Admin requests could previously be queued even though fulfillment refused them. Request creation now rejects active Admins.
7. No general last-Admin safeguard existed. Added the separate, undeployed safety migration described below. This does not change who has Admin permissions; it prevents removing the final one through protected DML.

## Deletion integrity and recovery

**Database transaction:** resolve/lock reviewed request; serialize role changes; refuse Admin; lock Auth user and Storage metadata writes; refuse remaining owned objects; delete Auth user; cascade dependent private records; clear account ID and record completion. Unexpected FK/permission failures roll back database work and status. No client can call this routine.

**Dependency findings:** Auth identities/sessions/MFA/one-time tokens/authorizations/consents/credentials/recovery sets cascade; profiles and user-role membership cascade; preferences, saves, feedback, visits and history cascade from profile. Places’ creator/updater/verifier, image/review approvals and audit actors may SET NULL while retaining content. Translation editor/reviewer/feedback and prototype editor references can restrict deletion; quick drafts cascade. SCIM links may SET NULL. Review any additional/new dependency before fulfillment; never delete tourism records just to work around a constraint. Exports deliberately do not promise provider/Auth audit archives.

**Storage:** remove files with Storage API, never SQL metadata DELETE. Inventory all buckets by owner columns and all objects in the user’s avatar folder, not merely the currently linked avatar. Do not remove shared/public tourism content without verified rights. File removal can succeed even if later database deletion fails. Missing objects on retry are not proof that every cleanup call succeeded. A remaining object blocks DB fulfillment. Old JWTs remain cryptographically valid until expiry; live-profile checks/FKs reduce orphan risks but real concurrent-upload tests are still necessary.

**Required manual recovery runbook:** keep a restricted operator journal keyed by request ID (no passwords/tokens), reviewed ownership inventory, approved removals and per-object API results. Quiesce account access through supported Auth/session controls before cleanup; wait/check outstanding writes as needed. On partial failure, leave request pending/processing, record remaining objects and the error class, retry only verified remaining paths, then re-inventory. On FK failure, preserve surviving database records and escalate the dependency; do not claim erased files were restored. On ambiguous network timeout, inspect actual Auth/profile/receipt/Storage state before retry or notification. Backups/logs/legally retained material require separate review. Do not call the process fully atomic.

## Alternative identity verification — design only

The discovered no-password account is not modified. Do not assign/reset its password merely to make deletion easier.

For existing verified-email accounts, a future server endpoint should validate the current session with Auth, derive the verified email and user ID, reject Admins early and create a cryptographically random, short-lived challenge bound to **user ID, current session, deletion purpose and request nonce**. Send a fresh Supabase email OTP only if that mechanism is enabled, with account creation disabled. Do not accept a browser-supplied destination email. Store only a challenge/nonce hash, expiry, attempts and consumed state; use transactional consumption and rate limiting. Verification must obtain a fresh Auth-verified identity matching the initiating user, confirm the bound session/challenge/purpose, require explicit deletion confirmation and consume the challenge once. A prior normal sign-in link or a client-declared verification flag is not deletion authorization. Expiry/attempt limits and delivery settings require implementation and testing; no values are claimed configured here.

For MFA-enrolled accounts, require a fresh successful challenge of an already verified factor and verified AAL2, bound to the deletion challenge. Do not use email/password as a bypass. For OAuth identities, use a provider-supported fresh authentication flow only if configured and verifiable; otherwise use an independently reviewed operator process. Preserve PKCE browser/device constraints and existing callbacks; do not add an insecure callback branch. Missing factors/email or suspected compromise must fail closed and escalate through an owner-established verified channel. No such manual channel is published yet.

## Safe environment and activation procedure

No suitable staging environment was found in the two connected project inventories: the account containing this project exposes only the target project, and its development branch list is empty. Unrelated projects in the other account are not staging substitutes. An environment in an unconnected account cannot be ruled out. Do **not** use production as staging, clone production backups/users/Storage, or create a paid branch/project without approval.

1. Owner identifies an existing isolated project, or approves establishing one. Alternatively use Supabase CLI local stack with Docker and **fresh disposable volumes**, subject to local prerequisites. Never run a remote reset. Confirm the target reference is not `dkhwwvoplhfjccvjegty`; use staging-only keys and website origin. No secrets in docs/frontend.
2. On an **empty** disposable environment, replay every SQL migration in the exact order recorded in `docs/validation/privacy-staging-migrations.json`. Earlier migrations create `unseen_private`, profile/RLS/preferences/discovery tables, roles, Storage buckets and functions required by privacy; applying only the last two files to an empty database will fail. Use synthetic tourism fixtures only where necessary; no production data.
3. For a staging project already on the existing baseline, compare migration history first and apply these two missing files transactionally, in order:
   - `supabase/migrations/20261022221123_account_privacy_requests.sql`
   - `supabase/migrations/20261022225126_privacy_activation_hardening.sql`
   The latter locks the role table while initializing the private safety counter and installing triggers; check counter equals the count of Admin memberships. No actual deletion is invoked by either migration. Staging must verify managed-schema ownership/trigger permissions and perform schema-advisor review.
4. Prepare/deploy **only in that approved staging environment**: `supabase/functions/account-privacy/index.ts` plus `handler.js`. The pinned dependency is `@supabase/supabase-js@2.118.0`. Configure server-only URL/anon/service credentials and exact `PRIVACY_ALLOWED_ORIGINS`. Test gateway JWT behavior with the project’s signing configuration and explicit handler `getUser`; never disable authentication merely to make a test pass. Verify platform/APM body/authorization redaction and rate limits. Existing redirects remain intact.
5. Provision disposable synthetic identities A/B, two synthetic Admins, and an approved test inbox for passwordless/MFA tests. No primary Admin or real users. Verify owner-only exports across all tables and storage manifests; secret-field exclusion; anonymous/missing-grant rejection; foreign-target injection; invalid password; same-account reauthentication; request duplication/concurrency; MFA denial; both Admin denials; last-Admin demotion/delete/cascade/rollback and concurrent-removal scenarios.
6. Test Storage API failures before/after partial cleanup, concurrent uploads, legacy ownership, expired/revoked sessions, new FK blockers and ambiguous retries. If staging-deletion tests are later explicitly approved, delete **only disposable identities**, verify Auth sessions and all dependent private rows/owned files disappear, other users and destinations survive, completion receipt is correct, and no false success occurs. Until then, run transactional dry runs/fixtures without any real account deletion.
7. Assign named operators, queue-review frequency/escalation, private failure journal, retention basis, identity alternatives, recipient/contact, legal approval and completion communication. No current inbox receives requests automatically. Verify supported `pending → processing → completed` handling using trusted tooling; only the successful fulfillment transaction may mark completed.
8. Obtain a separate explicit production activation instruction after staging evidence and owner blockers are resolved. First verify the two production Admins remain active and the migration count matches; apply infrastructure changes with a reviewed rollback plan. Disabling the UI/Edge intake is a safe rollback for new requests; do not drop receipt data or undo successful erasure by restoring backups automatically. No production step was performed here.

After an approved installation, assigned operators can track pending work with this **read-only** query in trusted tooling; it was not run against a hosted privacy table because that table is absent:

```sql
select id, user_id, status, created_at
from public.account_privacy_requests
where status in ('pending', 'processing')
order by created_at, id;
```

Do not grant ordinary authenticated users a broad queue read to enable monitoring. Completion must be checked through the private receipt plus Auth/profile/dependency and Storage inventory verification; an empty queue alone is not proof of successful erasure.

## Evidence and tests

- `docs/validation/privacy-hosted-readonly-audit.json`: project/aggregate metadata findings, no user identifiers or credentials.
- `docs/validation/privacy-staging-migrations.json`: exact ordered migration manifest; prepared, not deployed.
- `docs/validation/account-privacy-security.json`: disposable PGlite and injected Edge tests; no hosted mutation.
- `docs/validation/account-privacy-browser.json`: bilingual desktop/mobile and mismatched-export browser checks with fixtures.
- `docs/validation/privacy-source-security.json`: frontend/build credential and handler logging source scan.
- Existing `phase06-unit-database.json`, `auth-premium-browser.json`, `phase06-browser-4195-account.json`: account/callback/Admin regression evidence.

Commands: `node scripts/check-account-privacy.mjs`, `npm run test:accounts`, `node scripts/check-account-privacy-browser.mjs`, `node scripts/check-privacy-source-security.mjs`, `node scripts/check-auth-premium.mjs`, `QA_ACCOUNT_ONLY=1 node scripts/check-phase06-browser.mjs`, `npm run audit:localization`, `npm run test:localization`, `npm run lint`, `npm run build`. Browser scripts used `QA_BASE_URL=http://127.0.0.1:4195` against a local production preview. Fixture results do not prove real delivery, Edge runtime behavior or hosted configuration.

| Executed check | Result |
| --- | --- |
| Privacy SQL/Edge security | PASS: 8 groups |
| Existing account SQL/model/callback suite | PASS: 9 groups |
| Privacy browser | PASS: 4 bilingual desktop/mobile groups, including mismatched export denial |
| Premium Auth/Admin browser | PASS: 4 groups |
| Account-only browser | PASS: 3 groups, profile/save/logout/isolation, PKCE and recovery |
| Credential/logging source scan | PASS: 205 frontend/build files; no forbidden server credentials detected |
| Localization audit | PASS: no missing static translations |
| Localization suite | PASS: 5 groups |
| Oxlint | PASS, no warnings |
| Production build | PASS; existing over-500-kB chunk advisory |

PGlite executes queries sequentially in this harness. Counter design removes the simple concurrent-count race by row-write serialization, but a true multi-connection/PostgreSQL isolation-level stress test is NOT VERIFIED and remains a staging gate. The audit did not call a hosted deletion function or test real credential delivery.

Official references reviewed: [Supabase user management](https://supabase.com/docs/guides/auth/managing-user-data), [Edge authentication](https://supabase.com/docs/guides/functions/auth), [passwordless email authentication](https://supabase.com/docs/guides/auth/auth-email-passwordless), and the Supabase changelog. The upcoming TLS-cipher retirement does not change this audit’s local implementation; provider runtime verification remains separate.

## Files changed by this audit

- `src/features/account/PrivacyAccount.jsx` — identity-bound export/submission and response validation.
- `supabase/functions/account-privacy/handler.js` — bounded parsing and cleanup paths.
- `supabase/migrations/20261022225126_privacy_activation_hardening.sql` — CLI-generated, undeployed Admin safeguards and explicit export fields.
- `scripts/check-account-privacy.mjs`, `scripts/check-account-privacy-browser.mjs` — expanded security/failure/race coverage.
- `scripts/check-privacy-source-security.mjs` — new boundary scan.
- This readiness report, implementation-report cross-reference and generated evidence/manifest above.

No legal review status or production setting was changed. Owner facts and legal approval remain required.
