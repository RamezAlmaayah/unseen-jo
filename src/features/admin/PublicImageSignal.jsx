import {tx} from '../../i18n/index.js'

// A CMS diagnostic, never an image approval or a claim of HTTP verification.
// Existing archived rows remain fully accessible and recoverable by Admin.
export default function PublicImageSignal({place}){
 const images=place.place_images||[],approved=images.filter(i=>i.approved_at)
 if(approved.length)return <small>{tx('Approved image records')}: {tx(approved.length)} · {tx('Check public rendering before publishing.')}</small>
 return <div className="admin-image-warning"><strong>{tx(place.status==='archived'?'Public visibility: Archived':'Public visibility blocked: no approved image')}</strong><small>{tx('Image issue: no approved public cover or gallery photo.')}</small><small>{tx('Image records')}: {tx(images.length)} · {tx('Approved image records')}: {tx(0)}</small><small>{tx('Existing uploads remain private. Keep archived until a working public image is available.')}</small></div>
}
