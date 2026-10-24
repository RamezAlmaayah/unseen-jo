import {tx,isArabic} from '../../i18n/index.js'
import {weightPercentages} from '../../features/recommendations/engine.js'
export default function MatchingReasons({ reasons,score,coverage,scoreSupported,weights:configuredWeights }) {
  const weights=weightPercentages(configuredWeights)
  const text=reason=>{if(!reason.key)return tx(reason.text);let value=tx(reason.key);reason.values.forEach((v,i)=>{value=value.replace(`{{v${i}}}`,Array.isArray(v)?v.map(s=>tx(s.charAt(0).toUpperCase()+s.slice(1))).join(isArabic()?'، ':', '):tx(v))});return value}
  return <section className="matching-reasons" aria-labelledby="matching-title">
    <h2 id="matching-title">{tx("Why This Matches You")}</h2>
    {typeof coverage==='number'&&<div className="recommendation-score">{scoreSupported?<strong>{tx('Compatibility score')}: {tx(score)}/{tx(100)}</strong>:<strong>{tx('Not enough evidence to display a compatibility score')}</strong>}<p>{tx('Evidence coverage')}: {tx(Math.round(coverage*100))}%</p><details><summary>{tx('How this score works')}</summary><p>{tx('A weighted preference match, reduced by missing evidence. This is not a probability or a guarantee. Only supplied preferences are included. Unknown factors add no points. Total trip cost and travel time remain unverified.')}</p><p>{tx(`Weights: interests ${weights.interest}%, visit time ${weights.time}%, recorded admission ${weights.budget}%, straight-line proximity ${weights.distance}%, transport and group tags ${weights.suitability}%.`)}</p></details></div>}
    <ul>{tx(reasons.map(reason => <li key={reason.id} data-fit={reason.fits ? 'yes' : 'no'}>
      <span className={reason.fits ? 'figma-checkmark' : 'reason-symbol'} aria-hidden="true">{tx(reason.fits ? '✓' : '–')}</span>
      <span>{text(reason)}</span>
    </li>))}</ul>
  </section>
}
