// Installed before BrowserRouter subscribes to history. A late component-level
// popstate listener can be removed by Router's synchronous unmount before it
// runs. Only an actively mounted legal editor supplies a guard.
let activeGuard=null
if(typeof window!=='undefined')window.addEventListener('popstate',event=>activeGuard?.(event),true)
export function registerLegalTraversalGuard(handler){activeGuard=handler;return()=>{if(activeGuard===handler)activeGuard=null}}
