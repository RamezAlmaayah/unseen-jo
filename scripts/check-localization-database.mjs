// Replay the existing full security fixture, then exercise translation policies on its synthetic published record.
import {readFile,writeFile,unlink} from 'node:fs/promises'
const checks=`
await check('translation rows start pending and remain invisible for real drafts',async()=>{
 const draft=(await db.query("select * from places where status='draft' limit 1")).rows[0]
 await as(uid,"insert into place_translations(place_id,locale,name,description,source_updated_at,editorial_status,reviewed_by,reviewed_at) values($1,'ar-JO','اسم عربي',$2,$3,'reviewed',$4,now())",[draft.id,'وصف عربي موثق للترجمة فقط. '.repeat(6),draft.updated_at,uid],sid,true)
 const row=(await as(uid,'select * from place_translations where place_id=$1',[draft.id])).rows[0]
 assert.equal(row.editorial_status,'pending');assert.equal(row.reviewed_by,null)
 assert.equal((await as(null,'select * from place_translations')).rows.length,0)
 assert.equal((await as(ordinary,'select * from place_translations')).rows.length,0)
 await rejected(ordinary,"insert into place_translations(place_id,locale,source_updated_at) values($1,'ar-JO',now())",[pid])
 await rejected(uid,"insert into place_translations(place_id,locale,source_updated_at) values($1,'fr',now())",[pid])
})
await check('translation approval alone cannot expose a draft or publish unverified content',async()=>{
 const d=(await db.query("select * from places where status='draft' limit 1")).rows[0]
 await as(uid,"update place_translations set editorial_status='reviewed' where place_id=$1",[d.id],sid,true)
 assert.equal((await as(null,'select * from place_translations')).rows.length,0)
 assert.equal((await db.query('select status,verified_at from places where id=$1',[d.id])).rows[0].status,'draft')
 await rejected(uid,"update places set status='published' where id=$1",[d.id])
})
await check('public Arabic requires published parent, explicit review and current English timestamp',async()=>{
 stamp=(await db.query('select updated_at::text as updated_at from places where id=$1',[pid])).rows[0].updated_at
 await as(uid,"insert into place_translations(place_id,locale,name,description,source_updated_at) values($1,'ar-JO','مكان اختباري',$2,$3)",[pid,'ترجمة نص تجريبي وليست معلومات سياحية. '.repeat(6),stamp],sid,true)
 assert.equal((await as(null,'select * from place_translations')).rows.length,0)
 await as(uid,"update place_translations set editorial_status='reviewed' where place_id=$1",[pid],sid,true)
 assert.equal((await as(null,'select * from place_translations')).rows.length,1)
 await as(uid,"update place_translations set description='تعديل يلغي المراجعة',reviewed_by=$2,reviewed_at=now(),editorial_status='reviewed' where place_id=$1",[pid,ordinary],sid,true)
 const changed=(await db.query('select * from place_translations where place_id=$1',[pid])).rows[0]
 assert.equal(changed.editorial_status,'pending');assert.equal(changed.reviewed_by,null)
 assert.equal((await as(null,'select * from place_translations')).rows.length,0)
 await rejected(uid,"update place_translations set editorial_status='reviewed' where place_id=$1",[pid])
})
await check('translation identity, uniqueness, stale review, session and audit boundaries hold',async()=>{
 await rejected(uid,"insert into place_translations(place_id,locale,source_updated_at) values($1,'ar-JO',now())",[pid])
 assert.equal((await as(uid,"update place_translations set description='غير مصرح' where place_id=$1 returning place_id",[pid],ordinary)).rows.length,0)
 await rejected(uid,"update place_translations set place_id=$2 where place_id=$1",[pid,(await db.query("select id from places where status='draft' limit 1")).rows[0].id])
 await as(uid,"update place_translations set description=$2,source_updated_at='2000-01-01' where place_id=$1",[pid,'وصف عربي طويل للاختبار فقط. '.repeat(8)],sid,true)
 await rejected(uid,"update place_translations set editorial_status='reviewed' where place_id=$1",[pid])
 await rejected(uid,'delete from place_translations where place_id=$1',[pid])
 assert.ok((await as(uid,"select * from admin_audit_logs where entity_table='place_translations'")).rows.length>0)
})
`
let source=await readFile('scripts/check-phase04.mjs','utf8');source=source.replace("await check('cover replacement rejects",checks+"\nawait check('cover replacement rejects").replace("docs/validation/phase04-database-tests.json","docs/validation/phase04l-database-tests.json")
// Same directory keeps all existing relative imports valid; not a hosted mutation runner.
await writeFile('scripts/.localization-database-runner.mjs',source)
try{await import('./.localization-database-runner.mjs?run='+Date.now())}finally{await unlink('scripts/.localization-database-runner.mjs')}
