import {useCallback,useEffect,useRef,useState} from 'react'
import {AccountContext,useUserAuth} from './context.js'
import {DemoDiscoveriesContext} from '../discovery/DemoDiscoveriesContext.js'
import {usePreferences} from '../preferences/usePreferences.js'
import {initialPreferences} from '../preferences/options.js'
import {accountError,preferenceFromRow,readGuestFavorites} from './model.js'
import {avatarUrl,clearAvatarCache,loadAccount,mergeGuestSaves,savePreferences,setSaved} from './repository.js'
import i18n,{LANGUAGE_KEY} from '../../i18n/index.js'

export default function UserAccountProvider({children}){
 const {user,status:authStatus}=useUserAuth(),id=user?.id||null
 const prefs=usePreferences(),prefsRef=useRef(prefs);prefsRef.current=prefs
 const [guest,setGuest]=useState(()=>readGuestFavorites(globalThis.localStorage))
 const [data,setData]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[conflict,setConflict]=useState(null)
 const active=id&&data?.id===id?data:null
 const owner=useRef(id);owner.current=id
 const epoch=useRef(0),inflight=useRef(null),lastLoad=useRef(0),pending=useRef(new Set()),initialized=useRef(null),acceptedVersion=useRef(null),preferenceSaving=useRef(false)
 const [busy,setBusy]=useState(false)
 const refresh=useCallback(async(force=false)=>{
  if(!id||inflight.current||pending.current.size||!force&&Date.now()-lastLoad.current<30000)return
  const ticket=++epoch.current;setError('')
  const op=(async()=>{
   try{
    let result=await loadAccount(id)
    if(owner.current!==id||ticket!==epoch.current)return
    const first=initialized.current!==id
    if(first){
     const merged=await mergeGuestSaves(id,readGuestFavorites(globalThis.localStorage))
     if(owner.current!==id||ticket!==epoch.current)return
     if(merged.length){result=await loadAccount(id);if(owner.current!==id||ticket!==epoch.current)return;setGuest(current=>{const next=current.filter(v=>!merged.includes(v));storeGuest(next);return next});setNotice('Your guest saves were added to your account.')}
    }
    const avatar=await avatarUrl(result.profile.avatar_path).catch(()=>'')
    if(owner.current!==id||ticket!==epoch.current)return
    setData({id,...result,avatar});lastLoad.current=Date.now()
    if(first){
     initialized.current=id
     // A deliberate browser language choice wins; fresh devices use the profile preference.
     try{if(!localStorage.getItem(LANGUAGE_KEY))void i18n.changeLanguage(result.profile.preferred_language)}catch{/* Keep the current in-memory language. */}
     acceptedVersion.current=result.preferences?.updated_at||null
     const saved=preferenceFromRow(result.preferences,initialPreferences),local=prefsRef.current
     // Guest edits are offered, never silently overwritten on sign-in.
     let guestPrefs=null;try{guestPrefs=JSON.parse(sessionStorage.getItem('unseen-jo-guest-preferences'))}catch{/* No guest state. */}
     if(guestPrefs?.dirty){local.replacePreferences(guestPrefs.preferences,true);if(saved&&JSON.stringify(saved)!==JSON.stringify(guestPrefs.preferences))setConflict(saved);else if(!saved)setNotice('Your guest preferences are ready. Save them to your account when you choose.')}
     else if(saved){local.replacePreferences(saved);setNotice('Your account preferences were restored.')}
    }else if((result.preferences?.updated_at||null)!==acceptedVersion.current){
     const saved=preferenceFromRow(result.preferences,initialPreferences)
     if(saved&&JSON.stringify(saved)!==JSON.stringify(prefsRef.current.preferences))setConflict(saved)
     else acceptedVersion.current=result.preferences?.updated_at||null
    }
    return {id,...result,avatar}
   }catch(e){if(owner.current===id&&ticket===epoch.current)setError(accountError(e))}
  })()
  inflight.current=op;try{return await op}finally{if(inflight.current===op)inflight.current=null}
 },[id])
 useEffect(()=>{
  const ticket=++epoch.current;inflight.current=null;initialized.current=null;acceptedVersion.current=null;preferenceSaving.current=false;lastLoad.current=0;pending.current.clear();clearAvatarCache()
  queueMicrotask(()=>{if(ticket===epoch.current){setData(null);setError('');setNotice('');setConflict(null);setBusy(false);if(id)void refresh(true)}})
  const onFocus=()=>{if(document.visibilityState==='visible')void refresh()}
  window.addEventListener('focus',onFocus);document.addEventListener('visibilitychange',onFocus)
  // Epoch invalidation intentionally cancels requests started by this lifecycle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return ()=>{++epoch.current;window.removeEventListener('focus',onFocus);document.removeEventListener('visibilitychange',onFocus)}
 },[id,refresh])
 function storeGuest(next){try{localStorage.setItem('unseen-jo-guest-saves',JSON.stringify(next))}catch{/* In-memory saves still work. */}}
 function toggleFavorite(place){
  if(authStatus==='restoring'){setError('Please wait while your account is restored.');return}
  if(!id){setGuest(current=>{const next=current.includes(place)?current.filter(v=>v!==place):[...current,place];storeGuest(next);return next});return}
  if(!active||pending.current.has(place))return
  const save=!active.saves.includes(place);pending.current.add(place);setError('')
  setData(current=>({...current,saves:save?[...current.saves,place]:current.saves.filter(v=>v!==place),savedRecords:save?[...(current.savedRecords||[]),{place_id:place,created_at:new Date().toISOString()}]:current.savedRecords?.filter(r=>r.place_id!==place)}))
  void setSaved(id,place,save).catch(e=>{if(owner.current===id){setData(current=>current?.id===id?{...current,saves:save?current.saves.filter(v=>v!==place):[...new Set([...current.saves,place])],savedRecords:save?current.savedRecords?.filter(r=>r.place_id!==place):[...(current.savedRecords||[]),...(active.savedRecords||[]).filter(r=>r.place_id===place)]}:current);setError(accountError(e))}}).finally(()=>{if(owner.current===id){pending.current.delete(place);setData(current=>current?{...current}:current)}})
 }
 async function persistPreferences(){
  if(!active||preferenceSaving.current||conflict)return
  preferenceSaving.current=true;setBusy(true);setError('')
  const captured={...prefs.preferences}
  try{const row=await savePreferences(captured,acceptedVersion.current);if(owner.current!==id)return;acceptedVersion.current=row.updated_at;setData(current=>({...current,preferences:row}));setConflict(null);acknowledgeGuestPreferences();setNotice('Discovery preferences saved to your account.')}
  catch(e){if(owner.current===id)setError(accountError(e))}finally{if(owner.current===id){preferenceSaving.current=false;setBusy(false)}}
 }
 const favorites=id?active?.saves||[]:guest
 const profile={name:active?.profile.display_name||user?.user_metadata?.full_name||'Explorer',email:user?.email||''}
 const value={status:id?(active?'ready':error?'error':'loading'):'guest',data:active,error,notice,conflict,busy,refresh,persistPreferences,
  useAccountPreferences:()=>{prefs.replacePreferences(conflict);acceptedVersion.current=active?.preferences?.updated_at||null;acknowledgeGuestPreferences();setConflict(null);setNotice('Your account preferences were restored.')},keepCurrentPreferences:()=>{acceptedVersion.current=active?.preferences?.updated_at||null;acknowledgeGuestPreferences();setConflict(null);setNotice('Current preferences kept for this visit. Your account settings are unchanged.')},
  replaceProfile:async updated=>{const avatar=await avatarUrl(updated.avatar_path);if(owner.current===id)setData(current=>({...current,profile:updated,avatar}))}}
 return <AccountContext.Provider value={value}><DemoDiscoveriesContext.Provider value={{favorites,toggleFavorite,profile,error,pending:pending.current,status:value.status,loadSampleCollection:ids=>{if(!id)setGuest(current=>{const next=[...new Set([...current,...ids])];storeGuest(next);return next})}}}>{children}</DemoDiscoveriesContext.Provider></AccountContext.Provider>
}
function acknowledgeGuestPreferences(){try{const value=JSON.parse(sessionStorage.getItem('unseen-jo-guest-preferences'));if(value)sessionStorage.setItem('unseen-jo-guest-preferences',JSON.stringify({...value,dirty:false}))}catch{/* No guest state to acknowledge. */}}
