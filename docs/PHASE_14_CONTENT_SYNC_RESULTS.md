# Phase 14 — Approved content synchronization results

Date: **23 October 2026**. Project: `dkhwwvoplhfjccvjegty`.

**Result: BLOCKED before hosted writes. No content was synchronized or approved in this run.** The owner's explicit approval is recorded and remains valid for the 19 proposals, 30 rights-cleared selected candidates and 120 renditions. It does not replace server authentication or copyright clearance. Fresh backup, conflict detection, full dry-run preparation, rights rechecks, public API verification and local regressions/build were completed.

## 1. Exact blockers and safe stop

1. The project-specific MCP connection fails with `OAuth token refresh failed: Failed to parse server response`. The already connected Supabase app's **Ramez** connection successfully accesses the correct project; Primary does not have access. Project health is ACTIVE_HEALTHY. Therefore this is **not** a claim that all hosted management access is unavailable.
2. The working management SQL connection runs as `postgres`, but **`auth.uid()` is absent and `unseen_private.is_admin()=false`**. Existing hosted guards explicitly require a legitimate app Admin session to mark Arabic reviewed and modify/approve published media. The fresh inspection found two Admin memberships and two non-banned matching Auth accounts. Neither account was changed or used to manufacture a session.
3. The enabled browser-control surface returned no connected browser tabs. The supported Windows Computer Use fallback found the existing Chrome window, but stopped when it could not confidently determine the current browser URL for policy enforcement. **All further Computer Use input was stopped.** No login, authentication dialog, credential extraction, browser-profile copying or session impersonation was attempted.

The affected write operations were stopped. No trigger was disabled; no request/JWT/session claims were forged; no RLS, guard function, grant, account, role or Auth setting was changed. A management token is not treated as an app Admin identity. No partial pending-only translation writes or unnecessary uploads were made.

**Resume requirement:** make a genuine existing Unseen Jo Admin session accessible through a supported, URL-verifiable browser/app connection, or provide an approved authenticated application mechanism that passes the existing guards. Do not send passwords, service-role keys or session tokens in chat. Re-read all expected versions and refresh the backup immediately before resuming. The existing owner approval does not need to be requested again. No new broad maintenance bypass or approval workflow was added.

## 2. Read/validation and dry run

Read the Phase 14.1 report, complete destination/Arabic/image review documents, the 19-record Arabic proposal, Arabic corrections, 30-record image plan, local originals/renditions and current hosted guards/policies. Local Arabic checks retain existing English facts, dates, fee categories, access limitations and unknown values; no additional destination facts were introduced.

[Complete dry-run JSON](validation/phase14-content-sync-dry-run.json) contains every translation ID/slug/version/field delta, every selected image ID/current object path/version/licence/source and every rendition's hash/size/existing Storage path.

| Preflight item | Actual finding |
| --- | --- |
| Existing destinations | 24; all Published; all IDs/slugs match the Phase 14.1 baseline. |
| Concurrent changes | **0** differences from the previous audit in the compared full baseline place/translation/image/review/category-link fields. Expected English/Arabic versions and English text checksums match all 19 proposals. These checks must be repeated on resume. |
| Arabic proposals | 19 valid: six records have actual text refinements; 13 already contain the proposed text and need only legitimate review activation. |
| Selected image records | 30 existing mappings, all still unapproved; expected paths, source/attribution/licence fields and upload sizes match. **0 image metadata differences** from the prepared plan. |
| Selected source bytes | All 30 local upload SHA-256 hashes match. |
| Optimized renditions | **All 120 already have corresponding Storage inventory entries** under their own destination folder, containing the exact expected hash in the name, matching MIME type and byte size. **0 missing uploads detected.** Actual private remote bytes were not independently downloaded; names and metadata are not presented as a byte-level proof. |
| Storage protection | Existing `place-images` bucket remains private; 5 MiB limit and allowed image MIME types unchanged. |
| Legal/identity gate | All 30 selected candidates retain file-specific author/licence/source/modification evidence; current Commons metadata rechecks match. The four previously excluded candidates stay excluded. |
| Execute gate | **BLOCKED:** no legitimate active app Admin identity available through the usable management connection, and browser inspection halted. |

