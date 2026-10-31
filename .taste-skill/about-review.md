# Chemlife About preview review

Direction: The printed annual (`editorial-report`), seed 1061891709. No redraws. House rules and the direction override conflicting hero/section blueprint details: a photographic masthead and shared editorial axis take precedence over overlaid title cards; actual leadership portraits replace an irrelevant recognition table.

Idea: Chemlife's G.I.F.T. becomes the index of an editorial company portrait, opening the commitments behind its laboratory, products and people.

Live thing: all four G.I.F.T. buttons switch the statement and relevant destination. Tested each in the in-app browser; selected state and panel content changed correctly. Without JavaScript all value statements are readable. Reduced-motion rules retain content and remove travel/crossfades.

ROUND 1
Seen in one second: real Chemlife leadership and the blue editorial title field.
Idea (one sentence): Chemlife's actual people and G.I.F.T. commitments anchor an editorial account of its science and manufacturing.
Live thing: four G.I.F.T. values open in place.
Layout words by section: hero=masthead/axis / purpose=mosaic / process=photographic sequence / values=interactive band / leadership=portrait grid / contact=editorial close.
Scores: design 7.3 · usability 7.5 · creativity 7.0 · content 7.3 → overall 7.31
Caps applied: initial inspector eyebrow failure caps overall at 6.0 until fixed.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. mobile-fold.jpg: photo overlay links compete with the portrait and main title; removed them.
2. mobile-fold.jpg: main action reads as another text link; changed to a filled button and retained the plain animal-nutrition descriptor.
3. tablet-page-01.jpg: many one-pixel typography differences weaken the rhythm; consolidated to shared body, lead, subheading and small steps.

ROUND 2 — final
Seen in one second: a real leadership photograph followed by About Chemlife.
Idea (one sentence): Chemlife's G.I.F.T. becomes the interactive index of a company portrait using its own people, laboratory and manufacturing material.
Live thing: G.I.F.T. selection reveals the commitments and an appropriate next step.
Layout words by section: hero=masthead/axis / purpose=mosaic / process=photographic sequence / values=interactive band / leadership=portrait grid / contact=editorial close.
Scores: design 7.7 · usability 8.0 · creativity 7.0 · content 7.5 → overall 7.64
Caps applied: creativity no higher than 7 because the editorial composition is established, despite the company-specific assets and G.I.F.T. content.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. mobile-page-01.jpg: long existing leadership biographies read densely in two columns; retained real information. Shorter approved bios or a one-profile layout could be explored next.
2. desktop-page-02.jpg: Shankar's supplied portrait has a different crop and lower resolution; replace with a matching original when available rather than fabricate one.
3. tablet-page-01.jpg: original mission/vision copy remains abstract; business approval would be useful for a shorter statement of purpose. Kept the existing content for this preview.

## Verification

- Source lint: 0 FAIL, 0 WARN.
- Final rendered inspector: 0 FAIL at 1440, 768 and 390 pixels. Headings at most two lines; body 18px at desktop; no reported overflow, contrast or motion failures.
- Before: 11 reported failures; after: 0. Before findings include existing shared-page components/cookie overlay, so this comparison is a design diagnostic, not a conversion or performance score.
- All seven final fold/page screenshot files opened and reviewed after the final HTML change.
- Browser loaded the actual preview via the existing Next.js server and route. No new server was started. No app-wide build was needed for a buildless HTML preview served as written by the existing preview handler.
- One remaining inspector warning: no video. Relevant supplied assets are process stills; supplied trip/community films do not illustrate the research/manufacturing narrative. Existing stills crossfade gently and the masthead drifts; no unrelated footage was added.
- All links use existing same-site destinations or page anchors. No form backend or submission is introduced.

## Images and content

Only existing Chemlife assets are used: logo-horizontal.png; founders-leadership-group.jpg; research_image.jpeg; development_image.jpeg (industry exhibition); manufacturing_image.jpeg; leader_radhakrishna_new.jpg; leader_sharada_new.jpg; leader_sneha_new.jpg; leader_shankar.png. There are no downloaded or bundled sample photographs, generated people, third-party credits or photography stand-ins.

Company facts, vision, mission, values, names, qualifications and biographies come from the existing About page, English messages and asset manifest. Added editorial transitions, process summaries and contact copy are draft wording for company review before any launch; the innovation value's generic final phrase was revised to describe research and development. No invented milestones, customers, certifications, testimonials or new business statistics.

Local URL: http://localhost:3001/previews/about-taste

Source: src/previews/about-taste.html. The only addition to the shared preview registry is the `about-taste` entry. Existing unrelated work was retained. Current About page and production deployment were not changed.
