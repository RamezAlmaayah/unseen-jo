import {useEffect,useState,useRef} from 'react'
import {Link,useLocation,useNavigate} from 'react-router'
import {Bookmark,UserRound,Settings,LogOut} from 'lucide-react'
import i18n,{tx} from '../i18n/index.js'
import {useTranslation} from 'react-i18next'
import {usePageTitle} from '../i18n/usePageTitle.js'
import {useUserAuth,useUserAccount} from '../features/account/context.js'
import {accountError} from '../features/account/model.js'
import {getUserClient} from '../features/account/client.js'
import {saveProfile,uploadAvatar} from '../features/account/repository.js'
import {usePreviewFavorites} from '../features/discovery/usePreviewFavorites.js'
import FormField from '../components/ui/FormField.jsx'
import Button from '../components/ui/Button.jsx'
import PreferenceAccountActions from '../features/account/PreferenceAccountActions.jsx'
import PrivacyAccount from '../features/account/PrivacyAccount.jsx'

function ProfileEditor({user,account}){
 const [base,setBase]=useState(account.data.profile),[draft,setDraft]=useState({name:base.display_name||'',language:base.preferred_language}),[email,setEmail]=useState(user.email||''),[file,setFile]=useState(null),[removeAvatar,setRemoveAvatar]=useState(false)
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('')
 const locked=useRef(false),alive=useRef(true)
 useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[])
 async function run(operation){if(locked.current)return;locked.current=true;setBusy(true);setMessage('');setError('');try{await operation()}catch(e){setError(accountError(e))}finally{locked.current=false;setBusy(false)}}
 async function submit(event){
  event.preventDefault()
  if(draft.name.trim().length<2||draft.name.trim().length>100){setError('Enter your full name (2–100 characters).');return}
  await run(async()=>{
   const path=file?await uploadAvatar(user.id,file):removeAvatar?null:undefined
   const updated=await saveProfile(user.id,base,{...draft,avatar_path:path})
   if(!alive.current)return
   setBase(updated);await account.replaceProfile(updated);setFile(null);setRemoveAvatar(false);void i18n.changeLanguage(updated.preferred_language);setMessage('Profile saved.')
  })
 }
 return <><form onSubmit={submit} className="account-profile-form" aria-busy={busy}>
  <h2><Settings size={22} aria-hidden="true"/>{tx('Profile settings')}</h2><fieldset disabled={busy}><legend className="sr-only">{tx('Profile settings')}</legend>
  <FormField label="Full name" autoComplete="name" required maxLength={100} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/>
  <label className="account-select-label">{tx('Preferred language')}<select value={draft.language} onChange={e=>setDraft({...draft,language:e.target.value})}><option value="en">English</option><option value="ar-JO">العربية — الأردن</option></select></label>
  <FormField label="Profile photograph (optional)" type="file" accept="image/jpeg,image/png,image/webp" hint="JPEG, PNG or WebP · up to 2 MB" onChange={e=>{setFile(e.target.files?.[0]||null);setRemoveAvatar(false)}}/>
  {base.avatar_path&&<label className="account-checkbox"><input type="checkbox" checked={removeAvatar} onChange={e=>{setRemoveAvatar(e.target.checked);if(e.target.checked)setFile(null)}}/>{tx('Remove profile photograph')}</label>}
  <div className="inline-actions"><Button type="submit" disabled={busy}>{tx(busy?'Saving…':'Save profile')}</Button><Button variant="secondary" disabled={busy} onClick={()=>void run(async()=>{const fresh=await account.refresh(true);if(!fresh||!alive.current)return;setBase(fresh.profile);setDraft({name:fresh.profile.display_name||'',language:fresh.profile.preferred_language});setFile(null);setRemoveAvatar(false);setMessage('Account details reloaded. Unsaved profile edits were discarded.')})}>{tx('Discard edits and reload')}</Button></div></fieldset>
 </form>
 <section className="profile-email"><h2>{tx('Email and security')}</h2><p>{tx('Current email:')} <bdi>{user.email}</bdi></p>{user.new_email&&<p role="status">{tx('Email change awaiting confirmation:')} <bdi>{user.new_email}</bdi></p>}
 <form onSubmit={e=>{e.preventDefault();if(email.trim()===user.email)return;void run(async()=>{const client=await getUserClient(),{error}=await client.auth.updateUser({email:email.trim()},{emailRedirectTo:new URL('/auth/callback',window.location.origin).href});if(error)throw error;setMessage('Check the confirmation emails. Your address changes only after Supabase verifies the request.')})}}><FormField label="New email address" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/><Button type="submit" variant="secondary" disabled={busy||email.trim()===user.email}>{tx('Request email change')}</Button></form><Link to="/auth?mode=recovery&returnTo=/profile">{tx('Reset your password')}</Link></section>
 <p role="status" className="account-feedback">{tx(message)}</p>{error&&<p role="alert">{tx(error)}</p>}</>
}
export default function ProfilePage(){
 useTranslation();usePageTitle('Profile | Unseen Jo')
 const {user,status,signOut}=useUserAuth(),account=useUserAccount(),{favorites,profile}=usePreviewFavorites(),navigate=useNavigate(),location=useLocation()
 const [logoutError,setLogoutError]=useState(''),[ending,setEnding]=useState(false)
 if(status==='restoring')return <div className="profile-page"><p role="status">{tx('Restoring your account…')}</p></div>
 if(!user)return <div className="profile-page account-guest"><UserRound size={36} aria-hidden="true"/><h1>{tx('Your explorer space')}</h1><p>{tx('Sign in to keep your profile, saved places and discovery preferences together.')}</p><Link className="button button--primary" to="/auth?mode=login&returnTo=/profile">{tx('Sign in')}</Link><Link className="text-action" to="/explore">{tx('Keep exploring')}</Link></div>
 return <div className="profile-page account-profile"><header className="profile-heading"><p className="account-eyebrow">{tx('Your explorer space')}</p><h1>{tx('Profile')}</h1><p>{tx('Your details. Your discoveries.')}</p></header><p role="status">{tx(location.state?.message||'')}</p>
 <div className="profile-layout"><aside className="profile-summary">{account.data?.avatar?<img className="account-avatar" src={account.data.avatar} alt={tx('Your profile photograph')} width={128} height={128} decoding="async"/>:<div className="account-avatar account-avatar--empty"><UserRound size={48} aria-hidden="true"/></div>}<h2>{profile.name}</h2><p><bdi>{user.email}</bdi></p><Link className="profile-saved-summary" to="/my-discoveries"><Bookmark aria-hidden="true"/>{tx(favorites.length)} {tx('saved places')}</Link><button className="text-action" disabled={ending} onClick={async()=>{setEnding(true);try{await signOut();navigate('/',{replace:true})}catch(e){setLogoutError(accountError(e))}finally{setEnding(false)}}}><LogOut size={18} aria-hidden="true"/>{tx(ending?'Please wait…':'Sign out')}</button>{logoutError&&<p role="alert">{tx(logoutError)}</p>}</aside>
 <div className="profile-settings">{account.status==='loading'?<p role="status">{tx('Loading your profile…')}</p>:account.status==='ready'?<ProfileEditor key={user.id} user={user} account={account}/>:<button className="text-action" onClick={()=>void account.refresh(true)}>{tx('Reload account details')}</button>}
 <section className="profile-preferences"><h2>{tx('Discovery preferences')}</h2><p>{tx('Changes apply to this visit until you save them to your account.')}</p><Link to="/preferences">{tx('Edit discovery preferences')}</Link><PreferenceAccountActions/><button className="text-action" disabled={account.busy} onClick={()=>void account.refresh(true)}>{tx('Reload account details')}</button></section>
 <PrivacyAccount key={user.id} user={user}/></div></div></div>
}
