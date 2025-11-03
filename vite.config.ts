import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This makes process.env.API_KEY available in the client-side code,
    // reading from the VITE_API_KEY environment variable.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY)
  }
})
