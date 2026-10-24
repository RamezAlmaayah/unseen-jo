import {useEffect} from 'react'
import {useLocation} from 'react-router'
import {useTranslation} from 'react-i18next'
import {tx} from './index.js'
export default function DocumentLanguage(){const {pathname}=useLocation(),{i18n}=useTranslation();useEffect(()=>{if(pathname.startsWith('/admin'))document.title=`${tx('Administrator workspace')} | Unseen Jo`},[pathname,i18n.language]);return null}
