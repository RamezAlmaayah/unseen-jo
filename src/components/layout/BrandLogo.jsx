import {Link} from 'react-router'
import AssetImage from '../ui/AssetImage'
import {tx} from '../../i18n/index.js'

// The public navigation and Admin share the original asset and wordmark styles.
export default function BrandLogo({to='/',label=tx('Unseen Jo home'),className='',wordmarkClassName='',onClick}) {
  return <Link to={to} className={`brand ${className}`.trim()} aria-label={label} onClick={onClick}>
    <AssetImage src="/assets/figma/preferences/brand-logo.png" alt="" width="56" height="53" />
    <span className={wordmarkClassName||undefined}>{tx('Unseen Jo')}</span>
  </Link>
}
