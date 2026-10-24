import {tx} from '../../i18n/index.js'
export default function AttributeFilters({ value, onChange, places, mode, children }) {
  const cities = [...new Set(places.map(p => p.city).filter(Boolean))].sort()
  const change = (key, next) => onChange({ ...value, [key]: next })
  return <details className="near-you attribute-filters"><summary>{tx("More filters")}</summary><div className="near-you__panel">
    {tx(children)}<p>{tx("Uses available destination information. Unknown values do not match a cost or duration limit.")}</p>
    <label>{tx("City")}<select aria-label={tx("City")} value={value.city} onChange={e => change('city', e.target.value)}><option value="">{tx("Any city")}</option>{tx(cities.map(city => <option key={city} value={city}>{tx(city)}</option>))}</select></label>
    <label>{tx("Maximum cost")}<select aria-label={tx("Maximum cost")} value={value.maxCost ?? ''} disabled={mode === 'demo'} onChange={e => change('maxCost', e.target.value === '' ? null : Number(e.target.value))}><option value="">{tx("Any known or unknown cost")}</option>{tx([0,10,30,50].map(n => <option key={n} value={n}>{tx(n)}{tx(" JD")}</option>))}</select></label>
    <label>{tx("Maximum visit duration")}<select aria-label={tx("Maximum visit duration")} value={value.maxMinutes ?? ''} disabled={mode === 'demo'} onChange={e => change('maxMinutes', e.target.value === '' ? null : Number(e.target.value))}><option value="">{tx("Any duration")}</option>{tx([60,120,240,480].map(n => <option key={n} value={n}>{tx(n)}{tx(" min")}</option>))}</select></label>
    <label>{tx("Suitable group")}<select aria-label={tx("Suitable group")} value={value.group} disabled={mode === 'demo'} onChange={e => change('group', e.target.value)}><option value="">{tx("Any group")}</option>{tx(['solo','couple','friends','family'].map(g => <option key={g} value={g}>{tx(g)}</option>))}</select></label>
    {tx(mode === 'demo' ? <p>{tx("Sample costs, durations and group labels are illustrative; they are not used as verified map filters.")}</p> : null)}
  </div></details>
}
