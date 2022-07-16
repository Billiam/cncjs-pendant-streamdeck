import { fileURLToPath, URL } from 'url'
import { defineConfig, loadEnv } from 'vite'

import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const config = {
    plugins: [vue()],
    root: 'src',
    server: {},
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler',
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        adapter: fileURLToPath(
          new URL('./src/services/adapter/web.js', import.meta.url)
        ),
      },
    },
    build: {
      outDir: '../dist/web',
      rollupOptions: {
        output: {
          assetFileNames: '[name][extname]',
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        keepNames: true,
      },
    },
    keepNames: true,
    esbuild: {
      // needed due to cation doing a method name check
      keepNames: true,
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
