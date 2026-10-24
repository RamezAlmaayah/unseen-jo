import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'
import en from './locales/en.json' with {type:'json'}
import ar from './locales/ar-JO.json' with {type:'json'}
export const LANGUAGE_KEY='unseen-jo-language'
export const supportedLanguages=['en','ar-JO']
let language='en'
try{const saved=localStorage.getItem(LANGUAGE_KEY);if(supportedLanguages.includes(saved))language=saved}catch{/* Storage may be disabled. */}
void i18n.use(initReactI18next).init({resources:{en:{ui:en},'ar-JO':{ui:ar}},lng:language,fallbackLng:'en',supportedLngs:supportedLanguages,load:'currentOnly',defaultNS:'ui',keySeparator:false,nsSeparator:false,initAsync:false,interpolation:{escapeValue:false},returnNull:false})
function sync(lng,persist=true){if(typeof document!=='undefined'){document.documentElement.lang=lng;document.documentElement.dir=lng==='ar-JO'?'rtl':'ltr'}if(persist)try{localStorage.setItem(LANGUAGE_KEY,lng)}catch{/* In-memory switching remains available. */}}
sync(language,false);i18n.on('languageChanged',sync)
export const isArabic=()=>i18n.language==='ar-JO'
// Explicit React rendering calls only: never mutates DOM, input values or stored data.
export function tx(value){
 if(typeof value==='number')return isArabic()?new Intl.NumberFormat('ar-JO').format(value):value
 if(typeof value!=='string'||!value.trim())return value
 const key=value.trim();if(!isArabic())return value
 if(i18n.exists(key))return value.replace(key,i18n.t(key))
 for(const p of patterns){const m=p.regex.exec(key);if(m)return i18n.t(p.key,Object.fromEntries(m.slice(1).map((s,i)=>['v'+i,i18n.exists(s)?i18n.t(s):/^[\d.,–-]+$/.test(s)?s.replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[Number(d)]):s])))}
 for(const separator of [' · ','; ',' / '])if(key.includes(separator))return key.split(separator).map(part=>tx(part)).join(separator)
 return value
}
const patterns=Object.keys(ar).filter(k=>k.includes('{{v')).sort((a,b)=>b.replace(/\{\{v\d+\}\}/g,'').length-a.replace(/\{\{v\d+\}\}/g,'').length).map(key=>({key,regex:new RegExp('^'+key.split(/\{\{v\d+\}\}/).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('([\\s\\S]+?)')+'$')}))
export const locale=()=>isArabic()?'ar-JO':'en-GB'
export const formatNumber=(value,options={})=>new Intl.NumberFormat(locale(),options).format(value)
export const formatCurrency=value=>new Intl.NumberFormat(locale(),{style:'currency',currency:'JOD'}).format(value)
export const formatDateTime=value=>value?new Intl.DateTimeFormat(locale(),{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Amman'}).format(new Date(value)):'—'
export default i18n
