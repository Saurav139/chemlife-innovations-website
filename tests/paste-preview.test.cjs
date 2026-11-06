const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// "Add a post" filling in pasted Instagram and LinkedIn links, with made-up pages instead of the live sites.
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

function setup({ pages = {}, token = null, apiMedia = [] } = {}) {
  const requests = [];
  const saved = [];
  const db = { IMAGE_TYPES: ['image/jpeg'], findItem: async () => null, saveImage: async (mime, data) => { saved.push({ mime, size: data.length }); return 7; } };
  const sources = load('src/lib/insights-store/sources.ts', { '@/lib/assets': { Images: {} }, './text': text });
  const preview = load('src/lib/insights-store/preview.ts', {
    './db': db, './sources': sources, './text': text,
    './sync': { instagramToken: async () => token },
    'node:dns/promises': { lookup: async () => [{ address: '93.184.216.34' }] },
  });
  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    requests.push({ url, agent: init.headers?.['User-Agent'] });
    if (url.startsWith('https://graph.instagram.com/me/media')) return Response.json({ data: apiMedia });
    if (url.startsWith('https://pictures.example/')) return new Response(Buffer.from('picture'), { headers: { 'content-type': 'image/jpeg' } });
    return Object.hasOwn(pages, url) ? new Response(pages[url], { headers: { 'content-type': 'text/html' } }) : new Response('', { status: 404 });
  };
  return { preview, requests, saved };
}
const realFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = realFetch; });

const SIGN_IN = '<html><head><meta property="og:title" content="Sign Up | LinkedIn"></head></html>';
const LINKEDIN_EMBED = `<html><head>
  <meta property="og:title" content="Feed Bites: Better Decisions | Chemlife Innovations posted on the topic | LinkedIn">
  <meta property="og:description" content="Most feed challenges don't start in the feed mill.&#10;&#10;They start earlier.">
  <meta property="og:image" content="https://pictures.example/li.jpg">
</head></html>`;

test('a LinkedIn post whose page is a sign-in page is filled in from its embed page', async () => {
  const activity = '7473607866512355328';
  const post = `https://www.linkedin.com/feed/update/urn:li:activity:${activity}/`;
  const { preview, requests, saved } = setup({ pages: {
    [post]: SIGN_IN,
    [`https://www.linkedin.com/embed/feed/update/urn:li:activity:${activity}`]: LINKEDIN_EMBED,
  } });
  const { item, notes } = await preview.previewLink(post);
  assert.equal(item.title, 'Feed Bites: Better Decisions');
  assert.equal(item.summary, "Most feed challenges don't start in the feed mill. They start earlier.");
  assert.equal(item.imageId, 7);
  assert.deepEqual(saved, [{ mime: 'image/jpeg', size: 7 }]);
  assert.deepEqual(notes, []);
  // The site names itself rather than claiming to be a browser.
  assert.ok(requests.every((r) => !r.agent || r.agent.includes('ChemLifeInsights')));
});

test('a LinkedIn post with no preview anywhere says what to fill in', async () => {
  const { preview } = setup();
  const { item, notes } = await preview.previewLink('https://www.linkedin.com/feed/update/urn:li:activity:7473607866512355328/');
  assert.equal(item.title, '');
  assert.match(notes.join(' '), /Fill in the title/);
});

test('an Instagram post is filled in from its embed page when its own page has no preview, dated by its shortcode', async () => {
  const code = 'DfCfLAAu_Xu';
  const embed = `<div class="EmbeddedMediaImageContainer"><img class="EmbeddedMediaImage" alt="post" src="https://pictures.example/ig.jpg?a=1&amp;b=2"></div>
    <div class="Caption"><a class="CaptionUsername" href="#">chemlifeinnovations_</a><br /><br />What happens inside the gut? <br /><br />The science is fascinating.<br /><br /><a href="/explore/tags/CHEMLife/">#CHEMLife</a><div class="CaptionComments"></div></div>`;
  const { preview, requests } = setup({ pages: { [`https://www.instagram.com/p/${code}/embed/captioned/`]: embed } });
  // Shared with the account's name and a tracking code.
  const { item, notes } = await preview.previewLink(`https://www.instagram.com/chemlifeinnovations_/p/${code}/?igsh=abc`);
  assert.equal(item.url, `https://www.instagram.com/p/${code}`);
  assert.equal(item.externalId, item.url);
  assert.equal(item.title, 'What happens inside the gut?');
  assert.equal(item.summary, 'What happens inside the gut? The science is fascinating.');
  assert.equal(item.imageId, 7);
  assert.ok(requests.some((r) => r.url === 'https://pictures.example/ig.jpg?a=1&b=2'));
  assert.equal(item.publishedAt.toISOString().slice(0, 10), '2026-10-28');
  assert.deepEqual(notes, []);
});

test('an Instagram post is taken from Instagram\'s API when it is connected', async () => {
  const code = 'DfPc8C_MB2N';
  const { preview, requests } = setup({ token: 'token', apiMedia: [{
    id: '1', caption: 'Lowering pH is not enough.\n#water', media_type: 'IMAGE', media_url: 'https://pictures.example/api.jpg',
    permalink: `https://www.instagram.com/p/${code}/`, timestamp: '2026-11-02T13:49:23+0000',
  }] });
  const { item } = await preview.previewLink(`https://www.instagram.com/p/${code}/`);
  assert.equal(item.title, 'Lowering pH is not enough.');
  assert.equal(item.externalId, `https://www.instagram.com/p/${code}`);
  assert.equal(item.publishedAt.toISOString(), '2026-11-02T13:49:23.000Z');
  assert.equal(item.imageId, 7);
  assert.ok(!requests.some((r) => r.url.startsWith('https://www.instagram.com/')));
});

test('Instagram shortcodes give the post date, and nonsense gives none', () => {
  assert.equal(text.instagramPostDate('DfPc8C_MB2N').toISOString().slice(0, 16), '2026-11-02T13:49');
  assert.equal(text.instagramPostDate('abc'), null);
  assert.equal(text.instagramPostId('https://www.instagram.com/chemlifeinnovations_/reel/DfPc8C_MB2N/'), 'DfPc8C_MB2N');
  assert.equal(text.instagramReelCode('https://www.instagram.com/chemlifeinnovations_/reel/DfPc8C_MB2N/'), 'DfPc8C_MB2N');
});

test('summaries have no stray full stops from line breaks or emoji', () => {
  assert.equal(text.summarizeDescription('Is your feed costing you? 🐄🧬\nThe silent killer.'), 'Is your feed costing you? The silent killer.');
  assert.equal(text.summarizeDescription('It starts in the mill.\n\nThen it spreads.'), 'It starts in the mill. Then it spreads.');
});
