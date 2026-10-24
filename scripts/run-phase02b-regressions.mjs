// Sequential browser runs avoid competing screenshot/navigation timing.
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
const scripts = ['check-phase01a','check-phase01b','check-phase01c','check-landing-refinement','check-global-ui-scale']
const results = []
await mkdir('artifacts/phase02b/regressions', { recursive: true })
for (const name of scripts) {
  const result = await new Promise(resolve => {
    const process = spawn(globalThis.process.execPath, [`scripts/${name}.mjs`], { env: { ...globalThis.process.env, QA_BASE_URL: globalThis.process.env.QA_BASE_URL || 'http://127.0.0.1:4184' }, windowsHide: true })
    let output = ''
    process.stdout.on('data', data => { output += data })
    process.stderr.on('data', data => { output += data })
    process.on('error', error => resolve({ code: -1, output: error.message }))
    process.on('close', code => resolve({ code, output }))
  })
  await writeFile(`artifacts/phase02b/regressions/${name}.log`, result.output)
  results.push({ name, exitCode: result.code })
  console.log(`${result.code === 0 ? 'PASS' : 'FAIL'} ${name}\n${result.output.slice(-1500)}`)
}
await writeFile('artifacts/phase02b/regressions/results.json', JSON.stringify(results, null, 2) + '\n')
if (results.some(r => r.exitCode !== 0)) process.exitCode = 1
