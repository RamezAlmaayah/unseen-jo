# Privacy Policy review

24 October 2026 ? **DRAFT ? OWNER/LEGAL REVIEW REQUIRED.** The owner has supplied **Ramez Ahmad Almaayeh**, an **individual operator, not a registered company**, and **ramezmayaa@gmail.com**. These facts are incorporated into both local static drafts; no address, retention period, response deadline, company registration or legal approval is inferred. Mailbox monitoring/fulfillment remains unverified. See [the exact draft change review](LEGAL_OPERATOR_DRAFT_OWNER_REVIEW.md). Historical statements below that the name/contact are missing are superseded only on those points; all other launch/legal requirements remain open. No managed mode, migration, hosted change or deployment occurred.

24 October 2026 update: [LEGAL_PAGES_MANAGEMENT.md](./LEGAL_PAGES_MANAGEMENT.md) documents the locally prepared bilingual versioned Admin editor, draft isolation, editorial publication/revocation and safe activation. The migration is not applied to hosted Supabase. Initial revisions are unapproved drafts; operator/contact/retention and qualified legal-review items remain unresolved. No historical user terms acceptance is claimed or created. The prepared deletion process is not described as an operational hosted service. Earlier implementation statements below are historical; this addendum governs the new feature.

23 October 2026 update: Privacy & Account now implements a scoped data download and identity-verified deletion-request workflow locally. Server installation remains pending; requests require manual authorized fulfillment. The historical findings below about no dedicated request feature are superseded by [ACCOUNT_PRIVACY_IMPLEMENTATION.md](./ACCOUNT_PRIVACY_IMPLEMENTATION.md). No claim of live deployment, immediate deletion or a complete support channel is made. Operator identity/contact, legal approval, retention and vendor/transfer confirmations remain open. The public bilingual policy now describes this workflow and remains a review draft.

Revision: 22 October 2026. Status: substantive bilingual review draft, implemented locally; not deployed or legally approved.

Public route: `/privacy-policy`. English and Arabic paragraphs are paired under stable section IDs in `src/features/legal/content.js`; UI labels live in `ui.js`. Both versions disclose the same operational limitations. The revision date is not a claim that public publication occurred.

## Verified implementation facts

| Fact | Evidence |
| --- | --- |
| Registration collects name, email, password; language is metadata | `src/pages/AuthPage.jsx` |
| Separate persistent user/admin sessions, refresh and PKCE | `src/features/account/client.js`, `src/features/admin/client.js` |
| Confirmation/recovery callback with controlled return paths | `src/pages/AuthCallbackPage.jsx`, account Auth provider/model |
| Profile name, language, optional avatar | `src/features/account/repository.js`, `src/pages/ProfilePage.jsx` |
| Avatar bucket uses signed links; upload converts validated images | `repository.js`: `profile-avatars`, 300-second signed URL, image validation/upload |
| Removing/replacing avatar does not demonstrate old object erasure | Repository has upload/signing; no old-object removal operation |
| Saved places and preferences synchronize for signed-in users; guest saves merge | `UserAccountProvider.jsx`, account repository |
| Visits are self-reported, optional date; history stores recommendation events; clear history exists | `src/features/personal/repository.js`, `PersonalDiscoveriesProvider.jsx` |
| Recommendation scoring is application logic, not an external LLM | `src/features/recommendations/` |
| One explicit geolocation read, no watch, account upload, or coordinate storage in that hook | `src/features/map/useLocation.js` |
| Explore state includes search, filters, selected destination, camera and scroll in session storage | `src/features/tourism/exploreState.js` |
| Language, guest saves, Auth sessions persist; guest preferences and resend cooldowns use per-tab storage | i18n, account providers/client/cooldown, preferences provider |
| MapLibre uses OpenFreeMap tiles/fonts/sprites; OpenStreetMap attribution | `public/maps/unseen-nature.json`, map components and attribution |
| Google Maps external directions contain destination coordinates | `src/features/map/geography.js` |
| Administrator CMS and audit records exist | `src/features/admin/`, project migrations; admin analytics summarize content, not a verified audience-tracking integration |
| Account-scoped queries, RLS migrations, database role checks | account/personal repositories, `supabase/migrations/`, admin Auth |

The repository audit identified no payment/booking workflow, public reviews/comments, advertising pixel, third-party audience analytics SDK, self-service account deletion, or dedicated data-request endpoint. This is a code finding, not a guarantee about hosted provider logs or tools installed outside this repository. No hosted records, settings, users, or permissions were changed for this task.

## Legal research and limits

Reviewed 22 October 2026: [MoDEE official FAQ](https://modee.gov.jo/EN/Pages/FAQs) and [official law, regulations, instructions and forms index](https://www.modee.gov.jo/EN/List/The_law_regulations_and_instructions). The FAQ describes conditional data-subject rights and transfer requirements. The index includes the 2023 law, 2025 disclosure regulation, security instructions and rights-request forms. These sources informed the draft; listing them does not mean every underlying instrument has been exhaustively legally analyzed. Avoid importing GDPR contract/legitimate-interest bases without Jordanian legal advice.

Supabase changelog reviewed via its official Markdown endpoint; relevant upcoming TLS-cipher retirement does not alter this documentation-only integration. Authentication persistence was checked against the installed client configuration. No new Supabase behavior was implemented.

## Blocking owner/legal confirmations

- Legal controller/operator identity, establishment, address, and verified privacy contact.
- A functioning privacy/account-deletion request channel, identity-verification process, responsible staff, deadlines and complaints handling. Current profile controls are not a substitute.
- A purpose-by-purpose legal basis and any necessary prior-consent mechanism/records; registration is not blanket processing consent. No checkbox or consent recording was added.
- Real website hosting, email delivery/SMTP provider, optional security notification settings, provider contracts/subprocessors and processing regions. Vercel configuration is not proof of live hosting; local email previews are not proof of hosted templates or delivery.
- Retention periods justified by purpose/law; deletion across Auth, database, avatars, logs, backups and vendors; obsolete-avatar cleanup. No automatic expiry or backup deletion guarantee.
- International transfer conditions and safeguards, registration/DPO requirements where applicable, breach response and security measures under current Jordanian instruments.
- Children’s eligibility and any lawful guardian/age controls; no fabricated minimum age or existing parental-consent process.

Public text deliberately makes no absolute encryption, security, no-sharing, Jordan-only hosting, fixed retention, sale-free corporate practice, guaranteed deletion or automatic-compliance promise. The visible draft notice must remain until the launch blockers are resolved. Do not silently replace missing facts with invented details.

Verification results and scope: see `LEGAL_LAUNCH_CHECKLIST.md` and `../validation/legal-browser.json`.
