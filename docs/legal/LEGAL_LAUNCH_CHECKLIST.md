# Legal launch checklist

24 October 2026 ? **DRAFT ? OWNER/LEGAL REVIEW REQUIRED.** The owner has supplied **Ramez Ahmad Almaayeh**, an **individual operator, not a registered company**, and **ramezmayaa@gmail.com**. These facts are incorporated into both local static drafts; no address, retention period, response deadline, company registration or legal approval is inferred. Mailbox monitoring/fulfillment remains unverified. See [the exact draft change review](LEGAL_OPERATOR_DRAFT_OWNER_REVIEW.md). Historical statements below that the name/contact are missing are superseded only on those points; all other launch/legal requirements remain open. No managed mode, migration, hosted change or deployment occurred.

24 October 2026 update: [LEGAL_PAGES_MANAGEMENT.md](./LEGAL_PAGES_MANAGEMENT.md) documents the locally prepared bilingual versioned Admin editor, draft isolation, editorial publication/revocation and safe activation. The migration is not applied to hosted Supabase. Initial revisions are unapproved drafts; operator/contact/retention and qualified legal-review items remain unresolved. No historical user terms acceptance is claimed or created. The prepared deletion process is not described as an operational hosted service. Earlier implementation statements below are historical; this addendum governs the new feature.

23 October 2026 update: [ACCOUNT_PRIVACY_IMPLEMENTATION.md](./ACCOUNT_PRIVACY_IMPLEMENTATION.md) documents the new local export/deletion-request UI, migration, Edge Function, service-only fulfillment and exact file inventory. The historical statement below that no dedicated account-deletion workflow exists is superseded: requests are now implemented in source, but hosted installation, monitored manual processing, alternative identity verification, completion communications and legal/operator confirmations remain launch blockers. No real user data was changed. New security and browser evidence is under `docs/validation/account-privacy-*.json`.

Revision: 22 October 2026. Local implementation; do not deploy as legally approved documents until blockers below are resolved.

## Implementation files

Created: `src/features/legal/content.js` (paired substantive documents), `src/features/legal/ui.js` (shared bilingual labels), `src/pages/LegalPage.jsx`, `src/components/layout/SiteFooter.jsx`, `src/components/layout/LegalLinks.jsx`, `src/styles/legal.css`, `scripts/check-legal-browser.mjs`, and the three review documents in this folder.

Modified: `src/App.jsx` (two public routes), `src/components/layout/AppLayout.jsx` (footer), `src/pages/AuthPage.jsx` (registration links), `src/features/account/AuthPresentation.jsx` (shared Admin Auth links), and `src/seo/model.js` (legal metadata). Verification regenerated browser/unit/localization/SEO evidence under `docs/validation/` and screenshots under `docs/screenshots/legal/` and existing authentication test artifact folders. Authentication handlers, database migrations, destination records and hosted configuration were not edited.

## Verified in source

- [x] Public privacy and terms routes, paired English/Arabic content, RTL/LTR, revision date, readable layout, working contents anchors, related/home links.
- [x] Shared public footer links; registration links before submit, login footer links, administrator Auth presentation links. No existing About/legal route was found to duplicate.
- [x] Existing Auth, guest browsing, saved places, visits, preferences, rule-based recommendations and location behavior described in the privacy review evidence table.
- [x] Deletion gaps, signed-link avatar limits, persistent sessions, map network requests and unverified vendor configuration disclosed.
- [x] Existing SEO utility reused; public routes recognized, single title/description/robots, canonical only for configured real HTTPS origin.
- [x] No records/settings/permissions changed, no primary Admin test, no deployment.

## Owner and legal blockers

- [ ] Publish confirmed legal operator/controller identity, address and verified legal/privacy contact. No invented email or unusable mailto placeholder is present.
- [ ] Implement a monitored privacy/data-request and account-deletion procedure, verification, records, responsible staff and legally reviewed timelines. A self-service Delete account workflow does not currently exist.
- [ ] Establish lawful grounds for each processing purpose; review prior consent, profiling, children's data, applicable registrations/DPO, breach response and complaint process under Law 24/2023 and current regulations/instructions.
- [ ] Confirm real hosting and email delivery providers, enabled Auth notifications, regions, contracts/subprocessors and lawful international transfers. Repository Vercel config and prepared email HTML do not prove live installation.
- [ ] Approve actual retention/deletion schedules and implement them, including abandoned uploads, Auth, database, logs, backups and vendors. Audit old avatar objects; profile unlinking is not object erasure.
- [ ] Independently verify hosted RLS/storage permissions and security posture before claiming an audit. This task inspects implementation/migrations, not a complete hosted security assessment.
- [ ] Resolve children’s eligibility/guardian arrangements; do not invent age validation or parental consent.
- [ ] Verify image and map licenses/credits, tourism claims, and estimate/prototype labeling.
- [ ] Counsel approves both languages, limitation wording, contracting identity, mandatory rights, governing law, dispute provisions, and any required acceptance/version records.
- [ ] Replace draft notices only after facts and operational processes are confirmed. Use a real publication/revision date for launch.
- [ ] Configure real production origin and verify hosting fallback/direct legal URLs. This remains a client-rendered SPA: initial HTML contains homepage defaults; route-specific legal metadata/content appears after JavaScript. Prerendering/server rendering is needed if non-JavaScript crawlers require route-specific initial HTML. No canonical currently points to localhost.

## Verification

| Check | Result |
| --- | --- |
| `npm run lint` | Passed, Oxlint |
| `npm run build` | Passed; existing advisory about chunks over 500 kB remains |
| `npm run validate:assets` | Passed: 83 asset references, 48 unique originals |
| `npm run test:accounts` | Passed: 9 local database/model/callback groups |
| `npm run test:discoveries` | Passed: 10 database/model/localization groups |
| `npm run audit:localization` | Passed: no missing static translations |
| `npm run test:localization` | Passed: 5 groups |
| `node scripts/check-seo.mjs` | Passed: 7 groups, initial HTML, canonical validation and no duplicates |
| `node scripts/check-legal-browser.mjs` | Passed: 24 groups across both languages at 1366/768/390/320; keyboard contents anchors, direct routes, language switching, registration legal links before submit, new-tab reading preserves entered fields, metadata and zero axe WCAG A/AA violations |
| `node scripts/check-auth-premium.mjs` | Passed: both languages at 1366/320, incorrect password, visibility, Enter, resend cooldown, Admin allow/deny and recovery, accessibility |
| `node scripts/check-phase06-browser.mjs` | Passed: 11 groups, eight bilingual layouts plus account/profile/save/logout/isolation, signup/PKCE variants, recovery/expired/reset guards/network failure/reduced motion |

Production preview used `http://127.0.0.1:4195` with `QA_BASE_URL` set for browser scripts. Browser tests use isolated API fixtures and do not demonstrate real email delivery, hosted security settings or live account changes. Database tests replay migrations locally and do not modify hosted destinations. New screenshots: `docs/screenshots/legal/`; browser evidence: `docs/validation/legal-browser.json`, `auth-premium-browser.json`, `phase06-browser-4195.json`. Screenshot review covered English desktop and Arabic mobile.

Metadata limitation: built `dist/index.html` retains the homepage title/description. Legal route titles/descriptions are applied by the existing SEO provider after React loads. No production domain is invented. No TypeScript compiler/configuration exists in this JavaScript/JSX repository; Vite production compilation and Oxlint were used.
