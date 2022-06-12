import { fileURLToPath, URL } from 'url'
import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const config = {
    plugins: [vue()],
    root: 'src/configurator',
    server: {},
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler',
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }

  if (env.PROXY_URL) {
    config.server.proxy = {
      '/api': {
        target: env.PROXY_URL,
        changeOrigin: true,
      },
    }
  }

  return config
})
