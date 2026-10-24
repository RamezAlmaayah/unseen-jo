import assert from 'node:assert/strict'
import {readFile,readdir,writeFile} from 'node:fs/promises'
import {PGlite} from '@electric-sql/pglite'
import {postgis} from '@electric-sql/pglite-postgis'
import {privacyHandler} from '../supabase/functions/account-privacy/handler.js'
import {privacyQaEnabled} from '../src/features/account/privacyAvailability.js'
const db=new PGlite({extensions:{postgis}}),a='00000000-0000-4000-8000-000000000801',b='00000000-0000-4000-8000-000000000802',results=[]
async function check(name,fn){await fn();results.push(name);console.log('PASS '+name)}
async function as(id,sql,params=[]){await db.exec('begin;set local role authenticated');try{await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id]);return await db.query(sql,params)}finally{await db.exec('rollback')}}
try{
 await check('privacy UI cannot activate in production or on a public host',async()=>{
  assert.equal(privacyQaEnabled({DEV:false,VITE_PRIVACY_QA:'true'},'127.0.0.1'),false);assert.equal(privacyQaEnabled({DEV:true,VITE_PRIVACY_QA:'true'},'example.org'),false);assert.equal(privacyQaEnabled({DEV:true},'localhost'),false);assert.equal(privacyQaEnabled({DEV:true,VITE_PRIVACY_QA:'true'},'127.0.0.1'),true)
 })
 await db.exec(await readFile('supabase/tests/bootstrap.sql','utf8'));await db.exec('create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id) on delete cascade,not_after timestamptz)')
 for(const f of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+f,'utf8'))
 await db.query('insert into auth.users(id) values($1),($2)',[a,b])
 await db.exec('alter table public.profiles add column internal_secret text')
 await db.query("update public.profiles set internal_secret='never-export-this' where id=$1",[a])
 await db.exec(await readFile('supabase/content/phase02b-starter.sql','utf8'))
 const place=(await db.query('select id from places limit 1')).rows[0].id
 await db.query('insert into saved_places(user_id,place_id) values($1,$2)',[a,place]);await db.query('insert into user_visited_places(user_id,place_id) values($1,$2)',[a,place]);await db.query('insert into user_discovery_history(user_id,event_id,place_id) values($1,gen_random_uuid(),$2)',[a,place])
 await check('request/fulfillment RPCs cannot be executed by ordinary users; queue cannot be forged',async()=>{
  await assert.rejects(as(a,'select uj_request_account_deletion($1)',[b]));await assert.rejects(as(a,'select uj_fulfill_account_deletion($1)',[b]));await assert.rejects(as(a,'insert into account_privacy_requests(user_id) values($1)',[b]))
 })
 const id=(await db.query('select uj_request_account_deletion($1) r',[a])).rows[0].r.id
 await check('idempotent queue, owner-only status and export; no secrets',async()=>{
  assert.equal((await db.query('select uj_request_account_deletion($1) r',[a])).rows[0].r.id,id)
  assert.equal((await as(b,'select * from account_privacy_requests')).rows.length,0)
  const r=(await as(a,'select uj_export_account_data() r')).rows[0].r;assert.equal(r.profile.id,a);assert.equal(r.privacy_requests.length,1);assert.ok(!JSON.stringify(r).includes('password'))
  assert.ok(!JSON.stringify(r).includes('never-export-this'));assert.equal(r.profile.internal_secret,undefined)
  const other=(await as(b,'select uj_export_account_data() r')).rows[0].r;assert.equal(other.profile.id,b);assert.equal(other.saved_places.length,0);assert.equal(other.privacy_requests.length,0);assert.equal(other.recommendation_history.length,0)
  assert.equal((await db.query("select has_function_privilege('anon','public.uj_export_account_data()','execute') ok")).rows[0].ok,false)
  for(const name of ['uj_request_account_deletion(uuid)','uj_fulfill_account_deletion(uuid)']){assert.equal((await db.query("select has_function_privilege('authenticated',$1,'execute') ok",['public.'+name])).rows[0].ok,false);assert.equal((await db.query("select has_function_privilege('service_role',$1,'execute') ok",['public.'+name])).rows[0].ok,true)}
 })
 await check('owned orphan avatar blocks deletion atomically; no false completion',async()=>{
  await db.query("insert into storage.objects(bucket_id,name,owner_id) values('profile-avatars',$1,$2)",[a+'/old.webp',a]);await assert.rejects(db.query('select uj_fulfill_account_deletion($1)',[id]));assert.equal((await db.query('select status from account_privacy_requests where id=$1',[id])).rows[0].status,'pending');assert.equal((await db.query('select id from profiles where id=$1',[a])).rows.length,1)
 })
 await check('Admin deletion is refused',async()=>{
  await db.query("update user_roles set role='admin' where user_id in ($1,$2)",[a,b]);await assert.rejects(db.query('select uj_fulfill_account_deletion($1)',[id]));await assert.rejects(db.query('select uj_request_account_deletion($1)',[a]));await assert.rejects(db.query('select uj_request_account_deletion($1)',[b]));await db.query("update user_roles set role='user' where user_id=$1",[a])
 })
 await check('last Admin role removal, Auth deletion, truncation and counter tampering fail closed',async()=>{
  await assert.rejects(db.query("delete from user_roles where user_id=$1 and role='admin'",[b]));await assert.rejects(db.query("update user_roles set role='user' where user_id=$1",[b]));await assert.rejects(db.query('delete from auth.users where id=$1',[b]));await assert.rejects(db.exec('truncate public.user_roles'));await assert.rejects(as(b,'update unseen_private.admin_safety_count set total=100'));assert.equal((await db.query('select total::int n from unseen_private.admin_safety_count')).rows[0].n,1)
 })
 await check('partial cleanup plus unexpected FK failure never completes the request or partially deletes database records',async()=>{
  await db.query('delete from storage.objects where owner_id=$1',[a]);await db.exec('create table public.test_deletion_blocker(user_id uuid references auth.users(id))');await db.query('insert into public.test_deletion_blocker values($1)',[a]);await assert.rejects(db.query('select uj_fulfill_account_deletion($1)',[id]));assert.equal((await db.query('select status from account_privacy_requests where id=$1',[id])).rows[0].status,'pending');assert.equal((await db.query('select count(*)::int n from saved_places where user_id=$1',[a])).rows[0].n,1);await db.exec('drop table public.test_deletion_blocker')
 })
 await check('synthetic account deletion cascades, preserves other accounts and blocks stale-token avatar uploads',async()=>{
  await db.query('delete from storage.objects where owner_id=$1',[a]);await db.query('select uj_fulfill_account_deletion($1)',[id]);assert.equal((await db.query('select * from profiles where id=$1',[a])).rows.length,0);assert.equal((await db.query('select * from profiles where id=$1',[b])).rows.length,1);const r=(await db.query('select * from account_privacy_requests where id=$1',[id])).rows[0];assert.equal(r.status,'completed');assert.equal(r.user_id,null);await assert.rejects(as(a,"insert into storage.objects(bucket_id,name) values('profile-avatars',$1)",[a+'/stale.webp']))
  for(const table of ['saved_places','user_visited_places','user_discovery_history'])assert.equal((await db.query(`select count(*)::int n from ${table} where user_id=$1`,[a])).rows[0].n,0)
  assert.equal((await db.query('select id from places where id=$1',[place])).rows.length,1)
  await assert.rejects(db.query('select uj_fulfill_account_deletion($1)',[id]));assert.equal((await db.query('select status from account_privacy_requests where id=$1',[id])).rows[0].status,'completed')
 })
 await check('server handler validates identity, confirmation, CORS, MFA, target injection and service errors',async()=>{
  let calls=0,wrong=false,mfa=false,fail=false
  const client={auth:{getUser:async()=>({data:{user:{id:b,email:'fixture@example.invalid',factors:mfa?[{status:'verified'}]:[]}}}),signInWithPassword:async()=>wrong?{error:{}}:{data:{user:{id:b}}},signOut:async()=>({})},rpc:async(_name,args)=>{calls++;assert.equal(args.target,b);return fail?{error:{}}:{data:{id:'request',status:'pending'}}}}
  const handle=privacyHandler({createClient:()=>client,url:'fixture',key:'public',serviceKey:'server-only',origins:['https://example.org']})
  const req=(body,origin='https://example.org',auth=true)=>handle(new Request('https://fixture.invalid',{method:'POST',headers:{origin,...(auth?{authorization:'Bearer fixture'}:{})},body:JSON.stringify(body)}))
  assert.equal((await req({password:'fixture',confirm:true},'https://evil.invalid')).status,403);assert.equal((await req({},undefined,false)).status,401)
  assert.equal((await req({password:'fixture',confirm:false})).status,400);assert.equal((await req({password:'fixture',confirm:true,target:a})).status,400)
  wrong=true;assert.equal((await req({password:'fixture',confirm:true})).status,403);wrong=false;mfa=true;assert.equal((await req({password:'fixture',confirm:true})).status,403);mfa=false;assert.equal(calls,0)
  fail=true;assert.equal((await req({password:'fixture',confirm:true})).status,503);fail=false;const r=await req({password:'fixture',confirm:true});assert.equal(r.status,200);assert.equal((await r.json()).request.status,'pending')
  assert.equal((await req(null)).status,400);assert.equal((await req([])).status,400);assert.equal((await req({password:'x'.repeat(4096),confirm:true})).status,413)
  const malformed=await handle(new Request('https://fixture.invalid',{method:'POST',headers:{authorization:'Bearer fixture'},body:'{'}));assert.equal(malformed.status,400)
 })
}finally{await db.close();await writeFile('docs/validation/account-privacy-security.json',JSON.stringify({scope:'Disposable PGlite synthetic accounts and injected Edge clients; no hosted mutations',results},null,2))}
