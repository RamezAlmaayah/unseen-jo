import {tx} from '../../i18n/index.js'
import { ChevronDown } from 'lucide-react'

export default function PreferenceField({ name, label, icon, value, options, onChange, error, children, summary }) {
  const labelId = `surprise-${name}-label`
  const errorId = `surprise-${name}-error`
  return <div className={`discovery-field discovery-field--${name}`} data-value={value}>
    <label id={labelId} htmlFor={children ? undefined : `surprise-${name}`}>{tx(label)}</label>
    <div className="discovery-field__control">
      {tx(children ? <details className="discovery-field__details" onKeyDown={event => {
        if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary').focus() }
      }}>
        <summary aria-labelledby={`${labelId} surprise-${name}-value`} aria-describedby={error ? errorId : undefined} aria-invalid={!!error}>
          <span id={`surprise-${name}-value`}>{tx(summary)}</span><ChevronDown aria-hidden="true" />
        </summary>
        <div className="discovery-field__dropdown">{tx(children)}</div>
      </details> : <>
        <select id={`surprise-${name}`} value={value} onChange={event => onChange(event.target.value)} required aria-invalid={!!error} aria-describedby={error ? errorId : undefined}>
          <option value="" disabled>{tx("Choose an option")}</option>
          {tx(options.map(option => <option key={option.value} value={option.value}>{tx(option.label)}</option>))}
        </select>
        <ChevronDown className="discovery-field__chevron" aria-hidden="true" />
      </>)}
    </div>
    <div className="discovery-field__icon"><img src={`/assets/figma/surprise/${icon}.png`} alt={tx("")} width="60" height="60" /></div>
    {tx(error ? <p id={errorId} className="discovery-field__error">{tx(error)}</p> : null)}
  </div>
}
