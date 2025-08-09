import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath, URL } from 'url'
import { defineConfig, loadEnv } from 'vite'

const removeConfigs = () => {
  return {
    name: 'remove-configs',
    writeBundle: (outputOptions, inputOptions) => {
      fs.readdirSync(outputOptions.dir).forEach((file) => {
        if (/config(?!\.example).*\.json/.test(file)) {
          fs.rmSync(join(outputOptions.dir, file))
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const config = {
    plugins: [
      vue({
        template: {
          transformAssetUrls: {
            includeAbsolute: false,
          },
        },
      }),
      removeConfigs(),
    ],
    root: 'src',
    base: './',
    server: {},
    resolve: {
      alias: {
        'xmlhttprequest-ssl':
          './node_modules/engine.io-client/lib/xmlhttprequest.js',
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        adapter: fileURLToPath(
          new URL('./src/services/adapter/web.js', import.meta.url),
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
      commonjsOptions: { include: [] },
      outDir: '../dist/web',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/index.html'),
          editor: resolve(__dirname, 'src/editor.html'),
        },
        output: {
          assetFileNames: '[name][extname]',
          entryFileNames: '[name].js',
        },
      },
    },
    optimizeDeps: {
      disabled: false,
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
      '/socket.io': {
        target: env.PROXY_WEBSOCKET,
        ws: true,
      },
    }
  }

  return config
})
