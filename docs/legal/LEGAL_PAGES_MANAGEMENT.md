# Legal Pages Management — implementation and activation

Revision: 24 October 2026. **Local implementation only. Hosted activation has not been performed. Legal documents remain under owner/legal review.**

Activation-preparation addendum (24 October): [LEGAL_PAGES_ACTIVATION_GUIDE.md](./LEGAL_PAGES_ACTIVATION_GUIDE.md) is now the authoritative owner procedure. Read-only hosted inspection confirms dependencies, two Admin memberships and 24 Published destinations; legal objects remain absent. The guide includes the guarded transactional Dashboard file, scoped recovery pack, actual hosted-history compatibility tests, 13 timestamp mismatches, backup/session checks still pending and the unchanged static-mode setting. No hosted writes or deployment occurred.

## Delivered behavior

Admin route: `/admin/legal`, in the existing Admin sidebar. Both existing Admin accounts use the same current-session database role check as the rest of the CMS; no email allowlist, metadata role, separate authentication mechanism, password or privileged browser key was added. The editor displays the editor's Auth identifier without requesting an account directory.

Each document has a current Draft/Published summary, revision number, last update, most recent approval, last editor and history. English and Arabic editing covers titles, introductions, headings and section bodies. Adding, removing and reordering sections affects both languages together. Removal requires confirmation. Keyboard buttons provide reordering without drag-and-drop. The Arabic content editor and preview have their own RTL direction independently of the Admin interface language.

Supported Markdown is intentionally limited: paragraphs, line breaks, bold, emphasis, inline code, ordered/unordered lists and validated links. HTML, JavaScript, remote embedded images and arbitrary attributes are not rendered. Text is escaped by React. The client and database reject unsafe content; the preview remains safe even before validation. No editor dependency was added.

- **Save draft:** creates an immutable bilingual snapshot. A repeated save of an identical latest draft is a no-op. Published content is unchanged.
- **Preview:** uses the same `LegalDocument` renderer as the public managed pages. The preview badge explicitly distinguishes the proposal from publication.
- **Approve & publish:** confirmation plus complete saved bilingual content required. Unsaved content cannot be approved. Only the latest saved draft can be approved. Actor and timestamp come from the database.
- **Revoke approval:** confirmation required. The highest-version remaining approval becomes current. With none, managed public pages show unavailable, never a draft. Previous approvals remain independently revocable through version history.
- **Restore:** selecting an earlier version makes it read only; restore copies it into a new draft. A separate approval is required.
- **Concurrency:** every mutation locks its document and checks an expected lock version. A stale save, publish, revoke or restore fails without overwriting newer changes; the editor retains local text until the Admin explicitly reloads/discards it.
- **Errors:** no automatic mutation retries, raw server messages or false completion reports. A successful operation is followed by a fresh state/revision read. A lost response or failed verification asks the Admin to reload before retrying.

New content is available at `/privacy-policy` and `/terms-of-service` only after managed mode is activated. Existing footer, registration and authentication links stay on those routes. Public reads use the existing anonymous client, never the Admin session. Draft/revoked rows and private audit identities are excluded by RLS. Approved historical versions are public legal records; the page selects the newest still-approved one.

The save/publication action bar stays accessible while editing long documents. Unsaved edits are protected on in-app navigation, sign-out, document switching, reload/discard and browser Back/Forward; traversal cancellation is tested with and without Navigation API support. Native browser unload warnings remain subject to the browser's normal interaction rules. A separate early history listener protects the editor before Router can unmount it. Login, non-editor routes and route architecture remain unchanged.

## Migration and security

Prepared migration: `supabase/migrations/20261023213831_legal_pages_management.sql`.

Dependencies are the existing foundation and Admin CMS migrations, particularly `unseen_private.is_admin()` from `20261018154102_phase04_admin_cms.sql`, existing role memberships, `auth.uid()` and active Auth sessions. Do not replace that check or add Admin memberships. Review the target's migration history before activation; do not blindly push every pending privacy or unrelated migration.

