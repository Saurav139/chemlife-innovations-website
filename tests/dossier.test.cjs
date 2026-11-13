const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// "Request a technical dossier": the PDF is only handed out by /api/dossier/download, and only the 4-digit code
// emailed to the visitor unlocks it.

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

const dossier = load('src/lib/dossier.ts');
const codes = load('src/lib/dossierCode.ts');
const secret = Buffer.from('test-secret');
const details = { name: 'Asha', email: 'asha@example.com', company: 'Farm Co', role: '', country: 'India', interest: '' };

test('the dossier PDF is kept out of public/, where anyone could download it', () => {
  const file = path.join(root, dossier.DOSSIER_PDF_FILE);
  assert.ok(fs.existsSync(file), `${dossier.DOSSIER_PDF_FILE} is missing`);
  assert.equal(fs.readFileSync(file).subarray(0, 5).toString(), '%PDF-');
  assert.ok(!dossier.DOSSIER_PDF_FILE.startsWith('public/'));
  assert.ok(!fs.existsSync(path.join(root, 'public/downloads/chemlife-technical-dossier.pdf')));
});

test('codes are 4 digits, and only the emailed one unlocks the challenge', () => {
  const { code, challenge } = codes.issueChallenge(details, 'en', secret);
  assert.match(code, /^\d{4}$/);
  const right = codes.checkCode(challenge, code, secret);
  assert.equal(right.ok, true);
  assert.deepEqual(right.data.details, details);
  const wrong = String((Number(code) + 1) % 10000).padStart(4, '0');
  assert.deepEqual(codes.checkCode(challenge, wrong, secret), { ok: false, reason: 'wrong' });
  assert.deepEqual(codes.checkCode(challenge, '12a4', secret), { ok: false, reason: 'wrong' });
});

test('a code stops working after 10 minutes', () => {
  const now = Date.now();
  const { code, challenge } = codes.issueChallenge(details, 'en', secret, now);
  assert.equal(codes.checkCode(challenge, code, secret, now + 9 * 60_000).ok, true);
  assert.deepEqual(codes.checkCode(challenge, code, secret, now + 11 * 60_000), { ok: false, reason: 'expired' });
});

test('changed details, another server key or a made-up challenge are refused', () => {
  const { code, challenge } = codes.issueChallenge(details, 'en', secret);
  const [payload, ...sigs] = challenge.split('.');
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  data.details.email = 'someone-else@example.com';
  const changed = [Buffer.from(JSON.stringify(data)).toString('base64url'), ...sigs].join('.');
  assert.deepEqual(codes.checkCode(changed, code, secret), { ok: false, reason: 'invalid' });
  assert.equal(codes.readChallenge(changed, secret), null);
  assert.deepEqual(codes.checkCode(challenge, code, Buffer.from('other')), { ok: false, reason: 'invalid' });
  assert.deepEqual(codes.checkCode('nonsense', '1234', secret), { ok: false, reason: 'invalid' });
  assert.equal(codes.readChallenge(challenge, secret).details.email, 'asha@example.com');
});

test('the download pass works for 30 minutes and only with this server key', () => {
  const now = Date.now();
  const token = codes.issueDownloadToken(secret, now);
  assert.equal(codes.checkDownloadToken(token, secret, now + 29 * 60_000), true);
  assert.equal(codes.checkDownloadToken(token, secret, now + 31 * 60_000), false);
  assert.equal(codes.checkDownloadToken(token, Buffer.from('other'), now), false);
  assert.equal(codes.checkDownloadToken('', secret, now), false);
});
