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

test('only WordPress articles, videos and podcasts can be featured', () => {
  const types = load('src/lib/insights-store/types.ts');
  assert.equal(types.canBeFeatured({ kind: 'Blog', source: 'wordpress' }), true);
  for (const source of ['linkedin', 'instagram', 'link']) assert.equal(types.canBeFeatured({ kind: 'Blog', source }), false);
  assert.equal(types.canBeFeatured({ kind: 'Video', source: 'youtube' }), true);
  assert.equal(types.canBeFeatured({ kind: 'Podcast', source: 'youtube' }), true);
});

test('Instagram reels are told by their address and get Instagram\'s player', () => {
  assert.equal(text.instagramReelCode('https://www.instagram.com/reel/DfPc8C_MB2N/'), 'DfPc8C_MB2N');
  assert.equal(text.instagramReelCode('https://www.instagram.com/tv/DfPc8C_MB2N'), 'DfPc8C_MB2N');
  assert.equal(text.instagramReelCode('https://www.instagram.com/p/DfJ-ZMhsPbJ/'), null);
  assert.equal(text.instagramReelCode('https://evil.example/reel/DfPc8C_MB2N/'), null);
  assert.equal(text.instagramEmbedUrl('DfPc8C_MB2N'), 'https://www.instagram.com/p/DfPc8C_MB2N/embed/');
});

test('a pasted Instagram post keeps only Instagram\'s own player address', () => {
  const reel = (videoUrl, source = 'instagram') => validate.parseNewItem({ source, kind: 'Blog', externalId: 'x', title: 'Reel', videoUrl, publishedAt: '2026-11-01' });
  assert.equal(reel('https://www.instagram.com/p/DfPc8C_MB2N/embed/').videoUrl, 'https://www.instagram.com/p/DfPc8C_MB2N/embed/');
  assert.equal(reel('https://www.instagram.com/reel/DfPc8C_MB2N/embed').videoUrl, 'https://www.instagram.com/p/DfPc8C_MB2N/embed/');
  for (const other of ['https://www.instagram.com.evil.example/p/DfPc8C_MB2N/embed/', 'https://www.instagram.com/p/DfPc8C_MB2N/embed/?x=1', 'https://www.instagram.com/p/a/b/embed/'])
    assert.equal(reel(other).videoUrl, undefined);
  assert.equal(reel('https://www.instagram.com/p/DfPc8C_MB2N/embed/', 'linkedin').videoUrl, undefined);
});

test('LinkedIn\'s embed page is recognised as a video by its player as well', () => {
  assert.equal(text.isLinkedInVideoPage('<div class="share-native-video w-main-feed-card-media" data-test-id="feed-native-video-content">'), true);
  assert.equal(text.isLinkedInVideoPage('<div class="share-images w-main-feed-card-media">'), false);
});

test('posts saved before videos were recognised get the built-in list\'s player on the page', async () => {
  const anyImage = new Proxy({}, { get: () => new Proxy({}, { get: () => '/images/x.jpg' }) });
  const saved = (linkUrl, videoUrl) => ({ type: 'Blog', title: linkUrl, description: '', meta: '', date: 'June 1, 2026', linkUrl, videoUrl });
  const feedBites = 'https://www.linkedin.com/posts/chemlifeinnovations_feedbites-chemlifeinnovations-animalnutrition-activity-7473607866512355328-G6mF';
  const other = 'https://www.linkedin.com/feed/update/urn:li:activity:7000000000000000000';
  const insights = load('src/lib/insights.ts', {
    '@/lib/assets': { Images: anyImage },
    '@/lib/insights-store/sources': { fetchYouTubeUploads: async () => [] },
    '@/lib/insights-store/text': text,
    '@/lib/articles': load('src/lib/articles.ts'),
    '@/lib/insights-store/db': {
      storeConfigured: () => true,
      approvedInsights: async () => ({ blogs: [saved(feedBites), saved(other), saved(other.replace('7000', '7001'), 'https://www.linkedin.com/embed/feed/update/urn:li:activity:7001000000000000000?compact=true')], podcasts: [], videos: [] }),
    },
  });
  const { blogs } = await insights.getInsights();
  assert.equal(blogs[0].videoUrl, PLAYER);
  assert.equal(blogs[1].videoUrl, undefined);
  assert.equal(blogs[2].videoUrl, 'https://www.linkedin.com/embed/feed/update/urn:li:activity:7001000000000000000?compact=true');
});

