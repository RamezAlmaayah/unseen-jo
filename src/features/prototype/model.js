export function prototypeRow({row,payload}){
 if(payload.designation!=='private_prototype'||payload.slug!==row.slug||payload.version!==1)throw Error('Invalid private prototype response.')
 const {english,arabic,planning,syntheticFields,media}=payload
 const images=media.map((m,index)=>{const image=row.place_images.find(i=>i.id===m.imageId&&i.storage_path===m.storagePath);if(!image)throw Error('Private prototype media changed. Rebuild the prototype.');return {...image,is_cover:index===0,sort_order:index,prototypeKind:m.kind,prototypeRenditions:m.renditions,attribution:image.attribution+' · '+(m.kind==='illustration'?'Original prototype illustration, not a photograph.':'Private display variants resized to WebP; original file and licence retained.')}})
 return {...row,...english,id:row.id,slug:row.slug,status:row.status,is_demo:false,prototype:{visibility:'private',designation:'synthetic_mixed',actualStatus:row.status,syntheticFields,planning},place_images:images,
  place_translations:[{...arabic,locale:'ar-JO',editorial_status:'prototype',source_updated_at:row.updated_at}],updated_at:row.updated_at}
}
