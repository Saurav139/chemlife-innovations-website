"use client";

import { Images } from "@/lib/assets";
import { PRODUCTS } from "@/lib/catalog";
import { useT } from "@/i18n/LocaleProvider";

export type Photo = { src: string; alt: string; position?: string };
export type ChapterId = "intro" | "make" | "tech" | "hygiene" | "proof" | "delivery" | "leaders";
export type Item = { title: string; text?: string; icon?: string };
export type RichChapter = {
  id: ChapterId;
  kicker: string;
  title: string;
  text?: string;
  facts?: { label: string; value: string }[];
  photo: Photo;
  gallery: Photo[];
  // What the "more information" versions add. All of it is copy already on the site.
  more: {
    lead?: string;
    stats?: { value: number; label: string }[];
    itemsTitle?: string;
    items?: Item[];
    list?: string[];
    chipsTitle?: string;
    chips?: string[];
  };
  // Used by the "all out" versions for each chapter's backdrop.
  accent: string;
};

// The research platforms' full titles are long; these are the short names used on the Research page's cards.
const PLATFORM_NAMES = ["ANBioT", "Green chelation", "Microencapsulation", "Nano trace minerals", "Nature-identical bioactives"];
const PLATFORM_IMAGES = [Images.research.anbiot, Images.research.greenTechnology, Images.research.microencapsulation, Images.research.nanoTraceMineral, Images.research.natureIdenticalBio];
const AWARD_LOGOS = [Images.awards.ccamp, Images.awards.animalHusbandry, Images.awards.birac, Images.awards.naarm];
const LEADERS = [
  { name: "Dr Radhakrishna PM", image: Images.people.leaderRadhakrishna },
  { name: "Dr Sharada KC", image: Images.people.leaderSharada },
  { name: "Sneha R", image: Images.people.leaderSneehaCropped },
  { name: "Shankar CV", image: Images.people.leaderShankar },
];
const HYGIENE_FAMILY = ["MaxDmold", "MaxDmold Plus", "MaxDmold Spray", "SynDmold", "FeedGenie Prime", "FeedGenie Forte", "AflaMlock", "DDGS-Dtox"];

