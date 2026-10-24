import {tx} from '../../i18n/index.js'
import { useState } from 'react'
import {useUserAuth} from '../account/context.js'
import { initialPreferences } from './options'
import { PreferencesContext } from './context'

export function PreferencesProvider({ children }) {
  const {user}=useUserAuth()
  const scope=user?.id||'guest'
  const [store,setStore]=useState(()=>({scope:'guest',...readGuest()}))
  const active=store.scope===scope?store:{scope,...(scope==='guest'?readGuest():{preferences:initialPreferences,dirty:false})}
  const {preferences,dirty}=active
  function replacePreferences(next,edited=false){
    const value={scope,preferences:{...initialPreferences,...next},dirty:edited}
    setStore(value)
    if(scope==='guest')try{sessionStorage.setItem('unseen-jo-guest-preferences',JSON.stringify({preferences:value.preferences,dirty:edited}))}catch{/* In-memory fallback. */}
  }
  function updatePreference(key, value) {
    replacePreferences({ ...preferences, ...(key==='budget'?{totalBudget:''}:key==='availableTime'?{hoursAvailable:''}:{}),[key]: value },true)
  }
  function toggleInterest(value) {
    replacePreferences({ ...preferences, interests: preferences.interests.includes(value)
      ? preferences.interests.filter(interest => interest !== value)
      : [...preferences.interests, value] },true)
  }
  return <PreferencesContext.Provider value={{ preferences,dirty,replacePreferences,updatePreference,toggleInterest }}>{tx(children)}</PreferencesContext.Provider>
}
function readGuest(){try{const v=JSON.parse(sessionStorage.getItem('unseen-jo-guest-preferences'));if(v&&typeof v.preferences==='object'&&Array.isArray(v.preferences.interests))return {preferences:{...initialPreferences,...v.preferences},dirty:v.dirty===true}}catch{/* Safe defaults. */}return {preferences:initialPreferences,dirty:false}}
