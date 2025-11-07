import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Allow older env setups (e.g., GEMINI_API_KEY) to work by
  // mapping them into Vite client env at build time.
  define: {
    'import.meta.env.VITE_API_KEY': JSON.stringify(
      process.env.VITE_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || ''
    ),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  }
})
