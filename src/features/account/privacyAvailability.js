// Deliberately impossible to enable in a production bundle. Real integration and
// owner activation must be reviewed separately before changing this policy.
export function privacyQaEnabled(env,hostname){return env.DEV===true&&env.VITE_PRIVACY_QA==='true'&&['127.0.0.1','localhost','[::1]'].includes(hostname)}
