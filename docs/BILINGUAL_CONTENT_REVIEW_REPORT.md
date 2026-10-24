# Bilingual content review and administrator acceptance

19 October 2026 · Unseen Jo · project `dkhwwvoplhfjccvjegty`

The review workspace is ready at **http://127.0.0.1:4184/admin/translations**. Select **Bilingual review** in the existing dashboard sidebar. The existing dashboard, charts, authentication, English editor and RTL navigation remain available. All six hosted destinations remain drafts and all six Arabic translations remain Pending Review.

## Review workflow

1. Open the review URL in your existing administrator browser. If signed out, sign in through the normal application form. Credentials stay within the browser and Supabase Auth.
2. Select Ajloun, As-Salt, Mujib, Dana, Iraq Al-Amir or Umm Qais from the queue. Search accepts English and Arabic; filter by Pending Review, Approved or Needs Changes.
3. Compare the English source on the left with editable Arabic on the right. On narrow screens, each English field appears directly above its Arabic counterpart. English is read only in this workspace. Description paragraphs are displayed clearly without rewriting stored source text.
4. Check the field prompts, dated visitor/source notes, coordinates, location precision, prices, durations, source links and outstanding verification warnings. Empty prices do not mean free admission. Prepared research notes are explicitly dated 19 October 2026; they are not live opening information.
5. Edit Arabic and choose **Save Arabic independently**. Only Arabic fields are sent to `place_translations`, with a saved-version condition to reject conflicting edits. English, publication status, source verification and images are outside this save operation. Arabic text edits return translation status to Pending Review.
6. To request corrections, enter a reviewer note and select **Mark Needs Changes**. The server records the actual current administrator and time. **Return to Pending Review** is available without granting approval. Notes remain available while correction work is pending.
7. Only after your own comparison, choose **Approve saved translation** and confirm the separate translation decision. Approval requires saved Arabic, a name, a sufficiently complete description and a current English source version. It never publishes a destination or approves images. Approval clears the resolved reviewer note before the translation could be publicly readable. The private audit log records the actor, identifiers and changed field names; it deliberately does not store note text.

Changing destination prompts before discarding unsaved Arabic or reviewer notes. Browser reload/close warns when unsaved work exists. Dashboard language switching preserves the current edit. If a save reports a conflict, the unsaved Arabic remains available for comparison before reloading.

## Manual language and source reviews

Flags are review prompts, not an assertion that text is wrong. Automatic checks flag missing Arabic, non-Arabic text, an English-source version mismatch and numeric discrepancies. Arabic digits and decimal separators are normalized for comparison, but numbers written as words can still require manual comparison.

| Destination | Human review focus |
| --- | --- |
| Ajloun Forest Reserve / محمية غابات عجلون | Distinguish the broader UNESCO biosphere designation from the reserve; retain conditional trail/activity access, dated eligibility-based fees and editorial visit-duration advice. |
| As-Salt Historic Centre / وسط السلط التاريخي | Separate access to the living historic district from individual museums and tickets; retain stair/accessibility cautions and the editorial duration. |
| Mujib Biosphere Reserve / محمية الموجب للمحيط الحيوي | Check trail terminology, resident categories, dated prices, older minimum-age guidance and conditional opening; distinguish activity fees from the reserve as a whole. |
| Dana Biosphere Reserve / محمية ضانا للمحيط الحيوي | Keep entry fees, guided packages and transfers separate; distinguish Dana village, Wadi Dana and Feynan; retain uncertain accessibility and itinerary-specific guidance. |
| Iraq Al-Amir / عراق الأمير | Distinguish the wider area, Qasr El-Abd and the cooperative; retain uncertain ticket scope, cave access and accessible-route guidance. |
| Umm Qais / أم قيس | Preserve uncertainty about conflicting operating hours, eligibility and museum inclusion; keep the original test-image warning and the site-area reference-pin qualification. |

All six still need human Arabic/English comparison. No translation was automatically approved.

## Verification results and limits

