import {createContext,useContext} from 'react'
export const AuthContext=createContext(null)
export const AccountContext=createContext(null)
export const useUserAuth=()=>useContext(AuthContext)
export const useUserAccount=()=>useContext(AccountContext)
