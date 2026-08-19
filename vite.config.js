import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [ 
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/supabase-rest': {
        target: 'https://iditnywwkjyatprpbaij.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/supabase-rest/, '')
      }
    }
  }
})
