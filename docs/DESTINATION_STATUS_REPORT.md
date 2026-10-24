# Destination status management

Supabase access verified for `dkhwwvoplhfjccvjegty`. Migration `simple_destination_status` applied remotely as version `20261022174408`.

Admin → Places provides Published, Draft and Archived for every row. Selecting a value enables **Save status**; saving persists only the status, updates the collection and counts, and reports success or an inline error. The same control is available in the destination editors. Unsaved content edits must be saved first.

Status changes require an existing administrator session and enforce RLS and stale-record checks. They require no editorial, coordinate, translation or image approval steps. Ordinary content validation remains. Existing image access and translation visibility policies remain intact. A status-only change preserves the content timestamp so current Arabic translations do not become stale. Real content edits still advance it.

All 24 hosted destinations passed all six directed status transitions in authenticated-role SQL/RLS tests: 168 calls, including normalization/no-op checks, with public visibility checked at every step. A nested transaction rolled back all test writes and audit entries. Full before/after checksums match for places, translations, images, categories, reviews, prototype overlays and stored image objects. Final counts: **24 total, 6 Published, 18 Draft, 0 Archived**.

Verification passed:

- Eight disposable PostgreSQL/RLS test groups, including content preservation, stale writes, invalid values, guests, ordinary users and revoked sessions.
- Actual React/Chromium Admin → Places tests in English desktop and Arabic mobile: options, explicit save, all six transitions, reload persistence, pagination and failure/retry.
- Real anonymous Supabase SDK/Data API: six published destinations readable; migrated status RPC available and anonymous writes denied with `42501`.
- Lint, asset validation and production build.

Browser tests use isolated authenticated API fixtures. No signed-in Admin browser is connected, so these results do not claim a save through the owner's live browser session. Hosted transition tests use the real database with an authenticated SQL role and existing administrator/session context; no browser JWT was obtained or generated. No frontend hosting deployment was performed.

The security advisor result is unchanged: the existing Auth leaked-password-protection warning remains; there are no new database security findings. The build retains its existing large-chunk advisory.

Evidence: [hosted transition and preservation results](validation/destination-status-hosted.json), [browser results](validation/destination-status-browser.json), [database tests](validation/destination-status-database.json), [Data API results](validation/destination-status-api.json).

Rerun automated checks:

```powershell
node scripts/check-destination-status.mjs
$env:QA_BASE_URL='http://127.0.0.1:4190'
node scripts/check-destination-status-browser.mjs
node scripts/check-destination-status-hosted.mjs
npm run validate
```
