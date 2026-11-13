const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// The site search (src/lib/siteSearch.ts), run over the real products, research topics, roles and pages, with a
// few Insights posts. Each test types what a visitor might and checks where the first result leads.
const loaded = new Map();
function load(file) {
  const filename = path.resolve(__dirname, '..', file.endsWith('.ts') ? file : `${file}.ts`);
  if (loaded.has(filename)) return loaded.get(filename).exports;
  const module = { exports: {} };
  loaded.set(filename, module);
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  // The site's own files, by the @/ alias or a relative path; anything else is a package.
  const resolve = (name) => (name.startsWith('@/') ? load(`src/${name.slice(2)}`) : name.startsWith('.') ? load(path.resolve(path.dirname(filename), name)) : require(name));
  new Function('require', 'module', 'exports', js)(resolve, module, module.exports);
  return module.exports;
}

const { buildSearchIndex, searchSite, highlight } = load('src/lib/siteSearch.ts');
const en = load('src/i18n/messages/en.ts').default;
const hi = load('src/i18n/messages/hi.ts').default;
const { localizePath } = load('src/i18n/config.ts');

const post = (type, title, description, content, date, linkUrl) => ({ type, title, description, content, date, meta: '', linkUrl });
const insights = {
  blogs: [
    post('Blog', '6 Myths About Using Copper Sulfate in Animal Feed (Busted)', 'Copper sulfate is a common additive in animal feed, but misconceptions lead to abuse and toxicity.', 'Myth 1: It is a universal mold killer. Copper sulfate has some antibacterial properties.', 'July 30, 2025'),
    post('Blog', '9 Mistakes of Food Storage You Should Avoid', 'Food safety, shelf life, and quality all depend on proper storage.', 'Keep food fresh. No FIFO Rotation: Without First In, First Out (FIFO) rotation, older stock expires in the back while newer products are consumed.', 'September 1, 2025'),
    post('Blog', "5 Signs Your Mold Inhibitor Isn't Working", 'Not all mold inhibitors perform as intended. Learn the 5 warning signs.', 'Musty Smell Remains in the Feed.', 'August 22, 2025'),
    post('Blog', 'Feed Bites: The Critical Importance of Feed Hygiene', 'How mold contamination silently erodes livestock farm profits.', 'Clean feed ensures that animals absorb maximum nutrients. #FeedBites', 'January 10, 2026'),
    // The same post on LinkedIn and on Instagram
    post('Blog', 'Your water’s pH could be affecting more than you think.', 'Water pH and acidifiers.', 'On LinkedIn.', 'November 7, 2026', 'https://www.linkedin.com/feed/update/1'),
    post('Blog', 'Your water’s pH could be affecting more than you think.', 'Water pH and acidifiers.', 'On Instagram.', 'November 7, 2026', 'https://www.instagram.com/p/1'),
    // The same post again, its Instagram title ending in an emoji: same address on the Insights page
    post('Blog', 'Lowering pH doesn’t automatically mean you’ve solved your water quality problems.', 'Lowering pH.', 'On LinkedIn.', 'November 2, 2026', 'https://www.linkedin.com/feed/update/2'),
    post('Blog', 'Lowering pH doesn’t automatically mean you’ve solved your water quality problems. 👀', 'Lowering pH.', 'On Instagram.', 'November 2, 2026', 'https://www.instagram.com/p/2'),
  ],
  videos: [post('Video', 'What is important? Moisture in corn or water activity', 'Moisture content and water activity in corn-based animal feed.', '', 'August 20, 2025')],
  podcasts: [post('Podcast', 'India’s Antibiotic-Free Protein Problem Explained | Myths & Poultry Science', 'Dr. Santosh Ire demystifies antibiotic usage myths in poultry farming.', '', 'August 15, 2025')],
};

const index = buildSearchIndex({ messages: en, href: (p) => p, insights });
const results = (query) => searchSite(index, query).results;
const first = (query) => results(query)[0]?.title;
const titles = (query) => results(query).map((result) => result.title);

