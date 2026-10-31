"""Build the independent research design from the original content without editing it."""
from pathlib import Path
import re,html,json
root=Path.cwd()
out=root/'src/previews/research-taste'
base='/previews/research-taste'
meta=[
 ('anbiot','ANBioT','anbiot.png','Plant bioactives transformed for feed','Illustration of plant bioactives and molecular transformation'),
 ('green-chelation','Green chelation','green_technology.png','A new life for silk-industry protein','Illustration of chelated minerals for animal nutrition'),
 ('microencapsulation','Microencapsulation','microencapsulation.png','Choose where a nutrient is released','Conceptual illustration of a multi-layer encapsulated nutrient'),
 ('nano-trace-minerals','Nano trace minerals','nano_trace_mineral.jpg','Smaller particles, functional surfaces','Illustration of nano-activated functional trace minerals'),
 ('nature-identical-molecules','Nature-identical molecules','nature_identical_bio.png','The same molecule, made consistently','Illustration of nature-identical bioactive molecules'),
]
shorts={item[0]:item[1] for item in meta}
def esc(s):return html.escape(s,quote=True)
def text(s):return html.unescape(re.sub('<[^>]+>','',s)).strip()
def find(pattern,s):
 m=re.search(pattern,s,re.S)
 if not m:raise ValueError(pattern)
 return m.group(1)
def nav(active=''):
 return '<nav class="research-nav" aria-label="Research platforms">'+''.join(f'<a href="{base}/{slug}"'+(' aria-current="page"' if slug==active else '')+f'>{esc(title)}</a>' for slug,title,*_ in meta)+'</nav>'
def shell(title,body,slug=''):
 compare='/previews/research'+('/'+slug if slug else '')
 return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{esc(title)} | Chemlife research preview</title><link rel="stylesheet" href="/en{base}/style.css"><script src="/en{base}/interactions.js" defer></script></head><body>
<a class="skip" href="#main">Skip to content</a><header class="site-header frame"><a class="brand" href="/" aria-label="Chemlife home"><img src="/images/branding/logo-horizontal.png" alt="Chemlife Innovations" width="190" height="64"></a><nav class="main-nav" id="site-navigation" aria-label="Main navigation"><a href="{base}">Research platforms</a><a href="/products">Products</a><a href="/about">About us</a><a href="/contact?type=research">Contact</a></nav><a class="preview-switch" href="{compare}">Compare original <span aria-hidden="true">↗</span></a><button type="button" class="menu-button" aria-expanded="false" aria-controls="site-navigation">Menu</button></header>
<main class="rp frame" id="main">{body}</main><footer class="site-footer frame"><div class="footer-top"><p>Plant wisdom. Modern biotechnology.</p><nav aria-label="Footer"><a href="{base}">All platforms</a><a href="{compare}">Original preview ↗</a><a href="/contact?type=research">Contact</a></nav></div><p class="wordmark">Chemlife</p><div class="footer-end"><p>© 2026 Chemlife Innovations Pvt. Ltd.</p><p>Bengaluru, India</p></div></footer></body></html>'''
def photographs():
 return '''<div class="photo-strip"><figure class="reveal"><img src="/images/research/research_image.jpeg" alt="Research benches in Chemlife's laboratory" width="1600" height="721" loading="lazy"></figure><figure class="reveal"><img src="/images/process/development_image.jpeg" alt="Chemlife's team presenting ANBioT at an industry exhibition" width="1600" height="721" loading="lazy"></figure><figure class="reveal"><img src="/images/process/manufacturing_image.jpeg" alt="Chemlife manufacturing equipment" width="1600" height="1059" loading="lazy"></figure></div>'''
card_data=[]
for index,(slug,title,image,caption,alt) in enumerate(meta):
 original=(root/f'src/previews/research/{slug}.html').read_text()
 defs=original[:original.index('<section')]
 fulltitle=text(find(r'<h1[^>]*>(.*?)</h1>',original))
 lede=find(r'<p class="r-lede">(.*?)</p>',original).replace('the holistic approach of Ayurveda','Ayurvedic plant knowledge')
 figure='<figure class="plate"'+find(r'<figure class="plate"(.*?)</figure>',original)+'</figure>'
 # The scientific figure, annotations, replay and release-profile controls are retained.
 figure=re.sub(r'<b>Fig\. \d+</b>\s*','',figure)
 steps=find(r'<ol class="how-list">(.*?)</ol>',original)
 step_items=re.findall(r'<li>.*?<h3>(.*?)</h3><p>(.*?)</p></li>',steps,re.S)
 if len(step_items)!=3:raise ValueError(f'{slug}: expected three process stages')
 process_intro=find(r'<div class="section-head">.*?<p>(.*?)</p>',original)
 # Tinted native disclosure panels show the complete original process text, all open initially.
 panels=''.join(f'<details class="process-panel reveal" open><summary><h3>{heading}<span class="toggle" aria-hidden="true">+</span></h3></summary><p>{paragraph}</p></details>' for heading,paragraph in step_items)
 ticks=find(r'<ul class="ticks">(.*?)</ul>',original)
 benefits=''.join(f'<li class="reveal"><strong>{heading}</strong><p>{paragraph}</p></li>' for heading,paragraph in re.findall(r'<strong>(.*?)</strong><p>(.*?)</p>',ticks,re.S))
 record=find(r'<div class="record">(.*?)</section>',original)
 facts='<dl>'+find(r'<dl>(.*?)</dl>',record)+'</dl>'
 source_match=re.search(r'<p class="record-src".*?</p>',record,re.S)
 source=source_match.group(0) if source_match else ''
 body=f'''{defs}{nav(slug)}<section class="board" aria-labelledby="page-title"><div class="title-tile"><h1 id="page-title">{esc(title)}</h1><p class="full-name">{esc(fulltitle)}</p><a class="button title-action" href="/contact?type=research&amp;platform={slug}">Request technical dossier <span aria-hidden="true">↗</span></a></div><figure class="hero-art"><img src="/images/research/{image}" alt="{alt}" width="1100" height="1000" fetchpriority="high"><figcaption>Platform illustration</figcaption></figure><div class="summary-tile"><p>{lede}</p><div><div class="summary-links"><a class="text-link" href="#how">How it works <span aria-hidden="true">↓</span></a><a class="text-link" href="#applications">Product connections <span aria-hidden="true">↓</span></a></div></div></div><div class="science-tile"><h2>See the mechanism</h2>{figure}</div></section>
