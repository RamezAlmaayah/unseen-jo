# First live destination publication readiness

Reviewed 19 October 2026, Asia/Amman. Project: `dkhwwvoplhfjccvjegty`.

**Recommendation: prepare Umm Qais first. It is not ready to publish.** Four backend requirements remain unmet: explicit claims review, active primary category, sourced/reviewed coordinates, and an uploaded rights-approved cover. The existing description passes the length rule but needs clearer attraction scope. No draft, image metadata, role, policy or hosted configuration was changed during this review. No publication was attempted.

**Owner clarification and follow-up:** the current image is a test upload with unknown source/rights. Do not approve, publish or delete it. Following the owner's explicit request, only its Rights evidence field was marked **UNVERIFIED — TEST UPLOAD ONLY**; its licence basis/approval remain null and it remains non-cover. The destination content is unchanged. Two licensed candidates were downloaded and visually inspected locally; see the [photograph evidence and attribution record](evidence/umm-qais-media/README.md). Bashar Tabbah's West Theatre image is recommended for owner selection, not automatically uploaded/approved. A further delivery requirement is discoverable public photographer/source/licence credit: current attribution appears only as plain text in the opened photo viewer. Resolve and browser-verify that before publication.

## Comparison of the six live drafts

All six are non-demo drafts. All lack city/address, coordinates, primary category, completed claims/location review, and visitor planning fields. Existing linked categories are active. None has an approved cover.

| Destination / slug | Current categories | Description length | Media | Assessment |
| --- | --- | ---: | --- | --- |
| Umm Qais / `umm-qais` | History, Culture | 125 | One linked, unapproved JPEG | Recommended: official attraction narrative and linked map point; existing upload can be evaluated without sourcing a whole new media set. Upload existence gives no rights assurance. |
| As-Salt Historic Centre / `salt-historic` | History, Culture | 108 | None | Strong alternative: precise UNESCO property documentation, but a historic urban area needs a carefully labelled representative point and new cleared photography. |
| Iraq Al-Amir / `iraq-al-amir` | History, Culture | 95 | None | Clarify whether the listing is the area or Qasr El-Abd before choosing a point and visitor instructions. |
| Ajloun Forest Reserve / `ajloun-forest` | Nature | 69 | None | Also fails the 80-character description rule; select the visitor experience/entrance rather than a reserve-wide centre. |
| Dana Biosphere Reserve / `dana-reserve` | Nature | 110 | None | Reserve-wide scope needs a chosen visitor base or clearly labelled centre, with trail-specific planning evidence. |
| Mujib Biosphere Reserve / `wadi-mujib` | Nature, Adventure | 113 | None | Requires particular care distinguishing reserve from water-trail entry, operating conditions and activity restrictions. Not the easiest first publication. |