Tables:

| Table | Access and purpose |
| --- | --- |
| `legal_documents` | Admin-only head, lock version, revision counter and last editor |
| `legal_revisions` | Immutable full bilingual snapshots; public read only approved, non-revoked revisions |
| `legal_events` | Admin-only append-only save/publish/revoke/restore history; server-derived actor and time |

All tables use RLS. Five public RPCs are SECURITY INVOKER: `admin_legal_state`, `admin_save_legal_draft`, `admin_publish_legal`, `admin_revoke_legal`, `admin_restore_legal`. Mutation helpers also require the existing active Admin session. Triggers reject direct authenticated table writes outside the scoped authorized operation. There are no delete/truncate grants or frontend service-role keys. Auth's `ON DELETE SET NULL` actor cleanup is narrowly preserved for separately authorized account removal; it cannot change content, approvals, action timestamps or erase a still-existing actor. That exception does not provide an account-deletion endpoint.

The migration seeds the current substantive Privacy Policy (12 sections) and Terms (14 sections), in both languages, as **unapproved version 1 drafts**. It creates no fictitious approval history or user acceptance history. No user, role, tourism record, destination status or existing relationship is updated.

## Safe activation procedure — not executed

1. Review the migration and operator/legal text. Take the established recoverable database backup and confirm the exact project/migration state. Test with disposable accounts in an isolated Supabase environment when available. PGlite tests do not replace hosted platform integration.
2. Apply **only the reviewed legal migration** through the project's authorized migration process after checking the dependencies. Do not activate unrelated pending migrations. Keep `VITE_LEGAL_CONTENT_SOURCE=static` while preparing approvals; public pages remain explicitly labelled static review drafts.
3. Run the prepared frontend locally against the authorized environment; sign in through the existing Admin login. Visit `/admin/legal`. Confirm both legitimate Admin accounts can open it and an ordinary account cannot. No credentials or tokens should be shared with an executor.
4. Review both languages, enter only confirmed operator/contact/retention details, save, preview and explicitly **Approve & publish** each document. Review flags are independent of publication and must be checked only when evidenced. Publication never silently marks them complete.
5. As a guest and ordinary user, verify that the current approved snapshots load and draft/revoked IDs do not return content. Verify revocation/fallback and conflict behavior with disposable documents in isolation. Do not revoke live terms as an activation experiment.
6. After both documents are approved and launch/legal decisions are satisfied, configure `VITE_LEGAL_CONTENT_SOURCE=supabase` in the intended frontend environment and rebuild through a separately authorized release. No release is started by this task. An invalid value fails closed; unavailable managed content does not fall back to static drafts.
7. Verify public routes, EN/AR, current versions, footer/registration links, unique metadata and registration availability. Keep an owner responsible for future legal revisions and approval review.

If using the Supabase Dashboard SQL Editor for the reviewed activation, select project `dkhwwvoplhfjccvjegty`, open a new query, wrap the complete prepared migration file in `BEGIN;` / `COMMIT;`, inspect the selected project again and execute once. Do not manually grant additional privileges or run a general pending-migration push. Keep a record in the project's normal migration bookkeeping so this file is not reapplied. Stop on any dependency/permission error and roll back; do not bypass the existing Admin check.

**Operational rollback:** restore an earlier snapshot as a new draft and approve it, or revoke a problematic approval to fall back to another still-approved revision. Do not delete legal history. If no acceptable approval exists, keep managed pages unavailable and application registration paused. Switching back to static review mode is a development migration escape hatch, not a production legal rollback or a substitute for approved documents.

## Registration and acceptance scope

No terms checkbox or acceptance-record claim existed before this feature. None is invented now. Registration keeps the existing read-before-submission links and, in managed mode, shows the current published Privacy/Terms versions. It waits for both documents and freshly rechecks before email signup or registration-mode OAuth. Existing login, confirmation, recovery, PKCE, guests and route guards are unchanged.

