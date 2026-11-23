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
const { searchScore, searchWords } = load('src/lib/insight-search.ts');

const costs = {
  title: 'Poultry Feed Costs in India: 6 Innovative Solutions',
  description: 'Rising feed costs have sparked concern across the poultry value chain.',
  content: 'Use DDGS and oilseed cakes. Improve grain storage with mold inhibitors.',
  labels: ['Feed Cost & Efficiency', 'Poultry Nutrition', 'Blog'],
};
const mould = {
  title: '5 Signs Your Mold Inhibitor Isn’t Working',
  description: 'Persistent musty odours and clumping are warning signs.',
  content: 'Mycotoxins such as zearalenone build up when copper sulfate is the only measure.',
  labels: ['Mould Control', 'Blog'],
};
const video = { title: 'Are You Eating What Your Food Eats?', description: 'A discussion on feed safety.', labels: ['Feed Hygiene', 'Video'] };
const found = (post, query) => searchScore(post, query) > 0;

test('an empty search finds every post', () => {
  assert.equal(searchScore(costs, ''), 1);
  assert.equal(searchScore(costs, '   '), 1);
});

test('every word must be in the post, in any order', () => {
  assert.ok(found(costs, 'poultry feed cost'));
  assert.ok(found(costs, 'feed cost poultry'));
  assert.ok(!found(costs, 'poultry dairy'));
});

test('the text, the topics and the type are searched, not only the title', () => {
  assert.ok(found(mould, 'zearalenone'));
  assert.ok(found(costs, 'nutrition'));
  assert.ok(found(video, 'video'));
  assert.ok(!found(costs, 'video'));
});

test('either spelling, and a plural or a singular, finds the post', () => {
  assert.ok(found(mould, 'mould'));
  assert.ok(found(mould, 'mold'));
  assert.ok(found(costs, 'mould inhibitor'));
  assert.ok(found(mould, 'copper sulphate'));
  assert.ok(found(mould, 'mycotoxin'));
  assert.ok(found(costs, 'costs'));
  assert.ok(found(mould, 'inhibitors'));
});

test('the small words of a question are ignored, unless they are the whole search', () => {
  assert.deepEqual(searchWords('What is the cost of feed?'), ['cost', 'feed']);
  assert.ok(found(costs, 'what is the cost of feed'));
  assert.deepEqual(searchWords('how to'), ['how', 'to']);
});

test('a word with one slip in it still finds the word that was meant', () => {
  assert.ok(found(video, 'hygeine'));
  assert.ok(found(costs, 'poltry'));
  assert.ok(found(mould, 'inhibtor'));
  assert.ok(!found(costs, 'xyzzy'));
  // Short words must be right: "feed" is not found by "fled".
  assert.ok(!found({ title: 'Feed' }, 'fled'));
});

test('a post with the words in its title comes before one with them only in its text', () => {
  assert.ok(searchScore(mould, 'mold inhibitor') > searchScore(costs, 'mold inhibitor'));
  assert.ok(searchScore(costs, 'poultry feed costs') > searchScore(costs, 'costs feed poultry'));
});
