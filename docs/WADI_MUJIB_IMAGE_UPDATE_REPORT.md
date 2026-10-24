# Wadi Mujib image update investigation and fix

Verified 19 October 2026 against the dedicated MCP project `dkhwwvoplhfjccvjegty`. Work stops within Phase 04L. No destination was published, unpublished or edited by this investigation. No hosted image metadata or Storage file was changed. One additive, tested Admin RPC was installed.

## Exact cause

The image source citation was edited, not the photograph file. This was not an image-download, signed-URL or optimized-image cache failure.

Destination: **Mujib Biosphere Reserve**, slug `wadi-mujib`, ID `0a905153-1e27-44b0-a2d8-3f9b8cf6b089`. It is already published and `is_demo=false`.

The current cover is image row `f7fc0ebc-1f40-4608-944f-a432e714b37d`, pointing to:

`0a905153-1e27-44b0-a2d8-3f9b8cf6b089/d29713d8-0ff2-43da-b21a-e7bf110fea2d.jpg`

The gallery image is row `d9fc5e9e-bbe0-42cf-b8c1-9574858a68b9`, pointing to:

`0a905153-1e27-44b0-a2d8-3f9b8cf6b089/049e2c4a-14ba-4fba-9efa-ea0e21dcc85d.jpg`

Hosted audit entries between 19:20 and 19:23 UTC show changes to `source_url`, timestamps and approvals. They contain no `storage_path` or `is_cover` change. Storage still contains the original 436,803-byte cover and 561,494-byte gallery JPEG, last modified around 12:45 UTC. Their ETags are respectively `2b804c3c095c2f7383007fa31957b18c` and `5316d64363465c12876a9a150e8ffa2a`. Neither file was replaced.

The two source citations now point to Google image-result URLs referring to Facebook and Nshamah images. Existing attribution and license evidence still describe Effi Schweizer's Wikimedia Commons files **Wadi Mujib2.jpeg** and **Wadi Mujib5.jpeg**, with PD-self evidence. These source references need reconciliation by the administrator. This investigation preserved the recorded metadata and approvals exactly; it did not assert that the newly linked images inherit the Commons rights. No Google, Facebook or Nshamah replacement image was downloaded.

## Which field controls what

| Value | Purpose | Changes the photograph? |
| --- | --- | --- |
| Destination `places.source_url` | Factual citation supporting destination content | No |
| Image `place_images.source_url` | Image provenance / rights citation | No |
| Image `storage_path` | Actual private Storage object containing the photograph | Yes, when explicitly replaced through the new upload operation |
| `is_cover` | Selects the destination's cover media row | Yes, by selecting another stored image |
| Signed file URL | Temporary, permission-checked delivery URL for the stored original | No; signatures do not import a source citation |
| Responsive signed URLs | Protected, on-demand renditions of the same object at 320/640/1280/2400 widths as appropriate | Follow the stored file and cover selection |

Data flows from live published Supabase rows through `tourism/repository.js`, which sorts cover first, signs stored objects and attaches `imageDelivery` objects. `normalizePlace` supplies the first photo to destination cards and the gallery to Place Details. `AssetImage` and `PhotoGallery` request suitable protected responsive renditions. The original viewer requests the original object. No part of this path uses the citation URL as an `<img>` source.

The running development and production-preview public pages both use live Supabase content. Draft previews explicitly use the authenticated Admin repository. Demo content remains available only through the existing explicit demo mode/sample flow; `approvedTourismMedia` supplies no production override.

Home currently features the first three live destinations, which exclude Wadi Mujib. Its approved hero artwork is independent of destination cover selection. Explore and Wadi Mujib Place Details genuinely rendered the same live cover with HTTP 200 protected responsive responses in both development and production preview.

## Implemented fix

The Admin editor now labels the field **Image source citation URL**, with English and Arabic help explaining that editing the link does not replace the photograph. It also explains the stored-file / responsive-version relationship.

An explicit **Replace cover photograph** file input is available on the existing cover, within the existing media panel and styling. It accepts the existing validated JPEG/PNG/WebP uploads up to 5 MiB. It does not import remote URLs.

The replacement operation:

1. Requires a draft destination and its current cover, then uploads to a new UUID Storage path with `upsert:false`.
2. Calls `admin_replace_cover_image` under the existing user's authenticated session. This SECURITY INVOKER RPC checks the active Admin permission, locks the destination and cover, checks the expected timestamp, checks that the newly uploaded object belongs to this destination and is not already linked, and atomically changes the cover selection.
3. Retains the previous photograph, its original media ID, file, attribution, license evidence and recorded approval in the gallery. Nothing is silently deleted or reassigned to different bytes.
4. Creates a separate pending cover record. The chosen filename initializes alternative text for editing; source citation, attribution, license basis/evidence and approval start empty. Review the alternative text and document the new file's own rights. The previous photo's rights are not copied onto the new photograph.
5. Clears Admin original-preview and responsive-signature caches, and invalidates the public catalog/detail/signing caches through the existing same-origin event/BroadcastChannel mechanism.

