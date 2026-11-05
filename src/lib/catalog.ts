import { Images } from "@/lib/assets";

// The site's products, research topics and internships, shared by their pages and the site search. Their text
// (taglines, descriptions and so on) is in the language files, in the same order as these lists.

export interface ProductBase {
  id: number;
  name: string;
  category: string;
  icon: string;
  banner?: string;
}

export const PRODUCTS: ProductBase[] = [
  {
    id: 1,
    name: "MaxDmold",
    category: "Mono-gastric",
    icon: Images.products.icons.maxdmold,
    banner: Images.products.banners.maxdmold
  },
  {
    id: 2,
    name: "MaxDmold Spray",
    category: "Value Addition",
    icon: Images.products.icons.maxdmoldSpray,
    banner: Images.products.banners.maxdmoldSpray
  },
  {
    id: 3,
    name: "SynDmold",
    category: "Ruminants",
    icon: Images.products.icons.syndmold,
    banner: Images.products.banners.syndmold
  },
  {
    id: 4,
    name: "MaxDmold Plus",
    category: "Mono-gastric",
    icon: Images.products.icons.maxdmoldPlus,
    banner: Images.products.banners.maxdmoldPlus
  },
  {
    id: 5,
    name: "MethioWiz",
    category: "Ruminants",
    icon: Images.products.icons.methiowiz,
    banner: Images.products.banners.methiowiz
  },
  {
    id: 6,
    name: "MBioWiz Plus",
    category: "Ruminants",
    icon: Images.products.icons.mbiowizPlus,
    banner: Images.products.banners.mbiowizPlus
  },
  {
    id: 7,
    name: "MBioWiz TS",
    category: "Ruminants",
    icon: Images.products.icons.mbiowizTs,
    banner: Images.products.banners.mbiowizTs
  },
  {
    id: 8,
    name: "CholiWiz",
    category: "Ruminants",
    icon: Images.products.icons.choliwiz,
    banner: Images.products.banners.choliwiz
  },
  {
    id: 9,
    name: "RumiWiz",
    category: "Ruminants",
    icon: Images.products.icons.rumiwiz,
    banner: Images.products.banners.rumiwiz
  },
  {
    id: 10,
    name: "MinBioZen",
    category: "Value Addition",
    icon: Images.products.icons.minbiozen,
    banner: Images.products.banners.minbiozen
  },
  {
    id: 11,
    name: "GroGenie (12% & 60%)",
    category: "Mono-gastric",
    icon: Images.products.icons.grogenie,
    banner: Images.products.banners.grogenie
  },
  {
    id: 12,
    name: "LivproGenie",
    category: "Mono-gastric",
    icon: Images.products.icons.livprogenie,
    banner: Images.products.banners.livprogenie
  },
  {
    id: 13,
    name: "EggGenie",
    category: "Mono-gastric",
    icon: Images.products.icons.egggenie,
    banner: Images.products.banners.egggenie
  },
  {
    id: 14,
    name: "GutproGenie",
    category: "Mono-gastric",
    icon: Images.products.icons.gutprogenie,
    banner: Images.products.banners.gutprogenie
  },
  {
    id: 15,
    name: "AflaMlock",
    category: "Ruminants",
    icon: Images.products.icons.aflamlock,
    banner: Images.products.banners.aflamlock
  },
  {
    id: 16,
    name: "FeedGenie Forte",
    category: "Mono-gastric",
    icon: Images.products.icons.feedgenie,
    banner: Images.products.banners.feedgenieFort
  },
  {
    id: 17,
    name: "DDGS-Dtox",
    category: "Value Addition",
    icon: Images.products.icons.ddgsDtox,
    banner: Images.products.banners.ddgsDtox
  },
  {
    id: 18,
    name: "FeedGenie Prime",
    category: "Mono-gastric",
    icon: Images.products.icons.feedgeniePrime,
    banner: Images.products.banners.feedgeniePrime
  }
];

// The English title names the topic in enquiry emails to our team and in analytics, whatever language the page is in.
export interface ResearchTopicBase {
  id: number;
  englishTitle: string;
  category: string;
  banner: string;
}

export const RESEARCH_TOPICS: ResearchTopicBase[] = [
  {
    id: 1,
    englishTitle: "Accelerated Natural BioTransformation (ANBioT)",
    category: "Research",
    banner: Images.research.anbiot
  },
  {
    id: 2,
    englishTitle: "Green Chelation for Smarter Bio-Trace Minerals",
    category: "Research",
    banner: Images.research.greenTechnology
  },
  {
    id: 3,
    englishTitle: "Microencapsulation Technologies: Targeting Rumen-Sustained and Bypass Deliveries",
    category: "Research",
    banner: Images.research.microencapsulation
  },
  {
    id: 4,
    englishTitle: "Nano-Activated Functionalized Trace Minerals: The Next Frontier in Bioavailability",
    category: "Research",
    banner: Images.research.nanoTraceMineral
  },
  {
    id: 5,
    englishTitle: "Synthesis of Nature-Identical Bioactive Molecules: Scaling Green Biotechnology",
    category: "Research",
    banner: Images.research.natureIdenticalBio
  }
];

// The English title and department go into the application email, which our hiring team reads in English.
export interface InternshipRoleBase {
  id: string;
  englishTitle: string;
  englishDepartment: string;
  bgImage: string;
}

export const INTERNSHIP_ROLES: InternshipRoleBase[] = [
  {
    id: "research-intern",
    englishTitle: "Research Intern",
    englishDepartment: "Research & Development Labs",
    bgImage: Images.careers.researchIntern
  },
  {
    id: "animal-nutrition-intern",
    englishTitle: "Animal Nutrition Intern",
    englishDepartment: "Formulation & Product Development",
    bgImage: Images.careers.animalNutrition
  },
  {
    id: "hr-marketing-intern",
    englishTitle: "Operations, Marketing  and Human Resources Intern",
    englishDepartment: "Operations & Business Relations",
    bgImage: Images.careers.hrMarketing
  }
];

/** A URL-safe id from a name: "MaxDmold Spray" becomes "maxdmold-spray". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Ids of single items, so a link (from the site search) can open the page at that item:
// /products#product-maxdmold, /research#research-…, /careers#role-research-intern, /insights#insight-….
export const productAnchor = (name: string) => `product-${slugify(name)}`;

/** A product's own page: "MaxDmold Spray" is at /products/maxdmold-spray. */
export const productPath = (name: string) => `/products/${slugify(name)}`;
export const researchAnchor = (englishTitle: string) => `research-${slugify(englishTitle)}`;
export const roleAnchor = (id: string) => `role-${id}`;
export const insightAnchor = (title: string) => `insight-${slugify(title)}`;
