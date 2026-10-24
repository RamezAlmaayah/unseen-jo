# Shortest safe path to public launch

24 October 2026 update: static legal copy is finalized in both languages without draft banners or an approval workflow. Earlier draft/legal-approval steps below are superseded for these pages. See the short [implementation note](legal/STATIC_LEGAL_IMPLEMENTATION_NOTES.md); other technical readiness and owner-dashboard actions are unchanged.

**24 October 2026 — preparation complete; unrestricted launch remains NO-GO.** Use the existing free Netlify hosting plan and completed `dist`. No hosted write, backup creation, approval or publication was performed by this review.

## One owner checklist

| Done | Action, in order | Who completes it | Measurable evidence |
| --- | --- | --- | --- |
| [ ] | Establish database **and Storage** recovery using the [Windows runbook](operations/WINDOWS_SUPABASE_BACKUP_RECOVERY.md). No Docker/WSL. | Owner: Dashboard, private database access and recovery authorization. Codex can inspect redacted evidence. | Successful export/provider restore point, protected copies/hashes, complete Storage inventory/bytes, compatible isolated restore verification and signed recovery record. An archive listing alone is insufficient. |
| [x] | Finalize the static Privacy Policy and Terms of Service in EN/AR. | Completed locally at the owner's instruction. | Supplied operator/contact facts, normal informational copy, working links and no visitor-facing draft/approval banner. No legal certification is claimed. |
| [x] | Preserve registration links and existing Auth controls without introducing an approval gate. | Completed locally. | Both legal pages accessible before submission; no historical acceptance ledger claimed. Implementation limits are in the short developer note. |
| [ ] | Confirm a production-capable Auth email sender and the eight saved hosted templates. | Owner: Supabase **Authentication → Emails → SMTP Settings / Templates**, authorized email-provider account. | Verified sender, permission to email non-team recipients, workable limits and saved template/variable checks. **Default Supabase SMTP is unsuitable for unrestricted signup**; actual hosted SMTP configuration is unverified. No paid service/domain purchase is authorized. |
| [ ] | Obtain the real free Netlify origin and configure the [exact Auth settings](AUTH_PUBLIC_LAUNCH_ACCEPTANCE.md). | Owner: Netlify and Supabase Dashboards, explicitly authorizing each setting change. | Exact assigned HTTPS origin, narrow callback entries, preserved local redirects. If no origin is reserved, optionally upload only the [origin-reservation folder](../artifacts/netlify-origin-reservation/) to [Netlify Drop](https://app.netlify.com/drop); this inert holding page has no Auth/data access. This is an owner publication step, not something Codex has executed. |
| [ ] | Make **one final configuration/content build** after the facts and origin are confirmed, keeping legal source `static`, privacy QA `false` and prototype `false`. | Codex can update local `VITE_SITE_URL`, approved static copy and run existing checks; no feature rebuild or managed-legal activation is needed. | `npm run build:netlify` passes; exact-origin canonical/social URLs, `_redirects`/`_headers`, no `.env` or private credentials in output. Vite configuration is build-time. The existing `dist` has not been changed by this review. |
| [ ] | Publish that `dist` to the **same Netlify project's Deploys dropzone**, then complete the [real-world acceptance tests](AUTH_PUBLIC_LAUNCH_ACCEPTANCE.md). | Owner publishes and operates a controlled inbox/test account; Codex can verify permitted browser/read-only results. | All acceptance cases pass at the final origin, including delivery to a controlled **non-team** email address. Real signup/password-reset writes require explicit test authorization; use no primary Admin password. |
| [ ] | Close remaining security sign-off items from [the Netlify checklist](NETLIFY_PUBLIC_LAUNCH_CHECKLIST.md). | Owner plus separately authorized technical execution. | Hosted last-Admin safeguard has a reviewed resolution; leaked-password-protection warning has a documented remediation/plan decision. Do not bulk-push privacy/legal migrations to address one safeguard. |

**Codex can complete now:** code/document audit, exact instructions, inert origin-reservation files, artifact-integrity checks, local patches/tests after required decisions, and read-only checks. **Owner-only inputs/access:** true operator/contact/retention facts, legal approval, recovery destination and private credentials used locally, SMTP/sender authorization, final Netlify origin, Dashboard changes and publication. Do not send passwords, connection strings with passwords, tokens, private backups or SMTP credentials in chat.

## Destination boundary — unchanged

Fresh hosted SELECT at **17:33 UTC, 24 October**: **24 Published; 0 Draft; 0 Archived; 2 Admins** ([metadata evidence](validation/public-launch-hosted-baseline.json)). A [fresh anonymous catalog comparison](validation/public-launch-catalog-preservation.json) also confirms the same **8 eligible IDs / 16 excluded**. The completed production-browser evidence covers searches, maps, recommendations and every excluded direct detail URL in both languages. This review did not rerun that byte/rendering/browser suite or change its code/data. Existing evidence: [28 browser checks](validation/netlify-public-browser.json).

Keep that filter and those eight places. No archival occurred. All 24 Published records remain readable through the anonymous Data API; the filter is a website visibility policy, **not database confidentiality**. The owner must acknowledge that boundary. If the other 16 must be private at database/API level, a separate authorized archival/RLS execution is required; do not claim the present build achieves that.

## GO criteria

**GO only when every applicable checklist evidence cell is satisfied**, with no unresolved high-risk security or legal-operational blocker, plus:

- The actual Netlify HTTPS origin serves all direct routes and required headers; deployed assets return the correct MIME/content. No localhost canonical/email redirect is used for production requests.
- All 8 eligible destination galleries render; all 16 excluded detail URLs show unavailable content and never expose destination cards/gallery data; both languages work. Reconcile any inventory drift before launch.
- Both static legal pages contain the supplied operator/contact details and accurate functionality descriptions, with working links and no internal review banners. Managed mode and unverified deletion remain disabled.
- Real external-inbox confirmation, login/logout and same-profile recovery pass without touching either primary Admin's password or privileges. Ordinary users cannot access Admin.
- The recovery record names an actual usable backup and Storage copy, responsible restorer, verified target/procedure, allowable data loss (RPO) and recovery time (RTO). No invented retention/time targets.

Until then, a holding page is a safe public presence; it is **not** an unrestricted Unseen Jo launch. Technical artifacts and the owner decision log are separate from legal approval. [Supabase SMTP restrictions](https://supabase.com/docs/guides/auth/auth-smtp).