test('Instagram reels saved before reels got a player get Instagram\'s player on the page', async () => {
  const anyImage = new Proxy({}, { get: () => new Proxy({}, { get: () => '/images/x.jpg' }) });
  const post = (linkUrl, meta) => ({ type: 'Blog', title: linkUrl + meta, description: '', meta, date: 'November 1, 2026', linkUrl });
  const insights = load('src/lib/insights.ts', {
    '@/lib/assets': { Images: anyImage },
    '@/lib/insights-store/sources': { fetchYouTubeUploads: async () => [] },
    '@/lib/insights-store/text': text,
    '@/lib/articles': load('src/lib/articles.ts'),
    '@/lib/insights-store/db': {
      storeConfigured: () => true,
      approvedInsights: async () => ({ blogs: [
        post('https://www.instagram.com/reel/DfPc8C_MB2N/', 'Instagram reel'),
        post('https://www.instagram.com/p/DfCfLAAu_Xu/', 'Instagram reel'),
        post('https://www.instagram.com/reel/De9YtkHsCzX/', 'Instagram post'),
        post('https://www.instagram.com/p/DfJ-ZMhsPbJ/', 'Instagram post'),
      ], podcasts: [], videos: [] }),
    },
  });
  const players = (await insights.getInsights()).blogs.map((item) => item.videoUrl);
  assert.deepEqual(players, [
    'https://www.instagram.com/p/DfPc8C_MB2N/embed/',
    'https://www.instagram.com/p/DfCfLAAu_Xu/embed/',
    'https://www.instagram.com/p/De9YtkHsCzX/embed/',
    undefined,
  ]);
});

test('an Instagram feed entry linked as /p/ is a reel when the feed attaches a video', () => {
  const feed = load('src/lib/insights-store/feed.ts', { './text': text });
  const rss = (link, media) => `<rss><channel><item><title>Reel</title><link>${link}</link><description>Feed Bites</description>${media}<pubDate>Sat, 01 Nov 2026 10:00:00 GMT</pubDate></item></channel></rss>`;
  const [reel] = feed.parseFeed(rss('https://www.instagram.com/p/DfCfLAAu_Xu/', '<media:content url="https://cdn.example/v.mp4" medium="video" type="video/mp4"/><media:content url="https://cdn.example/c.jpg" medium="image"/>'));
  assert.equal(reel.video, true);
  assert.equal(reel.image, 'https://cdn.example/c.jpg');
  assert.equal(feed.instagramFeedItem(reel).videoUrl, 'https://www.instagram.com/p/DfCfLAAu_Xu/embed/');
  const [picture] = feed.parseFeed(rss('https://www.instagram.com/p/DfJ-ZMhsPbJ/', '<media:content url="https://cdn.example/p.jpg" medium="image"/>'));
  assert.equal(picture.video, false);
  assert.equal(feed.instagramFeedItem(picture).videoUrl, undefined);
  const [json] = feed.parseFeed(JSON.stringify({ version: 'https://jsonfeed.org/version/1.1', items: [{ url: 'https://www.instagram.com/p/DfCfLAAu_Xu/', content_text: 'Reel', attachments: [{ url: 'https://cdn.example/v.mp4', mime_type: 'video/mp4' }] }] }));
  assert.equal(feed.instagramFeedItem(json).videoUrl, 'https://www.instagram.com/p/DfCfLAAu_Xu/embed/');
});
