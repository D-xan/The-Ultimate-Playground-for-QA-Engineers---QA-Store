/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode, isPreview }) => {
  const { VITE_SITE_URL, VITE_PUBLIC_URL } = loadEnv(mode, process.cwd())
  return {
    // Builds (and `vite preview`) are served from the URL this copy lives at (VITE_PUBLIC_URL, else VITE_SITE_URL);
    // the dev server and e2e tests stay at '/'.
    base: command === 'build' || isPreview ? new URL(VITE_PUBLIC_URL || VITE_SITE_URL).pathname : '/',
    // dateModified in each page's JSON-LD; postbuild's sitemap lastmod is the same day.
    define: { 'import.meta.env.VITE_BUILD_DATE': JSON.stringify(new Date().toISOString().slice(0, 10)) },
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
