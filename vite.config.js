import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dsv from '@rollup/plugin-dsv' 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),dsv()],
  base: '/databis/', // Esto asegura que las rutas sean relativas
})
