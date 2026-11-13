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
const { sanitizeArticleHtml, isUnedited } = load('src/lib/article-html.ts', { './insights-store/text': text });
const UPLOADS = 'https://chemlifeinnovations.wordpress.com/wp-content/uploads/2025/09';
const clean = (html, skip) => sanitizeArticleHtml(html, skip).html;

test('keeps headings, bold text, lists and tables without WordPress\'s classes and attributes', () => {
  assert.equal(
    clean('<h1 class="wp-block-heading">Title</h1><p class="wp-block-paragraph" style="color:red">One <strong>bold</strong> &amp; <b>more</b></p><ul><li onclick="x()">A</li></ul>'),
    '<h2>Title</h2><p>One <strong>bold</strong> &amp; <strong>more</strong></p><ul><li>A</li></ul>',
  );
  assert.equal(clean('<figure class="wp-block-table"><table><tbody><tr><td>Beef</td><td>45 mg</td></tr></tbody></table></figure>'),
    '<figure><table><tbody><tr><td>Beef</td><td>45 mg</td></tr></tbody></table></figure>');
});

test('scripts, frames and unsafe links never reach the page', () => {
  assert.equal(clean('<p>Hi<script>alert(1)</script><iframe src="https://x.test"></iframe></p><style>p{}</style>'), '<p>Hi</p>');
  assert.equal(clean('<p><a href="javascript:alert(1)">bad</a> <a href="https://www.who.int/a?b=1&amp;c=2" onclick="x()">WHO</a></p>'),
    '<p>bad <a href="https://www.who.int/a?b=1&amp;c=2" target="_blank" rel="noopener noreferrer">WHO</a></p>');
  assert.equal(clean('<div><span>kept text</span></div><p>1 < 2</p>'), 'kept text<p>1 &lt; 2</p>');
  assert.equal(clean('<p>open <strong>bold</p>'), '<p>open <strong>bold</strong></p>');
});

test('pictures: only the blog\'s uploads, resized by WordPress, each shown once', () => {
  const result = sanitizeArticleHtml(`<figure class="wp-block-image"><img data-orig-file="x" width="1024" height="535" src="${UPLOADS}/a.png?w=1024" alt="A &quot;pig&quot;" srcset="evil" /></figure><p>Text</p><figure><img src="${UPLOADS}/b.png"><figcaption>Fig</figcaption></figure>`);
  assert.equal(result.startsWithImage, true);
  assert.match(result.html, new RegExp(`^<figure><img src="${UPLOADS}/a.png\\?w=1200" srcset="${UPLOADS}/a.png\\?w=480 480w, `));
  assert.match(result.html, /alt="A &quot;pig&quot;" width="1024" height="535" fetchpriority="high" decoding="async"><\/figure>/);
  assert.match(result.html, /b\.png\?w=1200"[^>]* loading="lazy" decoding="async"><figcaption>Fig<\/figcaption><\/figure>$/);
  assert.doesNotMatch(result.html, /evil|data-orig/);

  // A picture from another site, or one the page already shows above the text, is left out with its frame and caption.
  assert.equal(clean('<p>T</p><figure><img src="https://cdn.example.com/x.jpg"><figcaption>Elsewhere</figcaption></figure>'), '<p>T</p>');
  const skipped = sanitizeArticleHtml(`<figure><img src="${UPLOADS}/a.png?w=1024"></figure><p>T</p>`, `${UPLOADS}/a.png`);
  assert.deepEqual(skipped, { html: '<p>T</p>', startsWithImage: false });
});

test('a short bold line of its own becomes a heading', () => {
  assert.equal(clean('<p><strong>Use Mold Inhibitors</strong></p><p><strong>Feed costs matter a lot.</strong></p><h2><strong>Why</strong></h2>'),
    '<h3>Use Mold Inhibitors</h3><p><strong>Feed costs matter a lot.</strong></p><h2>Why</h2>');
});

test('empty paragraphs are dropped', () => {
  assert.equal(clean('<p>A</p><p>&nbsp;</p><p><br></p><p>B</p>'), '<p>A</p><p>B</p>');
});

test('WordPress formatting is used unless the saved text was rewritten', () => {
  const wordpress = 'Feed hygiene matters.\n\nKeep bins dry.';
  assert.equal(isUnedited('Feed hygiene matters.\nKeep bins dry.', wordpress), true);
  assert.equal(isUnedited(undefined, wordpress), true);
  assert.equal(isUnedited('The built-in summary.', wordpress, 'The built-in summary.'), true);
  assert.equal(isUnedited('Rewritten by the moderator.', wordpress, 'The built-in summary.'), false);
});
