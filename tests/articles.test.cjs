const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

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
const articles = load('src/lib/articles.ts');

test('a WordPress article gets a page on this site named after its WordPress slug', () => {
  const linkUrl = 'https://chemlifeinnovations.wordpress.com/2025/09/22/top-6-reasons-why-feed-hygiene-impacts-profits/';
  assert.equal(articles.articlePath({ type: 'Blog', linkUrl }), '/insights/top-6-reasons-why-feed-hygiene-impacts-profits');
});

test('LinkedIn, Instagram, other links and videos have no article page', () => {
  assert.equal(articles.articlePath({ type: 'Blog', linkUrl: 'https://www.linkedin.com/posts/chemlifeinnovations_x-activity-1' }), null);
  assert.equal(articles.articlePath({ type: 'Blog', linkUrl: 'https://www.instagram.com/p/abc/' }), null);
  assert.equal(articles.articlePath({ type: 'Blog', linkUrl: 'https://example.com/a-post' }), null);
  assert.equal(articles.articlePath({ type: 'Blog' }), null);
  assert.equal(articles.articlePath({ type: 'Video', linkUrl: 'https://chemlifeinnovations.wordpress.com/2025/01/01/a/' }), null);
});

test('stored article text splits into headings, paragraphs and lists', () => {
  const blocks = articles.articleBlocks('Why feed hygiene matters\nFeed is up to 70% of costs.\n• Keep feed dry.\n• Clean bins weekly.\nConclusion\nAct now.');
  assert.deepEqual(blocks, [
    { kind: 'heading', text: 'Why feed hygiene matters' },
    { kind: 'paragraph', text: 'Feed is up to 70% of costs.' },
    { kind: 'list', items: ['Keep feed dry.', 'Clean bins weekly.'] },
    { kind: 'heading', text: 'Conclusion' },
    { kind: 'paragraph', text: 'Act now.' },
  ]);
});

test('ticked lines are list items and a short question is a heading', () => {
  const blocks = articles.articleBlocks('How Can Producers Reduce Feed Costs?\n✔ Optimizing feed formulation\n✔ Using enzymes\n- Dashed item');
  assert.deepEqual(blocks, [
    { kind: 'heading', text: 'How Can Producers Reduce Feed Costs?' },
    { kind: 'list', items: ['Optimizing feed formulation', 'Using enzymes', 'Dashed item'] },
  ]);
});

test('display dates become ISO dates for search engines', () => {
  assert.equal(articles.isoDate('September 28, 2025'), '2025-09-28');
  assert.equal(articles.isoDate('not a date'), undefined);
});
