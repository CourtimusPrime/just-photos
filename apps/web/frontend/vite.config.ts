import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@web/types': path.resolve(__dirname, '../../../packages/types'),
      '@web/ui': path.resolve(__dirname, '../../../packages/ui')
    }
  }
})
