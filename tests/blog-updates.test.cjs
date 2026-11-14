const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// A blog post that's already on the site keeps up with WordPress, unless the moderator rewrote its text in the inbox.
function load(file, dependencies = {}) {
  const filename = path.resolve(__dirname, '..', file);
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', js)(
    name => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name), module, module.exports,
  );
  return module.exports;
}
const text = load('src/lib/insights-store/text.ts');
const types = load('src/lib/insights-store/types.ts');
const validate = load('src/app/api/admin/insights/validate.ts', { '@/lib/insights-store/text': text, '@/lib/insights-store/types': types });
const LINK = 'https://chemlifeinnovations.wordpress.com/2025/09/22/feed-hygiene/';

test('an edit that leaves the text alone is not a rewrite; a rewrite is recorded; emptying hands the text back', () => {
  assert.deepEqual(validate.withTextDecision({ title: 'New title', content: 'Same text.\nSecond line.' }, 'Same text.\r\nSecond line.\n'), { title: 'New title' });
  assert.deepEqual(validate.withTextDecision({ content: 'My own words.' }, 'WordPress words.'), { content: 'My own words.', contentEdited: true });
  assert.deepEqual(validate.withTextDecision({ content: '' }, 'WordPress words.'), { content: '', contentEdited: false });
  assert.deepEqual(validate.withTextDecision({ status: 'hidden' }, 'WordPress words.'), { status: 'hidden' });
  // The dashboard can't set the record itself.
  assert.equal(validate.parseChanges({ contentEdited: false, content: 'x' }).contentEdited, undefined);
});

function syncWith({ saved, posts, builtIn = [] }) {
  const calls = { settled: [], refreshed: [], imported: [], pageRefreshed: 0 };
  const sync = load('src/lib/insights-store/sync.ts', {
    'next/cache': { revalidatePath: () => { calls.pageRefreshed++; } },
    '@/lib/insights': { FALLBACK_INSIGHTS: { blogs: builtIn, podcasts: [], videos: [] } },
    './db': {
      getSetting: async key => ['started', 'repaired:blog-text', 'repaired:linkedin-videos', 'repaired:instagram-reels'].includes(key) ? 'true' : null,
      setSetting: async () => {}, removeUnusedImages: async () => {}, knownUrls: async () => [], changeItem: async () => null,
      knownIds: async (source, ids) => new Set(ids.filter(id => saved.some(row => row.source === source && row.externalId === id))),
      addImportedItems: async (source, items) => { calls.imported.push(...items); return { added: items.length, approved: false }; },
      socialAutoPublishSettings: async () => ({}),
      listItems: async () => saved,
      settleContentEdited: async (id, edited) => { calls.settled.push([id, edited]); },
      refreshSourceText: async (id, change) => { calls.refreshed.push({ id, ...change }); return true; },
    },
    './feed': {}, './preview': { copyImage: async () => 1, fetchFeedText: async () => '' },
    './sources': { fetchYouTubeUploads: async () => null, fetchWordPressPosts: async () => posts, fetchInstagramPosts: async () => null },
    './text': text,
  });
  delete process.env.INSTAGRAM_FEED_URL; delete process.env.INSTAGRAM_ACCESS_TOKEN; delete process.env.LINKEDIN_FEED_URL;
  return { sync, calls };
}
const wordpressPost = (content, extra = {}) => ({
  source: 'wordpress', externalId: text.normalizeUrl(LINK), kind: 'Blog', title: 'Feed hygiene', url: LINK,
  content, summary: text.articleSummary(content), meta: text.readingTime(content), publishedAt: new Date('2025-09-22'), ...extra,
});
const row = (content, extra = {}) => ({
  id: 7, source: 'wordpress', externalId: text.normalizeUrl(LINK), status: 'approved', title: 'Feed hygiene', url: LINK, image: '/p.jpg',
  content, summary: text.articleSummary(content), meta: text.readingTime(content), contentEdited: false, ...extra,
});
const OLD = 'Feed hygiene protects animals and margins on every farm.\nKeep bins dry.';
const NEW = 'Feed hygiene protects animals, people and margins on every farm.\nKeep bins dry and sealed.';

test('wording changed in WordPress reaches a post that is already in the inbox, with its summary', async () => {
  const { sync, calls } = syncWith({ saved: [row(OLD)], posts: [wordpressPost(NEW)] });
  await sync.syncInbox();
  assert.deepEqual(calls.refreshed, [{ id: 7, content: NEW, summary: text.articleSummary(NEW), meta: text.readingTime(NEW) }]);
  assert.deepEqual(calls.settled, []);
  assert.deepEqual(calls.imported, []);
  assert.equal(calls.pageRefreshed, 1);
});

test('a summary or card label the moderator wrote is kept when the text is refreshed', async () => {
  const { sync, calls } = syncWith({ saved: [row(OLD, { summary: 'Hand-written summary.', meta: 'Guide' })], posts: [wordpressPost(NEW)] });
  await sync.syncInbox();
  assert.deepEqual(calls.refreshed, [{ id: 7, content: NEW, summary: undefined, meta: undefined }]);
});

