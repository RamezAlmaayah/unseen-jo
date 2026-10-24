# Legal operator details ? draft owner review

Historical change record: superseded for the current static pages by the owner's subsequent finalization instruction. The current pages have no draft/approval banner or legal-management prerequisite. See [STATIC_LEGAL_IMPLEMENTATION_NOTES.md](STATIC_LEGAL_IMPLEMENTATION_NOTES.md). The earlier before/after text below is retained only as history.

**DRAFT ? OWNER/LEGAL REVIEW REQUIRED.** Revision reviewed: 2026-10-24. Local drafts only; neither document has been approved or published by this task. No managed mode, migration, hosted data/settings change, email, account action or deployment occurred.

## Facts supplied by the owner

| Field | Exact fact |
| --- | --- |
| Platform | Unseen Jo |
| Legal operator | Ramez Ahmad Almaayeh |
| Capacity | Individual operator, not a registered company |
| Privacy/legal contact | ramezmayaa@gmail.com |

These are owner-confirmed facts, not independent legal certification or a mailbox-delivery test. The exact supplied Latin name is retained in Arabic and isolated LTR in the page; no official Arabic spelling, residence, establishment, registration, tax ID or address is invented. A contact email is not proof of monitoring, request completion, response deadlines or the Supabase SMTP provider.

## Changes applied locally

Privacy: scope/operator, rights/contact and updates/contact. Terms: opening/operator, account-security contact, privacy-tool availability cross-reference, applicable-law/dispute context and updates/contact. Unknown-name/contact statements were replaced, while missing address/operating arrangements and draft warnings remain. The deletion cross-reference now describes unavailable tools rather than suggesting a live deletion-request workflow. Emailing the contact address is described separately from transactional Auth emails.

Both languages have the same 12 Privacy / 14 Terms section IDs, order and synchronized paragraph counts. Privacy rights now has one additional corresponding paragraph in each language. The review date remains 24 October 2026; it is not an approval/effective-launch date. No acceptance history or approval timestamp was created. All four future seed review flags remain false.

Static pages render the owner name and mailto links using escaped React text and LTR isolation inside Arabic prose. The disabled Privacy & Account notice now points to the draft policy for contact details rather than saying no contact exists. It still has no operational download/deletion form or password collection. This is a factual consistency correction, not backend activation.

## Functionality review and limits

| Topic | Actual implementation/evidence | Draft treatment |
| --- | --- | --- |
| Authentication | Email/password forms, Supabase PKCE clients/callbacks; user/Admin sessions have separate persistent keys. Source: src/pages/AuthPage.jsx, src/features/account/client.js and callback.js, src/features/admin/client.js. | Keeps authentication/recovery/session disclosures; no new provider or password change. Actual hosted SMTP, notifications and genuine email delivery remain unverified. |
| Discoveries/preferences | Account repositories store saves, visits/optional dates, history and chosen preferences; guest state uses browser storage. | Maintains limited activity scope and guest-to-account synchronization; does not claim every page view is logged. |
| Location/maps | src/features/map/useLocation.js makes a user-initiated single geolocation read; maps load OpenFreeMap/OpenStreetMap resources and directions may open Google Maps. | Optional permission, approximate distances and provider network disclosures preserved; no continuous tracking or account GPS-retention claim. |
| Supabase/data | Existing Auth, database, private avatar access and authorization architecture unchanged. | Describes implemented access mechanisms without security guarantees or a new hosted RLS audit. No data touched. |
| Email processing | Supabase transaction-email settings are separate from the supplied contact mailbox. | Does not claim Gmail is configured as SMTP. Contact-message/address/content processing is disclosed without invented provider retention or monitoring promises. |
| Cookies/storage | Application code uses localStorage/sessionStorage for sessions, language, guest saves/preferences, Explore state and PKCE/cooldowns. | No zero-cookie, encryption, no-sharing or analytics-wide guarantee. Hosting/vendor logging and additional tooling need owner confirmation. |
| Export/deletion | src/features/account/privacyAvailability.js requires DEV + loopback + explicit QA flag; production renders unavailable notice. Existing local export/request implementation is not activated. | No download, automatic deletion, fulfilled request or complete backup erasure promised; supplied email does not activate these tools. |
| Signup/legal assent | Static source bypasses the future managed-legal availability check; no separate checkbox, versioned acceptance ledger or server-enforced terms rule. | Existing disclosure preserved. Legal/implementation decision remains open; this copy update does not fix or certify signup assent. |

