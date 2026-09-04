/**
 * Post-build smoke test.
 *
 * Boots the production server and asserts the things that are easy to break
 * silently: every route still resolves, the security headers are actually
 * sent, and the production CSP has not picked up 'unsafe-eval'.
 *
 *   node scripts/smoke.mjs        (expects `next build` to have run)
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { createRequire } from 'node:module';

const PORT = process.env.SMOKE_PORT ?? '3210';
const BASE = `http://127.0.0.1:${PORT}`;

const ROUTES = [
  ['/', 200],
  ['/work/silent-operator', 200],
  ['/work/protocol-honeypot', 200],
  ['/work/protocol-cinema', 200],
  ['/work/monitoring-lab', 200],
  ['/work/vrikaan', 200],
  ['/robots.txt', 200],
  ['/sitemap.xml', 200],
  ['/opengraph-image', 200],
  ['/work/silent-operator/opengraph-image', 200],
  ['/.well-known/security.txt', 200],
  ['/this-route-does-not-exist', 404],
];

const REQUIRED_HEADERS = [
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
  'cross-origin-opener-policy',
];

const failures = [];
const check = (ok, message) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${message}`);
  if (!ok) failures.push(message);
};

// Run Next's CLI through this Node binary rather than through a shell.
// `shell: true` concatenates arguments instead of escaping them, which Node
// now warns about — and a shell is not needed here anyway.
const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');

const server = spawn(process.execPath, [nextBin, 'start', '-p', PORT], {
  stdio: 'ignore',
});

const shutdown = () => {
  try {
    server.kill();
  } catch {
    // already gone
  }
};
process.on('exit', shutdown);
process.on('SIGINT', () => {
  shutdown();
  process.exit(130);
});

try {
  // wait for the server to answer
  let up = false;
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(BASE, { method: 'HEAD' });
      up = true;
      break;
    } catch {
      await sleep(1000);
    }
  }
  if (!up) {
    console.error('server never became reachable');
    process.exit(1);
  }

  for (const [path, expected] of ROUTES) {
    const res = await fetch(BASE + path, { redirect: 'manual' });
    check(res.status === expected, `${path} → ${res.status} (expected ${expected})`);
  }

  const res = await fetch(BASE, { method: 'HEAD' });
  for (const h of REQUIRED_HEADERS) {
    check(res.headers.has(h), `header ${h} present`);
  }

  const csp = res.headers.get('content-security-policy') ?? '';
  check(!csp.includes('unsafe-eval'), "production CSP has no 'unsafe-eval'");
  check(!res.headers.has('x-powered-by'), 'x-powered-by not disclosed');

  const html = await (await fetch(BASE)).text();
  check(html.includes('"@type":"Person"'), 'Person JSON-LD present');
  check(html.includes('<title>'), 'page has a title');
} finally {
  shutdown();
}

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log('\nall smoke checks passed');
