import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chat': 'http://localhost:8000',
      '/chat_voice': 'http://localhost:8000',
      '/voice_chat': 'http://localhost:8000',
      '/translate': 'http://localhost:8000',
      '/train': 'http://localhost:8000',
      '/train_hindi': 'http://localhost:8000',
      '/reload': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
      '/debug': 'http://localhost:8000',
    },
  },
})