test('a product is found however its name is typed', () => {
  for (const query of ['maxdmold', 'MaxDmold', 'max d mold', 'maxdmould', 'maxmold', 'maxdmol']) assert.equal(first(query), 'MaxDmold', query);
  assert.equal(first('maxdmold spary'), 'MaxDmold Spray');
  assert.equal(first('afla m lock'), 'AflaMlock');
  assert.equal(first('aflalock'), 'AflaMlock');
  assert.equal(first('ddgsdtox'), 'DDGS-Dtox');
  assert.equal(first('ddgs dtox'), 'DDGS-Dtox');
  assert.equal(first('gut pro genie'), 'GutproGenie');
  assert.equal(first('methiowizz'), 'MethioWiz');
  assert.equal(first('grogenie 60'), 'GroGenie (12% & 60%)');
  assert.deepEqual(titles('feedgenie'), ['FeedGenie Forte', 'FeedGenie Prime']);
});

test('part of a brand name lists the family', () => {
  assert.ok(titles('genie').slice(0, 6).every((title) => title.includes('Genie')));
  assert.ok(titles('wiz').every((title) => title.includes('Wiz')));
});

test('everyday words find the product that does the job', () => {
  assert.ok(first('toxin binder').startsWith('FeedGenie'));
  assert.equal(first('mould inhibitor'), 'MaxDmold');
  assert.equal(first('antifungal'), 'MaxDmold');
  assert.equal(first('liquid mold inhibitor'), 'MaxDmold Spray');
  assert.equal(first('rumen protected methionine'), 'MethioWiz');
  assert.equal(first('bypass choline'), 'CholiWiz');
  assert.equal(first('acidosis'), 'RumiWiz');
  assert.equal(first('egg shell'), 'EggGenie');
  assert.equal(first('layers'), 'EggGenie');
  assert.equal(first('liver support for poultry'), 'LivproGenie');
  assert.equal(first('heat stable'), 'MBioWiz TS');
});

test('an animal lists the products for it', () => {
  const dairy = results('cow').slice(0, 6);
  assert.ok(dairy.length === 6 && dairy.every((result) => result.category === 'Product'));
  assert.ok(titles('chicken').includes('GutproGenie'));
  assert.ok(!titles('chicken').includes('RumiWiz'));
});

test('a short word is a word, not a few letters inside another', () => {
  assert.equal(first('ai'), 'AI Experts');
  assert.equal(results('ai').length, 1);
  assert.ok(!titles('ph').includes('GutproGenie'), '"ph" is not "phytogenic"');
});

test('research topics', () => {
  for (const query of ['anbiot', 'an biot', 'bio transformation', 'bio-transformation']) assert.equal(first(query), 'Accelerated Natural BioTransformation (ANBioT)', query);
  assert.ok(first('micro encapsulation').startsWith('Microencapsulation'));
  assert.equal(first('r&d'), 'Research & Development');
  assert.equal(first('reserch'), 'Research & Development');
});

test('About Us and Careers are found by their name, and nothing on them is searched', () => {
  for (const query of ['about', 'about us', 'company']) assert.equal(first(query), 'About Us', query);
  for (const query of ['careers', 'internship', 'internhsip', 'jobs', 'marketing internship', 'nutrition intern', 'how much stipend do interns get']) assert.equal(first(query), 'Careers', query);
  // Words only those pages use (the internship's stipend, lunch and accommodation; the founders' story) find neither.
  for (const query of ['stipend', 'lunch', 'accommodation', 'pre-placement offer', 'green technologies', 'eco-conscious']) {
    assert.ok(!results(query).some((result) => /^\/(about|careers)\b/.test(result.link)), query);
  }
  // No internship role is a result of its own.
  assert.ok(!['intern', 'research intern', 'hr'].some((query) => results(query).some((result) => result.link.includes('#role-'))));
});

