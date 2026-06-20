import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/]
      },
      manifest: {
        short_name: "继保工具箱",
        name: "继保工具箱",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#07c160",
        orientation: "portrait",
        icons: [
          {
            src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PGNpcmNsZSBjeD0iMjU2IiBjeT0iMjU2IiByPSIyNDAiIGZpbGw9IiMwN2MxNjAiLz48cGF0aCBkPSJNMjU2IDgwTDEyMCAzMjBoODBsLTQwIDEyMEwzOTIgMTkySDMxMkwzOTIgODB6IiBmaWxsPSIjZmZmIi8+PC9zdmc+",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      }
    })
  ],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  server: {
    port: 5500,        
    open: true,        
    host: true,        
    cors: true         
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src') 
    }
  },
  build: {
    outDir: 'dist',           
    assetsDir: 'assets',      
    sourcemap: false,         
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,  
        drop_debugger: true   
      }
    }
  }
}
);