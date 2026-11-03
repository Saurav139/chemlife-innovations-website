const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// LinkedIn video posts: recognised from the post's page, and played only through LinkedIn's own embed address.
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

const text = load('src/lib/insights-store/text.ts');
const validate = load('src/app/api/admin/insights/validate.ts', {
  '@/lib/insights-store/text': text,
  '@/lib/insights-store/types': load('src/lib/insights-store/types.ts'),
});
const ACTIVITY = '7473607866512355328';
const PLAYER = `https://www.linkedin.com/embed/feed/update/urn:li:activity:${ACTIVITY}?compact=true`;

test('a post page with a VideoObject is a video; a picture post is not', () => {
  assert.equal(text.isLinkedInVideoPage('<script type="application/ld+json">{"@type": "VideoObject","duration":"PT31S"}</script>'), true);
  assert.equal(text.isLinkedInVideoPage('<script type="application/ld+json">{"@type":"SocialMediaPosting"}</script>'), false);
  assert.equal(text.linkedinEmbedUrl(ACTIVITY), PLAYER);
});

const pasted = (videoUrl, source = 'linkedin') => validate.parseNewItem({
  source, kind: 'Blog', externalId: ACTIVITY, title: 'Feed Bites', videoUrl, publishedAt: '2026-06-19',
});

test('a pasted LinkedIn post keeps only LinkedIn\'s own player address', () => {
  assert.equal(pasted(PLAYER).videoUrl, PLAYER);
  assert.equal(pasted(PLAYER.replace('?compact=true', '')).videoUrl, PLAYER);
  for (const other of [
    'https://evil.example/embed/feed/update/urn:li:activity:7473607866512355328',
    'javascript:alert(1)',
    `${PLAYER}&next=https://evil.example`,
    'https://www.linkedin.com.evil.example/embed/feed/update/urn:li:activity:7473607866512355328',
    42, undefined,
  ]) assert.equal(pasted(other).videoUrl, undefined);
  assert.equal(pasted(PLAYER, 'link').videoUrl, undefined);
});
