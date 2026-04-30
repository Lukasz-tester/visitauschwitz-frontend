import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['tests/{unit,component,contract,functions}/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules', '.next', 'out'],
    coverage: {
      provider: 'v8',
      include: ['src/utilities/**', 'src/components/**', 'src/blocks/**', 'functions/**'],
      exclude: ['**/*.d.ts', '**/index.ts'],
    },
  },
})
