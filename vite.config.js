import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Consultorio Dental Velázquez',
        short_name: 'Consultorio',
        description: 'App de gestión para pacientes del consultorio dental.',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Aumenta el límite de tamaño cacheable (4 MB)
        maximumFileSizeToCacheInBytes: 4000000,

        // 🔹 Define estrategias separadas para frontend y backend
        runtimeCaching: [
          // 1️⃣ Cache del frontend (HTML, JS, CSS, imágenes)
          {
            urlPattern: ({ request }) =>
              ['document', 'script', 'style', 'image', 'font'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-shell',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 días
              }
            }
          },

          // 2️⃣ API del backend en Render → SIEMPRE datos actualizados
          {
            urlPattern: /^https:\/\/backenddent\.onrender\.com\/api\/.*/, // ⚠️ cambia a tu dominio real de Render
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3, // espera 3 seg a la red antes de usar cache
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 día
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
