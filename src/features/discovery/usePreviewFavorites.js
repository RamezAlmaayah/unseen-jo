import { useContext,useSyncExternalStore } from 'react'
import { DemoDiscoveriesContext } from './DemoDiscoveriesContext'
import {prototypeOwner} from '../prototype/runtime.js'
import {subscribeCatalogChanges} from '../tourism/catalogEvents.js'
import {privateSavesSnapshot,privateSavedIds,subscribePrivateSaves,togglePrivateSave} from '../prototype/favorites.js'

// Legacy hook name retained for public components. UserAccountProvider supplies
// persistent guest saves and owner-protected account saves through this context.
export function usePreviewFavorites() {
  const context = useContext(DemoDiscoveriesContext)
  const owner=useSyncExternalStore(subscribeCatalogChanges,prototypeOwner,()=>null)
  const snapshot=useSyncExternalStore(subscribePrivateSaves,()=>privateSavesSnapshot(owner),()=>'[]')
  if (!context) throw new Error('Demo discoveries must be used inside their provider.')
  if(!owner)return context
  const local=privateSavedIds(snapshot)
  return {...context,favorites:[...new Set([...context.favorites,...local])],toggleFavorite:id=>{if(context.favorites.includes(id)&&!local.includes(id))context.toggleFavorite(id);else togglePrivateSave(owner,id)}}
}
