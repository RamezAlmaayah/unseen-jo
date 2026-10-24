# Authentication card sizing refinement

Date: 20 October 2026. Scope: visual sizing only; Phase 07 has not started.

The shared authentication interface now uses a 960px desktop maximum width, tighter spacing, 46px inputs and primary actions, and matching rounded cards. Login, registration, forgot password, reset password, confirmation, and callback/error states retain the existing branding and behavior.

## Cause and changes

The former shell and form both reserved 720px on desktop, increasing to 730px at intermediate widths and 850px for the mobile form alone. Recovery and confirmation inherited these dimensions even with only one field. Page padding added 112px vertically on desktop. These minimums pushed navigation and actions below laptop viewports.

- Desktop Login/Register share a 612px form minimum (614px outer card including borders), preserving a stable container during the existing slide.
- Recovery/confirmation use a 440px minimum; reset uses 500px. Smaller screens use content-sized recovery/reset/confirmation forms.
- Page padding is now 20px vertically on desktop, 16px at intermediate widths. Centering remains; at 1280×720 the card starts 23px below the Navbar instead of 48px.
- Below 48rem, the page minimum accounts for the existing 104px two-row Navbar, avoiding an extra 44px of page scrolling when a short recovery card already fits.
- Intermediate and mobile Login/Register retain sufficient shared minimum height for wrapped English and Arabic text. They no longer reserve the original 850px mobile form height. The mobile branded header is 88px instead of 108px.
- Headings, field gaps, descriptions and supporting notes have tighter spacing. Body text remains 15px and inputs remain 46px. Validation and feedback can expand the form naturally; no maximum height or internal scrolling clips them.
- Callback cards use the same white surface, 24px corners, subtle border/shadow, heading hierarchy and 46px primary action, with a shorter 24px desktop outer margin.

The only JSX change is `data-auth-mode={mode}` for CSS sizing. Motion transforms, durations, easing, reduced-motion handling, form state, routing, PKCE, callback handling, sessions and Supabase operations are unchanged. Callback/client/session-provider file hashes were compared with pre-change copies and matched. No hosted account operations, database changes, destination edits or publication changes were performed.

## Measured before and after

Real Chromium layout measurements at identical viewport sizes; desktop figures below are English and also matched the Arabic outer shell sizes.

| Viewport / screen | Previous outer card | Updated outer card | Result |
| --- | --- | --- | --- |
| 1366×768 Login/Register | 1060×722px; bottom 830px | 960×614px; bottom 721px | About 15% shorter; all controls visible |
| 1280×720 Login/Register | 1060×722px; bottom 830px | 960×614px; bottom 697px | All controls visible; no card scrolling needed |
| Desktop Forgot Password / Confirmation | 722px tall | 442px tall | About 39% shorter |
| Desktop Reset Password | 722px tall | 502px tall | About 30% shorter |
| 390×844 Login/Register | 960px tall | 820px tall | About 15% shorter; shared stable shell |
| 390×844 Forgot Password / Confirmation | 960px tall | About 523px tall | Content-sized form |
| 390×844 Reset Password | 960px tall | About 645px tall | Fields, action and links fit this viewport |

These are sizing measurements, not claims of faster network or authentication performance. Long registration forms still require ordinary vertical scrolling on short mobile screens. Additional validation messages, text zoom or a virtual keyboard may also require scrolling; content remains accessible.

## Verification

- Baseline: 72 captured layouts, covering nine states in English and Arabic at 1366×768, 1280×720, 390×844 and 320×740.
- Updated development and production-preview checks: the same nine states, both languages and four resolutions. Checks cover input heights, control containment, no horizontal overflow, laptop action/link visibility, RTL/LTR, WCAG A/AA scans, preserved input values and same-document Login → Register → Back → Forgot Password navigation. The 320px cases use reduced motion.
- After correcting the mobile Navbar allowance, the affected 36 mobile cases were checked again in each mode, including a document-height assertion for cards that fit without scrolling.
- Nine states: login, registration, forgot password, valid-reset visual fixture, confirmation, invalid reset, callback without link details, expired callback, and missing-PKCE callback.
- Existing authentication browser regression: 11 groups passed, including eight responsive language/width combinations, stable Login/Register shell dimensions, keyboard/reduced-motion behavior, callback variants, recovery, network errors and account workflows.
- Existing account unit/database regression: all nine groups passed against local database fixtures.
- Oxlint and production build passed. Existing large shared/MapLibre bundle advisories remain unrelated to this sizing change.

Browser checks use the actual application, React Router and Motion in Chromium with simulated Auth/REST responses. The valid-reset visual case supplies router recovery state only to render its fields and never submits a password. These checks are not new genuine signup, recovery or email acceptance claims. Hosted authentication/security configuration was not changed.

Commands: `node scripts/check-auth-sizing.mjs` (development port 4184); the same command with `QA_BASE_URL=http://127.0.0.1:4190` for production preview; `npm run test:accounts:browser`; `npm run test:accounts`; `npm run lint`; `npm run build`.

Evidence: [baseline measurements](validation/auth-sizing-before-4184.json), [development measurements](validation/auth-sizing-after-4184.json), [production measurements](validation/auth-sizing-after-4190.json), [final mobile development checks](validation/auth-sizing-mobile-final-4184.json), [final mobile production checks](validation/auth-sizing-mobile-final-4190.json), [auth browser regressions](validation/phase06-browser-4184.json).

## Screenshot comparisons

| Screen | Before | After (production preview) |
| --- | --- | --- |
| English desktop registration | [Before](../artifacts/auth-sizing/before-4184/en-1366-register.png) | [After](../artifacts/auth-sizing/after-4190/en-1366-register.png) |
| Arabic desktop registration | [Before](../artifacts/auth-sizing/before-4184/ar-JO-1366-register.png) | [After](../artifacts/auth-sizing/after-4190/ar-JO-1366-register.png) |
| 1280px login | [Before](../artifacts/auth-sizing/before-4184/en-1280-login.png) | [After](../artifacts/auth-sizing/after-4190/en-1280-login.png) |
| Forgot password | [Before](../artifacts/auth-sizing/before-4184/en-1366-recovery.png) | [After](../artifacts/auth-sizing/after-4190/en-1366-recovery.png) |
| Mobile reset password | [Before](../artifacts/auth-sizing/before-4184/en-390-reset.png) | [After](../artifacts/auth-sizing/mobile-final-4190/en-390-reset.png) |
| Arabic 320px recovery | [Before](../artifacts/auth-sizing/before-4184/ar-JO-320-recovery.png) | [After](../artifacts/auth-sizing/mobile-final-4190/ar-JO-320-recovery.png) |
| Callback fallback | [Before](../artifacts/auth-sizing/before-4184/en-1280-callback-pkce.png) | [After](../artifacts/auth-sizing/after-4190/en-1280-callback-pkce.png) |

Modified application files: `src/styles/user-accounts.css`, `src/pages/AuthPage.jsx`. Added validation: `scripts/check-auth-sizing.mjs`, this report, measurements and screenshots.
