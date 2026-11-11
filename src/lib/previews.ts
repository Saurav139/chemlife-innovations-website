import { isLiveHost } from "@/lib/seo";

// Design mock-ups shown to approvers on staging, from the header's "Design previews" button. Most are standalone
// HTML pages in src/previews, served as-is by src/app/previews/[slug]/route.ts; an entry with `href` is a page of
// the site instead. Never shown on the live site.
export const PREVIEWS = [
  {
    slug: "certificates",
    href: "/previews/certificates",
    title: "Homepage: Certificates section, three designs",
    description: "A new section for the homepage showing the FAMI-QS and Halal certificates, in three designs to switch between: Detailed (everything on each certificate), Compact (a short strip) and Awards style (one at a time on the orange plaque). Each opens the certificate itself.",
  },
  {
    slug: "research-v2",
    href: "/previews/research-v2",
    title: "Research pages: improved version",
    description: "The Research page and all five platform pages, redone: each platform's picture and key facts up top, a bar that follows you down the page and steps between platforms, the steps set under the animated figure they explain, and product photos. Same content as the earlier research previews, which are still listed below.",
  },
  {
    slug: "homepage-style",
    href: "/previews/homepage-style",
    title: "Homepage: one consistent style",
    description: "What We Serve as plain photo cards instead of spinning snowflakes, the awards as a logo wall (A) or a plain one-at-a-time card (B), and the headings in one style. Each block switches between the proposal and the current homepage.",
  },
  {
    slug: "who-we-are-corporate",
    href: "/previews/who-we-are-corporate",
    title: "Who We Are page: four corporate versions",
    description: "Four corporate designs of the full Who We Are page (/who-we-are), each with all its content and no photos: Annual report (organisation chart), Executive (gradient hero, icon cards), Dossier (sticky page index) and Split (navy panel beside the content).",
  },
  {
    slug: "who-we-are-page",
    href: "/previews/who-we-are-page",
    title: "Who We Are page: five versions",
    description: "Five more designs of the full Who We Are page (/who-we-are), each with all its content: Story (pinned photo, one reading column), Bento (a mosaic of tiles), Tabs (about a screen long), Chapters (numbered 01 to 04) and Navy (all dark).",
  },
  {
    slug: "who-we-are-elegant",
    href: "/previews/who-we-are-elegant",
    title: "Who We Are: five elegant versions",
    description: "Five more restrained layouts of Who We Are with the full copy and What we serve: Quiet (centred), Editorial (long-read), Portrait (photo and text), Index (numbered facts, tabbed questions) and Soft panel. The current section is included for comparison.",
  },
  {
    slug: "homepage-claude",
    href: "/previews/homepage-claude",
    title: "Homepage: six more designs",
    description: "Six more full homepages with the site's own fonts and the full Who We Are section: Journey (scroll-told), Needs (by what animals need), Storyboard (a front page of stories), Milestones (2016 to today), Nature & science (two halves), and Refined original (staging's homepage, tidied).",
  },
  {
    slug: "homepage-taste",
    href: "/previews/homepage-taste",
    title: "Homepage: Taste Skill version",
    description: "The homepage built with the design-taste-frontend skill: ChemLife's own photographs hung at uneven sizes, the full Who We Are section, and a dose reckoner that works out how much of a product a feed needs.",
  },
  {
    slug: "homepage-five",
    href: "/previews/homepage-five",
    title: "Homepage: five redesigns",
    description: "The whole homepage in five styles, with the site's own fonts and content: Clarity (clean corporate), Immersive (photo-led), Bento (tiles), Product finder (products first) and Science (technology first).",
  },
  {
    slug: "who-we-are-scroll",
    href: "/previews/who-we-are-scroll",
    title: "Who We Are: scrollytelling",
    description: "Five scroll-driven versions of Who We Are: pinned chapters, a sideways journey, a feed pellet's path from nature to the farm, a photo zoom with a fact deck, and read-along text. Pinned chapters and the sideways journey each come in five fuller versions too, up to an all-out one and a motion-graphics-only one with no photos.",
  },
  {
    slug: "who-we-are",
    href: "/previews/who-we-are",
    title: "Who We Are: seven variations",
    description: "The new Who We Are copy in seven homepage layouts: the current section, a navy fact sheet, questions first, photo-led, tabbed, a milestones timeline and an animated motion story.",
  },
  {
    slug: "research-taste",
    href: "/previews/research-taste",
    title: "Research platforms: Taste Skill copy",
    description: "A separate design of all five dedicated research pages: a scientific study board, interactive figures, clearer process explanations and product connections. The original research previews are preserved.",
  },
  {
    slug: "about-taste",
    file: "about-taste.html",
    title: "About Chemlife: editorial design",
    description: "A Taste Skill About page preview using Chemlife's real people, research and manufacturing photography, with an interactive G.I.F.T. values section.",
  },
  {
    slug: "homepage-heroes",
    href: "/previews/homepage-heroes",
    title: "Homepage: nine design directions",
    description: "Six existing layouts plus three complete concepts inspired by the brand-bubbles reference: Brand bubbles, Field journal and Living science. Includes product discovery, illustrated research and the full homepage.",
  },
  {
    slug: "insights-cards",
    href: "/previews/insights-cards",
    title: "Insights: full-image social cards",
    description: "Instagram and LinkedIn cards that grow with each image. Compare original proportions with the current crop using approved Insights posts.",
  },
  {
    slug: "social-responsibility",
    href: "/previews/social-responsibility",
    title: "Social responsibility: five designs",
    description: "Five homepage directions: photo stories, a blue feature, a community journal, an interactive showcase and open commitments. Built around ChemLife’s existing initiatives and brand guide.",
  },
  {
    slug: "vision-mission",
    href: "/previews/vision-mission",
    title: "Vision & Mission: six variations",
    description: "Six About page layouts to compare, from open columns and editorial rows to contrasting panels, a connected path and a photo-led section.",
  },
  {
    slug: "landscape-homepage",
    file: "landscape-homepage.html",
    title: "Homepage: living landscape",
    description: "A full homepage redesign: an animated farm panorama hero, the ANBioT figure, the product finder and a sideways-scrolling process.",
  },
  {
    slug: "anbiot-hero-layouts",
    file: "anbiot-hero-layouts.html",
    // Opens on the stacked layout, the default option.
    anchor: "#s2",
    title: "ANBioT hero layouts",
    description: "Four ways to lay out the hero around the ANBioT animation, starting with the stacked layout, then split, arch and cycle, on navy or paper.",
  },
  {
    slug: "mould-loss-calculator",
    file: "mould-loss-calculator.html",
    title: "Mould-loss calculator",
    description: "Farmers enter their feed, feed price and mould losses to see what prevention saves a year, based on the worked example in our Economics of Prevention article.",
  },
  {
    slug: "research-animations",
    href: "/previews/research/animations",
    title: "Research animations, in depth",
    description: "Ten more figures for the five research platforms, drawn like the research pages' own: how each works up close, and the bigger picture.",
  },
  {
    slug: "research-pages",
    href: "/previews/research",
    title: "Research platform pages",
    description: "The Research page, with each of the five platforms opening its own page: an animated figure, how it works, why it matters and the products built on it.",
  },
] as const;

/** Previews show everywhere except the live site, so they can be checked locally too. */
export function previewsAllowed(host: string): boolean {
  return host !== "" && !isLiveHost(host);
}