The new object path gives originals and every responsive rendition new cache identities. There is no overwrite of a linked immutable object, cache-busting token surgery, public bucket change, RLS bypass or paid service activation. Supabase also recommends [new paths to avoid stale overwrite propagation](https://supabase.com/docs/guides/storage/uploads/resumable-uploads#overwriting-files).

An ambiguous upload/link failure retains the upload and instructs the administrator to reload and inspect unlinked uploads. It never automatically deletes a file that might already have been linked successfully.

## Exact workflow

Open [Wadi Mujib media in local Admin](http://127.0.0.1:4184/admin/places/0a905153-1e27-44b0-a2d8-3f9b8cf6b089#media).

1. For a citation correction, edit **Image source citation URL** and save media metadata. The file remains the same; the existing metadata-save behavior resets rights approval for review.
2. To use a different photograph, explicitly return the published destination to draft using the existing control. This hides it publicly; this investigation did not do that.
3. On its existing cover, choose **Replace cover photograph**, select the actual lawful image file, and confirm the described replacement. Unsaved metadata is not applied.
4. Use Preview to inspect the new cover. Correct its alternative text; enter the new file's attribution, source citation, license basis and rights evidence. Save and perform the existing rights review. Approval does not publish the destination.
5. Publication remains a separate, explicitly authorized operation after all mandatory checks pass. This task did not perform it. A pending replacement cover blocks publication.

The previous image remains in the gallery to preserve its evidence and approval. If it should no longer appear after a future publication, explicitly unlink that specific old media row while the destination is a draft using the existing control; do not remove unrelated images.

## Validation and scope

| Check | Result / scope |
| --- | --- |
| `node scripts/check-phase04.mjs` | 12 passed; disposable PGlite/PostGIS with simulated Auth/Storage, including full migration replay, active-session security, anonymous/non-admin rejection, published locks, stale/cross-place/duplicate rejection, atomic replacement, preservation of previous evidence, one cover and pending-cover publication rejection |
| `node scripts/check-image-delivery.mjs` | 6 passed; deterministic signatures, expiry, concurrency, private-account scope, actual derivative/original integrity, real SDK builders with fake transport verifying no citation download, immutable upload, invalidation and safe failure behavior |
| `node scripts/check-performance-security.mjs` | 7 passed; identity isolation, Auth checks, cache expiry/deduplication and successful-write invalidation |
| `node scripts/check-localization.mjs` | 6 passed; resources, content preservation, fallback honesty, English/Arabic switching and immutable media metadata |
| `node scripts/audit-localization-resources.mjs` | No missing static translations |
| `node scripts/check-mujib-image-update.mjs` | 4 browser groups passed: genuine public Home/Explore/Details in development and production preview; separately intercepted English and Arabic Admin/public flows proving citation-only uploads=0, replacement uploads=1, RPC calls=1, pending approval and same-origin cross-tab Home invalidation, plus new cover rendering on Explore and Details. No page errors |
| `node scripts/check-mujib-image-update-hosted.mjs` | Genuine anonymous hosted SDK reads confirmed the same published, non-demo cover. Hosted replacement RPC rejected the anonymous request with `42501`; no write occurred |
| `npm run validate` | Oxlint, all 83 asset references / 48 original hashes, and production build passed. Existing large-chunk warnings remain |
| Hosted preservation fingerprints | All destination rows, all image metadata rows and all `place-images` Storage object names/metadata/timestamps unchanged before/after |
| Hosted function verification | Installed RPC uses SECURITY INVOKER with empty search path; anonymous execute denied; authenticated execute still requires active Admin checks and existing RLS |

Evidence: `docs/validation/mujib-image-update-browser.json`, `mujib-image-update-hosted.json`, `mujib-image-update-preservation.json`, `phase04-database-tests.json`, `image-delivery-tests.json`, `performance-security-tests.json` and `phase04l-unit-tests.json`.

No connected owner browser was exposed (`apps:[]`, `browsers:[]`). Therefore a genuine authenticated owner-account upload was **not** performed or claimed. Admin browser tests used completely intercepted Auth/Storage/API fixtures; database permission tests used a disposable database. The installed hosted operation was verified structurally and for anonymous denial. No supplied replacement file existed, and changing a citation was not treated as authorization to fetch one.

The existing public cache lasts 60 seconds when read again; signed delivery URLs last 300 seconds with a 270-second reuse window. Same-origin app tabs receive immediate successful-write invalidation. Independent browsers and different origins do not receive this BroadcastChannel event and require a fresh read/reload; this is not a global realtime subscription. Already-delivered signed URLs cannot retract image bytes from a browser. No security or cache policy was weakened.

Security advisors before and after showed only the existing [leaked-password-protection warning](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), with no new database/function warning. Auth configuration was unchanged.

## Modified files

- `src/features/admin/PlaceEditor.jsx`: clarified citation semantics and explicit cover-file input using existing UI components/styles.
- `src/features/admin/repository.js`: immutable cover upload/RPC and preview/variant/public cache invalidation.
- `supabase/migrations/20261019193157_phase04l_replace_cover_image.sql`: additive atomic, audited, caller-authorized cover replacement; no data seed, policy change or content update.
- `src/i18n/locales/review.ar.txt`, `en.json`, `ar-JO.json`: new bilingual labels/help.
- `scripts/check-phase04.mjs`, `check-image-delivery.mjs`: meaningful permission, preservation and replacement regression coverage.
- `scripts/check-mujib-image-update.mjs`, `check-mujib-image-update-hosted.mjs`: browser and hosted read/denial verification.
- This report and associated validation artifacts.
