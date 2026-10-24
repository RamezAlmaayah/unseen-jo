import {useEffect,useState} from 'react'
// UX throttle only; Supabase continues to enforce its server rate limits.
export function useEmailCooldown(scope='user'){
 const key=`unseen-jo-mail-cooldown-${scope}`
 const [until,setUntil]=useState(()=>{try{return Number(sessionStorage.getItem(key))||0}catch{return 0}})
 const [now,setNow]=useState(Date.now)
 useEffect(()=>{if(until<=Date.now())return;const timer=setInterval(()=>{const time=Date.now();setNow(time);if(time>=until)clearInterval(timer)},1000);return()=>clearInterval(timer)},[until])
 const start=()=>{const deadline=Date.now()+60000;setUntil(deadline);setNow(Date.now());try{sessionStorage.setItem(key,String(deadline))}catch{/* Storage is optional. */}}
 return {remaining:Math.max(0,Math.ceil((until-now)/1000)),start}
}
