import {spawn} from 'node:child_process'
const suites={
 'check-phase01a':[['check-current-public-layout.mjs','all']],
 'check-phase01b':[['check-phase05-browser.mjs']],
 'check-phase01c':[['check-phase06-browser.mjs'],['check-phase07-browser.mjs']],
 'check-landing-refinement':[['check-current-public-layout.mjs','landing']],
 'check-global-ui-scale':[['check-current-public-layout.mjs','scale']]
}
export async function runCurrentRegression(name){
 const jobs=process.env.QA_LEGACY_DEMO==='1'?[[name+'.legacy.mjs']]:suites[name]
 for(const args of jobs){const code=await new Promise(resolve=>{const child=spawn(process.execPath,args.map((v,i)=>i===0?'scripts/'+v:v),{stdio:'inherit',windowsHide:true,env:{...process.env,QA_BASE_URL:process.env.QA_BASE_URL||'http://127.0.0.1:4184'}});child.on('close',resolve);child.on('error',()=>resolve(1))});if(code)throw Error(`${args[0]} failed (${code})`)}
}
