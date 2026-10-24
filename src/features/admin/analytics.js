export const claimsReviewed=p=>!!(p.verified_at&&p.place_reviews?.claims_reviewed)
export const qualityMatch=(p,quality)=>quality==='coordinates'?p.latitude==null||p.longitude==null:quality==='covers'?!p.place_images?.some(i=>i.is_cover&&i.approved_at):quality==='review'?p.status==='draft'&&!claimsReviewed(p):quality==='incomplete'?!(p.description?.trim().length>=80&&p.source_url&&p.primary_category_id):true
export function summarizeCatalog(rows,categories,server={}){return {...server,total:rows.length,draft:rows.filter(p=>p.status==='draft').length,published:rows.filter(p=>p.status==='published').length,archived:rows.filter(p=>p.status==='archived').length,categories:categories.filter(c=>c.is_active).length,review:rows.filter(p=>qualityMatch(p,'review')).length,coordinates:rows.filter(p=>qualityMatch(p,'coordinates')).length,covers:rows.filter(p=>qualityMatch(p,'covers')).length}}
export function overviewSeries(rows,categories,metrics){return {
 status:['draft','published','archived'].map(name=>({name,value:rows.filter(p=>p.status===name).length})),
 category:categories.map(c=>({name:c.name,value:rows.filter(p=>p.place_categories?.some(pc=>pc.category_id===c.id)).length})),
 completeness:[{name:'Missing coordinates',value:metrics.coordinates},{name:'Missing approved cover',value:metrics.covers},{name:'Draft claims to review',value:metrics.review}],
 review:[{name:'Draft claims to review',value:metrics.review},{name:'Draft claims reviewed',value:Math.max(0,metrics.draft-metrics.review)}]
}}
