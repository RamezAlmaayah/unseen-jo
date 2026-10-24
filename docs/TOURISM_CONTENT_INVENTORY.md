# Tourism content inventory and audit

## Current content-completion snapshot — 19 October 2026

The audit baseline below is preserved as historical evidence. Subsequent owner-authorized research/population updated the **same six drafts** without new destinations or changed IDs/slugs. All six now have expanded descriptions, geographic descriptions, sourced approximate coordinate pairs, assigned active primary categories and transport/advisory notes. Five have a City value; Mujib remains NULL. Four have explicitly editorial duration allowances; two have seasonal notes. Prices and visitor-group suitability remain NULL where a single reliable value was not established. Six pending review-evidence rows exist; no claim/location review was falsely marked complete.

Eleven lawfully sourced originals were prepared locally with file-page licence evidence and visual review, with five proposed covers. Ajloun has a historical campsite gallery candidate only; a current forest cover remains unresolved. These files are not automatically imported or approved. The original Umm Qais test image remains unapproved and preserved. Actual remote media/import results, exact sources and remaining gates are maintained in [TOURISM_CONTENT_COMPLETION_REPORT.md](TOURISM_CONTENT_COMPLETION_REPORT.md) and [TOURISM_IMAGE_LICENSE_REGISTER.md](TOURISM_IMAGE_LICENSE_REGISTER.md). No publication or Phase 05 work occurred. The older missing-field tables below describe the **pre-completion baseline**, not current populated fields.

Audit date: 19 October 2026, Asia/Amman. Workspace: `C:\Users\Magic Systems\Desktop\Unseen Jo Project`. Live project independently confirmed through the dedicated `supabase_unseen_jo` MCP: `https://dkhwwvoplhfjccvjegty.supabase.co`.

Audit only: existing SQL rows, local files, runtime imports and existing review documents were inspected. No web content research, image download/upload, destination/image edit, deletion, coordinate change, publication, policy change or new phase. The only file created by this task is this report. Original and dedicated Supabase connections were preserved.

## 1. Counts and exact destination names

**Six unique managed destination identities**, represented by six real Supabase rows and six local demo rows. These are overlapping representations, not twelve unique places. There are **zero published, six draft and zero archived** Supabase records; all six have `is_demo=false`. There are no additional demo records in the live table.

| Canonical live name | Live slug / demo ID | Exact local demo name | Other static display name | Live status |
| --- | --- | --- | --- | --- |
| Ajloun Forest Reserve | `ajloun-forest` | Ajloun Forest | Ajloun Forest Experience (demo Details title) | Draft |
| As-Salt Historic Centre | `salt-historic` | Salt Historic | None beyond those aliases | Draft |
| Mujib Biosphere Reserve | `wadi-mujib` | Wadi Mujib Adventure | Wadi Mujib Trails (two landing entries) | Draft |
| Dana Biosphere Reserve | `dana-reserve` | Dana Biosphere Reserve | None | Draft |
| Iraq Al-Amir | `iraq-al-amir` | Iraq Al-Amir | Iraq Al-Amir (landing entry) | Draft |
| Umm Qais | `umm-qais` | Umm Qais | None | Draft |

**Additional named promotional asset: Petra.** Two `petra-promo-banner.png` files refer to the same original image. Petra has no `places` record, demo destination row, managed slug, destination details or publication status. Thus the inclusive named-destination-reference count is **seven (six managed identities plus one asset-only Petra reference)**. This does not establish that the decorative image depicts Petra. Anonymous scenery/illustrations and location-selector cities do not create additional destination records.

The landing array has three rows but only two identities: `landing-wadi-first` and `landing-wadi-third` both display “Wadi Mujib Trails”; `landing-iraq` displays “Iraq Al-Amir”. Wadi Mujib's first photo also duplicates a photo associated with Ajloun; that is a mapping conflict, not another destination. Preserve these aliases and explain the overlap rather than inflating the count.

## 2. Source and runtime comparison

