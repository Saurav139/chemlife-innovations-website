const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Exercise the real TypeScript modules with an isolated database, without a live account or database.
function load(file, dependencies = {}) {
  const filename = path.resolve(__dirname, '..', file);
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  const resolve = (name) => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name);
  new Function('require', 'module', 'exports', '__filename', '__dirname', js)(resolve, module, module.exports, filename, path.dirname(filename));
  return module.exports;
}

const previousDatabaseUrl = process.env.DATABASE_URL;
const policy = load('src/lib/insights-store/social-publishing.ts');
test('only pending LinkedIn and Instagram imports are automatically approved', () => {
  for (const source of ['linkedin', 'instagram', 'youtube', 'wordpress', 'link']) {
    for (const status of ['pending', 'approved', 'hidden']) {
      assert.equal(policy.importedStatus(source, status, false), status);
      const expected = ['linkedin', 'instagram'].includes(source) && status === 'pending' ? 'approved' : status;
      assert.equal(policy.importedStatus(source, status, true), expected);
    }
  }
});

function database({ enabled, settings = {}, rows = [], failInsert = false, failUpdate = false } = {}) {
  process.env.DATABASE_URL = 'mysql://unit-test-only';
  const state = { settings: { ...(enabled === undefined ? {} : { [policy.LEGACY_SOCIAL_AUTO_PUBLISH_SETTING]: enabled }), ...settings }, rows: structuredClone(rows), events: [] };
  let snapshot;
  const execute = async (sql, args) => {
    state.events.push({ sql, args });
    if (sql.startsWith('INSERT INTO insight_settings')) {
      if (sql.includes('UPDATE name = VALUES(name)')) state.settings[args[0]] ??= args[1];
      else state.settings[args[0]] = args[1];
    }
    else if (sql.startsWith('SELECT value FROM insight_settings')) return [state.settings[args[0]] === undefined ? [] : [{ value: state.settings[args[0]] }]];
    else if (sql.startsWith('UPDATE insight_items')) {
      // Only the selected channel's pending posts may change.
      if (failUpdate) throw new Error('update failed');
      assert.match(sql, /WHERE status = 'pending' AND source = \?/);
      assert.equal(args.length, 2);
      assert.ok(policy.isSocialSource(args[1]));
      const changed = state.rows.filter(row => row.status === 'pending' && row.source === args[1]);
      changed.forEach(row => { row.status = 'approved'; row.decidedAt = args[0]; });
      return [{ affectedRows: changed.length }];
    } else if (sql.startsWith('INSERT IGNORE INTO insight_items')) {
      if (failInsert) throw new Error('insert failed');
      if (state.rows.some(row => row.source === args[0] && row.externalId === args[1])) return [{ affectedRows: 0 }];
      state.rows.push({ source: args[0], externalId: args[1], status: args[3], decidedAt: args[14] });
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 1 }];
  };
  const connection = {
    execute,
    beginTransaction: async () => { snapshot = { settings: { ...state.settings }, rows: structuredClone(state.rows) }; state.events.push('begin'); },
    commit: async () => { state.events.push('commit'); },
    rollback: async () => { Object.assign(state, snapshot); state.events.push('rollback'); },
    release: () => { state.events.push('release'); },
  };
  globalThis.insightsPool = { execute, getConnection: async () => connection };
  globalThis.insightsTables = Promise.resolve();
  const db = load('src/lib/insights-store/db.ts', {
    'mysql2/promise': { createPool: () => { throw new Error('must not use a real database'); } },
    './card': {}, './social-publishing': policy,
  });
  return { state, db };
}
test.afterEach(() => {
  delete globalThis.insightsPool; delete globalThis.insightsTables;
  if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = previousDatabaseUrl;
});

const post = (source, externalId) => ({ source, externalId, kind: 'Blog', title: 'Post', summary: 'Summary', meta: 'Post', publishedAt: new Date('2026-10-29T00:00:00Z') });

test('enabling LinkedIn approves only its waiting posts and preserves hidden, featured and other-channel decisions', async () => {
  const { db, state } = database({ rows: [
    { source: 'linkedin', status: 'pending' }, { source: 'instagram', status: 'pending' },
    { source: 'linkedin', status: 'hidden' }, { source: 'instagram', status: 'approved', featured: true },
    { source: 'wordpress', status: 'pending' }, { source: 'youtube', status: 'pending' },
  ] });
  assert.equal(await db.setSocialAutoPublish('linkedin', true), 1);
  assert.deepEqual(await db.socialAutoPublishSettings(), { linkedin: true, instagram: false });
  assert.deepEqual(state.rows.map(row => row.status), ['approved', 'pending', 'hidden', 'approved', 'pending', 'pending']);
  assert.equal(state.rows[3].featured, true);
  assert.deepEqual(state.events.filter(event => typeof event === 'string'), ['begin', 'commit', 'release']);
});

