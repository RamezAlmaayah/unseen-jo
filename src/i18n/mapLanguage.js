import {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import i18n from './index.js'
export const mapLocale={
 'AttributionControl.ToggleAttribution':'إظهار نَسب مصادر الخريطة',
 'AttributionControl.MapFeedback':'ملاحظات الخريطة',
 'NavigationControl.ZoomIn':'تكبير', 'NavigationControl.ZoomOut':'تصغير',
 'NavigationControl.ResetBearing':'إعادة اتجاه الخريطة',
 'ScaleControl.Kilometers':'كم', 'ScaleControl.Meters':'م',
 'Map.Title':'خريطة تفاعلية', 'Map.Description':'استخدم الأسهم للتحريك وزري الجمع والطرح للتكبير والتصغير.',
 'Popup.Close':'إغلاق النافذة المنبثقة',
 'CooperativeGesturesHandler.WindowsHelpText':'استخدم Ctrl مع التمرير لتكبير الخريطة',
 'CooperativeGesturesHandler.MacHelpText':'استخدم ⌘ مع التمرير لتكبير الخريطة',
 'CooperativeGesturesHandler.MobileHelpText':'استخدم إصبعين لتحريك الخريطة'
}
export function applyMapLanguage(map,language){
 if(!map?.isStyleLoaded())return
 map.getContainer().dataset.mapLanguage=language
 for(const layer of map.getStyle().layers||[]){const text=layer.layout?.['text-field'];if(!text)continue
  // Only geographic name fields; preserve road route refs and non-name symbol content.
  if(!JSON.stringify(text).includes('name'))continue
  const next=language==='ar-JO'?['coalesce',['get','name:ar'],['get','name_ar'],['get','name'],['get','name:en'],['get','name_en']]:['coalesce',['get','name:en'],['get','name_en'],['get','name:latin'],['get','name']]
  if(JSON.stringify(text)!==JSON.stringify(next))map.setLayoutProperty(layer.id,'text-field',next)
 }
}
export function useMapLanguage(ref,ready){const {i18n}=useTranslation();useEffect(()=>{const map=ref.current?.getMap();if(!map||!ready)return;const change=()=>applyMapLanguage(map,i18n.language);change();map.on('styledata',change);return()=>map.off('styledata',change)},[ref,ready,i18n.language]);return i18n.language==='ar-JO'?mapLocale:undefined}
export function localizeLoadedMap(ref){applyMapLanguage(ref.current?.getMap(),i18n.language)}