All 120 rendition files are already present in the inventory, so this task did not upload duplicate objects. These existing renditions use `prototype-<hash>-<width>.webp` names. Their presence does not make them publicly readable: current public Storage policies require an approved linked image, and the current public image-delivery module requests transformations of the approved original. Do not expose prototype-only variants, create 120 duplicate gallery entries or loosen the bucket/policies to force them public. Public use of pregenerated variants requires a separately verified supported mapping/delivery plan; no frontend deployment or schema/policy modification was performed here.

## 3. Changes actually applied

| Hosted operation | Applied |
| --- | ---: |
| Arabic content/review updates | **0 / 19** |
| Image uploads | **0** — all 120 expected rendition paths/sizes already inventoried |
| Image rights approvals | **0 / 30** |
| Image relationship changes | **0** |
| English destination updates | **0** — proposals require no English edits |
| Destination status/ID/slug changes | **0** |
| Accounts/Admin roles/Auth settings/legal/privacy changes | **0** |
| Frontend deployment | **None** |

The following 19 Arabic operations remain pending execution. Existing five reviewed/current Arabic records outside this list are excluded from the proposed write set.

| Destination | Planned delta | Hosted result |
| --- | --- | --- |
| `al-maghtas-baptism-site` | Existing approved proposal text already matches; review activation only | NOT APPLIED — Admin-session gate |
| `amman-citadel` | Existing approved proposal text already matches; review activation only | NOT APPLIED — Admin-session gate |
| `amman-roman-theatre` | Existing approved proposal text already matches; review activation only | NOT APPLIED — Admin-session gate |
| `aqaba-marine-reserve` | Existing approved proposal text already matches; review activation only | NOT APPLIED — Admin-session gate |
| `azraq-wetland-reserve` | Existing approved proposal text already matches; review activation only | NOT APPLIED — Admin-session gate |
| `jerash-archaeological-city` | Description refinement and review | NOT APPLIED — Admin-session gate |
| `karak-castle` | Existing approved proposal text already matches; review activation only | NOT APPLIED — Admin-session gate |
| `little-petra-siq-al-barid` | Description refinement and review | NOT APPLIED — Admin-session gate |
| `madaba-st-georges-church` | Existing approved proposal text already matches; review activation only | NOT APPLIED — Admin-session gate |
| `mount-nebo` | Existing approved proposal text already matches; review activation only | NOT APPLIED — Admin-session gate |
| `pella-tabaqat-fahl` | Description refinement and review | NOT APPLIED — Admin-session gate |
| `petra` | Description refinement and review | NOT APPLIED — Admin-session gate |
| `quseir-amra` | Existing approved proposal text already matches; review activation only | NOT APPLIED — Admin-session gate |
| `shaumari-wildlife-reserve` | Description refinement and review | NOT APPLIED — Admin-session gate |
| `shobak-castle` | Existing approved proposal text already matches; review activation only | NOT APPLIED — Admin-session gate |
| `um-er-rasas` | Existing approved proposal text already matches; review activation only | NOT APPLIED — Admin-session gate |
| `umm-al-jimal` | Existing approved proposal text already matches; review activation only | NOT APPLIED — Admin-session gate |
| `wadi-mujib` | Address, description, seasonal/transport text, guidance; source version and review | NOT APPLIED — Admin-session gate |
| `wadi-rum` | Existing approved proposal text already matches; review activation only | NOT APPLIED — Admin-session gate |

No blanket “all 24 updated” claim is made. The prepared Arabic/media content concerns existing destinations while preserving every English row and all current statuses. Owner approval has not silently set factual review dates or converted uncertain tourism information into verified facts.

