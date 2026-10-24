import {mkdir,readFile,readdir,writeFile,access} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {spawn,spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
export const project='unseen-jo-privacy-integration',root=resolve('.local-privacy'),api='http://127.0.0.1:55431'
export function safeLocalUrl(value){const u=new URL(value);if(u.origin!==api||u.username||u.password)throw Error('Refusing non-isolated API target');return u}
export const localFetch=(url,options={})=>fetch(safeLocalUrl(String(url)),{...options,redirect:'error'})
export function localEnv(){const env={...process.env};for(const k of Object.keys(env))if(/^(SUPABASE_|VITE_SUPABASE_|PG|DATABASE_URL$|API_URL$|ANON_KEY$|SERVICE_ROLE_KEY$|DOCKER_CONTEXT$|DOCKER_CERT_PATH$|DOCKER_TLS)/.test(k))delete env[k];env.DOCKER_HOST=process.platform==='win32'?'npipe:////./pipe/docker_engine':'unix:///var/run/docker.sock';return env}
export function cli(args){if(!['["start"]','["status","--output","json"]'].includes(JSON.stringify(args)))throw Error('Unsafe CLI command refused');return spawnSync(process.execPath,[resolve('node_modules/supabase/dist/supabase.js'),...args,'--workdir',root],{env:localEnv(),encoding:'utf8',windowsHide:true,timeout:300000,maxBuffer:8*1024*1024})}
export async function assertWorkspace(){const m=JSON.parse(await readFile(join(root,'isolation.json'),'utf8'));if(m.project!==project||m.api!==api)throw Error('Isolation marker mismatch');const config=await readFile(join(root,'supabase/config.toml'),'utf8');if(!config.includes(`project_id = "${project}"`)||/\.supabase\.co|env\(/.test(config))throw Error('Unsafe configuration');try{await access(join(root,'supabase/.temp/project-ref'));throw Error('Linked project refused')}catch(e){if(e.code!=='ENOENT')throw e}for(const row of m.migrations){const bytes=await readFile(join(root,'supabase/migrations',row.name));if(createHash('sha256').update(bytes).digest('hex')!==row.sha256)throw Error('Migration snapshot mismatch')};return m}
export async function prepare(){
 await mkdir(root,{recursive:true});try{const m=JSON.parse(await readFile(join(root,'isolation.json'),'utf8'));if(m.project!==project)throw Error('Existing workspace is not owned by this task')}catch(e){if(e.code!=='ENOENT')throw e;const existing=await readdir(root);if(existing.length)throw Error('Refusing to reuse an unmarked workspace')}
 const base=join(root,'supabase');await mkdir(join(base,'migrations'),{recursive:true});await mkdir(join(base,'functions/account-privacy'),{recursive:true})
 const names=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort(),migrations=[]
 for(const stale of await readdir(join(base,'migrations')))if(!names.includes(stale))throw Error('Unexpected old migration in isolated workspace')
 for(const name of names){const bytes=await readFile('supabase/migrations/'+name);await writeFile(join(base,'migrations',name),bytes);migrations.push({name,sha256:createHash('sha256').update(bytes).digest('hex')})}
 for(const name of ['index.ts','handler.js'])await writeFile(join(base,'functions/account-privacy',name),await readFile('supabase/functions/account-privacy/'+name))
 await writeFile(join(base,'config.toml'),`project_id = "${project}"
[api]
enabled = true
port = 55431
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
[db]
port = 55432
shadow_port = 55430
major_version = 17
[db.seed]
enabled = false
[studio]
enabled = false
[local_smtp]
enabled = true
port = 55434
[storage]
enabled = true
file_size_limit = "5MiB"
[auth]
enabled = true
site_url = "http://127.0.0.1:4196"
additional_redirect_urls = ["http://127.0.0.1:4196/auth/callback"]
enable_signup = true
[auth.email]
enable_signup = true
enable_confirmations = false
[auth.mfa.totp]
enroll_enabled = true
verify_enabled = true
[edge_runtime]
enabled = true
inspector_port = 55438
[analytics]
enabled = false
[functions.account-privacy]
verify_jwt = true
`)
 await writeFile(join(root,'edge.env'),'PRIVACY_ALLOWED_ORIGINS=http://127.0.0.1:4196\n')
 await writeFile(join(root,'isolation.json'),JSON.stringify({project,api,migrations,source:'Repository migration/function snapshots only. No production configuration, seeds, users, credentials or Storage copied.'},null,2))
 await assertWorkspace();console.log('Prepared isolated workspace with '+migrations.length+' migrations; no containers or data changed.')
}
export async function start(){await assertWorkspace();const r=cli(['start']);const ok=r.status===0;let failure='Local startup failed; inspect local prerequisites';try{if(JSON.parse(r.stdout).error?.code==='DockerLifecycleInspectError')failure='DockerLifecycleInspectError: Docker command not found; Podman also unavailable'}catch{/* Do not expose CLI credential output. */}await mkdir('docs/validation',{recursive:true});await writeFile('docs/validation/local-privacy-stack.json',JSON.stringify({status:ok?'STARTED':'BLOCKED',project,api,exitCode:r.status,reason:ok?'Local services started; credentials suppressed.':failure},null,2));console.log(ok?'Local stack started; credential output suppressed.':'BLOCKED: isolated local stack could not start. No hosted fallback attempted.');if(!ok)process.exitCode=2}
export async function serve(){await assertWorkspace();if(cli(['status','--output','json']).status!==0)throw Error('Start the isolated stack before serving Edge Functions');const child=spawn(process.execPath,[resolve('node_modules/supabase/dist/supabase.js'),'functions','serve','account-privacy','--workdir',root,'--env-file',join(root,'edge.env')],{env:localEnv(),windowsHide:true,stdio:'ignore'});console.log('Local Edge serve launched; runtime/credential output suppressed. Verify with the local integration runner.');child.on('error',()=>{console.error('Local Edge process could not start');process.exitCode=2});child.on('close',code=>{if(code)process.exitCode=2});process.on('SIGINT',()=>child.kill());process.on('SIGTERM',()=>child.kill())}
if(process.argv[1]&&resolve(process.argv[1])===resolve('scripts/local-privacy-environment.mjs')){const mode=process.argv[2];if(mode==='prepare')await prepare();else if(mode==='start')await start();else if(mode==='serve')await serve();else throw Error('Use prepare, start or serve')}
