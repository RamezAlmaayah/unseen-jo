import {metaEntries,PRIVATE_ROUTE,productionOrigin,routeSeo} from '../src/seo/model.js'
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')
export function seoPlugin(siteUrl){
 const origin=productionOrigin(siteUrl||'')
 const headers=server=>{server.middlewares.use((req,res,next)=>{if(PRIVATE_ROUTE.test(new URL(req.url,'http://local.invalid').pathname))res.setHeader('X-Robots-Tag','noindex, nofollow');next()})}
 return {name:'unseen-jo-seo',configureServer:headers,configurePreviewServer:headers,
  transformIndexHtml:{order:'post',handler(html){
   const seo=routeSeo('/','en',{},origin)
   html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${escape(seo.title)}</title>`).replace(/\s*<meta\b[^>]*(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/gi,'').replace(/\s*<link\b[^>]*rel="canonical"[^>]*>/gi,'')
   const tags=metaEntries(seo).map(([kind,key,value])=>`    <meta ${kind}="${key}" content="${escape(value)}" data-seo="true" />`)
   if(seo.canonical)tags.push(`    <link rel="canonical" href="${escape(seo.canonical)}" />`)
   return html.replace('</head>',tags.join('\n')+'\n  </head>')
  }}
 }
}
