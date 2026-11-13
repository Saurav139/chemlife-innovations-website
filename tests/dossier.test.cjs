const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// "Request a technical dossier": the PDF the form downloads must be in public/.

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/lib/dossier.ts'), 'utf8');

test('the dossier PDF the form downloads is in public/', () => {
  const pdf = source.match(/DOSSIER_PDF = "([^"]+)"/)[1];
  const file = path.join(root, 'public', pdf);
  assert.ok(fs.existsSync(file), `${pdf} is missing from public/`);
  assert.equal(fs.readFileSync(file).subarray(0, 5).toString(), '%PDF-');
});

