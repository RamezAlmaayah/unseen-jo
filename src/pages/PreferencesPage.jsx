import {usePageTitle} from '../i18n/usePageTitle'
import PreferenceAccountActions from '../features/account/PreferenceAccountActions'
import {tx} from '../i18n/index.js'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link,useNavigate } from 'react-router'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import PreferenceChoice from '../features/preferences/PreferenceChoice'
import PreferenceGroup from '../features/preferences/PreferenceGroup'
import { usePreferences } from '../features/preferences/usePreferences'
import { interests, locations, preferenceGroups } from '../features/preferences/options'
import PreferenceLimits from '../features/recommendations/PreferenceLimits'
import {validatePreferences} from '../features/recommendations/preferences.js'
import {useRecommendationData} from '../features/recommendations/useRecommendationData.js'

export default function PreferencesPage() {
  const { preferences, updatePreference, toggleInterest } = usePreferences()
  const [errors,setErrors]=useState({}),navigate=useNavigate(),data=useRecommendationData(true)
  const categories=data.categories.map(c=>({...interests.find(i=>i.value===c.slug),value:c.slug,label:c.name}))
  usePageTitle('Find your adventure | Unseen Jo')

  return (
    <div className="preferences-page">
      <Link to="/" className="preferences-back"><ArrowLeft size={50} aria-hidden="true" /><span>{tx("Back")}</span></Link>
      <Reveal entrance className="preferences-intro">
        <h1>{tx("Let’s find your kind of adventure.")}</h1>
        <p>{tx("A few quick choices help us discover places that fit you.")}</p>
      </Reveal>
      <Reveal entrance delay={0.1}>
        <form className="preferences-panel" onSubmit={event => { event.preventDefault();const next=validatePreferences(preferences);setErrors(next);if(Object.keys(next).length){event.currentTarget.querySelector('.recommendation-limits').open=true;return}navigate('/discovery-result') }}>
          <fieldset className="preference-group preference-group--location">
            <legend>{tx("Where are you starting from?")}</legend>
            <div className="preference-location">
              <span className="preference-location__icon"><img src="/assets/figma/preferences/location.png" alt={tx("")} width="43" height="44" /></span>
              <select aria-label={tx("Starting location")} value={preferences.startingLocation} onChange={event => updatePreference('startingLocation', event.target.value)}>
                {tx(locations.map(location => <option key={location.value} value={location.value}>{tx(location.label)}</option>))}
              </select>
            </div>
          </fieldset>
          <fieldset className="preference-group preference-group--interests">
            <legend>{tx("What do you feel like doing?")}</legend>
            <div className="preference-options preference-options--interests">
              {tx(categories.map(option => <PreferenceChoice key={option.value} name="interests" option={option} interest checked={preferences.interests.includes(option.value)} onChange={() => toggleInterest(option.value)} />))}
            </div>
          </fieldset>
          {tx(preferenceGroups.map(group => <PreferenceGroup key={group.key} group={group} value={preferences[group.key]} onChange={updatePreference} />))}
          <PreferenceLimits errors={errors}/>
          <PreferenceAccountActions/>
          {data.status==='loading'&&<p role="status">{tx('Loading interests…')}</p>}
          {data.error&&<p role="alert">{tx(data.error)} <button type="button" onClick={data.retry}>{tx('Try again')}</button></p>}
          <div className="preferences-submit"><Button type="submit" disabled={data.status!=='ready'}>{tx("Show Me Places")}</Button></div>
        </form>
      </Reveal>
    </div>
  )
}
