import {build,loadEnv} from 'vite'
import {netlifyConfig,NETLIFY_SAFETY_ENV} from './netlify-config.mjs'

const {origin}=netlifyConfig(loadEnv('production',process.cwd(),'VITE_'))
Object.assign(process.env,NETLIFY_SAFETY_ENV)
console.log('Netlify build: Supabase live data; static legal drafts; privacy QA and private prototype disabled.')
console.log(origin?`Configured site origin: ${origin}`:'Site origin unset: canonical and absolute social image URLs will be omitted. Configure the assigned Netlify origin and rebuild before launch.')
await build({mode:'production'})
await import('./check-netlify-build.mjs')
