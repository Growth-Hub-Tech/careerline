/* global console, fetch, process */
const SITE_URL = process.env.SITE_URL;

if (!SITE_URL) {
  console.error(
    'Set SITE_URL to the address of the site, for example SITE_URL=https://your-site.netlify.app',
  );
  process.exit(1);
}
const API_URL = process.env.API_URL ?? 'https://careerline-api.onrender.com';

const checks = [
  {
    name: 'Site home page',
    url: SITE_URL,
    pass: async (response) => response.ok && (await response.text()).includes('id="root"'),
  },
  {
    name: 'Site security headers',
    url: SITE_URL,
    pass: async (response) =>
      response.headers.get('x-frame-options') === 'DENY' &&
      Boolean(response.headers.get('content-security-policy')),
  },
  {
    name: 'A deep link still opens the app',
    url: `${SITE_URL}/pricing`,
    pass: async (response) => response.ok,
  },
  {
    name: 'API health',
    url: `${API_URL}/healthz`,
    pass: async (response) => response.ok,
  },
];

let failed = 0;

for (const check of checks) {
  try {
    const response = await fetch(check.url, { redirect: 'follow' });
    const passed = await check.pass(response);
    if (!passed) failed += 1;
    console.log(`${passed ? 'ok    ' : 'FAILED'} ${check.name} (${response.status} ${check.url})`);
  } catch (error) {
    failed += 1;
    console.log(`FAILED ${check.name} (${check.url}): ${error.message}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} live check(s) failed.`);
  process.exit(1);
}
