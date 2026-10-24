import AssetImage from '../components/ui/AssetImage'
import {usePageTitle} from '../i18n/usePageTitle'
import {tx} from '../i18n/index.js'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import PreferenceField from '../components/discovery/PreferenceField'
import { usePreferences } from '../features/preferences/usePreferences'
import { interests, locations, preferenceGroups } from '../features/preferences/options'
import {budgetOptions,timeOptions,validatePreferences} from '../features/recommendations/preferences.js'
import PreferenceLimits from '../features/recommendations/PreferenceLimits'
import {useRecommendationData} from '../features/recommendations/useRecommendationData.js'

export default function SurpriseMePage() {
  const { preferences, updatePreference, toggleInterest } = usePreferences()
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const data=useRecommendationData(true),categories=data.categories.map(c=>({...interests.find(i=>i.value===c.slug),value:c.slug,label:c.name}))
  usePageTitle('Surprise Me | Unseen Jo')
  function submit(event) {
    event.preventDefault()
    const nextErrors = validatePreferences(preferences)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      const name = Object.keys(nextErrors)[0]
      if(['totalBudget','hoursAvailable'].includes(name)){document.querySelector('.recommendation-limits').open=true;document.querySelector(`[name="${name}"]`)?.focus()}
      else document.querySelector(`.discovery-field--${name} select, .discovery-field--${name} summary`)?.focus()
      return
    }
    navigate('/discovery-result')
  }
  const groupOptions = key => preferenceGroups.find(group => group.key === key).options
  return <div className="surprise-page">
    <section className="surprise-hero" aria-labelledby="surprise-title">
      <AssetImage className="surprise-hero__image" src="/assets/figma/surprise/waterfall-hero.png" alt={tx("A waterfall and rocky forest stream in the original Figma hero")} width="824" height="1024" fetchPriority="high" loading="eager" sizes="(max-width: 800px) 100vw, 60vw" />
      <div className="surprise-hero__copy">
        <Reveal entrance><h1 id="surprise-title"><span>{tx("Ready for")}</span>{tx(' ')}<span>{tx("something")}</span>{tx(' ')}<span>{tx("unexpected?")}</span></h1></Reveal>
        <Reveal entrance delay={0.12}><p><span>{tx("Tell us a little about your day.")}</span>{tx(' ')}<span>{tx("We’ll find a place you didn’t know")}</span>{tx(' ')}<span>{tx("you were looking for.")}</span></p></Reveal>
      </div>
    </section>
    <Reveal entrance delay={0.18} className="surprise-panel-reveal">
      <form className="surprise-panel" onSubmit={submit} noValidate aria-label={tx("Surprise Me preferences")}>
        <div className="surprise-fields">
          <PreferenceField name="startingLocation" label={tx("Starting Location")} icon="location" value={preferences.startingLocation} options={locations} onChange={value => updatePreference('startingLocation', value)} error={errors.startingLocation} />
          <PreferenceField name="availableTime" label={tx("Available time")} icon="stopwatch" value={preferences.availableTime} options={timeOptions} onChange={value => updatePreference('availableTime', value)} error={errors.availableTime} />
          <PreferenceField name="budget" label={tx("Budget")} icon="budget" value={preferences.budget} options={budgetOptions} onChange={value => updatePreference('budget', value)} error={errors.budget} />
          <PreferenceField name="interests" label={tx("Interest")} icon="interest" error={errors.interests} summary={preferences.interests.length ? categories.filter(option => preferences.interests.includes(option.value)).map(option => tx(option.label)).join(', ') : 'Choose interests'}>
            <fieldset><legend className="sr-only">{tx("Select interests")}</legend>
              {tx(categories.map(option => <label key={option.value}><input type="checkbox" name="surpriseInterests" value={option.value} checked={preferences.interests.includes(option.value)} onChange={() => toggleInterest(option.value)} />{tx(option.label)}</label>))}
            </fieldset>
          </PreferenceField>
          <PreferenceField name="transportation" label={tx("Transportation")} icon="transportation" value={preferences.transportation} options={groupOptions('transportation').map(option => option.value === 'public' ? { ...option, label: 'Public transport' } : option)} onChange={value => updatePreference('transportation', value)} error={errors.transportation} />
          <PreferenceField name="travelGroup" label={tx("Traveling with")} icon="companions" value={preferences.travelGroup} options={groupOptions('travelGroup')} onChange={value => updatePreference('travelGroup', value)} error={errors.travelGroup} />
        </div>
        <PreferenceLimits errors={errors}/>
        <div className="surprise-submit"><Button type="submit" variant="terracotta" disabled={data.status!=='ready'}><AssetImage src="/assets/figma/surprise/surprise-action.png" alt={tx("")} width="48" height="48" />{tx("Surprise Me")}</Button></div>
        <p className="surprise-demo-note">{tx(data.privatePrototype?'Private prototype recommendations use the completed demonstration catalog.':'Published places, ranked using your preferences and available evidence.')}</p>
        {data.status==='loading'&&<p role="status">{tx('Loading interests…')}</p>}
        {data.error&&<p role="alert">{tx(data.error)} <button type="button" onClick={data.retry}>{tx('Try again')}</button></p>}
        {tx(Object.keys(errors).length ? <p role="alert" className="surprise-validation">{tx("Please correct the highlighted preferences.")}</p> : null)}
      </form>
    </Reveal>
  </div>
}
