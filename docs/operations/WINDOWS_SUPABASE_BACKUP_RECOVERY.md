# Hosted Supabase recovery — Windows, no Docker/WSL

Project `dkhwwvoplhfjccvjegty`; reviewed 24 October 2026. **No backup was created or restored by this task. Full recovery readiness remains UNCONFIRMED.** The scoped legal recovery pack and `dist` are not database backups. This runbook is for owner execution; do not paste private backup contents or passwords into chat.

## 1. Prefer an existing verified platform backup

Owner: open the correct project's **Database → Backups**. Record the completed backup/restore-point ID, UTC time, covered database/Auth scope, retention/expiry, restore permission, availability and the recovery procedure/validation evidence. Do not click Restore on production to test it. An empty/disabled screen is not proof that another verified private export exists. Free-plan projects do not receive the same downloadable backup facility as paid plans; **do not purchase an upgrade** merely to follow this guide. [Supabase backup scope](https://supabase.com/docs/guides/platform/backups).

If a usable platform recovery point and validated recovery path already exist, document them and complete the separate Storage/configuration steps below. This is the shortest route. Otherwise create a logical export using native Windows tools.

## 2. Prepare native Windows tools and private storage

The read-only hosted check found **PostgreSQL 17.11**, with `postgis 3.3.7`, `supabase_vault 0.3.1`, `pgcrypto`, `uuid-ossp`, `pg_stat_statements` and `plpgsql`. Schemas include `auth`, `storage`, `unseen_private`, `supabase_migrations`, `public`, `vault` and other platform schemas. An application-only/public-only dump is insufficient.

