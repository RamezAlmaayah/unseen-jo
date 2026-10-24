import {getUserClient} from './client.js'
import {uuid} from './model.js'
const checked=result=>{if(result.error)throw result.error;return result.data}
export async function loadAccount(id){
 const client=await getUserClient()
 const [profile,preferences,savedRecords]=await Promise.all([
  client.from('profiles').select('id,display_name,avatar_path,preferred_language,updated_at').eq('id',id).single().then(checked),
  client.from('user_preferences').select('*,user_preference_categories(categories(slug))').eq('user_id',id).maybeSingle().then(checked),
  (async()=>{const result=[];for(let start=0;;start+=500){const page=checked(await client.from('saved_places').select('place_id,created_at').eq('user_id',id).order('place_id').range(start,start+499));result.push(...page);if(page.length<500)return result}})(),
 ])
 return {profile,preferences,saves:savedRecords.map(r=>r.place_id),savedRecords}
}
export async function mergeGuestSaves(id,ids){
 const client=await getUserClient(),valid=ids.filter(uuid),merged=[]
 for(let start=0;start<valid.length;start+=100){
  // Verify current publication, rather than trusting local IDs; RLS also enforces it.
  const rows=checked(await client.from('places').select('id').in('id',valid.slice(start,start+100)).eq('status','published').eq('is_demo',false))
  if(rows.length){checked(await client.from('saved_places').upsert(rows.map(r=>({user_id:id,place_id:r.id})),{onConflict:'user_id,place_id',ignoreDuplicates:true}));merged.push(...rows.map(r=>r.id))}
 }
 return merged
}
export async function setSaved(id,place,save){
 const client=await getUserClient()
 if(!uuid(place))throw Error('Only published destinations can be saved to an account.')
 checked(await (save?client.from('saved_places').upsert({user_id:id,place_id:place},{onConflict:'user_id,place_id',ignoreDuplicates:true}):client.from('saved_places').delete().eq('user_id',id).eq('place_id',place)))
}
export async function saveProfile(id,profile,values){
 const client=await getUserClient()
 const rows=checked(await client.from('profiles').update({display_name:values.name.trim(),preferred_language:values.language,...(values.avatar_path!==undefined?{avatar_path:values.avatar_path}:{})}).eq('id',id).eq('updated_at',profile.updated_at).select('id,display_name,avatar_path,preferred_language,updated_at'))
 if(!rows.length)throw {code:'40001'}
 return rows[0]
}
export async function savePreferences(settings,version){
 const client=await getUserClient()
 return checked(await client.rpc('uj_save_preferences',{settings,expected_version:version||null}))
}
const avatarCache=new Map()
export function clearAvatarCache(){avatarCache.clear()}
export async function avatarUrl(path){
 if(!path)return ''
 const cached=avatarCache.get(path)
 if(cached?.expires>Date.now())return cached.url
 const client=await getUserClient(),data=checked(await client.storage.from('profile-avatars').createSignedUrl(path,300))
 avatarCache.set(path,{url:data.signedUrl,expires:Date.now()+240000});return data.signedUrl
}
export async function uploadAvatar(id,file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024)throw Error('Choose a JPEG, PNG or WebP image smaller than 2 MB.')
 const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer()),signature=String.fromCharCode(...bytes)
 if(!(bytes[0]===255&&bytes[1]===216||bytes[0]===137&&signature.slice(1,4)==='PNG'||signature.startsWith('RIFF')&&signature.slice(8,12)==='WEBP'))throw Error('Choose a valid photograph.')
 const bitmap=await createImageBitmap(file)
 try{
  if(bitmap.width<32||bitmap.height<32||bitmap.width*bitmap.height>40000000)throw Error('Choose an image between 32 pixels and 40 megapixels.')
  const canvas=document.createElement('canvas'),scale=Math.min(1,768/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale)
  canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height)
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.9));if(!blob)throw Error('Image preparation failed.')
  const path=`${id}/${crypto.randomUUID()}.webp`,client=await getUserClient()
  checked(await client.storage.from('profile-avatars').upload(path,blob,{contentType:'image/webp',cacheControl:'3600',upsert:false}));return path
 }finally{bitmap.close()}
}