<section class="section" id="how" aria-labelledby="how-title"><div class="section-heading"><h2 class="reveal" id="how-title">How it works</h2><p class="reveal">{process_intro}</p></div><div class="process-panels">{panels}</div></section>
<section class="section" aria-label="Benefits and platform facts"><div class="facts-board"><div class="facts-tile"><h2 class="reveal">At a glance</h2>{facts}{source}</div><div class="benefit-tile"><h2 class="reveal">Why it matters</h2><ul class="benefit-list">{benefits}</ul></div></div></section>'''
 product_list=re.search(r'<ul class="tiles">(.*?)</ul>',original,re.S)
 products=[]
 if product_list:
  for item in re.findall(r'<li class="tile">(.*?)</li>',product_list.group(1),re.S):
   url=find(r'href="(.*?)"',item)
   name=find(r'<span class="tile-name">(.*?)</span>',item)
   desc=find(r'<span class="tile-desc">(.*?)</span>',item)
   filenames={'MinBioZen':'minbiozen','MethioWiz':'methiowiz','CholiWiz':'choliwiz'}
   imagefile=filenames[text(name)]
   products.append(f'<article class="product-row reveal"><figure><img src="/images/products/banner-{imagefile}.jpg" alt="{text(name)} product illustration" width="600" height="400" loading="lazy"></figure><div><h3>{name}</h3><p>{desc}</p><a class="text-link" href="{url}">View product <span aria-hidden="true">↗</span></a></div></article>')
 else:
  note=find(r'<div class="range-note">.*?<p>(.*?)</p>',original)
  products.append(f'<div class="product-range-link reveal"><p>{note}</p><a class="text-link" href="/products">Explore our additives <span aria-hidden="true">↗</span></a></div>')
 body+=f'<section class="section" id="applications" aria-labelledby="applications-title"><div class="range-layout"><div class="range-intro"><h2 class="reveal" id="applications-title">From platform<br>to formulation</h2><p class="reveal">Explore the product connections described for this platform, or discuss your formulation with our team.</p><a class="text-link" href="/products">Browse all additives <span aria-hidden="true">↗</span></a></div><div class="products">'+''.join(products)+'</div></div></section>'
 support=re.search(r'<section class="support-card".*?</section>',original,re.S)
 if support:
  section=support.group(0)
  intro=find(r'<div class="support-intro">(.*?)</div>',section)
  intro=re.sub(r'<span class="eyebrow">.*?</span>','',intro,flags=re.S)
  intro=intro.replace('Government of India support','Support for the science')
  lis=find(r'<ul class="support-list">(.*?)</ul>',section)
  lis=re.sub(r'<span class="support-mark icon".*?</span>','',lis,flags=re.S)
  lis=lis.replace('<li><div>','<li class="no-logo"><div>')
  body+='<section class="section" aria-label="Research support"><div class="support-board"><div class="support-intro reveal">'+intro+'</div><ul class="support-list">'+lis+'</ul></div></section>'
 contact=original[original.index('<section class="contact dark"'):]
 contact_p=find(r'<p style="margin-top:1rem">(.*?)</p>',contact)
 body+=f'''<section class="section" aria-labelledby="contact-title">{photographs()}<div class="contact-board"><div class="contact-title"><h2 class="reveal" id="contact-title">Take the science<br>further</h2><p class="reveal">{contact_p}</p></div><div class="contact-links"><a class="button" href="/contact?type=research&amp;platform={slug}">Request technical dossier <span aria-hidden="true">↗</span></a><a class="text-link" href="/contact?type=nutritionist">Talk to a nutritionist <span aria-hidden="true">↗</span></a><a href="tel:+919535862570">+91 95358 62570</a><a href="mailto:innovate@chemlifeinnovations.com">innovate@chemlifeinnovations.com</a></div></div></section>'''
 prev=meta[index-1] if index else None
 nex=meta[index+1] if index<len(meta)-1 else None
 pager=''
 for direction,item in [('Previous platform',prev),('Next platform',nex)]:
  href=f'{base}/{item[0]}' if item else base
  label=item[1] if item else 'All research platforms'
  pager+=f'<a href="{href}"><div><span>{direction if item else "Research"}</span><strong>{esc(label)}</strong></div><b aria-hidden="true">{"←" if direction.startswith("Previous") else "→"}</b></a>'
 body+='<nav class="platform-pager" aria-label="Adjacent platforms">'+pager+'</nav>'
 # Every cross-platform link in the independent set stays inside the new copy.
 body=body.replace('/previews/research/','/previews/research-taste/')
 body=body.replace('href="/previews/research"',f'href="{base}"')
 (out/f'{slug}.html').write_text(shell(title,body,slug))
 card_data.append((slug,title,image,alt,lede,caption))
intro='''<section class="hub-heading" aria-labelledby="hub-title"><div class="hub-title"><h1 id="hub-title">Inside our<br>research</h1><p>Five platforms connect plant bioactives, mineral chemistry and nutrient delivery with animal nutrition.</p><a class="button" href="#platforms">Explore the platforms <span aria-hidden="true">↓</span></a></div><figure><img src="/images/research/research_image.jpeg" alt="Inside Chemlife's research workspace" width="1600" height="721" fetchpriority="high"></figure></section><div class="search-row" role="search"><label for="platform-search">Find a platform</label><input id="platform-search" type="search" placeholder="Try minerals, rumen or plants" autocomplete="off"><button id="clear-search" type="button">Clear</button></div><section class="section" id="platforms" aria-labelledby="platforms-title"><div class="section-heading"><h2 id="platforms-title">Explore the science</h2><p id="search-result" role="status" aria-live="polite">5 research platforms</p></div><div class="topic-list">'''
for slug,title,image,alt,lede,caption in card_data:
 intro+=f'<article class="topic-item"><figure class="reveal"><a href="{base}/{slug}" aria-label="Explore {esc(title)}"><img src="/images/research/{image}" alt="{alt}" width="1100" height="1000" loading="lazy"></a></figure><div class="topic-copy"><h2 class="reveal"><a href="{base}/{slug}">{esc(title)}</a></h2><div><p class="reveal">{lede}</p></div></div></article>'
intro+='</div><div id="no-platforms" class="empty" hidden><p>No platforms match. Try “minerals”, “rumen” or clear your search.</p></div></section>'
intro+=f'<section class="section" aria-labelledby="hub-contact">{photographs()}<div class="contact-board"><div class="contact-title"><h2 id="hub-contact">Bring us your<br>research question</h2><p style="margin-top:24px">Explore the technical detail behind a platform and discuss how it could fit your formulation.</p></div><div class="contact-links"><a class="button" href="/contact?type=research">Talk to the research team <span aria-hidden="true">↗</span></a><a class="text-link" href="/previews/research">Compare the original previews <span aria-hidden="true">↗</span></a></div></div></section>'
(out/'index.html').write_text(shell('Research platforms',intro))
print('Created independent hub and five research pages in',out)
