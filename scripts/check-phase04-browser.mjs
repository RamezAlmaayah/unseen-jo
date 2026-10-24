import assert from 'node:assert/strict'
import { mkdir,writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || join(tmpdir(),'unseen-jo-browser-check/node_modules/playwright/index.mjs')))
const browser=await chromium.launch({headless:true}), results=[], errors=[]
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4184'
const user={id:'00000000-0000-4000-8000-000000000001',email:'admin@example.test',aud:'authenticated',role:'authenticated'}
const place={id:'00000000-0000-4000-8000-000000000101',name:'Test destination',slug:'test-destination',status:'draft',updated_at:'2026-10-18T12:00:00Z',place_categories:[],place_images:[],issues:['Cover image missing'],review:null}
const token=`${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.fixture`
const session={access_token:token,refresh_token:'fixture',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user}
async function check(name,fn){await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
async function fixture(allowed=true){
  const p=await browser.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errors.push(e.message))
  await p.addInitScript(value=>localStorage.setItem('unseen-jo-admin-auth',JSON.stringify(value)),session)
  await p.route('**/maps/unseen-nature.json', r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#f1f7ed'}}]})}));await p.route('https://dkhwwvoplhfjccvjegty.supabase.co/**',async route=>{
    const url=new URL(route.request().url()), path=url.pathname
    let body=[],status=200
    if(path.endsWith('/user'))body=user
    else if(path.endsWith('/admin_cms_status')) { body=allowed?{version:4}:{message:'Administrator session required',code:'42501'};status=allowed?200:403 }
    else if(path.endsWith('/admin_overview'))body={total:6,draft:6,published:0,archived:0,categories:7,review:6,coordinates:6,covers:6,recent:[]}
    else if(path.endsWith('/categories'))body=[{id:'00000000-0000-4000-8000-000000000201',name:'Nature',slug:'nature',sort_order:0,is_active:true}]
    else if(path.endsWith('/places'))body=url.searchParams.has('id')?place:[place]
    else if(path.endsWith('/place_reviews'))body=null
    else if(path.endsWith('/admin_publication_issues'))body=place.issues
    else if(path.endsWith('/admin_save_place'))body=place.id
    await route.fulfill({status,contentType:'application/json',headers:{'content-range':'0-0/1'},body:JSON.stringify(body)})
  });return p
}
try{
  await mkdir('docs/screenshots/phase04',{recursive:true})
  await check('real hosted anonymous session renders sign-in without admin content',async()=>{
    const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/admin/places');await p.getByRole('heading',{name:'Sign in to content studio'}).waitFor();assert.equal(await p.getByRole('link',{name:'Create draft'}).count(),0);await p.close()
  })
  await check('authenticated ordinary account receives denial and no dashboard',async()=>{
    const p=await fixture(false);await p.goto(base+'/admin');await p.getByRole('heading',{name:'Administrator access unavailable'}).waitFor();assert.equal(await p.getByRole('navigation',{name:'Administration'}).count(),0);await p.close()
  })
  const p=await fixture()
  await check('authorized fixture renders responsive dashboard, destinations and editor',async()=>{
    await p.goto(base+'/admin');await p.getByRole('heading',{name:'Give these places a little attention'}).waitFor();await p.screenshot({path:'docs/screenshots/phase04/overview-1440.png',fullPage:true})
    await p.getByRole('link',{name:'Places',exact:true}).click();await p.getByRole('link',{name:'Test destination',exact:true}).click();await p.getByRole('heading',{name:'Test destination',exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:'Publish destination',exact:true}).isDisabled(),true)
    await p.screenshot({path:'docs/screenshots/phase04/editor-1440.png',fullPage:true})
    await p.setViewportSize({width:390,height:844});await p.screenshot({path:'docs/screenshots/phase04/editor-390.png',fullPage:true});const overflow=await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+2}).slice(0,12).map(e=>({tag:e.tagName,cls:String(e.className),right:e.getBoundingClientRect().right})));assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),JSON.stringify(overflow));
  })
  await check('new draft submits allowlisted payload through the SDK and navigates to saved record',async()=>{
    await p.goto(base+'/admin/places/new');await p.getByRole('heading',{name:'Create a place',exact:true}).waitFor();await p.getByLabel('Name',{exact:true}).fill('New QA destination');await p.getByLabel('Slug',{exact:true}).fill('new-qa-destination')
    const request=p.waitForRequest(r=>r.url().endsWith('/rpc/admin_save_place'));await p.getByRole('button',{name:'Save Draft',exact:true}).click();const payload=(await request).postDataJSON();assert.equal(payload.payload.name,'New QA destination');assert.equal(payload.payload.status,undefined);await p.waitForURL(`**/admin/places/${place.id}`)
  })
  await check('category, media, audit and empty states render without errors',async()=>{
    for(const [path,heading] of [['categories','Categories'],['media','Media library'],['audit','Audit log']]){await p.goto(`${base}/admin/${path}`);await p.getByRole('heading',{name:heading,exact:true}).waitFor()}
    assert.deepEqual(errors,[])
  })
  await writeFile('docs/validation/phase04-browser-tests.json',JSON.stringify({scope:'Real anonymous browser guard; authorized and denied sessions use intercepted HTTP fixtures, never real role grants',passed:results.length,results,errors},null,2)+'\n')
}finally{await browser.close()}