Native `pg_dump`, `pg_restore` and `psql` were not found on PATH or under the standard PostgreSQL installation directory in this review; nothing was installed. Owner can obtain patched **PostgreSQL 17 Windows x64 command-line tools** from the [official Windows distribution](https://www.postgresql.org/download/windows/). A local database server is unnecessary for export. Check the native tools' `--version` and `--help` before using them. Do not use `supabase db dump` here: the documented CLI implementation needs Docker.

Use an owner-only encrypted drive/folder **outside this repository, `public`, `dist`, shared folders and unapproved cloud sync**. The dump contains private user data, password hashes and potentially Auth session material. Keep a second protected offline/off-site copy; record who can access/restore it. Do not email it or commit it. Encryption/ACL protection must be real, not assumed from a folder name.

In Supabase **Connect**, choose the **Session pooler** connection on port **5432**, or a working direct connection on 5432. Use the exact displayed host/login/database for this project; do not invent its region/host. Session pooling works where the direct IPv6 endpoint is unavailable; do not use transaction-pooling port 6543 for this runbook. Owner uses the database password **only in the native tool's hidden prompt**, never in a URI, command, environment variable, source file or screenshot. No Auth/Admin password is needed. [Connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres).

Download the database CA certificate from **Database Settings → SSL Configuration**. Use `verify-full` with that CA. If the selected endpoint's certificate cannot be verified, stop and resolve the certificate/endpoint selection; do not silently downgrade TLS or change hosted SSL settings. [SSL guidance](https://supabase.com/docs/guides/platform/ssl-enforcement).

## 3. Create and check the export

Run these in a fresh **PowerShell** window. This copyable block is specifically for the **Session pooler**, not a direct connection. Inputs are paths, host and login, not passwords. Choose a quiet administrative window with no schema/role/content edits; do not force production read-only or disable services without separate authorization. Native dump uses a consistent database snapshot, but roles, settings and Storage copies are separate operations.

```powershell
$ErrorActionPreference = 'Stop'
$pgBin = Read-Host 'Absolute directory containing the PostgreSQL 17 executables'
$backupRoot = Read-Host 'Existing protected encrypted backup directory, outside the project'
$backupHost = Read-Host 'Exact host from this project Connect > Session pooler'
$backupLogin = Read-Host 'Exact database login from that same connection'
$caFile = Read-Host 'Absolute path to the downloaded database CA certificate'
$projectRoot = 'C:\Users\Magic Systems\Desktop\Unseen Jo Project'
if ($backupLogin -ne 'postgres.dkhwwvoplhfjccvjegty') { throw 'This block requires the session-pooler login for the specified Unseen Jo project. Recheck Connect.' }

$resolvedRoot = (Resolve-Path -LiteralPath $backupRoot).Path.TrimEnd('\')
if ($resolvedRoot -eq $projectRoot -or $resolvedRoot.StartsWith($projectRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Choose a private directory outside the project.' }
if (!(Test-Path -LiteralPath $caFile -PathType Leaf)) { throw 'CA certificate missing.' }
$backupDir = Join-Path $resolvedRoot ('unseen-jo-' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $backupDir | Out-Null
$dbArchive = Join-Path $backupDir 'database.dump'
$globalSql = Join-Path $backupDir 'globals-no-passwords.sql'
$baselineSql = Join-Path $projectRoot 'supabase/tests/public_launch_recovery_baseline.sql'
$baselineOutput = Join-Path $backupDir 'source-baseline.txt'
$storageManifest = Join-Path $backupDir 'storage-manifest.csv'
$archiveToc = Join-Path $backupDir 'archive-toc.txt'
$env:PGSSLMODE = 'verify-full'
$env:PGSSLROOTCERT = $caFile
$connectionArgs = @("--host=$backupHost", '--port=5432', "--username=$backupLogin", '--password')

& (Join-Path $pgBin 'pg_dump.exe') @connectionArgs --dbname=postgres --format=custom --lock-wait-timeout=10000 "--file=$dbArchive"
if ($LASTEXITCODE -ne 0) { throw 'Database export failed; this is NOT a complete backup.' }

& (Join-Path $pgBin 'pg_dumpall.exe') @connectionArgs --database=postgres --globals-only --no-role-passwords "--file=$globalSql"
if ($LASTEXITCODE -ne 0) { throw 'Global-role export failed; recovery scope remains incomplete.' }

& (Join-Path $pgBin 'psql.exe') @connectionArgs --dbname=postgres --no-psqlrc --set=ON_ERROR_STOP=1 "--file=$baselineSql" "--output=$baselineOutput"
if ($LASTEXITCODE -ne 0) { throw 'Recovery baseline failed.' }

& (Join-Path $pgBin 'psql.exe') @connectionArgs --dbname=postgres --no-psqlrc --set=ON_ERROR_STOP=1 --csv --command='select bucket_id,name,owner_id,metadata,created_at,updated_at from storage.objects order by bucket_id,name' "--output=$storageManifest"
if ($LASTEXITCODE -ne 0) { throw 'Storage inventory failed.' }

& (Join-Path $pgBin 'pg_restore.exe') --list "--file=$archiveToc" $dbArchive
if ($LASTEXITCODE -ne 0) { throw 'Archive listing failed.' }

# No --dbname: read/decompress the archive into the Windows null device;
# this does NOT connect to a database or execute a restore.
& (Join-Path $pgBin 'pg_restore.exe') --file=NUL $dbArchive
if ($LASTEXITCODE -ne 0) { throw 'Full archive read failed.' }

Get-FileHash -Algorithm SHA256 -LiteralPath $dbArchive,$globalSql |
  Select-Object Path,Hash | ConvertTo-Json |
  Set-Content -LiteralPath (Join-Path $backupDir 'database-checksums.json') -Encoding UTF8
```

Use `--file`, **not PowerShell `>`**, for the binary archive. All native nonzero exits and permission/lock errors are blockers; never exclude failing Auth/private tables, alter RLS/grants or change roles to make the export appear complete. `pg_dump` retains ACL/ownership metadata; it does not itself create cluster roles. The separate globals file omits **database-role passwords** intentionally. It does **not** strip Auth-user password hashes from the database archive; protect the archive accordingly. Custom database-role credentials, platform secrets and encryption-key recovery need the owner's protected credential/provider procedure. [Native dump](https://www.postgresql.org/docs/current/app-pgdump.html), [global objects](https://www.postgresql.org/docs/current/app-pg-dumpall.html).

Privately inspect the TOC for table/data/sequence entries in application, private, Auth and Storage schemas; verify functions, constraints, triggers, RLS policies and ACLs exist. Extension-owned objects may be represented by their extension dependency rather than individual definitions. A zero-byte file, schema-only file or table-list-only file is not acceptable. Copy the files to the second protected location and recompute/compare SHA-256 there. Reading/listing/hashing proves artifact integrity, **not successful recovery**.

## 4. Copy Storage bytes and non-database configuration

The DB archive contains `storage` metadata, **not the object bytes**. Owner must inventory **every bucket**, including private `place-images`, private `profile-avatars`, public `brand-assets`, and any additional bucket actually present. Record bucket IDs, public/private status, limits, MIME restrictions, object paths, ownership, MIME/size and before/after timestamps privately. Do not make private buckets public to download them.

Use the authorized Dashboard **Storage → bucket → object → Download**, preserving every original bucket/path in a protected local `storage` folder. For a large inventory, use an owner-configured Windows S3-compatible client with Supabase's supported S3 endpoint/credentials if available; keep credentials local/protected and use download/copy only, not sync-with-delete. Do not settle for the 14 public-image rows or the 120 known renditions: include unapproved originals, avatars and all other inventoried objects too. Downloading with a public publishable key cannot establish coverage of private files.

Create a per-file SHA-256 manifest in the protected backup folder; compare object count, paths and sizes against `storage-manifest.csv`. Reread the source inventory after the copy and reconcile additions/changes/deletions; repeat changed objects until the documented checkpoint is consistent. A Storage ETag is not universally a SHA-256/MD5 checksum. List missing/failed files explicitly; any unexplained gap blocks Storage recovery readiness.

Archive the application's source/lockfile/migrations/Edge Function source and record actual hosted Auth Site/Redirect URLs, providers, SMTP identity, all eight saved subjects/templates and security-notification settings. Keep secret material separately under owner/provider recovery controls, never in this repository or `dist`. Include extension versions and provider handling of Vault encryption material. Database export is **not a whole-platform configuration/secret backup**.

## 5. Verify actual recovery before marking PASS

**Do not run a generic raw `pg_restore`, `psql globals-no-passwords.sql`, reset or migration push against production.** Raw dumps include Supabase-managed internals; restoring them blindly to another managed project can conflict with reserved roles, ownership, Auth/Storage versions and extensions. A plain Windows PostgreSQL installation is **not** a full Supabase clone: this project needs PostGIS/Vault and platform dependencies. Do not suppress restore errors or disable RLS to claim a pass. [Supabase's explanation of native-dump restore caveats](https://supabase.com/docs/guides/self-hosting/restore-from-platform).

Owner must name an **existing, authorized, isolated and compatible recovery target**, or provide provider-supported recovery validation for the actual platform backup. No such target/validation is currently confirmed. No paid infrastructure, Docker/WSL or new project is created by this guide. If a compatible native target is unavailable, keep full recovery verification **BLOCKED**, even after a readable dump succeeds.

The responsible restorer must perform this sequence on that isolated target only:

1. Verify the target's identity/isolation, Postgres/extension/Auth/Storage compatibility and private-data access protection. Disable outbound email, hooks/jobs and application access on the recovery target through its approved isolation procedure; no messages may reach restored real users. Record the exact target-specific reviewed restore commands, including permitted globals/managed-object treatment, **before** execution.
2. Restore the required roles/dependencies and database archive with error-on-failure behavior under that reviewed procedure. Preserve or explicitly reconstruct ownership/ACL/RLS, functions/triggers/constraints and sequences. Do not hide lost privileges behind `--no-owner/--no-acl`, filter away private/Auth data, or call an application-only restore complete. Keep protected logs and account for every compatibility adjustment.
3. Run `supabase/tests/public_launch_recovery_baseline.sql` on the target, compare source table counts, all 24 destination IDs/slugs/statuses, the two Admin role records privately, FK relationships and security metadata. Compare actual business data from the backup checkpoint, not merely row counts. Account for any source writes between snapshot/baseline; rerun export if an unexplained discrepancy remains. Validate authorization using disposable fixtures, not logins/password changes for restored real accounts.
4. Recover Storage bytes through the supported Storage API/client and reconcile DB metadata, bucket policies and ownership under the reviewed recovery plan. Verify every backed-up path/size/checksum and representative private access controls. Reuploading under an operator/S3 identity can change ownership; do not directly edit `storage.objects` or assume avatar ownership is automatically preserved. Verify all eight public galleries and recoverable private avatars without disclosing them.
5. Verify restored configuration dependencies separately; measure elapsed recovery time and the actual backup data-loss window. Record the restorer, date, target, precise commands/procedure, errors/resolution, comparison results, hashes and owner-approved RPO/RTO. Securely retire recovery copies according to the owner's approved retention procedure; no real account deletion is part of this test plan.

Only this completed evidence (or validated provider-supported equivalent), plus complete Storage/configuration recovery arrangements, closes the blocker. A PG17 archive, TOC, checksum, file-copy test, PGlite migration test or the scoped legal recovery pack alone does not.

## Evidence record — currently not completed

| Evidence | Current status |
| --- | --- |
| Full platform recovery point/export ID, UTC time and scope | UNCONFIRMED |
| Export exits/logs, TOC, full archive read and matching protected-copy hashes | NOT RUN |
| All Storage bytes/paths/ownership and protected manifest | NOT VERIFIED |
| Named compatible isolated recovery target/procedure | NOT CONFIRMED |
| Successful DB/security/data/Storage restore comparison | NOT RUN |
| Responsible restorer, permissions, expiry, actual RPO/RTO | OWNER REQUIRED |

The export commands were reviewed against official documentation but **not executed**: private DB access and native tools/recovery target are not available through this workflow. Nothing here resets a password or changes hosted configuration.
