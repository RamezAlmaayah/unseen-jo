# Legal Pages Management — owner activation guide

**24 October 2026 draft-only update:** local static legal copy now includes owner-supplied individual-operator/contact details. The immutable guarded SQL still embeds the earlier version-1 drafts; it has NOT been changed or executed. Do not expect it to import the revised wording. Keep static mode and reconcile/review the seed and activation artifacts before any future managed activation. See [the draft owner review](LEGAL_OPERATOR_DRAFT_OWNER_REVIEW.md).

Prepared: **24 October 2026 (Asia/Amman)**. Project: **`dkhwwvoplhfjccvjegty`**.

**Status: PREPARED; NOT ACTIVATED.** No hosted migration, document import, approval, account/role change, environment setting or deployment was executed. This work audits and prepares the existing feature; it does not rebuild the editor.

## Exact files

| Purpose | File |
| --- | --- |
| Original migration — unchanged | `supabase/migrations/20261023213831_legal_pages_management.sql` |
| Ready-to-paste, transactional Dashboard installation | `docs/legal/activation/LEGAL_PAGES_MANAGEMENT_INSTALL.sql` |
| Read-only preflight SQL | `supabase/tests/legal_activation_preflight.sql` |
| Read-only post-install verification SQL | `supabase/tests/legal_activation_verify.sql` |
| Recovery copies, hashes and hosted metadata | `artifacts/legal-activation/20261024/` |
| Local preparation evidence | `docs/validation/legal-activation-preparation.json` |
| Hosted-baseline security/lifecycle test evidence | `docs/validation/legal-activation-hosted-baseline.json` |
| Existing implementation and complete feature inventory | `docs/legal/LEGAL_PAGES_MANAGEMENT.md` |

Original migration SHA-256:

```text
f23e8fb24ce0912933db5b0b8c1d6e494f5346b2812164574e888470db9257c3
```

The installation file contains the unchanged original migration between labelled markers, inside one transaction. It checks for existing legal objects/functions/history, missing permissions and changes to the audited Admin-check definitions. It rejects an unexpected or approved initial seed, uses transaction-local timeouts and commits only after its checks pass. **This is a write script for the owner to execute explicitly, not a script the agent has run against Supabase.**

## What was verified on hosted Supabase

Read-only inspection at `2026-10-23 22:22:45 UTC`; final consistency check at `2026-10-23 22:31:33 UTC` (24 October in Jordan):

- PostgreSQL 17.11; the intended project was confirmed through its connected Supabase account.
- All three legal tables, both new index names and the new legal functions are absent. The legal migration is not recorded. No existing hosted managed legal revision was found to overwrite.
- The private Admin predicate exists and requires a real Auth user, a trusted `public.user_roles` Admin assignment, a matching JWT `session_id` in `auth.sessions`, and a non-expired session. It does not trust editable user metadata.
- `authenticated` already has private-schema usage and execution rights for the existing Admin predicate/status functions. The required UUID function and Auth UUID/session columns exist.
- Exactly **two Admin memberships**, both linked to existing Auth identities. Their fingerprints match before/after the audit. No account password, token, Auth identity row or session credential was exported.
- Exactly **24 destinations, all Published**, with unchanged ID/slug/status fingerprint `d4b1f41baae1d7e285b97056ffdc6077` across the audit. No destination content was changed.
- Development and production environment resolution both remain **static (default)**. No `.env` file was edited.

The project-specific `supabase_unseen_jo` connector failed OAuth refresh with `Failed to parse server response`. Read-only inspection succeeded through the separate connected Supabase app account **Ramez**, which contains this exact project. This was not an alternative privileged write path; no hosted writes were attempted.

### Migration-history drift — do not run a general push

Hosted history contains **17 migrations**. **13 existing migration names have hosted timestamps different from the corresponding local filenames.** The exact mapping is in `legal-activation-preparation.json`; the first example is hosted `20261019130504_phase04l_place_translations` versus local `20261019125402_phase04l_place_translations.sql`.

The two locally prepared account-privacy migrations are not in hosted history and are **not dependencies of legal management**. Do not apply them for this task. Do not run `supabase db push`, reset the hosted database, rename old migrations, mark all pending migrations applied, or change grants to work around errors. A future general migration workflow needs its own history reconciliation.

For compatibility testing, the saved **actual hosted migration statements**, not name-only guesses or all pending local migrations, were replayed in disposable PostgreSQL. Current hosted Admin function definitions were restored into that fixture before the guarded legal install was tested. No hosted account rows or memberships entered the fixture; both were asserted empty before synthetic test identities were created.

