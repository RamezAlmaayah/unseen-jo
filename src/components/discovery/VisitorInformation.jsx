import {useTranslation} from 'react-i18next'
import {Clock,Ticket,CalendarClock,Sun,Route} from 'lucide-react'
import {tx} from '../../i18n/index.js'
import {visitorInformation,visitorBullets} from '../../features/tourism/visitorInformation.js'
const icons={clock:Clock,ticket:Ticket,calendar:CalendarClock,sun:Sun,route:Route}
export function VisitorInformationCard({card}){
 const Icon=icons[card.icon]
 return <div className={`visitor-info-card${card.value?'':' visitor-info-card--unknown'}`} data-info={card.id}>
  <dt><Icon size={22} aria-hidden="true"/><span>{tx(card.title)}</span></dt>
  <dd><p className="visitor-info-value">{card.note?<a className="visitor-info-note" href={`#visitor-note-${card.note}`}>{tx(card.value)}<span className="sr-only"> — {tx('Read visitor notes')}: {tx(card.title)}</span></a>:card.value?tx(card.value):tx('Unavailable')}</p>{card.support&&<p className="visitor-info-support">{tx(card.support)}</p>}</dd>
 </div>
}
export default function VisitorInformation({place}){
 const {i18n}=useTranslation(),{cards,notes}=visitorInformation(place,i18n.language)
 return <div className="visitor-information">
  <section aria-labelledby="visitor-information-heading"><h2 id="visitor-information-heading">{tx('Plan Your Visit')}</h2><dl className="visitor-info-grid">{cards.map(card=><VisitorInformationCard key={card.id} card={card}/>)}</dl></section>
  {notes.length>0&&<section className="visitor-notes" aria-labelledby="visitor-notes-heading"><h2 id="visitor-notes-heading">{tx('Important Information Before Visiting')}</h2><p>{tx('Confirm current admission, opening and access conditions with the operator before travelling.')}</p><div className="visitor-notes-grid">{notes.map(note=><section key={note.id} id={`visitor-note-${note.id}`} tabIndex={-1} aria-labelledby={`visitor-note-title-${note.id}`}><h3 id={`visitor-note-title-${note.id}`}>{tx(note.title)}</h3><ul>{visitorBullets(note.text,i18n.language).map((line,index)=><li key={index}>{line}</li>)}</ul></section>)}</div></section>}
 </div>
}
