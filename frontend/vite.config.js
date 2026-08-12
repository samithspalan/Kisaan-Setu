import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        /*
         * Split heavy dependencies out of the entry chunk. The app targets
         * farmers on low-end Android over patchy mobile data, so what loads
         * before the login screen matters: previously recharts, leaflet,
         * chart.js and socket.io-client all shipped in one 972KB bundle
         * that had to arrive before anything rendered.
         *
         * Pages themselves are lazily imported in App.jsx; this handles
         * the vendor code they pull in.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          // Charts — only MarketAnalysis renders them.
          if (id.includes('recharts') || id.includes('chart.js') || id.includes('d3-')) {
            return 'charts'
          }
          // Maps — only the farmer location modal.
          if (id.includes('leaflet')) return 'maps'
          // Realtime — only the two chat pages.
          if (id.includes('socket.io') || id.includes('engine.io')) return 'realtime'
          // Translation machinery — needed everywhere, but big enough
          // to be worth caching separately from app code.
          if (id.includes('i18next')) return 'i18n'
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
            return 'react-vendor'
          }
        },
      },
    },
    // The lazy chunks are intentionally sized; warn only on genuinely
    // large ones so the signal stays useful.
    chunkSizeWarningLimit: 600,
  },
})
