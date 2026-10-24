// Short-lived, in-memory signatures only. Every variant goes through Storage RLS;
// no public bucket, persistent signed URL, or client-side token rewriting.
export function createImageDelivery(client, {now=Date.now}={}) {
  const cache=new Map(), media=new Map(), waiting=[]
  let active=0
  function schedule(task) {
    return new Promise((resolve,reject)=>{waiting.push({task,resolve,reject});drain()})
  }
  function drain() {
    while(active<4&&waiting.length){const job=waiting.shift();active++;Promise.resolve().then(job.task).then(job.resolve,job.reject).finally(()=>{active--;drain()})}
  }
  function variant(path,width) {
    if(![0,320,640,1280,2400].includes(width))return Promise.reject(Error('Unsupported display image size.'))
    const key=`${path}:${width}`,old=cache.get(key)
    if(old&&old.expires>now())return old.promise
    for(const [k,v] of cache)if(v.expires<=now())cache.delete(k)
    if(cache.size>=256)cache.delete(cache.keys().next().value)
    const entry={expires:now()+270000}
    entry.promise=schedule(async()=>{
      const {data,error}=await client.storage.from('place-images').createSignedUrl(path,300,width?{transform:{width,quality:90,resize:'contain'}}:undefined)
      if(error||!data?.signedUrl)throw Error('Display image temporarily unavailable.')
      return {width,src:data.signedUrl}
    }).catch(error=>{if(cache.get(key)===entry)cache.delete(key);throw error})
    cache.set(key,entry);return entry.promise
  }
  return {
    // Prime only a genuinely issued signature, preserving its original deadline.
    // This lets private pre-generated variants reuse the batched signatures and
    // still renew through normal Storage RLS after expiry.
    primeOriginal(path,src,expires=now()+270000){
      if(expires<=now())return
      const key=`${path}:0`
      if(cache.size>=256&&!cache.has(key))cache.delete(cache.keys().next().value)
      cache.set(key,{expires,promise:Promise.resolve({width:0,src})})
    },
    forPath(path){
      if(!media.has(path))media.set(path,{sources:widths=>Promise.all(widths.map(width=>variant(path,width))),original:()=>variant(path,0)})
      // A catalog has a bounded lifetime; don't accumulate historical objects.
      if(media.size>256)media.delete(media.keys().next().value)
      return media.get(path)
    },
    clear(){cache.clear();media.clear()},
  }
}
