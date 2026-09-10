// One-command end-to-end demo:
//   1. boot the intentionally-vulnerable mock server
//   2. run an AuthzProbe scan against it
//   3. shut the mock down and exit with the scan's status
//
// Run with: npm run demo
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const env = {
  ...process.env,
  ALICE_TOKEN: 'alice-token',
  BOB_TOKEN: 'bob-token',
  MOCK_PORT: '4010',
};

console.log('▶ Starting mock target server...');
const mock = spawn('node', [resolve(root, 'examples/mock-server.mjs')], {
  env,
  stdio: 'inherit',
});

// Give the server a moment to bind the port.
await sleep(600);

console.log('\n▶ Running AuthzProbe scan (--include-unsafe off, baseline on)...\n');
const scan = spawn(
  'node',
  [
    resolve(root, 'node_modules/tsx/dist/cli.mjs'),
    resolve(root, 'src/cli.ts'),
    'scan',
    '--spec',
    resolve(root, 'examples/petstore-openapi.yaml'),
    '--config',
    resolve(root, 'examples/identities.yaml'),
    '--no-fail-on-finding',
  ],
  { env, stdio: 'inherit' },
);

const code = await new Promise((res) => scan.on('exit', res));

console.log('\n▶ Stopping mock server.');
mock.kill('SIGTERM');
process.exit(code ?? 0);