## Unresolved owner/legal decisions

- Operator/service address and establishment/jurisdiction; any disclosures legally applicable to an individual operator. No assumption that individual operation exempts legal duties.
- Monitored contact mailbox, responsible/backup handler, access security, acknowledgment/escalation/complaints and incident procedures. Verify actual receipt separately.
- Secure identity verification, tracking, fulfillment and legally reviewed response periods for privacy rights; alternatives for passwordless/MFA/Admin accounts. Keep untested account deletion disabled. Publishing a contact does not establish compliant fulfillment.
- Purpose-specific lawful processing/prior-consent decisions, optional consent/withdrawal and any required records; contractual acceptance is not blanket privacy consent.
- Actual retention/deletion schedules and operational responsibility for accounts, profiles/old avatars, saves/visits/history/feedback, contact emails, request records, Admin audit, logs, backups and providers. No periods are supplied here.
- Actual hosting/origin, Supabase region/contracts/subprocessors, transactional-email provider/settings/notifications, map/provider processing locations, transfer safeguards and log/body/token handling. Planned Netlify use does not prove deployment.
- Child/guardian eligibility and implementation; applicable registration, DPO, complaint/security/breach obligations under Jordanian law and relevant current instruments. Require qualified legal assessment; no compliance certification.
- Final static terms version, assent/version evidence, direct-signup/backend enforcement and reacceptance/change-notice requirements. No historical acceptance is manufactured.
- Tourism factual/estimate labeling, image/brand/map rights, liability and governing-law/dispute wording, final bilingual legal review and explicit owner publication decision.

