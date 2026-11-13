const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// The leads dashboard (/admin/leads): its filters, its CSV export, and that the forms save without waiting on the
// database.

const root = path.resolve(__dirname, '..');

function load(file) {
  const filename = path.join(root, file);
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', js)(require, module, module.exports);
  return module.exports;
}

const leads = load('src/lib/leads.ts');
const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).toISOString();
const contact = (over) => ({
  id: 1, name: 'Asha Rao', email: 'asha@example.com', phone: '', inquiryType: 'General Inquiry', subject: 'Samples',
  message: 'Please send samples.', createdAt: at(2026, 11, 10), handledAt: null, note: '', ...over,
});

test('search matches every word, in any field, ignoring case and accents', () => {
  const list = [contact({ id: 1 }), contact({ id: 2, name: 'José Pérez', message: 'Bulk order for Café Farms' })];
  const ids = (search) => leads.filterLeads(list, { ...leads.NO_FILTERS, search }).map((l) => l.id);
  assert.deepEqual(ids('jose cafe'), [2]);
  assert.deepEqual(ids('SAMPLES'), [1, 2]);
  assert.deepEqual(ids('jose samples nowhere'), []);
});

test('date filters include both days, and type and status filter too', () => {
  const list = [
    contact({ id: 1, createdAt: at(2026, 11, 1, 0) }),
    contact({ id: 2, createdAt: at(2026, 11, 5, 23), inquiryType: 'Talk to a Nutritionist' }),
    contact({ id: 3, createdAt: at(2026, 11, 6, 0), handledAt: at(2026, 11, 7) }),
  ];
  const ids = (f) => leads.filterLeads(list, { ...leads.NO_FILTERS, ...f }).map((l) => l.id);
  assert.deepEqual(ids({ from: '2026-11-01', to: '2026-11-05' }), [1, 2]);
  assert.deepEqual(ids({ from: '2026-11-06' }), [3]);
  assert.deepEqual(ids({ type: 'Talk to a Nutritionist' }), [2]);
  assert.deepEqual(ids({ status: 'new' }), [1, 2]);
  assert.deepEqual(ids({ status: 'handled' }), [3]);
});

test('CSV quotes commas, quotes and line breaks, and defuses spreadsheet formulas', () => {
  const csv = leads.contactCsv([contact({ name: '=HYPERLINK("x")', subject: 'Price, please', message: 'Line 1\nSaid "hi"' })]);
  assert.ok(csv.startsWith('﻿Received,Name,Email'));
  const row = csv.split('\r\n')[1];
  assert.ok(row.includes(`"'=HYPERLINK(""x"")"`));
  assert.ok(row.includes('"Price, please"'));
  assert.ok(csv.includes('"Line 1\nSaid ""hi"""'));
  assert.ok(row.includes(',New,'));
});

test('the dashboard accepts only a true/false tick and a short note', () => {
  assert.deepEqual(leads.parseLeadChanges({ handled: true, note: '  called  ' }), { handled: true, note: 'called' });
  assert.equal(typeof leads.parseLeadChanges({ handled: 'yes' }), 'string');
  assert.equal(typeof leads.parseLeadChanges({ note: 'x'.repeat(leads.NOTE_LIMIT + 1) }), 'string');
  assert.equal(typeof leads.parseLeadChanges({}), 'string');
});

test('both forms save after answering the visitor, so the database never blocks the email', () => {
  for (const [file, save] of [['src/app/api/contact/route.ts', 'saveContactMessage'], ['src/app/api/dossier/route.ts', 'saveDossierDownload']]) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const sent = source.indexOf('if (!sent) return fail("send_failed"');
    const saved = source.indexOf(`after(() => ${save}(`);
    assert.ok(sent > 0 && saved > sent, `${file} should save inside after(), once the email has gone`);
  }
});

test('the dashboard never opens in demo mode', () => {
  const page = fs.readFileSync(path.join(root, 'src/app/admin/leads/page.tsx'), 'utf8');
  const api = fs.readFileSync(path.join(root, 'src/app/api/admin/leads/[kind]/[id]/route.ts'), 'utf8');
  assert.ok(!page.includes('demoMode'));
  assert.ok(api.includes('allowDemo: false'));
});