| Source | Records/references | Current use and boundary |
| --- | --- | --- |
| Live `public.places` | 6 | Authoritative real catalog, all private drafts. |
| `public.place_categories` / `categories` | 10 links / 7 active categories | Six places have secondary category links; none has a primary category. Unused active categories Food, Photography and Family are not missing destinations. |
| `public.place_reviews` | 0 | No saved claims/location review for any destination. |
| `public.place_images` | 1 | Umm Qais test image only; no cover or rights approval. |
| Storage `place-images` | 2 objects | One linked Umm Qais image and one unlinked file in the same UUID folder; both preserved. |
| `public/data/demo-destinations.json` | 6 | Loaded by `useDemoDestinations`; illustrative values and original design associations. Demo IDs match the live slugs but are not live UUIDs. |
| `src/data/featured-destinations.js` | 3 rows, 2 identities | Imported by LandingPage; used only for demo featured cards. Live Home uses the first three published catalog entries in slug order. |
| `src/features/discovery/sample.js` | No extra destination | Builds a fixed recommendation around the Ajloun sample passed by DiscoveryResultPage. Does not rank live records. |
| `src/features/map/geography.js` | 5 demo point mappings | Ajloun, Salt, Mujib, Dana, Iraq only; no demo Umm Qais point. Does not populate the database. |
| `src/data/tourism-media.js` | 0 approved entries | Production local-media approval registry is empty. Figma photos are not silently used as live images. |
| `supabase/content/jordan-starter.json` | Same 6 destinations | Existing import/review manifest; not an additional runtime catalog or new place set. |
| `src/data/figma-assets.json` | 83 references / 48 distinct original hashes | Includes branding/icons, scenery, destination photos and map artwork; not 83 destinations. Relevant 25 destination/scenic/map references have 17 distinct hashes. |
| `docs/evidence/umm-qais-media/` | 2 existing candidate JPEGs | Prior research evidence only; not runtime mappings, uploaded media, approvals or new destinations. No files downloaded in this audit. |
| `dist/`, `artifacts/`, test scripts | Generated copies and synthetic fixtures | Not additional current content authorities. Browser QA destinations/categories are fixtures; no extra live QA row was found. |

Runtime: `useTourism.js` reads published non-demo records through `repository.js` in live mode; demo mode loads the JSON and adds demo coordinates. `DiscoveryResultPage` intentionally loads the fixed labelled Ajloun demo even in live mode; its sample Details route is explicit. MyDiscoveries can combine real temporary saves with labelled demo saves. Iraq and Umm Qais have `showInExplore=false` in the demo JSON, though they remain accessible through the demo saved collection/details. These are display rules, not publication statuses.

Petra artwork remains referenced by LandingPage and DiscoveryPromo even though it is not a catalog destination. `SurpriseMePage` has generic waterfall artwork; the landing hero has generic hills/forest artwork. Neither names another managed attraction. `Hidden Trails`, `Scenic Viewpoints` and `Local Experiences` are Ajloun demo experience labels, not separate places. Amman, Ajloun, Irbid, Salt, Madaba and Aqaba in preference selectors, and Amman/Irbid/Aqaba map reference centres, are origins/filters rather than additional destination listings.

## 3. Complete real-destination field audit

Legend: **Missing** = null/absent; **present, unverified** = stored data without completed current CMS verification; **demo only** = illustrative local content, not a verified replacement for missing live values. No new geographic facts are inferred here.

### Shared fields — explicitly applies to each of the six rows below

| Requested field | Ajloun | As-Salt | Mujib | Dana | Iraq Al-Amir | Umm Qais |
| --- | --- | --- | --- | --- | --- | --- |
| City | Missing | Missing | Missing | Missing | Missing | Missing |
| Structured region | No schema field | No schema field | No schema field | No schema field | No schema field | No schema field |
| Address | Missing | Missing | Missing | Missing | Missing | Missing |
| Latitude / longitude | Both missing | Both missing | Both missing | Both missing | Both missing | Both missing |
| Verified geographic source/precision/review | Missing | Missing | Missing | Missing | Missing | Missing |
| Admission price min/max | Both missing | Both missing | Both missing | Both missing | Both missing | Both missing |
| Visit duration min/max | Both missing | Both missing | Both missing | Both missing | Both missing | Both missing |
| Best time to visit | Missing | Missing | Missing | Missing | Missing | Missing |
| Transport information | Missing | Missing | Missing | Missing | Missing | Missing |
| Visitor suitability/groups | Missing | Missing | Missing | Missing | Missing | Missing |
| Active primary category | Missing | Missing | Missing | Missing | Missing | Missing |
| Claims verification date/reviewer | Missing | Missing | Missing | Missing | Missing | Missing |
| Completed publication readiness | No | No | No | No | No | No |