## Backup and recovery scope

The ignored, local recovery folder contains:

- `files/`: byte-for-byte copies of the existing static legal content/labels/seed/model, page/loading implementation, environment example, original migration and preflight query.
- `initial-legal-content.json`: complete preserved English and Arabic seed documents.
- `hosted-preflight.json`: existing dependency definitions, constraints, policies, ACLs, migration IDs, Admin identity fingerprints and destination inventory fingerprint.
- `hosted-migrations.json`: the 17 existing migration definitions for reproducible compatibility testing.
- `hosted-final-check.json`: read-only consistency results.
- `manifest.json`: SHA-256 hashes and sizes for recovery source files and metadata/seed snapshots. Every copied source file was read back and its hash checked. The preparation script refuses to replace a different existing recovery copy.

**This is a scoped legal-content/source recovery pack and schema/dependency snapshot, not a complete hosted database, Auth or Storage backup. No full hosted restore point or restore drill was verified.** Keep this folder private and retain a second secure copy outside the working directory before execution.

Access limitation verified during preparation: the enabled Supabase connector exposes no backup-management tool, and the browser connection returned `apps: []` and `browsers: []`. Consequently no authenticated Dashboard backup listing was available to inspect. This does not mean backups are absent; their availability and recoverability remain unverified. No password/token was requested and no backup service or paid infrastructure was created.

Because managed tables do not yet exist and this migration adds new objects only, there are no existing managed legal rows to dump. Static pages remain intact. Before running the write script, the owner must separately confirm a current recoverable hosted backup and its recovery process. Supabase documents available backups under **Database → Backups**; availability depends on the project's plan. Do not purchase/enable backup services or install Docker/WSL for this task. If no existing recovery option is available, stop before migration execution and arrange an authorized backup process. A database backup does not itself include Storage object bytes. [Supabase backup documentation](https://supabase.com/docs/guides/platform/backups).

## Exact owner Dashboard actions

### 1. Confirm target and recovery

