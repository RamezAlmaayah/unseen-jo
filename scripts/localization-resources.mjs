import {readFile,writeFile} from 'node:fs/promises'
// Later account/discovery features also maintain JSON message sets. Preserve
// those keys when regenerating the original text resources.
const data=(await Promise.all(['ui.ar.txt','review.ar.txt','publishing.ar.txt','recommendations.ar.txt'].map(f=>readFile('src/i18n/locales/'+f,'utf8')))).join('\n'),ar={...JSON.parse(await readFile('src/i18n/locales/ar-JO.json','utf8')),...JSON.parse(await readFile('src/i18n/locales/phase08.ar.json','utf8'))}
for(const line of data.split(/\r?\n/)){if(!line.trim())continue;const at=line.indexOf('|');if(at<1||/^\{\{v\d+\}\}$/.test(line.slice(0,at).trim()))throw Error('Invalid or unsafe broad translation key '+line);ar[line.slice(0,at)]=line.slice(at+1)}
const sorted=Object.fromEntries(Object.entries(ar).sort(([a],[b])=>a.localeCompare(b,'en')))
await writeFile('src/i18n/locales/ar-JO.json',JSON.stringify(sorted,null,2)+'\n')
await writeFile('src/i18n/locales/en.json',JSON.stringify(Object.fromEntries(Object.keys(sorted).map(key=>[key,key])),null,2)+'\n')
console.log(Object.keys(sorted).length+' bilingual UI resource keys')
