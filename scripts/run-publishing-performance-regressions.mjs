import {spawn} from 'node:child_process'
import {mkdir,writeFile,readFile} from 'node:fs/promises'
const demo='http://127.0.0.1:4186',live='http://127.0.0.1:4190',results=process.argv.length>2?JSON.parse(await readFile('docs/validation/publishing-performance-regressions.json','utf8').catch(()=> '[]')):[]
const jobs=[
 ['check-phase01a','demo'],['check-phase01b','demo'],['check-phase01c','demo'],['check-landing-refinement','demo'],['check-global-ui-scale','demo'],
 ['check-phase02a'],['check-phase02b'],['check-phase02b-hosted'],['check-phase02b-browser','demo'],
 ['check-phase03'],['check-phase03-browser','demo'],['check-phase03-refinement','demo'],['check-phase03-details-controls','demo'],['check-phase03-quality','demo'],
 ['check-phase04'],['check-phase04-hosted'],['check-admin-invitation'],['check-admin-acceptance-runner'],['check-admin-refinement','live'],['check-phase04-browser','live'],
 ['check-localization'],['check-localization-database'],['check-localization-hosted'],['check-localization-browser','live'],['check-localization-destinations-browser','live'],['check-localization-accessibility','live'],['check-localization-interactions','live'],
 ['check-bilingual-review'],['check-bilingual-review-database'],['check-bilingual-review-browser','live'],['check-tourism-completion'],['check-tourism-completion-browser','live']
].filter(([name])=>process.argv.length<3||process.argv.slice(2).includes(name))
await mkdir('artifacts/publishing-performance/regressions',{recursive:true})
for(const[name,mode]of jobs){
 const started=Date.now(),result=await new Promise(resolve=>{
  const child=spawn(process.execPath,[`scripts/${name}.mjs`],{windowsHide:true,env:{...process.env,QA_BASE_URL:mode==='demo'?demo:live,QA_LIVE_URL:live}});let output='';const timer=setTimeout(()=>child.kill(),360000)
  child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);child.on('error',e=>{clearTimeout(timer);resolve({exitCode:-1,output:e.message})});child.on('close',exitCode=>{clearTimeout(timer);resolve({exitCode,output})})
 });await writeFile(`artifacts/publishing-performance/regressions/${name}.log`,result.output);const entry={name,exitCode:result.exitCode,durationMs:Date.now()-started},previous=results.findIndex(r=>r.name===name);if(previous>=0)results[previous]=entry;else results.push(entry);console.log(`${result.exitCode===0?'PASS':'FAIL'} ${name} (${Date.now()-started}ms)`+(result.exitCode?'\n'+result.output.slice(-2200):''));await writeFile('docs/validation/publishing-performance-regressions.json',JSON.stringify(results,null,2)+'\n')
}
if(results.some(r=>r.exitCode!==0))process.exitCode=1
