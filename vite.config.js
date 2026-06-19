import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// custom domain planor.kro.kr → base는 '/'
export default defineConfig({
  plugins: [react()],
  base: '/',
})
