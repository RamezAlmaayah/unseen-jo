import {tx} from '../../i18n/index.js'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import AssetImage from '../ui/AssetImage'

export default function PhotoGallery({ photos, name, mode = 'demo' }) {
  const [selected, setSelected] = useState(null)
  const dialog = useRef(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (selected !== null && !dialog.current.open) dialog.current.showModal()
    else if (selected === null && dialog.current.open) dialog.current.close()
  }, [selected])
  function change(direction) { setSelected(current => (current + direction + photos.length) % photos.length) }
  return <>
    <div className={`photo-gallery ${photos.length === 1 ? 'photo-gallery--single' : ''}`} aria-label={tx(`${name} photo gallery`)}>
      {tx(photos.map((photo, index) => <button type="button" key={photo.src} onClick={() => setSelected(index)} aria-label={tx(`Enlarge photo ${index + 1}: ${photo.alt}`)}><AssetImage src={photo.src} delivery={photo.delivery} widths={index ? "640,1280" : "640,1280,2400"} sizes={index ? "(max-width: 600px) calc((100vw - 44px) / 2), 472px" : photos.length === 1 ? "calc(100vw - 64px)" : "(max-width: 600px) calc(100vw - 32px), (max-width: 1100px) 65vw, 900px"} loading={index ? "lazy" : "eager"} fetchPriority={index ? "auto" : "high"} alt={tx(photo.alt)} width={index ? 472 : 881} height={index ? 188 : 398} /></button>))}
    </div>
    <dialog ref={dialog} className="destination-preview photo-viewer" aria-label={tx(`${name} photo viewer`)} onClose={() => setSelected(null)} onCancel={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null) }} onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); change(event.key === 'ArrowLeft' ? -1 : 1) } }}>
      <button type="button" className="destination-preview__close" onClick={() => setSelected(null)} aria-label={tx("Close photo viewer")}><X aria-hidden="true" /></button>
      {tx(selected !== null ? <><p className="demo-label">{tx(photos[selected].kind==='illustration'?'Original prototype illustration':mode === 'supabase' ? 'Destination photography' : 'Original Figma photography')} · {tx(selected + 1)}{tx(" of ")}{tx(photos.length)}</p><AnimatePresence mode="wait" initial={false}><motion.div key={selected} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.15 }}><AssetImage src={photos[selected].src} delivery={photos[selected].delivery} original loading="eager" alt={tx(photos[selected].alt)} className="photo-viewer__image" /></motion.div></AnimatePresence><p>{tx(photos[selected].alt)}</p>{tx(photos[selected].attribution ? <p className="demo-label">{photos[selected].attribution}</p> : null)}{tx(photos.length > 1 ? <div className="inline-actions"><button type="button" className="icon-control" onClick={() => change(-1)} aria-label={tx("Previous photo")}><ChevronLeft aria-hidden="true" /></button><button type="button" className="icon-control" onClick={() => change(1)} aria-label={tx("Next photo")}><ChevronRight aria-hidden="true" /></button></div> : null)}</> : null)}
    </dialog>
  </>
}
