const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

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
const feed = load('src/lib/insights-store/feed.ts', { './text': text });
const rss = `<rss><channel><item>
  <link>https://www.instagram.com/p/Test_123/?utm_source=feed</link>
  <description><![CDATA[<p>Science for a better tomorrow.</p><p>Our latest research. #ChemLife</p>]]></description>
  <media:content url="https://images.example.com/photo.jpg?a=1&amp;b=2" medium="image" />
  <pubDate>Wed, 14 Oct 2026 10:00:00 GMT</pubDate>
</item></channel></rss>`;

test('RSS imports caption, copied image, source, date and a stable post identity', async () => {
  const [post] = await feed.fetchInstagramFeed('https://feeds.example.com/instagram', async () => rss);
  assert.equal(post.source, 'instagram');
  assert.equal(post.externalId, 'https://www.instagram.com/p/Test_123');
  assert.equal(post.url, 'https://www.instagram.com/p/Test_123');
  assert.equal(post.title, 'Science for a better tomorrow.');
  assert.match(post.content, /Our latest research/);
  assert.ok(!post.summary.includes('#ChemLife'));
  assert.equal(post.imageUrl, 'https://images.example.com/photo.jpg?a=1&b=2');
  assert.equal(post.copyImage, true);
  assert.equal(post.publishedAt.toISOString(), '2026-10-14T10:00:00.000Z');
});

test('Atom supports reels with an image thumbnail instead of a video enclosure', async () => {
  const [post] = await feed.fetchInstagramFeed('https://feeds.example.com/instagram', async () => `<feed><entry>
    <link href="https://instagram.com/reel/Clip-123/" rel="alternate" />
    <title>Inside our lab</title><summary>Meet the team.</summary>
    <enclosure type="video/mp4" url="https://images.example.com/video.mp4" />
    <media:thumbnail url="https://images.example.com/thumbnail.jpg" />
    <published>2026-10-12T09:00:00Z</published>
  </entry></feed>`);
  assert.equal(post.meta, 'Instagram reel');
  assert.equal(post.externalId, 'https://www.instagram.com/p/Clip-123');
  assert.equal(post.imageUrl, 'https://images.example.com/thumbnail.jpg');
});

test('JSON feeds find the original Instagram link inside provider wrapper content', async () => {
  const [post] = await feed.fetchInstagramFeed('https://feeds.example.com/instagram', async () => JSON.stringify({ items: [{
    url: 'https://provider.example.com/story/123',
    content_html: '<p>Community update</p><a href="https://www.instagram.com/p/Wrapped_123/">Read on Instagram</a>',
    attachments: [{ mime_type: 'image/jpeg', url: 'https://images.example.com/community.jpg' }],
    date_published: '2026-10-10T00:00:00Z',
  }] }));
  assert.equal(post.url, 'https://www.instagram.com/p/Wrapped_123');
  assert.equal(post.imageUrl, 'https://images.example.com/community.jpg');
});

test('profile links and lookalike domains are not imported as Instagram posts', () => {
  for (const link of ['https://instagram.com/chemlife/', 'https://instagram.com.evil.test/p/ABC', 'https://example.com/p/ABC', 'javascript:alert(1)']) {
    assert.equal(feed.instagramFeedItem({ link, html: 'A story', title: '' }), null);
    assert.equal(text.instagramPostId(link), null);
  }
  assert.equal(text.instagramPostId('https://instagram.com/reel/ABC/?igsh=tracking'), 'ABC');
});

