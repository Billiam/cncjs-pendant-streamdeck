import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: 'src',
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler',
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
