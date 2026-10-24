# Phase 02A — Supabase backend foundation

Updated **16 October 2026 (Asia/Amman)**. **The Phase 02A database foundation is deployed and verified on project `dkhwwvoplhfjccvjegty`.** Phase 02B has not started. The approved React UI still uses its original demo data and behavior.

The previous access blocker is resolved: this conversation can call the dedicated `supabase_unseen_jo` MCP server. Only that server was used for remote operations. The original Supabase connector, account registrations and unrelated projects were not modified or used. Earlier local/access findings are preserved in [the historical report](./validation/phase02a-local-access-history.md).

## Verified target and preflight

- Dedicated server returned `https://dkhwwvoplhfjccvjegty.supabase.co`, exactly matching the user-confirmed reference. Database queries, migrations and HTTP checks succeeded against that target.
- Remote engine: **PostgreSQL 17.11**, matching local CLI major version 17.
- Before deployment: **zero application tables, application routines/policies, migration records, Auth users, buckets and Storage objects**. The private application schema and PostGIS were absent. Existing Supabase-managed Auth/Storage/Realtime/Vault objects were preserved.
- Security advisor before deployment: **zero findings**.
- The scoped MCP exposes the URL/database, but not account email, dashboard display name, organization, billing plan or region metadata. The earlier account/Singapore/Free-plan descriptions remain user-provided; those administrative details were not independently verified. Target authorization was established by the exact user-confirmed reference and dedicated connection.
- Current Supabase documentation/changelog was reviewed, including explicit Data API grants, extension-version behavior and PostgreSQL 17.11 changes. No existing application data/index/encrypted content required adaptation.

## Applied migrations

The three existing SQL files were reviewed and all **55 local checks passed before deployment**. Each was applied once through dedicated MCP `apply_migration`, in order. No reset, DROP/TRUNCATE, schema replacement or destination/user seed was executed.

| Remote version / current local filename | SHA-256 |
| --- | --- |
| `20261015212231_phase02a_foundation.sql` | `3b7d95e17724d69e323ad29d4a19c38d902495f8af9e217e4ab41c148edb61e3` |
| `20261015212235_phase02a_access_and_storage.sql` | `957db84550e317dca13be43dacc836b1f32a1e95d88e5892ab9dc47f84335b1f` |
| `20261015212242_phase02a_categories.sql` | `3a398a1aa1f61447b93f2bd613d9643a1ef7cec72f41e41ed76b248708f7e5cc` |

The MCP assigns migration timestamps. Local filenames were aligned with the returned remote versions to prevent future CLI workflows treating them as unapplied. **SQL contents are unchanged** from original versions `20261015204855`, `20261015204859` and `20261015204902`, respectively. Each remote history entry contains SQL that exactly equals its corresponding local file. This was verified by retrieving the stored statements; history was not repaired or overwritten.

## Actual hosted database results

The remote catalog was inspected after deployment:

- **11 application tables, all with RLS enabled:** profiles, user_roles, places, categories, place_categories, place_images, user_preferences, user_preference_categories, saved_places, recommendation_feedback and admin_audit_logs.
- **83 columns, 76 constraints, 31 indexes, 12 application triggers and 48 policies** (39 application policies and nine Storage object policies).
- Foreign keys, composite/unique relationships, owner-column grants, timestamp restrictions, role assignment controls, trusted audit writes and private helper execution were inspected. Every application FK has a leading index.
- **PostGIS 3.3.7** installed in `extensions`; generated WGS84 geography and GiST index exist. Hosted synthetic-point tests verified longitude/latitude order, null unknown locations, meter distances and radius filtering.
- Four private helpers pin an empty search path. Only the authenticated admin-lookup helper is client-executable; trigger-only helpers are revoked. No public application RPC was added.
- Seven vocabulary categories seeded; no tourism records, users, passwords or admin accounts seeded.
- Hosted security advisor after deployment: **zero findings**.
- Performance advisor: **14 INFO unused-index findings**, expected for new empty tables. The spatial and FK-supporting indexes were retained. No performance warning/error finding was returned.

## Storage and Auth verification

| Bucket | Visibility | Limit | Allowed MIME types |
| --- | --- | --- | --- |
| `place-images` | Private, published linked-image reads; admin writes | 5 MiB | JPEG, PNG, WebP, AVIF |
| `profile-avatars` | Private, owner UUID folder | 2 MiB | JPEG, PNG, WebP |

