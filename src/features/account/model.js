export function safeReturn(value){
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||(value.includes('\\')||[...value].some(c=>c.charCodeAt(0)<=32)))return '/profile'
 try{const u=new URL(value,'https://unseen.invalid');if(u.origin!=='https://unseen.invalid'||/^\/(auth|login|register|forgot-password|admin)(\/|$)/.test(u.pathname)||/%(?:2f|5c|0[ad])/i.test(value))return '/profile';return u.pathname+u.search}catch{return '/profile'}
}
export function validateAuth(values,mode){
 const errors={}
 if(mode==='register'&&(!values.name?.trim()||values.name.trim().length<2||values.name.trim().length>100))errors.name='Enter your full name (2–100 characters).'
 if(mode!=='reset'&&(!values.email||values.email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())))errors.email='Enter a valid email address.'
 if(!['recovery','confirmation'].includes(mode)){
  if(!values.password)errors.password='Enter your password.'
  else if(mode!=='login'&&(values.password.length<12||!/[a-z]/i.test(values.password)||!/[0-9]/.test(values.password)))errors.password='Use at least 12 characters, including a letter and a number.'
  if(mode!=='login'&&values.confirm!==values.password)errors.confirm='Passwords must match.'
 }
 return errors
}
export function accountError(error){
 if(new Set(['Choose a JPEG, PNG or WebP image smaller than 2 MB.','Choose a valid photograph.','Choose an image between 32 pixels and 40 megapixels.','Image preparation failed.']).has(error?.message))return error.message
 if(error?.code==='40001')return 'These details changed on another device. Reload before saving.'
 const code=error?.code||''
 if(code==='invalid_credentials')return 'Email or password is incorrect.'
 if(code==='email_not_confirmed')return 'Confirm your email before signing in.'
 if(['over_email_send_rate_limit','over_request_rate_limit'].includes(code)||error?.status===429)return 'Too many attempts. Please wait a few minutes and try again.'
 if(['weak_password','same_password'].includes(code))return 'Choose a stronger password that differs from your current password.'
 if(['otp_expired','flow_state_expired','flow_state_not_found'].includes(code))return 'This link has expired or has already been used. Sign in if your email is confirmed, or request a new link.'
 if(['bad_code_verifier','pkce_code_verifier_not_found'].includes(code))return 'Automatic sign-in needs the browser where you requested this link. If your email is confirmed, sign in with your password.'
 if(['invalid_callback','validation_failed','bad_jwt','invalid_token_response','bad_oauth_state'].includes(code))return 'This account link is invalid or incomplete. Use the full link from your email or request a new one.'
 if(code==='access_denied')return 'Sign-in was cancelled or denied. You can try again.'
 if(code==='user_already_exists')return 'An account may already exist. Try signing in or resetting your password.'
 return 'The account service could not complete this request. Check your connection and try again.'
}
export const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
export function readGuestFavorites(storage){try{const v=JSON.parse(storage?.getItem('unseen-jo-guest-saves')||'[]');return [...new Set(Array.isArray(v)?v.filter(id=>typeof id==='string'&&/^[a-z0-9-]{1,80}$/i.test(id)):[])].slice(0,2000)}catch{return []}}
export function preferenceFromRow(row,defaults){
 if(row?.discovery_settings&&Object.keys(row.discovery_settings).length)return {...defaults,...row.discovery_settings}
 if(!row)return null
 const city=(row.starting_city||'').trim().toLowerCase(),availableTime=({30:'30-min',120:'2-hours',240:'4-hours',480:'full-day'})[row.available_minutes]||''
 return {...defaults,startingLocation:['amman','ajloun','irbid','salt','madaba','aqaba'].includes(city)?city:'',interests:(row.user_preference_categories||[]).map(x=>x.categories?.slug).filter(Boolean),availableTime,hoursAvailable:availableTime?'':row.available_minutes?String(row.available_minutes/60):'',budget:row.budget_max_jod==null&&Number(row.budget_min_jod)>=30?'over-30':'',totalBudget:row.budget_max_jod!=null?String(row.budget_max_jod):'',travelGroup:row.travel_group||'',transportation:row.transportation||''}
}
