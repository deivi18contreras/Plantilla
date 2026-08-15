import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          $primary   : #f59e0b;
          $secondary : #1e293b;
          $accent    : #d97706;
          $dark      : #0f172a;
          $positive  : #22c55e;
          $negative  : #ef4444;
          $info      : #3b82f6;
          $warning   : #f59e0b;
        `
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
