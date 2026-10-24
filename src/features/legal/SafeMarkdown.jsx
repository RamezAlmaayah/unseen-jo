import {Fragment} from 'react'
import {safeLegalHref} from './model.js'

// Deliberately small Markdown subset. No raw HTML, images, embeds, HTML parser,
// dangerouslySetInnerHTML or user-defined attributes. All text is React-escaped.
function inline(text){const parts=[],pattern=/(\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|`([^`\n]+)`|\[([^\]\n]+)\]\(([^)\n]*)\))/g;let end=0,m
 while((m=pattern.exec(text))){parts.push(text.slice(end,m.index));const key=m.index;if(m[2])parts.push(<strong key={key}>{m[2]}</strong>);else if(m[3])parts.push(<em key={key}>{m[3]}</em>);else if(m[4])parts.push(<code key={key}>{m[4]}</code>);else{const href=safeLegalHref(m[6]);parts.push(href?<a key={key} href={href} {...(href.startsWith('http')?{target:'_blank',rel:'noopener noreferrer'}:{})}>{m[5]}</a>:<Fragment key={key}>{m[0]}</Fragment>)}end=pattern.lastIndex}
 parts.push(text.slice(end));return parts
}
export default function SafeMarkdown({text=''}){return String(text).split(/\n\s*\n/).map((block,i)=>{const lines=block.split('\n');if(lines.every(s=>/^[-*] /.test(s)))return <ul key={i}>{lines.map((s,j)=><li key={j}>{inline(s.slice(2))}</li>)}</ul>;if(lines.every(s=>/^\d+\. /.test(s)))return <ol key={i}>{lines.map((s,j)=><li key={j}>{inline(s.replace(/^\d+\. /,''))}</li>)}</ol>;return <p key={i}>{lines.map((s,j)=><Fragment key={j}>{j>0&&<br/>}{inline(s)}</Fragment>)}</p>})}
