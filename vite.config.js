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
        runtimeCaching: [
          // Cachear TODAS las rutas de la aplicación automáticamente
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-cache',
              expiration: {
                maxEntries: 100, // Mayor número para más rutas
                maxAgeSeconds: 60 * 60 * 24 * 7 // Cache por 7 días
              }
            }
          },
          // Cachear TODAS las llamadas a la API
          {
            urlPattern: /^http:\/\/localhost:4000\/api\/.*/, // Cubre cualquier ruta en /api/
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100, // Almacena hasta 100 peticiones
                maxAgeSeconds: 60 * 60 * 24 * 3 // Cache por 3 días
              },
              networkTimeoutSeconds: 5 // Si la API no responde en 5s, usa cache
            }
          }
        ]
      }
    })
  ]
});
