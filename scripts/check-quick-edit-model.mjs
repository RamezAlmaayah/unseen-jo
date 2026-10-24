import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {initialQuickEdit,privateQuickPayload,quickPayload,quickTextFields,editQuickImage,imagesOnlyChanged} from '../src/features/admin/quickEditModel.js'
import {createAdminRepository} from '../src/features/admin/repository.js'
import {catalogVersion} from '../src/features/tourism/catalogEvents.js'
import {createClient} from '@supabase/supabase-js'
import ar from '../src/i18n/locales/ar-JO.json' with {type:'json'}
import {normalizePlace} from '../src/features/tourism/model.js'
import {localizeDestination} from '../src/i18n/destinations.js'
const results=[];async function check(name,test){await test();results.push({name,status:'passed'});console.log('PASS '+name)}
await check('incomplete private drafts preserve independent manual text and never carry rights attestations',()=>{
 const place={id:'id',name:'English',slug:'english',description:'Manual English',place_translations:[{locale:'ar-JO',description:'وصف عربي يدوي'}],place_images:[{id:'image',storage_path:'id/photo.jpg',alt_text:'Original image',rights_confirmed:true,approved_at:'recorded'}]},form=initialQuickEdit(place);form.english.name=''
 const payload=privateQuickPayload(form);assert.equal(payload.english.name,'');assert.equal(payload.arabic.description,'وصف عربي يدوي');assert.equal(payload.images[0].rights_confirmed,undefined);assert.equal(payload.images[0].approved_at,'recorded');assert.equal(place.name,'English');assert.throws(()=>quickPayload(form));form.english.name='Corrected English';assert.equal(quickPayload(form).arabic.description,'وصف عربي يدوي');assert.equal(quickPayload(form).images[0].rights_confirmed,false)
 const edited=editQuickImage(form,'id/photo.jpg',{attribution:'Changed attribution'});assert.equal(edited.images[0].approved_at,null);assert.equal(form.images[0].approved_at,'recorded');assert.equal(edited.images[0].storage_path,form.images[0].storage_path)
 const originalForm=initialQuickEdit(place);assert.equal(imagesOnlyChanged(originalForm,place),true);originalForm.images=[];assert.equal(imagesOnlyChanged(originalForm,place),true);originalForm.arabic.description='تغيير يدوي';assert.equal(imagesOnlyChanged(originalForm,place),false)
})
await check('Quick Edit resources contain actual Arabic text and every bilingual field is translated',()=>{
 for(const key of ['Quick Edit','Save Changes','Saving…','Private draft saved automatically. Website unchanged.','Replace Cover Image','Select Existing Verified Image','Advanced Details']){assert.match(ar[key],/[\u0600-\u06ff]/);assert.ok(!ar[key].includes('??'))}
 const names={name:'Destination name',description:'Description',city:'City',region:'Region',address:'Address',opening_hours:'Opening hours (confirmed only)',activities:'Activities',visitor_information:'Visitor information',best_time_to_visit:'Best time to visit',transportation_notes:'Transportation notes'}
 for(const field of quickTextFields)for(const language of ['English','Arabic'])assert.match(ar[`${names[field]} (${language})`],/[\u0600-\u06ff]/)
})
await check('private autosaves do not invalidate public caches; apply invalidates and binds to the original account',async()=>{
 const calls=[],client=createClient('https://example.invalid','sb_publishable_fixture',{
  auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
  global:{fetch:async(input,options)=>{calls.push({path:new URL(input).pathname,body:JSON.parse(options.body)});return new Response(JSON.stringify('fixture'),{headers:{'Content-Type':'application/json'}})}}
 }),repo=createAdminRepository(client,'original-admin'),version=catalogVersion()
 await repo.saveQuickDraft('id','version',{english:{name:'Private'}},null);assert.equal(catalogVersion(),version);assert.equal(calls[0].body.changes.editor_id,'original-admin')
 await repo.applyQuickEdit({english:{name:'Reviewed'}},'version',true);assert.equal(catalogVersion(),version+1);assert.equal(calls[1].body.changes.editor_id,'original-admin');assert.equal(calls[1].body.reviewed_changes,true)
})
await check('new visitor fields reach public adapters in both languages without rewriting saved data',()=>{
 const stamp='2026-10-19T10:00:00Z',row={id:'id',slug:'fixture',name:'English',status:'published',is_demo:false,updated_at:stamp,region:'English region',opening_hours:'Confirmed hours',activities:'Walking',visitor_information:'English visitor advice',place_translations:[{locale:'ar-JO',editorial_status:'reviewed',source_updated_at:stamp,name:'العربية',region:'المنطقة',opening_hours:'الساعات المؤكدة',activities:'المشي',visitor_information:'إرشادات الزيارة'}]},snapshot=JSON.stringify(row),p=normalizePlace(row)
 assert.equal(p.details.openingHours,'Confirmed hours');const translated=localizeDestination(p,'ar-JO');assert.equal(translated.details.region,'المنطقة');assert.equal(translated.details.activities,'المشي');assert.equal(translated.details.visitorInformation,'إرشادات الزيارة');assert.equal(JSON.stringify(row),snapshot)
})
await writeFile('docs/validation/quick-edit-model.json',JSON.stringify({scope:'Local model/resources/adapters and real SDK builders with fake transport; no hosted mutations',passed:results.length,results},null,2)+'\n')
