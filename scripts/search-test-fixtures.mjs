import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {syntheticImage} from './synthetic-image-fixture.mjs'
import {destinationAliases} from '../src/features/search/destinationSearch.js'
const snapshot=JSON.parse(await readFile('docs/validation/phase05-public-snapshot.json','utf8')),stamp='2026-10-21T10:00:00Z'
export const fixtureUser='00000000-0000-4000-8000-000000000801'
const user={id:fixtureUser,email:'search-fixture@example.invalid',aud:'authenticated',role:'authenticated',email_confirmed_at:stamp,user_metadata:{full_name:'Search fixture'},app_metadata:{provider:'email'}}
const session={user,access_token:Buffer.from('{}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:user.id,role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.fixture',refresh_token:'fixture-only',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer'}
export async function searchFixture(browser,lang,width,{admin=false,account=false,allowed=true}={}){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage(),requests=[],errors=[],fail={list:false},delays={}
 const categories=snapshot.categories,rows=Array.from({length:45},(_,i)=>{
  const id=`00000000-0000-4000-8000-${String(800+i).padStart(12,'0')}`,name=i===44?'Beyond Page Target':i<6?snapshot.rows[i].name:`Remote Destination ${i+1}`,category=categories[i%2],arName=i===44?'وجهة بعيدة':i<6?snapshot.rows[i].place_translations?.[0]?.name:`موقع اختبار ${i+1}`
  return {...snapshot.rows[i%6],id,name,slug:i<6?snapshot.rows[i].slug:`remote-destination-${i+1}`,city:i===44?'Irbid':snapshot.rows[i%6].city,region:i===44?'Northern Region':null,status:i%2?'published':'draft',updated_at:stamp,place_images:[],place_categories:[{category_id:category.id,categories:category}],place_reviews:[],place_translations:[{locale:'ar-JO',place_id:id,name:arName,city:null,region:null,description:'وصف اختباري مستقل لا يغيّر أي سجل حقيقي.',source_updated_at:stamp,updated_at:stamp,editorial_status:i%2?'pending':'reviewed'}]}
 })
 page.on('pageerror',e=>errors.push(e.message))
 await context.addInitScript(({lang,admin,account,session})=>{localStorage.setItem('unseen-jo-language',lang);if(admin)localStorage.setItem('unseen-jo-admin-auth',JSON.stringify(session));if(account)localStorage.setItem('unseen-jo-user-auth',JSON.stringify(session));window.searchDocument=crypto.randomUUID()},{lang,admin,account,session})
 await context.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname,method=req.method();requests.push({path,method,query:url.search,at:Date.now()})
  const json=(data,status=200,count)=>route.fulfill({status,contentType:'application/json',headers:count===undefined?{}:{'content-range':`0-${Math.max(0,count-1)}/${count}`,'access-control-expose-headers':'content-range'},body:JSON.stringify(data)})
  if(path.endsWith('/auth/v1/user'))return json(user)
  if(path.endsWith('/admin_cms_status'))return json(allowed?{version:4}:{code:'42501',message:'Administrator session required'},allowed?200:403)
  if(path.endsWith('/admin_publication_issues'))return json([])
  if(path.endsWith('/place_reviews'))return json(null)
  if(path.endsWith('/profiles'))return json({id:user.id,display_name:'Search fixture',avatar_path:null,preferred_language:lang,updated_at:stamp})
  if(path.endsWith('/user_preferences'))return json([])
  if(path.endsWith('/saved_places')){assert.equal(url.searchParams.get('user_id'),'eq.'+user.id);return json(snapshot.rows.map(p=>({place_id:p.id,created_at:stamp})))}
  if(path.endsWith('/user_visited_places')){assert.equal(url.searchParams.get('user_id'),'eq.'+user.id);return json(snapshot.rows.map(p=>({place_id:p.id,visited_on:null,created_at:stamp})))}
  if(path.endsWith('/categories'))return json(categories)
  if(path.endsWith('/places')){
   if(!admin){assert.equal(url.searchParams.get('status'),'eq.published');let data=snapshot.rows;const ids=url.searchParams.get('id');if(ids?.startsWith('in.'))data=data.filter(p=>ids.includes(p.id));return json(data)}
   assert.ok(allowed,'unauthorized requests must never reach the Admin data query')
   const id=url.searchParams.get('id')?.startsWith('eq.')?url.searchParams.get('id').slice(3):null;if(id)return json(rows.find(r=>r.id===id)||null)
   if(fail.list)return json({code:'fixture_error',message:'Fixture network error'},503)
   const patterns=[...url.searchParams].filter(([k])=>/^search_match_\d+\.or$/.test(k)).map(([,v])=>JSON.parse(v.match(/"(?:\\.|[^"\\])*"/u)[0]))
   const delay=patterns.map(p=>delays[p]||0).reduce((a,b)=>Math.max(a,b),0);if(delay)await new Promise(r=>setTimeout(r,delay))
   let data=rows.filter(p=>patterns.every(pattern=>{const re=new RegExp(pattern,'iu');return [p.name,p.slug,p.city,p.region,...p.place_translations.flatMap(t=>[t.name,t.city,t.region]),...(destinationAliases[p.slug]||[])].filter(Boolean).some(v=>re.test(v))}))
   const status=url.searchParams.get('status')?.slice(3),category=url.searchParams.get('place_categories.category_id')?.slice(3),review=url.searchParams.get('review_match.editorial_status')?.slice(3)
   if(status)data=data.filter(p=>p.status===status);if(category)data=data.filter(p=>p.place_categories.some(c=>c.category_id===category));if(review)data=data.filter(p=>p.place_translations.some(t=>t.editorial_status===review))
   if(url.searchParams.get('id')==='is.null')data=[]
   const count=data.length,offset=Number(url.searchParams.get('offset')||0),limit=Number(url.searchParams.get('limit')||20);data=data.sort((a,b)=>url.searchParams.get('order')?.startsWith('name.asc')?a.name.localeCompare(b.name):a.id.localeCompare(b.id)).slice(offset,offset+limit)
   return json(data,200,count)
  }
  if(path.includes('/storage/v1/object/sign/')&&method==='POST'){const body=req.postDataJSON();return json(body.paths?body.paths.map(path=>({path,signedURL:'/object/sign/place-images/'+path+'?token=fixture'})):{signedURL:'/object/sign/place-images/fixture?token=fixture'})}
  if(path.includes('/storage/v1/'))return route.fulfill({status:200,contentType:'image/png',body:syntheticImage})
  throw Error('Unexpected fixture request '+method+' '+path)
 })
 return {context,page,requests,errors,rows,categories,fail,delays}
}
