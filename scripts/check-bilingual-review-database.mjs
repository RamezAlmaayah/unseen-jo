// Disposable Postgres only. Never uses hosted credentials or real account sessions.
import {readFile,writeFile,unlink} from 'node:fs/promises'
const checks=`
await check('review feedback requires a current admin and cannot be forged or exposed',async()=>{
 const d=(await db.query("select * from places where status='draft' limit 1")).rows[0]
 await as(uid,"insert into place_translations(place_id,locale,name,description,source_updated_at) values($1,'ar-JO','اسم عربي',$2,$3)",[d.id,'وصف عربي تجريبي للمراجعة فقط. '.repeat(8),d.updated_at],sid,true)
 await rejected(uid,"update place_translations set editorial_status='needs_changes' where place_id=$1",[d.id])
 assert.equal((await as(ordinary,"update place_translations set editorial_status='needs_changes',review_notes='forged' returning *")).rows.length,0)
 assert.equal((await as(uid,"update place_translations set editorial_status='needs_changes',review_notes='forged' returning *",[],ordinary)).rows.length,0)
 await as(uid,"update place_translations set editorial_status='needs_changes',review_notes='Compare ticket scope with the source',feedback_by=$2,feedback_at='2000-01-01',reviewed_by=$2,reviewed_at=now() where place_id=$1",[d.id,ordinary],sid,true)
 const t=(await db.query('select * from place_translations where place_id=$1',[d.id])).rows[0]
 assert.equal(t.editorial_status,'needs_changes');assert.equal(t.feedback_by,uid);assert.notEqual(String(t.feedback_at),'2000-01-01');assert.equal(t.reviewed_by,null);assert.equal(t.reviewed_at,null)
 assert.equal((await as(null,'select * from place_translations')).rows.length,0)
 assert.equal((await as(ordinary,'select * from place_translations')).rows.length,0)
})
await check('Arabic edits reset approval without altering English or images, and preserve feedback',async()=>{
 const d=(await db.query("select * from places where status='draft' limit 1")).rows[0]
 const before=(await db.query('select row_to_json(p) snapshot from places p where id=$1',[d.id])).rows[0].snapshot
 const images=(await db.query('select * from place_images order by id')).rows
 await as(uid,"update place_translations set description=$2,editorial_status='reviewed',review_notes='forged replacement' where place_id=$1",[d.id,'محتوى عربي مصحح للاختبار فقط. '.repeat(8)],sid,true)
 let t=(await db.query('select * from place_translations where place_id=$1',[d.id])).rows[0]
 assert.equal(t.editorial_status,'pending');assert.equal(t.review_notes,'Compare ticket scope with the source');assert.equal(t.reviewed_by,null)
 await as(uid,"update place_translations set editorial_status='reviewed' where place_id=$1",[d.id],sid,true)
 t=(await db.query('select * from place_translations where place_id=$1',[d.id])).rows[0]
 assert.equal(t.editorial_status,'reviewed');assert.equal(t.reviewed_by,uid);assert.equal(t.review_notes,null);assert.equal(t.feedback_by,null);assert.equal(t.feedback_at,null)
 assert.deepEqual((await db.query('select row_to_json(p) snapshot from places p where id=$1',[d.id])).rows[0].snapshot,before)
 assert.deepEqual((await db.query('select * from place_images order by id')).rows,images)
 assert.equal((await as(null,'select * from place_translations')).rows.length,0)
 await as(uid,"update place_translations set editorial_status='pending' where place_id=$1",[d.id],sid,true)
 t=(await db.query('select * from place_translations where place_id=$1',[d.id])).rows[0]
 assert.equal(t.reviewed_by,null);assert.equal(t.reviewed_at,null)
})
await check('approved public Arabic contains no private reviewer feedback',async()=>{
 const p=(await db.query('select * from places where id=$1',[pid])).rows[0]
 await as(uid,"insert into place_translations(place_id,locale,name,description,source_updated_at) values($1,'ar-JO','اسم عربي',$2,$3)",[pid,'محتوى عربي اصطناعي لاختبار خصوصية الملاحظات. '.repeat(8),p.updated_at],sid,true)
 await as(uid,"update place_translations set editorial_status='needs_changes',review_notes='Private reviewer feedback' where place_id=$1",[pid],sid,true)
 assert.equal((await as(null,'select * from place_translations where place_id=$1',[pid])).rows.length,0)
 await as(uid,"update place_translations set editorial_status='reviewed' where place_id=$1",[pid],sid,true)
 const t=(await as(null,'select * from place_translations where place_id=$1',[pid])).rows[0]
 assert.ok(t);assert.equal(t.review_notes,null);assert.equal(t.feedback_by,null);assert.equal(t.feedback_at,null)
 assert.ok((await as(uid,"select * from admin_audit_logs where entity_table='place_translations'")).rows.some(r=>JSON.stringify(r).includes('review_notes')))
})
await check('review operations reject stale content, oversized feedback and identity changes',async()=>{
 const d=(await db.query("select * from places where status='draft' limit 1")).rows[0]
 await rejected(uid,"update place_translations set editorial_status='needs_changes',review_notes=$2 where place_id=$1",[d.id,'x'.repeat(4001)])
 await rejected(uid,"update place_translations set locale='en' where place_id=$1",[d.id])
 await as(uid,"update place_translations set source_updated_at='2000-01-01' where place_id=$1",[d.id],sid,true)
 await rejected(uid,"update place_translations set editorial_status='reviewed' where place_id=$1",[d.id])
 assert.ok((await as(uid,"select * from admin_audit_logs where entity_table='place_translations'")).rows.length>0)
})
`
let source=await readFile('scripts/check-phase04.mjs','utf8')
source=source.replace("await mkdir('docs/validation'",checks+"\nawait mkdir('docs/validation'").replace('docs/validation/phase04-database-tests.json','docs/validation/bilingual-review-database.json')
await writeFile('scripts/.bilingual-review-database-runner.mjs',source)
try{await import('./.bilingual-review-database-runner.mjs?run='+Date.now())}finally{await unlink('scripts/.bilingual-review-database-runner.mjs')}
