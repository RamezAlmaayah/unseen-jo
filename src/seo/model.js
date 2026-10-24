export const HOME_TITLE='Unseen Jo | Discover Jordan Differently'
export const HOME_DESCRIPTION='Discover Jordan differently with Unseen Jo. Explore hidden gems, unique destinations, authentic local experiences, and personalized travel recommendations.'
export const SOCIAL_IMAGE='/assets/branding/unseen-jo-social-preview.png'
export const PRIVATE_ROUTE=/^\/(admin|auth|profile|my-discoveries|login|register|forgot-password|discovery-result)(\/|$)/
export function productionOrigin(value=''){
 if(!value.trim())return ''
 try{const u=new URL(value.trim()),h=u.hostname.toLowerCase();if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.port||u.pathname!=='/'||!h.includes('.')||/^[\d.]+$/.test(h)||h.includes(':')||/(^|\.)(localhost|local|test|invalid)$/.test(h)||h.endsWith('.localhost')||h.endsWith('.supabase.co'))throw Error();return u.origin}catch{throw Error('VITE_SITE_URL must be a public website HTTPS origin, without a path, port, credentials, query or fragment.')}
}
const routes={
 '/privacy-policy':['Privacy Policy | Unseen Jo','Read how Unseen Jo handles account information, saved places, preferences, and privacy choices.','سياسة الخصوصية | Unseen Jo','تعرّف إلى تعامل Unseen Jo مع معلومات الحساب والأماكن المحفوظة والتفضيلات وخيارات الخصوصية.'],
 '/terms-of-service':['Terms of Service | Unseen Jo','Read the terms for using Unseen Jo to discover Jordan, save places, and receive destination recommendations.','شروط الخدمة | Unseen Jo','اطّلع على شروط استخدام Unseen Jo لاكتشاف الأردن وحفظ الأماكن وتلقي اقتراحات الوجهات.'],
 '/':[HOME_TITLE,HOME_DESCRIPTION,'Unseen Jo | اكتشف الأردن بطريقة مختلفة','اكتشف الأردن بطريقة مختلفة مع Unseen Jo. استكشف كنوزاً خفية ووجهات مميزة وتجارب محلية أصيلة واقتراحات سفر تناسبك.'],
 '/explore':['Explore Jordan | Unseen Jo','Explore unique destinations and hidden gems across Jordan. Find your next discovery with Unseen Jo.','استكشف الأردن | Unseen Jo','استكشف وجهات الأردن المميزة وكنوزه الخفية، واعثر على اكتشافك القادم مع Unseen Jo.'],
 '/map':['Jordan Map | Unseen Jo','Discover Jordan on the map and explore destinations that inspire your next adventure.','خريطة الأردن | Unseen Jo','اكتشف الأردن على الخريطة واستكشف وجهات تُلهم مغامرتك القادمة.'],
 '/surprise-me':['Surprise Me | Unseen Jo','Find your next Jordan adventure with personalized destination recommendations from Unseen Jo.','فاجئني | Unseen Jo','اعثر على مغامرتك القادمة في الأردن مع اقتراحات وجهات تناسب اهتماماتك من Unseen Jo.'],
 '/preferences':['Travel Preferences | Unseen Jo','Choose your interests and travel preferences to discover your kind of Jordan.','تفضيلات السفر | Unseen Jo','اختر اهتماماتك وتفضيلات سفرك لتكتشف الأردن كما تحب.']
}
export function routeSeo(pathname,language='en',page={},site='',search=''){
 const path=pathname.replace(/\/+$/,'')||'/',ar=language==='ar-JO',destination=/^\/places\/[^/]+$/.test(path),known=!!routes[path]||destination
 const row=routes[path]||[destination?'Discover Jordan | Unseen Jo':'Unseen Jo',HOME_DESCRIPTION,destination?'اكتشف الأردن | Unseen Jo':'Unseen Jo','اكتشف وجهات الأردن وتجاربها المحلية مع Unseen Jo.']
 const privatePage=PRIVATE_ROUTE.test(path)||!known||new URLSearchParams(search).has('sample')||page.noindex===true
 const fallbackTitle=path.startsWith('/admin')?(ar?'مساحة عمل المسؤول | Unseen Jo':'Administrator workspace | Unseen Jo'):row[ar?2:0]
 const title=page.title||fallbackTitle,description=String(page.description||row[ar?3:1]).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,170)
 const canonical=site&&!privatePage?site+path:''
 return {title,description,robots:privatePage?'noindex, nofollow':'index, follow, max-image-preview:large',locale:ar?'ar_JO':'en_US',alternate:ar?'en_US':'ar_JO',canonical,image:site&&!privatePage?site+SOCIAL_IMAGE:'',imageAlt:'Unseen Jo — Discover Jordan Differently',lang:ar?'ar-JO':'en',dir:ar?'rtl':'ltr'}
}
export function metaEntries(seo){return [
 ['name','description',seo.description],['name','robots',seo.robots],
 ['property','og:type','website'],['property','og:site_name','Unseen Jo'],['property','og:title',seo.title],['property','og:description',seo.description],['property','og:locale',seo.locale],['property','og:locale:alternate',seo.alternate],
 ['name','twitter:card','summary_large_image'],['name','twitter:title',seo.title],['name','twitter:description',seo.description],
 ...(seo.canonical?[['property','og:url',seo.canonical]]:[]),
 ...(seo.image?[['property','og:image',seo.image],['property','og:image:secure_url',seo.image],['property','og:image:type','image/png'],['property','og:image:width','1200'],['property','og:image:height','630'],['property','og:image:alt',seo.imageAlt],['name','twitter:image',seo.image],['name','twitter:image:alt',seo.imageAlt]]:[])
]}
