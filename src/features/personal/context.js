import {createContext,useContext} from 'react'
export const PersonalContext=createContext(null)
export const usePersonalDiscoveries=()=>useContext(PersonalContext)
