/**
 * Centralized asset manifest for all public static assets.
 *
 * Usage:
 *   import { Images, Videos } from "@/lib/assets";
 *   <Image src={Images.branding.logo} ... />
 *   <video src={Videos.farmBg} />
 */

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

export const Images = {
  /** Brand identity: logos, wordmarks */
  branding: {
    logo: "/images/branding/logo.jpg",
    /** Flask and wordmark side by side on a transparent background, for the header. Built from logo.jpg. */
    logoHorizontal: "/images/branding/logo-horizontal.png",
  },

  /** Full-page hero background images */
  heroes: {
    home: "/images/heroes/hero-bg.png",
    about: "/images/heroes/about-hero-bg.png",
    careers: "/images/heroes/careers-hero-bg.jpg",
    contact: "/images/heroes/contact-hero-bg.jpg",
    insights: "/images/heroes/insights-hero-bg.jpg",
    research: "/images/heroes/research-hero-bg.jpg",
    /** Hero slideshow / rotating panels */
    chicken: "/images/heroes/chicken-bg.jpg",
    dairy: "/images/heroes/dairy-bg.jpg",
    slide76: "/images/heroes/76.jpg",
    slide87: "/images/heroes/87.jpg",
  },

  /** Product icons, banners, and category images */
  products: {
    heroBanner: "/images/products/products_hero_banner.png",
    heroBg: "/images/products/products-hero-bg.png",
    packagesBg: "/images/products/products-packages-bg.png",
    customBg: "/images/products/products-custom-bg.jpg",
    monoGastric: "/images/products/mono_gastric.png",
    ruminants: "/images/products/ruminants.jpg",
    chemdmold: "/images/products/chemdmold.jpg",
    /** Category overview images (used on home/what-we-do) */
    categoryMono: "/images/products/product-mono.png",
    categoryRumi: "/images/products/product-rumi.png",
    categoryValue: "/images/products/product-value.png",
    /** Individual product icons */
    icons: {
      maxdmold: "/images/products/icon-maxdmold.png",
      maxdmoldPlus: "/images/products/icon-maxdmold-plus.png",
      maxdmoldSpray: "/images/products/icon-maxdmold-spray.png",
      syndmold: "/images/products/icon-syndmold.png",
      mbiowizPlus: "/images/products/icon-mbiowiz-plus.png",
      mbiowizTs: "/images/products/icon-mbiowiz-ts.png",
      methiowiz: "/images/products/icon-methiowiz.png",
      choliwiz: "/images/products/icon-choliwiz.png",
      rumiwiz: "/images/products/icon-rumiwiz.png",
      minbiozen: "/images/products/icon-minbiozen.png",
      grogenie: "/images/products/icon-grogenie.png",
      livprogenie: "/images/products/icon-livprogenie.png",
      egggenie: "/images/products/icon-egggenie.png",
      gutprogenie: "/images/products/icon-gutprogenie.png",
      aflamlock: "/images/products/icon-aflamlock.png",
      feedgenie: "/images/products/icon-feedgenie.png",
      feedgeniePrime: "/images/products/icon-feedgenie-prime.png",
      ddgsDtox: "/images/products/icon-ddgs-dtox.png",
    },
    /** Individual product banner images */
    banners: {
      maxdmold: "/images/products/banner-maxdmold.jpg",
      maxdmoldPlus: "/images/products/banner-maxdmold-plus.jpg",
      maxdmoldSpray: "/images/products/banner-maxdmold-spray.jpg",
      syndmold: "/images/products/banner-syndmold.jpg",
      mbiowizPlus: "/images/products/banner-mbiowiz-plus.jpg",
      mbiowizTs: "/images/products/banner-mbiowiz-ts.jpg",
      methiowiz: "/images/products/banner-methiowiz.jpg",
      choliwiz: "/images/products/banner-choliwiz.jpg",
      rumiwiz: "/images/products/banner-rumiwiz.jpg",
      minbiozen: "/images/products/banner-minbiozen.jpg",
      grogenie: "/images/products/banner-grogenie.jpg",
      livprogenie: "/images/products/banner-livprogenie.jpg",
      egggenie: "/images/products/banner-egggenie.jpg",
      gutprogenie: "/images/products/banner-gutprogenie.jpg",
      aflamlock: "/images/products/banner-aflamlock.jpg",
      feedgenieFort: "/images/products/banner-feedgenie-forte.jpg",
      feedgeniePrime: "/images/products/banner-feedgenie-prime.jpg",
      ddgsDtox: "/images/products/banner-ddgs-dtox.jpg",
    },
  },

  /** Team / leadership / founders */
  people: {
    founders: "/images/people/founders.jpg",
    foundersNew: "/images/people/founders_new.jpg",
    leaderRadhakrishna: "/images/people/leader_radhakrishna.jpg",
    leaderSharada: "/images/people/leader_sharada.jpg",
    leaderSneha: "/images/people/leader_sneha.jpg",
    leaderSneehaCropped: "/images/people/leader_sneha_cropped.jpg",
    leaderShankar: "/images/people/leader_shankar.png",
  },

  /** R&D / science imagery */
  research: {
    heroBanner: "/images/research/research_hero_banner.png",
    anbiotBanner: "/images/research/research_anbiot_banner.png",
    chelationBanner: "/images/research/research_chelation_banner.png",
    anbiot: "/images/research/anbiot.png",
    anbiotJpg: "/images/research/anbiot.jpg",
    greenTechnology: "/images/research/green_technology.png",
    microencapsulation: "/images/research/microencapsulation.png",
    nanoTraceMineral: "/images/research/nano_trace_mineral.jpg",
    natureIdenticalBio: "/images/research/nature_identical_bio.png",
    capsuleDelivery: "/images/research/capsule_delivery.png",
    pellets: "/images/research/pellets.webp",
    /** General research/lab photo used in process steps and blog thumbnails */
    researchImage: "/images/research/research_image.jpeg",
  },

  /** "How We Do It" / process step images */
  process: {
    howWeDoBg: "/images/process/how-we-do-bg.avif",
    /** Alias to research.researchImage — used for the Research process step */
    researchImage: "/images/research/research_image.jpeg",
    developmentImage: "/images/process/development_image.jpeg",
    manufacturingImage: "/images/process/manufacturing_image.jpeg",
    delivery: "/images/process/process-delivery.png",
    deliveryCrop: "/images/process/process-delivery_crop.png",
    processResearch: "/images/process/process-research.png",
    processDevelopment: "/images/process/process-development.png",
    processManufacturing: "/images/process/process-manufacturing.png",
  },

  /** Careers section role background images */
  careers: {
    researchIntern: "/images/careers/careers_research_intern.png",
    animalNutrition: "/images/careers/careers_animal_nutrition.png",
    hrMarketing: "/images/careers/careers_hr_marketing.png",
  },

  /** Rotating gallery / blog / insights thumbnails */
  gallery: {
    rotate11: "/images/gallery/rotate_1_1.jpeg",
    rotate12: "/images/gallery/rotate_1_2.jpeg",
    rotate13: "/images/gallery/rotate_1_3.jpeg",
    rotate21: "/images/gallery/rotate_2_1.jpeg",
    rotate22: "/images/gallery/rotate_2_2.jpeg",
    rotate23: "/images/gallery/rotate_2_3.jpeg",
    rotate32: "/images/gallery/rotate_3_2.jpeg",
    rotate33: "/images/gallery/rotate_3_3.jpeg",
  },

  /** CSR / social responsibility imagery */
  social: {
    image2: "/images/social/social2.jpeg",
    image3: "/images/social/social3.jpeg",
    helpingPeople: "/images/social/helping-people.gif",
  },

  /** Chat bot mascot images */
  mascots: {
    poultry: "/images/mascots/poultry-mascot.webp",
    dairy: "/images/mascots/dairy-mascot.webp",
  },

  /** Partner / client logos (used in the flip-card marquee) */
  partnerLogos: {
    /** Returns the full path for a given filename. The trimmed/ copies have the empty margins of the originals cut
     *  off (most logos sat in a mostly empty 500×500 square), so each logo fills its card evenly. */
    path: (filename: string) => `/images/partner-logos/trimmed/${filename}`,
    /** Company name for each logo file, used for its alt text */
    names: {
      "aac.png": "Antera Agro Chem",
      "abesca.png": "Abescare",
      "carg.png": "Cargill",
      "el.png": "Elpe Labs",
      "ew_nutr.png": "EW Nutrition",
      "groxel.png": "GROEXL Vet",
      "huve.png": "Huvepharma",
      "mybio.png": "Mystical Biotech",
      "nt.png": "Noveltech",
      "nutr.png": "Nutrilivia",
      "sneha_farma_logo.png": "Sneha",
      "varsha.png": "Varsha",
      "vt.png": "Vetfosys",
      "yg.png": "Yashodavana Goat Farm",
      "16.png": "Fibroheal Woundcare",
      "17.png": "QuadraGen",
      "nuqo_logo.jpg": "NUQO",
    } as Record<string, string>,
    /** Front-row logo filenames */
    frontRow: [
      "aac.png",
      "abesca.png",
      "carg.png",
      "el.png",
      "ew_nutr.png",
      "groxel.png",
      "huve.png",
      "mybio.png",
      "nt.png",
    ] as const,
    /** Back-row logo filenames (shown on card flip) */
    backRow: [
      "nutr.png",
      "sneha_farma_logo.png",
      "varsha.png",
      "vt.png",
      "yg.png",
      "16.png",
      "17.png",
      "nuqo_logo.jpg",
      "aac.png",
    ] as const,
  },

  /** Awards / certifications / recognitions */
  awards: {
    /** Returns the full path for a given awards filename */
    path: (filename: string) => `/images/awards/${filename}`,
    ccamp: "/images/awards/c-camp-logo.png",
    animalHusbandry: "/images/awards/animal-husbandry.png",
    birac: "/images/awards/birac.png",
    naarm: "/images/awards/naarm.png",
    award1: "/images/awards/1awaard.png",
    award2: "/images/awards/2award.png",
    award3: "/images/awards/3award.png",
    award4: "/images/awards/4award.png",
    award5: "/images/awards/5award.png",
  },

  /** Testimonial company logos */
  testimonials: {
    huve: "/images/testimonials/huve_logo.png",
    groxel: "/images/testimonials/groxel_logo.png",
    quadragen: "/images/testimonials/quadragen_logo.png",
  },
} as const;

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

export const Videos = {
  /** Full-page hero background video */
  farmBg: "/videos/farm-bg.mp4",
  /** CSR / social responsibility video */
  social1: "/videos/social1.mp4",
  /** Company trip / life-at-chemlife videos */
  trip1: "/videos/trip1.mp4",
  trip2: "/videos/trip2.mp4",
  trip3: "/videos/trip3.mp4",
} as const;

/** First frame of each video, shown until it plays (and instead of it for "reduce motion"). */
export const VideoPosters = {
  social1: "/images/posters/social1.webp",
  trip1: "/images/posters/trip1.webp",
  trip2: "/images/posters/trip2.webp",
  trip3: "/images/posters/trip3.webp",
} as const;
