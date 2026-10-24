# Automated tourism content publishing

19 October 2026 · Unseen Jo · Supabase `dkhwwvoplhfjccvjegty`

> Historical snapshot: the zero-published result below describes the original check. A read-only recheck on 20 October 2026 found all six existing records published with `is_demo=false` in project `dkhwwvoplhfjccvjegty`. See [Explore layout and current-state verification](EXPLORE_CARD_LAYOUT_REPORT.md). The layout task made no publication changes and does not establish who performed the intervening publication.

## Result

**Zero of the six destinations are live. All six remain drafts.** Research, media preparation, guarded batch publishing and an atomic bilingual publication operation are implemented and tested. Actual publishing is blocked by the absence of an application administrator session accessible to this agent. The dedicated MCP is connected to the correct project, but calling `admin_cms_status()` returns PostgreSQL **42501: Administrator session required**. Browser discovery exposes no connected browser. MCP database access is not treated as an administrator identity, and no JWT, reviewer identity or signature was fabricated.

The batch workspace is **http://127.0.0.1:4184/admin/publishing**. It uses the existing dashboard and current signed-in account. No per-field or per-destination confirmation dialogs were added. The page describes the authorized batch operation before its Run button. It can be executed once a genuine session is available; this report does not claim it has executed on hosted content.

## Destination status and research

The complete saved English and Arabic descriptions were checked against the existing research package and rechecked against primary sources. Existing English source text, IDs and slugs remain unchanged. Optional unknowns remain NULL rather than fictional prices, hours or accessibility claims. Every saved point is identified as an approximate geographic reference, not a surveyed visitor entrance.

