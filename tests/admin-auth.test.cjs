const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// The inbox sign-in's limit on wrong passwords.
function load(file, dependencies = {}) {
  const filename = path.resolve(__dirname, '..', file);
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  const resolve = (name) => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name);
  new Function('require', 'module', 'exports', '__filename', '__dirname', js)(resolve, module, module.exports, filename, path.dirname(filename));
  return module.exports;
}

// A fresh copy each time, so one test's wrong passwords don't count in the next.
function auth() {
  return load('src/lib/admin-auth.ts', {
    '@/lib/rateLimit': load('src/lib/rateLimit.ts'),
    '@/lib/seo': { isLiveHost: () => false },
  });
}

// What the web server passes on: anything the visitor wrote, then the address it really saw.
const from = (real, forged) => new Request('https://chemlifeinnovations.com/api/admin/session', {
  method: 'POST',
  headers: { 'x-forwarded-for': forged ? `${forged}, ${real}` : real },
});

test('a made-up X-Forwarded-For value does not get more tries', () => {
  const { clientAddress, mayTry, recordFailure } = auth();
  for (let i = 0; i < 5; i++) {
    const address = clientAddress(from('203.0.113.9', `198.51.100.${i}`));
    assert.equal(address, '203.0.113.9');
    assert.equal(mayTry(address), true);
    recordFailure(address);
  }
  assert.equal(mayTry(clientAddress(from('203.0.113.9', '198.51.100.77'))), false);
});

test('each address has its own count, cleared by a correct password', () => {
  const { mayTry, recordFailure, clearFailures } = auth();
  for (let i = 0; i < 5; i++) recordFailure('203.0.113.9');
  assert.equal(mayTry('203.0.113.9'), false);
  assert.equal(mayTry('203.0.113.10'), true);
  clearFailures('203.0.113.9');
  assert.equal(mayTry('203.0.113.9'), true);
});

test('filling the list with other addresses does not lift a lockout', () => {
  const { mayTry, recordFailure } = auth();
  for (let i = 0; i < 5; i++) recordFailure('203.0.113.9');
  for (let i = 0; i < 150; i++) recordFailure(`2001:db8::${i.toString(16)}`);
  assert.equal(mayTry('203.0.113.9'), false);
});

test('guessing spread across many addresses is stopped site-wide', () => {
  const { mayTry, recordFailure } = auth();
  for (let i = 0; i < 200; i++) recordFailure(`2001:db8::${i.toString(16)}`);
  assert.equal(mayTry('203.0.113.200'), false);
});
