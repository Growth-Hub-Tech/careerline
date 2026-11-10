import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv, type Plugin } from 'vite';
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

// Netlify reads dist/_headers. The Content-Security-Policy is written there at build time, so
// connect-src names exactly the API (and error monitoring) this build talks to.
const securityHeaders = (connectTo: readonly string[]): Plugin => {
  let headersFile = '';

  return {
    name: 'careerline:security-headers',
    apply: 'build',
    configResolved(config) {
      headersFile = resolve(config.root, config.build.outDir, '_headers');
    },
    writeBundle() {
      const policy = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com",
        "font-src 'self' https://fonts.gstatic.com https://cdn.fontshare.com",
        "img-src 'self' data: blob:",
        `connect-src 'self' ${connectTo.join(' ')}`,
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ].join('; ');
      appendFileSync(headersFile, `\n/*\n  Content-Security-Policy: ${policy}\n`);
    },
  };
};

export default defineConfig(({ command, mode }) => {
  const plugins = [react(), tailwindcss()];

  // A build without the API address would call the website's own host instead: refuse it
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    plugins.push(securityHeaders([originOf('VITE_API_URL', env.VITE_API_URL)]));
  }

  return {
    plugins,
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