There is no `region`/`governorate` column in `places`; do not represent a missing structured region as a populated database fact. Existing local geographic review notes associate Ajloun with Ajloun, Salt with As-Salt/Balqa, Mujib with the Dead Sea region, Dana with Tafilah, Iraq with the Amman region and Umm Qais with Irbid. These are **existing reference context**, not values saved to the current City/Address fields or freshly researched evidence.

| Live destination / UUID | Assigned categories (all active) | Description availability | Stored information source | Missing or incomplete beyond shared fields |
| --- | --- | --- | --- | --- |
| Ajloun Forest Reserve / `6f3ca842-ebdf-42a3-a590-987ae577e759` | Nature | Short text present, 69 characters; below the 80-character publication minimum | `https://www.rscn.org.jo/reserve/list?lang=en` | Expand into useful sourced description; reserve-specific evidence and appropriate visitor point; cleared cover; category review/primary selection. |
| As-Salt Historic Centre / `189dc346-58af-42b5-b2da-c862c95f0fca` | History, Culture | Short text present, 108 characters; length passes, review absent | `https://whc.unesco.org/en/list/689/` | Useful visitor narrative; representative heritage-area/arrival point and precision; cleared cover; primary selection. |
| Mujib Biosphere Reserve / `0a905153-1e27-44b0-a2d8-3f9b8cf6b089` | Nature, Adventure | Short text present, 113 characters; length passes, review absent | `https://www.rscn.org.jo/reserve/list?lang=en` | Clarify reserve versus “Wadi Mujib Adventure/Trails” scope; activity-specific visitor facts and coordinate scope; cleared cover; category/primary review. |
| Dana Biosphere Reserve / `a6b63635-d609-411d-86e2-ccd2ec0bd6af` | Nature | Short text present, 110 characters; length passes, review absent | `https://www.rscn.org.jo/reserve/list?lang=en` | Useful reserve-specific description/evidence; chosen visitor base/reference point and precision; cleared cover; primary selection. |
| Iraq Al-Amir / `4ec8a105-00a5-4f4b-b410-dbf864343826` | History, Culture | Short text present, 95 characters; length passes, review absent | `https://international.visitjordan.com/wheretogo/amman/` | Resolve area versus Qasr El-Abd attraction scope; useful visitor narrative and arrival point; cleared cover; primary selection. |
| Umm Qais / `066dbed9-ca25-421e-8187-00fbc78fcda3` | History, Culture | Short text present, 125 characters; length passes, review absent | `https://international.visitjordan.com/wheretogo/umm-qais/` | Clarify town versus archaeological-site scope; complete saved reviews/point; approved replacement cover; keep test upload excluded. |

Exact saved descriptions:

- **Ajloun:** “A protected woodland area in the Ajloun highlands of northern Jordan.”
- **As-Salt:** “The historic centre of As-Salt is recognized by UNESCO for its urban heritage and traditions of hospitality.”
- **Mujib:** “A protected landscape beside the Dead Sea in Jordan, managed by the Royal Society for the Conservation of Nature.”
- **Dana:** “A protected area in Jordan with a varied landscape of mountain ridges and valleys along the Great Rift Valley.”
- **Iraq Al-Amir:** “An area southwest of Amman associated with hillside caves and the ancient Qasr El-Abd monument.”
- **Umm Qais:** “The modern town associated with ancient Gadara in northern Jordan, with archaeological remains overlooking the Jordan Valley.”

All six source URLs exist as stored fields. Existing Phase 02B documentation says short names/descriptions were source-checked on 16 October; current `verified_at`, `verified_by` and review rows are still absent. Therefore these are **not missing descriptions/URLs**, but they are **not completed publication reviews**. URLs were not fetched/researched during this task.

### Demo visitor content — exists, but is not verified live information

No demo row has a saved city/address, admission-specific source, rights attribution or completed publication status. Demo `costJod` is a sample cost, not established admission. Travel labels lack an origin and are not verified transportation instructions.

