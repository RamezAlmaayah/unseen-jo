import {additionalPreferenceOptions,locations,preferenceGroups} from '../preferences/options.js'
export const timeOptions=[...preferenceGroups.find(g=>g.key==='availableTime').options,...additionalPreferenceOptions.availableTime]
export const budgetOptions=[...preferenceGroups.find(g=>g.key==='budget').options,...additionalPreferenceOptions.budget]
export function validatePreferences(p){
 const errors={}
 for(const [key,max] of [['totalBudget',1000000],['hoursAvailable',168]])if(p[key]!==''&&p[key]!=null&&(!Number.isFinite(Number(p[key]))||Number(p[key])<0||Number(p[key])>max||key==='hoursAvailable'&&Number(p[key])===0))errors[key]='Enter a valid non-negative amount or a positive number of hours.'
 if(!locations.some(l=>l.value===p.startingLocation))errors.startingLocation='Choose a starting location.'
 if(!timeOptions.some(t=>t.value===p.availableTime)&&!p.hoursAvailable)errors.availableTime='Choose an available time.'
 if(!budgetOptions.some(t=>t.value===p.budget)&&p.totalBudget==='')errors.budget='Choose a budget in JOD.'
 return errors
}
