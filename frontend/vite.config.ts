import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],

  server: {
    watch: {
      usePolling: true,
    },
  },

  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  }
})