| Exact demo name / ID | Category | Sample cost JOD | Sample visit duration | Sample travel label | Description / best time / transport / suitability |
| --- | --- | ---: | --- | --- | --- |
| Ajloun Forest / `ajloun-forest` | Nature | 8 | 2–3 hr; 120–180 min | 45 min | Demo description present; Morning/Sunset; Car; friends/family. All illustrative, no independent current verification. Details title: Ajloun Forest Experience. |
| Salt Historic / `salt-historic` | Culture | 5 | 2–3 hr; 120–180 min | 30 min | No description, best-time, transport or group fields. |
| Wadi Mujib Adventure / `wadi-mujib` | Adventure | 15 | Half day; 240–240 min | 3 hr | No description, best-time, transport or group fields. |
| Dana Biosphere Reserve / `dana-reserve` | Nature | 6 | 3–5 hr; 180–300 min | 1 hr | No description, best-time, transport or group fields. |
| Iraq Al-Amir / `iraq-al-amir` | Culture | 4 | 2–4 hr; 120–240 min | Missing | No description, best-time, transport or group fields. |
| Umm Qais / `umm-qais` | History | 9 | “Half day” label exists; numeric duration missing | Missing | No description, best-time, transport or group fields. |

Local `demoCoordinates` supplies Ajloun `32.3835625,35.7604375`; Salt `32.0426111111,35.7283055556` (DMS-derived); Mujib `31.4670625,35.5731875`; Dana `30.6743125,35.6083125`; Iraq `31.9195625,35.7533125`. Each has an existing source/precision qualification in `geography.js` and `COORDINATE_INVENTORY.md`. They are qualified reference points, **not verified visitor entrances**, and none is saved to live `places`. Umm Qais has no runtime demo coordinate mapping; a point proposed in the earlier readiness report is research evidence only, not a current destination field. No coordinate was changed or newly researched here.

## 4. Per-destination image audit

Counts distinguish linked database images from Figma file references and distinct originals. A static card/hero image is not a rights-approved CMS cover.

| Destination | Live linked images / CMS cover | Figma photo references / distinct hashes associated with this destination | Runtime/demo image availability | Identity, rights and publication suitability |
| --- | --- | --- | --- | --- |
| Ajloun | 0 / none | 9 / 8 (includes experience images, excludes map) | Card/result/discovery photo fields deliberately null; Details has 3-photo gallery and 3 supporting experience photos | Existing review flags orange-rock card and castle associations as mismatched. Other photos remain geographically unverified with no production rights evidence. No publishable cover; replacement/cleared candidate needed. |
| As-Salt | 0 / none | 2 / 1 | Same historic-street photo in Explore and Discoveries | Location unverified; no documented production rights. Cleared cover needed; gallery optional. |
| Mujib | 0 / none | 4 / 2 | Canyon photo in Explore/Discoveries and third landing card; different first landing card | First landing orange-rock photo duplicates Ajloun's excluded card and is a documented mismatch. Canyon image is a candidate only, with identity/rights unverified. Cleared cover needed. |
| Dana | 0 / none | 2 / 1 | Same mountain photo in Explore and Discoveries | Identity unverified; no documented production rights. Cleared cover needed; gallery optional. |
| Iraq Al-Amir | 0 / none | 2 / 1 | Same stonework photo in Discoveries and landing; reused by demo details fallback | Identity unverified; no documented production rights. Cleared cover needed; gallery optional. |
| Umm Qais | 1 / none | 1 / 1 | One demo stonework photo, separate from uploaded test image | Test image explicitly UNVERIFIED; no source/licence/attribution or approval. Figma photo likewise lacks established identity/rights. A cleared replacement is required, not approval of the test upload. |
| Petra (asset-only) | 0 / not applicable | 2 / 1 | Decorative promo in LandingPage/DiscoveryPromo | Identity not established by filename. No rights evidence in manifest; not cleared destination content. No destination exists to publish or complete. |

The 20 destination-associated photo references for the six managed identities resolve to **13 distinct original hashes**, because repeated screen exports and the cross-labelled orange-rock image overlap. Counting within each destination and adding distinct counts would double-count that cross-labelled photo. The remaining 5 scenic/map/promo references make 25 relevant manifest rows / 17 hashes overall. The full manifest's 83/48 includes non-destination assets too. Local bytes for the 25 relevant paths were hashed read-only and match the manifest; this verifies file identity against exports, not landmark identity or licence.