There is **no persisted user acceptance ledger**, no historical accepted version, and no blanket processing consent. The availability guard is in the application registration flow. Direct Supabase Auth signup is not newly gated at the server; enforcing a legally required recorded acceptance/version at Auth creation would need a separately designed trusted workflow/hook and owner approval. Do not describe this feature as providing that enforcement. An availability change after the fresh read is also not an atomic transaction with Auth signup. No unavailable terms are recorded as accepted because no acceptance is recorded at all.

Open managed pages revalidate on focus, visibility return and same-origin publication messages; no persistent legal-content cache is used. Revocation cannot remove content already seen/copied, and an already-open inactive page is not an instantaneous server-pushed revocation display.

## Content review and unresolved launch decisions

The existing substantive drafts were retained. Privacy wording now distinguishes the prepared local deletion process from an operational hosted service; publication is distinguished from external legal certification. Both language versions and the initial migration snapshots stay aligned. Other static sections remain intact, and account-deletion controls remain governed by their existing production-disabled availability policy.

Owner/legal confirmation remains required for:

- The legal operator/controller identity, establishment/address and verified privacy/legal contact channel.
- Purpose-specific legal bases, rights request handling, responsible personnel and operational response arrangements.
- Justified retention/deletion schedules, backup/vendor handling and actual hosting/processing regions and international-transfer safeguards.
- Actual service-provider/SMTP arrangements and enabled email notifications.
- Children's eligibility/guardian rules and any age controls.
- Qualified review under Jordan's applicable personal-data-protection legislation and other applicable law. Editorial approval is not a compliance certification.
- Whether a recorded terms acceptance workflow is legally/business required; it is outside the current acceptance behavior.

