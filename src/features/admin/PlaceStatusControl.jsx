import {useId,useRef,useState} from 'react'
import {tx} from '../../i18n/index.js'

// This operation changes only the saved destination's status. It never saves
// the editor's form, records a review, or approves media.
export default function PlaceStatusControl(props){
 return <StatusControl key={`${props.place.id}:${props.place.status}:${props.place.updated_at}`} {...props}/>
}
function StatusControl({place,repo,disabled=false,onSaved}){
 const id=useId(),inFlight=useRef(false),[current,setCurrent]=useState(place),[selected,setSelected]=useState(place.status||'draft'),[saving,setSaving]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState('')
 async function change(){
  const status=selected
  if(inFlight.current||disabled||status===current.status)return
  inFlight.current=true;setSaving(true);setError('');setSaved('')
  try{
   const next=await repo.setStatus(current,status)
   setCurrent({...current,...next})
   onSaved?.({...place,...next})
   setSaved('Destination status updated.')
  }catch(e){setError(e.message)}finally{inFlight.current=false;setSaving(false)}
 }
 return <div className="admin-place-status" aria-busy={saving}>
  <label className="admin-field" htmlFor={id}><span>{tx('Status')}</span><select id={id} aria-label={`${tx('Status')}: ${place.name}`} aria-describedby={`${id}-feedback`} value={selected} disabled={disabled||saving} onChange={e=>{setSelected(e.target.value);setError('');setSaved('')}}>
   {['published','draft','archived'].map(status=><option key={status} value={status}>{tx({published:'Published',draft:'Draft',archived:'Archived'}[status])}</option>)}
  </select></label>
  <button type="button" className="admin-secondary" aria-label={`${tx('Save status')}: ${place.name}`} disabled={disabled||saving||selected===current.status} onClick={()=>void change()}>{tx('Save status')}</button>
  <div id={`${id}-feedback`}><span role="status" className="admin-help">{tx(saving?'Saving…':saved)}</span>{error&&<p role="alert" className="admin-status-error">{tx(error)}</p>}</div>
 </div>
}
