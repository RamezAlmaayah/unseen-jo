import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {loadEnv} from 'vite'
import {createClient} from '@supabase/supabase-js'
import {readSupabaseConfig} from '../src/lib/supabase/config.js'
const config=readSupabaseConfig(loadEnv('production',process.cwd(),'VITE_'));assert.equal(config.url,'https://dkhwwvoplhfjccvjegty.supabase.co')
const client=createClient(config.url,config.publishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}),results=[]
for(const [name,query]of [['only reviewed translations of published destinations are public',client.from('place_translations').select('place_id,editorial_status,source_updated_at,places!inner(status,updated_at)')],['published bilingual content is actually readable',client.from('places').select('id,slug,status,place_translations(locale,name,editorial_status)').eq('status','published')]]){const {data,error}=await query;assert.equal(error,null);assert.equal(data.length,6);if(name.startsWith('only')){assert.ok(data.every(t=>t.editorial_status==='reviewed'&&t.places.status==='published'&&new Date(t.source_updated_at).getTime()===new Date(t.places.updated_at).getTime()))}else{assert.ok(data.every(p=>p.status==='published'&&p.place_translations.length===1&&p.place_translations[0].editorial_status==='reviewed'))}results.push({name,status:'passed'});console.log('PASS '+name)}
const denied=await client.from('place_translations').insert({place_id:'00000000-0000-4000-8000-000000000000',locale:'ar-JO'});assert.equal(denied.error?.code,'42501');results.push({name:'anonymous translation insert denied before any row can be created',status:'passed'});console.log('PASS anonymous translation insert denied')
await writeFile('docs/validation/phase04l-hosted-tests.json',JSON.stringify({project:'dkhwwvoplhfjccvjegty',scope:'Real anonymous SDK: reads plus a denied insert permission probe; zero stored mutations',passed:results.length,results},null,2)+'\n')