test('disabling does not remove approved posts, and subsequent social imports wait', async () => {
  const { db, state } = database({ enabled: 'true', rows: [{ source: 'linkedin', externalId: 'old', status: 'approved' }] });
  assert.equal(await db.setSocialAutoPublish('linkedin', false), 0);
  assert.deepEqual(await db.socialAutoPublishSettings(), { linkedin: false, instagram: true });
  assert.deepEqual(await db.addImportedItems('linkedin', [post('linkedin', 'new')], 'pending'), { added: 1, approved: false });
  assert.deepEqual(state.rows.map(row => row.status), ['approved', 'pending']);
  assert.deepEqual(await db.addImportedItems('instagram', [post('instagram', 'still-on')], 'pending'), { added: 1, approved: true });
});

test('enabling Instagram leaves waiting LinkedIn and hidden Instagram posts unchanged', async () => {
  const { db, state } = database({ rows: [
    { source: 'linkedin', status: 'pending' }, { source: 'instagram', status: 'pending' },
    { source: 'instagram', status: 'hidden' }, { source: 'wordpress', status: 'pending' },
  ] });
  assert.equal(await db.setSocialAutoPublish('instagram', true), 1);
  assert.deepEqual(await db.socialAutoPublishSettings(), { linkedin: false, instagram: true });
  assert.deepEqual(state.rows.map(row => row.status), ['pending', 'approved', 'hidden', 'pending']);
});

test('both channels inherit the combined preference until individually changed, including imports', async () => {
  const { db, state } = database({ enabled: 'true' });
  assert.deepEqual(await db.socialAutoPublishSettings(), { linkedin: true, instagram: true });
  assert.deepEqual(await db.addImportedItems('instagram', [post('instagram', 'legacy')], 'pending'), { added: 1, approved: true });
  await db.setSocialAutoPublish('linkedin', false);
  assert.deepEqual(await db.socialAutoPublishSettings(), { linkedin: false, instagram: true });
  assert.deepEqual(await db.addImportedItems('linkedin', [post('linkedin', 'explicit-off')], 'pending'), { added: 1, approved: false });
  await db.setSocialAutoPublish('instagram', false);
  assert.deepEqual(await db.socialAutoPublishSettings(), { linkedin: false, instagram: false });
  assert.equal(state.settings[policy.LEGACY_SOCIAL_AUTO_PUBLISH_SETTING], 'true');
});

test('future imports respect every combination of independent channel settings', async () => {
  for (const linkedin of [false, true]) for (const instagram of [false, true]) {
    const { db, state } = database({ settings: {
      [policy.SOCIAL_AUTO_PUBLISH_SETTINGS.linkedin]: String(linkedin),
      [policy.SOCIAL_AUTO_PUBLISH_SETTINGS.instagram]: String(instagram),
    } });
    for (const source of policy.SOCIAL_SOURCES) {
      const enabled = { linkedin, instagram }[source];
      assert.deepEqual(await db.addImportedItems(source, [post(source, 'new')], 'pending'), { added: 1, approved: enabled });
      assert.equal(state.rows.find(row => row.source === source).status, enabled ? 'approved' : 'pending');
    }
  }
});

test('a failed approval rolls back its saved preference and leaves both channels intact', async () => {
  const { db, state } = database({ enabled: 'false', failUpdate: true, rows: [
    { source: 'linkedin', status: 'pending' }, { source: 'instagram', status: 'pending' },
  ] });
  await assert.rejects(db.setSocialAutoPublish('linkedin', true), /update failed/);
  assert.deepEqual(await db.socialAutoPublishSettings(), { linkedin: false, instagram: false });
  assert.deepEqual(state.rows.map(row => row.status), ['pending', 'pending']);
  assert.deepEqual(state.events.filter(event => typeof event === 'string'), ['begin', 'rollback', 'release']);
});

test('new social imports use the saved setting under a shared lock, with no duplicates or hidden-post revival', async () => {
  const { db, state } = database({ enabled: 'true', rows: [{ source: 'linkedin', externalId: 'hidden', status: 'hidden' }] });
  assert.deepEqual(await db.addImportedItems('linkedin', [post('linkedin', 'new')], 'pending'), { added: 1, approved: true });
  assert.deepEqual(await db.addImportedItems('linkedin', [post('linkedin', 'new'), post('linkedin', 'hidden')], 'pending'), { added: 0, approved: true });
  assert.deepEqual(state.rows.map(row => row.status), ['hidden', 'approved']);
  const lock = state.events.findIndex(event => event.sql?.includes('FOR UPDATE'));
  const insert = state.events.findIndex(event => event.sql?.startsWith('INSERT IGNORE INTO insight_items'));
  assert.ok(lock >= 0 && lock < insert);
  assert.equal(state.events[lock].args[0], policy.SOCIAL_AUTO_PUBLISH_SETTINGS.linkedin);
});

test('the default is off and manually pasted posts retain the moderator-selected status', async () => {
  const { db, state } = database();
  assert.deepEqual(await db.socialAutoPublishSettings(), { linkedin: false, instagram: false });
  await db.addImportedItems('instagram', [post('instagram', 'default')], 'pending');
  assert.equal(state.rows[0].status, 'pending');
  state.settings[policy.LEGACY_SOCIAL_AUTO_PUBLISH_SETTING] = 'true';
  await db.addItems([post('linkedin', 'manual')], 'pending');
  await db.addImportedItems('wordpress', [post('wordpress', 'blog')], 'pending');
  assert.deepEqual(state.rows.map(row => row.status), ['pending', 'pending', 'pending']);
});

