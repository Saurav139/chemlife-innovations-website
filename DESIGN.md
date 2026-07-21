# Design

## Theme

Light with drenched orange hero. The homepage opens with a full-bleed saturated orange surface (the hero), then transitions into lighter warm-neutral sections with navy and green accents. This creates a bold, memorable entry that communicates energy and confidence, followed by trustworthy substance below the fold.

Scene sentence for the hero: "A feed manufacturer's R&D lead opens the site on a laptop in a bright office — the first impression needs to feel like a confident handshake, warm and memorable."

## Colors

### Primary palette

| Role | OKLCH | Hex | Usage |
|---|---|---|---|
| Brand Orange (Drench) | `oklch(0.62 0.18 35)` | `#E65C38` | Hero background, primary CTAs, accent icons, hover states |
| Forest Green | `oklch(0.45 0.12 145)` | `#1F6306` | Secondary sections, product card headers, nature associations |
| Deep Navy | `oklch(0.35 0.08 260)` | `#305280` | Navigation bars, footer, section backgrounds, trust signals |

### Neutral palette

| Role | OKLCH | Hex | Usage |
|---|---|---|---|
| Warm White | `oklch(0.96 0.008 80)` | `#F5F2ED` | Page background, card surfaces |
| Light Warm | `oklch(0.92 0.008 80)` | `#E8E3DB` | Alternate section background |
| Muted Gray | `oklch(0.55 0.01 100)` | `#757873` | Body text |
| Near Black | `oklch(0.18 0.008 260)` | `#1A1F2E` | Heading text, high-emphasis |

### Accent palette

| Role | OKLCH | Hex | Usage |
|---|---|---|---|
| Warm Gold | `oklch(0.78 0.14 85)` | `#FFCD1E` | Award badges, highlights, decorative elements |
| Light Orange | `oklch(0.82 0.08 40)` | `#FFD4B5` | Card backgrounds on drenched sections, subtle accents |

### Tinting

All neutrals are tinted slightly warm toward the orange brand hue (chroma 0.005–0.008). Pure `#000` and `#fff` are never used.

## Typography

### Font stack

- **Headings**: "Galaxy", "Rabelo", serif — bold, distinctive display face with personality. The existing brand font carries heritage and warmth.
- **Body**: "Maven Pro", Calibri, sans-serif — rounded, friendly humanist sans. Clean at body sizes, approachable but professional.
- **Fallback**: Headings fall back to a serif (Georgia, Times New Roman). Body falls back to system-ui.

### Scale

Modular scale with `clamp()` for fluid sizing. Ratio 1.25.

| Step | Size (clamp) | Weight | Usage |
|---|---|---|---|
| Display | `clamp(2.5rem, 5vw, 4rem)` | 700 | Hero headline, section titles |
| H2 | `clamp(1.75rem, 3vw, 2.5rem)` | 700 | Section headings |
| H3 | `clamp(1.25rem, 1.75vw, 1.5rem)` | 600 | Card titles, subsection heads |
| Body | `clamp(1rem, 1.15vw, 1.125rem)` | 400 | Paragraphs, descriptions |
| Small | `0.875rem` | 500 | Labels, metadata, captions |

Body line length capped at 65–75ch. Headings may exceed.

## Elevation & Shadows

| Level | Usage | Shadow |
|---|---|---|
| 0 | Cards, sections | `none` |
| 1 | Hovered cards, dropdowns | `0 4px 12px oklch(0 0 0 / 0.08)` |
| 2 | Sticky nav, modals | `0 8px 24px oklch(0 0 0 / 0.1)` |

Borders: 1px solid `oklch(0 0 0 / 0.06)` for subtle dividers. No side-stripe borders.

## Components

### Buttons

- **Primary**: Orange fill (`#E65C38`), white text, `8px` radius. Hover: darken 10%.
- **Secondary**: Navy outline (`#305280`), navy text. Hover: navy fill, white text.
- **Ghost**: No background, orange text. Hover: light orange tint.
- All buttons: `14px`/`16px` font, `12px 24px` padding, `font-weight: 600`.

### Cards

Three product cards (Monogastric, Ruminants, Value Add). Vertical layout with icon/image top, title, short description, link.
- Border-radius: `12px`
- Background: Warm White
- Hover: subtle lift (shadow level 1), border color shifts to accent
- No side-stripe borders, no gradient text, no glassmorphism

### Navigation

Sticky header. Transparent on hero → solid white with shadow on scroll.
- Logo left, nav links center, CTA button right
- Dropdown mega-menu for Concepts Hub
- Top mini-bar: email + phone + social icons (compact, full-width)
- Mobile: hamburger with slide-out drawer

## Layout

- Max content width: `1200px` centered
- Sections use generous vertical rhythm: `80px–120px` padding top/bottom
- Hero: full-viewport-height, `100vh`, content centered, CTA buttons below tagline
- The three product cards use `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`
- No nested cards, no identical card grids without purpose
- Asymmetric layouts on "Who We Are" (split text/image) and "How We Do" (process flow)
- Client logos: infinite auto-scroll marquee

## Motion

- Staggered reveal on scroll (sections fade + translate up, `300ms` delay, ease-out-expo)
- No bounce, no elastic, no orchestrated page-load sequences
- Stat counters: count-up animation on scroll into view
- Cards: hover lift transition `200ms`
- Buttons: hover fill transition `200ms`
- Navigation: smooth background swap on scroll `300ms`
- Respect `prefers-reduced-motion`

## Do's

- Use the orange drench on the hero — it's the brand's signature move
- Pair organic shapes / natural textures with clean typography
- Show awards, patents, and client logos prominently
- Keep product categories (Monogastric, Ruminants, Value Add) immediately scannable
- Use warm gold for decorative highlights (award badges, section dividers)
- Include real imagery: poultry, cattle, lab, team, facility

## Don'ts

- Don't use side-stripe border accents on cards
- Don't use gradient text
- Don't use glassmorphism as default
- Don't use the hero-metric template (big number + small label + stats)
- Don't use identical card grids without purpose
- Don't use Inter, Fraunces, Playfair Display, or other reflex-reject fonts
- Don't make it look cold/clinical/pharma — warmth is the differentiator
- Don't default to centering everything; use asymmetric layouts intentionally
