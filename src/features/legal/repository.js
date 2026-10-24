import {LEGAL_KEYS,legalError,legalState,validateLegalContent} from './model.js'
const publicFields='id,document_key,version,content,created_at,approved_at,revoked_at'
async function checked(request){const {data,error}=await request.retry(false).abortSignal(AbortSignal.timeout(20000));if(error){const e=Error(legalError(error));e.code=error.code;throw e}return data}
export function createLegalRepository(client){return {
 state:()=>checked(client.rpc('admin_legal_state')),
 async revision(id){const rows=await checked(client.from('legal_revisions').select(publicFields).eq('id',id).limit(1));if(!rows?.length)throw Error('Legal revision is unavailable.');validateLegalContent(rows[0].content);return rows[0]},
 save:(head,content)=>{validateLegalContent(content);return checked(client.rpc('admin_save_legal_draft',{target:head.document_key,expected_lock:head.lock_version,changes:content}))},
 publish:(head,id)=>checked(client.rpc('admin_publish_legal',{target:head.document_key,expected_lock:head.lock_version,revision_id:id})),
 revoke:(head,id)=>checked(client.rpc('admin_revoke_legal',{target:head.document_key,expected_lock:head.lock_version,revision_id:id})),
 restore:(head,id)=>checked(client.rpc('admin_restore_legal',{target:head.document_key,expected_lock:head.lock_version,revision_id:id})),
 }}
// Always the established anonymous client, never an Admin client. Public RLS
// denies draft/revoked rows even when someone guesses their revision IDs.
export async function readPublishedLegal(key,client){
 if(!client)client=(await import('../../lib/supabase/client.js')).getSupabaseClient()
 if(!client||!LEGAL_KEYS.includes(key))throw Error('Published legal documents are unavailable. Please try again later.')
 const rows=await checked(client.from('legal_revisions').select(publicFields).eq('document_key',key).not('approved_at','is',null).is('revoked_at',null).order('version',{ascending:false}).limit(1))
 if(!rows.length)return null
 const r=rows[0];validateLegalContent(r.content,{complete:true});if(r.document_key!==key||legalState(r)!=='published')throw Error('Published legal documents are unavailable. Please try again later.');return r
}
export async function readRegistrationLegal(client){const [privacy,terms]=await Promise.all(LEGAL_KEYS.map(k=>readPublishedLegal(k,client)));return {privacy,terms}}
