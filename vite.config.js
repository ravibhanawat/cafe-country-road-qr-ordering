import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cafe Country Road - QR Ordering
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  }
})
