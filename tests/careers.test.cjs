const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Careers: the rules the application form, the dashboard and their API routes share.

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

const careers = load('src/lib/careers.ts');
const config = load('src/i18n/config.ts');

const role = {
  title: 'Quality Control Intern',
  department: 'Quality Assurance',
  roleScope: 'Tests raw materials.',
  qualifications: ['Careful record keeping'],
  requirements: [],
  picture: 'lab',
};

test('a résumé must be a PDF or .docx file, whatever the capitals in its name', () => {
  assert.equal(careers.hasResumeExtension('CV.PDF'), true);
  assert.equal(careers.hasResumeExtension('my cv.docx'), true);
  // The older .doc format is the one that carries macros.
  assert.equal(careers.hasResumeExtension('old.doc'), false);
  assert.equal(careers.hasResumeExtension('photo.png'), false);
  assert.equal(careers.hasResumeExtension('cv.pdf.exe'), false);
});

test("an applicant's email address can't carry anything that would change a link or a header", () => {
  const ok = (email) => careers.APPLICATION_EMAIL_PATTERN.test(email);
  assert.equal(ok('asha.rao+jobs@example.co.in'), true);
  assert.equal(ok("o'brien@example.com"), true);
  assert.equal(ok('hr%40corp.com?bcc=x%40evil.com&y=@evil.com'), false);
  assert.equal(ok('asha@example.com?subject=hi'), false);
  assert.equal(ok('asha rao@example.com'), false);
  assert.equal(ok('asha@example'), false);
});

test('a list typed one entry per line loses its blank lines and stray spaces', () => {
  assert.deepEqual(careers.linesOf('  B.Sc   Chemistry \n\n M.Sc\n   '), ['B.Sc Chemistry', 'M.Sc']);
});

test('an internship written in the dashboard is tidied and accepted', () => {
  const parsed = careers.parseRoleContent({ ...role, title: '  Quality   Control Intern ', qualifications: ['  Careful record keeping ', ''] });
  assert.deepEqual(parsed, role);
});

test('an internship needs a title, a department and a description', () => {
  for (const key of ['title', 'department', 'roleScope']) {
    assert.equal(careers.parseRoleContent({ ...role, [key]: '   ' }), null, key);
  }
  assert.equal(careers.parseRoleContent(null), null);
  assert.equal(careers.parseRoleContent('text'), null);
});

test('text over its limit, too many list lines and unknown pictures are refused', () => {
  const { ROLE_LIMITS } = careers;
  assert.equal(careers.parseRoleContent({ ...role, title: 'x'.repeat(ROLE_LIMITS.title + 1) }), null);
  assert.equal(careers.parseRoleContent({ ...role, roleScope: 'x'.repeat(ROLE_LIMITS.roleScope + 1) }), null);
  assert.equal(careers.parseRoleContent({ ...role, requirements: Array(ROLE_LIMITS.listEntries + 1).fill('A degree') }), null);
  assert.equal(careers.parseRoleContent({ ...role, qualifications: ['x'.repeat(ROLE_LIMITS.listEntry + 1)] }), null);
  assert.equal(careers.parseRoleContent({ ...role, picture: '../secret' }), null);
  assert.equal(careers.parseRoleContent({ ...role, qualifications: 'not a list' }), null);
});

test('every application starts as new, and the statuses are the four the dashboard shows', () => {
  assert.deepEqual([...careers.APPLICATION_STATUSES], ['new', 'reviewing', 'shortlisted', 'rejected']);
});

test("an internship's application page exists in every language", () => {
  assert.equal(config.isTranslatedPath('/careers/apply/research-intern'), true);
  assert.equal(config.localizePath('/careers/apply/custom-qc-intern-60a3', 'hi'), '/hi/careers/apply/custom-qc-intern-60a3');
  assert.equal(config.localizePath('/careers/apply/research-intern', 'en'), '/careers/apply/research-intern');
  assert.equal(config.isTranslatedPath('/careers/apply'), false);
});