### Exact Figma mapping paths and dimensions

All paths below are relative to `/assets/figma/`. No image was uploaded/downloaded or replaced in this audit.

| Association | Existing file paths | Original pixel dimensions / note |
| --- | --- | --- |
| Ajloun excluded orange-rock image | `explore/ajloun-card-original.jpg`; `result/ajloun-card-original.jpg` | 2731 × 4096; identical to first Wadi landing image |
| Ajloun excluded castle image | `discoveries/ajloun-card-original.jpg` | 750 × 750; different original |
| Ajloun gallery | `details/ajloun-main.png`; `details/ajloun-gallery-top.jpg`; `details/ajloun-gallery-bottom.jpg` | 1920 × 1080; 4096 × 2731; 4096 × 2731 |
| Ajloun experience imagery | `details/hidden-trails.jpg`; `details/scenic-viewpoints.jpg`; `details/local-experiences.jpg` | 923 × 615; 820 × 615; 3867 × 2659 |
| Ajloun map artwork | `details/ajloun-location-map.png` | 655 × 406; not a photograph or geographic verification |
| As-Salt | `explore/salt-historic.jpg`; `discoveries/salt-historic.jpg` | 1080 × 1080; identical original |
| Mujib canyon | `explore/wadi-mujib-adventure.jpg`; `discoveries/wadi-mujib-adventure.jpg`; `landing/wadi-mujib-card-third-original.jpg` | 1920 × 1440; identical original |
| Mujib excluded orange-rock | `landing/wadi-mujib-card-first-original.jpg` | 2731 × 4096; same original as excluded Ajloun card |
| Dana | `explore/dana-biosphere-reserve.jpg`; `discoveries/dana-biosphere-reserve.jpg` | 2048 × 1365; identical original |
| Iraq Al-Amir | `discoveries/iraq-al-amir.jpg`; `landing/iraq-al-amir.jpg` | 1000 × 666; identical original |
| Umm Qais | `discoveries/umm-qais.jpg` | 2560 × 1707; does not establish matching identity with the test upload |
| Petra promo | `explore/petra-promo-banner.png`; `landing/petra-promo-banner.png` | 2172 × 724; identical original |
| Unidentified scenery | `landing/landscape-hero.png`; `surprise/waterfall-hero.png` | 1859 × 846; 824 × 1024; no managed destination identity established |

Manifest dimensions are export metadata, not a new sharpness/crop approval. `figma-assets.json` also retains source frame/layer/placement IDs, crop classes, bytes, SHA-256 and duplicate mappings. No Figma account access was needed and no design was changed. Possession of an exported Figma asset is not proof of production photo reuse rights.

### Umm Qais `um.jfif` and existing local evidence

- Linked image UUID: `f30f04d6-804e-4a1b-8ed5-14bb6218b510`; alt field currently contains the filename `um.jfif`, not descriptive alt text.
- Object: `066dbed9-ca25-421e-8187-00fbc78fcda3/e02dd86c-a43b-43b1-8820-670115101f7f.jpg`; Storage metadata says JPEG, **63,156 bytes**. No natural dimensions in returned metadata; original private bytes were not downloaded/inspected. Identity and resolution remain unverified.
- `is_cover=false`; `approved_at`, `approved_by`, `license_basis`, `source_url`, `attribution` are null. Rights evidence contains the existing **UNVERIFIED — TEST UPLOAD ONLY** warning and the owner's prohibition on approval/publication/deletion. Warning text is not licence evidence.
- Unlinked object in the same destination folder: `49ff1df3-0199-4e81-947f-146ddb32cbaa.jpg`, JPEG metadata, **30,220 bytes**. It has no `place_images` association and no rights record. It is not a second gallery image. Preserved without deletion or download.
- Existing local evidence only: `docs/evidence/umm-qais-media/west-theatre-bashar-tabbah-original.jpg` (2500 × 1667, 1,293,008 bytes) and `market-street-ken-and-nyetta-original.jpg` (4288 × 2848, 5,119,090 bytes). The prior README documents public CC BY-SA 4.0/VRT and CC BY 2.0 evidence respectively, with prior visual review and caveats. This audit did not renew those external checks. They are neither approved replacements nor associated CMS images and were not newly downloaded. Their existence does not clear `um.jfif`.
- Prior review also identified public photo credit delivery as incomplete: current gallery displays attribution text only after opening a photo; stored source URLs are not rendered as source/licence links. Resolve credit delivery before using a licensed candidate publicly; no UI change was made here.

