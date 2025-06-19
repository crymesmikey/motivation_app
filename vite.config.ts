import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  server: {
    port: 5000,
    host: true,
    open: true
  },
  preview: {
    port: 4173,
    host: true
  }
})