Reference for qualified review: [MoDEE personal-data-protection FAQs](https://modee.gov.jo/EN/Pages/FAQs). This task changes verified facts and identifies open decisions; it is not a completed legal opinion.

## Verification and preservation

- PASS: Oxlint, 6 existing legal model/security/localization groups, localization audit (no missing static translations).
- PASS: isolated production-mode build to artifacts/legal-owner-draft/dist, with static legal source and disabled privacy/prototype QA. Existing Vite chunk-size advisory remains.
- PASS: 24 legal browser groups in EN/AR at 1366/768/390/320 px, including paired sections, exact contact links, LTR identity isolation, unapproved notice, keyboard anchors, registration links, metadata, no overflow and zero detected axe WCAG A/AA violations.
- PASS: 4 EN/AR desktop/mobile production privacy-unavailable groups; no password or submission controls.
- PASS: all 305 original deployment dist file hashes unchanged. This deployment artifact intentionally still contains the earlier draft; do not claim the new wording was deployed.
- PASS: migration and guarded installation SQL hashes unchanged. Both still embed older unapproved version-1 text; future managed activation needs explicit seed reconciliation/review. The activation guide now flags this.
- A legacy database assertion compared immutable migration seeds with the newest editable static copy. It now compares the exact hash-pinned version-1 snapshot and still validates bilingual completeness, all false review flags and null approvals/revocations. Its syntax/snapshot checks passed; **the migration-running database suite was not executed**, in accordance with the instruction not to run migrations. Existing current-content draft workflow assertions remain intact.
- NOT RUN: hosted verification, real emails/inbox monitoring, account operations, migration/Edge Function activation, external legal approval or deployment.

Browser evidence: docs/validation/legal-browser.json and account-privacy-browser.json; both use isolated APIs/fixtures and the separate local draft preview. No real accounts or hosted records are changed.

## Files

Source: src/features/legal/content.js; src/features/legal/ui.js; src/pages/LegalPage.jsx; src/features/account/PrivacyAccount.jsx.

Checks: scripts/check-legal-browser.mjs; scripts/check-legal-management-database.mjs (dated-snapshot expectation only).

Review notes: this document; OWNER_FACTS_REQUIRED_FOR_LAUNCH.md; PRIVACY_POLICY_REVIEW.md; TERMS_OF_SERVICE_REVIEW.md; LEGAL_LAUNCH_CHECKLIST.md; LEGAL_PAGES_ACTIVATION_GUIDE.md. Historical missing-name/contact statements are superseded by their new addenda, without claiming other blockers resolved.

## Exact content changes

Below are the complete before/after paragraphs, not summaries. ?Added? means the paragraph did not exist before this task.

### Privacy Policy ? scope ? English ? paragraph 2

Before:

```text
Unseen Jo is the service name. A verified legal operator name, business address, and privacy contact have not yet been published for this version. The website owner still needs to confirm those details and the outstanding operating arrangements. Editorial publication approval does not itself certify legal compliance.
```

After:

```text
Unseen Jo is operated by Ramez Ahmad Almaayeh as an individual operator, not a registered company. The contact email for privacy and legal questions is ramezmayaa@gmail.com. An operator address has not been provided for this draft. Operating arrangements and legal review remain incomplete; identifying the operator does not certify legal compliance.
```

### Privacy Policy ? scope ? Arabic ? paragraph 2

Before:

```text
Unseen Jo هو اسم الخدمة. لم تُنشر لهذه النسخة بعد هوية قانونية معتمدة للمشغّل أو عنوان عمل أو وسيلة تواصل لشؤون الخصوصية. وما زال على مالك الموقع تأكيد هذه البيانات وترتيبات التشغيل غير المكتملة. ولا يُعدّ الاعتماد التحريري للنشر بحد ذاته شهادة بالامتثال القانوني.
```

After:

```text
يدير منصة Unseen Jo المشغّل الفردي Ramez Ahmad Almaayeh، وليس شركة مسجّلة. والبريد المخصّص لأسئلة الخصوصية والشؤون القانونية هو ramezmayaa@gmail.com. ولم يُقدَّم عنوان للمشغّل لهذه المسودة. وتظل ترتيبات التشغيل والمراجعة القانونية غير مكتملة؛ ولا يُعدّ تحديد هوية المشغّل شهادة بالامتثال القانوني.
```

### Privacy Policy ? rights ? English ? paragraph 2

Before:

```text
Privacy & Account shows the current availability notice; the prepared download and deletion-request tools are not active in production. Accounts without a password or using MFA would need a separately verified identity process that is not yet available here. Broader rights requests, a verified contact, monitored handling and legally reviewed timelines remain launch requirements. The Ministry of Digital Economy and Entrepreneurship publishes guidance and rights-request materials.
```

After:

```text
Privacy & Account shows the current availability notice; the prepared download and deletion-request tools are not active in production. Accounts without a password or using MFA would need a separately verified identity process that is not yet available here. Monitored request handling, secure identity verification, fulfillment arrangements and legally reviewed response periods remain unresolved. The Ministry of Digital Economy and Entrepreneurship publishes guidance and rights-request materials.
```

### Privacy Policy ? rights ? English ? paragraph 3

Before:

```text
[Added ? no previous paragraph]
```

After:

```text
You may raise a privacy question or request with Ramez Ahmad Almaayeh at ramezmayaa@gmail.com. Describe the request without sending passwords, session tokens, recovery links, identity documents or unnecessary sensitive information. Providing this contact address does not activate automated exports or account deletion, establish a response deadline, or confirm that a request has been received or fulfilled.
```

### Privacy Policy ? rights ? Arabic ? paragraph 2

Before:

```text
يعرض قسم الخصوصية والحساب إشعار الإتاحة الحالي؛ وأدوات التنزيل وطلب الحذف المُعدّة غير مفعّلة في نسخة الإنتاج. وتحتاج الحسابات دون كلمة مرور أو المزودة بمصادقة متعددة العوامل إلى إجراء مستقل للتحقق من الهوية لم يتوفر هنا بعد. وتبقى الطلبات الأوسع وقناة التواصل المعتمدة والمتابعة ومهل الاستجابة المراجعة قانونيًا من متطلبات الإطلاق. وتنشر وزارة الاقتصاد الرقمي والريادة إرشادات ومواد لطلبات الحقوق.
```

After:

```text
يعرض قسم الخصوصية والحساب إشعار الإتاحة الحالي؛ وأدوات التنزيل وطلب الحذف المُعدّة غير مفعّلة في نسخة الإنتاج. وتحتاج الحسابات دون كلمة مرور أو المزودة بمصادقة متعددة العوامل إلى إجراء مستقل للتحقق من الهوية لم يتوفر هنا بعد. وما زالت متابعة الطلبات والتحقق الآمن من الهوية وترتيبات تنفيذها ومهل الاستجابة المراجعة قانونيًا غير محسومة. وتنشر وزارة الاقتصاد الرقمي والريادة إرشادات ومواد لطلبات الحقوق.
```

### Privacy Policy ? rights ? Arabic ? paragraph 3

Before:

```text
[Added ? no previous paragraph]
```

After:

```text
يمكنك توجيه سؤال أو طلب متعلق بالخصوصية إلى Ramez Ahmad Almaayeh على ramezmayaa@gmail.com. وضّح طلبك دون إرسال كلمات مرور أو رموز جلسات أو روابط استعادة أو وثائق هوية أو معلومات حساسة غير لازمة. ولا يفعّل إدراج عنوان التواصل هذا تصدير البيانات أو حذف الحساب تلقائيًا، ولا يحدد مهلة استجابة، ولا يؤكد استلام الطلب أو تنفيذه.
```

### Privacy Policy ? updates ? English ? paragraph 2

Before:

```text
No verified Unseen Jo legal or privacy contact is currently published in this version. Do not send sensitive information to an assumed email address or to an unrelated third party. Verified operator and contact details must be added before public launch.
```

After:

```text
For privacy or legal questions about Unseen Jo, contact the individual operator, Ramez Ahmad Almaayeh, at ramezmayaa@gmail.com. If you email this address, your message, email address and any information you choose to include pass through your email service and the operator’s mailbox provider. This contact address does not identify or configure the application’s transactional-email provider. The operator address, request-handling arrangements and other outstanding legal decisions still require review before public launch.
```

### Privacy Policy ? updates ? Arabic ? paragraph 2

Before:

```text
لم تُنشر في هذه النسخة وسيلة تواصل معتمدة مع Unseen Jo للشؤون القانونية أو الخصوصية. لا ترسل معلومات حساسة إلى عنوان بريد مفترض أو طرف غير معني. ويلزم إضافة بيانات المشغّل والتواصل المعتمدة قبل الإطلاق العام.
```

After:

```text
للأسئلة المتعلقة بخصوصية Unseen Jo أو شؤونه القانونية، تواصل مع المشغّل الفردي Ramez Ahmad Almaayeh على ramezmayaa@gmail.com. وعند مراسلة هذا العنوان، تمرّ رسالتك وعنوان بريدك وأي معلومات تختار تضمينها عبر خدمة بريدك ومزوّد صندوق بريد المشغّل. ولا يحدد عنوان التواصل هذا مزوّد رسائل الحساب في التطبيق ولا يضبط إعداداته. وما زال عنوان المشغّل وترتيبات التعامل مع الطلبات والقرارات القانونية الأخرى غير المحسومة بحاجة إلى مراجعة قبل الإطلاق العام.
```

### Terms of Service ? acceptance ? English ? paragraph 2

Before:

```text
These are review drafts, not a representation that launch requirements are complete. Unseen Jo is the service name; a verified legal operator identity, business address, and legal contact have not yet been published. Those details and the effective launch terms must be confirmed before public launch.
```

After:

```text
Unseen Jo is operated by Ramez Ahmad Almaayeh as an individual operator, not a registered company. Contact the operator about these terms at ramezmayaa@gmail.com. These terms remain an unapproved review draft, not a statement that launch requirements are complete. An operator address has not been provided, and the final operating arrangements and launch terms still require owner and legal review.
```

### Terms of Service ? acceptance ? Arabic ? paragraph 2

Before:

```text
هذه مسودات للمراجعة، ولا تعني استكمال متطلبات الإطلاق. Unseen Jo هو اسم الخدمة، ولم تُنشر بعد هوية قانونية معتمدة للمشغّل أو عنوان عمل أو وسيلة تواصل قانونية. ويلزم تأكيدها واعتماد شروط الإطلاق النافذة قبل الإطلاق العام.
```

After:

```text
يدير منصة Unseen Jo المشغّل الفردي Ramez Ahmad Almaayeh، وليس شركة مسجّلة. ويمكن التواصل معه بشأن هذه الشروط على ramezmayaa@gmail.com. وتبقى هذه الشروط مسودة غير معتمدة للمراجعة، ولا تعني استكمال متطلبات الإطلاق. ولم يُقدَّم عنوان للمشغّل، وما زالت ترتيبات التشغيل النهائية وشروط الإطلاق تتطلب مراجعة المالك والمراجعة القانونية.
```

### Terms of Service ? security ? English ? paragraph 2

Before:

```text
If you suspect unauthorized use, use the supported password-recovery and sign-out controls and secure your email account. A verified support contact remains to be published; do not send passwords or authentication tokens to an assumed contact. You are not automatically responsible for activity beyond your control where applicable law provides otherwise.
```

After:

```text
If you suspect unauthorized use, use the supported password-recovery and sign-out controls and secure your email account. You may contact Ramez Ahmad Almaayeh at ramezmayaa@gmail.com about account concerns, but do not send passwords, authentication tokens or recovery links. This email contact does not reset your password or guarantee a response time. You are not automatically responsible for activity beyond your control where applicable law provides otherwise.
```

### Terms of Service ? security ? Arabic ? paragraph 2

Before:

```text
إذا اشتبهت في استخدام غير مصرّح به، فاستخدم أدوات استعادة كلمة المرور وتسجيل الخروج المدعومة وأمّن بريدك الإلكتروني. ولم تُنشر بعد وسيلة دعم معتمدة؛ فلا ترسل كلمات المرور أو رموز المصادقة إلى جهة مفترضة. ولا تتحمل تلقائيًا مسؤولية نشاط خارج سيطرتك حيث يقرر القانون خلاف ذلك.
```

After:

```text
إذا اشتبهت في استخدام غير مصرّح به، فاستخدم أدوات استعادة كلمة المرور وتسجيل الخروج المدعومة وأمّن بريدك الإلكتروني. ويمكنك التواصل مع Ramez Ahmad Almaayeh على ramezmayaa@gmail.com بشأن مشكلات الحساب، دون إرسال كلمات مرور أو رموز مصادقة أو روابط استعادة. ولا يعيد هذا البريد تعيين كلمة مرورك ولا يضمن مهلة استجابة. ولا تتحمل تلقائيًا مسؤولية نشاط خارج سيطرتك حيث يقرر القانون خلاف ذلك.
```

### Terms of Service ? availability ? English ? paragraph 2

Before:

```text
Access may be restricted where reasonably necessary to address unlawful use, security risks, or material breaches, subject to applicable law and fair process where required. No automated suspension or appeal workflow is represented as implemented. You may stop using the service and sign out; these actions do not erase your account. The Privacy Policy explains the supported deletion-request process and remaining contact and operational limitations.
```

After:

```text
Access may be restricted where reasonably necessary to address unlawful use, security risks, or material breaches, subject to applicable law and fair process where required. No automated suspension or appeal workflow is represented as implemented. You may stop using the service and sign out; these actions do not erase your account. The Privacy Policy describes the current availability of privacy tools, the contact email and the remaining request-handling and operational limitations.
```

### Terms of Service ? availability ? Arabic ? paragraph 2

Before:

```text
قد يُقيّد الوصول بالقدر المعقول اللازم لمواجهة الاستخدام غير المشروع أو مخاطر الأمان أو المخالفات الجوهرية، مع مراعاة القانون والإجراءات المنصفة حيث تكون مطلوبة. ولا ندّعي تنفيذ إجراءات مؤتمتة للإيقاف أو التظلّم. ويمكنك التوقف عن الاستخدام وتسجيل الخروج، لكن ذلك لا يمحو الحساب. وتوضّح سياسة الخصوصية إجراءات طلب الحذف المدعومة وحدود التواصل والتشغيل المتبقية.
```

After:

```text
قد يُقيّد الوصول بالقدر المعقول اللازم لمواجهة الاستخدام غير المشروع أو مخاطر الأمان أو المخالفات الجوهرية، مع مراعاة القانون والإجراءات المنصفة حيث تكون مطلوبة. ولا ندّعي تنفيذ إجراءات مؤتمتة للإيقاف أو التظلّم. ويمكنك التوقف عن الاستخدام وتسجيل الخروج، لكن ذلك لا يمحو الحساب. وتوضّح سياسة الخصوصية مدى إتاحة أدوات الخصوصية حاليًا وبريد التواصل وحدود التعامل مع الطلبات والتشغيل المتبقية.
```

### Terms of Service ? law ? English ? paragraph 1

Before:

```text
Applicable mandatory law governs the service and any dispute. Relevant Jordanian law, including personal data protection requirements where applicable, must be considered for use in Jordan. The operator’s unconfirmed legal identity and establishment prevent this draft from specifying a verified contractual choice of law or exclusive court.
```

After:

```text
Applicable mandatory law governs the service and any dispute. Relevant Jordanian law, including personal data protection requirements where applicable, must be considered for use in Jordan. The operator is identified above, but the operator address and establishment details have not been provided. This draft does not specify a finalized contractual choice of law or exclusive court.
```

### Terms of Service ? law ? English ? paragraph 2

Before:

```text
No mandatory arbitration, exclusive foreign venue, or waiver of access to a competent court is imposed. Any final governing-law and dispute provision must preserve non-waivable rights and be reviewed before public launch. A verified channel for raising issues with the operator remains to be published.
```

After:

```text
No mandatory arbitration, exclusive foreign venue, or waiver of access to a competent court is imposed. Any final governing-law and dispute provision must preserve non-waivable rights and be reviewed before public launch. Questions may be raised with Ramez Ahmad Almaayeh at ramezmayaa@gmail.com; a formal complaints or dispute-handling procedure has not been confirmed.
```

### Terms of Service ? law ? Arabic ? paragraph 1

Before:

```text
تحكم القواعد القانونية الآمرة الواجبة التطبيق الخدمة وأي نزاع يتعلق بها. ويجب مراعاة القانون الأردني ذي الصلة عند الاستخدام في الأردن، بما يشمل متطلبات حماية البيانات حيثما انطبقت. ولعدم تأكيد هوية المشغّل القانونية ومقرّه، لا تحدد هذه المسودة اختيارًا تعاقديًا متحققًا للقانون أو محكمة حصرية.
```

After:

```text
تحكم القواعد القانونية الآمرة الواجبة التطبيق الخدمة وأي نزاع يتعلق بها. ويجب مراعاة القانون الأردني ذي الصلة عند الاستخدام في الأردن، بما يشمل متطلبات حماية البيانات حيثما انطبقت. وقد ورد اسم المشغّل أعلاه، لكن عنوانه وتفاصيل مقرّ نشاطه لم تُقدَّم. ولا تحدد هذه المسودة اختيارًا تعاقديًا نهائيًا للقانون أو محكمة حصرية.
```

### Terms of Service ? law ? Arabic ? paragraph 2

Before:

```text
لا تفرض هذه الشروط تحكيمًا إلزاميًا أو جهة تقاضٍ أجنبية حصرية أو تنازلًا عن اللجوء إلى المحكمة المختصة. ويجب أن يحفظ أي نص نهائي للقانون وتسوية المنازعات الحقوق غير القابلة للتنازل وأن يخضع للمراجعة قبل الإطلاق العام. ولم تُنشر بعد قناة معتمدة لطرح المسائل على المشغّل.
```

After:

```text
لا تفرض هذه الشروط تحكيمًا إلزاميًا أو جهة تقاضٍ أجنبية حصرية أو تنازلًا عن اللجوء إلى المحكمة المختصة. ويجب أن يحفظ أي نص نهائي للقانون وتسوية المنازعات الحقوق غير القابلة للتنازل وأن يخضع للمراجعة قبل الإطلاق العام. ويمكن طرح الأسئلة على Ramez Ahmad Almaayeh عبر ramezmayaa@gmail.com؛ ولم تُؤكَّد إجراءات رسمية لمعالجة الشكاوى أو المنازعات.
```

### Terms of Service ? updates ? English ? paragraph 2

Before:

```text
No verified legal contact for Unseen Jo is published in this version. Operator identity, a usable contact channel, and final legal approval are outstanding launch requirements. Do not send sensitive information to an assumed address. Both language versions are intended to communicate the same meaning; neither removes rights protected by applicable law.
```

After:

```text
For questions about these terms, contact Ramez Ahmad Almaayeh, the individual operator of Unseen Jo, at ramezmayaa@gmail.com. Do not send passwords, session tokens, recovery links or unnecessary sensitive information. The operator address, request and complaint-handling arrangements, and final legal review remain unresolved. Both language versions are intended to communicate the same meaning; neither removes rights protected by applicable law.
```

### Terms of Service ? updates ? Arabic ? paragraph 2

Before:

```text
لم تُنشر في هذه النسخة وسيلة تواصل قانونية معتمدة مع Unseen Jo. وتظل هوية المشغّل وقناة التواصل القابلة للاستخدام والاعتماد القانوني النهائي من متطلبات الإطلاق غير المكتملة. ولا ترسل معلومات حساسة إلى عنوان مفترض. ويُقصد بالنسختين اللغويتين نقل المعنى نفسه، ولا تنتقص أي منهما من الحقوق التي يحميها القانون الواجب التطبيق.
```

After:

```text
للأسئلة المتعلقة بهذه الشروط، تواصل مع Ramez Ahmad Almaayeh، المشغّل الفردي لمنصة Unseen Jo، على ramezmayaa@gmail.com. ولا ترسل كلمات مرور أو رموز جلسات أو روابط استعادة أو معلومات حساسة غير لازمة. وما زال عنوان المشغّل وترتيبات التعامل مع الطلبات والشكاوى والمراجعة القانونية النهائية غير محسومة. ويُقصد بالنسختين اللغويتين نقل المعنى نفسه، ولا تنتقص أي منهما من الحقوق التي يحميها القانون الواجب التطبيق.
```

## Exact shared-label changes

### en ? draft

Before:

```text
Draft for review
```

After:

```text
Draft — owner/legal review required
```

### en ? notice

Before:

```text
These drafts describe the current application. The operator’s legal identity, verified contact details, and request-handling arrangements still require confirmation before public launch.
```

After:

```text
The owner has provided the individual operator’s name and contact email. These documents remain unapproved drafts. The operator address, request-handling arrangements, retention decisions and legal review remain incomplete.
```

### ar ? draft

Before:

```text
مسودة للمراجعة
```

After:

```text
مسودة — تتطلب مراجعة المالك والمراجعة القانونية
```

### ar ? notice

Before:

```text
تصف هاتان المسودتان التطبيق بصورته الحالية. ويلزم تأكيد الهوية القانونية للمشغّل وبيانات التواصل المعتمدة وآلية التعامل مع الطلبات قبل الإطلاق العام.
```

After:

```text
قدّم المالك اسم المشغّل الفردي وبريد التواصل. وتبقى هاتان الوثيقتان مسودتين غير معتمدتين. وما زال عنوان المشغّل وترتيبات التعامل مع الطلبات وقرارات الاحتفاظ بالبيانات والمراجعة القانونية غير مكتملة.
```

The privacy-panel sentence previously said no verified contact was published. It now states, in English: ?The draft Privacy Policy provides the operator?s contact email and explains the current limits. It remains subject to owner and legal review.? Arabic: ?????? ????? ????? ???????? ???? ??????? ?? ??????? ?????? ?????? ???????. ??? ???? ???? ??????? ?????? ????????? ?????????.? The surrounding unavailable-controls notice is unchanged.

**Final status: DRAFT ? OWNER/LEGAL REVIEW REQUIRED.**