The acceptance story is: a signed-in administrator opens the review queue, compares saved bilingual content, submits only an Arabic change or review decision through the existing Supabase client, and sees the returned saved status. Local browser/API fixtures and disposable database sessions verify the implementation boundaries below. They are not substitutes for the owner's hosted browser session.

| Check | Result / scope |
| --- | --- |
| `npm run validate` | Oxlint, 83 asset references / 48 originals, and production build passed. Existing large MapLibre chunk warning remains. |
| Localization resource audit | No missing known static keys; 1,084 paired resources. |
| Bilingual review unit checks | Three groups passed: six destination prompts, heuristic handling, allowlisted writes, review-note validation and save/review conflicts. |
| Bilingual review database checks | Fourteen groups passed in disposable PGlite/PostGIS, including the existing CMS security checks, actual-session requirements, feedback identity, privacy, stale-review rejection and approval/publication separation. Synthetic data only. |
| Existing localization database checks | Fourteen groups passed, including pending/current/reviewed visibility and original RLS boundaries. Disposable database only. |
| Existing localization units | Six groups passed. |
| Existing hosted anonymous checks | Three passed: translations and drafts remain hidden and anonymous insertion is denied; no stored mutations. |
| Existing localization interactions | Seven groups passed against the production build: independent Arabic save, unsaved-field retention, private previews, fallback, map controls and mobile keyboard behavior. Isolated Auth/API fixtures. |
| Final bilingual review browser checks | Twelve checks passed with zero violations across six automated accessibility scans; see [browser results](validation/bilingual-review-browser.json): English/Arabic at 1440, 820 and 390px, all six exact descriptions, source/location display, language switching, unsaved-change cancellation, independent saves, persistent feedback, pending status, approval cancellation and conflict retention. All operations use isolated responses. |
| Hosted preservation | Passed through the dedicated `supabase_unseen_jo` MCP connection; details below. |
| Real signed-in hosted save and review | **Not verified: no connected browser session was exposed to the browser tool.** |

Browser discovery returned `apps: []` and `browsers: []` before and after the owner selected Connect Browser. Opening the review in Chrome returned **Browser is not available: chrome**. No browser storage, credentials, cookies, tokens or session material was exported. No hosted administrator action was simulated through MCP or a fabricated JWT. Real-account acceptance remains open until the existing signed-in browser is connected and an Arabic save and a non-approval review action can be verified there. Do not approve text merely to test the workflow.

## Hosted preservation

The project URL was verified as `https://dkhwwvoplhfjccvjegty.supabase.co`. Two additive review migrations were locally tested and applied through the dedicated MCP connection: review states/notes, then a constraint and trigger safeguard that prevent resolved reviewer notes appearing on a publicly readable approved row. No existing policies or grants were changed.

Before/final full-row comparisons confirm exact equality for English destinations, image metadata, role rows, policies, grants and bucket configuration. Storage object ID/name/bucket references match exactly; file bytes were not read or rewritten. Every pre-existing translation field and timestamp matches, with only the three newly added review fields present as NULL. Counts remain six drafts, zero published destinations, 12 unapproved image records, 13 Storage references, two role rows, six pending translations and zero approved translations.

Evidence: [preservation summary](validation/bilingual-review-preservation.json), [before snapshot](validation/bilingual-review-before.json), [final snapshot](validation/bilingual-review-final-snapshot.json), [unit checks](validation/bilingual-review-unit.json), [database checks](validation/bilingual-review-database.json), and [screenshots](screenshots/bilingual-review/en-1440.png). Arabic [desktop](screenshots/bilingual-review/ar-JO-1440.png) and [mobile](screenshots/bilingual-review/ar-JO-390.png) captures use explicitly isolated administrator fixtures.

Security advisors found only the previously documented leaked-password-protection warning; no new localization issue was reported. Original Supabase connection configuration and authentication settings remain untouched. No tourism content or image was approved, no destination was published, and Phase 05 was not started.

The workspace is handed over for your review. Real account acceptance is outstanding for the browser connection reason above.