1. Open [this project](https://supabase.com/dashboard/project/dkhwwvoplhfjccvjegty). Confirm the project reference, not just its display name.
2. Open **Database → Backups**. Confirm the available recovery point and how the owner would restore it. Record the timestamp/location privately. Do not click Restore as a test.
3. Preserve the local recovery folder and a secure second copy. Resolve the full-backup checkpoint above before any migration execution.
4. Keep `VITE_LEGAL_CONTENT_SOURCE` unset or `static`. Leave the existing public legal pages, Auth settings, users, roles, destination data and private-schema exposure settings unchanged.

### 2. Recheck immediately before installation

1. Open **SQL Editor → New query**, using the intended primary database and the owner's normal `postgres` role.
2. Paste the entire `supabase/tests/legal_activation_preflight.sql` and click **Run**. This query is read only.
3. Compare it with `hosted-preflight.json`: legal objects/functions must still be absent; the two Admin identities and trusted predicate must be intact; required schema permissions/columns must remain present. If anything changed, stop and refresh the audit/backup. Do not grant extra permissions or overwrite partial installation objects.

### 3. Install only this migration

1. Open a separate **New query** named `Unseen Jo — initialize managed legal drafts`.
2. Paste the **entire** `docs/legal/activation/LEGAL_PAGES_MANAGEMENT_INSTALL.sql`. Do not also paste the original migration a second time.
3. Confirm the project reference again. Review that the file starts with the manual-execution warning, includes `BEGIN;`, and ends with `COMMIT;`.
4. Only when the owner explicitly chooses to initialize the system, click **Run** once.
5. Expected result: `privacy` version 1 and `terms` version 1, each with `approved_at = NULL` and `revoked_at = NULL`. No document is automatically approved or published.
6. On any error, stop. Run `ROLLBACK;` in that SQL session if it remains in a failed transaction. Do not execute fragments, remove guards, add privileges or rerun over existing legal tables. The complete transaction must succeed as a unit.

The script's audited Admin-function fingerprints are a deliberate stop on drift, not a reason to bypass its checks. It was tested locally to reject a second installation without losing the first installation's contents.

### 4. Verify initialization

1. In another read-only query, run `supabase/tests/legal_activation_verify.sql`.
2. Expect two initial revisions: Privacy **12 English + 12 Arabic sections**, Terms **14 + 14**; version 1; all four review flags false; zero approval events and zero publicly readable revisions.
3. Verify RLS enabled on all three tables; seven policies; five public legal RPCs with `security_definer = false`, `anon_execute = false`, `authenticated_execute = true`. Authenticated function execution alone is not Admin authorization: the existing predicate and RLS still enforce it.
4. Confirm two Admin identities and all 24 existing destination IDs/slugs/statuses are unchanged. Table Editor/SQL Editor running as `postgres` is not proof of regular-user access isolation.
5. Save the owner’s initialization results with the recovery record. Do not expose private drafts by changing policies or adding `unseen_private` to the Data API.

### 5. Record only the migration that actually ran

Dashboard SQL execution does not automatically make local CLI history agree with the hosted schema. After successful initialization and verification, an owner with existing authorized CLI access can register **only** this version using the documented history-repair command:

```powershell
npm run supabase -- migration repair 20261023213831 --status applied --project-ref dkhwwvoplhfjccvjegty
```

This command is provided for later explicit owner execution; **it was not run**. It records history, not schema DDL, and must never be used to claim an unexecuted migration ran. The installed CLI help confirms these options. Use the owner's established secure authentication; never paste passwords/tokens into chat or command arguments. Resolving the older 13 timestamp mismatches is separate work. Do not follow the repair with a general push. [Supabase migration workflow](https://supabase.com/docs/guides/deployment/database-migrations).

### 6. Review and approve through Admin

1. Run the existing local application normally and sign in through its existing Admin login. Open **Admin → Legal Pages Management**, route **`/admin/legal`**. Keep public managed mode off during preparation.
2. Each of the two legitimate Admins must verify their own access using their own signed-in browser session. Do not share credentials, tokens or a copied session. Roles were checked read only; their actual hosted editing sessions cannot be verified by the executor before installation.
3. Review both English and Arabic language tabs, titles, introductions and every section. Use **Save draft** and **Preview**; neither action publishes content. Do not insert dummy or misleading legal text into a hosted revision just to exercise buttons.
4. Fill in only confirmed business/legal facts. Check owner-review flags only when supported. **Approve & publish** requires an explicit confirmation and publishes the complete saved bilingual revision. The database records actor/time. This is the owner's editorial approval, not external legal certification.
5. A new saved draft must leave the approved public revision unchanged. **Revoke approval** falls back to the newest remaining approved version; with none, managed pages become unavailable and application registration pauses. **Restore as new draft** copies an older version; a separate approval is required.
6. Approve both documents only when the owner is ready to make their contents public. Do not automatically tick review flags or remove review warnings. Approved revision rows are publicly readable under RLS even while the website still displays its static migration pages.

The full destructive lifecycle (including revoking the last approval) was tested on disposable local fixtures. Real Admin approve/revoke/restore actions are **pending explicit owner execution**; do not revoke real public terms just to manufacture a test result. Before managed mode is enabled, the owner can verify necessary hosted lifecycle behavior using genuine, substantively acceptable revisions, knowing that approval itself makes them publicly readable.

### 7. Enable managed mode locally first

There is **no Supabase Dashboard toggle for a Vite build-time variable**. In the existing local `.env.local` (or the owner's existing Vite environment file), set only:

```dotenv
VITE_LEGAL_CONTENT_SOURCE=supabase
```

Restart the existing Vite development server so the value is reloaded. Do not change Supabase URL/key values. The agent did not edit this setting or restart the owner's application. Static legal source files remain in the project as the preserved migration path; managed mode never substitutes an unapproved static draft for a missing approval.

Before enabling, both documents must have a suitable current approval. Otherwise managed routes deliberately show unavailable and registration remains paused. Test `/privacy-policy` and `/terms-of-service` in English and Arabic, guest and ordinary-user sessions. The page must match the highest-version non-revoked approval, including the contents anchors and review caveats. Draft/revoked revision IDs must not return content to ordinary users through the established public/user client. The Admin route must remain denied to an ordinary account.

Verify registration’s links/current versions, disabled state on unavailable documents and fresh availability check before signup. Verify existing login/recovery/PKCE continue working. A later production frontend environment change and rebuild/release require separate authorization. **Do not deploy now.**

## Registration acceptance limitation

The application does **not** currently persist a terms-acceptance ledger or historical accepted version. It keeps legal links before registration and, in managed mode, requires both approved documents to be available, with a fresh check before email signup or registration-mode OAuth. No unavailable/unapproved version is recorded as accepted because there is no acceptance recording mechanism.

This is an **application availability gate**, not a newly installed server-side Supabase Auth signup/consent hook. Direct Auth API signup is not additionally gated, and the legal read and subsequent Auth signup are not one atomic transaction. If the owner requires legally recorded, server-enforced version acceptance, that remains a separate launch requirement; do not describe the existing feature as supplying it or claim retrospective records. Do not treat terms acceptance as unrelated processing consent.

## Approval workflow and outstanding legal information

Initial import is prepared and verified locally only. The migration does not supply or approve missing operator/contact/retention facts.

| Document | Prepared import | Hosted import now | Approval now |
| --- | --- | --- | --- |
| Privacy Policy | v1; complete EN/AR; 12 synchronized sections; existing text preserved | Not installed | None |
| Terms of Service | v1; complete EN/AR; 14 synchronized sections; existing text preserved | Not installed | None |

Both remain legal-review drafts until owner decisions and qualified review are complete. Still needed: legal operator/controller identity and address; verified privacy/legal contact; request-handling responsibility and response arrangements; justified retention/deletion schedules; actual provider/processing regions and transfer safeguards; children's eligibility arrangements; qualified review under applicable Jordanian law. Prepared privacy deletion fulfillment remains inactive and must not be described as operational. Editorial publication approval cannot substitute for these factual confirmations or legal review.

## Results and activation blockers

| Requirement | Result | Evidence/limit |
| --- | --- | --- |
| Current hosted dependency/schema review | PASS | Read-only catalog, permissions and active-session Admin-predicate audit; legal objects absent |
| Existing two Admin identities preserved | PASS (read-only structure) | Two trusted memberships with Auth identities; before/after fingerprints identical; no role/account writes |
| Existing destinations preserved | PASS | 24 Published; same ID/slug/status fingerprint before/after |
| Scoped content recovery backup | PASS | Manifest hashes and readback; private recovery folder |
| Complete hosted backup/restore readiness | NOT VERIFIED | Owner must confirm a recovery point/process before execution |
| Exact seed parity and no automatic approval | PASS locally | SQL seed JSON equals both current source documents; v1 drafts, flags false, no approval events |
| Hosted-history compatibility and RLS/lifecycle | PASS locally — 15 groups | Actual 17 hosted migrations/current predicate plus guarded legal installation in disposable PGlite; synthetic identities only |
| Existing all-local database regression | PASS — 15 groups | Default `node scripts/check-legal-management-database.mjs`; includes separately prepared privacy migrations only in the disposable fixture, never hosted activation |
| Guarded Dashboard install / verification SQL | PASS locally | Single transaction, dependency fingerprints, unapproved seed checks, repeat-install refusal and read-only verification SQL |
| Both real Admins perform hosted mutations | PENDING OWNER | Cannot truthfully test before installing/using the owner's explicit approval workflow |
| Real ordinary-user/public RLS after activation | PENDING OWNER | Local guest/ordinary/Admin isolation passes; new hosted objects do not exist yet |
| Managed-mode public pages/registration | PASS local prior browser evidence; hosted not enabled | Existing 17-group compiled fixture suite; current environment stays static |
| Model/localization | PASS — 6 groups | `npm run test:legal-management`, current source |
| Lint | PASS | `npm run lint`, zero warnings |
| Production build | PASS | `npm run build`; `artifacts/legal-activation/20261024/build.txt`; existing >500 kB application/map chunk warning remains |
| Production/legal release | NOT AUTHORIZED / NOT CERTIFIED | No deployment; owner/legal facts and any required acceptance workflow remain outstanding |

Previous compiled browser/auth/legal regression evidence remains in the implementation report. It was not presented as real hosted testing. This preparation did not change frontend feature code, the original migration, legal content, roles or Auth settings; only activation/test/documentation artifacts were added/updated. Docker and WSL were neither installed nor required.

Files added for this preparation: this guide, `docs/legal/activation/LEGAL_PAGES_MANAGEMENT_INSTALL.sql`, `supabase/tests/legal_activation_preflight.sql`, `supabase/tests/legal_activation_verify.sql`, and `scripts/prepare-legal-activation.mjs`. Updated: `scripts/check-legal-management-database.mjs` (optional actual hosted-history fixture and seed/installation guards) and the activation addendum in `docs/legal/LEGAL_PAGES_MANAGEMENT.md`. Evidence: `docs/validation/legal-activation-preparation.json`, `legal-activation-hosted-baseline.json`, `legal-activation-status.json`, and the private recovery/build artifacts. No frontend feature or original migration file was modified.

**Owner action checkpoints:** confirm recoverable hosted backup → run the single guarded migration explicitly → verify unapproved import/RLS → verify each real Admin session and ordinary-user access → explicitly approve suitable bilingual documents → enable managed mode locally and verify → consider a separately authorized production release only after remaining launch decisions.
