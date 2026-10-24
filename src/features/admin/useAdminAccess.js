import {useEffect,useMemo,useSyncExternalStore} from 'react'
import {createAdminAccessController} from './accessController.js'
export function useAdminAccess(client){
 const controller=useMemo(()=>createAdminAccessController(client),[client])
 const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot)
 useEffect(()=>controller.start(),[controller])
 return {...state,verify:controller.verify}
}
