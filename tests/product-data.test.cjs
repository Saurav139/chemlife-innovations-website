const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// The approved technical data on the product pages (src/lib/productData.ts).
function load(file) {
  const filename = path.resolve(__dirname, '..', file);
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', js)(require, module, module.exports);
  return module.exports;
}

const { PRODUCT_DATA, PURITY_LIMITS, SAFETY } = load('src/lib/productData.ts');
const catalog = fs.readFileSync(path.resolve(__dirname, '../src/lib/catalog.ts'), 'utf8');
const productNames = [...catalog.split('export const RESEARCH_TOPICS')[0].matchAll(/name: "([^"]+)"/g)].map((m) => m[1]);

test('technical data is filed under a product that exists', () => {
  assert.ok(productNames.length > 0);
  for (const name of Object.keys(PRODUCT_DATA)) assert.ok(productNames.includes(name), `${name} is not a product in catalog.ts`);
});

test('every product with data has the facts each section shows', () => {
  for (const [name, data] of Object.entries(PRODUCT_DATA)) {
    for (const fact of ['form', 'active', 'shelfLife', 'usedIn']) assert.ok(data.glance[fact], `${name}: glance.${fact}`);
    assert.ok(data.composition.items?.length || data.composition.table?.length, `${name}: composition`);
    assert.ok(data.mechanism.length >= 3, `${name}: mechanism`);
    assert.ok(data.specs.length >= 4, `${name}: specifications`);
    assert.ok(data.storage.some(([label, value]) => label === 'Shelf life' && value === data.glance.shelfLife), `${name}: shelf life agrees`);
    for (const text of ['intendedUse', 'application', 'compatibility']) assert.ok(data[text].length > 40, `${name}: ${text}`);
    assert.match(data.documents.tds, /^CIPL\/R&D\/TDS\/\d{3}$/, `${name}: TDS number`);
    assert.match(data.documents.sds, /^SDS-[A-Z]+-\d{3}$/, `${name}: SDS number`);
  }
});

test('no two products share a document number', () => {
  const numbers = Object.values(PRODUCT_DATA).flatMap((data) => [data.documents.tds, data.documents.sds]);
  assert.equal(new Set(numbers).size, numbers.length);
});

test('table rows have unique labels, which the page uses as keys', () => {
  const unique = (rows, what) => assert.equal(new Set(rows.map(([label]) => label)).size, rows.length, what);
  unique(PURITY_LIMITS, 'purity limits');
  unique(SAFETY.firstAid, 'first aid');
  for (const [name, data] of Object.entries(PRODUCT_DATA)) {
    unique(data.specs, `${name}: specifications`);
    unique(data.mechanism, `${name}: mechanism`);
    if (data.composition.table) unique(data.composition.table, `${name}: composition`);
  }
});
