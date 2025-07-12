import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',  // Bind to all network interfaces
    port: 5173,       // Explicit port
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('lodash')) return 'vendor-lodash'
          if (id.includes('dayjs')) return 'vendor-dayjs'
          if (id.includes('vue-toastification')) return 'vendor-vue-toastification'
          if (id.includes('vue3-google-login')) return 'vendor-vue3-google-login'
          if (id.includes('vue3-lazyload')) return 'vendor-vue3-lazyload'
          if (id.includes('vue3-dropzone')) return 'vendor-vue3-dropzone'
        }
      }
    }
  },
  plugins: [
    vue(),
    vueJsx(),
    VueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@plugins': fileURLToPath(new URL('./src/plugins', import.meta.url)),
    }
  }
})
