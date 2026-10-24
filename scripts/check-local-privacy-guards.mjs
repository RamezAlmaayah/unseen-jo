import assert from 'node:assert/strict'
import {safeLocalUrl,localEnv,cli,assertWorkspace} from './local-privacy-environment.mjs'
await assertWorkspace()
for(const url of ['https://dkhwwvoplhfjccvjegty.supabase.co','http://localhost:55431','http://127.0.0.1:54321','http://127.0.0.1:55431@evil.invalid','https://127.0.0.1:55431'])assert.throws(()=>safeLocalUrl(url))
assert.equal(safeLocalUrl('http://127.0.0.1:55431/auth/v1/user').hostname,'127.0.0.1')
for(const command of ['reset','deploy','push','link'])assert.throws(()=>cli([command]))
for(const args of [['db','dump','--linked'],['start','--db-url=https://example.invalid'],['status','--workdir','..']])assert.throws(()=>cli(args))
assert.ok(localEnv().DOCKER_HOST.startsWith(process.platform==='win32'?'npipe:':'unix:'))
assert.ok(!localEnv().SUPABASE_ACCESS_TOKEN)
console.log('PASS isolated workspace, loopback target, no hosted credentials and destructive CLI guards')
