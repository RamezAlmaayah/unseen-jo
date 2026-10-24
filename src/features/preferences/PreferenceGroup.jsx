import {tx} from '../../i18n/index.js'
import PreferenceChoice from './PreferenceChoice'
import { additionalPreferenceOptions } from './options'

export default function PreferenceGroup({ group, value, onChange }) {
  const sharedSelection = additionalPreferenceOptions[group.key]?.find(option => option.value === value)
  const options = sharedSelection ? [...group.options, sharedSelection] : group.options
  return (
    <fieldset className={`preference-group preference-group--${group.className}`}>
      <legend>{tx(group.heading)}</legend>
      <div className="preference-options">
        {tx(options.map(option => <PreferenceChoice key={option.value} name={group.key} option={option} checked={value === option.value} onChange={() => onChange(group.key, option.value)} />))}
      </div>
    </fieldset>
  )
}
