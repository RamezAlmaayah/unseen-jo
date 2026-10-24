import {tx} from '../../i18n/index.js'
import {usePreferences} from '../preferences/usePreferences.js'
export default function PreferenceLimits({errors={}}){
 const {preferences:p,updatePreference}=usePreferences()
 const requirements=[['interest','Require all selected interests'],['time','Require a complete visit estimate within my time'],['budget','Require a confirmed total trip cost within my budget'],['location','Require a usable location reference'],['transport','Require recorded transport suitability'],['group','Require a matching recorded group tag']]
 return <details className="recommendation-limits"><summary>{tx('Exact amounts and essential requirements')}</summary>
  <div className="recommendation-limit-fields">
   <label>{tx('Total available budget (JOD)')}<input name="totalBudget" type="number" min="0" max="1000000" step="0.01" inputMode="decimal" value={p.totalBudget||''} onChange={e=>updatePreference('totalBudget',e.target.value)} aria-invalid={!!errors.totalBudget} aria-describedby="recommendation-budget-hint"/></label>
   <label>{tx('Available hours')}<input name="hoursAvailable" type="number" min="0.01" max="168" step="0.01" inputMode="decimal" value={p.hoursAvailable||''} onChange={e=>updatePreference('hoursAvailable',e.target.value)} aria-invalid={!!errors.hoursAvailable}/></label>
  </div>
  <p id="recommendation-budget-hint">{tx('Optional exact values override the selected ranges. Over 30 JOD has no upper limit unless you enter one. Admission alone does not establish total trip cost.')}</p>
  <fieldset><legend>{tx('Essential requirements')}</legend>{requirements.map(([key,label])=><label key={key}><input type="checkbox" checked={p.strict?.[key]||false} onChange={e=>updatePreference('strict',{...p.strict,[key]:e.target.checked})}/>{tx(label)}</label>)}</fieldset>
  <p>{tx('Unverified essentials will not count as confirmed matches. Duration is a planning estimate, excluding travel; group tags do not guarantee safety or accessibility.')}</p>
  {(errors.totalBudget||errors.hoursAvailable)&&<p role="alert">{tx(errors.totalBudget||errors.hoursAvailable)}</p>}
 </details>
}
