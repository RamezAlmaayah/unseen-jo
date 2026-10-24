import {useState} from 'react'
import {tx} from '../../i18n/index.js'
import {Modal} from './ui'
export function useOriginalPhotoPrompt(){
 const [request,setRequest]=useState(null)
 const ask=()=>new Promise(resolve=>setRequest({resolve}))
 const close=value=>{request.resolve(value);setRequest(null)}
 const dialog=request?<Modal title={tx('Are these project originals?')} onClose={()=>close(false)}><p>{tx('Confirm only if these photographs were created or are owned by Unseen Jo and the project may publish them.')}</p><p>{tx('Photographs from Google or other websites are not proof of ownership. You can keep them private instead.')}</p><div className="admin-actions"><button type="button" className="admin-secondary" onClick={()=>close(false)}>{tx('Keep private')}</button><button type="button" onClick={()=>close(true)}>{tx('Confirm project originals')}</button></div></Modal>:null
 return {ask,dialog}
}
