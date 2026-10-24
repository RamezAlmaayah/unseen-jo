import {tx} from '../../i18n/index.js'
import {Link} from 'react-router'
import {useUserAuth,useUserAccount} from './context.js'
export default function PreferenceAccountActions(){
 const {user}=useUserAuth(),account=useUserAccount()
 return <div className="preference-account-actions">{user?<><button type="button" className="text-action" disabled={account.status!=='ready'||account.busy||!!account.conflict} onClick={()=>void account.persistPreferences()}>{tx(account.busy?'Saving…':'Save preferences to my account')}</button><p role="status">{tx(account.notice)}</p></>:<p>{tx('Guest preferences work without an account.')} <Link to="/auth?mode=login&returnTo=/preferences">{tx('Sign in to sync across devices')}</Link></p>}</div>
}
