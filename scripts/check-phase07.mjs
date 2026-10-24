import assert from 'node:assert/strict'
import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises'
import {PGlite} from '@electric-sql/pglite'
import {postgis} from '@electric-sql/pglite-postgis'
import {validVisitDate,filterPersonalPlaces} from '../src/features/personal/model.js'
const db=new PGlite({extensions:{postgis}}),results=[]
const a='00000000-0000-4000-8000-000000000701',b='00000000-0000-4000-8000-000000000702',event='00000000-0000-4000-8000-000000000703'
async function check(name,fn){await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
async function as(id,sql,params=[],commit=false){await db.exec(`begin;set local role ${id?'authenticated':'anon'}`);try{await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id||'']);const r=await db.query(sql,params);if(commit)await db.exec('commit');return r}finally{await db.exec('rollback')}}
const reject=(id,sql,args=[])=>assert.rejects(as(id,sql,args))
let place,draft
try{
 await check('complete additive migration replay and existing ordinary role creation',async()=>{
  await db.exec(await readFile('supabase/tests/bootstrap.sql','utf8'));await db.exec('create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz)')
  for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+file,'utf8'))
  await db.exec(await readFile('supabase/content/phase02b-starter.sql','utf8'))
  await db.query('insert into auth.users(id,raw_user_meta_data) values($1,$2),($3,$2)',[a,{full_name:'Isolated fixture',role:'admin'},b])
  const rows=(await db.query('select id from places order by slug limit 2')).rows;place=rows[0].id;draft=rows[1].id
  // Synthetic publication in disposable PostgreSQL only; never used against hosted content.
  await db.exec('alter table places disable trigger user');await db.query("update places set status='published' where id=$1",[place]);await db.exec('alter table places enable trigger user')
  assert.deepEqual((await db.query('select distinct role from user_roles')).rows.map(r=>r.role),['user'])
 })
 await check('guest cannot read or write private visit/history tables',async()=>{
  for(const table of ['user_visited_places','user_discovery_history']){await reject(null,`select * from ${table}`);await reject(null,`delete from ${table}`)}
 })
 await check('visits are owner-only, unique and independent from saves and feedback',async()=>{
  const sql='insert into user_visited_places(user_id,place_id,visited_on) values($1,$2,$3) on conflict do nothing'
  await as(a,sql,[a,place,'2026-10-01'],true);await as(a,sql,[a,place,null],true)
  assert.equal((await as(a,'select * from user_visited_places')).rows.length,1)
  assert.equal((await as(b,'select * from user_visited_places')).rows.length,0)
  await reject(b,sql,[a,place,null]);await reject(a,sql,[a,draft,null])
  assert.equal((await as(b,'delete from user_visited_places where user_id=$1 returning *',[a])).rows.length,0)
  assert.equal((await db.query('select count(*) n from saved_places')).rows[0].n,0)
  assert.equal((await db.query('select count(*) n from recommendation_feedback')).rows[0].n,0)
 })
 await check('optional date constraints and immutable visit ownership prevent forgery',async()=>{
  await reject(a,'update user_visited_places set visited_on=current_date+1')
  await reject(a,"update user_visited_places set visited_on='1800-01-01'")
  await reject(a,'update user_visited_places set user_id=$1',[b]);await reject(a,'update user_visited_places set place_id=$1',[draft])
  await as(a,'update user_visited_places set visited_on=null where place_id=$1',[place],true)
  assert.equal((await as(a,'select visited_on from user_visited_places')).rows[0].visited_on,null)
 })
 await check('history idempotency, published-only insert and server timestamp integrity',async()=>{
  const sql='insert into user_discovery_history(user_id,event_id,place_id) values($1,$2,$3) on conflict do nothing'
  await as(a,sql,[a,event,place],true);await as(a,sql,[a,event,place],true)
  assert.equal((await as(a,'select * from user_discovery_history')).rows.length,1)
  await reject(b,sql,[a,crypto.randomUUID(),place]);await reject(a,sql,[a,crypto.randomUUID(),draft])
  await reject(a,'insert into user_discovery_history(user_id,event_id,place_id,created_at) values($1,$2,$3,now())',[a,crypto.randomUUID(),place])
  await reject(a,'update user_discovery_history set place_id=$1',[draft])
 })
 await check('keyset pagination remains deterministic at identical timestamps',async()=>{
  const stamp='2026-10-21T09:00:00Z'
  for(let i=10;i<36;i++)await db.query('insert into user_discovery_history(user_id,event_id,place_id,created_at) values($1,$2,$3,$4)',[a,`00000000-0000-4000-8000-${String(i).padStart(12,'0')}`,place,stamp])
  const first=(await as(a,'select * from user_discovery_history order by created_at desc,event_id desc limit 20')).rows,cursor=first.at(-1)
  const next=(await as(a,'select * from user_discovery_history where (created_at,event_id)<($1,$2) order by created_at desc,event_id desc limit 20',[cursor.created_at,cursor.event_id])).rows
  assert.equal(new Set([...first,...next].map(r=>r.event_id)).size,27)
 })
 await check('history clear affects only its owner and preserves visits, roles, preferences and content',async()=>{
  await as(b,'insert into user_discovery_history(user_id,event_id,place_id) values($1,$2,$3)',[b,event,place],true)
  await as(a,'delete from user_discovery_history where user_id=$1',[a],true)
  assert.equal((await as(a,'select * from user_discovery_history')).rows.length,0)
  assert.equal((await as(b,'select * from user_discovery_history')).rows.length,1)
  assert.equal((await as(a,'select * from user_visited_places')).rows.length,1)
  await reject(a,"insert into user_roles(user_id,role) values($1,'admin')",[a]);await reject(a,'select admin_overview()')
  await as(a,'delete from user_visited_places where place_id=$1',[place],true)
  assert.equal((await as(a,'select * from user_visited_places')).rows.length,0)
 })
 await check('date validation handles invalid calendar values, optional dates and future dates',async()=>{
  for(const value of ['',null,'2026-10-01','2024-02-29'])assert.equal(validVisitDate(value,new Date('2026-10-21T12:00:00Z')),true)
  for(const value of ['2026-02-30','2026-10-22','1899-01-01','bad','2026-1-1'])assert.equal(validVisitDate(value,new Date('2026-10-21T12:00:00Z')),false)
 })
 await check('saved search, multiple categories and timestamp/name sorting use real field shapes',async()=>{
  const rows=[{id:'b',name:'Dana',city:'Tafilah',categoryIds:['nature','adventure']},{id:'a',name:'Ajloun',city:'Ajloun',categoryIds:['nature']}]
  assert.deepEqual(filterPersonalPlaces(rows,{sort:'recent',dates:{a:'2026-10-21',b:'2026-10-20'}}).map(p=>p.id),['a','b'])
  assert.deepEqual(filterPersonalPlaces(rows,{query:'TAFILAH',category:'adventure'}).map(p=>p.id),['b'])
  assert.deepEqual(filterPersonalPlaces(rows,{query:'missing'}),[])
  assert.deepEqual(filterPersonalPlaces(rows,{sort:'name'}).map(p=>p.id),['a','b'])
  assert.equal(filterPersonalPlaces([{id:'ar',name:'محمية ضانا',categoryIds:['nature']}],{query:'ضانا'},'ar-JO').length,1)
 })
 await check('new Arabic labels retain Unicode text, parity and no encoding replacement sequences',async()=>{
  const en=JSON.parse(await readFile('src/i18n/locales/en.json','utf8')),ar=JSON.parse(await readFile('src/i18n/locales/ar-JO.json','utf8'))
  assert.deepEqual(Object.keys(en).sort(),Object.keys(ar).sort())
  for(const key of ['Saved Places','Visited Places','Discovery History','Visit date (optional)','Loading discovery history…','Clear discovery history?']){assert.match(ar[key],/[\u0600-\u06ff]/u);assert.ok(!ar[key].includes('??'))}
 })
}finally{await db.close();await mkdir('docs/validation',{recursive:true});await writeFile('docs/validation/phase07-unit-database.json',JSON.stringify({scope:'Disposable PostgreSQL/PostGIS and pure functions; no hosted users or records modified.',results},null,2)+'\n')}
