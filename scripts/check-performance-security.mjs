import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {createAdminAccessController} from '../src/features/admin/accessController.js'
import {createTourismRepository} from '../src/features/tourism/repository.js'
import {notifyPublicCatalogChange} from '../src/features/tourism/catalogEvents.js'
import {catalogVersion} from '../src/features/tourism/catalogEvents.js'
import {createAdminRepository} from '../src/features/admin/repository.js'
import {createClient} from '@supabase/supabase-js'
const results=[];async function check(name,fn){await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
const user={id:'admin-a',email:'a@example.test'}
function authFixture(){let clock=0,userReads=0,permissionReads=0,current=user,denied=false,hold,blocked=false
 const client={auth:{getUser:async()=>{userReads++;if(blocked)await new Promise(r=>hold=r);return {data:{user:current},error:null}}},rpc:async()=>{permissionReads++;return {error:denied?{message:'Denied'}:null}}}
 const controller=createAdminAccessController(client,{now:()=>clock})
 return {controller,reads:()=>({userReads,permissionReads}),advance:n=>clock+=n,deny:()=>denied=true,switchUser:u=>current=u,block:()=>blocked=true,release:()=>{blocked=false;hold?.()}}
}
await check('same-user SIGNED_IN/token recovery coalesces; no checking state within cooldown',async()=>{
 const f=authFixture(),states=[];f.controller.subscribe(()=>states.push(f.controller.getSnapshot().access));await f.controller.verify();const allowed=f.controller.getSnapshot();for(const event of ['SIGNED_IN','TOKEN_REFRESHED','USER_UPDATED'])f.controller.authChanged(event,{user});await f.controller.verify();assert.equal(f.controller.getSnapshot(),allowed);assert.deepEqual(f.reads(),{userReads:1,permissionReads:1});assert.deepEqual(states,['allowed'])
 f.advance(31000);await Promise.all([f.controller.verify(),f.controller.verify(),f.controller.verify()]);assert.deepEqual(f.reads(),{userReads:2,permissionReads:2});assert.deepEqual(states,['allowed'])
})
await check('sign-out and account switches clear private UI immediately; stale requests cannot restore it',async()=>{
 const f=authFixture();await f.controller.verify();f.advance(31000);f.block();const pending=f.controller.verify();f.controller.authChanged('SIGNED_OUT',null);assert.equal(f.controller.getSnapshot().access,'signedout');assert.equal(f.controller.getSnapshot().user,null);f.release();await pending;assert.equal(f.controller.getSnapshot().access,'signedout')
 const other={id:'admin-b',email:'b@example.test'};f.switchUser(other);f.controller.authChanged('SIGNED_IN',{user:other});assert.equal(f.controller.getSnapshot().access,'checking');assert.equal(f.controller.getSnapshot().user,null);await f.controller.verify();assert.equal(f.controller.getSnapshot().user.id,'admin-b')
})
await check('permission revocation and forced checks still fail closed',async()=>{
 const f=authFixture();await f.controller.verify();f.deny();await f.controller.verify({force:true});assert.equal(f.controller.getSnapshot().access,'denied');assert.equal(f.controller.getSnapshot().user,null)
})
const place={id:'id',slug:'test-place',name:'Place',status:'published',is_demo:false,place_categories:[],place_images:[{storage_path:'id/photo.jpg',is_cover:true,sort_order:0,alt_text:'Actual fixture'}]},category={id:'category',name:'Nature',slug:'nature'}
function publicFixture(){let clock=0,reads=0,signs=0,fail=false
 const chain={select:()=>chain,eq:()=>chain,order:()=>chain,range:()=>chain,limit:()=>chain,retry:()=>chain,abortSignal:async()=>{reads++;return {data:[place],error:fail?{message:'Network failure'}:null}}}
 const client={from:table=>table==='categories'?{select:()=>({eq:()=>({order:()=>({order:()=>({retry:()=>({abortSignal:async()=>({data:[category],error:null})})})})})})}:chain,storage:{from:()=>({createSignedUrls:async paths=>{signs++;return {data:paths.map(path=>({path,signedUrl:'https://example.test/signed-'+signs})),error:null}}})}}
 return {repo:createTourismRepository(client,{now:()=>clock}),reads:()=>reads,signs:()=>signs,advance:n=>clock+=n,fail:()=>fail=true}
}
await check('concurrent public reads deduplicate and warm synchronous snapshots avoid loading-only mounts',async()=>{
 const f=publicFixture();assert.equal(f.repo.peekCatalog(),undefined);const [a,b]=await Promise.all([f.repo.fetchCatalog(),f.repo.fetchCatalog()]);assert.equal(a.destinations,b.destinations);assert.equal(f.reads(),1);assert.equal(f.signs(),1);assert.equal(f.repo.peekCatalog().destinations,a.destinations);assert.equal(f.repo.peekPublishedPlaceBySlug('test-place'),a.destinations[0])
})
await check('catalog TTL revalidates while still-valid signed image URLs remain stable',async()=>{
 const f=publicFixture(),first=(await f.repo.fetchPublishedPlaces())[0].image;f.advance(61000);assert.equal(f.repo.peekCatalog(),undefined);assert.equal((await f.repo.fetchPublishedPlaces())[0].image,first);assert.equal(f.reads(),2);assert.equal(f.signs(),1);f.advance(300000);assert.notEqual((await f.repo.fetchPublishedPlaces())[0].image,first);assert.equal(f.signs(),2)
})
await check('Admin mutation invalidation clears warm catalog, detail and signing caches; network errors are not retained',async()=>{
 const f=publicFixture();await f.repo.fetchCatalog();notifyPublicCatalogChange();assert.equal(f.repo.peekCatalog(),undefined);await f.repo.fetchPublishedPlaceBySlug('test-place');assert.equal(f.signs(),2);f.repo.invalidate();f.fail();await assert.rejects(f.repo.fetchPublishedPlaces());await assert.rejects(f.repo.fetchPublishedPlaces());assert.equal(f.reads(),4)
})
await check('real SDK query builders invalidate public cache after successful Admin writes, not read RPCs',async()=>{
 const f=publicFixture();await f.repo.fetchCatalog()
 const client=createClient('https://example.invalid','sb_publishable_fixture',{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:async input=>new Response(JSON.stringify(String(input).includes('/rpc/')?null:[{place_id:'id',locale:'ar-JO',updated_at:'next'}]),{headers:{'Content-Type':'application/json'}})}}),admin=createAdminRepository(client),start=catalogVersion()
 await admin.publicationIssues('id');assert.equal(catalogVersion(),start);assert.ok(f.repo.peekCatalog())
 await admin.saveTranslation({id:'id',updated_at:'source'},{name:'عربي'},{updated_at:'previous'});assert.equal(catalogVersion(),start+1);assert.equal(f.repo.peekCatalog(),undefined)
 await admin.publishLocalized({id:'id',updated_at:'source'},{updated_at:'translation'});assert.equal(catalogVersion(),start+2)
})
await writeFile('docs/validation/performance-security-tests.json',JSON.stringify({scope:'Local access controller, concurrency, identity isolation, TTL, signing and real SDK builder integration tests; no hosted writes',passed:results.length,results},null,2)+'\n')
