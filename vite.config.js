import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './app/manifest.json'

export default defineConfig({
  plugins: [
    crx({ 
      manifest: {
        ...manifest,
        content_scripts: manifest.content_scripts.map(script => ({
          ...script,
          css: [] // Empty CSS array as styles are injected via JS
        }))
      },
      contentScripts: {
        injectCss: true
      }
    })
  ],
  
  // Project structure
  root: 'app',
  
  // Build configuration
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // HTML pages
        popup: 'app/pages/popup.html'
        // Scripts are automatically detected by @crxjs/vite-plugin
      }
    }
  },

  // Development server configuration
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5174
    }
  },

  // Build target (matches tsconfig.json)
  esbuild: {
    target: 'ES2020'
  },

  // CSS preprocessing
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
})