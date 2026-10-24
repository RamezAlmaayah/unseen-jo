# Pre-activation decision

**24 October 2026 - project `dkhwwvoplhfjccvjegty` - ACTIVATION BLOCKED.**

| Check | Result | Finding |
| --- | --- | --- |
| Backup | **BLOCKED** | Full hosted backup existence/recoverability is **unconfirmed, not proven absent**. The connector has no backup-management tool and no Dashboard browser tab is connected. The scoped recovery pack is legal source/seed/dependency material, not a full database/Auth backup. |
| Legal migration | **PASS - technical safety only** | Current dependencies/permissions match the guarded SQL; legal objects/history remain absent and both Admin identities remain intact. No destructive top-level operations, user/role changes or unexpected overwrites. Admin-only writes use the existing trusted role/active-session check; drafts are private. **Execution remains blocked by backup readiness.** |
| Destination publication consistency | **BLOCKED** | Hosted: **24 Published, 0 Draft, 0 Archived**. All 17 originally targeted destinations remain Published. Anonymous Data API reads still return all 24. |

## Publication discrepancy

The old **7 visible / 17 awaiting archival** split is stale: **Umm Al-Jimal (`umm-al-jimal`) now has an approved, public/signable image**. The current local repository admits **8 image-eligible destinations** with 14 public image records and filters out **16**. This is frontend repository filtering, not hosted archival. A deployed frontend was not inspected; image-byte health and usage rights were not re-certified.

Owner action: refresh image/rights checks and reconcile the intended inventory before using the existing authorized **Admin > Places** archival workflow in a separate execution. Do not blindly archive the old 17-item list. No destination changed during this check.

Evidence: fresh hosted SELECTs at **15:55 UTC**, anonymous catalog at **15:57 UTC**, 24 October. Per-destination results: `artifacts/pre-activation/20261024/anonymous-catalog.json`.

## Backup and recovery checkpoint

In this project's Dashboard, open **Database > Backups**. Confirm a completed backup or valid PITR restore point; record timestamp/timezone, database/Auth/schema scope, expiry, restore permissions and acceptable data-loss/downtime window. Confirm a validated recovery procedure or an approved isolated restore validation. **Do not test Restore on production.** If evidence is unavailable, keep activation blocked; do not purchase infrastructure or install Docker/WSL. Storage object bytes are separate from database backups. [Official backup guidance](https://supabase.com/docs/guides/platform/backups).

Four local recovery checks passed: current dependency parity; injected failure after initialization/before COMMIT rolls back new objects without changing existing fixture data; exact-script retry creates complete unapproved drafts; scoped source copies restore byte-for-byte. [Evidence](docs/validation/pre-activation-recovery.json). This is **not a full hosted database restore test**. On SQL failure, `ROLLBACK;` and stop. After a committed incident, freeze changes and use the confirmed owner recovery procedure; do not drop legal history to retry.

## Safe owner activation sequence - only after blockers are resolved

1. Confirm full recovery readiness and reconcile publication intent. Resolve missing operator identity/address, privacy/legal contact, retention/request handling and qualified legal review. Keep review warnings.
2. Keep `VITE_LEGAL_CONTENT_SOURCE` unset/`static`. Run [read-only preflight](supabase/tests/legal_activation_preflight.sql) in the correct Dashboard SQL Editor. Stop on drift/existing legal objects. Thirteen old migration timestamps differ: **no general push/reset or unrelated migrations**.
3. Explicitly run the **entire [guarded installation SQL](docs/legal/activation/LEGAL_PAGES_MANAGEMENT_INSTALL.sql) once**. It contains the unchanged [original migration](supabase/migrations/20261023213831_legal_pages_management.sql), transaction and stop guards. Do not run both files.
4. Run [verification SELECTs](supabase/tests/legal_activation_verify.sql): two version-1 drafts, Privacy **12 EN/12 AR** sections, Terms **14 EN/14 AR**, null approvals/revocations, false review flags, zero public revisions/events, correct RLS and unchanged Admin/destination inventory. Record only the executed migration using the specific history-repair step in the [activation guide](docs/legal/LEGAL_PAGES_ACTIVATION_GUIDE.md).
5. Both real Admins sign in through the existing login, each in their own session, and verify `/admin/legal`, save and preview. An ordinary account must be denied editing/draft reads. Real hosted session tests remain pending. Test destructive lifecycle scenarios in isolation.
6. Review and explicitly **Approve & publish** both complete bilingual revisions. Approval makes them publicly readable and represents owner editorial approval, not legal certification. Restore creates a new draft requiring approval; revoke falls back to a still-approved version or makes the document unavailable.
7. Only then set `VITE_LEGAL_CONTENT_SOURCE=supabase` in the existing **local Vite environment** and restart the dev server; this is not a Supabase setting. Test both public legal routes in EN/AR, guest/ordinary access, latest approved versions, registration availability and login/recovery/PKCE. Do not substitute static drafts for unavailable managed approvals. **No deployment or production setting change is authorized.**

**Acceptance risks:** no acceptance ledger/version history proves which terms a user accepted; no retrospective records may be claimed. Direct Supabase Auth signup can bypass the UI availability gate, and the legal check/signup are not atomic. Server-enforced version acceptance is separate work if required before launch. Publication/terms acceptance is not blanket processing consent.

No hosted writes/settings changes, deployment or feature rebuild occurred. Supporting summary: [pre-activation-decision.json](docs/validation/pre-activation-decision.json).
