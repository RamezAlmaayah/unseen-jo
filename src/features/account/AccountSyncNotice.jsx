import {tx} from '../../i18n/index.js'
import {useUserAccount} from './context.js'
export default function AccountSyncNotice(){
 const account=useUserAccount()
 if(!account.conflict&&!account.error)return null
 return <aside className="account-sync-notice" aria-label={tx('Account synchronization')}>
  {account.error&&<p role="alert">{tx(account.error)} <button type="button" className="text-action" onClick={()=>void account.refresh(true)}>{tx('Try again')}</button></p>}
  {account.conflict&&<><p>{tx('Your account has different discovery preferences. Choose which to use for this visit.')}</p><div className="inline-actions"><button type="button" onClick={account.useAccountPreferences}>{tx('Use account preferences')}</button><button type="button" onClick={account.keepCurrentPreferences}>{tx('Keep current preferences')}</button></div></>}
 </aside>
}
