export const initialPreferences = {
  startingLocation: 'amman', interests: ['nature'], availableTime: '2-hours',
  budget: 'under-10', travelGroup: 'solo', transportation: 'public',
  totalBudget:'',hoursAvailable:'',strict:{},
}

// Additional exact Figma selections used by Surprise Me, in the same store.
export const additionalPreferenceOptions = {
  availableTime: [{ value: '4-hours', label: '4 Hours' }],
  budget: [{ value: 'jod:20', label: '20 JD' }],
}

export const locations = [
  { value: 'amman', label: 'Amman' }, { value: 'ajloun', label: 'Ajloun' },
  { value: 'irbid', label: 'Irbid' }, { value: 'salt', label: 'Salt' },
  { value: 'madaba', label: 'Madaba' }, { value: 'aqaba', label: 'Aqaba' },
]
export const interests = ['Nature', 'Food', 'History', 'Culture', 'Adventure', 'Photography', 'Family'].map(label => ({
  value: label.toLowerCase(), label, icon: `${label.toLowerCase()}.png`,
}))
export const preferenceGroups = [
  { key: 'availableTime', heading: 'How much time do you have?', className: 'time', options: [
    { value: '30-min', label: '30 min', icon: 'stopwatch.png' }, { value: '2-hours', label: '2 Hours' },
    { value: 'half-day', label: 'Half Day' }, { value: 'full-day', label: 'Full Day' },
  ] },
  { key: 'budget', heading: 'What’s your budget?', className: 'budget', options: [
    { value: 'free', label: 'Free', symbol: '$' }, { value: 'under-10', label: 'Under 10 JD' },
    { value: '10-30', label: '10-30 JD' }, { value: 'over-30', label: '30-... JD' },
  ] },
  { key: 'travelGroup', heading: 'Who are you with?', className: 'group', options: [
    { value: 'solo', label: 'Solo', icon: 'companion.png' }, { value: 'couple', label: 'Couple' },
    { value: 'friends', label: 'Friends' }, { value: 'family', label: 'Family' },
  ] },
  { key: 'transportation', heading: 'Transportation', className: 'transport', options: [
    { value: 'car', label: 'Car', icon: 'car.png' },
    { value: 'public', label: 'Public Transportation' }, { value: 'walking', label: 'Walking/Nearby' },
  ] },
]
