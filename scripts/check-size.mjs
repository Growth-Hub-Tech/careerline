/* global console, process */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const ASSETS = 'dist/assets';
const LIMITS = { js: 150, css: 20, image: 200 };

const kindOf = (file) => {
  if (file.endsWith('.js')) return 'js';
  if (file.endsWith('.css')) return 'css';
  if (/\.(png|jpe?g|webp|svg|gif|avif)$/.test(file)) return 'image';
  return null;
};

let failed = false;

for (const file of readdirSync(ASSETS).sort()) {
  const kind = kindOf(file);
  if (!kind) continue;

  const content = readFileSync(join(ASSETS, file));
  const size = kind === 'image' ? content.length : gzipSync(content).length;
  const kilobytes = Math.round(size / 1024);
  const over = kilobytes > LIMITS[kind];
  if (over) failed = true;

  console.log(
    `${over ? 'TOO BIG' : 'ok     '} ${String(kilobytes).padStart(5)} kB  ${file}${kind === 'image' ? '' : ' (gzip)'}`,
  );
}

if (failed) {
  console.error(
    `\nA file is over its limit (JavaScript ${LIMITS.js} kB, CSS ${LIMITS.css} kB gzip, images ${LIMITS.image} kB).`,
  );
  process.exit(1);
}
