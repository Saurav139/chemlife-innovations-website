# Chemlife research preview copy

New set: http://localhost:3001/previews/research-taste
Original: http://localhost:3001/previews/research

## Scope and design brief

An independent, local-only copy of all five dedicated research platform pages and a companion index. Original HTML, React components, CSS, platform metadata and routing are retained byte for byte. The only shared source change for this work is a new entry in the preview registry; existing unrelated changes were retained.

Inventory: ANBioT; Ayurvedic botanicals; nutrient-medium bio-transformation; silkworm pupae protein; MinBioZen; multi-layer nutrient pearls; MethioWiz and CholiWiz; rumen-sustained and bypass profiles; nano surface tags; nature-identical actives; Chemlife's laboratory/manufacturing/exhibition photographs; existing TDB source attribution; the brand's navy, orange and Maven Pro.

Audience: formulators, nutritionists, researchers and commercial partners. Argument: identify the platform → explain its mechanism → describe the process → state facts and intended benefits → connect to products or a technical conversation. Retain the existing scientific copy and avoid new efficacy claims, invented trials or statistics.

Direction: **The well-kept board** (`dense-tiles`), seed **860320762**, with palette and typography kept from the current brand. No redraws. The board direction takes precedence over a conflicting all-photo hero blueprint: real scientific figures, titles, summaries, photographs and facts each occupy a filled cell. Unsupported logo grids and fake enquiry forms are replaced by actual support content and the existing contact route. The process is a row of native tinted disclosure panels, open initially so the original explanation is readable.

Idea: Chemlife's five platform mechanisms become a scientific study board, connecting each material transformation to the original product or formulation discussion.

Live elements: original scientific replay, microencapsulation release-mode switch, thumb-sized mobile stage controls, native process disclosures and an index search. The index links and previous/next navigation stay within the new set. Every page includes comparison links to its original.

## Review

ROUND 1
Seen in one second: a platform name, its illustration and a scientific diagram on a filled board.
Idea (one sentence): Each Chemlife material transformation becomes an explorable study board.
Live thing: mechanism replay and microencapsulation release comparison.
Layout words by section: hero=scientific board / process=tinted disclosures / facts=paired fields / products=application rows / support=proof tiles where supplied / contact=photo strip and action cells.
Scores: design 7.1 · usability 7.0 · creativity 7.0 · content 8.0 → overall 7.14
Caps applied: initial caption-as-eyebrow failure capped the initial result at 6.0 until fixed.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. after-green/desktop-fold.jpg: the automatic four-second drawing entrance leaves parts of the mechanism and labels missing at first glance. Show the completed mechanism immediately with ambient movement; keep the full drawing sequence on Replay.
2. after-green/mobile-fold.jpg: the dossier action is below the illustration and long lead. Move it into the title cell, where it is visible immediately.
3. after-hub/tablet-page-01.jpg: redundant repeated Explore platform links crowd the index and resemble labels for the following topic. Keep the image and title as the meaningful links; reveal each topic's image, title and text separately.

ROUND 2 — final
Seen in one second: the platform name and a clear technical-dossier action, with subject-specific illustration and the complete mechanism.
Idea (one sentence): The original scientific transformation and product connection determine the board's contents.
Live thing: replay and release-mode comparison, with searchable cross-platform discovery.
Layout words by section: hero=scientific board / process=tinted disclosures / facts=paired fields / products=application rows / support=proof tiles where supplied / contact=photo strip and action cells.
Scores: design 7.6 · usability 8.0 · creativity 7.0 · content 8.0 → overall 7.62
Caps applied: creativity held to 7 because the modular board is an established composition, even though its material comes from Chemlife.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. after-green/mobile-page-01.jpg: scientific detail creates a long mobile page. Process disclosures can collapse; further shortening requires scientific/content approval rather than removing technical detail silently.
2. after-micro/desktop-page-01.jpg: existing product illustrations are not pack photographs. Preserve their illustrative role; actual product images can replace them if available.
3. after-hub/desktop-page-01.jpg: some topic summaries are much longer than others. The board keeps a consistent reading structure; a later copy review can make the summaries more even without inventing scientific claims.

## Verification

- All five dedicated pages and the companion index: **0 FAIL** in the final Taste Skill inspector at **1440, 768 and 390 pixels**. Reports/screenshots are in the six `after-*` folders beside this note. All final fold and page screenshot sheets were opened and reviewed.
- Existing Green Chelation baseline: 14 reported failures; redesigned copy: 0. This is a visual diagnostic, not a conversion score or measured sales uplift. Baseline includes the original shared header/footer/cookie UI.
- Source lint: 0 FAIL, 0 WARN. JavaScript syntax check passed. Project TypeScript check (`tsc --noEmit --incremental false`) passed.
- A SHA-256 preservation check confirms **all 14 original research files are byte-for-byte unchanged**. Their hashes are recorded in `original-hashes.json`.
- Comparison checks confirm the original desktop/mobile scientific SVG drawings and all three process paragraphs survive in each new page. Figures' geometry/labels were not rewritten; presentation and animation-entry timing were adjusted in the copy.
- Browser tests confirmed that Rumen-sustained changes both the selected control and explanatory text, Replay is available, and index search filters to Microencapsulation for “rumen”, restores five items with Clear, and provides a zero-result state.
- Mobile stage navigation is preserved and visually reviewed at 390 pixels. A physical-phone interaction test was not performed. No contact form was submitted and no call/email was initiated.
- The final browser checks render the standalone HTML/CSS/JS served by the new Next.js preview route; there is no frontend bundling step for these files. No new dependencies were installed and no deployment was performed.

Remaining defended warnings: no video (the supplied scientific figures and process stills explain these mechanisms; no relevant process footage was supplied), and an intentional mobile stage scroller (one contained stage at a time with explicit 44px previous/next controls and progress dots, rather than page overflow).

## Images, content and maintenance

Existing assets only: the five research illustrations (`anbiot.png`, `green_technology.png`, `microencapsulation.png`, `nano_trace_mineral.jpg`, `nature_identical_bio.png`); the lab, manufacturing and ANBioT exhibition photographs; the existing MinBioZen, MethioWiz and CholiWiz banners where linked; the supplied BIRAC logo on ANBioT; and Chemlife's logo. No bundled sample photos, downloaded imagery, new generated imagery or external credits are used. Conceptual platform art is labelled as an illustration, not a micrograph or trial result. The original SVG drawings are explanatory diagrams, not substitutes for measured scientific evidence.

Existing scientific content, claims and source attributions are retained, not independently revalidated. One generic phrase in the ANBioT introduction was edited from “the holistic approach of Ayurveda” to “Ayurvedic plant knowledge”; headings were shortened while the full original platform name remains below. Added section transitions and index introduction are draft editorial copy. No fabricated results, testimonials or institutional endorsements were added.

Editable copy: `src/previews/research-taste/`. Rendering route: `src/app/[locale]/previews/research-taste/[[...path]]/route.ts`. The stylesheet and script use explicit `/en/` asset routes because the existing locale proxy deliberately skips file extensions. `.taste-skill/research-copy/build-previews.py` can rebuild the new HTML from original content; it writes only the independent copy.
