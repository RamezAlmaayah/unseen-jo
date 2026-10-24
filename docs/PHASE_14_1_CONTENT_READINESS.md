# Phase 14.1 — Content and release blockers

Revision: **23 October 2026, Asia/Amman**. Project: `dkhwwvoplhfjccvjegty`.

**NO-GO for unrestricted production release.** Local Arabic preparation, image evidence/optimization preparation and the reported legacy test failures are resolved within this task's authorized scope. Hosted content completeness is **not resolved**: the 19 Arabic proposals and 17 missing public cover approvals have not been synchronized. Owner factual/rights decisions and the separate Phase 14 legal, privacy, Auth and production-configuration blockers remain.

No hosted destination, publication status, user, role, Auth setting, Storage object or permission was changed. No deployment, database migration, paid staging setup, Docker/WSL installation or real account operation was performed. The only application UI change clarifies the existing Admin quality-center description in English/Arabic; the approved design and the three statuses are preserved.

## 1. Current hosted audit — all 24 destinations

Two read-only snapshots confirm **24 Published destinations, 24 translation rows, 45 image rows and 48 category relationships unchanged**, including IDs/slugs, source and translation versions, image identities/approval timestamps and status values. Evidence: [baseline](validation/phase14-1-content-baseline.json), [preservation comparison](validation/phase14-1-hosted-preservation.json).

- All 24 have English descriptions and stored HTTPS source URLs. Text presence does not certify factual accuracy. Six have recorded prior claim/location reviews; 18 do not. This phase does not renew historical reviews.
- Hosted Arabic: **5 reviewed/current, 18 pending/current, 1 reviewed/stale (Wadi Mujib)**. All 19 incomplete public Arabic cases have complete local proposals. They remain unavailable as reviewed Arabic to guests; English fallback notices work.
- Approved public imagery: **13 images across 7 destinations; 17 destinations lack approved public covers**. Thirty matching, licensed local candidates are already linked as private/unapproved hosted records. No approval was inferred from file availability or licence metadata.
- Coordinates are all valid-range **approximate reference centers**, not independently surveyed entrances. Numeric prices are **NULL for all 24**, not free admission. Hours are absent for 20; four contain qualified source text requiring confirmation.

The table below shows the exact affected destinations. “Gallery” excludes the cover; “private” means unapproved records, including unusable or illustrative candidates. Source links are stored evidence, not claims of a fresh tourism-source verification.

