import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The origin of a full http(s) address, or a build error that says what is wrong
const originOf = (name: string, value: string | undefined) => {
  try {
    const url = new URL(value ?? '');
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.origin;
  } catch {
    // reported below
  }
  throw new Error(
    `${name} must be a full address such as https://api.example.com/api/v1 (got "${value ?? ''}"). ` +
      'Set it in the environment or in .env.<mode>.',
  );
};

export default defineConfig(({ command, mode }) => {
  // A build without the API address would call the website's own host instead: refuse it
  if (command === 'build') {
    originOf('VITE_API_URL', loadEnv(mode, process.cwd(), 'VITE_').VITE_API_URL);
  }

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      maxWorkers: 4,
    },
  };
});
