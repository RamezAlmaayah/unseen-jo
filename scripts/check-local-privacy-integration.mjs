// PREPARED runner: requires the real, isolated Docker stack and local Edge serve.
// Refuses hosted targets; credentials remain in memory. No cleanup/reset of shared data.
import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {readFile,writeFile} from 'node:fs/promises'
import {spawnSync} from 'node:child_process'
import {createClient} from '@supabase/supabase-js'
import {assertWorkspace,api,cli,localEnv,localFetch,project,root} from './local-privacy-environment.mjs'
const evidence={scope:'Real local Supabase only; runner never uses repository .env or hosted keys',status:'BLOCKED',results:[]}
const container='supabase_db_'+project,uuid=v=>{assert.match(v,/^[a-f0-9-]{36}$/);return v}
function docker(args){const r=spawnSync('docker',args,{env:localEnv(),encoding:'utf8',windowsHide:true,timeout:20000});if(r.error||r.status!==0)throw Error('Local Docker operation failed; output suppressed');return r.stdout.trim()}
function sql(query){return docker(['exec',container,'psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-At','-c',query])}
async function check(name,fn){await fn();evidence.results.push({name,status:'PASS'});console.log('PASS '+name)}
const client=(key,token)=>createClient(api,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:localFetch,...(token?{headers:{Authorization:'Bearer '+token}}:{})}})
try{
 await assertWorkspace()
 assert.equal(docker(['inspect','--format','{{index .Config.Labels "com.supabase.cli.project"}}',container]),project)
 const status=cli(['status','--output','json']);if(status.status!==0)throw Error('Local Supabase status unavailable')
 let env=JSON.parse(status.stdout);env=env.data||env.result||env
 if(env.API_URL!==api||!env.ANON_KEY||!env.SERVICE_ROLE_KEY)throw Error('Unexpected local status format or target; refusing credentials')
 const marker=JSON.parse(await readFile(root+'/isolation.json','utf8'))
 // First run must be empty of Auth and tourism data; later runs require our guard.
 const guard=sql("select coalesce(to_regclass('unseen_private.local_privacy_test_guard')::text,'')")
 if(!guard){assert.equal(sql('select count(*) from auth.users'),'0');assert.equal(sql('select count(*) from public.places'),'0');sql(`create table unseen_private.local_privacy_test_guard(project text primary key);insert into unseen_private.local_privacy_test_guard values('${project}')`)}else{assert.equal(sql('select project from unseen_private.local_privacy_test_guard'),project);assert.equal(sql('select count(*) from auth.users'),'0','Interrupted/prior fixture identities require reviewed local cleanup; refusing a second destructive run')}
 assert.equal(marker.project,project)
 // Do not create accounts until the actual Edge runtime is answering unauthenticated requests.
 const probe=await localFetch(api+'/functions/v1/account-privacy',{method:'POST',headers:{apikey:env.ANON_KEY,'Content-Type':'application/json'},body:'{}'});assert.equal(probe.status,401,'Serve the isolated Edge Function first')
 const admin=client(env.SERVICE_ROLE_KEY),run=randomUUID(),password='Local-'+randomUUID()+'-9x',users={}
 await check('disposable password, passwordless and two Admin identities created locally',async()=>{
  for(const role of ['a','b','passwordless','admin1','admin2']){const r=await admin.auth.admin.createUser({email:`privacy-${run}-${role}@example.invalid`,...(role==='passwordless'?{}:{password}),email_confirm:true,user_metadata:{local_privacy_fixture:true}});assert.ok(!r.error,'Local identity creation failed');users[role]=uuid(r.data.user.id)}
  for(const role of ['admin1','admin2'])sql(`insert into public.user_roles(user_id,role) values('${users[role]}','admin') on conflict do nothing`)
 })
 const login=client(env.ANON_KEY),auth=await login.auth.signInWithPassword({email:`privacy-${run}-a@example.invalid`,password});assert.ok(!auth.error);const token=auth.data.session.access_token,a=client(env.ANON_KEY,token)
 const request=(secret=password,extra={})=>localFetch(api+'/functions/v1/account-privacy',{method:'POST',headers:{apikey:env.ANON_KEY,Authorization:'Bearer '+token,Origin:'http://127.0.0.1:4196','Content-Type':'application/json'},body:JSON.stringify({password:secret,confirm:true,...extra})})
 let requestId
 await check('identity verification, duplicate HTTP requests, request ownership and export',async()=>{
  assert.equal((await request('Wrong-password-9x')).status,403);assert.equal((await request(password,{target:users.b})).status,400)
  const r=await request();assert.equal(r.status,200);requestId=uuid((await r.json()).request.id)
  const duplicates=await Promise.all([request(),request()]);for(const r of duplicates){assert.equal(r.status,200);assert.equal((await r.json()).request.id,requestId)}
  const exportResult=await a.rpc('uj_export_account_data');assert.ok(!exportResult.error);assert.equal(exportResult.data.profile.id,users.a);assert.ok(!JSON.stringify(exportResult.data).includes(password))
  const b=client(env.ANON_KEY);await b.auth.signInWithPassword({email:`privacy-${run}-b@example.invalid`,password});const rows=await b.from('account_privacy_requests').select('id').eq('id',requestId);assert.ok(!rows.error);assert.equal(rows.data.length,0)
  assert.ok((await b.rpc('uj_fulfill_account_deletion',{request_id:requestId})).error)
 })
 const paths=[users.a+'/one.png',users.a+'/two.png'],png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN9sAAAAASUVORK5CYII=','base64')
 await check('real Storage cleanup is separate: remaining files block database deletion',async()=>{
  for(const path of paths)assert.ok(!(await a.storage.from('profile-avatars').upload(path,png,{contentType:'image/png'})).error)
  assert.ok((await admin.rpc('uj_fulfill_account_deletion',{request_id:requestId})).error)
  assert.ok(!(await admin.storage.from('profile-avatars').remove([paths[0]])).error)
  assert.ok((await admin.rpc('uj_fulfill_account_deletion',{request_id:requestId})).error)
  const rows=await a.from('account_privacy_requests').select('status').eq('id',requestId).single();assert.equal(rows.data.status,'pending')
 })
 await check('database failure after completed Storage cleanup rolls back; retry succeeds',async()=>{
  assert.ok(!(await admin.storage.from('profile-avatars').remove([paths[1]])).error)
  sql(`create table unseen_private.local_privacy_blocker(user_id uuid references auth.users(id));insert into unseen_private.local_privacy_blocker values('${users.a}')`)
  assert.ok((await admin.rpc('uj_fulfill_account_deletion',{request_id:requestId})).error)
  assert.equal(sql(`select count(*) from public.profiles where id='${users.a}'`),'1')
  sql('drop table unseen_private.local_privacy_blocker')
  const r=await admin.rpc('uj_fulfill_account_deletion',{request_id:requestId});assert.ok(!r.error);assert.equal(r.data,true)
  assert.equal(sql(`select count(*) from auth.users where id='${users.a}'`),'0');assert.equal(sql(`select count(*) from public.profiles where id='${users.a}'`),'0')
  assert.ok((await admin.rpc('uj_fulfill_account_deletion',{request_id:requestId})).error)
  assert.ok((await a.storage.from('profile-avatars').upload(users.a+'/stale.png',png,{contentType:'image/png'})).error)
 })
 await check('both Admins and the last Admin are protected',async()=>{
  for(const role of ['admin1','admin2'])assert.ok((await admin.rpc('uj_request_account_deletion',{target:users[role]})).error)
  sql(`delete from public.user_roles where user_id='${users.admin1}' and role='admin'`)
  assert.throws(()=>sql(`delete from public.user_roles where user_id='${users.admin2}' and role='admin'`))
  assert.equal(sql("select count(*) from public.user_roles where role='admin'"),'1')
 })
 evidence.status='PASS';evidence.remaining=['Passwordless/MFA alternative deletion proof is not implemented','Managed Storage concurrency, JWT expiry and platform permissions still need full test matrix','Account/provider retention and manual operator process remain owner decisions']
}catch{evidence.status=evidence.results.length?'FAIL':'BLOCKED';evidence.reason='Local prerequisites or an integration assertion failed; no credentials/output exposed. Inspect the isolated stack locally. No hosted fallback.';process.exitCode=2}
finally{await writeFile('docs/validation/local-privacy-integration.json',JSON.stringify(evidence,null,2));console.log(evidence.status+' real local Supabase integration')}
