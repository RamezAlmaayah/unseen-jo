// Offline content-only fixture. All Auth identities and writes are synthetic.
import {readFile} from 'node:fs/promises'
import {sameVersion,translationFields} from '../src/features/admin/contentSyncModel.js'
export const manifest=JSON.parse(await readFile('supabase/content/phase14-admin-sync.json','utf8'))
const baseline=JSON.parse(await readFile('docs/validation/phase14-1-content-baseline.json','utf8'))
export const fixtureRows=()=>manifest.destinations.map(p=>({...structuredClone(p),place_translations:structuredClone(baseline.translations.filter(t=>t.place_id===p.id)),place_images:structuredClone(baseline.images.filter(i=>i.place_id===p.id)),place_categories:structuredClone(baseline.relationships.filter(c=>c.place_id===p.id).map(c=>({category_id:c.category_id})))}))
export const fakeAdmin='00000000-0000-4000-8000-000000000901'
export function fixtureAdapter(options={}){
 const state={rows:fixtureRows(),actor:fakeAdmin,allowed:true,writes:[],clock:0,reads:0,authorizations:0,invalidated:false},copy=()=>structuredClone(state.rows)
 const stamp=()=>`2026-10-24T00:00:00.${String(++state.clock).padStart(6,'0')}Z`
 const row=(id)=>state.rows.find(p=>p.id===id).place_translations.find(t=>t.locale==='ar-JO')
 const conflict=()=>{const e=Error('Translation version conflict. Refresh the preview.');e.code='SYNC_CONFLICT';throw e}
 const adapter={
  async authorize(expected){state.authorizations++;await options.authorize?.(state);if(!state.allowed||expected&&expected!==state.actor){const e=Error('Administrator session required.');e.code='SYNC_AUTH';throw e}return state.actor},
  watchActor(actor,onChange){state.actorChanged=onChange;return {unsubscribe(){state.unsubscribed=true}}},
  async readCatalog(){state.reads++;await options.read?.(state);return copy()},
  async saveTranslation(plan,previous){await options.beforeSave?.(state,plan,previous);const r=row(plan.id);if(!sameVersion(r.updated_at,previous.updated_at))conflict();for(const k of translationFields)r[k]=plan.arabic[k]??null;r.source_updated_at=plan.expectedEnglishUpdatedAt;r.editorial_status='pending';r.reviewed_at=null;r.updated_at=stamp();state.writes.push({operation:'save',id:plan.id});await options.afterSave?.(state);return structuredClone(r)},
  async reviewTranslation(previous){await options.beforeReview?.(state,previous);const r=row(previous.place_id);if(!sameVersion(r.updated_at,previous.updated_at))conflict();r.editorial_status='reviewed';r.reviewed_at=stamp();r.updated_at=stamp();state.writes.push({operation:'review',id:r.place_id});await options.afterReview?.(state);return structuredClone(r)},
  invalidate(){state.invalidated=true}
 }
 return {adapter,state,row}
}
