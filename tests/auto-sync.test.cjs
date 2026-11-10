const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// The automatic check for new posts, with the database and the channel check replaced.
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

const MINUTE = 60 * 1000;
const NOW = Date.parse('2026-11-05T12:00:00Z');

function setup({ enabled = { linkedin: false, instagram: false, youtube: false }, lastSync = null, claimed = false, failSync = false } = {}) {
  process.env.DATABASE_URL = 'mysql://unit-test-only';
  delete globalThis.insightsAutoSyncLooked;
  const state = { syncs: 0, claim: claimed ? new Date(NOW).toISOString() : null, enabled, lastSync };
  const db = {
    storeConfigured: () => Boolean(process.env.DATABASE_URL),
    socialAutoPublishSettings: async () => state.enabled,
    getSetting: async (name) => (name === 'last_sync' && state.lastSync ? JSON.stringify({ at: state.lastSync, results: [] }) : null),
    // Same rule as the database's: only a claim older than `before` moves forward.
    claimTurn: async (_name, before, now) => {
      if (state.claim && Date.parse(state.claim) >= before.getTime()) return false;
      state.claim = now.toISOString();
      return true;
    },
  };
  const sync = {
    syncInbox: async () => {
      state.syncs++;
      if (failSync) throw new Error('feed down');
      state.lastSync = new Date(NOW).toISOString();
      return [];
    },
  };
  const autoSync = load('src/lib/insights-store/auto-sync.ts', { './db': db, './sync': sync });
  return { autoSync, state };
}
const previousDatabaseUrl = process.env.DATABASE_URL;
test.afterEach(() => {
  delete globalThis.insightsAutoSyncLooked;
  if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = previousDatabaseUrl;
});

test('nothing is checked while every box is unticked', async () => {
  const { autoSync, state } = setup();
  assert.equal(await autoSync.syncIfDue(NOW), false);
  assert.equal(state.syncs, 0);
});

test('a ticked box checks when the last check is over 10 minutes old, or there was none', async () => {
  for (const lastSync of [null, new Date(NOW - 11 * MINUTE).toISOString()]) {
    const { autoSync, state } = setup({ enabled: { linkedin: true, instagram: false, youtube: false }, lastSync });
    assert.equal(await autoSync.syncIfDue(NOW), true);
    assert.equal(state.syncs, 1);
  }
});

test('a recent check, including one from the inbox, is not repeated', async () => {
  const { autoSync, state } = setup({ enabled: { linkedin: false, instagram: true, youtube: false }, lastSync: new Date(NOW - 5 * MINUTE).toISOString() });
  assert.equal(await autoSync.syncIfDue(NOW), false);
  assert.equal(state.syncs, 0);
});

test('only one server process runs a due check', async () => {
  const { autoSync, state } = setup({ enabled: { linkedin: true, instagram: true, youtube: true }, claimed: true });
  assert.equal(await autoSync.syncIfDue(NOW), false);
  assert.equal(state.syncs, 0);
});

test('a process looks in the database at most once a minute, then checks again once due', async () => {
  const { autoSync, state } = setup({ enabled: { linkedin: false, instagram: false, youtube: true } });
  assert.equal(await autoSync.syncIfDue(NOW), true);
  assert.equal(await autoSync.syncIfDue(NOW + 30 * 1000), false);
  assert.equal(await autoSync.syncIfDue(NOW + 5 * MINUTE), false);
  assert.equal(await autoSync.syncIfDue(NOW + 10 * MINUTE + 1), true);
  assert.equal(state.syncs, 2);
});

test('a failing check is logged, not thrown, and tried again later', async () => {
  const { autoSync, state } = setup({ enabled: { linkedin: true, instagram: false, youtube: false }, failSync: true });
  const warn = console.warn;
  console.warn = () => {};
  try {
    assert.equal(await autoSync.syncIfDue(NOW), false);
    assert.equal(await autoSync.syncIfDue(NOW + 11 * MINUTE), false);
  } finally {
    console.warn = warn;
  }
  assert.equal(state.syncs, 2);
});

test('without a database nothing happens', async () => {
  const { autoSync, state } = setup({ enabled: { linkedin: true, instagram: true, youtube: true } });
  delete process.env.DATABASE_URL;
  assert.equal(await autoSync.syncIfDue(NOW), false);
  assert.equal(state.syncs, 0);
});
