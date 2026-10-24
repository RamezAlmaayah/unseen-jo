import { additionalPreferenceOptions, interests, locations, preferenceGroups } from '../preferences/options'

export const demoTimeOptions = [
  ...preferenceGroups.find(group => group.key === 'availableTime').options,
  ...additionalPreferenceOptions.availableTime,
]
export const demoBudgetOptions = [
  ...preferenceGroups.find(group => group.key === 'budget').options,
  ...additionalPreferenceOptions.budget,
]

export function validateDemoPreferences(preferences) {
  const errors = {}
  if (!locations.some(option => option.value === preferences.startingLocation)) errors.startingLocation = 'Choose a starting location.'
  if (!Array.isArray(preferences.interests) || preferences.interests.length === 0 || preferences.interests.some(value => !interests.some(option => option.value === value))) errors.interests = 'Choose at least one interest.'
  if (!demoTimeOptions.some(option => option.value === preferences.availableTime)) errors.availableTime = 'Choose an available time.'
  if (!demoBudgetOptions.some(option => option.value === preferences.budget)) errors.budget = 'Choose a budget in JOD.'
  for (const key of ['transportation', 'travelGroup']) {
    if (!preferenceGroups.find(group => group.key === key).options.some(option => option.value === preferences[key])) errors[key] = 'Choose an option.'
  }
  return errors
}

// This describes ONE fixed Figma sample. It never selects/ranks destinations.
// Replacing this object with a real API recommendation is a later-phase task.
export function buildSampleRecommendation(place, preferences) {
  const minutes = { '30-min': 30, '2-hours': 120, '4-hours': 240, 'half-day': 240, 'full-day': 480 }[preferences.availableTime]
  const budget = demoBudgetOptions.find(option => option.value === preferences.budget)?.label ?? 'Not selected'
  const budgetDescription = budget.charAt(0).toLowerCase() + budget.slice(1)
  const group = preferenceGroups.find(item => item.key === 'travelGroup').options.find(option => option.value === preferences.travelGroup)?.label
  const transportation = preferenceGroups.find(item => item.key === 'transportation').options.find(option => option.value === preferences.transportation)?.label
  const natureFits = preferences.interests.includes(place.categoryId)
  const costFits = preferences.budget === 'free' ? place.costJod === 0
    : preferences.budget === 'under-10' ? place.costJod < 10
    : preferences.budget === '10-30' ? place.costJod >= 10 && place.costJod <= 30
    : preferences.budget === 'over-30' ? place.costJod >= 30
    : preferences.budget === 'jod:20' && place.costJod <= 20
  const timeFits = place.durationMinutes[1] <= minutes
  const groupFits = place.groups?.includes(preferences.travelGroup)
  const transportFits = place.transportation?.includes(preferences.transportation)
  return {
    kind: 'fixed-figma-sample', place,
    preferenceSnapshot: { ...preferences, interests: [...preferences.interests] },
    reasons: [
      { id: 'interest', fits: natureFits, text: natureFits ? `Matches your ${place.category} interest` : `Sample category: ${place.category}; interests differ` },
      { id: 'budget', fits: costFits, text: costFits ? `Within your ${budgetDescription} budget` : `${place.costJod} JD sample; budget: ${budget}` },
      { id: 'time', fits: timeFits, text: timeFits ? 'Fits your available time' : `${place.durationLabel} sample exceeds selected time` },
      { id: 'group', fits: groupFits, text: groupFits ? `Good for ${group.toLowerCase()}` : `Friends / family sample; you chose ${group?.toLowerCase()}` },
      { id: 'transport', fits: transportFits, text: transportFits ? 'Accessible by car' : `Car access sample; selected: ${transportation}` },
    ],
  }
}
