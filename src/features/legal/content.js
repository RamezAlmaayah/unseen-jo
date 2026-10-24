// Static informational legal pages. No approval or legal-certification state.
export const LEGAL_REVISION="2026-10-24"
export const LEGAL_OPERATOR=Object.freeze({"name":"Ramez Ahmad Almaayeh","email":"ramezmayaa@gmail.com"})
const section=(id,enTitle,arTitle,en,ar)=>({id,en:{title:enTitle,paragraphs:en},ar:{title:arTitle,paragraphs:ar}})
export const privacySections=[
 section("scope","1. Scope and operator","١. النطاق والجهة المشغّلة",
[
  "This Privacy Policy explains how Unseen Jo handles information when you explore destinations, use recommendations or manage an account. It covers this website and its account features. Independent websites linked from Unseen Jo have their own privacy practices.",
  "Unseen Jo is operated by Ramez Ahmad Almaayeh as an individual operator. For privacy questions, contact ramezmayaa@gmail.com."
],
[
  "توضّح سياسة الخصوصية هذه كيفية تعامل Unseen Jo مع المعلومات عند استكشاف الوجهات أو استخدام الاقتراحات أو إدارة الحساب. وتشمل هذا الموقع وخصائص الحساب، أما المواقع المستقلة المرتبطة به فلها ممارسات خصوصية خاصة بها.",
  "يدير منصة Unseen Jo المشغّل الفردي Ramez Ahmad Almaayeh. وللاستفسارات المتعلقة بالخصوصية، تواصل عبر ramezmayaa@gmail.com."
]
),
 section("account-data","2. Registration, profiles, and authentication","٢. التسجيل والملف الشخصي والمصادقة",
[
  "Registration asks for your full name, email address and password. Supabase Auth handles authentication. Account records include an account identifier and authentication-related information. Your name and preferred language initialize your profile; you can edit supported profile details and optionally upload a profile image.",
  "Profile images are stored with Supabase and accessed through time-limited signed links. Do not upload identity documents or sensitive images.",
  "Sign-in, email confirmation, password recovery and email changes use Supabase Auth. Account emails pass your email address and the relevant message through the email-delivery service. Password recovery may require the same browser profile and website address where you requested the link."
],
[
  "يطلب التسجيل الاسم الكامل والبريد الإلكتروني وكلمة المرور. وتتولى Supabase Auth المصادقة. وتشمل سجلات الحساب معرّفًا للحساب ومعلومات مرتبطة بالمصادقة. ويُستخدم اسمك ولغتك المفضّلة لإنشاء الملف الشخصي، ويمكنك تعديل البيانات التي يتيحها الموقع وإضافة صورة شخصية اختياريًا.",
  "تُخزّن الصور الشخصية لدى Supabase، ويُتاح الوصول إليها بروابط موقّعة محدودة الصلاحية. يُرجى عدم رفع وثائق الهوية أو الصور الحساسة.",
  "تستخدم عمليات تسجيل الدخول وتأكيد البريد واستعادة كلمة المرور وتغيير البريد خدمة Supabase Auth. وتمرّ رسائل الحساب بعنوان بريدك ومحتوى الرسالة ذات الصلة عبر خدمة إرسال البريد. وقد تتطلب استعادة كلمة المرور ملف المتصفح وعنوان الموقع نفسيهما اللذين طلبت منهما الرابط."
]
),
 section("discoveries","3. Saved places, preferences, and activity","٣. الأماكن المحفوظة والتفضيلات والنشاط",
[
  "Signed-in account features store saved destination identifiers, travel preferences and interests, self-reported visited places with an optional visit date, and recommendation history containing destination identifiers and event times. These records support My Discoveries and personalized suggestions. A visit mark is not proof of your physical presence.",
  "Guest saves remain in browser storage. When you sign in, eligible guest saves may be merged into your account, and you may be offered the option to save guest preferences. Recommendation history records suggestions shown through the discovery flow; it is not a log of every page you view.",
  "Suggestions are calculated by application rules using inputs such as interests, budget, available time, transportation, travel group and starting city."
],
[
  "تخزّن خصائص الحساب معرّفات الوجهات المحفوظة وتفضيلات السفر والاهتمامات والأماكن التي تذكر أنك زرتها مع تاريخ زيارة اختياري، وسجلًا للاقتراحات يضم معرّفات الوجهات وأوقات الأحداث. وتدعم هذه السجلات «اكتشافاتي» والاقتراحات الشخصية. ولا يُعدّ تسجيل الزيارة إثباتًا على وجودك الفعلي في المكان.",
  "تبقى محفوظات الزائر في تخزين المتصفح. وعند تسجيل الدخول، قد تُدمج الأماكن المؤهلة في حسابك، وقد يُعرض عليك حفظ تفضيلات الزائر أيضًا. ويسجّل سجل الاقتراحات ما يُعرض من خلال مسار الاكتشاف، ولا يسجّل كل صفحة تطّلع عليها.",
  "تُحسب الاقتراحات بقواعد داخل التطبيق اعتمادًا على مدخلات مثل الاهتمامات والميزانية والوقت المتاح ووسيلة النقل ومجموعة السفر ومدينة الانطلاق."
]
),
 section("location","4. Maps and optional location","٤. الخرائط والموقع الاختياري",
[
  "The Near You feature requests a single browser geolocation reading only when you choose that action and your browser permits it. Coordinates and reported accuracy are used in the current page to calculate approximate straight-line distances. This feature does not continuously track you or save that reading to your account database.",
  "You may choose a city instead or decline location access. MapLibre displays map resources from OpenFreeMap, based on OpenStreetMap data. Loading map tiles, fonts, and related resources sends normal network information, such as your IP address and the requested map area, to their providers. Your browser or device location service has its own practices.",
  "Opening a Google Maps directions link takes you to Google’s service with the destination coordinates. Any location you then provide to that service is governed by its own settings and policy."
],
[
  "تطلب خاصية «بالقرب منك» قراءة واحدة للموقع من المتصفح عندما تختار استخدامها ويسمح المتصفح بذلك. وتُستخدم الإحداثيات والدقة المُبلّغ عنها في الصفحة الحالية لحساب مسافات تقريبية بخط مستقيم. ولا تتتبّع هذه الخاصية تحرّكاتك باستمرار ولا تحفظ هذه القراءة في قاعدة بيانات حسابك.",
  "يمكنك اختيار مدينة بدلًا من ذلك أو رفض إذن الموقع. وتعرض مكتبة MapLibre موارد خرائط من OpenFreeMap تستند إلى بيانات OpenStreetMap. ويؤدي تحميل مربعات الخريطة والخطوط والموارد المرتبطة إلى إرسال معلومات الشبكة المعتادة، مثل عنوان الإنترنت والمنطقة المطلوبة من الخريطة، إلى مزوّديها. كما تخضع خدمة تحديد الموقع في متصفحك أو جهازك لممارساتها الخاصة.",
  "ينقلك رابط الاتجاهات في Google Maps إلى خدمة Google مع إحداثيات الوجهة. وأي موقع تقدّمه بعد ذلك لتلك الخدمة يخضع لإعداداتها وسياستها."
]
),
 section("purposes","5. Purposes and lawful processing","٥. الأغراض ومشروعية المعالجة",
[
  "The website uses account information to authenticate you, maintain your profile, synchronize your chosen records, personalize suggestions and send account-related messages. Technical requests also support content delivery and access control. Authorized administrators manage tourism content and related administrative audit records.",
  "Reading this policy or creating an account does not amount to consent to unrelated optional processing. Privacy rights and any applicable requirements for consent or another permitted basis for processing remain subject to applicable law.",
  "The application does not include advertising pixels or a third-party audience analytics integration. Hosting, email and other service providers may process technical requests and maintain their own operational logs."
],
[
  "يستخدم الموقع معلومات الحساب للمصادقة وإدارة الملف الشخصي ومزامنة السجلات التي تختارها وتخصيص الاقتراحات وإرسال رسائل الحساب. وتدعم الطلبات التقنية أيضًا عرض المحتوى وضبط الوصول. ويدير المسؤولون المخوّلون المحتوى السياحي وسجلات التدقيق الإدارية المرتبطة به.",
  "لا يُعدّ الاطلاع على هذه السياسة أو إنشاء حساب موافقة على معالجة اختيارية غير مرتبطة بالخدمة. وتخضع حقوق الخصوصية وأي متطلبات للموافقة أو لأساس آخر مسموح به للمعالجة للقانون الواجب التطبيق.",
  "لا يتضمن التطبيق بكسلات إعلانية أو تكاملًا خارجيًا لتحليلات الجمهور. وقد يعالج مزوّدو الاستضافة والبريد والخدمات الأخرى الطلبات التقنية ويحتفظون بسجلاتهم التشغيلية."
]
),
 section("storage","6. Cookies and browser storage","٦. ملفات الارتباط وتخزين المتصفح",
[
  "The application uses localStorage and sessionStorage for website functions. Persistent storage holds your selected language, guest saved places and Supabase sessions. User and administrator sessions use separate storage entries and refresh automatically; closing a tab does not necessarily sign you out.",
  "Session storage holds guest preferences, Explore state such as search filters and map view, and email-resend cooldowns. The authentication library also stores temporary verification information needed to complete confirmation and recovery flows.",
  "Use Sign out on shared devices. You can clear this website's browser storage through browser settings, but this may remove guest saves and preferences or interrupt a pending confirmation or recovery flow. Clearing browser storage does not delete server-side account records. External services may use their own cookies or storage under their policies."
],
[
  "يستخدم التطبيق localStorage وsessionStorage لتشغيل خصائص الموقع. ويحتفظ التخزين الدائم باللغة المختارة والأماكن المحفوظة للزائر وجلسات Supabase. وتُحفظ جلسات المستخدم والمسؤول في مفاتيح منفصلة وتتجدّد تلقائيًا؛ لذا لا يعني إغلاق علامة التبويب بالضرورة تسجيل الخروج.",
  "يحتفظ تخزين الجلسة بتفضيلات الزائر وحالة الاستكشاف، مثل مرشّحات البحث وعرض الخريطة، وفترات انتظار إعادة إرسال البريد. وتحتفظ مكتبة المصادقة أيضًا بمعلومات تحقق مؤقتة لازمة لإتمام تأكيد البريد واستعادة الحساب.",
  "استخدم تسجيل الخروج على الأجهزة المشتركة. ويمكنك مسح تخزين هذا الموقع من إعدادات المتصفح، لكن ذلك قد يحذف محفوظات الزائر وتفضيلاته أو يعطّل عملية تأكيد أو استعادة قيد التنفيذ. ولا يحذف مسح تخزين المتصفح سجلات الحساب على الخادم. وقد تستخدم الخدمات الخارجية ملفات ارتباط أو تخزينًا خاصًا بها وفق سياساتها."
]
),
 section("providers","7. Providers, disclosure, and transfers","٧. مزوّدو الخدمات والإفصاح ونقل البيانات",
[
  "Supabase provides authentication, the application database and object storage. It receives information needed for those functions and the associated network requests. Public destination images and branding are separate from private profile-image access.",
  "OpenFreeMap supplies map resources based on OpenStreetMap data. Google Maps receives requests when you follow directions links. Hosting and email-delivery services process the requests and messages needed to deliver the website and account emails. External destination and source websites receive information when you visit them.",
  "Account records are accessed through authenticated features rather than a public user directory. Access controls limit who can use private account data, while authorized providers and legally entitled authorities may have access where appropriate.",
  "Requests to third-party services may cross national borders. This website does not guarantee that all processing takes place in Jordan. Independent providers' terms and privacy policies describe their own services. You can contact ramezmayaa@gmail.com with questions about service-provider processing."
],
[
  "توفّر Supabase المصادقة وقاعدة بيانات التطبيق وتخزين الملفات، وتتلقى المعلومات اللازمة لهذه الوظائف وطلبات الشبكة المرتبطة بها. وتُعدّ صور الوجهات العامة ومواد الهوية البصرية منفصلة عن الوصول الخاص إلى الصور الشخصية.",
  "توفّر OpenFreeMap موارد خرائط تستند إلى بيانات OpenStreetMap. وتتلقى Google Maps الطلبات عند اتباع روابط الاتجاهات. وتعالج خدمات الاستضافة وإرسال البريد الطلبات والرسائل اللازمة لإتاحة الموقع ورسائل الحساب. وتتلقى مواقع الوجهات والمصادر الخارجية المعلومات عند زيارتها.",
  "يُتاح الوصول إلى سجلات الحساب عبر خصائص تتطلب المصادقة، ولا تُعرض في دليل عام للمستخدمين. وتحدّ ضوابط الوصول من استخدام بيانات الحساب الخاصة، مع إمكان وصول المزوّدين المخوّلين والجهات التي يحق لها ذلك قانونًا حيث يكون ذلك مناسبًا.",
  "قد تعبر الطلبات إلى الخدمات الخارجية حدود الدول. ولا يضمن الموقع إجراء جميع عمليات المعالجة داخل الأردن. وتوضّح شروط المزوّدين المستقلين وسياسات خصوصيتهم خدماتهم الخاصة. ويمكنك التواصل عبر ramezmayaa@gmail.com للاستفسار عن معالجة البيانات لدى مزوّدي الخدمات."
]
),
 section("retention","8. Retention, deletion, and account controls","٨. الاحتفاظ والحذف وأدوات الحساب",
[
  "Account-linked records are stored so that your profile and personal discoveries remain available on later visits. The application does not automatically expire accounts. Signing out or clearing browser storage does not erase your account.",
  "You can edit supported profile details, remove saved places and visit marks, and clear recommendation history through My Discoveries. These actions remove the selected application records, not your authentication account. Replacing or removing a profile image does not necessarily erase every previously uploaded copy.",
  "Self-service data downloads and account deletion are not currently available on the website. You can contact ramezmayaa@gmail.com about access to or deletion of your personal data. Sending a request does not automatically delete an account. Changes to active account records do not necessarily remove copies held separately in backups or service-provider logs."
],
[
  "تُخزّن السجلات المرتبطة بالحساب ليظل ملفك الشخصي واكتشافاتك متاحين في الزيارات اللاحقة. ولا ينهي التطبيق الحسابات تلقائيًا. ولا يمحو تسجيل الخروج أو مسح تخزين المتصفح حسابك.",
  "يمكنك تعديل بيانات الملف الشخصي التي يتيحها الموقع وإزالة الأماكن المحفوظة وعلامات الزيارة ومسح سجل الاقتراحات من خلال «اكتشافاتي». وتحذف هذه الإجراءات السجلات المحددة في التطبيق، لا حساب المصادقة. ولا يؤدي استبدال الصورة الشخصية أو إزالتها بالضرورة إلى محو كل نسخة رُفعت سابقًا.",
  "لا يتيح الموقع حاليًا تنزيل البيانات أو حذف الحساب ذاتيًا. ويمكنك التواصل عبر ramezmayaa@gmail.com بشأن الوصول إلى بياناتك الشخصية أو حذفها. ولا يؤدي إرسال الطلب إلى حذف الحساب تلقائيًا. كما لا تؤدي التغييرات في سجلات الحساب النشطة بالضرورة إلى إزالة نسخ محفوظة بصورة منفصلة في النسخ الاحتياطية أو سجلات مزوّدي الخدمات."
]
),
 section("security","9. Security and your choices","٩. الأمان والخيارات المتاحة لك",
[
  "The website uses Supabase authentication, account-based access controls and time-limited links for private profile images. No online service can guarantee complete protection against unauthorized access, loss or interruption.",
  "Choose a strong, unique password, protect your email account, keep recovery links private and sign out on shared devices. Do not send passwords, session tokens or recovery links in a privacy request. You can browse public destinations without an account and decline browser location access."
],
[
  "يستخدم الموقع مصادقة Supabase وضوابط وصول مرتبطة بالحساب وروابط محدودة الصلاحية للصور الشخصية الخاصة. ولا تستطيع أي خدمة إلكترونية ضمان الحماية الكاملة من الوصول غير المصرّح به أو الفقد أو الانقطاع.",
  "اختر كلمة مرور قوية وفريدة، واحمِ بريدك الإلكتروني، واحتفظ بروابط الاستعادة سرية، وسجّل الخروج على الأجهزة المشتركة. ولا ترسل كلمات المرور أو رموز الجلسات أو روابط الاستعادة ضمن طلب خصوصية. ويمكنك تصفّح الوجهات العامة دون حساب ورفض إذن الموقع في المتصفح."
]
),
 section("rights","10. Rights and privacy requests","١٠. الحقوق وطلبات الخصوصية",
[
  "Depending on applicable law and its conditions, you may have rights to access and obtain a copy of your data, correct it, object to certain processing, withdraw prior consent, request erasure or restriction, and complain to the competent authority. Withdrawal does not itself undo earlier lawful processing. These rights are subject to the relevant legal conditions and exceptions.",
  "For a privacy question or request, contact Ramez Ahmad Almaayeh at ramezmayaa@gmail.com. Describe the request and provide only the information needed to identify the relevant account or records. Do not send passwords, session tokens, recovery links, identity documents or unnecessary sensitive information. Account-related requests may require identity verification before action can be taken."
],
[
  "بحسب القانون الواجب التطبيق وشروطه، قد تكون لك حقوق في الاطلاع على بياناتك والحصول على نسخة منها وتصحيحها والاعتراض على بعض أوجه معالجتها وسحب الموافقة المسبقة وطلب المحو أو التقييد وتقديم شكوى إلى الجهة المختصة. ولا يُبطل سحب الموافقة بذاته المعالجة السابقة المشروعة. وتخضع هذه الحقوق للشروط والاستثناءات القانونية ذات الصلة.",
  "للاستفسارات وطلبات الخصوصية، تواصل مع Ramez Ahmad Almaayeh على ramezmayaa@gmail.com. وضّح طلبك وقدّم فقط المعلومات اللازمة لتحديد الحساب أو السجلات المعنية. ولا ترسل كلمات مرور أو رموز جلسات أو روابط استعادة أو وثائق هوية أو معلومات حساسة غير لازمة. وقد تتطلب الطلبات المرتبطة بالحساب التحقق من الهوية قبل اتخاذ إجراء."
]
),
 section("children","11. Children’s privacy","١١. خصوصية الأطفال",
[
  "Account features are intended for people with the legal capacity and permissions needed to use the service. The website does not verify users' ages. If you believe a child has provided personal information without the required permission, contact ramezmayaa@gmail.com."
],
[
  "تُوجّه خصائص الحساب لمن تتوفر لديهم الأهلية القانونية والأذونات اللازمة لاستخدام الخدمة. ولا يتحقق الموقع من أعمار المستخدمين. وإذا كنت تعتقد أن طفلًا قدّم معلومات شخصية دون الإذن المطلوب، فتواصل عبر ramezmayaa@gmail.com."
]
),
 section("updates","12. Updates and contact","١٢. التحديثات والتواصل",
[
  "This policy may be updated to reflect changes to the website or its services. The date at the top identifies the current version. Any notice or consent required by applicable law remains applicable.",
  "For privacy questions, contact Ramez Ahmad Almaayeh, the individual operator of Unseen Jo, at ramezmayaa@gmail.com. Emailing this address sends your message, email address and any information you include through your email service and the operator's mailbox provider. Share only what is needed for your question."
],
[
  "قد تُحدّث هذه السياسة لتعكس التغييرات في الموقع أو خدماته. ويحدد التاريخ أعلى الصفحة النسخة الحالية. وتظل متطلبات الإشعار أو الموافقة التي يقررها القانون الواجب التطبيق سارية.",
  "للاستفسارات المتعلقة بالخصوصية، تواصل مع Ramez Ahmad Almaayeh، المشغّل الفردي لمنصة Unseen Jo، على ramezmayaa@gmail.com. وتمرّ مراسلة هذا العنوان برسالتك وعنوان بريدك وأي معلومات تضمّنها عبر خدمة بريدك ومزوّد صندوق بريد المشغّل. يُرجى مشاركة ما يلزم لسؤالك فقط."
]
)
]
export const termsSections=[
 section("acceptance","1. About these terms","١. حول هذه الشروط",
[
  "These terms describe the conditions for using Unseen Jo, a tourism discovery and recommendation website focused on Jordan. Please read them with the Privacy Policy before creating an account. If you do not accept the applicable conditions, do not use account features. Mandatory rights under applicable law remain unaffected.",
  "Unseen Jo is operated by Ramez Ahmad Almaayeh as an individual operator. For questions about these terms, contact ramezmayaa@gmail.com."
],
[
  "توضّح هذه الشروط أحكام استخدام Unseen Jo، وهو موقع لاكتشاف الوجهات السياحية واقتراحها في الأردن. يُرجى قراءتها مع سياسة الخصوصية قبل إنشاء حساب. وإذا لم تقبل الأحكام المنطبقة، فلا تستخدم خصائص الحساب. وتبقى الحقوق الآمرة المقررة في القانون محفوظة.",
  "يدير منصة Unseen Jo المشغّل الفردي Ramez Ahmad Almaayeh. وللاستفسارات المتعلقة بهذه الشروط، تواصل عبر ramezmayaa@gmail.com."
]
),
 section("service","2. What the service provides","٢. ما تقدّمه الخدمة",
[
  "Unseen Jo lets you explore destination information and maps, set travel preferences, receive rule-based suggestions through Surprise Me, and maintain saved places, self-reported visits, and recommendation history. Public browsing is available without an account; synchronized personal records require sign-in.",
  "Unseen Jo does not currently provide bookings, ticket sales, payment processing, travel-agency services, or a contract with a destination operator. Saving a place or receiving a recommendation does not reserve entry, transport, accommodation, or any other service."
],
[
  "يتيح Unseen Jo استكشاف معلومات الوجهات والخرائط وتحديد تفضيلات السفر وتلقي اقتراحات قائمة على قواعد عبر «فاجئني» وإدارة الأماكن المحفوظة والزيارات المصرّح بها ذاتيًا وسجل الاقتراحات. ويمكن التصفّح العام دون حساب، بينما تتطلب مزامنة السجلات الشخصية تسجيل الدخول.",
  "لا يوفّر Unseen Jo حاليًا الحجوزات أو بيع التذاكر أو معالجة المدفوعات أو خدمات وكالات السفر، ولا ينشئ عقدًا مع مشغّل الوجهة. ولا يُعدّ حفظ مكان أو تلقي اقتراح حجزًا للدخول أو النقل أو الإقامة أو أي خدمة أخرى."
]
),
 section("eligibility","3. Eligibility and registration","٣. الأهلية والتسجيل",
[
  "Use account features only if you have the legal capacity and any permissions required under applicable law. Do not register on behalf of another person without authority. The website does not verify users' ages.",
  "Provide accurate registration information that you are entitled to use, maintain access to your email address and keep supported profile details reasonably current. Complete email confirmation when requested. Administrator privileges require separately authorized roles; registering or opening an Admin route does not grant them."
],
[
  "استخدم خصائص الحساب فقط إذا كانت لديك الأهلية القانونية والأذونات اللازمة وفق القانون الواجب التطبيق. ولا تسجّل نيابة عن شخص آخر دون تفويض. ولا يتحقق الموقع من أعمار المستخدمين.",
  "قدّم بيانات تسجيل صحيحة يحق لك استخدامها، وحافظ على إمكانية الوصول إلى بريدك الإلكتروني وحدّث بيانات الملف الشخصي التي يتيحها الموقع بصورة معقولة. وأكمل تأكيد البريد عندما يُطلب منك ذلك. وتتطلب صلاحيات المسؤول أدوارًا مخوّلة على نحو مستقل؛ ولا يمنحها التسجيل أو فتح رابط الإدارة."
]
),
 section("security","4. Account responsibility and security","٤. مسؤولية الحساب وأمانه",
[
  "Keep your password and recovery links confidential. Do not share a session or impersonate another user. Sign out on shared devices; sessions can persist after you close the browser. Recovery and confirmation links can expire and may require the browser profile and website address used for the request.",
  "If you suspect unauthorized use, use password recovery and sign-out controls and secure your email account. You can contact Ramez Ahmad Almaayeh at ramezmayaa@gmail.com about account concerns. Never send passwords, authentication tokens or recovery links. You are not automatically responsible for activity beyond your control where applicable law provides otherwise."
],
[
  "حافظ على سرية كلمة المرور وروابط الاستعادة. ولا تشارك جلسة الدخول أو تنتحل هوية مستخدم آخر. وسجّل الخروج على الأجهزة المشتركة، إذ قد تستمر الجلسة بعد إغلاق المتصفح. وقد تنتهي صلاحية روابط الاستعادة والتأكيد أو تتطلب ملف المتصفح وعنوان الموقع المستخدمين عند الطلب.",
  "إذا اشتبهت في استخدام غير مصرّح به، فاستخدم أدوات استعادة كلمة المرور وتسجيل الخروج وأمّن بريدك الإلكتروني. ويمكنك التواصل مع Ramez Ahmad Almaayeh على ramezmayaa@gmail.com بشأن مشكلات الحساب. ولا ترسل كلمات مرور أو رموز مصادقة أو روابط استعادة. ولا تتحمل تلقائيًا مسؤولية نشاط خارج سيطرتك حيث يقرر القانون خلاف ذلك."
]
),
 section("use","5. Permitted and prohibited use","٥. الاستخدام المسموح والمحظور",
[
  "Use the service for lawful destination discovery and personal travel planning. Respect local law, site rules, protected areas, private property, and the rights of other people. Obtain any permits and independent advice needed for your trip.",
  "Do not attempt unauthorized access, bypass account or administrator restrictions, extract private records, upload malicious files, disrupt availability, impersonate others, or use the service for fraud or unlawful activity. Do not copy or redistribute protected content beyond permission or applicable legal exceptions. Automated access must respect technical limits and must not impair the service or others’ rights."
],
[
  "استخدم الخدمة بصورة مشروعة لاكتشاف الوجهات والتخطيط الشخصي للسفر. واحترم القانون المحلي وقواعد المواقع والمناطق المحمية والملكية الخاصة وحقوق الآخرين. واحصل على التصاريح والمشورة المستقلة اللازمة لرحلتك.",
  "يُحظر محاولة الوصول غير المصرّح به أو تجاوز قيود الحساب والإدارة أو استخراج السجلات الخاصة أو رفع ملفات ضارة أو تعطيل الخدمة أو انتحال الهوية أو استخدامها للاحتيال أو نشاط غير مشروع. ولا تنسخ المحتوى المحمي أو تعيد توزيعه خارج نطاق الإذن أو الاستثناءات القانونية. ويجب أن يحترم الوصول الآلي الحدود التقنية وألا يضرّ بالخدمة أو بحقوق الآخرين."
]
),
 section("content","6. Your information and uploaded images","٦. معلوماتك والصور التي ترفعها",
[
  "The current service supports profile names, optional profile images, preferences, and private personal destination records. It does not provide a public user-review, comment, or destination-submission feature. Administrative content editing is limited to authorized administrators.",
  "You retain any rights you hold in material you provide. By uploading a profile image, you permit the storage, processing, and display needed for the profile feature, subject to the Privacy Policy and applicable law; this is not a transfer of ownership or permission for unrelated advertising. Upload only material you have the right to use and avoid sensitive or unlawful content."
],
[
  "تدعم الخدمة الحالية أسماء الملفات الشخصية والصور الشخصية الاختيارية والتفضيلات وسجلات الوجهات الشخصية الخاصة. ولا توفّر خاصية عامة لمراجعات المستخدمين أو تعليقاتهم أو اقتراح وجهات للنشر. ويقتصر تحرير المحتوى الإداري على المسؤولين المخوّلين.",
  "تحتفظ بما تملكه من حقوق في المواد التي تقدّمها. وبرفع صورة شخصية، تسمح بالتخزين والمعالجة والعرض اللازم لخاصية الملف الشخصي، مع مراعاة سياسة الخصوصية والقانون. ولا ينقل ذلك الملكية ولا يمنح إذنًا بإعلانات غير مرتبطة. ولا ترفع إلا ما يحق لك استخدامه، وتجنّب المحتوى الحساس أو غير المشروع."
]
),
 section("ip","7. Brand, destination images, and third-party rights","٧. الهوية البصرية وصور الوجهات وحقوق الغير",
[
  "The Unseen Jo name, logo, interface, software, text, photographs, and map resources may be protected by intellectual-property rights. Rights can belong to the operator or to third-party owners; display on this site does not mean every asset is owned by Unseen Jo or available for reuse.",
  "Respect image credits, source notices, and applicable licenses, including map-data and style attributions. Public access to a destination image or branding file does not grant a blanket license to reproduce it. Nothing here restricts uses expressly permitted by applicable law."
],
[
  "قد يخضع اسم Unseen Jo وشعاره وواجهته وبرمجياته ونصوصه وصوره وموارد خرائطه لحقوق الملكية الفكرية. وقد تعود الحقوق للمشغّل أو لمالكين آخرين؛ ولا يعني عرض أصل على الموقع أن Unseen Jo يملكه أو أنه متاح لإعادة الاستخدام.",
  "احترم نسب الصور وإشعارات المصادر والتراخيص المنطبقة، بما فيها نسب بيانات الخرائط وتصاميمها. ولا يتيح الوصول العام إلى صورة وجهة أو ملف هوية بصرية ترخيصًا شاملًا لنسخه. ولا تقيّد هذه الشروط الاستخدامات التي يجيزها القانون صراحة."
]
),
 section("recommendations","8. Personal records and recommendations","٨. السجلات الشخصية والاقتراحات",
[
  "Saved destinations and visited marks are personal planning aids. Guest saves depend on browser storage and may be lost when it is cleared. Signed-in records depend on successful synchronization. Self-reported visits are not verified travel records.",
  "Recommendations reflect your selected inputs and the available destination information. They are not professional travel advice, an assessment of your fitness or a guarantee of suitability or safety. Check essential details before making travel plans."
],
[
  "الأماكن المحفوظة وعلامات الزيارة أدوات للتخطيط الشخصي. وتعتمد محفوظات الزائر على تخزين المتصفح وقد تضيع عند مسحه. وتعتمد سجلات الحساب على نجاح المزامنة. والزيارات المصرّح بها ذاتيًا ليست سجل سفر موثّقًا.",
  "تعكس الاقتراحات المدخلات التي تختارها ومعلومات الوجهات المتاحة. وليست مشورة سفر مهنية أو تقييمًا لقدرتك البدنية أو ضمانًا للملاءمة أو السلامة. تحقّق من التفاصيل الأساسية قبل وضع خطط السفر."
]
),
 section("accuracy","9. Tourism information and travel decisions","٩. المعلومات السياحية وقرارات السفر",
[
  "Destination descriptions, coordinates, prices, opening hours, transportation, accessibility details, travel times and budget estimates may be incomplete, approximate or outdated. Availability, weather, access restrictions, seasonal conditions and local rules can change. Map pins may indicate an approximate area rather than an entrance.",
  "Before travelling, verify essential details directly with the destination or an authoritative source, including current prices, permits, opening times, route conditions and accessibility. Straight-line distances are not driving routes or travel-time guarantees. The platform is not an emergency or rescue service; use the appropriate official channels when assistance is needed."
],
[
  "قد تكون أوصاف الوجهات والإحداثيات والأسعار وساعات العمل ووسائل النقل وإمكانية الوصول وأوقات الرحلات وتقديرات الميزانية ناقصة أو تقريبية أو قديمة. وقد تتغير الإتاحة والطقس وقيود الدخول والظروف الموسمية والقواعد المحلية. وقد تشير علامة الخريطة إلى منطقة تقريبية بدلًا من مدخل محدد.",
  "تحقّق قبل السفر من التفاصيل الأساسية لدى الوجهة مباشرة أو من مصدر مختص، بما يشمل الأسعار والتصاريح وساعات العمل وحالة الطريق وإمكانية الوصول. والمسافات بخط مستقيم ليست طرق قيادة أو ضمانًا لمدة الرحلة. وليست المنصة خدمة طوارئ أو إنقاذ؛ فاستخدم القنوات الرسمية المناسبة عند الحاجة إلى المساعدة."
]
),
 section("external","10. External services and links","١٠. الخدمات والروابط الخارجية",
[
  "Authentication and storage use Supabase. Maps use MapLibre and resources from OpenFreeMap based on OpenStreetMap data. Directions and destination-source links can open independent websites such as Google Maps. Their terms, privacy practices, availability, and charges, if any, are their responsibility.",
  "A link or recommendation is not a guarantee, endorsement of every statement, or an agency relationship. Any arrangement you make with an independent operator is separate from this discovery service."
],
[
  "تستخدم المصادقة والتخزين Supabase. وتستخدم الخرائط MapLibre وموارد من OpenFreeMap تستند إلى بيانات OpenStreetMap. وقد تفتح روابط الاتجاهات ومصادر الوجهات مواقع مستقلة مثل Google Maps. وتعود مسؤولية شروط هذه الخدمات وممارسات خصوصيتها وإتاحتها ورسومها، إن وجدت، إلى الجهات المعنية بها.",
  "لا يُعدّ الرابط أو الاقتراح ضمانًا أو تأييدًا لكل عبارة أو إنشاءً لعلاقة وكالة. وأي ترتيب تجريه مع مشغّل مستقل منفصل عن خدمة الاكتشاف هذه."
]
),
 section("availability","11. Availability, changes, and account restrictions","١١. الإتاحة والتغييرات وقيود الحساب",
[
  "Features and destination content may change, and maintenance, provider failures or network problems may interrupt access. Continuous availability, permanent storage and error-free operation are not guaranteed. Any notices required by applicable law remain applicable.",
  "Access may be restricted where reasonably necessary to address unlawful use, security risks or material breaches, subject to applicable law. You may stop using the service and sign out at any time; these actions do not erase your account. The Privacy Policy explains available account controls and how to contact the operator about personal data."
],
[
  "قد تتغير الخصائص ومحتوى الوجهات، وقد تتسبب الصيانة أو أعطال المزوّدين أو مشكلات الشبكة في انقطاع الوصول. ولا تُضمن الإتاحة المستمرة أو التخزين الدائم أو التشغيل الخالي من الأخطاء. وتظل متطلبات الإشعار التي يقررها القانون الواجب التطبيق سارية.",
  "قد يُقيّد الوصول بالقدر المعقول اللازم لمواجهة الاستخدام غير المشروع أو مخاطر الأمان أو المخالفات الجوهرية، مع مراعاة القانون الواجب التطبيق. ويمكنك التوقف عن استخدام الخدمة وتسجيل الخروج في أي وقت، لكن ذلك لا يمحو حسابك. وتوضّح سياسة الخصوصية أدوات الحساب المتاحة وكيفية التواصل مع المشغّل بشأن البيانات الشخصية."
]
),
 section("liability","12. Warranties and responsibility","١٢. الضمانات والمسؤولية",
[
  "To the extent permitted by applicable law, the service is provided as available without a promise that information is complete, current or suitable for every journey. You remain responsible for checking travel conditions and making informed decisions. This does not remove duties that applicable law makes mandatory.",
  "Responsibility for a loss depends on its cause and the circumstances. To the extent permitted by applicable law, the operator is not responsible for losses caused solely by independent third-party services, conditions at destinations or reliance on clearly identified estimates without reasonable verification.",
  "Nothing in these terms excludes liability or remedies that cannot lawfully be excluded, including protections concerning fraud, intentional wrongdoing, negligence, personal injury or consumer rights where those protections are mandatory."
],
[
  "في الحدود التي يجيزها القانون، تُقدّم الخدمة بحسب إتاحتها دون تعهّد باكتمال المعلومات أو حداثتها أو ملاءمتها لكل رحلة. وتبقى مسؤولًا عن التحقق من ظروف السفر واتخاذ قرارات واعية. ولا يلغي ذلك واجبات يفرضها القانون على نحو ملزم.",
  "تتحدد المسؤولية عن الضرر بحسب سببه وظروفه. وفي الحدود التي يجيزها القانون، لا يتحمل المشغّل مسؤولية خسائر تنشأ حصرًا عن خدمات مستقلة للغير أو ظروف الوجهات أو الاعتماد على تقديرات مبيّنة بوضوح دون تحقق معقول.",
  "لا تستبعد هذه الشروط مسؤولية أو وسائل انتصاف لا يجوز استبعادها قانونًا، بما فيها الحماية المتعلقة بالاحتيال أو الفعل العمدي أو الإهمال أو الإصابة الشخصية أو حقوق المستهلك، حيث تكون تلك الحماية ملزمة."
]
),
 section("law","13. Applicable law and disputes","١٣. القانون الواجب التطبيق والمنازعات",
[
  "These terms and use of the service are subject to applicable law, including relevant Jordanian law where it applies. Nothing in these terms removes non-waivable rights or prevents access to a competent court.",
  "For questions or concerns about the service, contact Ramez Ahmad Almaayeh at ramezmayaa@gmail.com."
],
[
  "تخضع هذه الشروط واستخدام الخدمة للقانون الواجب التطبيق، بما يشمل القانون الأردني ذي الصلة حيثما انطبق. ولا تنتقص هذه الشروط من الحقوق التي لا يجوز التنازل عنها ولا تمنع اللجوء إلى المحكمة المختصة.",
  "للأسئلة أو المسائل المتعلقة بالخدمة، تواصل مع Ramez Ahmad Almaayeh على ramezmayaa@gmail.com."
]
),
 section("updates","14. Changes and contact","١٤. التعديلات والتواصل",
[
  "These terms may change as the service develops. The current version will appear on this page with its revision date. Any notice or acceptance required by applicable law remains applicable.",
  "For questions about these terms, contact Ramez Ahmad Almaayeh, the individual operator of Unseen Jo, at ramezmayaa@gmail.com. Do not send passwords, session tokens, recovery links or unnecessary sensitive information. Both language versions are intended to communicate the same meaning; neither removes rights protected by applicable law."
],
[
  "قد تتغير هذه الشروط مع تطور الخدمة. وتُعرض النسخة الحالية في هذه الصفحة مع تاريخ مراجعتها. وتظل متطلبات الإشعار أو القبول التي يقررها القانون الواجب التطبيق سارية.",
  "للأسئلة المتعلقة بهذه الشروط، تواصل مع Ramez Ahmad Almaayeh، المشغّل الفردي لمنصة Unseen Jo، على ramezmayaa@gmail.com. ولا ترسل كلمات مرور أو رموز جلسات أو روابط استعادة أو معلومات حساسة غير لازمة. ويُقصد بالنسختين اللغويتين نقل المعنى نفسه، ولا تنتقص أي منهما من الحقوق التي يحميها القانون الواجب التطبيق."
]
)
]
