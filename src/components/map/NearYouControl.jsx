import {tx} from '../../i18n/index.js'
import { LocateFixed, X } from 'lucide-react'
import { cityCenters } from '../../features/map/geography.js'

export default function NearYouControl({ location, radius, onRadius, sort, onSort }) {
  return <details className="near-you">
    <summary><LocateFixed size={17} aria-hidden="true" />{tx("Near You")}{tx(location.origin ? ' · active' : '')}</summary>
    <div className="near-you__panel">
      <p>{tx("Use your location once to find nearby destinations. It stays in this visit’s memory. Map tiles load for the area you view.")}</p>
      <button type="button" className="button button--secondary" onClick={location.locate} disabled={location.status === 'loading'}><LocateFixed size={18} aria-hidden="true" />{tx(location.status === 'loading' ? 'Locating…' : 'Use my location')}</button>
      <label>{tx("Or choose a city")}<select aria-label={tx("Manual city location")} value={location.origin?.kind === 'city' ? location.origin.id : ''} onChange={event => { const city = cityCenters.find(c => c.id === event.target.value); if (city) location.chooseCity(city); else location.clear() }}><option value="">{tx("Choose a city centre")}</option>{tx(cityCenters.map(c => <option key={c.id} value={c.id}>{tx(c.name)}</option>))}</select></label>
      <label>{tx("Search radius")}<select aria-label={tx("Nearby search radius")} value={radius} onChange={e => onRadius(Number(e.target.value))}>{tx([5,10,25,50,100,250].map(n => <option key={n} value={n}>{tx(n)}{tx(" km")}</option>))}</select></label>
      <label className="near-you__sort"><input type="checkbox" checked={sort} onChange={e => onSort(e.target.checked)} />{tx("Nearest first when location is active")}</label>
      <p role={location.status === 'error' ? 'alert' : 'status'}>{tx(location.message || 'You can explore without sharing your location.')}</p>
      {tx((location.origin || location.status === 'loading' || location.status === 'error') ? <button type="button" className="text-action" onClick={location.clear}><X size={16} aria-hidden="true" />{tx("Clear location filtering")}</button> : null)}
      <p className="map-source-note">{tx("City reference points: ")}<a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer">{tx("GeoNames · CC BY 4.0")}</a>{tx(". City-centre distances are approximate.")}</p>
    </div>
  </details>
}
