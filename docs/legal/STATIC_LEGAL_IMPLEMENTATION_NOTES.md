# Static legal pages — developer notes

24 October 2026. The visitor-facing Privacy Policy and Terms of Service are ordinary bilingual informational pages. They require no managed-legal activation or approval workflow. Earlier draft-review reports are historical and do not define the current page presentation.

- Preserve the existing production guard: self-service personal-data export and account deletion remain disabled. The pages state this plainly without exposing development/testing details.
- The contact email is owner-provided. Actual inbox monitoring, identity verification and handling of data requests remain operational responsibilities; no response time or automated fulfillment is promised.
- Retention schedules, actual hosting/email-provider settings, processing locations and provider logging have not been established by this copy change. No invented periods or named SMTP provider appear in the pages.
- Registration links remain available. There is no historical terms-acceptance ledger or server-enforced version-acceptance rule; no such record or enforcement is claimed. Terms agreement is not blanket optional-processing consent.
- The supplied operator name is retained exactly in Latin text within Arabic content. No address, company registration, tax ID or legal certification is asserted.
- Managed-legal code and historical installation SQL are untouched and inactive. Do not run unrelated migrations for these static pages. Existing authentication, Admin authorization and privacy controls are unchanged.

These notes record implementation limits, not a visitor banner or a new release-approval process.
