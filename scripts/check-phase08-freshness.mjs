import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {phase08EvidenceIssues,isRecentEvidence} from '../src/features/admin/phase08Freshness.js'
const m=JSON.parse(await readFile('docs/evidence/phase08/import-package.json','utf8')),now=Math.max(Date.parse(m.preparedAt),...m.revalidation.records.flatMap(r=>[Date.parse(r.checkedAt),...r.sources.map(s=>Date.parse(s.checkedAt))]),...m.revalidation.licenses.map(i=>Date.parse(i.checkedAt))),plan=m.places[0],results=[]
const check=(name,test)=>{test();results.push({name,status:'passed'});console.log('PASS '+name)}
check('historical fixture is fresh at its recorded checks, expires after 24 hours; Aqaba blocker remains',()=>{for(const p of m.places){assert.deepEqual(phase08EvidenceIssues(m,p,now),[]);assert.ok(phase08EvidenceIssues(m,p,now+86400000).length)}assert.ok(m.places.find(p=>p.slug==='aqaba-marine-reserve').criticalBlockers.length)})
for(const [name,mutate]of [
 ['rebuilding preparedAt cannot refresh stale source',x=>{x.revalidation.records[0].sources[0].checkedAt=new Date(now-90000000).toISOString()}],
 ['rebuilding preparedAt cannot refresh stale licence',x=>{x.revalidation.licenses[0].checkedAt=new Date(now-90000000).toISOString()}],
 ['future verification cannot count as fresh',x=>{x.revalidation.records[0].checkedAt=new Date(now+60000).toISOString()}],
 ['failed source remains blocked',x=>{x.revalidation.records[0].status='blocked'}],
 ['missing source proof remains blocked',x=>{delete x.revalidation.records[0].sources[0].evidenceSha256}],
 ['changed content needs its own source check',x=>{x.revalidation.records[0].contentHash='0'.repeat(64)}],
 ['changed original cannot inherit another file licence check',x=>{x.revalidation.licenses[0].originalSha256='0'.repeat(64)}],
 ['failed live licence check remains blocked',x=>{x.revalidation.licenses[0].eligibleMetadataUnchanged=false}],
 ['missing licence response fingerprint remains blocked',x=>{delete x.revalidation.licenses[0].responseSha256}],
 ['missing revalidation cannot be replaced by a new build date',x=>{x.revalidation=null}]
])check(name,()=>{const x=structuredClone(m);x.preparedAt=new Date(now).toISOString();mutate(x);assert.ok(phase08EvidenceIssues(x,plan,now).length)})
check('24-hour boundary, invalid time and future time fail exactly',()=>{assert.equal(isRecentEvidence(new Date(now-86400000).toISOString(),now),false);assert.equal(isRecentEvidence('invalid',now),false);assert.equal(isRecentEvidence(new Date(now+1).toISOString(),now),false);assert.equal(isRecentEvidence(new Date(now-86399999).toISOString(),now),true)})
await writeFile('docs/validation/phase08-freshness.json',JSON.stringify({scope:'Pure expiry/security tests against actual revalidation metadata; no hosted writes or approvals',results},null,2)+'\n')
