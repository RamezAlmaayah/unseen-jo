// Bounding boxes alone include cards clipped by the scrollable Explore list.
export function imageVisible(element) {
 const rect=element.getBoundingClientRect()
 let left=Math.max(0,rect.left),top=Math.max(0,rect.top),right=Math.min(innerWidth,rect.right),bottom=Math.min(innerHeight,rect.bottom)
 for(let parent=element.parentElement;parent;parent=parent.parentElement){
  const style=getComputedStyle(parent),r=parent.getBoundingClientRect()
  if(style.visibility==='hidden'||style.display==='none')return false
  if(style.overflowX!=='visible'){left=Math.max(left,r.left);right=Math.min(right,r.right)}
  if(style.overflowY!=='visible'){top=Math.max(top,r.top);bottom=Math.min(bottom,r.bottom)}
  // Modal dialogs are in the browser top layer and escape ancestor clipping.
  if(parent.matches('dialog[open]'))break
 }
 return right>left&&bottom>top&&rect.width>0&&rect.height>0
}
