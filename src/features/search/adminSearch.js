import {searchTokens,matchingAliasSlugs} from './destinationSearch.js'
// PostgreSQL ARE patterns come only from normalized letters/numbers.
// User punctuation never becomes a SQL, PostgREST, wildcard or regex operator.
export function searchPattern(token){
 const variants={ا:'[اأإآٱ]',ي:'[يىئ]',و:'[وؤ]',ه:'[هة]'},marks='[\u0640\u064b-\u065f\u0670]*'
 return [...token].map(c=>(variants[c]||c)+(/[\u0600-\u06ff]/u.test(c)?marks:'')).join('')
}
export const searchEmbeds=query=>searchTokens(query).map((_,i)=>`search_match_${i}:place_translations()`)
export function applyAdminSearch(request,query){
 const tokens=searchTokens(query),conditions=[]
 if(String(query||'').trim()&&!tokens.length)return {request:request.is('id',null),conditions}
 tokens.forEach((token,i)=>{
  const pattern=JSON.stringify(searchPattern(token)),alias=`search_match_${i}`
  request=request.or(['name','city','region'].map(field=>`${field}.imatch.${pattern}`).join(','),{referencedTable:alias})
  conditions.push(`or(${['name','slug','city','region'].map(field=>`${field}.imatch.${pattern}`).concat(`${alias}.not.is.null`,matchingAliasSlugs(token).map(slug=>`slug.eq.${slug}`)).flat().join(',')})`)
 })
 return {request,conditions}
}