| Destination | English review | Hosted Arabic / local proposal | Cover; additional gallery | Approximate coordinates | Hours | Pricing | Source / remaining review |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ajloun Forest Reserve (`ajloun-forest`) | Description present; recorded prior review | Reviewed/current — unchanged | Approved; 1 approved / 0 private | 32.3835625, 35.7604375 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://international.visitjordan.com/wheretogo/ajloun/); reconfirm operating facts |
| Baptism Site (Al-Maghtas) (`al-maghtas-baptism-site`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 1 private | 31.8372222222222, 35.5527777777778 | Qualified source text; reconfirm | Numeric NULL; confirm applicable fee | [Stored source](https://whc.unesco.org/en/list/1446/); review claims, entrance, access and operating facts |
| Amman Citadel (`amman-citadel`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 0 private | 31.9543125, 35.9354375 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://edutravel.visitjordan.com/ms/page/81/History-and-Culture); review claims, entrance, access and operating facts |
| Amman Roman Theatre (`amman-roman-theatre`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 1 private | 31.9516875, 35.9393125 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://international.visitjordan.com/wheretogo/amman/); review claims, entrance, access and operating facts |
| Aqaba Marine Reserve (`aqaba-marine-reserve`) | Description present; factual review outstanding | Pending/current — complete local proposal | Approved; 0 approved / 1 private | 29.4297222222222, 34.9755555555556 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://whc.unesco.org/en/list/1742); review claims, entrance, access and operating facts |
| Azraq Wetland Reserve (`azraq-wetland-reserve`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 1 private | 31.833909, 36.820555 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://www.rscn.org.jo/reserve/list?lang=en); review claims, entrance, access and operating facts |
| Dana Biosphere Reserve (`dana-reserve`) | Description present; recorded prior review | Reviewed/current — unchanged | Approved; 2 approved / 0 private | 30.6743125, 35.6083125 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://international.visitjordan.com/wheretogo/dana-feynan/); reconfirm operating facts |
| Iraq Al-Amir (`iraq-al-amir`) | Description present; recorded prior review | Reviewed/current — unchanged | Approved; 0 approved / 0 private | 31.9195625, 35.7533125 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://international.visitjordan.com/wheretogo/amman/); reconfirm operating facts |
| Jerash Archaeological City (`jerash-archaeological-city`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 1 private | 32.2759375, 35.8914375 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://international.visitjordan.com/wheretogo/jerash/); review claims, entrance, access and operating facts |
| Karak Castle (`karak-castle`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 1 private | 31.1809375, 35.7016875 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://international.visitjordan.com/wheretogo/karak/); review claims, entrance, access and operating facts |
| Little Petra (Siq Al-Barid) (`little-petra-siq-al-barid`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 1 private | 30.37527847, 35.45138931 | Qualified source text; reconfirm | Numeric NULL; confirm applicable fee | [Stored source](https://visitpetra.jo/en/Location/137); review claims, entrance, access and operating facts |
| St. George’s Church (Madaba Map) (`madaba-st-georges-church`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 0 private | 31.71765, 35.7942 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://international.visitjordan.com/wheretogo/madaba/); review claims, entrance, access and operating facts |
| Mount Nebo (`mount-nebo`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 1 private | 31.768088, 35.725703 | Qualified source text; reconfirm | Numeric NULL; confirm applicable fee | [Stored source](https://international.visitjordan.com/wheretogo/madaba/); review claims, entrance, access and operating facts |
| Pella (Tabaqat Fahl) (`pella-tabaqat-fahl`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 0 private | 32.449809, 35.613423 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://international.visitjordan.com/wheretogo/pella/); review claims, entrance, access and operating facts |
| Petra (`petra`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 1 private | 30.3243125, 35.4679375 | Qualified source text; reconfirm | Numeric NULL; confirm applicable fee | [Stored source](https://whc.unesco.org/en/list/326/); review claims, entrance, access and operating facts |
| Quseir Amra (`quseir-amra`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 1 private | 31.8018055555556, 36.5873055555556 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://whc.unesco.org/en/list/327); review claims, entrance, access and operating facts |
| As-Salt Historic Centre (`salt-historic`) | Description present; recorded prior review | Reviewed/current — unchanged | Approved; 2 approved / 0 private | 32.0426111111, 35.7283055556 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://whc.unesco.org/en/list/689/); reconfirm operating facts |
| Shaumari Wildlife Reserve (`shaumari-wildlife-reserve`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 1 private | 31.7448424, 36.7818916 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://www.rscn.org.jo/reserve/list?lang=en); review claims, entrance, access and operating facts |
| Shobak Castle (`shobak-castle`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 1 private | 30.531389, 35.560833 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://international.visitjordan.com/uploads/documents/JordanMPG_LR.pdf); review claims, entrance, access and operating facts |
| Um er-Rasas (Kastrom Mefa’a) (`um-er-rasas`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 1 private | 31.5013125, 35.9191875 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://whc.unesco.org/en/list/1093/); review claims, entrance, access and operating facts |
| Umm Al-Jimāl (`umm-al-jimal`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 0 private | 32.3269444444445, 36.37 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://whc.unesco.org/en/list/1721); review claims, entrance, access and operating facts |
| Umm Qais (`umm-qais`) | Description present; recorded prior review | Reviewed/current — unchanged | Approved; 0 approved / 1 private | 32.6556875, 35.6780625 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://international.visitjordan.com/wheretogo/umm-qais/); reconfirm operating facts |
| Mujib Biosphere Reserve (`wadi-mujib`) | Description present; recorded prior review | Reviewed/STALE — corrected local proposal | Approved; 1 approved / 0 private | 31.4670625, 35.5731875 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://international.visitjordan.com/wheretogo/wadi-mujib/); reconfirm operating facts |
| Wadi Rum Protected Area (`wadi-rum`) | Description present; factual review outstanding | Pending/current — complete local proposal | MISSING; 0 approved / 1 private | 29.6397222222222, 35.4338888888889 | Unknown | Numeric NULL; confirm applicable fee | [Stored source](https://whc.unesco.org/en/list/1377/); review claims, entrance, access and operating facts |

The [complete per-destination checklist](content/PHASE_14_1_DESTINATION_AUDIT.md) includes **every stable ID**, missing English fields, exact hours/visitor-information text, approved/private/local gallery counts, coordinate evidence and qualification, all source URLs and dates, conflicts, and unchecked owner-review actions. Exact unrounded values remain in the baseline JSON.

## 2. Arabic prepared and corrected

Files for substantive review:

- [Complete field-by-field English/Arabic text](content/PHASE_14_1_ARABIC_REVIEW.md).
- [Visual bilingual and image review](content/phase14-1-review.html), a standalone local HTML file. It is not included in the production public assets.
- [19-record synchronization proposal](../supabase/content/phase14-1-arabic-review.json), containing existing IDs/slugs, expected English/Arabic versions, an English-text checksum and every supported localized field. It contains no executable database writes or approval/status flags.
- [Maintainable Arabic corrections](../supabase/content/phase14-1-arabic-corrections.js); the generator reuses the remaining complete Phase 08 Arabic fields only after verifying the current English import fields match, allowing only the repository's established float8 serialization equivalence.

All **18 pending** destinations listed in the table have been compared with their current English content. Existing Arabic was reused where its meaning was already appropriate. Petra, Jerash, Shaumari, Pella and Little Petra descriptions were refined for precise meaning, readable tourism terminology and paragraph parity. Hours, fee categories, tax/package distinctions, planning estimates, access limitations and unknown values remain qualified in both languages. No new tourism facts, surveyed entrances, prices or opening hours were invented.

**Wadi Mujib:** prepared a complete current-English-aligned Arabic record and retained the exact existing identity. The older Arabic-only visitor guidance included fee claims not present in current English. The proposed guidance now contains only current English safety cautions; it does not carry those extra old fees. Its source-version mismatch is documented rather than silently marking the hosted row current. Minimum-age guidance remains explicitly historical and subject to operator confirmation; a family suitability tag must not imply that children can enter wet trails.

Null English fields remain null. Arabic prose supports the current RTL/LTR system. Automated checks establish field coverage, IDs, versions, checksums, null/paragraph parity, readable Arabic characters and unsafe-content absence; they do not replace an independent bilingual owner/editor review or factual verification.

## 3. Image gaps — resolved locally, not made live

**All 17 missing-cover destinations have an existing destination-specific selected cover candidate** with source/author/licence evidence and a matching existing private image record. No new copyright scraping, unrelated stock substitution, public bucket, upload, approval or byte replacement was needed.

The [image review guide](content/PHASE_14_1_IMAGE_REVIEW.md) and [exact per-file plan](content/phase14-1-media-plan.json) identify all 30 selected files: source file page, author, licence/link, preserved original and upload paths/checksums/bytes, existing image ID/Storage path, cover/gallery choice, change disclosure and 120 optimized WebP renditions (320/640/1280/2400 pixels, without upscaling). Originals and oversized-file upload adaptations are preserved; no needless recompression was applied. Hashes, file decoding, dimensions and size-limit checks passed.

Current read-only Commons checks returned **34/34 matching photographic licence metadata and original-file identities**, with saved response fingerprints/revisions in [origin audit](validation/phase14-1-media-origin.json) and `docs/evidence/phase14-1/commons-{0,8,16,24,32}.json`. Selected photos retain full attribution and modification notices; adapted ShareAlike files retain their original licence. This is evidence, not a warranty or CMS/owner approval. See [Commons reuse guidance](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia) and [CC BY-SA 4.0 terms](https://creativecommons.org/licenses/by-sa/4.0/).

Four candidates remain **excluded**, even though their photographic licence metadata matches:

| Candidate | Unresolved issue / disposition |
| --- | --- |
| `madaba-st-georges-church-1` | Wall-mounted map reproduction/display; exact exhibit identity and suitable caption unresolved. Do not represent it as the surviving floor mosaic. Use selected `madaba-st-georges-church-2` instead, subject to owner review. |
| `umm-al-jimal-1`, `umm-al-jimal-2` | Modern interpretation panels containing third-party text/photos; underlying-work reuse evidence unresolved. Use selected ruins photograph `umm-al-jimal-3`, subject to owner review. |
| `aqaba-marine-reserve-1` | Exact photographed beach and relationship to current reserve boundaries unresolved. Excluded. The current hosted approved project-owned cover is a separate record, not this candidate; its precise subject remains an owner-verification item. |

Additional unresolved evidence: the old Umm Qais test upload explicitly lacks established rights and stays unapproved. One approved Wadi Mujib gallery row cites a Google image-search URL while its attribution/evidence names a Commons original; reconcile the citation against the original byte hash before treating that source field as clean. The owner-declared project photographs are not re-certified by this phase. Bundled Figma exports and the private Aqaba prototype illustration are not substituted for verified destination photographs.

**Live images resolved by this task: 0.** Local evidenced cover candidates prepared for the 17 gaps: 17. Public gaps still requiring owner decisions/authorized approval: all 17 slugs marked MISSING in the table. Additional gallery photography is optional content coverage, not a new publication stage; Citadel, Madaba St George’s Church, Pella and Umm Al-Jimal currently have one selected candidate each and no additional selected gallery image.

## 4. Content presentation and remaining factual issues

Actual guest browser checks passed for all 24 destinations in English desktop (1366px) and Arabic mobile (390px). They verify correct source/Arabic descriptions, language direction, the 19 honest Arabic fallback notices, actual approved-cover loading or the neutral unavailable-image fallback, unknown admission values, and no horizontal overflow. Six representative detail-page axe scans cover photographed, missing-photo and stale-Arabic cases. The local review preview loads all 30 real image files and has no desktop/mobile overflow.

Existing prices are not recast as confirmed total costs. Visit durations stay planning estimates; unknown hours and transport/access remain unknown. Source text is rendered as text, not injected HTML. There is no new editorial stage or additional condition on selecting Published, Draft or Archived.

Specific owner priorities:

1. **Petra / Little Petra:** distinguish site, ticket-office and seasonal hours; preserve exact dated schedule qualifications. Confirm current trail access, ticket eligibility and independent transfers/guiding costs.
2. **Al-Maghtas:** resolve the homepage seasonal last-entry times versus the generic contact-page cut-off. The heritage pin is not the controlled visitor gate.
3. **Mount Nebo:** confirm seasonal transition dates and current fees/eligibility.
4. **Roman Theatre / Madaba / Um er-Rasas:** do not transfer museum/park prices to a different attraction or church admission. Site-specific applicability remains uncertain.
5. **Shaumari / Azraq / Wadi Mujib:** distinguish tax-inclusive activity packages from entrance-only rates; confirm reservations, weather, age/safety and activity access. Do not guarantee wildlife sightings or wet-trail opening.
6. **Aqaba:** establish a legal visitor arrival point and applicable marine-zone rules; an offshore heritage point is not driving directions. The old Commons cover gap is historical; current approved cover availability does not verify access or every depicted-location claim.
7. **All 24:** review entrances, accessibility, parking and current operating conditions. Twenty unknown hours, 24 NULL numeric price pairs and absent optional English fields are explicitly listed, not filled with guesses. Eighteen records still need factual owner review despite Published status and `is_demo=false`.

## 5. Legacy failures — classification and retained coverage

| Suite / issue | Classification | Correction and evidence |
| --- | --- | --- |
| `check-phase04.mjs` and inherited `check-localization-database.mjs` | Obsolete editorial-gate expectation | Assert the exact two missing essential-content issues instead of an obsolete minimum issue count. Cover replacement can coexist with publication, while its pending image stays inaccessible to guests. Retained authorization/session/stale-version, incomplete-content, immutable published-content, category/media dependency, original-evidence and translation RLS checks. **12/12 and 16/16 PASS.** The localization script inherits the corrected fixture and did not need its own edit. |
| `check-phase08.mjs`, `check-phase08-freshness.mjs` | Test clock / historical-fixture problem | Evaluate historical successful evidence at its actual recorded build/check time. Add/retain exact expiry, future-time, missing proof, content/hash mismatch and failed-origin checks. Actual production `Date.now()` freshness validation and all old evidence dates/checksums remain unchanged. **10/10 and 12/12 PASS.** |
| `check-phase05-browser.mjs` | Obsolete six-destination result/always-has-photo expectation | Capture genuine current anonymous catalog responses and assert the ranking engine's expected result using actual saved preferences. Check either real approved-photo delivery/credits or the required neutral fallback. Keep selection, favourites, details, caching, tab stability, diversity, strict unknown-cost rejection, explicit alternatives, impossible constraints, network/empty/single/sparse/expiry and accessibility tests. **11/11 PASS:** six live language/width journeys plus five fixtures. |
| `check-admin-refinement.mjs` | Incomplete API fixture and obsolete route/selectors | Add current category-relationship responses and server-side filtering to the fixture; address the retained advanced editor explicitly with `?advanced=1`; use current status controls/Auth heading; activate the lazy mobile map before waiting. All original map interaction, stale save, preview, filtering, layout, logout and axe coverage retained. **13/13 PASS.** No application routing was changed to satisfy the test. |
| `check-destination-status-browser.mjs` | Test synchronization race exposed on an initial run | The retry wait previously accepted a disabled button during the request, allowing premature pagination. Wait for the selector to be enabled and the unchanged-status save button disabled. Full rerun: **2/2 PASS**, six directed transitions per language plus save/persistence/error/retry/pagination. |
| Phase 07 old Auth-shell selector | Already corrected in Phase 14 | No additional selector edit in this phase. Current offline discovery regressions remain passing; no new claim that a real account session was tested. |

No test was disabled, removed or bypassed. No core application defect requiring a behavior change was established by these failures. The safe application copy change replaces “Live publication blockers” with “Saved content checks” in both languages, accurately describing the existing quality panel without reinstating approval gates.

A newly generated local review preview initially overflowed on mobile and deferred image decoding; its layout and preview-only checks were corrected. Final complete browser rerun is **49/49 PASS, zero recorded errors** (48 real anonymous detail journeys plus local preview), rather than counting the initial failed preview as successful.

## 6. Verification results

| Check | Final result / evidence |
| --- | --- |
| Offline regression runner | **13/13 suites PASS**; database, tourism, map, Admin, recommendations, accounts, discoveries, search, Phase 08, localization, localization DB, privacy, SEO. `validation/local-privacy-offline-regressions.json`. Disposable PGlite/model/static tests, not managed Auth/Storage integration. |
| Content preparation/integrity | **5/5 groups PASS**; 24 identities/relationships, exact 19 proposals, source versions/checksums/null/paragraph coverage, unsafe content and image mapping. `validation/phase14-1-content-tests.json`. |
| Local media | **34 originals / 30 selected uploads / 120 WebP renditions PASS**; SHA-1/SHA-256, bytes, actual Pillow decoding, dimensions, size limits and no upscaling. `validation/phase08-media.json`. |
| Current file-level origin evidence | **34/34 metadata/original matches**, with the four subject/underlying-work exclusions preserved. `validation/phase14-1-media-origin.json`. |
| Destination detail / review browser | **49/49 PASS**, zero browser errors; English desktop and Arabic mobile for 24 destinations; six representative axe scans; all 30 local review images decode. `validation/phase14-1-browser.json`. Separate final preview retest: `validation/phase14-1-local-preview.json`. |
| Recommendation browser | **11/11 PASS**, zero errors. Genuine anonymous reads and separately identified failure/empty fixtures. `validation/phase05-browser.json`. |
| Advanced Admin browser | **13/13 PASS**, zero errors; stateful isolated API/Auth fixtures. `validation/phase04-refinement-browser.json`. |
| Current Admin dashboard browser | **4/4 PASS**, bilingual desktop/mobile metrics/charts/axe. `validation/phase14-admin-browser.json`. |
| Destination statuses | **8/8 DB groups + 2/2 browser groups PASS**. Local/disposable only; no real status changes. `validation/destination-status-database.json`, `validation/destination-status-browser.json`. |
| Auth regressions | Premium Auth **4/4 PASS**; retained Phase 06 browser report **11/11 PASS**, account-only report **3/3 PASS**, all with zero recorded errors. `validation/auth-premium-browser.json`, `validation/phase06-browser-4195.json`, `validation/phase06-browser-4195-account.json`. Controlled fixtures; genuine email delivery/password changes not attempted. |
| Localization | `npm run audit:localization`: **0 missing static keys**. Model and disposable translation RLS tests PASS. Both public-language browser journeys and local complete Arabic preview PASS. |
| Assets | `npm run validate:assets`: **83 references / 48 unique originals PASS**. Selected media independently checked above. |
| Lint | `npm run lint` (Oxlint): **PASS, exit 0**. |
| Production build | `npm run build`: **PASS, 3235 modules**. Existing >500 kB chunk warning remains (main ~556.69 kB; MapLibre ~1090.06 kB, minified). No performance-warning suppression or deployment. |
| Hosted preservation | **24 places / 24 translations / 45 images / 48 category relationships unchanged** in the compared identities, versions/states/approvals and links. `validation/phase14-1-hosted-preservation.json`. |

Skipped deliberately: hosted content writes/approval, hosted transition tests, genuine Auth/role changes, destructive account/Storage tests, deployment and unavailable Docker/WSL integration. Real deletion integration, real controlled-inbox Auth acceptance and production-only header/domain behavior remain outside this content QA's verified scope.

## 7. Exact local changes

Application copy only:

- `src/features/admin/Overview.jsx`
- `src/i18n/locales/en.json`
- `src/i18n/locales/ar-JO.json`

Repaired retained tests:

- `scripts/check-phase04.mjs`
- `scripts/check-phase08.mjs`
- `scripts/check-phase08-freshness.mjs`
- `scripts/check-phase05-browser.mjs`
- `scripts/check-admin-refinement.mjs`
- `scripts/check-destination-status-browser.mjs`

New maintainable preparation/checks:

- `scripts/audit-phase14-1-media.mjs` — read-only Commons origin evidence, local output only.
- `scripts/prepare-phase14-1-content.mjs` — deterministic local review generation; no network or database writes.
- `scripts/check-phase14-1-content.mjs`
- `scripts/check-phase14-1-browser.mjs` — read-only anonymous destination UI and standalone local-preview checks.
- `supabase/content/phase14-1-arabic-corrections.js`
- `supabase/content/phase14-1-arabic-review.json`

New report/review artifacts:

- `docs/PHASE_14_1_CONTENT_READINESS.md`
- `docs/content/PHASE_14_1_DESTINATION_AUDIT.md`
- `docs/content/PHASE_14_1_ARABIC_REVIEW.md`
- `docs/content/PHASE_14_1_IMAGE_REVIEW.md`
- `docs/content/phase14-1-media-plan.json`
- `docs/content/phase14-1-review.html`
- `docs/validation/phase14-1-content-baseline.json`
- `docs/validation/phase14-1-hosted-preservation.json`
- `docs/validation/phase14-1-preparation.json`
- `docs/validation/phase14-1-content-tests.json`
- `docs/validation/phase14-1-media-origin.json`
- `docs/validation/phase14-1-browser.json`
- `docs/validation/phase14-1-local-preview.json`
- `docs/evidence/phase14-1/commons-0.json`, `commons-8.json`, `commons-16.json`, `commons-24.json`, `commons-32.json`.

Retest reports/screenshots and existing evidence outputs were regenerated by the named suites. Exact generated output paths are listed in the companion [artifact inventory](validation/phase14-1-artifact-inventory.json); local `dist/` was rebuilt and is not deployed. Existing originals, optimized photograph bytes, the Phase 08 import manifest, evidence dates and migrations were not rewritten. No Git repository is present, so this is a task change inventory rather than a claimed Git diff.

## 8. Pending synchronization and release decisions

1. Owner/editor reviews the 19 complete Arabic proposals, current English uncertainty notes, selected photo identities and licence obligations. This task's linguistic preparation does not authorize hosted approval.
2. Obtain explicit authorization for a separately scoped synchronization. Re-read the existing IDs, English and Arabic versions and image evidence immediately before any write; stop on concurrent differences. Apply only authorized localized fields/approvals, preserve English, IDs, slugs and category/media relationships, and **keep all 24 current statuses unchanged**. Thirteen pending descriptions reuse appropriate existing Arabic; five are refined and Wadi Mujib is fully corrected. Existing current/reviewed Arabic for the other five is not part of the change set.
3. Use the 30 already linked private image records; do not create duplicates or expose the private bucket. Approve only the owner-selected files with their exact original licence, attribution, change disclosure and matching byte identity. Never approve the four excluded candidates or the old rights-unverified test upload.
4. If a chosen CMS action requires a Published destination to become Draft, stop for separate explicit status-change authorization. Do not bypass the safeguard or silently change statuses. This task does not execute the older Phase 08 publication/import workflow.
5. After authorized synchronization, verify guest Arabic visibility, intended covers/gallery/credits, image loading and private-image isolation, and compare all 24 identities/statuses/relationships again. Freshly verify operating facts; rebuilding a package must never renew stale source evidence.
6. Before Phase 15 release approval, retain the Phase 14 gates: legal operator/contact and review; usable rights-request arrangements with unverified deletion fulfillment unavailable; isolated privacy/last-Admin safeguard testing; controlled-inbox Auth and both Admin session acceptance; reviewed security settings; approved production origin/redirects/hosting headers and crawler strategy.

**Decision: NO-GO remains.** The reported legacy test failures are repaired and local content proposals are ready for review. Hosted Arabic/media gaps, factual/rights decisions and the independent Phase 14 release blockers still require evidence and authorization; no unrestricted-release approval is implied.

