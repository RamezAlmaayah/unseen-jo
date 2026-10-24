import assert from 'node:assert/strict'
import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises'
import {PGlite} from '@electric-sql/pglite'
import {postgis} from '@electric-sql/pglite-postgis'
import {initialPreferences} from '../src/features/preferences/options.js'
import {validateAuth,safeReturn,readGuestFavorites,preferenceFromRow} from '../src/features/account/model.js'
import {consumeUserCallback} from '../src/features/account/callback.js'
const db=new PGlite({extensions:{postgis}}),results=[]
const a='00000000-0000-4000-8000-000000000601',b='00000000-0000-4000-8000-000000000602',sid='00000000-0000-4000-8000-000000000603'
async function check(name,fn){await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
async function as(id,sql,params=[],commit=false){await db.exec(`begin;set local role ${id?'authenticated':'anon'}`);try{await db.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)",[id||'',JSON.stringify({sub:id,session_id:sid})]);const value=await db.query(sql,params);if(commit)await db.exec('commit');return value}finally{await db.exec('rollback')}}
const reject=(id,sql,params=[])=>assert.rejects(as(id,sql,params))
try{
 await check('all migrations replay; signup trigger creates an ordinary profile without trusting role metadata',async()=>{
  await db.exec(await readFile('supabase/tests/bootstrap.sql','utf8'));await db.exec('create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz)')
  for(const f of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+f,'utf8'))
  await db.exec(await readFile('supabase/content/phase02b-starter.sql','utf8'))
  await db.query('insert into auth.users(id,raw_user_meta_data) values($1,$2),($3,$4)',[a,{full_name:'First Explorer',role:'admin'},b,{full_name:'Second Explorer',role:'admin'}])
  assert.deepEqual((await db.query('select distinct role from user_roles')).rows.map(r=>r.role),['user'])
  assert.equal((await db.query('select count(*) n from profiles')).rows[0].n,2)
 })
 await check('owner profile policies, column grants and avatar paths prevent cross-user access and privilege escalation',async()=>{
  await reject(null,'select * from profiles')
  assert.deepEqual((await as(a,'select id from profiles')).rows.map(r=>r.id),[a])
  assert.equal((await as(a,"update profiles set display_name='Intruder' where id=$1 returning id",[b])).rows.length,0)
  await reject(a,'update profiles set id=$1 where id=$2',[b,a]);await reject(a,"insert into user_roles(user_id,role) values($1,'admin')",[a])
  await reject(a,'update profiles set avatar_path=$1 where id=$2',[b+'/photo.webp',a])
  await reject(a,"update profiles set preferred_language='xx' where id=$1",[a])
  await as(a,"update profiles set display_name='Updated Explorer',preferred_language='ar-JO' where id=$1",[a],true)
 })
 await check('preference save is atomic, owner-scoped, normalized and version checked',async()=>{
  await reject(null,'select uj_save_preferences($1,null)',[initialPreferences])
  const row=(await as(a,'select uj_save_preferences($1,null) value',[{...initialPreferences,interests:['history','nature'],hoursAvailable:'3.5',totalBudget:'25',strict:{budget:true}}],true)).rows[0].value
  assert.equal(row.available_minutes,210);assert.equal(row.budget_max_jod,25);assert.equal(row.discovery_settings.strict.budget,true)
  assert.equal((await as(b,'select * from user_preferences')).rows.length,0)
  assert.equal((await as(b,'select * from user_preference_categories')).rows.length,0)
  await reject(a,'select uj_save_preferences($1,null)',[initialPreferences])
  const next=(await as(a,'select uj_save_preferences($1,$2) value',[initialPreferences,row.updated_at],true)).rows[0].value
  assert.equal(next.discovery_settings.hoursAvailable,'');assert.equal((await as(a,'select * from user_preference_categories')).rows.length,1)
  await reject(a,'select uj_save_preferences($1,$2)',[initialPreferences,row.updated_at])
 })
 await check('invalid preferences cannot forge fields, active categories, bounds or booleans',async()=>{
  const stamp=(await db.query('select updated_at from user_preferences where user_id=$1',[a])).rows[0].updated_at
  for(const patch of [{role:'admin'},{budget:null},{interests:['not-real']},{strict:{budget:'true'}},{strict:{role:true}},{hoursAvailable:'169'},{totalBudget:'-1'},{startingLocation:'gps:private'},{interests:[{role:'admin'}]}])await reject(a,'select uj_save_preferences($1,$2)',[{...initialPreferences,...patch},stamp])
  await reject(b,'insert into user_preferences(user_id,discovery_settings) values($1,$2)',[a,initialPreferences])
 })
 await check('saved places enforce owner, unique identity and published-only insertion',async()=>{
  const pid=(await db.query('select id from places limit 1')).rows[0].id
  await reject(a,'insert into saved_places(user_id,place_id) values($1,$2)',[a,pid])
  // Disposable synthetic publication: test fixture only, never hosted content.
  await db.exec('alter table places disable trigger user');await db.query("update places set status='published' where id=$1",[pid]);await db.exec('alter table places enable trigger user')
  await as(a,'insert into saved_places(user_id,place_id) values($1,$2) on conflict do nothing',[a,pid],true)
  await as(a,'insert into saved_places(user_id,place_id) values($1,$2) on conflict do nothing',[a,pid],true)
  assert.equal((await as(a,'select * from saved_places')).rows.length,1)
  assert.equal((await as(b,'select * from saved_places')).rows.length,0)
  await reject(b,'insert into saved_places(user_id,place_id) values($1,$2)',[a,pid])
  assert.equal((await as(b,'delete from saved_places where user_id=$1 returning *',[a])).rows.length,0)
  await as(a,'delete from saved_places where user_id=$1',[a],true)
 })
 await check('private avatar Storage remains owner-only; ordinary users cannot enter Admin RPCs',async()=>{
  await as(a,"insert into storage.objects(bucket_id,name) values('profile-avatars',$1)",[a+'/photo.webp'],true)
  assert.equal((await as(a,"select * from storage.objects where bucket_id='profile-avatars'")).rows.length,1)
  assert.equal((await as(b,"select * from storage.objects where bucket_id='profile-avatars'")).rows.length,0)
  assert.equal((await as(null,'select * from storage.objects')).rows.length,0)
  await reject(b,"insert into storage.objects(bucket_id,name) values('profile-avatars',$1)",[a+'/other.webp'])
  await reject(a,'select admin_overview()');await reject(a,"select admin_save_place('{}','{}',null)")
  assert.equal((await as(a,'select * from admin_audit_logs')).rows.length,0)
 })
 await check('redirects, credentials validation, guest storage corruption and legacy preferences are handled safely',async()=>{
  for(const path of ['https://evil.test','//evil.test','/\\evil','/admin','/auth/callback','/%2fevil','/profile\n'])assert.equal(safeReturn(path),'/profile')
  assert.equal(safeReturn('/places/ajloun-forest?from=auth'),'/places/ajloun-forest?from=auth')
  assert.deepEqual(validateAuth({name:'Explorer',email:'guest@example.org',password:'LongPassword123',confirm:'LongPassword123'},'register'),{})
  assert.equal(Object.keys(validateAuth({name:'',email:'bad',password:'short',confirm:'different'},'register')).length,4)
  assert.deepEqual(readGuestFavorites({getItem:()=>'{bad'}),[])
  assert.deepEqual(readGuestFavorites({getItem:()=>JSON.stringify([a,a,null,{id:a},'../../private'])}),[a])
  assert.equal(preferenceFromRow({budget_max_jod:0,available_minutes:120},initialPreferences).totalBudget,'0')
 })
 await check('callbacks scrub tokens before verification, are idempotent and accept a later distinct callback',async()=>{
  let exchanges=0,scrubbed=false
  const client={auth:{exchangeCodeForSession:async()=>{assert.ok(scrubbed);exchanges++;return {data:{redirectType:'recovery'},error:null}},getUser:async()=>({data:{user:{id:a,email_confirmed_at:'2026-10-20'}},error:null})}}
  const href='https://unseen.test/auth/callback?code=test&flow=recovery&returnTo=%2Fprofile',replace=path=>{assert.equal(path,'/auth/callback');scrubbed=true}
  const [one,two]=await Promise.all([consumeUserCallback(client,href,replace),consumeUserCallback(client,href,replace)])
  assert.equal(exchanges,1);assert.equal(one.recovery,true);assert.deepEqual(one,two)
  await consumeUserCallback(client,'https://unseen.test/auth/callback?code=second',replace);assert.equal(exchanges,2)
  await assert.rejects(consumeUserCallback({auth:{}},'https://unseen.test/auth/callback?error=denied',replace))
 })
 await check('callback distinguishes absent PKCE storage, missing details, supported token types and optional flow selector',async()=>{
  const verified=async()=>({data:{user:{id:a,email_confirmed_at:'2026-10-20'}},error:null}),replace=()=>{}
  const missing={auth:{exchangeCodeForSession:async()=>({error:{code:'pkce_code_verifier_not_found'}})}}
  assert.equal((await consumeUserCallback(missing,'https://unseen.test/auth/callback?code=fixture',replace)).status,'signin_required')
  const bare={auth:{getSession:async()=>({data:{session:null}})}}
  assert.equal((await consumeUserCallback(bare,'https://unseen.test/auth/callback',replace)).status,'no_link')
  assert.equal((await consumeUserCallback({auth:{getSession:async()=>({data:{session:{}}}),getUser:verified}},'https://unseen.test/auth/callback',replace)).status,'already_signed_in')
  for(const type of ['signup','email','magiclink','recovery','email_change']){
   const client={auth:{verifyOtp:async p=>{assert.equal(p.type,type);return {data:{},error:null}},getUser:verified}}
   assert.equal((await consumeUserCallback(client,`https://unseen.test/auth/callback?token_hash=fixture&type=${type}`,replace)).status,'verified')
  }
  const flow='00000000-0000-4000-8000-000000000666'
  const client={auth:{exchangeCodeForSession:async(code,options)=>{assert.equal(code,'fixture');assert.equal(options.flowId,flow);return {data:{redirectType:null},error:null}},getUser:verified}}
  const result=await consumeUserCallback(client,`https://unseen.test/auth/callback?code=fixture&sb_flow_id=${flow}&flow=recovery`,replace)
  assert.equal(result.recovery,false,'query label alone cannot establish recovery authorization')
  await assert.rejects(consumeUserCallback({auth:{}},'https://unseen.test/auth/callback?token_hash=fixture&type=invite',replace))
 })
}finally{await db.close();await mkdir('docs/validation',{recursive:true});await writeFile('docs/validation/phase06-unit-database.json',JSON.stringify({scope:'Unit tests and disposable PostgreSQL/PostGIS. Auth sessions and Storage simulated; no hosted users/content modified.',passed:results.length,results},null,2)+'\n')}
