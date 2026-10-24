import {useEffect,useMemo,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router'
import {tx} from '../i18n/index.js'
import {localizeDestination} from '../i18n/destinations.js'
import {usePageTitle} from '../i18n/usePageTitle'
import SectionHeading from '../components/discovery/SectionHeading'
import ContentState from '../components/discovery/ContentState'
import DiscoveryResultContent from '../components/discovery/DiscoveryResultContent'
import Button from '../components/ui/Button'
import {usePreferences} from '../features/preferences/usePreferences'
import {getRepository} from '../features/tourism/useTourism.js'
import {rankDestinations,diversityPool} from '../features/recommendations/engine.js'
import {useRecommendationData} from '../features/recommendations/useRecommendationData.js'
import {useRecommendationSession} from '../features/recommendations/context.js'
import {usePersonalDiscoveries} from '../features/personal/context.js'

export default function DiscoveryResultPage(){
 const {preferences}=usePreferences(),data=useRecommendationData(),{session,select}=useRecommendationSession(),{i18n}=useTranslation()
 const [relax,setRelax]=useState(false),[detail,setDetail]=useState({place:null,error:null}),[detailAttempt,setDetailAttempt]=useState(0),[refreshing,setRefreshing]=useState(false)
 const ranked=useMemo(()=>rankDestinations(data.rows,preferences,data.categories),[data.rows,data.categories,preferences])
 const list=relax?ranked.relaxed:ranked.ranked,signature=ranked.signature+':'+relax
 const candidate=session.signature===signature?list.find(r=>r.id===session.selected):null
 usePageTitle('Your discovery | Unseen Jo')
 useEffect(()=>{if(data.status==='ready')select(signature,list)},[data.status,signature,list,select])
 useEffect(()=>{if(!candidate)return;let active=true;getRepository().then(repo=>repo.fetchPublishedPlaceBySlug(candidate.slug)).then(place=>{if(active)setDetail({place,error:place?null:'This destination is no longer available. Refresh the published recommendations.'})}).catch(error=>{if(active)setDetail({place:null,error:error.message})});return()=>{active=false}},[candidate,detailAttempt])
 const chosen=detail.place?.slug===candidate?.slug?detail.place:null
 const place=chosen?localizeDestination(chosen,i18n.language):null
 const {record,recordError}=usePersonalDiscoveries()
 // Private scenario recommendations are not published account-history events.
 // Keep the existing published-only personal RLS contract unchanged.
 const presentedId=place&&!place.prototype?place.id:null,eventId=session.eventId
 useEffect(()=>{if(presentedId&&eventId)void record(eventId,presentedId)},[presentedId,eventId,record])
 function refresh(){setDetail({place:null,error:null});setDetailAttempt(n=>n+1);void data.retry()}
 async function again(){setRefreshing(true);try{const fresh=await data.revalidate();if(fresh){const next=rankDestinations(fresh.rows,preferences,fresh.categories);select(next.signature+':'+relax,relax?next.relaxed:next.ranked,true)}}finally{setRefreshing(false)}}
 return <div className="discovery-result-page">
  {recordError&&!place?.prototype&&<p role="status">{tx('This recommendation could not be added to your history.')} <button type="button" onClick={()=>void record(eventId,presentedId)}>{tx('Retry')}</button></p>}
  <SectionHeading title={tx('We found something for you.')}>{tx('Based on your interests, time, and budget.')}</SectionHeading>
  <p className="recommendation-intro">{tx(data.rows.some(p=>p.prototype)?'Private prototype recommendations use the completed demonstration catalog.':'Published destinations only. Recommendations use recorded facts and clearly labelled estimates.')}</p>
  {data.status!=='ready'?<div className="result-content-state"><ContentState mode="supabase" status={data.status} message={data.error} onAction={data.status==='error'?data.retry:undefined}/></div>:!list.length?<section className="recommendation-empty" role="status">
   <h2>{tx('No confirmed match for these requirements')}</h2><p>{tx(data.rows.length?'Some places exceed your limits or lack evidence for your essential requirements.':'No published destinations are available right now.')}</p>
   <p>{tx('Unknown prices, durations and transport options do not count as verified matches.')}</p>
   {!relax&&ranked.relaxed.length>0&&<Button onClick={()=>setRelax(true)} variant="secondary">{tx('Show alternatives with unverified essentials')}</Button>}
   <Link to="/surprise-me">{tx('Edit Preferences')}</Link><button type="button" onClick={refresh}>{tx('Refresh published recommendations')}</button>
  </section>:detail.error?<div className="result-content-state"><ContentState mode="supabase" status="error" message={detail.error} onAction={refresh}/></div>:!candidate||!place?<div className="result-content-state"><ContentState mode="supabase" status="loading"/></div>:<>
   {relax&&<p className="recommendation-notice" role="status">{tx('Unverified alternative: one or more essential requirements cannot be confirmed. Your preferences have not been changed.')}</p>}
   {refreshing&&<p className="recommendation-intro" role="status">{tx('Checking current published recommendations…')}</p>}
   <DiscoveryResultContent recommendation={{...candidate,place}} onAgain={()=>void again()} againBusy={refreshing} onEdit="/surprise-me"/>
   {diversityPool(list).length===1&&<p className="recommendation-intro">{tx('Only one destination is in the strongest matching group; another surprise may keep this result.')}</p>}
   {relax&&<p className="recommendation-intro"><button type="button" onClick={()=>setRelax(false)}>{tx('Return to confirmed requirements')}</button></p>}
  </>}
 </div>
}
