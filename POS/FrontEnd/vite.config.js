import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  base: "/",   // 👈 ESTA LÍNEA ES NECESARIA PARA DEPLOY EN AZURE
  plugins: [react(),tailwindcss(),],
  server: {
    port: 5173,
    host:"0.0.0.0"
  }
})
