/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode, isPreview }) => {
  const { VITE_SITE_URL } = loadEnv(mode, process.cwd())
  return {
    // Builds (and `vite preview`) are served from VITE_SITE_URL's path; the dev server and e2e tests stay at '/'.
    base: command === 'build' || isPreview ? new URL(VITE_SITE_URL).pathname : '/',
    plugins: [
      tailwindcss(),
      react()
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    test: {
      include: ['src/**/*.test.ts'],
    },
  }
})
