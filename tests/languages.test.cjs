const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// The site's languages: browser language matching, addresses, and every language file matching English.
function load(file) {
  const filename = path.resolve(__dirname, '..', file);
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', js)(require, module, module.exports);
  return module.exports;
}

const config = load('src/i18n/config.ts');

test('a browser asking for Bengali, Marathi, Telugu or Tamil gets that language', () => {
  assert.equal(config.preferredLocale('bn-IN,bn;q=0.9,en;q=0.8'), 'bn');
  assert.equal(config.preferredLocale('mr-IN,en;q=0.8'), 'mr');
  assert.equal(config.preferredLocale('te,en-IN;q=0.9'), 'te');
  assert.equal(config.preferredLocale('en-GB;q=0.5,ta-IN'), 'ta');
  assert.equal(config.preferredLocale('fr-FR,de;q=0.9'), 'en');
});

test('translated pages get a language prefix; English and untranslated pages keep their address', () => {
  assert.equal(config.localizePath('/products', 'ta'), '/ta/products');
  assert.equal(config.localizePath('/', 'bn'), '/bn');
  assert.equal(config.localizePath('/insights', 'te'), '/insights');
  assert.equal(config.localizePath('/products', 'en'), '/products');
});

// Every key path, with array lengths, and the {placeholders} each string must keep.
function shape(value, at = '', out = new Map()) {
  if (Array.isArray(value)) {
    out.set(at, `array(${value.length})`);
    value.forEach((v, i) => shape(v, `${at}[${i}]`, out));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) shape(v, at ? `${at}.${k}` : k, out);
  } else {
    out.set(at, typeof value === 'string' ? `string ${[...value.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort().join(' ')}` : typeof value);
  }
  return out;
}

const english = shape(load('src/i18n/messages/en.ts').default);
for (const locale of config.LOCALES.filter((l) => l !== 'en')) {
  test(`${config.LOCALE_NAMES[locale]} (${locale}) has every English text, with the same placeholders`, () => {
    const other = shape(load(`src/i18n/messages/${locale}.ts`).default);
    const differences = [...english].filter(([k, v]) => other.get(k) !== v).map(([k, v]) => `${k}: en ${v}, ${locale} ${other.get(k)}`);
    const extra = [...other.keys()].filter((k) => !english.has(k));
    assert.deepEqual([...differences, ...extra.map((k) => `${k}: only in ${locale}`)], []);
  });
}
