// Disposable Postgres/PostGIS only; fixture Auth and Storage, never hosted writes.
import {readFile,writeFile,unlink} from 'node:fs/promises'
const checks=`
await check('localized publication requires real current admin, exact saved versions and reviewed Arabic',async()=>{
 stamp=(await db.query('select updated_at from places where id=$1',[pid])).rows[0].updated_at
 await as(uid,"select admin_set_place_status($1,'draft',$2)",[pid,stamp],sid,true)
 stamp=(await db.query('select updated_at from places where id=$1',[pid])).rows[0].updated_at
 await rejected(null,'select admin_publish_localized_place($1,$2,null)',[pid,stamp])
 await rejected(ordinary,'select admin_publish_localized_place($1,$2,null)',[pid,stamp])
 await rejected(uid,'select admin_publish_localized_place($1,$2,null)',[pid,stamp])
 await as(uid,"insert into place_translations(place_id,locale,name,description,source_updated_at) values($1,'ar-JO','مكان تجريبي',$2,$3)",[pid,'نص عربي اصطناعي للمراجعة والاختبار فقط. '.repeat(8),stamp],sid,true)
 let t=(await db.query('select * from place_translations where place_id=$1',[pid])).rows[0]
 await rejected(uid,'select admin_publish_localized_place($1,$2,$3)',[pid,stamp,t.updated_at])
 await as(uid,"update place_translations set editorial_status='reviewed' where place_id=$1",[pid],sid,true)
 t=(await db.query('select * from place_translations where place_id=$1',[pid])).rows[0]
 await rejected(uid,'select admin_publish_localized_place($1,$2,$3)',[pid,'2000-01-01',t.updated_at])
 await rejected(uid,'select admin_publish_localized_place($1,$2,$3)',[pid,stamp,'2000-01-01'])
 await rejected(uid,'select admin_publish_localized_place($1,$2,$3)',[pid,stamp,t.updated_at],ordinary)
 assert.equal((await db.query('select status from places where id=$1',[pid])).rows[0].status,'draft')
})
await check('a downstream translation failure rolls the publication transaction back',async()=>{
 const p=(await db.query('select * from places where id=$1',[pid])).rows[0],t=(await db.query('select * from place_translations where place_id=$1',[pid])).rows[0]
 await db.exec("create function public.fixture_fail_translation() returns trigger language plpgsql as $$begin raise exception 'Injected downstream failure'; end$$; create trigger fixture_fail_translation before update on place_translations for each row when (old.source_updated_at is distinct from new.source_updated_at) execute function public.fixture_fail_translation();")
 await rejected(uid,'select admin_publish_localized_place($1,$2,$3)',[pid,p.updated_at,t.updated_at])
 assert.equal((await db.query('select status from places where id=$1',[pid])).rows[0].status,'draft')
 assert.deepEqual((await db.query('select updated_at from places where id=$1',[pid])).rows[0].updated_at,p.updated_at)
 await db.exec('drop trigger fixture_fail_translation on place_translations; drop function public.fixture_fail_translation()')
})
await check('eligible English and Arabic become public together and retain actual actor evidence',async()=>{
 const p=(await db.query('select * from places where id=$1',[pid])).rows[0],t=(await db.query('select * from place_translations where place_id=$1',[pid])).rows[0]
 await as(uid,'select admin_publish_localized_place($1,$2,$3)',[pid,p.updated_at,t.updated_at],sid,true)
 const published=(await as(null,'select * from places where id=$1',[pid])).rows[0],arabic=(await as(null,'select * from place_translations where place_id=$1',[pid])).rows[0]
 assert.equal(published.status,'published');assert.equal(arabic.editorial_status,'reviewed');assert.deepEqual(arabic.source_updated_at,published.updated_at);assert.equal(arabic.reviewed_by,uid)
 assert.equal(published.description,p.description);assert.equal(published.slug,p.slug);assert.equal(arabic.description,t.description);assert.equal(arabic.review_notes,null)
})
`
let source=await readFile('scripts/check-phase04.mjs','utf8')
source=source.replace("await mkdir('docs/validation'",()=>checks+"\nawait mkdir('docs/validation'").replace('docs/validation/phase04-database-tests.json','docs/validation/atomic-publication-database.json')
await writeFile('scripts/.atomic-publication-runner.mjs',source)
try{await import('./.atomic-publication-runner.mjs?run='+Date.now())}finally{await unlink('scripts/.atomic-publication-runner.mjs')}
