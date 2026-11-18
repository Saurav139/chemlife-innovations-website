// What each topic's own page says: /insights/topic/<slug>. The topics and their keywords are in insight-topics.ts.
//
// The wording follows the SEO / AEO / GEO keyword strategy (November 2026): the answer comes first, in about 40 to
// 50 words, names what it is about, and stays inside that document's safe-claims list (no product performance
// claims). The questions and answers are its model answers; each fact's source is named under the answer.
//
// No imports here, so the tests can load this file on its own.

export interface TopicQuestion {
  question: string;
  answer: string;
  /** Where the answer's facts come from, shown under it. */
  source?: string;
}

export interface TopicPage {
  /** For search results and link previews: one sentence, up to about 160 characters. */
  description: string;
  /** The page's opening paragraph. */
  intro: string;
  questions?: TopicQuestion[];
}

export const TOPIC_PAGES: Record<string, TopicPage> = {
  "feed-hygiene": {
    description: "Articles, videos and posts on feed hygiene: clean raw materials, storage, moisture control and testing, from feed mill intake to the feed trough.",
    intro:
      "Feed hygiene means keeping feed and raw materials clean from intake to the feed trough: sound storage, moisture control, regular cleaning, sampling and testing. Contaminated feed affects animal health, farm margins and the food chain, so it is worth getting right at every step.",
  },
  "mould-control": {
    description: "Articles, videos and posts on mould control in stored grain and compound feed: storage, moisture, ventilation and mould inhibitors.",
    intro:
      "Mould control is about stopping fungi from growing in stored grain and compound feed, through dry storage, good ventilation and, where needed, a mould inhibitor. Mould spoils nutrients and can leave mycotoxins behind, so prevention starts before the feed is made.",
    questions: [
      {
        question: "What is the difference between a mould inhibitor and a mycotoxin binder?",
        answer:
          "A mould inhibitor limits fungal growth in feed and raw materials during storage, so fewer toxins form. A mycotoxin binder adsorbs toxins already present so less is absorbed by the animal. They do different jobs and neither replaces good storage and sampling practice.",
      },
    ],
  },
  mycotoxins: {
    description: "Articles, videos and posts on mycotoxins in animal feed: aflatoxin, fumonisin and others, where they come from and how feed mills manage the risk.",
    intro:
      "Mycotoxins are toxins produced by moulds such as Aspergillus and Fusarium in grain and feed. Aflatoxin, fumonisin, ochratoxin and zearalenone are among the best known. They are often invisible and odourless, so control relies on raw-material testing, storage hygiene and, where appropriate, binders.",
    questions: [
      {
        question: "Which feed ingredients carry the most mycotoxin risk in Nigeria?",
        answer:
          "A survey of Nigerian poultry feed and ingredients found peanut (groundnut) cake contributed most to aflatoxin and maize contributed most to fumonisin. Aflatoxin B1 occurred in 83 per cent of feed samples, which is why storage control and ingredient testing matter.",
        source: "Akinmusire et al., Mycotoxins in poultry feed and feed ingredients in Nigeria (Mycotoxin Research).",
      },
    ],
  },
  "milk-safety": {
    description: "Articles, videos and posts on aflatoxin M1 in milk: how it gets there from dairy feed, the limit in India, and why prevention starts with the feed.",
    intro:
      "Aflatoxin M1 is the form of aflatoxin found in milk after dairy animals eat feed contaminated with aflatoxin B1. Keeping it out of milk therefore starts with the feed: raw-material checks, storage hygiene and, where appropriate, binders.",
    questions: [
      {
        question: "What is aflatoxin M1 and how does it get into milk?",
        answer:
          "Aflatoxin M1 is a toxin found in the milk of animals that have eaten feed contaminated with aflatoxin B1. Roughly 1 to 6 per cent of the B1 in feed is transferred to milk as M1, so controlling aflatoxin in dairy feed is the first line of defence.",
        source: "Devegowda, Sridhar and Sherasia, Aflatoxin: Prevalence and control in dairy feeds and milk.",
      },
      {
        question: "What is the permitted aflatoxin M1 level in milk in India?",
        answer:
          "India's food safety regulator, FSSAI, sets the maximum aflatoxin M1 level in milk at 0.5 micrograms per kilogram. Because M1 originates in feed, dairy plants and cooperatives manage it through feed raw-material checks, storage hygiene and, where appropriate, binders.",
        source: "NDDB, Booklet on Aflatoxin; FSSAI.",
      },
    ],
  },
  "dairy-nutrition": {
    description: "Articles, videos and posts on dairy nutrition: rumen balance, bypass methionine and choline, the transition cow and milk quality.",
    intro:
      "Dairy nutrition covers what a cow needs across lactation and the transition period around calving: a steady rumen, and nutrients such as methionine and choline delivered where they can be used. These pieces look at the science and at practice on the farm.",
    questions: [
      {
        question: "What is rumen-protected choline used for in transition cows?",
        answer:
          "Choline is a methyl donor involved in fat transport from the liver. Giving it in a rumen-protected form lets it pass the rumen intact, and Indian studies have tested it in transition cows from about three weeks before to three weeks after calving.",
        source: "ICAR and NDRI journal papers on rumen-protected choline in transition cows.",
      },
    ],
  },
  "poultry-nutrition": {
    description: "Articles, videos and posts on poultry nutrition: feed formulation, raw-material quality and feed additives for broilers and layers.",
    intro:
      "Poultry nutrition is how feed formulation, raw-material quality and feed additives shape the way broilers and layers grow and lay. Feed is the largest cost in poultry production, so small choices in the feed add up across a flock.",
  },
  "trace-minerals": {
    description: "Articles, videos and posts on trace minerals in animal nutrition: copper, zinc and others, chelated and inorganic forms, and bioavailability.",
    intro:
      "Trace minerals such as copper, zinc, manganese and selenium are needed in small amounts but matter a great deal. How well an animal absorbs them depends on their form, which is why chelated (organic) minerals are compared with inorganic salts.",
  },
  "water-quality": {
    description: "Articles, videos and posts on drinking-water quality on poultry farms: water pH, acidifiers, sanitisers and why the same dose behaves differently.",
    intro:
      "Drinking-water quality decides how well acidifiers and sanitisers work on a farm. Water pH and buffering capacity can settle whether a given dose does its job, so the same product can behave differently from one farm to the next. A water test is the place to start.",
  },
  "feed-efficiency": {
    description: "Articles, videos and posts on feed cost and feed efficiency: raw-material prices, soybean meal dependency, FCR and where losses hide.",
    intro:
      "Feed is the largest cost in livestock production, so feed efficiency (how much feed it takes to produce a kilogram of meat, milk or eggs) decides margins. These pieces cover raw-material prices, soybean meal dependency, the feed conversion ratio (FCR) and where losses hide.",
  },
  technology: {
    description: "Articles, videos and posts on the technology behind our feed additives: ANBioT bio-transformation, green chelation and microencapsulation.",
    intro:
      "ANBioT (Accelerated Natural BioTransformation), green chelation and multi-layer microencapsulation are the technologies behind our feed additives. These pieces explain what each one is and why it is used, in plain language.",
    questions: [
      {
        question: "What is microencapsulation in feed additives?",
        answer:
          "Microencapsulation coats an active ingredient in protective layers so it is released at the intended point: for example, slowly in the rumen or after it. It can also improve stability in processing. ChemLife Innovations uses multi-layer microencapsulation for rumen-sustained and bypass delivery.",
      },
    ],
  },
  "export-markets": {
    description: "Articles, videos and posts for feed mills and distributors in West Africa, East Africa and Southeast Asia: local raw materials, storage and supply.",
    intro:
      "Feed mills and distributors in West Africa, East Africa and Southeast Asia work with their own raw materials, climates and registration rules. These pieces look at feed safety and supply in those markets.",
  },
  "company-news": {
    description: "News from ChemLife Innovations: milestones, partnerships, events and the people behind the work.",
    intro: "News from ChemLife Innovations: milestones, partnerships, events and the people behind the work.",
  },
};
