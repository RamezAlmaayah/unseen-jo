import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
import {createImageDelivery} from '../src/features/tourism/imageDelivery.js'
let now=0,calls=0
const client={storage:{from:()=>({createSignedUrl:async path=>{calls++;return {data:{signedUrl:'isolated-signature-'+calls+'-'+path}}}})}},delivery=createImageDelivery(client,{now:()=>now}),results=[]
delivery.primeOriginal('place/variant.webp','existing-batch-signature',270000)
assert.equal((await delivery.forPath('place/variant.webp').original()).src,'existing-batch-signature');assert.equal(calls,0);results.push({name:'Pre-generated private variants reuse genuinely issued batch signatures',status:'passed'})
now=269999;assert.equal((await delivery.forPath('place/variant.webp').original()).src,'existing-batch-signature');now=270000;assert.match((await delivery.forPath('place/variant.webp').original()).src,/isolated-signature-1/);assert.equal(calls,1);results.push({name:'Private variant/original renews at its actual expiry through normal Storage API',status:'passed'})
delivery.primeOriginal('place/old.webp','expired-signature',269000);assert.match((await delivery.forPath('place/old.webp').original()).src,/isolated-signature-2/);results.push({name:'An expired signature cannot be refreshed by priming',status:'passed'})
await Promise.all([delivery.forPath('place/variant.webp').original(),delivery.forPath('place/variant.webp').original()]);assert.equal(calls,2);delivery.clear();await delivery.forPath('place/variant.webp').original();assert.equal(calls,3);results.push({name:'Concurrent reuse deduplicates calls and logout invalidation clears signatures',status:'passed'})
await writeFile('docs/validation/private-prototype-media-cache.json',JSON.stringify({scope:'Deterministic signed-URL cache test; no real tokens or hosted operations',results},null,2)+'\n');results.forEach(r=>console.log('PASS '+r.name))
