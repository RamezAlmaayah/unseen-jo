# Simple image management — Phase 04L

Implemented 20 October 2026 (Jordan time), using the existing Supabase project `dkhwwvoplhfjccvjegty`. Phase 05 has not started.

## Normal workflow

Open [Admin → Places](http://127.0.0.1:4184/admin/places), select **Edit**, then **Replace Image → Save Changes**. The photo section shows the current images, Upload Image, Choose Existing Image, cover selection, removal and gallery ordering. It retains optional accessible image descriptions.

Attribution forms, image source URLs, evidence text, license dropdowns, repeated copyright checkboxes, Storage paths and derivative metadata are removed from Quick Edit. An image-only save does not require a text/translation review confirmation. The existing dashboard design, bilingual controls and RTL layout are preserved.

[Media Library](http://127.0.0.1:4184/admin/media) provides **Manage images** links to this same editor. Publishing Workspace links to Media Library rather than introducing another manual image form. Exceptional documentation remains available through the separate **Advanced Details → Full review tools** editor (`?advanced=1`); it is optional for routine image replacement.

## Rights and private previews

- Previously verified images reuse their stored source, attribution, evidence and approval. Caption/order/cover changes do not demand repeated licensing confirmations.
- New unknown uploads offer one short, optional ownership confirmation for that upload batch. **Confirm project originals** is appropriate only for photographs created or owned by Unseen Jo with permission to publish. **Keep private** is the safe alternative. An optional confirmation action is also available later.
- The declaration is recorded once for the actual Storage object and authenticated administrator. It is not blanket permission for future uploads. Object identity and metadata must still match at save time.
- Confirmed originals use the `owned` license basis and an internal ownership-evidence reference. They are never labeled public domain. Existing verified third-party author/license metadata is retained.
- Unknown photographs show one short private-preview warning. They can be uploaded, saved in the private working draft and previewed after refresh. They cannot replace a published cover until eligible. Unapproved gallery images remain hidden publicly.
- Google search URLs, filenames and client-supplied license claims cannot establish rights. Changing a citation does not download or replace a photograph.

The existing supported-source evidence-package importer and its checks for author, license evidence, file integrity, source identity and evidence freshness are retained. This task did not run a live import or add arbitrary remote-URL rights discovery. Local files without established rights remain private. Existing public photo attribution presentation is unchanged.

## Backend and preservation

Applied migrations:

- `supabase/migrations/20261019211445_phase04l_simple_image_management.sql`
- `supabase/migrations/20261019212319_phase04l_simple_image_locking.sql`

The new RLS-protected ownership record is immutable to normal clients; a trigger records the real actor, timestamp and object fingerprint. The eligibility and save RPCs are SECURITY INVOKER and require an active administrator matching the editor identity. Anonymous execution is revoked.

The dedicated media-only save locks the destination and related rows, checks the current version, rebuilds rights metadata from stored evidence, and atomically changes the actual selected cover and gallery. Existing verified-image evidence is reused. A separate deferred publication-readiness check rejects an invalid final published state. Ordinary direct writes to published dependencies remain blocked. No Storage policy was broadened.

Image-only saves leave destination text, Arabic/English translation history, reviews and publication timestamps/status untouched. Draft destinations remain drafts. Replacing a cover retains the previous photograph; removing an association does not delete the original Storage object. Full content edits retain the existing safeguards.

Uploads preserve original bytes and use immutable object paths. The existing responsive image service supplies display derivatives; successful saves invalidate the relevant destination and image-signature caches. Home, Explore, details and map previews consume the saved media association rather than the citation URL.

Hosted before/after checks found identical existing destination, translation, image and Storage fingerprints, including row timestamps under the recorded projection. All 15 Storage objects were retained. No hosted image uploads or ownership declarations were made. The six destinations were already published at the start and remain in their existing states; this task did not publish them. See [preservation evidence](validation/simple-image-preservation.json).

## Validation

| Check | Result and scope |
| --- | --- |
| Database transaction/security regressions | 15 groups passed in disposable PGlite: unauthorized access, forged rights, immutable object-bound proof, stale object detection, atomic cover replacement, unchanged text/reviews/status, preserved old photo, direct-write rejection and deferred final validation |
| Existing Admin database suite | 12 groups passed in disposable database |
| Quick Edit model | 4 groups passed, including distinguishing image-only changes from manual bilingual edits |
| Browser workflow | Four full runs passed: development and production preview, English desktop and Arabic mobile. Auth/API/Storage were intercepted fixtures, not the owner's hosted session |
| Image acceptance | Synthetic original test photo uploaded in fixtures; private preview persisted after refresh; one ownership declaration enabled image-only cover save; selected cover persisted after refresh; old photo retained; Home/Explore/details used the new file |
| Focused browser checks | Existing-image choice, gallery ordering/removal, map popup/Explore preview, Media Library and Publishing Workspace links passed; no licensing forms interrupted Quick Edit |
| Accessibility | Zero axe violations in tested editor and ownership-dialog scans; RTL/mobile overflow checks passed |
| Image delivery | 6 groups passed: signature reuse/isolation/expiry, bounded requests, derivative integrity/proportions, immutable replacement and citation non-fetching |
| Existing publishing runner | 6 isolated in-memory groups passed; no hosted publishing operation executed |
| Performance/security and localization | 7 security/cache groups and 6 localization groups passed; static localization audit found no missing strings |
| Hosted API authorization | Genuine anonymous reads passed; six protected RPC calls denied with `42501`; ownership-table reads denied |
| Live public photographs | All 12 destination/language checks passed against genuine hosted data and responsive signed image delivery; existing Wadi Mujib Arabic fallback remained correctly visible |
| Live map image reuse | Genuine hosted popup photograph and map state retained after 5-second and 30-second tab returns |
| Hosted schema security | Ownership RLS enabled; new RPCs and Quick Edit wrapper/core are SECURITY INVOKER with no anonymous execute privilege |
| Build/assets | Oxlint passed with no warnings; 83 asset references and 48 original hashes validated; production build passed with the existing large-bundle advisory |

Browser evidence is in [quick-edit-browser.json](validation/quick-edit-browser.json). Hosted public image checks are recorded separately in [live-tourism-image-tests.json](validation/live-tourism-image-tests.json).

## Limits and remaining reviews

No connected signed-in administrator browser was available. Genuine owner-account upload/save acceptance could not be performed; fixture browser workflows and disposable database transactions must not be represented as that acceptance. Live hosted operations were read-only checks and unauthorized-access denials.

The existing Wadi Mujib Arabic source-version review and source-citation issues are unchanged; this image-interface task does not sign translation reviews or rewrite source evidence. Unknown third-party photographs still need actual rights evidence or a supported verified import before public use.

The hosted security advisor reports only the existing disabled leaked-password-protection warning. Authentication settings were preserved; see [Supabase remediation guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Modified implementation files

`QuickPlaceEditor.jsx`, `OriginalPhotoPrompt.jsx`, `quickEditModel.js`, `repository.js`, `Management.jsx` and `AutomatedPublishing.jsx` under `src/features/admin/`; English/Arabic resource files; the two migrations above; Quick Edit browser/model/database/hosted test scripts; the synthetic image fixture; validation artifacts and this report. The earlier Quick Edit report's manual photo-form instructions are superseded by this workflow.
