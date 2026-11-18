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
const { INSIGHT_TOPICS, MAX_TOPICS, topicsFor, topicName, topicPath } = load('src/lib/insight-topics.ts');
const { TOPIC_PAGES } = load('src/lib/insight-topic-pages.ts');
const { NO_FILTERS, parseFilters, filtersQuery, isFiltered, toggled } = load('src/lib/insight-filters.ts');

test('a post is tagged by a keyword in its title or summary', () => {
  assert.deepEqual(topicsFor({ title: 'What is aflatoxin M1 and how does it get into milk?' }), ['mycotoxins', 'milk-safety']);
  assert.deepEqual(topicsFor({ title: 'A note from the field', description: 'Why rumen bypass matters for transition cows.' }), ['dairy-nutrition']);
});

test('one passing mention deep in the text is not enough, three are', () => {
  const title = 'A note from the field';
  assert.deepEqual(topicsFor({ title, content: 'We also visited a poultry farm.' }), []);
  assert.deepEqual(topicsFor({ title, content: 'Poultry feed, poultry water and poultry housing.' }), ['poultry-nutrition']);
});

test('both spellings of mould, plurals and hashtags are found', () => {
  assert.deepEqual(topicsFor({ title: '5 Signs Your Mold Inhibitor Isn’t Working' }), ['mould-control']);
  assert.deepEqual(topicsFor({ title: 'Moulds in stored maize' }), ['mould-control']);
  assert.deepEqual(topicsFor({ title: 'Why it matters', description: 'Clean bins, dry grain. #FeedHygiene' }), ['feed-hygiene']);
});

test('short keywords match whole words only', () => {
  // "ph" is not found in "phase" or "phytogenic", "egg" not in "eggplant", "acid" not in "acidity".
  assert.deepEqual(topicsFor({ title: 'Phase feeding and eggplant trials: acidity notes' }), []);
  assert.deepEqual(topicsFor({ title: 'Check your water pH' }), ['water-quality']);
  assert.deepEqual(topicsFor({ title: 'Why eggs crack' }), ['poultry-nutrition']);
});

test('a post carries at most three tags, the strongest first', () => {
  const tags = topicsFor({
    title: 'Mycotoxin binders for poultry and dairy: feed hygiene, trace minerals and feed cost',
    description: 'Mycotoxin risk in poultry feed.',
  });
  assert.equal(tags.length, MAX_TOPICS);
  assert.deepEqual(tags.slice(0, 2), ['mycotoxins', 'poultry-nutrition']);
});

test('topics have unique slugs that fit in an address, and names', () => {
  const slugs = INSIGHT_TOPICS.map((topic) => topic.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) assert.match(slug, /^[a-z0-9-]+$/);
  assert.equal(topicName('mycotoxins'), 'Mycotoxins');
  assert.equal(topicName('gone'), 'gone');
});

test('filters are read from the address, dropping what is unknown', () => {
  const known = ['mycotoxins', 'feed-hygiene'];
  assert.deepEqual(parseFilters({}, known), NO_FILTERS);
  assert.deepEqual(parseFilters({ topic: 'mycotoxins,feed-hygiene,nonsense', type: 'blogs,Videos,x', sort: 'oldest', q: 'copper' }, known), {
    query: 'copper',
    types: ['blogs', 'videos'],
    topics: ['mycotoxins', 'feed-hygiene'],
    sort: 'oldest',
  });
  assert.deepEqual(parseFilters({ topic: ['mycotoxins', 'mycotoxins'], sort: 'sideways' }, known), { ...NO_FILTERS, topics: ['mycotoxins'] });
});

test('filters are written to the address and read back the same', () => {
  assert.equal(filtersQuery(NO_FILTERS), '');
  const filters = { query: 'water pH', types: ['blogs'], topics: ['mycotoxins', 'feed-hygiene'], sort: 'oldest' };
  const query = filtersQuery(filters);
  assert.equal(query, '?topic=mycotoxins,feed-hygiene&type=blogs&sort=oldest&q=water%20pH');
  assert.deepEqual(parseFilters(Object.fromEntries(new URLSearchParams(query))), filters);
});

test('the order alone does not count as filtering; toggling adds and removes', () => {
  assert.equal(isFiltered({ ...NO_FILTERS, sort: 'oldest' }), false);
  assert.equal(isFiltered({ ...NO_FILTERS, topics: ['mycotoxins'] }), true);
  assert.equal(isFiltered({ ...NO_FILTERS, query: '  ' }), false);
  assert.deepEqual(toggled(['a'], 'b'), ['a', 'b']);
  assert.deepEqual(toggled(['a', 'b'], 'a'), ['b']);
});

test('every topic has a page with a description that fits a search result and an introduction', () => {
  assert.equal(topicPath('mycotoxins'), '/insights/topic/mycotoxins');
  assert.deepEqual(Object.keys(TOPIC_PAGES).sort(), INSIGHT_TOPICS.map((topic) => topic.slug).sort());
  for (const [slug, page] of Object.entries(TOPIC_PAGES)) {
    assert.ok(page.description.length >= 50 && page.description.length <= 160, `${slug}: description is ${page.description.length} characters`);
    assert.ok(page.intro.length >= 80, `${slug}: introduction`);
  }
});

test('each question is asked on one topic page only, with an answer of about 40 to 50 words', () => {
  const questions = Object.values(TOPIC_PAGES).flatMap((page) => page.questions ?? []);
  assert.equal(new Set(questions.map((entry) => entry.question)).size, questions.length);
  for (const { question, answer } of questions) {
    assert.match(question, /\?$/);
    const words = answer.split(/\s+/).length;
    assert.ok(words >= 35 && words <= 55, `"${question}": the answer is ${words} words`);
  }
});
