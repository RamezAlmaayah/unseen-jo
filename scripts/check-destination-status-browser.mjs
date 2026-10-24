// Actual React/Chromium UI with isolated Auth and API fixtures. No hosted writes.
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {setup,browser,rows,base,errors} from './localization-browser-fixtures.mjs'
import ar from '../src/i18n/locales/ar-JO.json' with {type:'json'}
const results=[]
await mkdir('artifacts/destination-status',{recursive:true})
try {
 for(const [language,width] of [['en',1440],['ar-JO',390]]){
  const label=s=>language==='en'?s:ar[s]||s,{context,page}=await setup(width,language,true)
  const data=Array.from({length:24},(_,i)=>({...structuredClone(rows[i%rows.length]),id:`00000000-0000-4000-8000-${String(i+10).padStart(12,'0')}`,name:`Destination ${String(i).padStart(2,'0')}`,slug:`destination-${i}`}))
  const writes=[],target=data[0];let fail=false
  await page.route('https://dkhwwvoplhfjccvjegty.supabase.co/rest/v1/**',async route=>{
   const request=route.request(),url=new URL(request.url()),path=url.pathname
   const json=(body,status=200,count)=>route.fulfill({status,contentType:'application/json',headers:count==null?{}:{'access-control-expose-headers':'content-range','content-range':`0-${Math.max(0,body.length-1)}/${count}`},body:JSON.stringify(body)})
   if(path.endsWith('/places')){
    assert.equal(request.method(),'GET')
    const filter=url.searchParams.get('status')?.replace('eq.',''),offset=Number(url.searchParams.get('offset')||0),limit=Number(url.searchParams.get('limit')||20)
    const found=data.filter(p=>!filter||p.status===filter)
    return json(found.slice(offset,offset+limit),200,found.length)
   }
   if(path.endsWith('/admin_change_place_status')){
    const body=request.postDataJSON(),p=data.find(p=>p.id===body.target)
    writes.push(body)
    await new Promise(resolve=>setTimeout(resolve,150))
    if(fail){fail=false;return json({code:'40001',message:'Destination changed. Reload before changing status'},409)}
    assert.equal(body.expected_status,p.status);assert.equal(body.expected_updated_at,p.updated_at)
    assert.ok(['published','draft','archived'].includes(body.next_status))
    p.status=body.next_status
    return json({id:p.id,status:p.status,updated_at:p.updated_at,quick_version:`version-${writes.length}`})
   }
   return route.fallback()
  })
  await page.goto(base+'/admin/places')
  const control=()=>page.locator('.admin-place-status').first(),select=()=>control().getByRole('combobox'),save=()=>control().getByRole('button')
  await select().waitFor();assert.equal(await page.locator('.admin-place-status').count(),20)
  assert.deepEqual(await select().locator('option').evaluateAll(nodes=>nodes.map(n=>n.value)),['published','draft','archived'])
  assert.equal(await save().isDisabled(),true)
  for(const status of ['published','archived','draft','archived','published','draft']){
   const previous=writes.length
   await select().selectOption(status)
   assert.equal(writes.length,previous,'selection waits for explicit Save status')
   assert.equal(await save().isEnabled(),true)
   const response=page.waitForResponse(r=>r.url().endsWith('/admin_change_place_status'))
   await save().click();assert.equal(await select().isDisabled(),true);await response
   await page.waitForFunction(status=>document.querySelector('.admin-place-status select')?.value===status&&!document.querySelector('.admin-place-status select')?.disabled,status)
   assert.equal(target.status,status);assert.equal(writes.length,previous+1)
   await page.reload();await select().waitFor();assert.equal(await select().inputValue(),status)
  }
  fail=true;await select().selectOption('published');await save().click()
  await control().getByRole('alert').waitFor();assert.equal(target.status,'draft');assert.equal(await save().isEnabled(),true)
  await save().click();await page.waitForFunction(()=>document.querySelector('.admin-place-status select')?.value==='published'&&!document.querySelector('.admin-place-status select')?.disabled&&document.querySelector('.admin-place-status button')?.disabled)
  await page.getByRole('button',{name:label('Next page'),exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.admin-place-status').length===4)
  await page.getByRole('button',{name:label('Previous page'),exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.admin-place-status').length===20)
  await page.screenshot({path:`artifacts/destination-status/places-${language}-${width}.png`,fullPage:true})
  results.push({language,width,destinations:24,transitions:6,explicitSave:true,reloadPersistence:true,errorAndRetry:true,pagination:true,status:'passed'})
  await context.close()
 }
 assert.deepEqual(errors,[])
 console.log('PASS Admin → Places: English desktop and Arabic mobile; six transitions, explicit save, persistence, pagination, error/retry')
}finally{
 await browser.close()
 await writeFile('docs/validation/destination-status-browser.json',JSON.stringify({scope:'Actual Chromium/React Admin → Places; isolated authenticated API fixtures, not a real hosted Admin browser session',at:new Date().toISOString(),results,errors},null,2)+'\n')
}