## 4. Images and usage-rights disposition

Current Commons read-only checks: **34/34 original/metadata matches**. All 30 selected proposals remain candidates eligible under their documented CC BY / CC BY-SA terms, with full author/title/source/licence and change disclosure preserved. Owner approval is separate from these licence checks. Adapted ShareAlike files must retain their licence and appropriate attribution. Evidence: [current origin checks](validation/phase14-1-media-origin.json), [per-file plan](content/phase14-1-media-plan.json), and [review guide](content/PHASE_14_1_IMAGE_REVIEW.md).

**No selected image was newly blocked for missing photographic licence evidence. All 30 approvals are execution-blocked by the session/guard condition.** Four earlier acquisition candidates remain blocked for other substantive reasons and are not in the 30-image write set:

- `madaba-st-georges-church-1`: display/reproduction identity and caption unresolved; do not portray it as the surviving mosaic floor.
- `umm-al-jimal-1`, `umm-al-jimal-2`: modern interpretation panels with underlying third-party text/photo reuse rights unresolved.
- `aqaba-marine-reserve-1`: exact beach and relationship to reserve boundaries unresolved; do not imply a verified visitor arrival point.

The unverified old Umm Qais test upload remains unapproved. The existing Wadi Mujib gallery citation inconsistency remains flagged rather than replaced from a Google image-search result. Existing owner-declared photos are not re-certified by this synchronization preflight. Safe public missing-photo fallbacks remain in effect for 17 destinations.

## 5. Backup and rollback

A **fresh recoverable metadata/content backup** was created before any potential write, in the ignored, non-public `artifacts/` directory:

- `artifacts/content-sync/pre-sync-records.json` — full 24 place rows, 24 translation rows, 45 image rows, 24 review rows, 48 category links, 211 place-image Storage inventory entries, bucket settings and a two-Admin membership fingerprint.
- `artifacts/content-sync/backup-manifest.json` — byte count, counts and SHA-256 verification.
- `artifacts/content-sync/pre-sync-guards.json` — inspected trigger/guard definitions.
- `artifacts/content-sync/rollback-plan.json` — exact 19 translation keys and 30 image IDs, concurrency requirements and restoration limitations.

Backup length: **441,793 bytes**. SHA-256: `aff8f248e515872aaec6738f580e597ca3cda1260d204f7c0569e71175d23e2e`. The saved file was re-read and checksum-verified successfully.

This is a scoped record/mapping/inventory backup, **not a whole-project or whole-bucket byte backup**. Existing objects were not overwritten/deleted. Matching local originals/upload copies and all 120 local rendition bytes are retained and hash-checked. No Auth passwords, API keys, sessions or tokens are in this backup. Keep its private review/actor metadata outside public assets and source-control publication.

**Rollback now: no action needed**, because no hosted write occurred. A later approved execution must journal returned after-versions and compare them under locks before rollback; stop on later editor changes. Restore only the scoped content/mappings through a reviewed authorized mechanism, preserve audit history and guard-assigned reviewer/time provenance, and retain existing objects. Do not execute broad table resets, restore user/role tables, force historical audit fields, disable guards or delete unrelated objects. Storage and database operations are not one transaction.

## 6. Hosted preservation and verification

A fresh pre/post full-row comparison confirms unchanged:

- **24 place records**, including all IDs, slugs, statuses, English text and source versions.
- **24 translations, 45 image records, 24 reviews and 48 category links**.
- **211 Storage inventory records** in the affected bucket.
- The **two-Admin membership count and complete membership fingerprint**.

Evidence: [preservation result](validation/phase14-content-sync-preservation.json).

Real anonymous API/Storage verification completed without an Auth session:

