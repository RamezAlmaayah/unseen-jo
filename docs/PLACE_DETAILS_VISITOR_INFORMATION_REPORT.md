# Place Details visitor information — Phase 04L

Implemented 20 October 2026 for all six published destinations in Supabase project `dkhwwvoplhfjccvjegty`. Open [Ajloun Forest Reserve](http://127.0.0.1:4184/places/ajloun-forest) to review. No destination content, translations, publication states, images, licensing, Storage, permissions or Admin Dashboard behavior were changed. Phase 05 has not started.

## Result

The old six-column tiles hid their titles from sighted visitors, split values on slash characters and stretched every tile to accommodate the longest transport paragraph. Ajloun's desktop tiles measured **336px high**. The new icon-led cards measure **136–146px** in the same desktop check, with visible headings, one concise primary value and optional supporting text.

The reusable `VisitorInformation` / `VisitorInformationCard` components render:

- **Visit Duration / مدة الزيارة** — natural hour/minute formatting, explicitly labeled a planning estimate when numeric data is available. Ajloun's stored 120–240 minutes becomes **2–4 hours / ساعتان إلى أربع ساعات** without changing the numbers. One-sided bounds and mixed hour/minute values are supported.
- **Admission Fee / رسوم الدخول** — the saved numeric price label if available; otherwise **Unavailable / غير متاح**. Null prices never become free admission.
- **Opening Hours / ساعات الزيارة** — the saved value if available, or a concise essential unavailable state. Long saved hours guidance links to its complete notes.
- **Best Time to Visit / أفضل وقت للزيارة** — only where the saved field exists. Short values display directly. Narrative guidance links to the complete seasonal notes and is labeled as guidance, not a verified operating season.
- **Getting There / المواصلات** — only where saved transport information exists. Long narrative records use a short arrival-planning link rather than being automatically summarized into a claimed transport service or route.

Accessibility cards are omitted because the current public data has no structured verified accessibility field. No access guarantees are inferred from photographs, coordinates or transport prose. Irrelevant travel-time, group and region placeholders no longer fill this visitor grid.

The three essential duration/fee/hour cards remain when their values are unknown; optional cards are not created to fill rows. Current data produces five cards for Ajloun and Mujib, and four for the other destinations. All six have unknown numeric admission fees and opening hours. Dana and Mujib also lack a single reserve-wide numeric visit duration.

## Cautions, source context and layout

**Important Information Before Visiting / معلومات مهمة قبل الزيارة** appears directly below the cards. It preserves the complete saved seasonal, transport and visitor-information text, grouped under visible headings and segmented into readable sentence bullets. The browser tests compare those bullets with the original localized saved text, not an invented summary. Map-reference precision, stairs/step-free cautions, return transfers and weather-dependent access remain available.

Existing Arabic `visitor_guidance` contains a mixture of visitor qualifications, source-price examples and internal editorial instructions. It is retained verbatim in a separate, initially collapsed **Additional source context** disclosure within the existing story/source area. It is not promoted to a confirmed card fact or mixed into the primary card grid. No backend evidence or critical text was deleted. Destination descriptions and the existing translation-fallback warning are preserved.

Cards use neutral mint surfaces, subtle borders and shadows, forest-green icons, readable contrast and logical RTL alignment. Container queries produce up to three columns at wide content widths, two on medium widths and one on mobile. Minimum heights maintain balance; no fixed maximum height or text clipping is used. Long text can grow safely. Note links and disclosures remain keyboard accessible, with 44px link targets and the existing focus styles.

The gallery, original-image viewer, responsive image service, map, directions, temporary saves and navigation remain in the same Place Details architecture. The numeric adapter exposes existing duration bounds for display formatting; it adds no network query or database field.

## Verification

| Check | Result |
| --- | --- |
| Genuine hosted browser matrix | All six destinations × English/Arabic × 1440/820/390px production widths: **36 passed** |
| Page interactions and stress | Two language flows passed: keyboard note anchors, source disclosure, original viewer/Escape, temporary save, live MapLibre marker and DOM-only long text |
| Development browser spots | English and Arabic mobile: **2 passed** |
| Accessibility | **8 axe scans**, zero WCAG A/AA violations in tested pages; no browser page errors |
| Display/model integrity | **8 groups passed**: hour formatting, Arabic grammar, one-sided bounds, no mutation of original numeric values/labels, unknown vs zero prices, optional-card omission, full caution preservation and no reclassification of internal notes |
| Existing regressions | Tourism/data **15**, image delivery **6**, localization **6**, map/geography **9** groups passed |
| Localization audit | No missing static resource keys |
| Build | Oxlint, 83 asset references / 48 original hashes and production build passed; existing large-bundle advisory remains |
| Hosted preservation | Before/after relevant visitor fields match for all six published records; read-only queries only |

The full browser run contains **40 passing cases**. After the final Arabic dual-case grammar correction, a focused production check verifies Iraq Al-Amir's **ساعة واحدة إلى ساعتين** at all three widths. No hosted write or approval was used as a test. The existing tourism database regression uses a disposable local database.

Evidence: [browser checks](validation/visitor-information-browser.json), [baseline measurements](validation/visitor-information-before.json), [Arabic grammar check](validation/visitor-duration-arabic.json), [hosted preservation](validation/visitor-information-preservation.json).

## Screenshots

| View | Before | After |
| --- | --- | --- |
| English desktop | [Before](../artifacts/visitor-information/before-en-1440.png) | [After](../artifacts/visitor-information/after-ajloun-forest-en-1440.png) |
| Arabic desktop | [Before](../artifacts/visitor-information/before-ar-JO-1440.png) | [After](../artifacts/visitor-information/after-ajloun-forest-ar-JO-1440.png) |
| English tablet | [Before](../artifacts/visitor-information/before-en-820.png) | [After](../artifacts/visitor-information/after-ajloun-forest-en-820.png) |
| Arabic mobile | [Before](../artifacts/visitor-information/before-ar-JO-390.png) | [After](../artifacts/visitor-information/after-ajloun-forest-ar-JO-390.png) |

Additional Mujib screenshots demonstrate incomplete duration/price data and the existing Arabic review fallback. These remain honest unavailable/fallback states; this task does not approve translations or invent missing information.

## Changed files and limits

Implementation: `VisitorInformation.jsx`, `visitorInformation.js`, `PlaceDetailsPage.jsx`, the duration-bound projection in `features/tourism/model.js`, scoped `visitor-information.css` and its import, plus English/Arabic resources. Supporting changes include model/browser/baseline/grammar test scripts, validation artifacts and this report. React review confirmed a display-only projection and shared component with no extra fetching effects or subscriptions.

Long guidance is deliberately not converted into unsupported short factual claims. The full notes remain immediately below the cards, and legacy source qualifications remain expandable. Missing fees, opening hours and accessibility details still require actual verified content before they can become facts. The pre-existing stale Mujib Arabic source version remains unchanged.