Both bucket records and all nine object policies were inspected remotely. Real Storage HTTP requests rejected an unauthorized avatar upload, SVG MIME and an oversized avatar. Storage returned HTTP 400 with service-level status codes **403, 415 and 413**, respectively; these were checked explicitly. No object metadata was inserted or changed through SQL.

The hosted Auth settings endpoint confirms email authentication enabled, email confirmation required, anonymous sign-ins disabled and signup enabled. The managed `auth.users` trigger was exercised with transaction-only SQL fixtures: profiles/default user roles were provisioned, editable role metadata did not grant admin, and account-deletion cascades worked. No email was sent or persistent test account created.

**Verification limits:** real signup/email delivery, issued user JWT/refresh/logout flows, successful authenticated object upload/download/upsert and owner-versus-other-user Storage HTTP behavior were not exercised. Storage policy behavior has local modeled tests plus hosted policy inspection and anonymous HTTP enforcement; the hosted SQL suite does not write Storage metadata. These limitations are not reported as passed. Full Auth/provider/password/redirect configuration was not changed or fully inspected through the scoped MCP; local `config.toml` remains local settings. Authentication/frontend integration belongs to the separately authorized later phase.

## Tests actually executed

| Check | Result |
| --- | --- |
| Existing local SQL/security suite, before deployment | **55 grouped checks passed** |
| Local suite after migration filename alignment | **55 grouped checks passed** |
| Hosted rollback-only SQL/security suite | **80 assertions passed** |
| Hosted Data API/Auth/Storage HTTP checks | **17 checks passed** |
| Hosted security advisor | **0 findings** |
| Hosted performance advisor | **14 INFO unused indexes only** |
| `npm run validate` after public env population | **Passed**: lint, 83 asset references / 48 original hashes, Vite production build |
| React source preservation | **All 60 files under src unchanged by SHA-256** |

Hosted SQL checks cover RLS/grants, public draft filtering, owner isolation, cross-user read/update/delete denial, role escalation denial, protected timestamps/avatar paths, trigger execution permissions, audit protections/actor attribution, admin content access without a private-record bypass, preference/save/feedback writes, draft target denial, constraints, FK/cover uniqueness, PostGIS and deletion cascades.

The SQL suite uses real hosted roles and transaction-local identity claims; this tests database authorization, not JWT signature validation. All fixtures/helpers are inside BEGIN/ROLLBACK. An initial CTE-placement syntax error was corrected before the successful run; it caused no persisted changes.

Final independent cleanup counts: **0 Auth users, sessions, profiles, role assignments, places, images, place-category links, preferences, interests, saves, feedback and Storage objects**. Only **7 categories and their 7 expected seed audit events** remain.

The previous Phase 02A browser suites passed: Phase 01A 14 cases, Phase 01B 21, Phase 01C 42, landing refinement five viewports plus route checks, and global scale 91 cases plus ten states/dialogs. These historical browser results were retained, not rerun for this backend-only continuation. No React/CSS/assets/routes/demo source was edited. Full Docker-stack local lint remains unavailable because no local Supabase stack runs; hosted SQL checks are separate evidence.

## Evidence and local configuration

- [Remote catalog, preflight, migration mapping, 80 assertions, HTTP results, cleanup and advisors](./validation/phase02a-remote-results.json)
- [Current 55-check local results and migration hashes](./validation/phase02a-database-tests.json)
- [Rollback-only hosted SQL suite](../supabase/tests/remote-phase02a.sql)
- [Schema and authorization matrix](./DATABASE_SCHEMA.md)
- [Current setup and maintenance guidance](./SUPABASE_SETUP.md)

Ignored `.env.local` now contains the verified target URL and an enabled modern publishable key, fetched from the dedicated connection. No management token, database password, secret/service-role key or signing key was fetched or placed in Vite configuration. `.env.example` remains blank. The lazy client is still isolated from page entry points, and the frontend requires no login to browse its existing demo.

Continuation changes: aligned three migration filenames without SQL edits; added hosted SQL suite and remote evidence; refreshed local test evidence; updated this report and related setup/schema/validation/README status; populated ignored public env settings. No package or application source changes were necessary.

The scoped MCP does not expose dashboard rename or full project/Auth management. No rename, CLI authentication/linking, config push, plan/region change or extra cloud resource was performed. These administrative limitations do not prevent the verified Phase 02A database foundation from operating. Do not reapply the tracked migrations or recreate the schema. Future schema work must be additive and separately scoped.

**Phase 02A database foundation is complete within the verification scope above. Phase 02B, live frontend data, Auth UI, maps, recommendations, admin UI and partner features have not started.**
