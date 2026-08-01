import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the build works both at a domain root and under a
  // subpath like https://<user>.github.io/Worship-hitster/ on GitHub Pages.
  base: './',
  plugins: [react()],
})
