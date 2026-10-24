import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
const {chromium}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const {default:AxeBuilder}=await import(pathToFileURL(join(tmpdir(),'unseen-jo-browser-check/node_modules/@axe-core/playwright/dist/index.mjs')))
const read=async p=>JSON.parse(await readFile(p,'utf8')),content=await read('supabase/content/phase04-completion.json'),arabic=await read('supabase/content/phase04l-arabic.json'),base=process.env.QA_BASE_URL||'http://127.0.0.1:4184'
const categoryIds={nature:'437effb5-2dff-4123-ab4f-a1bdbc275253',history:'2ca78305-d041-4108-b860-8f58d4d67338',culture:'6ac69bce-0264-4cef-b6c7-438772b75ee5',adventure:'76c091cd-4de2-4c00-b579-d8470ddc07c1'}
const categories=Object.entries(categoryIds).map(([slug,id])=>({slug,id,name:slug[0].toUpperCase()+slug.slice(1),is_active:true,sort_order:1}))
const stamp='2026-10-19T11:20:48.274507Z',rows=content.places.map(p=>({...p,status:'draft',is_demo:false,updated_at:stamp,primary_category_id:categoryIds[p.primary_category],place_categories:p.categories.map(slug=>({category_id:categoryIds[slug],categories:categories.find(c=>c.slug===slug)})),place_images:[],place_reviews:{location_kind:p.location_kind,coordinate_source:p.coordinate_source,location_reviewed:false,claims_reviewed:false,notes:p.coordinate_note},place_translations:[{...arabic.places.find(a=>a.slug===p.slug),place_id:p.id,locale:'ar-JO',source_updated_at:stamp,updated_at:stamp,editorial_status:'pending',reviewed_at:null,reviewed_by:null}]}))
const user={id:'00000000-0000-4000-8000-000000000001',email:'reviewer@example.test',email_confirmed_at:'2026-01-01',role:'authenticated',aud:'authenticated'},exp=Math.floor(Date.now()/1000)+3600,session={access_token:`${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify({sub:user.id,exp})).toString('base64url')}.fixture`,refresh_token:'fixture',expires_at:exp,expires_in:3600,token_type:'bearer',user}
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),results=[],missing=new Set(),errors=[],writes=[],a11y=[]
await mkdir('docs/screenshots/phase04l',{recursive:true})
async function setup(width,language,admin){const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(({language,session,admin})=>{if(!localStorage.getItem('unseen-jo-language'))localStorage.setItem('unseen-jo-language',language);if(admin)localStorage.setItem('unseen-jo-admin-auth',JSON.stringify(session))},{language,session,admin});await page.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',async route=>{const request=route.request(),url=new URL(request.url()),path=url.pathname,id=url.searchParams.get('id')?.replace('eq.','');let data
 if(path.endsWith('/auth/v1/user'))data=user
 else if(path.endsWith('/admin_cms_status'))data={version:4}
 else if(path.endsWith('/admin_overview'))data={total:6,draft:6,published:0,categories:4,recent:[]}
 else if(path.endsWith('/admin_publication_issues'))data=['Source and essential claims require an explicit review','Review a sourced Jordan location and its precision','An uploaded, rights-approved cover image is required']
 else if(path.endsWith('/categories'))data=categories
 else if(path.endsWith('/places')){if(url.searchParams.get('status')==='eq.published'){data=rows.map(p=>({...p,status:'published',place_translations:p.place_translations.map(t=>({...t,editorial_status:'reviewed'}))}));const slug=url.searchParams.get('slug')?.replace('eq.','');if(slug)data=data.filter(p=>p.slug===slug)}else data=id?rows.find(p=>p.id===id):rows}
 else if(path.endsWith('/place_reviews'))data=rows.find(p=>p.id===url.searchParams.get('place_id')?.replace('eq.',''))?.place_reviews||null
 else if(path.endsWith('/place_translations')&&request.method()==='GET')data=rows.flatMap(p=>p.place_translations)
 else if(path.endsWith('/place_translations')&&['POST','PATCH'].includes(request.method())){const body=request.postDataJSON();writes.push({path,body});data=[{...rows[0].place_translations[0],...body,updated_at:new Date().toISOString()}]}
 else if(path.endsWith('/place_images'))data=[]
 else if(path.endsWith('/admin_audit_logs'))data=[]
 else return route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({message:'Fixture prohibits unrelated operations'})})
 await route.fulfill({status:200,contentType:'application/json',headers:{'access-control-expose-headers':'content-range','content-range':`0-${Math.max(0,(data?.length||1)-1)}/${data?.length||1}`},body:JSON.stringify(data)})});return {context,page}}
async function inspect(page,name,lang){await page.locator('h1').first().waitFor();if(name.includes('admin-overview'))await page.locator('.admin-chart-panel').first().waitFor();await page.waitForTimeout(350);await page.evaluate(()=>document.fonts.ready);assert.equal(await page.locator('html').getAttribute('dir'),lang==='ar-JO'?'rtl':'ltr');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),name+' horizontal overflow');if(lang==='ar-JO'){const english=await page.evaluate(()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),out=[];while(w.nextNode()){const n=w.currentNode,e=n.parentElement;if(!e||!e.getClientRects().length||e.closest('script,style,[lang="en"],.original-legal-text,.admin-file-path,.technical-value,.maplibregl-ctrl-attrib,input,textarea'))continue;const t=n.textContent.trim();if(/[A-Za-z]{3}/.test(t)&&!/[\u0600-\u06ff]/.test(t)&&!t.includes('http'))out.push(t)}return out});english.forEach(t=>missing.add(t))}await page.screenshot({path:`docs/screenshots/phase04l/${name}.png`,fullPage:true,timeout:60000});results.push({name,status:'passed'})}

export {setup,browser,rows,base,errors,writes,writeFile,AxeBuilder,a11y,inspect,results,missing};
