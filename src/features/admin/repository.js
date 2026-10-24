import { PAGE_SIZE, placePayload, validateImage, backendError, safeHttps } from './model.js'
import {notifyPublicCatalogChange} from '../tourism/catalogEvents.js'
import {createImageDelivery} from '../tourism/imageDelivery.js'
import {searchEmbeds,applyAdminSearch} from '../search/adminSearch.js'
const fields = '*,place_categories(category_id,categories(id,name,slug,is_active)),place_images(*),place_reviews(*),place_translations(*)'
export function createAdminRepository(client,editorId) {
  const delivery=createImageDelivery(client),previews=new Map(),reads=new Map()
  const cached=(key,fn)=>{const previous=reads.get(key);if(previous&&previous.expires>Date.now())return previous.promise;const entry={expires:Date.now()+30000,promise:Promise.resolve().then(fn).catch(error=>{if(reads.get(key)===entry)reads.delete(key);throw error})};reads.set(key,entry);if(reads.size>60)reads.delete(reads.keys().next().value);return entry.promise}
  const previewImage=image=>({...image,url:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="200"%3E%3Crect width="100%25" height="100%25" fill="%23edf4ee"/%3E%3C/svg%3E',delivery:delivery.forPath(image.storage_path)})
  async function signedImages(images) {
    if(!images.length)return []
    for(const [path,entry] of previews)if(entry.expires<=Date.now())previews.delete(path)
    const paths=[...new Set(images.map(i=>i.storage_path))],missing=paths.filter(path=>!previews.has(path))
    if(missing.length){
      const batch=client.storage.from('place-images').createSignedUrls(missing,300).then(({data,error})=>{if(error)throw Error(backendError(error));return new Map(data.map((i,n)=>[i.path||missing[n],i.signedUrl]))})
      for(const path of missing){const entry={expires:Date.now()+270000};entry.promise=batch.then(urls=>{const url=urls.get(path);if(!url)throw Error('Private image preview unavailable.');return url}).catch(error=>{if(previews.get(path)===entry)previews.delete(path);throw error});previews.set(path,entry)}
    }
    const urls=new Map(await Promise.all(paths.map(async path=>[path,await previews.get(path).promise])))
    return images.map(i=>({...i,url:urls.get(i.storage_path),delivery:typeof client.storage.from('place-images').createSignedUrl==='function'?delivery.forPath(i.storage_path):null}))
  }
  async function result(request) {
    const response = await request.abortSignal(AbortSignal.timeout(20000))
    if (response.error) throw new Error(backendError(response.error))
    const path=request.url?.pathname||''
    if(['POST','PATCH','DELETE'].includes(request.method)&&!path.endsWith('/admin_save_quick_draft')&&!path.endsWith('/place_quick_drafts')&&(!path.includes('/rpc/')||/\/admin_(save|review|approve|set|publish|replace|apply)_/.test(path))){reads.clear();previews.clear();delivery.clear();notifyPublicCatalogChange()}
    return response
  }
  const rpc = async (name,args) => (await result(client.rpc(name,args))).data
  const categories = () => cached('categories',async ()=>(await result(client.from('categories').select('*').order('sort_order').order('name'))).data)
  const summary='id,slug,name,city,status,updated_at,verified_at,latitude,longitude,primary_category_id,place_categories(category_id),place_images(is_cover,approved_at),place_reviews(claims_reviewed),place_translations(locale,name,editorial_status,source_updated_at)'
  function collectionQuery({query='',status='',category='',quality='',reviewStatus='',reviewList=false,head=false}={}){
    const embeds=searchEmbeds(query);if(quality==='covers')embeds.push('approved_cover:place_images()');if(quality==='review')embeds.push('reviewed:place_reviews()')
    if(reviewStatus)embeds.push('review_match:place_translations()',...(reviewStatus==='pending'?['any_translation:place_translations()']:[]))
    const projection=reviewList?'id,slug,name,status,updated_at,place_translations(locale,name,editorial_status,source_updated_at)':summary
    let q=client.from('places').select((category?projection.replace('place_categories(', 'place_categories!inner('):projection)+(embeds.length?','+embeds.join(','):''),{count:'exact',head})
    const searched=applyAdminSearch(q,query);q=searched.request;const and=[...searched.conditions]
    if(status)q=q.eq('status',status)
    if(category)q=q.eq('place_categories.category_id',category)
    if(quality==='coordinates')and.push('or(latitude.is.null,longitude.is.null)')
    if(quality==='covers')q=q.eq('approved_cover.is_cover',true).not('approved_cover.approved_at','is',null).is('approved_cover',null)
    if(quality==='review'){q=q.eq('status','draft').eq('reviewed.claims_reviewed',true);and.push('or(verified_at.is.null,reviewed.is.null)')}
    if(quality==='incomplete')and.push('or(description.is.null,description.not.match."[^[:space:]](.|[[:space:]]){78,}[^[:space:]]",source_url.is.null,primary_category_id.is.null)')
    if(reviewStatus){q=q.eq('review_match.locale','ar-JO').eq('review_match.editorial_status',reviewStatus);if(reviewStatus==='pending'){q=q.eq('any_translation.locale','ar-JO');and.push('or(review_match.not.is.null,any_translation.is.null)')}else q=q.not('review_match','is',null)}
    if(and.length)q=q.or(`and(${and.join(',')})`)
    return q
  }
  const collection=(options={})=>cached('collection:'+JSON.stringify(options),()=>result(collectionQuery(options).order(options.sort==='name'?'name':'updated_at',{ascending:options.sort==='name'}).order('id').range((options.page||0)*PAGE_SIZE,((options.page||0)+1)*PAGE_SIZE-1)))
  const qualityCount=quality=>result(collectionQuery({quality,head:true})).then(r=>r.count)
  async function listPlaces({ query = '', status = '', category = '', sort = 'updated_at', page = 0 } = {}) {
    let q = client.from('places').select((category ? fields.replace('place_categories(', 'place_categories!inner(') : fields)+ (searchEmbeds(query).length?','+searchEmbeds(query).join(','):''), { count: 'exact' })
    const searched=applyAdminSearch(q,query);q=searched.request;if(searched.conditions.length)q=q.or('and('+searched.conditions.join(',')+')')
    if (status) q = q.eq('status',status)
    if (category) q = q.eq('place_categories.category_id',category)
    return result(q.order(sort === 'name' ? 'name' : 'updated_at', { ascending: sort === 'name' }).order('id').range(page * PAGE_SIZE,(page + 1) * PAGE_SIZE - 1))
  }
  async function getPlace(id) {
    if (!/^[a-f\d-]{36}$/i.test(id)) throw new Error('Invalid destination identifier.')
    const [row,review,issues] = await Promise.all([result(client.from('places').select(fields).eq('id',id).maybeSingle()),result(client.from('place_reviews').select('*').eq('place_id',id).maybeSingle()),rpc('admin_publication_issues',{target:id})])
    if (!row.data) throw new Error('Destination unavailable.')
    return { ...row.data, review: review.data, issues }
  }
  async function upload(placeId,file,onProgress) {
    const {type,extension} = await validateImage(file)
    const path = `${placeId}/${crypto.randomUUID()}.${extension}`
    onProgress?.('uploading')
    const { error } = await client.storage.from('place-images').upload(path,file,{ contentType:type,upsert:false,cacheControl:'60' })
    if (error) throw new Error(backendError(error))
    onProgress?.('linking')
    // Failed linking leaves a private orphan; never silently delete bytes after ambiguous failures.
    try { await result(client.from('place_images').insert({ place_id:placeId,storage_path:path,alt_text:file.name.slice(0,500),sort_order:0 })) }
    catch (error) { throw new Error(`Upload is private at ${path}, but linking failed. Use the orphan review in Media. ${error.message}`) }
    onProgress?.('complete')
    return path
  }
  async function catalog() {
    const rows = []
    for (let offset=0;;offset+=500) {
      const response=await result(client.from('places').select(fields).order('id').range(offset,offset+499))
      rows.push(...response.data)
      if(response.data.length<500) return rows
    }
  }
  return {
    saveTranslation: async (place,form,previous) => {
      const limits={name:160,description:20000,city:100,address:500,best_time_to_visit:1000,transportation_notes:2000,visitor_guidance:6000}
      const payload=Object.fromEntries(Object.entries(limits).map(([key,max])=>{const value=String(form[key]||'').trim()||null;if(value&&value.length>max)throw Error('Arabic field exceeds its allowed length.');return [key,value]}))
      const values={...payload,source_updated_at:place.updated_at,editorial_status:'pending'}
      const query=previous?client.from('place_translations').update(values).eq('place_id',place.id).eq('locale','ar-JO').eq('updated_at',previous.updated_at):client.from('place_translations').insert({...values,place_id:place.id,locale:'ar-JO'})
      const data=(await result(query.select('*'))).data
      if(!data?.length)throw Error('Translation changed. Reload before saving.')
      return data[0]
    },
    reviewTranslation: async (row,status='reviewed',notes='') => {
      if(!['pending','reviewed','needs_changes'].includes(status))throw Error('Invalid translation review status.')
      if(notes.length>4000)throw Error('Review notes must contain at most 4000 characters.')
      if(status==='needs_changes'&&!notes.trim())throw Error('Describe the translation changes needed.')
      const changes={editorial_status:status,...(status==='needs_changes'?{review_notes:notes.trim()}:{})}
      const data=(await result(client.from('place_translations').update(changes).eq('place_id',row.place_id).eq('locale','ar-JO').eq('updated_at',row.updated_at).select('*'))).data
      if(!data?.length)throw Error('Translation changed. Reload before saving.')
      return data[0]
    },
    categories,listPlaces,getPlace,upload,catalog,collection,previewImage,previewImages:async images=>images.map(previewImage),
    overviewMetrics:()=>cached('overview',async()=>{const [metrics,review,coordinates]=await Promise.all([rpc('admin_overview'),qualityCount('review'),qualityCount('coordinates')]);return {...metrics,review,coordinates}}),
    chartSeries:metrics=>cached('charts',async()=>{const cats=await categories(),counts=await Promise.all(cats.map(c=>result(client.from('place_categories').select('place_id',{count:'exact',head:true}).eq('category_id',c.id)).then(r=>({name:c.name,value:r.count}))));return {status:['draft','published','archived'].map(name=>({name,value:metrics[name]})),category:counts,completeness:[{name:'Missing coordinates',value:metrics.coordinates},{name:'Missing approved cover',value:metrics.covers},{name:'Draft claims to review',value:metrics.review}],review:[{name:'Draft claims to review',value:metrics.review},{name:'Draft claims reviewed',value:Math.max(0,metrics.draft-metrics.review)}]}}),
    qualityQueue:()=>cached('quality',async()=>{const response=await result(collectionQuery({status:'draft'}).order('updated_at',{ascending:false}).order('id').limit(8));return Promise.all(response.data.map(async p=>({...p,issues:await rpc('admin_publication_issues',{target:p.id})}))) }),
    mediaPage:({page=0}={})=>cached('media:'+page,()=>result(client.from('place_images').select('id,place_id,storage_path,alt_text,approved_at,created_at,places(name,status)',{count:'exact'}).order('created_at',{ascending:false}).order('id').range(page*PAGE_SIZE,(page+1)*PAGE_SIZE-1))),
    invalidate:()=>{reads.clear();previews.clear();delivery.clear()},
    quickState: target=>rpc('admin_quick_edit_state',{target}),
    imageEligibility:(target,images)=>rpc('admin_image_eligibility',{target,images}),
    confirmOriginalImages:(target,paths)=>rpc('admin_confirm_original_images',{target,uploaded_paths:paths,editor_id:editorId}),
    saveSimpleImages:(target,version,images)=>rpc('admin_save_simple_images',{target,expected_version:version,images,editor_id:editorId}),
    saveQuickDraft:(target,version,changes,stamp)=>rpc('admin_save_quick_draft',{target,base_version:version,changes:editorId?{...changes,editor_id:editorId}:changes,expected_draft_updated_at:stamp||null}),
    applyQuickEdit:(changes,version,reviewed)=>rpc('admin_apply_quick_edit',{changes:editorId?{...changes,editor_id:editorId}:changes,expected_version:version,reviewed_changes:reviewed}),
    discardQuickDraft:async(id,stamp)=>{const response=await result(client.from('place_quick_drafts').delete().eq('place_id',id).eq('updated_at',stamp).select('place_id'));if(!response.data?.length)throw Error('Another editor tab saved this working draft. Reload before saving.')},
    uploadQuickImage:async(placeId,file)=>{
      const {type,extension}=await validateImage(file),path=`${placeId}/${crypto.randomUUID()}.${extension}`
      const {error}=await client.storage.from('place-images').upload(path,file,{contentType:type,upsert:false,cacheControl:'60'})
      if(error)throw Error(backendError(error))
      return {storage_path:path,alt_text:file.name.slice(0,500),is_cover:false,sort_order:0,approved_at:null,attribution:null,source_url:null,license_basis:null,license_evidence:null}
    },
    replaceCoverImage: async (place,image,file) => {
      if(place.status!=='draft')throw Error('Return the destination to draft before replacing its cover.')
      if(image.place_id!==place.id||!image.is_cover)throw Error('Choose the current cover image for this destination.')
      const {type,extension}=await validateImage(file)
      const path=`${place.id}/${crypto.randomUUID()}.${extension}`
      const {error}=await client.storage.from('place-images').upload(path,file,{contentType:type,upsert:false,cacheControl:'60'})
      if(error)throw Error(backendError(error))
      // A new object identity also gives every responsive rendition a new cache key.
      // Never overwrite a linked object or silently delete after an ambiguous commit.
      try{return await rpc('admin_replace_cover_image',{target:image.id,expected_updated_at:image.updated_at,uploaded_path:path,replacement_alt_text:file.name.slice(0,500)})}
      catch(error){throw Error(`Replacement upload retained at ${path}. Reload the destination before retrying; review unlinked uploads if needed. ${error.message}`)}
    },
    publicationIssues: id => rpc('admin_publication_issues',{target:id}),
    overview: () => rpc('admin_overview'),
    savePlace: (form,ids) => rpc('admin_save_place',{ payload:placePayload(form),category_ids:[...new Set(ids)],expected_updated_at:form.updated_at || null }),
    reviewPlace: (p,review) => {
      const normalized=Object.fromEntries(Object.entries(review).map(([key,value])=>[key,typeof value==='string'?value.trim()||null:value]))
      if(normalized.coordinate_source&&!safeHttps(normalized.coordinate_source))throw new Error('Coordinate source must be an HTTPS URL without credentials.')
      if(normalized.location_reviewed&&(!normalized.location_kind||!normalized.coordinate_source))throw new Error('Choose location precision and a reliable geographic source before verifying coordinates.')
      return rpc('admin_review_place',{ target:p.id,expected_updated_at:p.updated_at,review:normalized })
    },
    setStatus: async (p,status) => {
      if(!['published','draft','archived'].includes(status))throw Error('Invalid publication status')
      const response=await client.rpc('admin_change_place_status',{target:p.id,next_status:status,expected_updated_at:p.updated_at,expected_status:p.status}).abortSignal(AbortSignal.timeout(20000))
      if(response.error){
        if(response.error.code==='PGRST202')throw Error('Status management needs its database update. Apply the simple_destination_status migration, then retry.')
        throw Error(backendError(response.error))
      }
      // Status changes invalidate counts and collections, including other open
      // public tabs. Signed image URLs can stay cached: their files did not change.
      reads.clear();notifyPublicCatalogChange()
      return response.data
    },
    publishLocalized:(p,t)=>rpc('admin_publish_localized_place',{target:p.id,expected_updated_at:p.updated_at,expected_translation_updated_at:t.updated_at}),
    saveCategory: async form => {
      const payload = {name:form.name.trim(),slug:form.slug.trim(),sort_order:Number(form.sort_order),is_active:form.is_active}
      if (!payload.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug) || !Number.isInteger(payload.sort_order) || payload.sort_order < 0) throw new Error('Enter a name, valid lowercase slug and nonnegative whole order.')
      const q = form.id ? client.from('categories').update(payload).eq('id',form.id).eq('updated_at',form.updated_at) : client.from('categories').insert(payload)
      const response = await result(q.select('id'))
      if (!response.data?.length) throw new Error('Category changed or is unavailable. Reload before saving.')
    },
    audit: ({page=0,table='',action=''}={}) => { let q = client.from('admin_audit_logs').select('*',{count:'exact'});if(table)q=q.eq('entity_table',table);if(action)q=q.eq('action',action);return result(q.order('created_at',{ascending:false}).order('id',{ascending:false}).range(page*PAGE_SIZE,(page+1)*PAGE_SIZE-1)) },
    media: async () => (await result(client.from('place_images').select('*,places(name,status)').order('created_at',{ascending:false}).limit(500))).data,
    signedImages,
    updateImage: async (image,changes) => {
      const allowed = Object.fromEntries(['alt_text','sort_order','is_cover','attribution','source_url','license_basis','license_evidence'].filter(k=>k in changes).map(k=>[k,typeof changes[k]==='string'?changes[k].trim()||null:changes[k]]))
      if('alt_text' in allowed&&(!allowed.alt_text||allowed.alt_text.length>500))throw new Error('Alternative text must contain 1–500 characters.')
      if('sort_order' in allowed&&(!Number.isInteger(allowed.sort_order)||allowed.sort_order<0))throw new Error('Image order must be a nonnegative whole number.')
      if(allowed.source_url&&!safeHttps(allowed.source_url))throw new Error('Image source must be an HTTPS URL without credentials.')
      if(allowed.attribution?.length>1000||allowed.license_evidence?.length>2000)throw new Error('Attribution is limited to 1000 characters and rights evidence to 2000.')
      const r=await result(client.from('place_images').update({...allowed,approved_at:null,approved_by:null}).eq('id',image.id).eq('updated_at',image.updated_at).select('id'));if(!r.data.length)throw new Error('Image changed. Reload before saving.')
    },
    approveImage: image => rpc('admin_approve_image',{target:image.id,expected_updated_at:image.updated_at}),
    removeImage: async image => {const r=await result(client.from('place_images').delete().eq('id',image.id).eq('updated_at',image.updated_at).select('id'));if(!r.data.length)throw new Error('Image changed. Reload before unlinking.');},
    orphanFiles: async placeId => { const [{data,error},metadata]=await Promise.all([client.storage.from('place-images').list(placeId,{limit:1000}),result(client.from('place_images').select('storage_path').eq('place_id',placeId))]);if(error)throw new Error(backendError(error));const linked=new Set(metadata.data.map(i=>i.storage_path));return data.filter(i=>i.id&&!linked.has(`${placeId}/${i.name}`)).map(i=>`${placeId}/${i.name}`) },
    // Caller must confirm a specific orphan. Existing restrictive RLS blocks removal of linked objects.
    removeOrphan: async path => {if(!/^[a-f\d-]{36}\/[a-f\d-]{36}\.(jpg|png|webp)$/.test(path))throw new Error('Invalid object path.');const{error}=await client.storage.from('place-images').remove([path]);if(error)throw new Error(backendError(error));},
  }
}
