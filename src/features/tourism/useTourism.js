import {useTranslation} from 'react-i18next'
import {localizeDestination} from '../../i18n/destinations.js'
import {tx} from '../../i18n/index.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { resolveDataMode } from './mode.js'
import { createTourismRepository } from './repository.js'
import { useDemoDestinations } from '../discovery/useDemoDestinations.js'
import { interests } from '../preferences/options.js'
import { withDemoCoordinates } from '../map/geography.js'
import {subscribeCatalogChanges} from './catalogEvents.js'

let repository
export async function getRepository() {
  if (repository) return repository
  const { getSupabaseClient } = await import('../../lib/supabase/client.js')
  return repository ??= createTourismRepository(getSupabaseClient())
}
export function currentDataMode() {
  try { return { mode: resolveDataMode(import.meta.env), error: null } }
  catch (error) { return { mode: 'supabase', error: error.message } }
}

// The legacy hook is disabled in live mode; no invisible demo download/fallback.
export function useTourism(demoSample = false, loadDemo = true, slug = null) {
  const {i18n}=useTranslation()
  const { mode, error: configError } = demoSample ? { mode: 'demo', error: null } : currentDataMode()
  const demo = useDemoDestinations(mode === 'demo' && loadDemo)
  const demoPlaces = useMemo(() => demo.destinations.map(withDemoCoordinates), [demo.destinations])
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${mode}:${slug ?? 'catalog'}:${attempt}`
  const [state, setState] = useState(()=>{
    const warm=slug===null?repository?.peekCatalog():repository?.peekPublishedPlaceBySlug(slug)
    if(warm!==undefined)return {...(slug===null?warm:{destinations:warm?[warm]:[],categories:warm?.categories??[]}),status:'ready',error:null,requestKey}
    return { status: 'loading', destinations: [], categories: [], error: null }
  })
  useEffect(()=>subscribeCatalogChanges(()=>{repository?.invalidate();setAttempt(value=>value+1)}),[])
  useEffect(() => {
    if (mode === 'demo') return
    let active = true
    async function load() {
      try {
        if (configError) throw new Error(configError)
        const repo = await getRepository()
        const place = slug === null ? null : await repo.fetchPublishedPlaceBySlug(slug)
        const catalog = slug === null ? await repo.fetchCatalog() : { destinations: place ? [place] : [], categories: place?.categories ?? [] }
        if (active) setState({ ...catalog, status: 'ready', error: null, requestKey })
      } catch (error) {
        if (active) setState({ status: 'error', destinations: [], categories: [], error: error.message, requestKey })
      }
    }
    load()
    return () => { active = false }
  }, [configError, mode, slug, requestKey])
  const retry = useCallback(() => {
    repository?.invalidate()
    setState({ status: 'loading', destinations: [], categories: [], error: null })
    setAttempt(value => value + 1)
  }, [])
  // A successful Admin save revalidates the same public resource in the
  // background. Keep its already-published snapshot mounted until the new read
  // completes, so open previews, selection and map instances survive the update.
  // A different route/data mode and explicit retry still use their own fallback.
  const sameResource=state.requestKey?.startsWith(`${mode}:${slug ?? 'catalog'}:`)
  const live = state.requestKey === requestKey || state.status==='ready'&&sameResource ? state : { status: 'loading', destinations: [], categories: [], error: null }
  const raw=mode==='demo'?demoPlaces:live.destinations
  const destinations=useMemo(()=>raw.map(p=>localizeDestination(p,i18n.language)),[raw,i18n.language])
  const categories=useMemo(()=>mode==='demo'?interests.map(i=>({id:i.value,slug:i.value,name:i18n.language==='ar-JO'?tx(i.label):i.label})):live.categories.map(c=>({...c,name:i18n.language==='ar-JO'?tx(c.name):c.name})),[mode,live.categories,i18n.language])
  return mode === 'demo' ? { ...demo, destinations, mode, categories }
    : { ...live,destinations,categories,mode,retry }
}
