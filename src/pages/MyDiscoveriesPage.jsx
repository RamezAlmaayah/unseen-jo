import {useEffect,useMemo,useRef,useState} from 'react'
import {useSearchParams,Link} from 'react-router'
import {useTranslation} from 'react-i18next'
import {Bookmark,Check,History,MapPin,Search,Trash2,X} from 'lucide-react'
import {tx,formatDateTime,locale} from '../i18n/index.js'
import {usePageTitle} from '../i18n/usePageTitle'
import {useTourism} from '../features/tourism/useTourism'
import {placeHref} from '../features/tourism/model.js'
import {usePreviewFavorites} from '../features/discovery/usePreviewFavorites'
import {useUserAuth,useUserAccount} from '../features/account/context.js'
import {usePersonalDiscoveries} from '../features/personal/context.js'
import {filterPersonalPlaces,validVisitDate} from '../features/personal/model.js'
import AssetImage from '../components/ui/AssetImage'
import ContentState from '../components/discovery/ContentState'
import Button from '../components/ui/Button'
import ButtonLink from '../components/ui/ButtonLink'
const names=['saved','visited','history'],labels=['Saved Places','Visited Places','Discovery History'],icons=[Bookmark,Check,History]

export default function MyDiscoveriesPage(){
 const {user}=useUserAuth()
 return <PersonalDashboard key={user?.id||'guest'}/>
}
function PersonalDashboard(){
 const catalog=useTourism(),account=useUserAccount(),{user,status:authStatus}=useUserAuth(),personal=usePersonalDiscoveries()
 const {favorites,toggleFavorite,pending}=usePreviewFavorites(),{i18n}=useTranslation()
 const [params,setParams]=useSearchParams(),tab=names.includes(params.get('tab'))?params.get('tab'):'saved'
 const [query,setQuery]=useState(''),[category,setCategory]=useState(''),[sort,setSort]=useState('recent'),[confirm,setConfirm]=useState(false)
 const tabs=useRef([]),confirmation=useRef(null),clearButton=useRef(null)
 const {loadVisits,loadHistory}=personal
 const userId=user?.id
 useEffect(()=>{if(userId)void loadVisits()},[userId,loadVisits])
 const historyLoading=personal.pending.includes('history')
 useEffect(()=>{if(userId&&tab==='history'&&personal.historyStatus==='idle'&&!historyLoading)void loadHistory()},[userId,tab,personal.historyStatus,historyLoading,loadHistory])
 useEffect(()=>{if(confirm)confirmation.current?.focus()},[confirm])
 usePageTitle('Your discoveries | Unseen Jo')
 const visited=new Map(personal.visits.map(v=>[v.place_id,v]))
 const dates=useMemo(()=>Object.fromEntries(user?(account.data?.savedRecords||[]).map(r=>[r.place_id,r.created_at]):favorites.map((id,index)=>[id,String(index).padStart(10,'0')])),[user,account.data?.savedRecords,favorites])
 const collection=catalog.destinations.filter(p=>tab==='saved'?favorites.includes(p.id):visited.has(p.id))
 const filtered=filterPersonalPlaces(collection,{query,category,sort,dates:tab==='saved'?dates:Object.fromEntries(personal.visits.map(v=>[v.place_id,v.created_at]))},i18n.language)
 const byId=new Map(catalog.destinations.map(p=>[p.id,p])),busy=personal.pending.includes('clear')
 const unavailable=query||category?[]:(tab==='saved'?favorites:personal.visits.map(v=>v.place_id)).filter(id=>!byId.has(id))
 const loading=!!user&&account.status==='loading'||authStatus==='restoring',failed=!!user&&account.status==='error'
 const signin=`/auth?mode=login&returnTo=${encodeURIComponent('/my-discoveries'+(tab==='saved'?'':'?tab='+tab))}`
 function changeTab(value){setConfirm(false);setParams(value==='saved'?{}:{tab:value},{replace:true})}
 function keyboard(e,index){if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const d=(e.key==='ArrowRight'?1:-1)*(i18n.dir()==='rtl'?-1:1),next=e.key==='Home'?0:e.key==='End'?2:(index+d+3)%3;changeTab(names[next]);tabs.current[next]?.focus()}
 return <div className="personal-discoveries">
  <header className="personal-heading"><div><p className="personal-eyebrow">{tx('Your Jordan, at your pace')}</p><h1>{tx('Your Discoveries')}</h1><p>{tx('Save a little inspiration. Keep a record of your own adventures.')}</p></div><ButtonLink to="/explore" variant="secondary">{tx('Explore places')}</ButtonLink></header>
  {!user&&authStatus!=='restoring'&&<aside className="personal-signin"><div><strong>{tx('Your saved places stay on this device.')}</strong><p>{tx('Sign in to sync saves, record visits and keep your Surprise Me history across devices.')}</p></div><ButtonLink to={signin}>{tx('Sign In')}</ButtonLink></aside>}
  <div className="personal-tabs" role="tablist" aria-label={tx('Discoveries collection')}>{names.map((value,index)=>{const Icon=icons[index],count=index===0?favorites.length:index===1&&personal.visitsStatus==='ready'?personal.visits.length:null;return <button key={value} ref={node=>{tabs.current[index]=node}} type="button" id={`personal-tab-${value}`} role="tab" aria-controls={`personal-panel-${value}`} aria-selected={tab===value} tabIndex={tab===value?0:-1} onClick={()=>changeTab(value)} onKeyDown={e=>keyboard(e,index)}><Icon size={18} aria-hidden="true"/><span>{tx(labels[index])}</span>{count!==null&&<span className="personal-count">{tx(count)}</span>}</button>})}</div>
  {personal.error&&<p role="alert" className="personal-error">{tx(personal.error)}</p>}
  {personal.notice&&<p role="status" className="personal-notice">{tx(personal.notice)}</p>}
  {failed&&<button type="button" onClick={()=>void account.refresh(true)}>{tx('Retry')}</button>}
  {names.map(value=><section key={value} role="tabpanel" hidden={tab!==value} id={`personal-panel-${value}`} aria-labelledby={`personal-tab-${value}`} tabIndex={0} className="personal-panel">
   {tab!==value?null:catalog.status!=='ready'?<ContentState mode={catalog.mode} status={catalog.status} message={catalog.error} onAction={catalog.retry}/>:loading?<p role="status">{tx('Loading your saved places…')}</p>:failed?null:tab!=='saved'&&!user?<PersonalEmpty title={tx(tab==='visited'?'Keep your own travel journal':'Your next recommendation is waiting')}><p>{tx(tab==='visited'?'Sign in to record self-reported visits. No location tracking is used.':'Sign in to keep recommendations you receive through Surprise Me. Browsing a place does not add it to history.')}</p><ButtonLink to={signin}>{tx('Sign In')}</ButtonLink></PersonalEmpty>:<>
    <div className="personal-section-heading"><div><h2>{tx(labels[names.indexOf(tab)])}</h2><p>{tx(tab==='saved'?'Places you would like to explore.':tab==='visited'?'Visits are self-reported, not independently verified.':'Recommendations presented through Surprise Me. Page views are not recorded.')}</p></div>{user&&<button type="button" className="personal-quiet" disabled={personal.pending.length>0||pending.size>0} onClick={()=>{void account.refresh(true);void loadVisits(true);if(tab==='history')void loadHistory(null,true)}}>{tx('Refresh')}</button>}</div>
    {tab!=='history'&&<form className="personal-filters" onSubmit={e=>e.preventDefault()}><label><span>{tx('Search your places')}</span><div className="personal-search"><Search size={17} aria-hidden="true"/><input aria-label={tx('Search your places')} maxLength={160} value={query} onChange={e=>setQuery(e.target.value)} placeholder={tx('Name or location')} type="search"/>{query&&<button type="button" className="personal-search-clear" aria-label={tx('Clear search')} onClick={()=>setQuery('')}><X size={18} aria-hidden="true"/></button>}</div></label><label><span>{tx('Category')}</span><select aria-label={tx('Category')} value={category} onChange={e=>setCategory(e.target.value)}><option value="">{tx('All categories')}</option>{catalog.categories.map(c=><option value={c.slug} key={c.id}>{c.name}</option>)}</select></label><label><span>{tx('Sort by')}</span><select aria-label={tx('Sort by')} value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">{tx(tab==='saved'?'Recently saved':'Recently marked')}</option><option value="name">{tx('Name')}</option></select></label></form>}
    {tab==='visited'&&personal.visitsStatus!=='ready'?<p role="status">{tx(personal.visitsStatus==='error'?'Visits could not be loaded.':'Loading visits…')} {personal.visitsStatus==='error'&&<button type="button" onClick={()=>void loadVisits(true)}>{tx('Retry')}</button>}</p>:tab==='history'?<>
     {['loading','idle'].includes(personal.historyStatus)?<p role="status">{tx('Loading discovery history…')}</p>:personal.historyStatus==='error'?<button type="button" onClick={()=>void loadHistory(null,true)}>{tx('Retry')}</button>:personal.history.length===0?<PersonalEmpty title={tx('No recommendations recorded yet')}><p>{tx('Try Surprise Me while signed in. Your recommendations will appear here.')}</p><ButtonLink to="/surprise-me">{tx('Surprise Me')}</ButtonLink></PersonalEmpty>:<>
      <div className="personal-history-actions"><button ref={clearButton} type="button" className="personal-quiet" disabled={busy} onClick={()=>setConfirm(true)}><Trash2 size={16} aria-hidden="true"/>{tx('Clear discovery history')}</button></div>
      {confirm&&<div role="alertdialog" aria-labelledby="clear-history-title" aria-describedby="clear-history-description" ref={confirmation} tabIndex={-1} className="personal-confirm"><h3 id="clear-history-title">{tx('Clear discovery history?')}</h3><p id="clear-history-description">{tx('This removes recorded recommendations from your account. Saved places and visits are kept.')}</p><div><Button disabled={busy} onClick={async()=>{if(await personal.clear())setConfirm(false)}}>{tx(busy?'Clearing…':'Clear history')}</Button><Button variant="secondary" disabled={busy} onClick={()=>{setConfirm(false);clearButton.current?.focus()}}>{tx('Cancel')}</Button></div></div>}
      <div className="personal-grid">{personal.history.map(entry=>{const place=byId.get(entry.place_id);return place?<PersonalPlace key={entry.event_id} place={place} saved={favorites.includes(place.id)} onSave={()=>toggleFavorite(place.id)} pending={pending.has(place.id)} historyDate={entry.created_at}/>:<article key={entry.event_id} className="personal-unavailable"><h3>{tx('Destination unavailable')}</h3><p>{tx('This recommendation is no longer publicly available.')}</p><time dateTime={entry.created_at}>{formatDateTime(entry.created_at)}</time></article>})}</div>
      {personal.more&&<Button variant="secondary" disabled={personal.pending.includes('history')} onClick={()=>void loadHistory(personal.history.at(-1))}>{tx('Load more recommendations')}</Button>}
     </>}
    </>:filtered.length||unavailable.length?<div className="personal-grid">{filtered.map(place=><PersonalPlace key={place.id} place={place} saved={favorites.includes(place.id)} onSave={()=>toggleFavorite(place.id)} pending={pending.has(place.id)} visited={visited.get(place.id)} visitBusy={personal.pending.includes('visit:'+place.id)} canVisit={!!user&&(!place.prototype||place.prototype.actualStatus==='published')&&personal.visitsStatus==='ready'&&!personal.pending.includes('visits')} onVisit={(date,remove)=>personal.markVisit(place.id,date,remove)}/>) }{unavailable.map(id=><UnavailablePlace key={id} pending={tab==='saved'?pending.has(id):personal.pending.includes('visit:'+id)} onRemove={()=>tab==='saved'?toggleFavorite(id):void personal.markVisit(id,'',true)}/>)}</div>:<PersonalEmpty title={tx(query||category?'No places match your filters':tab==='saved'?'Your next discovery starts here':'No visited places yet')}><p>{tx(query||category?'Try another search or category.':tab==='saved'?'Save a place from Explore or Place Details. Your saved places will appear here.':'Mark a saved place as visited to build your own travel record.')}</p>{query||category?<Button variant="secondary" onClick={()=>{setQuery('');setCategory('')}}>{tx('Clear filters')}</Button>:<ButtonLink to="/explore">{tx('Explore places')}</ButtonLink>}</PersonalEmpty>}
   </>}
  </section>)}
 </div>
}
function PersonalEmpty({title,children}){return <div className="personal-empty"><Bookmark size={28} aria-hidden="true"/><h3>{title}</h3>{children}</div>}
function UnavailablePlace({onRemove,pending}){return <article className="personal-unavailable"><h3>{tx('Destination unavailable')}</h3><p>{tx('This place is no longer publicly available.')}</p><button className="personal-quiet" type="button" disabled={pending} onClick={onRemove}>{tx(pending?'Saving…':'Remove')}</button></article>}
function PersonalPlace({place,saved,onSave,pending,visited,visitBusy,canVisit,onVisit,historyDate}){
 const [editing,setEditing]=useState(false),[date,setDate]=useState(''),[dateError,setDateError]=useState(false),trigger=useRef(null)
 const [maxDate]=useState(()=>{const today=new Date();return [today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-')})
 async function submit(e){e.preventDefault();if(!validVisitDate(date)){setDateError(true);return}if(await onVisit(date,false)){setEditing(false);requestAnimationFrame(()=>trigger.current?.focus())}}
 return <article className="personal-place" data-place-id={place.id}>
  <Link to={placeHref(place)} className="personal-place-photo" aria-label={tx('View Place Details')+' — '+place.name}><AssetImage src={place.image} delivery={place.imageDelivery} widths="320,640,1280" sizes="auto, (max-width:600px) 90vw, (max-width:960px) 45vw, 360px" alt={place.alt||place.name} width="360" height="170" loading="lazy"/></Link>
  <div className="personal-place-body"><p className="personal-category">{tx(place.category)}</p><h3><Link to={placeHref(place)}>{place.name}</Link></h3>{place.translationFallback&&<p className="personal-date">{tx('Arabic content is unavailable or awaiting review; English source content is shown.')}</p>}<p className="personal-location"><MapPin size={15} aria-hidden="true"/>{place.city||tx('Location unavailable')}</p>
   {historyDate&&<p className="personal-date">{tx('Recommended')} <time dateTime={historyDate}>{formatDateTime(historyDate)}</time></p>}
   {visited&&<p className="personal-date"><Check size={15} aria-hidden="true"/>{tx('Self-reported visit')}{visited.visited_on&&<> · <time dateTime={visited.visited_on}>{new Intl.DateTimeFormat(locale(),{dateStyle:'medium',timeZone:'UTC'}).format(new Date(visited.visited_on+'T12:00:00Z'))}</time></>}</p>}
   <div className="personal-place-actions"><button type="button" disabled={pending} aria-pressed={saved} onClick={onSave}><Bookmark size={16} aria-hidden="true" fill={saved?'currentColor':'none'}/>{tx(pending?'Saving…':saved?'Remove from Saved Places':'Save Place')}</button>{onVisit&&canVisit&&<button ref={trigger} type="button" disabled={visitBusy} onClick={()=>visited?void onVisit('',true):setEditing(!editing)} aria-expanded={visited?undefined:editing}><Check size={16} aria-hidden="true"/>{tx(visitBusy?'Saving…':visited?'Remove visited status':'Mark as Visited')}</button>}</div>
   {editing&&!visited&&<form className="personal-visit-form" onSubmit={submit}><label>{tx('Visit date (optional)')}<input type="date" value={date} min="1900-01-01" max={maxDate} onChange={e=>{setDate(e.target.value);setDateError(false)}} aria-invalid={dateError||undefined}/></label>{dateError&&<p role="alert">{tx('Choose a valid date that is not in the future.')}</p>}<p>{tx('Visits are self-reported, not independently verified.')}</p><div><button disabled={visitBusy} type="submit">{tx(visitBusy?'Saving…':'Save visit')}</button><button type="button" disabled={visitBusy} onClick={()=>{setEditing(false);trigger.current?.focus()}}>{tx('Cancel')}</button></div></form>}
  </div>
 </article>
}