export function useRichChapters(): RichChapter[] {
  const all = useT();
  const t = all.home.whoWeAre;
  const product = (name: string) => {
    const i = PRODUCTS.findIndex((p) => p.name === name);
    return { ...PRODUCTS[i], ...all.products.items[i] };
  };
  const flagship = ["MaxDmold", "FeedGenie Prime", "MinBioZen", "MethioWiz", "CholiWiz"].map(product);
  const categories = Object.keys(all.products.categories) as (keyof typeof all.products.categories)[];
  const steps = all.home.howWeDo.steps;
  const maxDmold = product("MaxDmold");

  return [
    {
      id: "intro", kicker: t.kicker, title: t.title, text: t.intro, accent: "#2f4f7f",
      photo: { src: Images.people.foundersNew, alt: "ChemLife's founders and leadership team", position: "42% 50%" },
      gallery: [
        { src: Images.heroes.about, alt: "A seedling growing in a laboratory flask" },
        { src: Images.gallery.rotate11, alt: t.cards[0].alts[0] },
        { src: Images.gallery.rotate21, alt: t.cards[1].alts[0] },
      ],
      more: {
        lead: all.about.journeyText,
        stats: [
          { value: 106, label: "years of combined leadership" },
          { value: PRODUCTS.length, label: "products in the range" },
          { value: all.research.topics.length, label: "research platforms" },
          { value: 3, label: "species: poultry, dairy and swine" },
        ],
        chipsTitle: "Our values",
        chips: [all.about.values.green.name, all.about.values.innovation.name, all.about.values.facts.name, all.about.values.trust.name],
      },
    },
    {
      id: "make", kicker: "What we make", title: t.faq[0].q, text: t.faq[0].a, accent: "#b8391f",
      photo: { src: Images.research.pellets, alt: t.cards[2].alts[0] },
      gallery: ["MinBioZen", "MethioWiz", "CholiWiz"].map((name) => ({ src: product(name).banner ?? product(name).icon, alt: `${name}: ${product(name).tagline}` })),
      more: {
        itemsTitle: "Flagship products",
        items: flagship.map((p) => ({ title: p.name, text: p.tagline, icon: p.icon })),
        chipsTitle: "The full range",
        chips: categories.map((c) => `${all.products.categories[c]} · ${PRODUCTS.filter((p) => p.category === c).length} products`),
      },
    },
    {
      id: "tech", kicker: "Our technologies", title: t.faq[1].q, text: t.faq[1].a, accent: "#13786f",
      photo: { src: Images.research.researchImage, alt: "ChemLife's research laboratory" },
      gallery: PLATFORM_IMAGES.slice(0, 3).map((src, i) => ({ src, alt: `${PLATFORM_NAMES[i]} illustration` })),
      more: {
        lead: all.research.topics[0].advantage,
        itemsTitle: "Five research platforms",
        items: all.research.topics.map((topic, i) => ({ title: PLATFORM_NAMES[i], text: topic.tagline, icon: PLATFORM_IMAGES[i] })),
      },
    },
    {
      id: "hygiene", kicker: "Feed hygiene", title: t.faq[2].q, text: t.faq[2].a, accent: "#3b6e2f",
      photo: { src: Images.products.banners.maxdmold, alt: "Feed grain shielded from mould" },
      gallery: ["FeedGenie Prime", "MaxDmold Spray", "AflaMlock"].map((name) => ({ src: product(name).banner ?? product(name).icon, alt: `${name}: ${product(name).tagline}` })),
      more: {
        itemsTitle: "Two flagships",
        items: [maxDmold, product("FeedGenie Prime")].map((p) => ({ title: p.name, text: p.tagline, icon: p.icon })),
        list: maxDmold.features,
        chipsTitle: "The feed-hygiene family",
        chips: HYGIENE_FAMILY,
      },
    },
    {
      id: "proof", kicker: "Proof", title: "Certified, recognised and supported", facts: t.facts.slice(4, 8), accent: "#8a5a12",
      photo: { src: Images.heroes.awardsLandscape, alt: all.home.heroAlt, position: "50% 60%" },
      gallery: [
        { src: Images.process.developmentImage, alt: steps[1].alt },
        { src: Images.people.founders, alt: "ChemLife's founders" },
        { src: Images.social.image2, alt: all.home.social.imageAlts[1] },
      ],
      more: {
        itemsTitle: all.home.awards.title,
        items: all.home.awards.items.map((award, i) => ({ title: award.title, text: award.description, icon: AWARD_LOGOS[i] })),
      },
    },
    {
      id: "delivery", kicker: "Delivery", title: t.faq[3].q, text: t.faq[3].a, accent: "#1f5f8b",
      photo: { src: Images.process.delivery, alt: steps[3].alt },
      gallery: [
        { src: Images.process.manufacturingImage, alt: steps[2].alt },
        { src: Images.gallery.rotate22, alt: t.cards[1].alts[1] },
        { src: Images.heroes.chicken, alt: "Chickens running across a poultry farm" },
      ],
      more: {
        itemsTitle: all.home.howWeDo.title.replace("?", ""),
        items: steps.map((step) => ({ title: step.title, text: step.description })),
      },
    },
    {
      id: "leaders", kicker: "Leadership", title: "Led by four directors", text: t.leadershipCaption, accent: "#5b3f8c",
      photo: { src: Images.people.founders, alt: "ChemLife's founders", position: "50% 30%" },
      gallery: LEADERS.slice(0, 3).map((leader) => ({ src: leader.image, alt: leader.name, position: "50% 20%" })),
      more: {
        stats: [{ value: 106, label: "years of combined experience" }],
        itemsTitle: all.about.leadersTitle,
        items: LEADERS.map((leader, i) => ({ title: leader.name, text: `${all.about.leaders[i].role}. ${all.about.leaders[i].bio}`, icon: leader.image })),
      },
    },
  ];
}
