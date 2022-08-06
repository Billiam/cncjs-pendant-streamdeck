import { fileURLToPath, URL } from 'url'
import { defineConfig, loadEnv } from 'vite'

import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const config = {
    plugins: [vue()],
    root: 'src',
    base: './',
    server: {},
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler',
        'xmlhttprequest-ssl':
          './node_modules/engine.io-client/lib/xmlhttprequest.js',
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        adapter: fileURLToPath(
          new URL('./src/services/adapter/web.js', import.meta.url)
        ),
      },
    },
    worker: {
      rollupOptions: {
        error: true,
        output: {
          entryFileNames: '[name].js',
        },
      },
    },
    build: {
      outDir: '../dist/web',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          assetFileNames: '[name][extname]',
          entryFileNames: '[name].js',
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
