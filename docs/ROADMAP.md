# Unseen Jo — current MVP roadmap

Updated 21 October 2026. This is the current scope/status reference; earlier phase reports and older README preview notes are historical.

| Phase | Status | Remaining acceptance / scope |
|---|---|---|
| 05 — Smart Surprise Me | Implemented; deterministic scoring and guest journey regression-tested | Six published destinations are the initial dataset; preserve disclosed unknowns. |
| 06 — Authentication and Profiles | Implemented; owner confirmed same-browser recovery callback and sign-in on 20 October | Fresh signup → email-confirmation → PKCE callback still needs separate genuine acceptance. Google remains unconfigured/disabled. Existing limitations remain in the Phase 06 report. |
| 07 — Personalized Discoveries | Implemented; additive hosted schema applied; automated and anonymous hosted checks documented | Genuine signed-in visit/history writes, refresh and second-device restoration require an available ordinary-user browser session. See the [Phase 07 report](PHASE07_PERSONALIZED_DISCOVERIES_REPORT.md). |
| 08 Lite | **Not started — awaiting approval** | No work authorized or begun. |

Phase 07 preserves the public guest experience, Phase 05 scoring, Phase 06 account infrastructure, separate Admin authentication, published tourism records and image evidence. Trip Planner, Weather, Reviews and advanced personalization are outside this MVP phase.

Before launch, finish the outstanding genuine account/email journeys, configure production Auth redirect origins and any approved OAuth provider, review remaining content/translation acceptance items from their own reports, and make an explicit hosting/security decision. No deployment, paid service activation or content approval is implied by implementation status.