test('what people ask for leads to the page that answers it', () => {
  const pages = {
    'phone number': 'Contact Us', address: 'Contact Us', price: 'Contact Us', distributor: 'Contact Us', 'where are you located': 'Contact Us',
    jobs: 'Careers', vacancy: 'Careers', 'how to apply': 'Careers', 'work with us': 'Careers',
    blog: 'Insights', news: 'Insights', catalogue: 'Products & Solutions', chatbot: 'AI Experts', 'dr kukku': 'AI Experts',
    home: 'Home', about: 'About Us', 'who we are': 'Who We Are', certification: 'Who We Are', privacy: 'Privacy Policy', terms: 'Terms of Use',
    leadership: 'Leadership', founder: 'Leadership', faq: 'Questions & Answers', awards: 'Awards & Recognition',
  };
  for (const [query, page] of Object.entries(pages)) assert.equal(first(query), page, query);
});

test('a post is found by its title, either spelling, or a word in its text', () => {
  assert.ok(first('copper sulphate').startsWith('6 Myths'));
  assert.ok(first('isnt working').startsWith('5 Signs'));
  assert.ok(first('feedbites').startsWith('Feed Bites'));
  assert.ok(first('what is water activity').startsWith('What is important?'));
  assert.ok(first('antibiotic free').startsWith('India’s Antibiotic-Free'));
  assert.ok(first('santosh ire').startsWith('India’s Antibiotic-Free'));

  // Found in the article's text: the line shown is where the word is.
  const [fifo] = results('fifo');
  assert.ok(fifo.title.startsWith('9 Mistakes'));
  assert.match(fifo.snippet, /^…No FIFO Rotation/);
});

test('the same post on two channels is one result, and every result has its own address', () => {
  assert.equal(titles("water's ph").filter((title) => title.startsWith('Your water')).length, 1);
  assert.equal(results('lowering ph').length, 1);
  for (const query of ['feed', 'm', 'poultry', 'copper', 'a', 'ph', 'water', 'lowering']) {
    const links = results(query).map((result) => result.link);
    assert.equal(new Set(links).size, links.length, query);
  }
});

test('nothing is found for something the site does not have; a near miss says so', () => {
  for (const query of ['', '   ', 'xyzzyq', 'cryptocurrency', '!!!']) assert.equal(results(query).length, 0, JSON.stringify(query));
  const near = searchSite(index, 'xyzzyq maxdmold');
  assert.equal(near.partial, true);
  assert.equal(near.results[0].title, 'MaxDmold');
  assert.equal(searchSite(index, 'maxdmold').partial, false);
});

test('the matched words are picked out', () => {
  const { terms } = searchSite(index, 'mould inhibitor');
  const marked = highlight('Dual-action mold shield, a mold inhibitor', terms).filter((part) => part.hit).map((part) => part.text);
  assert.deepEqual(marked, ['mold', 'mold', 'inhibitor']);
  assert.deepEqual(highlight('Nothing here', terms), [{ text: 'Nothing here', hit: false }]);
});

test('on a Hindi page, English and Hindi words both work and links stay in Hindi', () => {
  const hindi = buildSearchIndex({ messages: hi, english: en, href: (p) => localizePath(p, 'hi'), insights });
  const find = (query) => searchSite(hindi, query).results[0];
  assert.equal(find('mold inhibitor').title, 'MaxDmold');
  assert.equal(find('mold inhibitor').link, '/hi/products/maxdmold');
  assert.equal(find('toxin binder').category, 'Product');
  assert.equal(find('contact').link, '/hi/contact');
  assert.equal(find('contact').title, hi.nav.contact);
  assert.equal(find(hi.nav.contact).link, '/hi/contact');
  assert.ok(find('microencapsulation').link.startsWith('/hi/research#research-microencapsulation'));
  // Insights is English only.
  assert.ok(find('copper sulfate').link.startsWith('/insights#'));
});