Official references reviewed: [Jordan Ministry FAQs](https://modee.gov.jo/EN/Pages/FAQs), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [database functions](https://supabase.com/docs/guides/database/functions). These sources do not establish Unseen Jo's compliance or hosted configuration.

## Exact source inventory

Created:

- `src/features/admin/LegalManagement.jsx`
- `src/styles/admin-legal.css`
- `src/features/legal/model.js`
- `src/features/legal/seed.js`
- `src/features/legal/repository.js`
- `src/features/legal/useLegalDocuments.js`
- `src/features/legal/navigationGuard.js`
- `src/features/legal/SafeMarkdown.jsx`
- `src/features/legal/LegalDocument.jsx`
- `supabase/migrations/20261023213831_legal_pages_management.sql`
- `scripts/check-legal-management.mjs`
- `scripts/check-legal-management-database.mjs`
- `scripts/check-legal-management-browser.mjs`
- `scripts/legal-management-translations.json`
- This report.

Modified:

- `src/App.jsx`: installs the inactive-by-default history safeguard before Router subscribes, so cancellation preserves the editor even without Navigation API support.
- `src/features/admin/AdminApp.jsx`: lazy Admin route, sidebar and workspace integration.
- `src/pages/LegalPage.jsx`: static migration mode plus approved-only managed pages.
- `src/pages/AuthPage.jsx`: managed registration availability/current versions/fresh check.
- `src/features/legal/content.js`: revision date and grounded bilingual wording corrections.
- `src/i18n/locales/en.json`, `src/i18n/locales/ar-JO.json`: complete feature labels/errors.
- `.env.example`: explicit safe migration flag.
- `package.json`: three legal-management test commands.
- `docs/legal/PRIVACY_POLICY_REVIEW.md`, `TERMS_OF_SERVICE_REVIEW.md`, `LEGAL_LAUNCH_CHECKLIST.md`: current review/activation addendum.

Generated verification evidence is under `docs/validation/legal-management-*.json`, existing authentication/legal/SEO validation outputs, and `docs/screenshots/legal-management/`. These contain disposable fixture identifiers, not real sessions or credentials.

## Verification results

| Check | Result | Evidence/scope |
| --- | --- | --- |
| `npm run lint` | PASS, zero warnings | Oxlint against current source and tests |
| `npm run test:legal-management` | PASS, 6 groups | `docs/validation/legal-management-model.json`; schema, bilingual parity, unsafe content/links, publication selection, errors and Arabic labels |
| `node scripts/check-legal-management-database.mjs` | PASS, 15 groups | `docs/validation/legal-management-database.json`; actual full migration replay in disposable PGlite/PostGIS; guests/ordinary users/two synthetic Admins, direct-write rejection, immutable revisions, server actors, CAS, revoke/fallback/unavailable, restore, unsafe/incomplete content, expired session, actor cleanup and preservation of unrelated fixtures |
| `node scripts/check-legal-management-browser.mjs` with `QA_BASE_URL=http://127.0.0.1:4196` | PASS, 17 groups | `docs/validation/legal-management-browser.json`; compiled managed production build, fully intercepted Supabase fixtures, no hosted requests/writes |
| Browser functionality/security | PASS | Edit/save, explicit confirmation/cancel, private drafts, public publication, revoke/fallback, restore, concurrent Admin conflict, paired section operations, safe Markdown/XSS rejection, unsaved link/sign-out/Back warnings, traversal fallback, unavailable terms/noindex, fresh signup preflight, guest guard, missing migration and failed readback after a committed operation |
| Admin/public responsive accessibility | PASS | English/Arabic; Admin 1366px and 390px, published pages 390px; no horizontal overflow; reduced-motion contexts; zero axe WCAG A/AA violations. Keyboard contents anchors and unique metadata checked. Screenshots under `docs/screenshots/legal-management/` |
| `node scripts/check-legal-browser.mjs` | PASS, 24 groups | Final default production build at 4195; original static review pages and registration links, 1366/768/390/320px, EN/AR, keyboard anchors, metadata and axe; `docs/validation/legal-browser.json` |
| `node scripts/check-auth-premium.mjs` | PASS, 4 EN/AR/viewport groups | Existing production Chromium Auth/REST fixtures: incorrect password, visibility, Enter, recovery/cooldown/reload, Admin login/denial/recovery, accessibility; `docs/validation/auth-premium-browser.json` |
| `node scripts/check-phase06.mjs` | PASS, 9 groups | Disposable database and callback model regression; profile/owner access, metadata role rejection, preferences/saved places/avatar scope, ordinary-user Admin RPC denial, validation and PKCE callback/token scrubbing; `docs/validation/phase06-unit-database.json` |
| `npm run audit:localization` | PASS | Zero missing static resources; all new feature strings have real Arabic resources |
| `node scripts/check-seo.mjs` | PASS, 7 groups | Initial HTML defaults/uniqueness, production-origin validation, private indexing and Arabic SEO |
| `npm run build` | PASS | Default static migration mode; `artifacts/legal-management-build.txt` |
| `npm run build -- --outDir artifacts/legal-management/dist` with `VITE_LEGAL_CONTENT_SOURCE=supabase` | PASS | Separate compiled managed-mode QA artifact; `artifacts/legal-management-managed-build.txt` |

The existing large-chunk warning remains (main application and map bundles exceed 500 kB). The new editor is lazy loaded and the public Supabase client remains dynamically loaded only when needed. No dependencies were installed. This JavaScript/JSX project has no configured standalone TypeScript-check command. Public legal content and route metadata remain client rendered in the existing SPA; no SSR/prerendering was introduced. Non-JavaScript crawlers still receive the existing initial HTML shell metadata.

**Not verified / activation prerequisites:** real hosted migration application, platform Auth/PostgREST behavior, and the actual two Admin browser sessions. PGlite uses minimal synthetic Auth/Storage contracts; browser APIs are intercepted. These checks do not certify a hosted deployment, external legal compliance, real email delivery, or full-platform integration. No real account, password, role, destination, publication status or hosted configuration was modified. No frontend, migration or Edge Function deployment was started. The separately prepared privacy/deletion backend remains inactive under its existing restrictions.