This ranking is an editorial judgment about the work needed, not an automated quality score. Official comparisons: [UNESCO As-Salt](https://whc.unesco.org/en/list/689/), [JTB Amman including Iraq Al-Amir](https://international.visitjordan.com/wheretogo/amman/), [JTB Dana & Feynan](https://international.visitjordan.com/wheretogo/dana-feynan/), [JTB Wadi Mujib](https://international.visitjordan.com/wheretogo/wadi-mujib/). The stored RSCN reserve-list URL could not be retrieved in this review; replace broad index citations with destination-specific official evidence when those drafts are prepared. RSCN's [2026 Mujib trails document](https://www.rscn.org.jo/uploaded_files/reservation/Mujib%20Biosphere%20Reserve%20Trails%202026.pdf) is a better future starting point than assuming all reserve visits are the Siq Trail.

## Selected record and proposed content — approval required before saving

Editor: **http://127.0.0.1:4184/admin/places/066dbed9-ca25-421e-8187-00fbc78fcda3**.

| Field | Current saved value | Proposed handling |
| --- | --- | --- |
| Name | Umm Qais | Keep, or approve “Umm Qais Archaeological Site (Gadara)” to make scope explicit. |
| Slug | `umm-qais` | Keep. |
| Description | “The modern town associated with ancient Gadara in northern Jordan, with archaeological remains overlooking the Jordan Valley.” | Supported in broad outline, but distinguish the archaeological visit from the modern town. Proposed replacement below. |
| Categories | History, Culture | Keep both; choose **History** as active primary category. |
| Source | `https://international.visitjordan.com/wheretogo/umm-qais/` | Keep as primary; record additional URLs and check date in Review notes. |
| City / address | Blank | City: Umm Qais. Address proposal: “Umm Qais archaeological site, Irbid Governorate, Jordan.” This is descriptive geography, not a verified postal address or entrance instruction. |
| Latitude / longitude | Blank | Provisional site-area point: **32.6556875, 35.6780625**; see precision boundary below. |
| Reviews | No `place_reviews` row; verification fields null | Record only after final saved text and point have actually been reviewed. |
| Prices / visit duration | Blank | Keep blank pending a clear editorial treatment; do not invent an average, visit duration or free admission. |
| Best time / transport / suitable groups | Blank | Transport proposal below. Leave other unknowns blank; do not infer accessibility or family suitability. |

Proposed original description, supported by sources S1–S3:

> Explore the archaeological remains of Gadara at Umm Qais in northern Jordan. The site includes a colonnaded street, theatre remains and an Ottoman-era village, with views across the Jordan Valley. The local museum is housed in an Ottoman-period building and displays archaeological finds from the area. Confirm current opening arrangements before travelling.

Proposed transport note, supported by S4:

> The Jordan Tourism Board describes the drive north from Amman as about two hours. This is a planning estimate, not a guaranteed journey time; check your route and current site access before departure.

These are reviewable proposals only; none was entered into the database.

## Evidence register and unresolved facts

Checked on 19 October 2026. Sources support destination facts, not automatic image reuse rights.

| ID | Evidence | What it establishes / limitation |
| --- | --- | --- |
| S1 | [Jordan Tourism Board: Umm Qais](https://international.visitjordan.com/wheretogo/umm-qais/) | Gadara identification, hilltop setting, street/theatres, Ottoman village and museum. Avoid copying promotional prose or adding unsupported superlatives. |
| S2 | [Ministry of Tourism: Umm Qays](https://www.mota.gov.jo/EN/Pages/Umm_Qays) | Corroborating official site/museum description. Both site and museum link to the same map point; it is not clearly labelled as an entrance. The page includes a maintenance notice; do not treat its footer date as proof every detail was recently verified. |
| S3 | [UNESCO Tentative List: Gadara, reference 1558](https://whc.unesco.org/en/tentativelists/1558/) | State-submitted archaeological description. **Tentative List, not an inscribed World Heritage property.** Its UTM Zone 36 coordinates omit a datum; do not silently convert them into precise WGS84 entrance coordinates. |
| S4 | [JTB: How to Get There](https://international.visitjordan.com/wheretogo/umm-qais/?tabId=157) | Approximately two-hour drive north from Amman. No guaranteed traffic time or verified public bus timetable. |
| S5 | [Official linked map location](https://www.google.com/maps/place/MM4H%2B76/@32.6556875,35.6758738,17z/data=!3m1!4b1!4m5!3m4!1s0x0:0x0!8m2!3d32.6556875!4d35.6780625) | Target encoded by both S1 and S2 is latitude 32.6556875 / longitude 35.6780625. The `@` camera longitude 35.6758738 is **not** the target longitude. Map content required JavaScript; entrance identity was not independently established. |
| S6 | [Ministry entrance fees](https://www.tourism.jo/EN/Pages/Entrance_Fees) | Lists Umm Qays at 0.25 JOD for Jordanians and 5 JOD for foreigners, including museum entry. These are separate eligibility rates, not a universal price or spending estimate. Reconfirm before publication and describe eligibility explicitly if included. |
| S7 | [Jordan Pass opening-hours table](https://jordanpass.jo/Contents/Opening_Hours.aspx) | Seasonal schedule for Umm Qays. Its season headings overlap for April; do not infer a complete annual calendar. |
| S8 | [Jordan Pass included attractions](https://www.jordanpass.jo/Contents/Jordan_Attractions.aspx) | Includes Umm Qays, but shows a generic 08:00–17:00 that differs from S7. Resolve with the responsible operator or omit fixed hours and link official guidance. |

Coordinate decision: enter S5's target provisionally and select **Approximate centre**, with the source-page URL in Coordinate source and the map URL plus uncertainty in Review notes. Do not choose **Visitor entrance** without operator/on-site confirmation. Decimal precision is not positional accuracy. The picker may display/produce six decimal places; this does not validate the site entrance. Because public directions use the saved point and do not expose the private precision note, final editorial review must ensure the point is a suitable visitor destination, or obtain a verified entrance point before first publication. Do not claim entrance verification from this research.

Unknowns to resolve or deliberately omit: current opening/access restrictions, entrance location, visitor accessibility, duration, best season, group suitability, public transport details, and any optional price claims. None is made true by filling a required text field. Avoid adding them to achieve visual completeness.

## Actual media audit

Live linked image ID: `f30f04d6-804e-4a1b-8ed5-14bb6218b510`.

| Property | Observed value / result |
| --- | --- |
| Linked object | `066dbed9-ca25-421e-8187-00fbc78fcda3/e02dd86c-a43b-43b1-8820-670115101f7f.jpg` |
| Storage metadata | `image/jpeg`, **63,156 bytes**; linked object exists. MIME/size metadata is not a visual identity or resolution check. |
| Alt text | `um.jfif` — a filename, not an adequate destination description. |
| Cover | False. |
| Rights | Source URL, attribution, licence basis, licence evidence, approved_by and approved_at are all null. **Not cleared for publication.** |
| Actual image identity | Unverified: no connected authenticated browser surface was available to read the private bytes. The filename does not establish that it depicts Umm Qais. |
| Resolution / sharpness | Unverified: no pixel dimensions are stored in the queried metadata. Byte size cannot establish width, height, detail or suitability. |
| Additional object | `066dbed9-ca25-421e-8187-00fbc78fcda3/49ff1df3-0199-4e81-947f-146ddb32cbaa.jpg`, **30,220 bytes**, unlinked. Preserved; no deletion authorized or necessary for publication. |

The repository's public demo `umm-qais.jpg` is a separate asset and must not be substituted as proof of the private upload's identity or rights. No private image URL or credentials were extracted. The Storage bucket remains private.

Required media evidence: original photographer or rights holder; original file or exact source page; permission/licence scope allowing the intended website use and derivatives/crops; licence version/receipt or written permission; required attribution and any restrictions. Website availability, a tourism-board credit, a Google image result or a downloaded file alone does not grant reuse rights. If owned, document photographer, date/location and ownership, using a private evidence document where necessary; the CMS requires an HTTPS source reference, so prepare a non-secret stable provenance reference. Do not put private agreements or access tokens into a public attribution/source field.

Before approval, inspect the actual file in the administrator's private preview and original-image viewer: confirm identifiable Umm Qais landmarks against official reference imagery, read natural pixel dimensions, inspect at 100% for compression/upscaling/watermarks, and check desktop/mobile crops. Aim for at least 1600 pixels across for a wide hero as an **editorial target, not an existing backend rule**; use a genuine higher-resolution original rather than upscaling. Enter descriptive alt text only after seeing the photograph. If rights cannot be demonstrated, replace it with an owned or expressly licensed photo; do not approve it merely to clear the checklist.

## Backend enforcement and dashboard coverage

Live definitions inspected read-only: `admin_publication_issues`, `admin_set_place_status`, `admin_approve_image`, and `unseen_private.guard_publication`, plus active INSERT/UPDATE triggers, constraints and RLS flags. The validator requires:

1. Name at least 3 characters and description at least 80 characters.
2. Non-demo content.
3. A source URL, reviewer identity/time and explicit essential-claims review.
4. An active primary category assigned to the place, and no inactive assigned categories.
5. Paired coordinates within the configured Jordan bounding box, location review, precision and coordinate source.
6. A cover image with saved rights approval and matching uploaded Storage object.

The status RPC checks the actual administrator session, locks the record and rejects stale timestamps. The AFTER INSERT/UPDATE publication trigger also validates direct table writes and rolls back invalid publication. Image approval requires an uploaded object; constraints require rights basis, evidence of at least 12 characters, attribution and source. Existing dependency guards and review-reset behavior remain intact. The Jordan bounding box is a coarse bound, not a national-border polygon or proof of a landmark. URL presence and evidence length cannot establish factual truth, image identity or a valid licence; those remain human review responsibilities. Minimum pixel resolution and image identity are not backend publication conditions. Optional visitor fields are not mandatory checklist conditions.

Everything needed for the **existing structured publication workflow** is editable through Add/Edit Place: name/story/source, city/address, categories and primary category, coordinates and picker, optional visitor fields, review source/precision/notes/checkboxes, upload/cover/alt/rights metadata, approval, preview and publish confirmation. No database script is needed. Multiple fact citations can be retained in Review notes, but there is only one primary destination Source URL. There is no dedicated opening-hours calendar, per-nationality pricing editor, image-resolution inspector or legal-licence verifier. Preserve unknown values and use external evidence review rather than assuming those capabilities exist.

## Verification performed for this review

- `npm run test:admin`: **10 grouped checks passed**, disposable PostgreSQL/PostGIS; includes incomplete publication rejected through RPC and direct table write, rights approval rejection, approved fixture publication and dependency protection. No hosted content was published.
- `npm run test:admin:refinement`: **13 groups passed**, actual local React browser with intercepted CMS fixtures and real MapLibre/OpenFreeMap layers; verifies manual entry, click, drag, keyboard movement, unsaved private preview, save/refetch, mobile behavior and accessibility. Screenshots refreshed under `docs/screenshots/phase04-final/`; they are synthetic records, not this live draft.
- `npm run test:admin:hosted`: **4 groups passed**, genuine read-only anonymous hosted SDK requests. Drafts and unapproved images remain hidden; admin RPCs, review and audit reads denied.
- `npm run validate`: **passed** — lint, 83 asset references and production build. Existing MapLibre chunk-size warning remains. No application source or design was changed.
- Existing 18 October user-run authenticated suite: reported all passed and corroborated by audit/cleanup then. It is prior evidence, not a new observation of the current private image or a fresh signed-in preview.
- Live checklist rules and trigger definitions were inspected, but the authenticated checklist RPC was not called using a fabricated session. Umm Qais's four blockers were derived from the saved data and live validator; an administrator must refresh its checklist after approved edits.
- No connected apps/browsers were exposed by the browser inventory. Actual-image review and a live signed-in Umm Qais map/preview inspection remain manual. Fixture success is not represented as those completed checks.

## Exact remaining actions and approval boundaries

1. **Approve the proposed Umm Qais content/scope and category plan before any save.** The proposals above are ready to review; no existing draft has been edited by this task.
2. **Select a documented replacement photograph.** The owner has ruled out approving the existing test upload; preserve it. Review the recommended West Theatre candidate, its licence and exact credit in the linked evidence record. After selection, upload the new file through the dashboard and record its own attribution/evidence before saved-evidence approval. Set the replacement as cover and verify discoverable public source/licence links. Do not approve the test image.
3. **Resolve the visitor point.** Confirm an appropriate visitor arrival/entrance point or explicitly approve a suitable representative point with truthful precision. Enter coordinates and sources through the editor. Do not mark an entrance verified without evidence.
4. After content approval, save the agreed text, History/Culture assignments, History primary category and coordinates as a draft. Leave unsupported optional fields empty; resolve or omit conflicting hours/fees. Record all evidence links/check dates and remaining limitations in Review notes.
5. Review the final saved claims and location, then select the corresponding review checkboxes and **Record review of saved draft**. Later content changes require renewed review. Refresh the database publication checklist; require no blockers.
6. In the signed-in browser, open the map and **Preview** for this actual draft. Confirm the pin, label/scope, image identity/sharpness/crops, alt text, source/attribution and visitor text. Do not save accidental changes. Record this manual outcome; current automation cannot attest to the private image.
7. **Stop before Publish.** Present the exact final saved content, verified point, image licence evidence and clean checklist for explicit publication approval. Content-edit approval and rights review are not publication approval. No publication confirmation is requested yet because evidence is incomplete.
8. Only after separate explicit publication approval, publish this UUID through the existing dashboard confirmation. Verify the authenticated audit event, then fresh anonymous Home, `/explore`, `/map`, `/places/umm-qais`, correct marker/details and approved media/attribution; verify the other five drafts remain hidden. The real repository selects Home's first three published places by slug; Umm Qais should be included if it is the sole published place. Refresh/invalidate the catalog after publishing rather than reading stale cached data. No public design changes are required.

## Preservation evidence

Full `places` row digest at review start and after checks: **`ec60507a2fddb950ef46390a6a2cb94e`**, unchanged. Six drafts, zero published, zero review rows, one linked image, two private image objects, one administrator. The earlier 18 October zero-image baseline and `721101...` digest predate the administrator's subsequent Umm Qais activity and must not be treated as today's starting state. Neither uploaded object was removed. Original Supabase connection and dedicated connection preserved. No remote writes, invitations, roles, RLS, Storage policies, migrations, deployment or Phase 05 work.