test('feed addresses must use HTTPS, and invalid content is reported', async () => {
  let reads = 0;
  const read = async () => { reads++; return '<html>Sign in</html>'; };
  await assert.rejects(feed.fetchInstagramFeed('not a URL', read), /INSTAGRAM_FEED_URL isn't a valid/);
  await assert.rejects(feed.fetchInstagramFeed('http://feeds.example.com/instagram', read), /must start with https/);
  assert.equal(reads, 0);
  await assert.rejects(feed.fetchInstagramFeed('https://feeds.example.com/instagram', read), /doesn't give an RSS/);
});

test('Instagram reads the newest 30 entries; LinkedIn keeps its limit of 20', async () => {
  const body = JSON.stringify({ items: Array.from({ length: 35 }, (_, i) => ({
    url: `https://instagram.com/p/Post${i}/`, content_text: `Post ${i}`,
    date_published: new Date(Date.UTC(2026, 8, i + 1)).toISOString(),
  })) });
  const posts = await feed.fetchInstagramFeed('https://feeds.example.com/instagram', async () => body);
  assert.equal(posts.length, 30);
  assert.equal(posts[0].externalId, 'https://www.instagram.com/p/Post34');
  const linkedin = body.replaceAll('instagram.com/p/', 'linkedin.com/posts/');
  assert.equal((await feed.fetchLinkedInFeed('https://feeds.example.com/linkedin', async () => linkedin)).length, 20);
});

const originalEnvironment = { ...process.env };
test.afterEach(() => {
  for (const key of ['INSTAGRAM_FEED_URL', 'INSTAGRAM_ACCESS_TOKEN', 'LINKEDIN_FEED_URL']) {
    if (originalEnvironment[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnvironment[key];
  }
  delete globalThis.insightsSync;
});

function syncHarness({ existing = [], ids = [], entries, error, autoPublish = false, saved = [], failImages = false, postPictures = {}, settings = {} } = {}) {
  const calls = { api: 0, renew: 0, feed: 0, images: 0, imported: [], refreshed: 0, changed: [], lookedUp: [], settings: { ...settings } };
  const sync = load('src/lib/insights-store/sync.ts', {
    'next/cache': { revalidatePath: () => { calls.refreshed++; } },
    '@/lib/insights': { FALLBACK_INSIGHTS: { blogs: [], podcasts: [], videos: [] } },
    './db': {
      getSetting: async key => ['started', 'repaired:blog-text', 'repaired:linkedin-videos', 'repaired:instagram-reels'].includes(key) ? 'true' : (calls.settings[key] ?? null),
      setSetting: async (key, value) => { calls.settings[key] = value; }, removeUnusedImages: async () => {},
      knownIds: async () => new Set(ids), knownUrls: async () => existing,
      addImportedItems: async (source, items) => {
        calls.imported.push(...items);
        return { added: items.length, approved: source === 'instagram' && autoPublish };
      },
      socialAutoPublishSettings: async () => ({ linkedin: false, instagram: autoPublish }),
      listItems: async () => saved, changeItem: async (id, changes) => { calls.changed.push({ id, ...changes }); return null; },
    },
    './feed': { ...feed, fetchInstagramFeed: async (url, read) => {
      calls.feed++;
      if (error) throw new Error(error);
      if (entries) return entries;
      return feed.fetchInstagramFeed(url, read);
    } },
    './preview': {
      fetchFeedText: async () => rss,
      copyImage: async () => { calls.images++; if (failImages) throw new Error('The page answered 403'); return 42; },
      previewLink: async url => { calls.lookedUp.push(url); return { item: { imageId: postPictures[url] }, existing: null, notes: [] }; },
    },
    './sources': {
      fetchYouTubeUploads: async () => [], fetchWordPressPosts: async () => [],
      fetchInstagramPosts: async () => { calls.api++; return entries ?? []; },
      renewInstagramToken: async token => { calls.renew++; return { token, expiresAt: new Date() }; },
    },
    './text': text,
  });
  delete process.env.LINKEDIN_FEED_URL;
  return { sync, calls };
}

test('RSS takes priority over a token and uses the existing publishing preference', async () => {
  process.env.INSTAGRAM_FEED_URL = 'https://feeds.example.com/instagram';
  process.env.INSTAGRAM_ACCESS_TOKEN = 'test-only-token';
  for (const enabled of [false, true]) {
    const { sync, calls } = syncHarness({ autoPublish: enabled });
    const result = (await sync.syncInbox()).find(r => r.source === 'instagram');
    assert.equal(result.added, 1);
    assert.equal(result.approved, enabled);
    assert.equal(calls.api, 0);
    assert.equal(calls.renew, 0);
    assert.equal(calls.images, 1);
    assert.equal(calls.imported[0].imageId, 42);
    assert.match((await sync.inboxStatus()).sources.instagram.detail, /through its feed/);
  }
});

test('API and manually reviewed posts stay deduplicated when switching to RSS, including duplicate feed entries', async () => {
  process.env.INSTAGRAM_FEED_URL = 'https://feeds.example.com/instagram';
  const post = feed.instagramFeedItem({ link: 'https://instagram.com/p/Test_123/', html: 'Already hidden', title: '' });
  const fresh = feed.instagramFeedItem({ link: 'https://instagram.com/reel/New_456/', html: 'New story', title: '' });
  const { sync, calls } = syncHarness({
    ids: ['numeric-api-id'], existing: ['https://www.instagram.com/reel/Test_123/?igsh=tracking'],
    entries: [post, fresh, { ...fresh }],
  });
  assert.equal((await sync.syncInbox()).find(r => r.source === 'instagram').added, 1);
  assert.deepEqual(calls.imported.map(item => item.externalId), ['https://www.instagram.com/p/New_456']);
});

test('an invalid configured feed is reported without falling back to the API', async () => {
  process.env.INSTAGRAM_FEED_URL = 'https://feeds.example.com/instagram';
  process.env.INSTAGRAM_ACCESS_TOKEN = 'test-only-token';
  const { sync, calls } = syncHarness({ error: 'Feed unavailable' });
  const result = (await sync.syncInbox()).find(r => r.source === 'instagram');
  assert.equal(result.error, 'Feed unavailable');
  assert.equal(result.added, 0);
  assert.equal(calls.api, 0);
});

test('the API still works when no Instagram feed is configured', async () => {
  delete process.env.INSTAGRAM_FEED_URL;
  process.env.INSTAGRAM_ACCESS_TOKEN = 'test-only-token';
  const { sync, calls } = syncHarness();
  await sync.syncInbox();
  assert.equal(calls.feed, 0);
  assert.equal(calls.api, 1);
  assert.equal(calls.renew, 1);
});

test('a saved post whose picture could not be copied gets it on a later check', async () => {
  process.env.INSTAGRAM_FEED_URL = 'https://feeds.example.com/instagram';
  const entry = (code, imageUrl) => ({
    source: 'instagram', externalId: `https://www.instagram.com/p/${code}`, kind: 'Blog', title: code, summary: code,
    url: `https://www.instagram.com/p/${code}`, imageUrl, copyImage: Boolean(imageUrl), meta: 'Instagram post', publishedAt: new Date(),
  });
  const entries = [entry('NoPicture', 'https://images.example.com/a.jpg'), entry('HasPicture', 'https://images.example.com/b.jpg'), entry('FeedHasNone')];
  const row = (id, code, image, status = 'approved') => ({ id, source: 'instagram', externalId: `old-api-id-${id}`, url: `https://www.instagram.com/p/${code}/`, image, status });
  const saved = [row(1, 'NoPicture', ''), row(2, 'HasPicture', '/api/insights/media/2.jpg'), row(3, 'FeedHasNone', ''), { ...row(4, 'NoPicture', ''), source: 'linkedin' }];
  const existing = saved.map(item => item.url);

  const { sync, calls } = syncHarness({ entries, existing, saved });
  assert.equal((await sync.syncInbox()).find(r => r.source === 'instagram').added, 0);
  assert.deepEqual(calls.changed, [{ id: 1, imageId: 42 }]);
  assert.equal(calls.images, 1);
  assert.equal(calls.refreshed, 1);

  // A picture that still can't be fetched leaves the post as it is, to try again next time.
  const failing = syncHarness({ entries, existing, saved, failImages: true });
  await failing.sync.syncInbox();
  assert.deepEqual(failing.calls.changed, []);
  assert.equal(failing.calls.refreshed, 0);

  // A post still waiting in the inbox gets its picture without rebuilding the page.
  const waiting = syncHarness({ entries, existing, saved: [row(1, 'NoPicture', '', 'pending')] });
  await waiting.sync.syncInbox();
  assert.deepEqual(waiting.calls.changed, [{ id: 1, imageId: 42 }]);
  assert.equal(waiting.calls.refreshed, 0);
});

test('a post whose picture never reached the inbox shows the picture kept in the site', () => {
  const { insightCard } = load('src/lib/insights-store/card.ts', { './text': text });
  const card = (url, image = '') => insightCard({
    kind: 'Blog', title: 't', summary: 's', meta: 'Instagram post', publishedAt: '2026-10-27T10:00:00.000Z', url, image, youtubeId: '', content: '', featured: false,
  }).imageUrl;
  assert.equal(card('https://www.instagram.com/p/DfALBAYMboD'), '/images/insights/instagram/DfALBAYMboD.jpg');
  assert.equal(card('https://www.instagram.com/p/DfALBAYMboD/', '/api/insights/media/3.jpg'), '/api/insights/media/3.jpg');
  assert.equal(card('https://www.instagram.com/p/SomethingElse'), undefined);
  assert.equal(card(''), undefined);
});

test("a post the feed no longer lists gets its picture from the post's own page, a few tries at most", async () => {
  process.env.INSTAGRAM_FEED_URL = 'https://feeds.example.com/instagram';
  const row = (id, code, status = 'approved') => ({ id, source: 'instagram', externalId: `https://www.instagram.com/p/${code}`, url: `https://www.instagram.com/p/${code}`, image: '', status });
  const saved = [row(7, 'Dropped'), row(8, 'NoneAnywhere', 'pending'), { ...row(9, 'Pictured'), image: '/api/insights/media/9.jpg' }];
  const postPictures = { 'https://www.instagram.com/p/Dropped': 77 };

  const first = syncHarness({ entries: [], saved, postPictures });
  await first.sync.syncInbox();
  assert.deepEqual(first.calls.lookedUp, ['https://www.instagram.com/p/Dropped', 'https://www.instagram.com/p/NoneAnywhere']);
  assert.deepEqual(first.calls.changed, [{ id: 7, imageId: 77 }]);
  assert.equal(first.calls.refreshed, 1);
  // Only the post that's still missing its picture is remembered.
  const remembered = JSON.parse(first.calls.settings.picture_lookups);
  assert.deepEqual(Object.keys(remembered), ['instagram:8']);

  // Not again within 6 hours; again after that; never after 5 tries.
  const soon = syncHarness({ entries: [], saved: [saved[1]], settings: first.calls.settings });
  await soon.sync.syncInbox();
  assert.deepEqual(soon.calls.lookedUp, []);
  const later = syncHarness({ entries: [], saved: [saved[1]], settings: { picture_lookups: JSON.stringify({ 'instagram:8': { tries: 1, at: Date.now() - 7 * 3600e3 } }) } });
  await later.sync.syncInbox();
  assert.equal(later.calls.lookedUp.length, 1);
  const givenUp = syncHarness({ entries: [], saved: [saved[1]], settings: { picture_lookups: JSON.stringify({ 'instagram:8': { tries: 5, at: 0 } }) } });
  await givenUp.sync.syncInbox();
  assert.deepEqual(givenUp.calls.lookedUp, []);
});

test("why a new post's picture couldn't be copied shows under the channel", async () => {
  process.env.INSTAGRAM_FEED_URL = 'https://feeds.example.com/instagram';
  const { sync, calls } = syncHarness({ failImages: true });
  const result = (await sync.syncInbox()).find(r => r.source === 'instagram');
  assert.equal(result.added, 1);
  assert.equal(calls.imported[0].imageId, undefined);
  assert.match(result.pictureProblem, /couldn't be copied \(The page answered 403\)/);
  calls.settings.last_sync = JSON.stringify({ at: new Date().toISOString(), results: [result] });
  const status = await syncHarness({ settings: calls.settings }).sync.inboxStatus();
  assert.equal(status.sources.instagram.state, 'connected');
  assert.match(status.sources.instagram.detail, /token is needed\. A new post's picture couldn't be copied \(The page answered 403\)\. The inbox tries again/);
});