| Check | Result |
| --- | --- |
| Published destinations accessible | **24 / 24 PASS**, unique IDs, expected slugs/English descriptions and versions. |
| Public Arabic | **5 current reviewed rows**, as before. Remaining 19 are not claimed synchronized or publicly active. |
| Approved public image records | **13**, exactly matching the approved backup image IDs. No pending selected image leaked publicly. |
| Signed image retrieval | **13 / 13 HTTP 200**, image MIME type and actual JPEG/PNG/WebP signature; **0 broken URLs**. Signed URLs were never persisted. |
| Translation/image duplicates | No new rows created; all full tables unchanged. Existing translation key uniqueness preserved. |
| Actual Admin Dashboard/browser session | **NOT VERIFIED this run**: browser-control URL policy halt. Two real Admin identities remain present; this is not a claim of successful Admin login or Dashboard acceptance. |
| Hosted post-update Arabic / all 30 new images | **BLOCKED / NOT APPLIED**, not reported as passed. |
| Unrelated data | No mutation request was issued. Protected scopes and all compared tables above are unchanged; no claim of a whole-database forensic comparison. |

Evidence: [real public read results](validation/phase14-content-sync-public.json). Image signing is a read-access operation; it is not an upload or approval.

## 7. Local regression/build results

Run during this task:

- `node scripts/check-phase14-1-content.mjs`: **5 / 5 PASS** (proposal identities, completeness, null/source/checksum parity, unsafe content and photo mapping).
- `python scripts/check-phase08-media.py`: **34 originals / 30 selected uploads / 120 renditions PASS** (actual file hashes, decoding, sizes/dimensions and no upscaling).
- `node scripts/audit-phase14-1-media.mjs`: **34 / 34 current Commons metadata/original matches**, four substantive exclusions preserved.
- `node scripts/check-destination-status.mjs`: **8 / 8 PASS** on disposable DB/RLS fixtures, including all six transitions, stale/session rejection and preservation. No hosted transition executed.
- `node scripts/check-localization-database.mjs`: **16 / 16 PASS**, including inherited Admin/session checks, translation RLS/current-source review, media privacy and essential-content rejection.
- `npm run lint`: **PASS**, exit 0.
- `npm run build`: **PASS**, 3235 modules. Existing >500 kB bundle warnings remain (main ~556.69 kB; MapLibre ~1090.06 kB). No warning suppression or deployment.

Existing Phase 14.1 browser evidence is historical context only. No new real Admin browser regression or successful post-sync browser result is claimed after Computer Use halted.

## 8. Local files created/updated by this preflight

New files:

- `docs/PHASE_14_CONTENT_SYNC_RESULTS.md`
- `docs/validation/phase14-content-sync-dry-run.json`
- `docs/validation/phase14-content-sync-public.json`
- `docs/validation/phase14-content-sync-preservation.json`
- The four private backup/rollback files listed above.
- `scripts/prepare-phase14-content-sync-dry-run.mjs` — local only, no write/network capability.
- `scripts/verify-phase14-content-sync-public.mjs` — anonymous reads and image URL signing only; no credential output or content mutation capability.

Regenerated: current Commons response evidence under `docs/evidence/phase14-1/`, `docs/validation/phase14-1-media-origin.json`, content/media/database test outputs, and local `dist/` build. No application source, migration, Auth configuration, legal operator wording or privacy/deletion implementation was changed.

## 9. Remaining release blockers

**NO-GO remains.** The owner editorial approval is accepted, but the 19 Arabic reviews/content updates and 30 image approvals are not live. Resume requires legitimate authenticated execution without bypassing existing guards, followed by exact hosted readback, guest/bilingual/image checks and real Admin acceptance. Preserve the 24 current publication statuses throughout.

Also retain the independent Phase 14 blockers: legal operator/contact/legal review, operational privacy-rights handling and unverified deletion integration, isolated last-Admin safeguard verification, genuine controlled-inbox Auth acceptance, approved production origin/redirects, hosting/security-header and crawler strategy. None was modified to unblock content work.

Computer Use ended because it could not confidently verify the current browser URL on Windows. No further browser interaction or affected hosted write was attempted.

