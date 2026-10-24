# Supabase setup — Phases 02A–02B

Updated 16 October 2026. **Deployed and verified** on `dkhwwvoplhfjccvjegty` through the dedicated `supabase_unseen_jo` MCP server. The original Supabase connection remains intact. The earlier access blocker is resolved; see [the phase report](./PHASE_02A_REPORT.md) for actual results and explicit verification limits.

## Current connection and configuration

- API URL: `https://dkhwwvoplhfjccvjegty.supabase.co`.
- Hosted PostgreSQL **17.11**, PostGIS **3.3.7** in `extensions`.
- Three tracked migrations; local filenames now match remote versions **20261015212231**, **20261015212235**, **20261015212242**. Contents are unchanged and exactly match stored remote statements.
- Ignored `.env.local` contains the verified HTTPS origin and enabled modern publishable key. `.env.example` stays blank. No secret/service-role key, management token, DB password or signing key is in browser configuration.
- Phase 02B Home/Explore/Details read the lazy public repository. The supplied local data mode is supabase; explicit demo mode preserves original sample behavior.
- No CLI authentication/link was completed or needed for MCP deployment. No original connector configuration was edited.

The scoped MCP verifies the exact reference, URL and database access. It does not expose account email, organization, display name, billing plan or region. Earlier Free-plan/Singapore/account descriptions remain user-provided. No rename or administrative metadata change was attempted.

## Installed tools

Pinned packages and lockfile are unchanged in this continuation:

| Package | Version |
| --- | --- |
| `@supabase/supabase-js` | 2.118.0 |
| `supabase` CLI | 2.121.0 |
| `@electric-sql/pglite` | 0.5.10 |
| `@electric-sql/pglite-postgis` | 0.2.10 |

PGlite runs disposable PostgreSQL 18.6/PostGIS 3.6.2 tests with modeled platform contracts. Hosted tests separately passed on PostgreSQL 17.11/PostGIS 3.3.7. Docker/native local Supabase is not running; previous local lint could not connect to 127.0.0.1:54322.

## Local and hosted settings

`supabase/config.toml` is local configuration, with local project identifier `unseen-jo`, PostgreSQL major 17, explicit Data API grants, seed path and development redirects. It does not rename the hosted project or prove remote Auth/password/redirect settings. Do not blindly push it.

Remote inspection confirms all 11 application tables have RLS, the private helper schema is outside the public RPC surface, seven categories exist and both Storage buckets are private with MIME/size limits. Hosted Auth public settings confirm email auth, required email confirmation, signup enabled and anonymous sign-ins disabled. Full Auth/password/provider/redirect management was not exposed by the dedicated MCP and was not changed.

The client validates paired public settings and rejects secret/legacy formats and unsafe URLs. It creates a singleton only when requested; session persistence, automatic refresh and URL-session detection remain disabled pending deliberate future Auth integration.

## Validation and maintenance

```powershell
npm run test:database
npm run validate
npm run dev
```

The first command executes 55 checks on two disposable local databases; it never contacts Supabase. Remote evidence is separately retained in [phase02a-remote-results.json](./validation/phase02a-remote-results.json): 80 hosted SQL assertions, 17 HTTP checks, zero security findings, final fixture cleanup and exact migration mapping.

`supabase/tests/remote-phase02a.sql` is a rollback-only verification script for the verified empty foundation. It is **not a migration**. Its global fixture-count assertions assume the historical Phase 02A empty preflight state. The project now has six real draft records, so do not rerun that script unchanged. The Phase 02B rollback-only script separately checks public visibility without assuming an empty application table. Never run `supabase/tests/bootstrap.sql` remotely. Never edit real Storage object metadata through SQL.

Do not reapply the deployed migrations, reset the remote database or recreate existing schema. Future changes must inspect current state first and use new additive migrations. If using the CLI later, authenticate through the official flow, explicitly link the verified reference, inspect migration list/dry-run output and preserve the aligned local versions. Discover command options using `--help`; do not repair history blindly.

Successful user signup/email/JWT/refresh/logout and authenticated object upload/download/upsert remain untested. Phase 02A created no persistent test identity, email delivery, real content or object upload. Phase 02B subsequently imported six real destination drafts, with no published place or Storage object. The report distinguishes these limits from passed database and anonymous HTTP checks.

Phase 02B public reads are implemented; six source-reviewed drafts and ten category links were imported without schema/policy changes. No place is published pending media clearance. Auth UI, permanent saves and Phase 03 remain unimplemented. See [Phase 02B report](./PHASE_02B_REPORT.md) and [data/mode guide](./TOURISM_DATA.md).

See [schema and authorization matrix](./DATABASE_SCHEMA.md) and [complete Phase 02A results](./PHASE_02A_REPORT.md).

## Phase 03 verification note (18 October 2026)

Interactive maps require no database changes or map-provider secrets. Public HTTP checks again passed against `dkhwwvoplhfjccvjegty` (7 categories, 0 public places). The dedicated MCP currently fails OAuth refresh; privileged counts/policies are therefore last verified by Phase 02B rather than freshly re-audited. No connector settings, schema, RLS or Storage configuration were modified. See [Phase 03 report](./PHASE_03_REPORT.md) and [map configuration](./MAPS.md).
