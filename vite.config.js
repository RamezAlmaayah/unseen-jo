import react from '@vitejs/plugin-react'
import { defineConfig,loadEnv } from 'vite'
import {seoPlugin} from './scripts/seo-vite-plugin.js'
import tailwindcss from '@tailwindcss/vite'

// Only content-addressed generated assets are immutable. Draft media and API
// responses continue to use Supabase's own access/cache rules.
const imageCacheHeaders=()=>{
  const install=server=>{server.middlewares.use((req,res,next)=>{
    if(/^\/assets\/responsive\/[a-f0-9]{20}-\d+\.webp(?:\?|$)/.test(req.url||''))res.setHeader('Cache-Control','public, max-age=31536000, immutable')
    next()
  })}
  return {name:'responsive-image-cache',configureServer:install,configurePreviewServer:install}
}

// https://vite.dev/config/
export default defineConfig(({mode})=>({
  build: {outDir:'dist',sourcemap:false},
  plugins: [react(), tailwindcss(), imageCacheHeaders(),seoPlugin(loadEnv(mode,process.cwd(),'VITE_').VITE_SITE_URL)],
}))
