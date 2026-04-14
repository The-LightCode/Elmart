import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'El-Mart',
        short_name: 'El-Mart',
        description: "Nigeria's Digital Market Square",
        theme_color: '#0A2540',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1366x768',
            type: 'image/png',
            form_factor: 'wide',
            label: 'El-Mart Desktop'
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '1366x768',
            type: 'image/png',
            label: 'El-Mart Mobile'
          }
        ]
      }
    })
  ]
})

