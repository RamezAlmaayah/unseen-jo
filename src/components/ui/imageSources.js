import manifest from '../../data/responsive-images.json'

export const imageSizes={
  card:'(max-width: 600px) calc(100vw - 32px), (max-width: 1100px) calc((100vw - 64px) / 2), 355px',
  result:'(max-width: 600px) calc(100vw - 32px), 722px',
  preview:'(max-width: 640px) calc(100vw - 48px), 600px',
  popup:'216px',
  gallery:'(max-width: 600px) calc(100vw - 32px), (max-width: 1100px) 65vw, 900px',
  gallerySmall:'(max-width: 600px) calc((100vw - 44px) / 2), 472px',
  hero:'100vw',
}
export function localImageSources(src,sizes,width) {
  const entry=manifest[src]
  if(!entry)return {src}
  const variants=entry.hashWidths.map(([hash,width])=>({width,src:`/assets/responsive/${hash}-${width}.webp`}))
  const target=Number(width)||640
  const fallback=variants.find(v=>v.width>=target)||variants.at(-1)
  return {src:fallback.src,srcSet:variants.map(v=>`${v.src} ${v.width}w`).join(', '),sizes:sizes||`${target}px`}
}
