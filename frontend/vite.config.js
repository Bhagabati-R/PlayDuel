import react from '@vitejs/plugin-react'
//we will be adding the tailwind in the vite//
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
})
