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
  // IMPORTANT: Only set this if VITE_API_KEY is not already set via standard Vite mechanism
  define: {
    // Fallback for legacy env var names - only used if VITE_API_KEY is not set
    '__LEGACY_API_KEY__': JSON.stringify(
      process.env.GEMINI_API_KEY || process.env.API_KEY || ''
    ),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  }
})