No destination currently has a **publication-suitable, approved associated image**. For the other five, new/cleared cover selection is needed. For Umm Qais, choose a cleared replacement while retaining the test upload unapproved. Additional gallery photos are optional enrichment, not a current backend publication requirement. For every chosen photo, identity, original resolution/crops, photographer, licence/version, evidence, attribution and any modifications still require review.

## 5. Completion plan and readiness

Readiness is derived from current live rows and the inspected `admin_publication_issues` definition. The protected RPC was not invoked with a fabricated administrator session. Four blockers apply to every row: explicit source/claims review, active assigned primary category, sourced/reviewed Jordan coordinates with precision, and uploaded rights-approved cover. Ajloun also fails the 80-character description rule. All names pass the name-length rule; none is demo; no inactive category links were found.

The validator cannot establish factual truth, legal permission, photograph identity or accurate visitor access from text presence. Optional visitor details are quality gaps, not automatically database blockers. All five non-Ajloun descriptions pass length but remain short and unverified.

| Destination | Full/useful description | Coordinates | Visitor information | Category work | Cover | Additional gallery | Source verification | Licence evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Umm Qais | Enrich/clarify scope, then review | Missing; earlier proposal not saved | All live fields missing | Choose primary; review current History/Culture | Replacement required | Optional, all unverified media excluded | Required | Required; prior local candidates only |
| As-Salt | Enrich beyond short summary, then review | Missing; local demo reference only | All live fields missing | Choose primary; review History/Culture | Required | Optional | Required | Required |
| Iraq Al-Amir | Clarify area/monument scope and enrich | Missing; local demo reference only | All live fields missing | Choose primary; review History/Culture | Required | Optional | Required | Required |
| Ajloun | Required expansion: only 69 characters | Missing; local demo reference only | All live fields missing | Choose primary; review Nature | Required; remove mismatch from candidate consideration | Existing demo images need clearance; more optional | Required | Required |
| Dana | Enrich and clarify visitor base | Missing; local demo reference only | All live fields missing | Choose primary; review Nature | Required | Optional | Required | Required |
| Mujib | Clarify reserve/activity scope and enrich | Missing; local demo reference only | All live fields missing; particularly important for an activity listing | Choose primary; assess Nature/Adventure against final scope | Required; excluded orange-rock image unsuitable | Optional | Required | Required |

No category correction is established merely from missing fields; all current category assignments are editorial, active and plausible pending review. Primary-category selection is definitely missing on all six. Do not copy sample prices/durations/groups into live content to make a form look complete.

**Provisional completion order:** (1) Umm Qais, (2) As-Salt Historic Centre, (3) Iraq Al-Amir, (4) Ajloun Forest Reserve, (5) Dana Biosphere Reserve, (6) Mujib Biosphere Reserve. This is a work-planning judgment based on existing material, not a claim of readiness. Umm Qais has the most prior local evidence but still fails four gates; As-Salt has a specific stored heritage source. The others need scope/visitor-point decisions; Ajloun also needs mandatory description expansion. Mujib's activity-versus-reserve presentation deserves particular care. **None is ready to publish.**

## 6. Evidence and stopping boundary

Evidence: read-only dedicated MCP snapshot of `places`, `categories`, `place_categories`, `place_reviews`, `place_images`, `storage.objects` metadata and the live publication validator; local runtime files listed above; existing `ASSET_INVENTORY.md`, `COORDINATE_INVENTORY.md`, `TOURISM_DATA.md`, `FIRST_PUBLICATION_READINESS.md` and prior image-evidence README. Historical documents are context, not substitutes for this live snapshot. No new outside facts or replacement media were researched.

The six-place full-row digest is `ec60507a2fddb950ef46390a6a2cb94e`. Live state: six drafts, zero published, zero archived, zero review rows, one linked image, zero covers, zero approved images, two private place-image objects. Neither connection was changed. No credentials, signed URLs or private image bytes were read. The existing unverified image warning was already present before this audit and was not changed.

Stop here. Content completion, research, replacement-image selection/import, any edit and publication require subsequent owner instruction. No development phase was started.
