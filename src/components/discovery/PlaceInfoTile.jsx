import {tx} from '../../i18n/index.js'
import {Fragment} from 'react'
export default function PlaceInfoTile({ label, value }) {
  return <div className={`place-info-tile ${value ? '' : 'place-info-tile--unavailable'}`}><dt className="sr-only">{tx(label)}</dt><dd>{value?.includes('/') ? value.split('/').map((part,index,all)=><Fragment key={index}>{part}{index<all.length-1?<>{'/'}<br/></>:null}</Fragment>) : value || tx('Information unavailable')}</dd></div>
}
