import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/auth": { target: "http://localhost:5000", changeOrigin: true },
      "/api/orders": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
})