| Existing destination | Research and qualifications retained | Prepared photos | Hosted result |
| --- | --- | ---: | --- |
| Ajloun Forest Reserve / محمية غابات عجلون | [JTB](https://international.visitjordan.com/wheretogo/ajloun/) supports woodland, spring flowers and separate community trails. [UNESCO](https://www.unesco.org/en/mab/ajloun?hub=66369) programme evidence distinguishes the broader biosphere designation. Arrival/access remain qualified. A new woodland cover replaces the preparation-stage cover gap. | 2 | Draft; blocked |
| As-Salt Historic Centre / وسط السلط التاريخي | [UNESCO](https://whc.unesco.org/en/list/689/) supports the late-Ottoman limestone townscape, hospitality traditions and inscription. UNESCO's DMS reference converts to the saved point. District access is distinct from museum tickets; visit duration is editorial advice. | 3 | Draft; blocked |
| Mujib Biosphere Reserve / محمية الموجب للمحيط الحيوي | [JTB](https://international.visitjordan.com/wheretogo/wadi-mujib/) and the [RSCN 2026 operator list](https://www.rscn.org.jo/uploaded_files/reservation/Mujib%20Biosphere%20Reserve%20Trails%202026.pdf) distinguish routes and fees. Older age guidance stays dated. Weather, swimming requirements and actual trail opening require operator confirmation; a season is not an opening guarantee. | 2 | Draft; blocked |
| Dana Biosphere Reserve / محمية ضانا للمحيط الحيوي | [JTB](https://international.visitjordan.com/wheretogo/dana-feynan/) and [RSCN 2026](https://www.rscn.org.jo/uploaded_files/reservation/Dana%20Biosphere%20Reserve%20Trails%202026.pdf) distinguish village visits, longer trails, guiding and transfers. No universal duration/price or disputed species totals are asserted. | 3 | Draft; blocked |
| Iraq Al-Amir / عراق الأمير | [JTB Amman](https://international.visitjordan.com/wheretogo/amman/) supports the area, nearby Qasr El-Abd and cooperative context. Area, palace and cooperative are separate stops; ticket scope, opening, caves and step-free access remain uncertain. | 1 | Draft; blocked |
| Umm Qais / أم قيس | [JTB](https://international.visitjordan.com/wheretogo/umm-qais/) and the [Ministry](https://www.mota.gov.jo/EN/Pages/Umm_Qays) support the site, Ottoman village and museum. Conflicting operating-hour information is not converted into a fixed schedule. Eligibility-based prices remain dated evidence. | 1 | Draft; blocked |

The saved backend state still lacks claims/location review flags, approved covers and reviewed current Arabic. Those conditions were not silently flipped through MCP. The batch is designed to perform the supported saved-evidence operations through an actual authorized account, then ask the unchanged backend validation to decide readiness. Authentication is the common execution blocker for all six, not an assertion that their current draft rows already pass publication checks.

Fresh evidence is in [primary HTTP retrievals](evidence/automated-publishing/primary-source-retrievals.json) and [independent primary-source/translation cross-checks](evidence/automated-publishing/web-source-cross-checks.json). Six reference coordinates match primary evidence: five named operator/tourism map targets and As-Salt's UNESCO DMS conversion. Some UNESCO direct requests returned a challenge or a 200 “Request Rejected” page; those are explicitly distinguished from usable source content. Readable web/indexed official records supplied corroboration. An initial Commons 429 for Umm Qais is retained in the evidence, together with the successful later retry. No blocked response is represented as a successful source read.

## Bilingual content and provenance

Structural tests independently check source identity, complete bilingual fields, immutable English values, supported coordinate references and unavailable optional values. A semantic comparison of all six English/Arabic descriptions checked names, geographic scope, numbers expressed as words, dated fee qualifications and safety/access cautions. This is machine-assisted checking, not a claim of personal administrator review.

The publication plan keeps the original Arabic fields separately from the proposed publication copy. For Umm Qais, that proposal removes editor-only `um.jfif` and obsolete-UTM maintenance sentences from visitor-facing guidance while preserving price, operating-hour and arrival cautions. The saved translation has not been changed. Before/expected snapshots preserve its original wording; the batch refuses newer text, newer editorial notes or outstanding Needs Changes feedback rather than overwriting them. Existing audit history remains intact. The existing audit system records actors and changed field names, not a full text revision archive; this work does not invent retrospective versions.

Machine method, source URLs, retrieval date, geographic qualifications and the evidence fingerprint are written into source-review notes by the batch. Backend reviewer fields are assigned only by the normal real-session operations. The actual account is identified as the authorized executor, with the machine method stated explicitly. A checksum detects changed package bytes; it is not presented as an independent cryptographic attestation of factual truth.

## Photographs and reuse rights

Twelve identified photographs are prepared, with original files retained. The existing eleven candidates were checked against live Commons file metadata, original SHA-1/SHA-256 and prepared-file SHA-256. Their subjects were visually compared using the [identity contact sheet](evidence/automated-publishing/photo-identity-contact-sheet.jpg). Licence, creator, source, dimensions, attribution and restrictions/warning checks are recorded individually in the [media package](evidence/automated-publishing/media-package.json).

The additional [Ajlun Forest Reserve 42 photograph](https://commons.wikimedia.org/wiki/File:Ajlun_Forest_Reserve_42.jpg) is a 4000×3000 woodland/trail original by Mohammad hajeer under CC BY-SA 4.0. Its named file-page subject, camera reference and visual content agree with reserve context. The historical 2005 campsite image remains a labelled gallery candidate, not a current woodland cover. The other originals range from 1600 pixels wide to more than 3400 pixels wide. No image was upscaled or generated.

[Thirty-six responsive JPEG derivatives](evidence/automated-publishing/responsive-manifest.json) were prepared locally at eligible widths of 640, 1280, 2000 and 2560 pixels, quality 90, with change notices and source licences retained. Originals remain unchanged. CC BY/CC BY-SA attribution and adaptation conditions are retained, including applicable share-alike terms; CC0 and public-domain files retain their documented basis. The [Umm Qais theatre page](https://commons.wikimedia.org/wiki/File:Umm_Qais_(West_Theater).jpg) includes public VRT permission confirmation; private correspondence was not accessed.

**New hosted uploads: 0. New hosted image approvals: 0.** Eleven eligible photographs were already associated before this task; their approval states remain pending. The new Ajloun original and the responsive derivatives are local preparation, not completed Storage uploads or active `srcset` delivery. The old `um.jfif` row remains unapproved and excluded from the eligible package. The existing unlinked Storage object was preserved.

## Batch workflow and safeguards

1. Validate the dedicated project, six exact IDs/slugs, package fingerprint and actual evidence age. Rebuilding a plan alone cannot renew stale source/licence evidence.
2. Require a confirmed real account and the existing `admin_cms_status` permission check. Stop subsequent writes after sign-out/account change. Do not export credentials.
3. Refuse changed English, Arabic, editorial feedback or saved versions. Never create unrelated destinations or overwrite English through `savePlace`.
4. Verify original/derivative evidence, actual stored-image bytes, identity, creator and rights. Reuse unique existing associations; upload only missing eligible files through the existing private Storage workflow. Never approve an unrelated test upload or retry an ambiguous upload blindly.
5. Record machine provenance, verify sources/geographic precision, save Arabic independently where needed and perform the normal saved-translation review through the real session.
6. Run existing mandatory publication validation. One destination's error does not stop other eligible destinations.
7. Call `admin_publish_localized_place`: it checks the current administrator, locks saved versions, requires current reviewed Arabic and runs the existing publication checks/RPC. English publication and Arabic source-version synchronization complete in one transaction. A downstream failure rolls the publication back.

The new RPC is `SECURITY INVOKER`, has an empty search path, denies anonymous execution and performs the existing active-session administrator check. Existing RLS, table grants, role assignments, Storage policies and publication requirements are unchanged. No privileged service key or fabricated Auth claim is used.

## Validation and remaining limits

* Six automated-publishing groups passed with actual local file hashes and isolated repository fixtures, including stale/tampered evidence, actor changes, changed notes, non-overwriting behavior, partial failure and duplicate prevention.
* Thirteen disposable PostgreSQL/PostGIS groups passed for the atomic operation and existing CMS controls, including permission/version failures, rollback and public bilingual consistency. These synthetic publications are not hosted publications.
* Real hosted anonymous checks passed. The new publication RPC denies anonymous execution. Actual public API published count is **0**. Home, Explore and Map rendered against genuine anonymous Supabase data in both languages; no demo responses were substituted in those six checks. Published destination detail/media verification cannot be claimed before publication.
* All 32 existing regression jobs passed. Full outcomes, including reruns after fixes, are in [the regression index](validation/publishing-performance-regressions.json). Build/Oxlint/83 asset references and 48 original branding assets passed. MapLibre's existing large-chunk warning remains.
* Final comparisons show all existing English rows, source reviews, Arabic rows and image rows unchanged. Role rows, Storage references, existing policies, table grants and bucket configuration match the prior preservation snapshot. Counts remain six drafts, twelve unapproved image rows, thirteen Storage references and two role rows. See [before](validation/automation-before.json), [after](validation/automation-after.json) and [live visibility](validation/live-publication-status.json).
* The existing leaked-password-protection advisory remains unchanged; no Auth setting was changed. [Supabase guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Prepared commands: `node scripts/research-automated-content.mjs`, `node scripts/verify-automated-photos.mjs`, `node scripts/prepare-automated-package.mjs`, `python scripts/prepare-responsive-tourism.py`, then `node scripts/build-publication-plan.mjs`. Challenges and failed source/rights checks require genuine renewed evidence; they must not be marked successful to refresh a date. Each destination expires conservatively using its oldest relevant retrieval; one stale destination does not stop other eligible entries. The whole prepared manifest must also be less than 24 hours old.

Main changes: `src/features/admin/automatedPublishing.js`, `AutomatedPublishing.jsx`, `AdminApp.jsx`, `repository.js`; migration `20261019173712_phase04l_atomic_localized_publication.sql`; publishing localization resources; preparation/verification scripts and evidence artifacts. The original Supabase connection was preserved. No paid service or unrelated destination was added. Phase 05 was not started.
