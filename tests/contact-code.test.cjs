const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// The contact form: a message only reaches the team after the visitor enters the 4-digit code emailed to them.

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

const codes = load('src/lib/emailCode.ts');
const secret = Buffer.from('test-secret');
const message = { name: 'Asha', email: 'asha@example.com', phone: '', inquiryType: 'General Inquiry', subject: 'Hello', message: 'A question.\nOn two lines.' };
const wrongCode = (code) => String((Number(code) + 1) % 10000).padStart(4, '0');

test('the right code hands back the message exactly as it was written', () => {
  const { code, challenge } = codes.issueChallenge(message, 'hi', secret);
  const check = new codes.CodeTries().check(challenge, code, secret);
  assert.equal(check.ok, true);
  assert.deepEqual(check.data.details, message);
  assert.equal(check.data.locale, 'hi');
});

test('a code works once: after the message is sent it is refused', () => {
  const tries = new codes.CodeTries();
  const { code, challenge } = codes.issueChallenge(message, 'en', secret);
  tries.check(challenge, code, secret).use();
  const again = tries.check(challenge, code, secret);
  assert.deepEqual([again.ok, again.error, again.status], [false, 'code_attempts', 429]);
});

test('five wrong tries use up a code, even if the sixth is right', () => {
  const tries = new codes.CodeTries();
  const { code, challenge } = codes.issueChallenge(message, 'en', secret);
  for (const left of [4, 3, 2, 1]) {
    assert.deepEqual(tries.check(challenge, wrongCode(code), secret), { ok: false, error: 'code_wrong', status: 400, left });
  }
  assert.equal(tries.check(challenge, wrongCode(code), secret).error, 'code_attempts');
  assert.equal(tries.check(challenge, code, secret).error, 'code_attempts');
  // A new code for the same message starts again.
  const fresh = codes.issueChallenge(message, 'en', secret);
  assert.equal(tries.check(fresh.challenge, fresh.code, secret).ok, true);
});

test('expired codes and made-up challenges are refused without counting as tries', () => {
  const tries = new codes.CodeTries();
  const now = Date.now();
  const { code, challenge } = codes.issueChallenge(message, 'en', secret, now);
  assert.deepEqual(tries.check(challenge, code, secret, now + 11 * 60_000), { ok: false, error: 'code_expired', status: 410 });
  assert.deepEqual(tries.check('nonsense', code, secret), { ok: false, error: 'invalid', status: 400 });
  assert.equal(tries.check(challenge, code, secret, now).ok, true);
});

test('a dossier code is no use on the contact form, and the other way round', () => {
  const before = { DOSSIER_SECRET: process.env.DOSSIER_SECRET, RESEND_API_KEY: process.env.RESEND_API_KEY };
  try {
    delete process.env.DOSSIER_SECRET;
    delete process.env.RESEND_API_KEY;
    assert.equal(codes.contactSecret(), null);
    process.env.RESEND_API_KEY = 're_test';
    const dossierKey = codes.dossierSecret();
    const contactKey = codes.contactSecret();
    assert.notDeepEqual(contactKey, dossierKey);
    const forDossier = codes.issueChallenge(message, 'en', dossierKey);
    assert.equal(codes.checkCode(forDossier.challenge, forDossier.code, contactKey).ok, false);
    const forContact = codes.issueChallenge(message, 'en', contactKey);
    assert.equal(codes.checkCode(forContact.challenge, forContact.code, dossierKey).ok, false);
    assert.equal(codes.checkCode(forContact.challenge, forContact.code, contactKey).ok, true);
  } finally {
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('/api/contact only emails the team from the step that checks the code', () => {
  const route = fs.readFileSync(path.join(root, 'src/app/api/contact/route.ts'), 'utf8');
  assert.equal(route.split('emailTeam(').length - 1, 1);
  const verify = route.slice(route.indexOf('if (action === "verify")'), route.indexOf('if (action === "resend")'));
  assert.ok(verify.indexOf('tries.check') > 0 && verify.indexOf('tries.check') < verify.indexOf('emailTeam('));
});

test('the code email in every language carries the code and how long it lasts', () => {
  const dir = path.join(root, 'src/i18n/messages');
  for (const file of fs.readdirSync(dir).filter((f) => /^[a-z]{2}\.ts$/.test(f))) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    const contact = text.slice(text.lastIndexOf('\n  contact: {'), text.lastIndexOf('\n  dossier: {'));
    const email = contact.slice(contact.indexOf('codeEmail: {'));
    assert.match(email, /subject: ".*\{code\}/, `${file}: subject`);
    assert.match(email, /body: ".*\{code\}.*\{minutes\}/, `${file}: body`);
    assert.match(contact, /codeText: ".*\{email\}/, `${file}: codeText`);
  }
});