test('text the moderator rewrote is never replaced, and unchanged text is left alone', async () => {
  for (const saved of [row('The moderator\'s own words.', { contentEdited: true }), row(NEW)]) {
    const { sync, calls } = syncWith({ saved: [saved], posts: [wordpressPost(NEW)] });
    await sync.syncInbox();
    assert.deepEqual(calls.refreshed, []);
    assert.equal(calls.pageRefreshed, 0);
  }
});

test('a post from before rewrites were recorded is settled by comparing it with WordPress and the built-in list', async () => {
  // Same words as WordPress: not rewritten. Nothing to refresh either.
  let run = syncWith({ saved: [row(NEW.replace('\n', '\n\n'), { contentEdited: null })], posts: [wordpressPost(NEW)] });
  await run.sync.syncInbox();
  assert.deepEqual(run.calls.settled, [[7, false]]);
  // Different words: taken as the moderator's, and kept.
  run = syncWith({ saved: [row('Different words entirely.', { contentEdited: null })], posts: [wordpressPost(NEW)] });
  await run.sync.syncInbox();
  assert.deepEqual(run.calls.settled, [[7, true]]);
  assert.deepEqual(run.calls.refreshed, []);
  // The built-in list's own summary of the article: not rewritten, so it follows WordPress from now on.
  const builtIn = [{ type: 'Blog', title: 'Feed hygiene', description: 'About feed hygiene.', meta: '5 min read', date: 'September 22, 2025', linkUrl: LINK, content: 'A short summary of the article.' }];
  run = syncWith({ saved: [row('A short summary of the article.', { contentEdited: null, summary: 'About feed hygiene.', meta: '5 min read' })], posts: [wordpressPost(NEW)], builtIn });
  await run.sync.syncInbox();
  assert.deepEqual(run.calls.settled, [[7, false]]);
  assert.deepEqual(run.calls.refreshed, [{ id: 7, content: NEW, summary: undefined, meta: undefined }]);
});

test('a newly imported blog post is recorded as WordPress\'s own text', async () => {
  const { sync, calls } = syncWith({ saved: [], posts: [wordpressPost(NEW)] });
  await sync.syncInbox();
  assert.equal(calls.imported.length, 1);
  assert.equal(calls.imported[0].contentEdited, false);
});

// ---------- The article page ----------

function articleSource(html) {
  const requests = [];
  const source = load('src/lib/article-source.ts', {
    '@/lib/article-html': load('src/lib/article-html.ts', { './insights-store/text': text }),
    '@/lib/articles': load('src/lib/articles.ts'),
    '@/lib/insights': { FALLBACK_INSIGHTS: { blogs: [] } },
    '@/lib/insights-store/sources': { WORDPRESS_SITE: 'chemlifeinnovations.wordpress.com' },
    '@/lib/insights-store/text': text,
  });
  const realFetch = globalThis.fetch;
  globalThis.fetch = async url => { requests.push(String(url)); if (html === null) throw new Error('offline'); return { ok: true, json: async () => [{ content: { rendered: html } }] }; };
  return { source, requests, restore: () => { globalThis.fetch = realFetch; } };
}
const article = extra => ({ type: 'Blog', title: 'Feed hygiene', description: '', meta: '', date: 'September 22, 2025', linkUrl: LINK, ...extra });
const HTML = '<p>Feed hygiene protects animals, <strong>people</strong> and margins.</p>';

test('the article page shows WordPress\'s current version unless the text was rewritten in the inbox', async () => {
  const { source, requests, restore } = articleSource(HTML);
  const warn = console.warn; console.warn = () => {};
  try {
    // Recorded as WordPress's own text: the page follows WordPress even when the saved copy is older.
    assert.equal((await source.formattedArticle(article({ content: 'An older wording.', contentEdited: false }))).html, HTML);
    // Rewritten in the inbox: the saved text is shown.
    assert.equal(await source.formattedArticle(article({ content: 'The moderator\'s words.', contentEdited: true })), null);
    // Not recorded: decided by comparing the saved text with WordPress's.
    assert.equal((await source.formattedArticle(article({ content: 'Feed hygiene protects animals, people and margins.' }))).html, HTML);
    assert.equal(await source.formattedArticle(article({ content: 'Something else.' })), null);
    // WordPress is asked once; the copy is kept for the next visits.
    assert.equal(requests.length, 1);
    assert.match(requests[0], /slug=feed-hygiene/);
    // LinkedIn and other posts have no article page to format.
    assert.equal(await source.formattedArticle(article({ linkUrl: 'https://www.linkedin.com/posts/x' })), null);
  } finally { restore(); console.warn = warn; }
});

test('the article page falls back to the saved text when WordPress cannot be reached', async () => {
  const { source, restore } = articleSource(null);
  const warn = console.warn; console.warn = () => {};
  try {
    assert.equal(await source.formattedArticle(article({ content: 'Saved text.', contentEdited: false })), null);
  } finally { restore(); console.warn = warn; }
});
