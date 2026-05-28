import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    buildStart() {
      copyFileSync(
        resolve('./node_modules/coi-serviceworker/coi-serviceworker.min.js'),
        resolve('./public/coi-serviceworker.js'),
      )
      copyFileSync(
        resolve('./node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js'),
        resolve('./public/ffmpeg-core.js'),
      )
      copyFileSync(
        resolve('./node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm'),
        resolve('./public/ffmpeg-core.wasm'),
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), copyStaticAssets()],
  optimizeDeps: { exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'] },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
})
