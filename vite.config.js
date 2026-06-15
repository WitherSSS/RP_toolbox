import { defineConfig } from 'vite';
import { resolve } from 'path';
export default defineConfig({
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