test('failed imports roll back the transaction and release the connection', async () => {
  const { db, state } = database({ enabled: 'true', failInsert: true });
  await assert.rejects(db.addImportedItems('instagram', [post('instagram', 'failed')], 'pending'), /insert failed/);
  assert.deepEqual(state.rows, []);
  assert.deepEqual(state.events.filter(event => typeof event === 'string'), ['begin', 'rollback', 'release']);
});

function endpoint({ denied = null, configured = true, fail = false } = {}) {
  const calls = [];
  const route = load('src/app/api/admin/insights/settings/route.ts', {
    '@/lib/admin-auth': { requireAdmin: () => denied },
    '@/lib/insights-store/social-publishing': policy,
    '@/lib/insights-store/db': {
      storeConfigured: () => configured, listItems: async () => [],
      setSocialAutoPublish: async (source, enabled) => { if (fail) throw new Error('private database detail'); calls.push({ source, enabled }); return enabled ? 2 : 0; },
    },
    '@/lib/insights-store/sync': {
      startInbox: async () => {}, refreshInsightsPage: () => calls.push('refresh'),
      inboxStatus: async () => ({ autoPublishSocial: { linkedin: true, instagram: false }, lastSync: null, sources: {} }),
    },
  });
  const request = body => new Request('http://localhost:3000/api/admin/insights/settings', { method: 'PUT', body: JSON.stringify(body) });
  return { route, calls, request };
}

test('settings endpoint rejects unauthorised, unconfigured and invalid requests before changing anything', async () => {
  for (const [options, body, status] of [
    [{ denied: new Response(null, { status: 403 }) }, { source: 'linkedin', enabled: true }, 403],
    [{ configured: false }, { source: 'linkedin', enabled: true }, 503],
    [{}, { source: 'linkedin', enabled: 'true' }, 400], [{}, null, 400],
    [{}, { source: 'youtube', enabled: true }, 400],
    [{}, { enabled: true }, 400], [{}, { autoPublishSocial: true }, 400],
  ]) {
    const { route, calls, request } = endpoint(options);
    assert.equal((await route.PUT(request(body))).status, status);
    assert.deepEqual(calls, []);
  }
});

test('saving a valid preference refreshes public Insights and returns updated dashboard state', async () => {
  const { route, calls, request } = endpoint();
  const response = await route.PUT(request({ source: 'linkedin', enabled: true }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const saved = await response.json();
  assert.equal(saved.approvedCount, 2);
  assert.deepEqual(saved.autoPublishSocial, { linkedin: true, instagram: false });
  assert.deepEqual(calls, [{ source: 'linkedin', enabled: true }, 'refresh']);
});

test('the endpoint saves an Instagram choice without changing LinkedIn', async () => {
  const { route, calls, request } = endpoint();
  assert.equal((await route.PUT(request({ source: 'instagram', enabled: false }))).status, 200);
  assert.deepEqual(calls, [{ source: 'instagram', enabled: false }]);
});

test('save errors are reported without leaking database details', async () => {
  const { route, request } = endpoint({ fail: true });
  const response = await route.PUT(request({ source: 'linkedin', enabled: true }));
  assert.equal(response.status, 500);
  assert.doesNotMatch(JSON.stringify(await response.json()), /private database detail/);
});

test('the dashboard checkbox reflects the persisted setting and describes existing-post behaviour', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const Inbox = load('src/app/admin/insights/InsightsInbox.tsx', {
    '@/components/InsightCard': { __esModule: true, default: () => null, INSIGHT_CARD_CLASS: '' },
    '@/lib/assets': { Images: { gallery: { rotate21: '/fallback.jpg' } } },
    '@/lib/insights-store/card': { insightCard: () => ({}) },
    '@/lib/insights-store/social-publishing': policy,
  }).default;
  const sources = Object.fromEntries(['youtube', 'wordpress', 'instagram', 'linkedin', 'link'].map(source => [source, { state: 'not-set-up', detail: 'Not connected' }]));
  for (const linkedin of [false, true]) for (const instagram of [false, true]) {
    const html = renderToStaticMarkup(React.createElement(Inbox, { initial: { items: [], lastSync: null, sources, autoPublishSocial: { linkedin, instagram } } }));
    const checkboxes = Array.from(html.matchAll(/<input[^>]*aria-describedby="automatic-social-help"[^>]*>/g), match => match[0]);
    assert.equal(checkboxes.length, 2);
    assert.equal(checkboxes[0].includes('checked=""'), linkedin);
    assert.equal(checkboxes[1].includes('checked=""'), instagram);
    assert.match(html, /Automatically add LinkedIn posts to Insights/);
    assert.match(html, /Automatically add Instagram posts to Insights/);
    assert.match(html, /Hidden posts stay hidden/);
  }
});
