"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";

const easeOut = [0.25, 0.1, 0, 1] as const;

interface InsightItem {
  type: "Blog" | "Podcast" | "Video";
  title: string;
  description: string;
  meta: string;
  date: string;
  linkUrl?: string;
  imageUrl?: string;
  youtubeId?: string;
  content?: string;
}

const fallbackBlogs: InsightItem[] = [
  {
    type: "Blog",
    title: "Feed Bites: Smarter Decisions for Better Outcomes",
    description: "In livestock farming, every feed choice determines your operational margins. Discover how functional feed additives and active mycotoxin binders like AflaMlock minimize mycotoxin risk and optimize herd performance.",
    meta: "5 min read",
    date: "July 15, 2026",
    imageUrl: Images.gallery.rotate21,
    linkUrl: "https://www.linkedin.com/posts/chemlifeinnovations_feedbites-chemlifeinnovations-feedbites-activity-7243916601449336832-r_xQ",
    content: `In livestock farming, every feed choice determines your operational margins. Feed quality isn't just about weight; it is about gut performance and biochemical stability.

With #FeedBites, we share actionable updates to help dairy and poultry manufacturers make smarter feed preservation decisions. In this post, we discuss:

1. Aflatoxin M1 Risk: Learn how small amounts of fungal mold carry over into milk products, affecting food safety standards and cooperative compliance.
2. The Dual Binding Solution: Traditional binders only lock surface-level toxins. Advanced bio-complexes absorb mycotoxins and support liver function under stress.
3. Maximizing FCR: Keeping grains dry and mold-free preserves nutritional integrity, directly improving the Feed Conversion Ratio (FCR).

Make smarter decisions for better outcomes.`
  },
  {
    type: "Blog",
    title: "Commercialization and Manufacturing of Bio-Trace Minerals in Partnership with TDB (DST)",
    description: "ChemLife Innovations achieves a milestone partnership with the Technology Development Board (TDB), Department of Science & Technology (DST), Govt of India, to scale and manufacture bio-trace minerals using ANBioT platform.",
    meta: "6 min read",
    date: "July 12, 2026",
    imageUrl: Images.gallery.rotate32,
    linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
    content: `We are proud to share a major milestone: ChemLife Innovations has entered into a strategic collaboration with the Technology Development Board (TDB), Department of Science & Technology, Government of India.

This partnership is focused on the commercial scale-up and manufacturing of bio-trace minerals utilizing our patented Accelerated Natural Biotransformation (ANBioT) technology.

Key highlights of the project:
- Bioavailability: Organic chelated minerals developed using green biotransformation are highly absorbed by livestock, reducing environmental waste.
- Green Tech: The production process avoids organic solvents, operating under fully sustainable, clean-chemistry principles.
- Import Substitution: Strengthening local manufacturing capabilities of high-grade functional mineral additions for animal feed.

This marks a significant step forward in our mission to support clean, sustainable animal nutrition.`
  },
  {
    type: "Blog",
    title: "Poultry Feed Costs in India: 6 Innovative Solutions to Reduce Soybean Dependency and Improve Feed Efficiency",
    description: "The recent announcement of a 25% reduction in poultry production due to rising feed costs has sparked concern across India's poultry value chain. Discover 6 innovative solutions to reduce soybean dependency and improve feed efficiency.",
    meta: "3 min read",
    date: "June 5, 2026",
    imageUrl: "https://chemlifeinnovations.wordpress.com/wp-content/uploads/2026/06/poultry-birds.jpg",
    linkUrl: "https://chemlifeinnovations.wordpress.com/2026/06/05/poultry-feed-costs-in-india-6-innovative-solutions-to-reduce-soybean-dependency-and-improve-feed-efficiency/",
    content: `The recent announcement of a 25% reduction in poultry production due to rising feed costs has sparked concern across India's poultry value chain.

While production cuts may provide short-term relief, they don't solve the underlying challenge. The real issue is far bigger: India's poultry industry remains heavily dependent on soybean meal, making it vulnerable to price volatility, supply disruptions, and shrinking profitability.

For an industry where feed accounts for nearly 70% of production costs, every fluctuation in raw material pricing directly impacts farmers, integrators, feed manufacturers, and ultimately consumers. But every challenge creates an opportunity. This is the perfect moment for the industry to accelerate innovation, rethink feed strategies, and adopt technologies that improve feed efficiency while reducing dependency on traditional protein sources.

Here are six practical solutions to help strengthen poultry profitability:

1. Optimize Feed Formulation: Use dynamic least-cost formulation models that allow nutritionists to optimize nutrient density while reducing reliance on expensive single ingredients like soybean meal.
2. Use Multi-Enzyme Feed Additives: Incorporate multi-enzyme blends to break down anti-nutritional factors in feed ingredients, releasing more bound energy and amino acids.
3. Incorporate DDGS and Oilseed Cakes: Use corn distillers dried grains with solubles (DDGS), rapeseed meal, sunflower meal, and sesame cake as cost-effective partial replacements.
4. Explore Alternative Protein Sources: Consider novel ingredients like insect meals (e.g., black soldier fly larvae) and single-cell proteins (algal/yeast proteins) which offer high sustainability and supply security.
5. Improve Grain Storage and Feed Hygiene: Prevent post-harvest loss due to mold and bacterial contamination by using clean storage protocols, proper ventilation, and active mold inhibitors.
6. Adopt Phase Feeding Programs: Adjust nutrient levels dynamically according to the bird's precise age to prevent unnecessary nutrient oversupply and lower feed costs.`
  },
  {
    type: "Blog",
    title: "Feed Bites: The Ayurvedic Science Behind Chelated Bio-Trace Minerals",
    description: "Bridging traditional plant-based wisdom with modern biotechnology: how ANBioT biotransforms crude inorganic minerals into highly bioavailable organic supplements.",
    meta: "5 min read",
    date: "March 22, 2026",
    imageUrl: Images.process.researchImage,
    linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
    content: `Bridging traditional plant-based wisdom with modern biotechnology is the core mission of ChemLife Innovations.

Through our patented Accelerated Natural Bio-Transformation (ANBioT) platform, we recreate natural bio-chelation pathways. Instead of feeding crude metal oxides or sulfates (which have low absorption and cause toxic stress), we chelate trace minerals directly to hydroxy amino acids.

This organic chelation increases absorption efficiency, optimizes digestion, and ensures trace minerals like Zinc, Copper, and Manganese are delivered exactly where the animal needs them.`
  },
  {
    type: "Blog",
    title: "Feed Bites: The Critical Importance of Feed Hygiene",
    description: "How mold contamination silently erodes livestock farm profits through FCR drop and vet bills. Clean feed leads to pure milk and secure margins.",
    meta: "4 min read",
    date: "January 10, 2026",
    imageUrl: Images.research.pellets,
    linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
    content: `In poultry and cattle farming, feed accounts for up to 70% of production costs. If your feed is compromised by fungal mold or bacteria, your entire margin is at risk.

Clean feed ensures that animals absorb maximum nutrients, which directly impacts the Feed Conversion Ratio (FCR). By preventing mold growth from the source, farmers avoid the clinical losses associated with secondary bacterial infections and high mortality rates.`
  },
  {
    type: "Blog",
    title: "Feed Bites: Redefining Poultry Gut Performance",
    description: "Discover how non-antibiotic gut performance solutions like GroGenie improve intestinal microbial balance and support high growth rates.",
    meta: "4 min read",
    date: "November 15, 2025",
    imageUrl: Images.gallery.rotate11,
    linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
    content: `Maintaining poultry gut integrity is key to modern, sustainable farming. Intestinal health directly dictates how well broilers and layers absorb crucial nutrients.

GroGenie provides a non-antibiotic approach to managing enteric pathogens. By suppressing harmful bacteria and supporting healthy microflora, it promotes consistent growth and feed safety without the risks of antibiotic resistance.`
  },
  {
    type: "Blog",
    title: "7 Essential Feed Hygiene Practices to Safeguard Livestock Health",
    description: "Feed hygiene is a cornerstone of livestock management, directly impacting animal health, growth performance, and overall farm profitability.",
    meta: "8 min read",
    date: "September 28, 2025",
    imageUrl: Images.gallery.rotate12,
    linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
    content: `Feed hygiene is a cornerstone of livestock management, directly impacting animal health, growth performance, and overall farm profitability. Contaminated or improperly stored feed can lead to serious health issues, including reduced immunity, digestive disorders, and in severe cases, mortality. Implementing structured feed hygiene practices is therefore not just a precaution, it is an essential investment in your livestock’s wellbeing and your farm’s operational efficiency.

Here are the seven key practices:

1. Source Quality Raw Materials: Only buy from certified, trusted suppliers who test for toxins, heavy metals, and pathogens.

2. Proper Moisture Control: Maintain storage moisture levels below 12% to prevent mold growth. Excess moisture creates the perfect environment for mycotoxin-producing fungi.

3. Implement Regular Cleaning Protocols: Silos, bins, transport augers, and mixing equipment must be regularly cleaned and sanitized to avoid cross-contamination.

4. Pest Management: Rodents, insects, and wild birds are major vectors for Salmonella, E. coli, and other harmful pathogens. Ensure all facilities are physically secured.

5. Monitor Temperature and Ventilation: Keep storage areas cool and well-ventilated. High humidity combined with heat is a catalyst for toxic fungal outbreaks.

6. Use Functional Feed Additives: Incorporate high-quality mold inhibitors and organic acidifiers to naturally preserve feed quality and control bacterial loads.

7. Routine Laboratory Analysis: Regularly test raw ingredients and finished feeds for microbiological loads, moisture content, and mycotoxins.`
  },
  {
    type: "Blog",
    title: "The Ayurvedic Connection: Copper in Ancient Medicine vs Modern Misuse",
    description: "For centuries, copper has held a unique place in human civilization, celebrated in Ayurveda for therapeutic qualities. Yet, modern misuse through misinformation and excessive consumption raises important health concerns.",
    meta: "5 min read",
    date: "September 26, 2025",
    imageUrl: Images.gallery.rotate22,
    linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
    content: `For centuries, copper has held a unique place in human civilization, celebrated in Ayurveda for its exceptional therapeutic qualities. Ayurvedic texts recommend storing water in copper vessels (Tamra Jal) to balance the three doshas—Vata, Pitta, and Kapha—and to naturally purify the water.

However, modern misuse through misinformation and excessive consumption raises important health concerns. Today, we see an over-reliance on crude copper supplements and unregulated copper feed formulations.

While copper is an essential trace mineral necessary for collagen synthesis, iron absorption, and immune function, the boundary between requirement and toxicity is extremely narrow. Excess copper accumulation leads to chronic toxicity, liver damage (hepatosis), and physiological imbalance.

In livestock and animal nutrition, copper must be supplied scientifically. Crude, unrefined copper sources can trigger digestive distress and toxicity. The solution lies in advanced organic chelation technology, where copper is bonded to specific amino acids. This increases absorption efficiency and safety, avoiding the pitfalls of unscientific misuse.`
  },
  {
    type: "Blog",
    title: "Top 6 Reasons Why Feed Hygiene Impacts Profits",
    description: "In poultry and livestock farming, feed hygiene often gets overlooked. Contaminated or poorly stored feed silently erodes profits through disease outbreaks, poor growth, and higher veterinary bills.",
    meta: "4 min read",
    date: "September 22, 2025",
    imageUrl: Images.gallery.rotate13,
    linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
    content: `In poultry and livestock farming, feed hygiene often gets overlooked. However, contaminated or poorly stored feed silently erodes profits through disease outbreaks, poor growth, and higher veterinary bills.

Here are the top six reasons why feed hygiene is critical for your bottom line:

1. Prevents Costly Disease Outbreaks: Pathogens like Salmonella and E. coli can devastate entire flocks, leading to high mortality and quarantine costs.

2. Optimizes Feed Conversion Ratio (FCR): Clean feed ensures animals absorb maximum nutrients, improving weight gain and egg/milk production per unit of feed.

3. Reduces Medication and Vet Costs: Clean feed means stronger immune systems and fewer medical interventions, directly lowering veterinary bills.

4. Avoids Mycotoxin Binder Expenses: Keeping feed dry and clean from the start reduces the need for purchasing expensive toxin binders.

5. Minimizes Feed Waste: Spoiled, moldy feed is rejected by animals, leading to direct wastage of expensive raw materials.

6. Secures Premium Market Value: Healthy, disease-free livestock yield higher-quality meat and dairy products, fetching premium market prices.`
  },
  {
    type: "Blog",
    title: "When Feed Turns Fatal: Real-Life Case Studies on Mold Outbreaks",
    description: "Across the globe, mold outbreaks have led to devastating losses for farmers, jeopardizing both animal welfare and human livelihoods. Explore real-world cases of mold contamination and their lessons.",
    meta: "6 min read",
    date: "September 20, 2025",
    imageUrl: Images.gallery.rotate23,
    linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
    content: `Across the globe, mold outbreaks have led to devastating losses for farmers, jeopardizing both animal welfare and human livelihoods. Mold species like Aspergillus and Fusarium produce dangerous mycotoxins—including Aflatoxins and Ochratoxins—which are highly toxic even in minute quantities.

In this article, we analyze two real-world case studies:

- Case Study 1: A poultry farm in Southeast Asia experienced a sudden 15% drop in egg production and high mortality. The cause was traced to corn stored in high-humidity conditions, leading to severe aflatoxicosis.

- Case Study 2: A dairy operation faced reproductive failures and reduced milk yields. Investigation revealed moldy silage containing Zearalenone, an estrogenic mycotoxin.

These cases teach us that visual inspection is not enough. Mycotoxins are often invisible and odorless. Preventive testing, proper ventilation, and active mold inhibition are the only reliable defenses.`
  },
  {
    type: "Blog",
    title: "The Economics of Prevention: Why Mold Control Pays for Itself",
    description: "One of the largest costs in chicken production is feed. Preventing mold contamination is far less expensive than repairing the losses brought on by sick flocks and spoiled feed.",
    meta: "6 min read",
    date: "September 02, 2025",
    imageUrl: "https://chemlifeinnovations.wordpress.com/wp-content/uploads/2025/09/blog-2-featured-image.png",
    linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
    content: `One of the largest costs in chicken and livestock production is feed, representing up to 70% of total operational expenses. Preventing mold contamination is far less expensive than repairing the losses brought on by sick flocks and spoiled feed.

Consider the math:
- Cost of mold inhibitor treatment: A few dollars per ton of feed.
- Cost of mold contamination: Reduced feed intake, liver damage, immunosuppression, secondary bacterial infections, and mortality.

By investing in quality mold inhibitors, organic acidifiers, and proper storage hygiene, farmers can protect their largest investment (feed) and guarantee stable production, proving that prevention is always more profitable than cure.`
  },
  {
    type: "Blog",
    title: "9 Mistakes of Food Storage You Should Avoid",
    description: "Food safety, shelf life, and quality all depend on proper storage. Discover the 9 common storage mistakes that lead to waste, contamination, or spoilage in restaurants and kitchens.",
    meta: "4 min read",
    date: "September 1, 2025",
    imageUrl: "https://chemlifeinnovations.wordpress.com/wp-content/uploads/2025/09/featuredimage.png",
    linkUrl: "https://chemlifeinnovations.wordpress.com/2025/09/01/9-mistakes-of-food-storage-you-should-avoid/",
    content: `Food safety, shelf life, and quality all depend on proper storage. Food's freshness and your health are directly impacted by how it is stored, whether in a restaurant pantry, a home kitchen, or a warehouse. Unfortunately, a lot of people unintentionally commit frequent errors that might result in waste, contamination, or spoilage.

To keep your food fresh, secure, and long-lasting, you should steer clear of these nine food storage blunders:

1. Direct Sunlight Exposure: Storing food in direct sunlight raises temperatures, hastens spoiling, and turns oils rancid. Always keep food in opaque containers away from windows and heat sources.
2. High Humidity Zones: Humidity is a silent enemy, creating the perfect conditions for mold, bacterial contamination, and pest infestations. Keep dry goods in sealed containers and use dehumidifiers where necessary.
3. Over-Stocking: Packing items too closely together on shelves restricts air circulation and makes it difficult to track older stock. Neatly arrange shelves with proper ventilation gaps.
4. Poorly Ventilated Bins: Inadequately ventilated bins trap heat and moisture, which spoils fresh produce. Store fresh fruits and vegetables in vented bins rather than airtight plastic bags.
5. No FIFO Rotation: Without First In, First Out (FIFO) rotation, older stock expires in the back while newer products are consumed. Place fresh stock behind older items and mark containers with dates.
6. Ignoring Infestation Signs: Droppings, chewed packaging, or insects should never be ignored. Seal crevices, use pest-proof containers, and act quickly to prevent widespread contamination.
7. No Regular Cleaning: Dust, spills, and crumbs invite pests and germs. Implement a strict routine to sweep shelves, sanitize containers, and clean up spills immediately.
8. Broken Packaging: Damaged packaging exposes food to air and moisture, severely shortening shelf life. Transfer open or damaged ingredients into airtight containers.
9. Bags Touching the Floor: Letting food bags rest directly on the floor is unhygienic and exposes them to dust, floor moisture, and insects. Elevate bags at least six inches off the ground using pallets or racks.`
  },
  {
    type: "Blog",
    title: "From Farm to Fork: How Clean Feed Protects Human Health",
    description: "The story of food safety starts much earlier than the kitchen. Discover how clean animal feed protects the human food chain and prevents contamination from farm to fork.",
    meta: "3 min read",
    date: "August 29, 2025",
    imageUrl: "https://chemlifeinnovations.wordpress.com/wp-content/uploads/2025/08/blog-1.jpg",
    linkUrl: "https://chemlifeinnovations.wordpress.com/2025/08/29/from-farm-to-fork-how-clean-feed-protects-human-health/",
    content: `Most of us associate safe food with fresh fruit, spotless kitchens, or meticulous cooking. On the farm, however, the tale of food safety starts much earlier. The quality of feed provided to animals, particularly poultry, is one of the most crucial but sometimes disregarded elements in the lengthy process from farm to fork.

By lowering the possibility of dangerous chemicals, pathogens, and contaminants getting onto our plates, clean feed not only maintains the health of birds but also safeguards human health.

Toxins, fungus, bacteria, and hazardous chemicals can enter the bird's body through its feed, accumulating in tissues or eggs. These unspoken dangers persist when the chicken or eggs arrive in our kitchen:

- Pathogens: Bacteria like Salmonella and E. coli are easily transmitted from feed to birds, causing foodborne illnesses in humans.
- Mycotoxins: Fungal molds in storage produce mycotoxins (e.g. Aflatoxin B1) which convert to toxic metabolites (like Aflatoxin M1 in dairy or carryover in egg yolk).
- Chemical Residues: Heavy metals or pesticide residues present in low-quality feed raw materials accumulate bio-dynamically.

By concentrating on feed hygiene at every level, farmers and feed producers can lower risks. Crucial procedures include routine lab analysis, moisture control, and incorporating organic acidifiers and mold inhibitors to sanitize raw feed materials.`
  },
  {
    type: "Blog",
    title: "5 Signs Your Mold Inhibitor Isn't Working",
    description: "Not all mold inhibitors perform as intended. Learn the 5 warning signs that your current mold inhibitor is failing to protect your feed quality and livestock health.",
    meta: "3 min read",
    date: "August 22, 2025",
    imageUrl: "https://chemlifeinnovations.wordpress.com/wp-content/uploads/2025/08/featured-image-listicle-1.jpg",
    linkUrl: "https://chemlifeinnovations.wordpress.com/2025/08/22/5-signs-your-mold-inhibitor-isnt-working/",
    content: `Feed is treated with mold inhibitors to maintain its safety, freshness, and nutritional value. They lessen feed waste, promote bird health, and guard against spoiling. However, not all products function as intended, and farmers occasionally observe indications that the inhibitor isn't working.

Here are five important warning indicators to watch out for:

1. Musty Smell Remains in the Feed: Fungal activity is evident if feed still smells damp or musty after treatment. A good mold inhibitor should leave a clean, neutral scent.
2. Fungal Growth in Stored Feed: The presence of mold patches in bags or silos indicates nutrient loss is already underway. Visual mold is a clear sign of inhibitor failure.
3. No Improvement in Bird Health or FCR: If the feed conversion ratio (FCR) or animal immunity does not improve, concealed mycotoxins could still be actively affecting the flock.
4. Feed Goes Bad Faster Than Expected: If recently milled feed spoils too soon, the protection is either insufficient or only temporary.
5. Presence of Clumped or Wet Feed: Wetness and clumping promote rapid fungal growth. Mold inhibitors cannot compensate for poor aeration or leaking silos.

Always choose dependable, chemically tested mold inhibitors tailored to your specific storage conditions to secure feed quality and animal health.`
  },
  {
    type: "Blog",
    title: "6 Myths About Using Copper Sulfate in Animal Feed (Busted)",
    description: "Copper sulfate is a common additive in animal feed, but misconceptions lead to abuse and toxicity. We bust the 6 biggest myths surrounding its use in livestock nutrition.",
    meta: "3 min read",
    date: "July 30, 2025",
    imageUrl: "https://chemlifeinnovations.wordpress.com/wp-content/uploads/2025/07/listicle.png",
    linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
    content: `Copper sulfate is a typical addition to animal feed, particularly in pig and poultry production. It contributes to immunity, growth, and the avoidance of several illnesses. However, a number of fallacies have emerged around its application over time, which can cause misunderstandings, abuse, and even injury.

Let's correct the record and bust the six most prevalent myths:

Myth 1: It is a universal mold killer. Copper sulfate has some antibacterial properties, but it won't resolve mold issues on its own once infestation occurs. Use targeted feed mold inhibitors.
Myth 2: More copper sulfate means faster animal growth. Excess copper is highly toxic, causing severe liver damage (hepatosis) and intestinal lining damage.
Myth 3: It is completely safe and doesn't build up in the body. Copper accumulates in tissues and the environment, risking soil toxicity if manure is recycled.
Myth 4: It is the most economical solution. Hidden costs of toxicity, vet bills, feed refusal, and low yield outweigh the cheap initial purchase price.
Myth 5: If other farmers use it, it must be safe. Safe usage requires precise veterinary and nutritionist guidance, as requirements vary drastically across breeds and regions.
Myth 6: It can replace feed hygiene. Copper sulfate cannot substitute for dry storage, clean equipment, or balanced rations.

Prioritize advanced organic chelated minerals (like chelated copper hydroxy analogues) over crude copper sulfate to guarantee bio-availability and absolute safety.`
  }
];

const fallbackPodcasts: InsightItem[] = [
  {
    type: "Podcast",
    title: "India’s Antibiotic-Free Protein Problem Explained | Myths & Poultry Science",
    description: "Dr. Santosh Ire demystifies antibiotic usage myths in poultry farming and addresses the core challenges of antibiotic-free protein production in India.",
    meta: "22 min play",
    date: "August 15, 2025",
    youtubeId: "cti7agsOeFA"
  }
];

const fallbackVideos: InsightItem[] = [
  {
    type: "Video",
    title: "What is important? Moisture in corn or water activity",
    description: "A quick, concise breakdown explaining the crucial differences between moisture content and water activity in corn-based animal feed.",
    meta: "2 min play",
    date: "August 20, 2025",
    youtubeId: "CuY2QU4BDvg"
  },
  {
    type: "Video",
    title: "Are You Eating What Your Food Eats?",
    description: "An eye-opening discussion on feed safety, showing how the quality of livestock feed directly impacts human food chains and consumer health.",
    meta: "4 min play",
    date: "August 22, 2025",
    youtubeId: "K_KOuRqwvXA"
  },
  {
    type: "Video",
    title: "Harsh reality against poultry feed | Harsh side of chemical",
    description: "A deep dive into the chemical additives in modern poultry feeds and their unintended long-term impacts on bird health.",
    meta: "4 min play",
    date: "June 10, 2025",
    youtubeId: "ovTjXxh0p_8"
  }
];

export default function InsightsPage() {
  const [blogs, setBlogs] = useState<InsightItem[]>(fallbackBlogs);
  const [podcasts, setPodcasts] = useState<InsightItem[]>(fallbackPodcasts);
  const [videos, setVideos] = useState<InsightItem[]>(fallbackVideos);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<InsightItem | null>(null);

  const filters = ["All", "Blogs", "Podcasts", "Videos"];

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch("/api/insights");
        if (res.ok) {
          const data = await res.json();
          if (data.blogs && data.blogs.length > 0) setBlogs(data.blogs);
          if (data.podcasts && data.podcasts.length > 0) setPodcasts(data.podcasts);
          if (data.videos && data.videos.length > 0) setVideos(data.videos);
        }
      } catch (e) {
        console.warn("Failed to fetch dynamic insights feed, running offline fallback mode", e);
      }
    }
    fetchInsights();
  }, []);

  // Helper to convert date string for sorting
  const getTimestamp = (dateStr: string) => {
    try {
      return new Date(dateStr).getTime();
    } catch {
      return 0;
    }
  };

  // Sort helper to get newest list
  const getSortedItems = (items: InsightItem[]) => {
    return [...items].sort((a, b) => getTimestamp(b.date) - getTimestamp(a.date));
  };

  // Compute featured items dynamically (guaranteed latest)
  const sortedBlogs = getSortedItems(blogs);
  const sortedPodcasts = getSortedItems(podcasts);
  const sortedVideos = getSortedItems(videos);

  const featuredBlog = sortedBlogs[0] || fallbackBlogs[0];
  const featuredPodcast = sortedPodcasts[0] || fallbackPodcasts[0];
  const featuredVideo = sortedVideos[0] || fallbackVideos[0];

  // Filter, sort by date (descending), and search/deduplicate helper
  const getFilteredAndSorted = (list: InsightItem[]) => {
    return list
      .filter((item, index, self) => self.findIndex((x) => x.title === item.title) === index)
      .sort((a, b) => getTimestamp(b.date) - getTimestamp(a.date))
      .filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        );
      });
  };

  const filteredBlogs = getFilteredAndSorted(blogs);
  const filteredPodcasts = getFilteredAndSorted(podcasts);
  const filteredVideos = getFilteredAndSorted(videos);

  let filteredItems: InsightItem[] = [];

  if (selectedFilter === "Blogs") {
    filteredItems = filteredBlogs;
  } else if (selectedFilter === "Podcasts") {
    filteredItems = filteredPodcasts;
  } else if (selectedFilter === "Videos") {
    filteredItems = filteredVideos;
  } else {
    // Interleave: 1 Video, 1 Podcast, 2 Blogs, and repeat
    let vIndex = 0;
    let pIndex = 0;
    let bIndex = 0;

    while (
      vIndex < filteredVideos.length ||
      pIndex < filteredPodcasts.length ||
      bIndex < filteredBlogs.length
    ) {
      if (vIndex < filteredVideos.length) {
        filteredItems.push(filteredVideos[vIndex]);
        vIndex++;
      }
      if (pIndex < filteredPodcasts.length) {
        filteredItems.push(filteredPodcasts[pIndex]);
        pIndex++;
      }
      for (let k = 0; k < 2; k++) {
        if (bIndex < filteredBlogs.length) {
          filteredItems.push(filteredBlogs[bIndex]);
          bIndex++;
        }
      }
    }
  }

  return (
    <VariantProvider>
      <Header />

      <main className="bg-white min-h-screen text-brand-navy">
        {/* Insights Hero Section with Custom Background Image */}
        <SectionWrapper className="pt-32 pb-24 lg:pt-40 lg:pb-32 text-white relative overflow-hidden bg-brand-navy flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={Images.heroes.insights}
              alt="Biotechnology research papers and books backdrop"
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/90 via-brand-navy/60 to-brand-navy/35" />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full">
            <span className="text-teal-400 text-sm font-semibold tracking-widest uppercase block mb-3">
              Insights
            </span>
            <h1 className="font-heading text-4xl lg:text-6xl font-bold leading-tight mb-4 text-white max-w-4xl">
              <span className="text-teal-400">Knowledge</span> & Perspectives
            </h1>
            <p className="text-white/85 text-lg lg:text-xl leading-relaxed max-w-3xl font-light">
              Stay updated with the latest industry trends, veterinary research, and biotechnology advancements.
            </p>
          </div>
        </SectionWrapper>

        {/* Featured Section (Two Columns) */}
        <SectionWrapper className="pt-24 pb-8 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="mb-10">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-brand-navy">
                Featured
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Featured Blog */}
              {featuredBlog && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: easeOut }}
                  className="bg-gray-55 border border-gray-200 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                  onClick={() => setActiveArticle(featuredBlog)}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                        Blog
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">Featured • {featuredBlog.date} • {featuredBlog.meta}</span>
                    </div>
                    <h3 className="font-heading text-xl lg:text-2xl font-bold text-brand-navy mb-6 group-hover:text-teal-600 transition-colors duration-300 line-clamp-3">
                      {featuredBlog.title}
                    </h3>
                    
                    {/* Blog Image Preview */}
                    {featuredBlog.imageUrl && (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-gray-200 select-none mb-4">
                        <Image
                          src={featuredBlog.imageUrl}
                          alt={featuredBlog.title}
                          fill
                          className="object-cover group-hover:scale-102 transition-transform duration-500"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveArticle(featuredBlog);
                      }}
                      className="px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                    >
                      Read Article
                    </button>
                    <a
                      href={featuredBlog.linkUrl || "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-teal-600 font-bold text-sm transition-all duration-300 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {featuredBlog.linkUrl?.includes("wordpress.com") ? "Read on WordPress" : "View on LinkedIn"}
                    </a>
                  </div>
                </motion.div>
              )}

              {/* Featured Video */}
              {featuredVideo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.05, ease: easeOut }}
                  className="bg-gray-55 border border-gray-200 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        Video
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">Featured • {featuredVideo.date} • {featuredVideo.meta}</span>
                    </div>
                    <h3 className="font-heading text-xl lg:text-2xl font-bold text-brand-navy mb-6 group-hover:text-teal-600 transition-colors duration-300 line-clamp-3">
                      {featuredVideo.title}
                    </h3>
                    
                    {/* YouTube Preview Thumbnail */}
                    {featuredVideo.youtubeId && (
                      <div
                        onClick={() => setActiveVideoId(featuredVideo.youtubeId!)}
                        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 cursor-pointer shadow-sm group/video select-none mb-4"
                      >
                        <Image
                          src={`https://img.youtube.com/vi/${featuredVideo.youtubeId}/0.jpg`}
                          alt="Featured Video Preview"
                          fill
                          className="object-cover group-hover/video:scale-103 transition-transform duration-500 opacity-90"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover/video:bg-black/20 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-10 rounded-xl bg-red-600 group-hover/video:bg-red-700 flex items-center justify-center text-white transition-all shadow-md group-hover/video:scale-110">
                            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setActiveVideoId(featuredVideo.youtubeId!)}
                      className="px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                    >
                      Watch Now
                    </button>
                    <a
                      href={`https://www.youtube.com/watch?v=${featuredVideo.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-teal-600 font-bold text-sm transition-all duration-300"
                    >
                      Watch on YouTube
                    </a>
                  </div>
                </motion.div>
              )}

              {/* Featured Podcast */}
              {featuredPodcast && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
                  className="bg-gray-55 border border-gray-200 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-700">
                        Podcast
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">Featured • {featuredPodcast.date} • {featuredPodcast.meta}</span>
                    </div>
                    <h3 className="font-heading text-xl lg:text-2xl font-bold text-brand-navy mb-6 group-hover:text-teal-600 transition-colors duration-300 line-clamp-3">
                      {featuredPodcast.title}
                    </h3>
                    
                    {/* YouTube Preview Thumbnail */}
                    {featuredPodcast.youtubeId && (
                      <div
                        onClick={() => setActiveVideoId(featuredPodcast.youtubeId!)}
                        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 cursor-pointer shadow-sm group/video select-none mb-4"
                      >
                        <Image
                          src={`https://img.youtube.com/vi/${featuredPodcast.youtubeId}/0.jpg`}
                          alt="Featured Podcast Video Preview"
                          fill
                          className="object-cover group-hover/video:scale-103 transition-transform duration-500 opacity-90"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover/video:bg-black/20 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-10 rounded-xl bg-red-600 group-hover/video:bg-red-700 flex items-center justify-center text-white transition-all shadow-md group-hover/video:scale-110">
                            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setActiveVideoId(featuredPodcast.youtubeId!)}
                      className="px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                    >
                      Listen Now
                    </button>
                    <a
                      href={`https://www.youtube.com/watch?v=${featuredPodcast.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-teal-600 font-bold text-sm transition-all duration-300"
                    >
                      Watch on YouTube
                    </a>
                  </div>
                </motion.div>
              )}

            </div>

          </div>
        </SectionWrapper>

        {/* Social Channel Connectors Banner */}
        <SectionWrapper className="py-6 bg-slate-50 border-y border-gray-200/60">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-xs transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#0a66c2]/10 text-[#0a66c2] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-brand-navy text-sm">Follow us on LinkedIn</h4>
                  <p className="text-gray-400 text-xs mt-0.5">Smarter Decisions for Better Outcomes via #FeedBites</p>
                </div>
              </a>
              <a
                href="https://www.youtube.com/@chemlifeinnovations"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-red-500 hover:shadow-xs transition-all duration-300"
              >
                <div className="w-12 h-12 bg-red-600/10 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-brand-navy text-sm">Subscribe on YouTube</h4>
                  <p className="text-gray-400 text-xs mt-0.5">Watch expert talks, video insights, and podcast content</p>
                </div>
              </a>
            </div>
          </div>
        </SectionWrapper>

        {/* Filters and Search Row */}
        <SectionWrapper className="pt-12 pb-8 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100">
              
              {/* Search Bar + Subtitle */}
              <div className="w-full md:max-w-md">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-2">
                  Search Podcasts, Blogs and Videos
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, topics, or authors..."
                    className="w-full bg-gray-50 border border-gray-250 rounded-full px-6 py-3 text-sm text-brand-navy placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-300 shadow-sm"
                  />
                  <div className="absolute right-4 top-3.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Oval Filter Pills */}
              <div className="flex flex-wrap gap-3">
                {filters.map((filter) => {
                  const isActive = selectedFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 border cursor-pointer ${
                        isActive
                          ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                          : "bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </SectionWrapper>

        {/* Separator Section */}
        <div className="max-w-[1200px] mx-auto px-6 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Explore All Insights ({filteredItems.length})
            </span>
            <div className="w-full h-[1px] bg-gray-150" />
          </div>
        </div>

        {/* Combined Grid Section */}
        <SectionWrapper className="pt-0 pb-24 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => {
                  const isBlog = item.type === "Blog";
                  return (
                    <motion.div
                      layout
                      key={item.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, ease: easeOut }}
                      className="bg-gray-55 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-500/20 transition-all duration-300 group flex flex-col justify-between"
                    >
                      {/* Clickable Area of Card Content */}
                      <div
                        className={isBlog ? "cursor-pointer" : ""}
                        onClick={() => {
                          if (isBlog) {
                            if (item.linkUrl?.includes("wordpress.com")) {
                              window.open(item.linkUrl, "_blank", "noopener,noreferrer");
                            } else {
                              setActiveArticle(item);
                            }
                          }
                        }}
                      >
                        {/* Meta Category & Date Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            item.type === "Blog"
                              ? "bg-teal-50 text-teal-700"
                              : item.type === "Podcast"
                              ? "bg-red-50 text-red-700"
                              : "bg-blue-50 text-blue-700"
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {item.date} • {item.meta}
                          </span>
                        </div>

                        {/* Blog Image Preview (Only images for blogs, no videos) */}
                        {isBlog && item.imageUrl && (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-100 border border-gray-200 select-none">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-103 transition-transform duration-500"
                              unoptimized
                            />
                          </div>
                        )}

                        {/* Podcast YouTube Preview (Only in Podcast/Video item types) */}
                        {!isBlog && item.youtubeId && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveVideoId(item.youtubeId!);
                            }}
                            className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-900 border border-slate-200/80 cursor-pointer shadow-sm group/video select-none"
                          >
                            <Image
                              src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`}
                              alt={item.title}
                              fill
                              className="object-cover group-hover/video:scale-105 transition-transform duration-500 opacity-90"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover/video:bg-black/30 transition-colors" />
                            {/* YouTube Red Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-8 rounded-lg bg-red-600 group-hover/video:bg-red-700 flex items-center justify-center text-white transition-all shadow-md group-hover/video:scale-110">
                                <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}

                        <h4 className="font-heading text-lg font-bold text-brand-navy mb-4 group-hover:text-teal-600 transition-colors duration-300 line-clamp-3">
                          {item.title}
                        </h4>
                      </div>

                      {/* Card Action Buttons (Direct + View on LinkedIn) - isolated outside clicking div */}
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-2">
                        {isBlog ? (
                          <div className="flex items-center gap-2 w-full justify-between">
                            <button
                              onClick={() => setActiveArticle(item)}
                              className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              Read Article
                            </button>
                            <a
                              href={item.linkUrl || "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-gray-500 hover:text-teal-600 transition-colors cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.linkUrl?.includes("wordpress.com") ? "Read on WordPress" : "View on LinkedIn"}
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 w-full justify-between">
                            <button
                              onClick={() => setActiveVideoId(item.youtubeId!)}
                              className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1"
                            >
                              {item.type === "Podcast" ? "Listen Now" : "Watch Now"}
                            </button>
                            <a
                              href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-gray-500 hover:text-teal-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Watch on YouTube
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {filteredItems.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <span className="text-gray-400 text-sm">No insights found matching your search query.</span>
              </div>
            )}

          </div>
        </SectionWrapper>
      </main>

      {/* YouTube Video Modal Overlay */}
      <AnimatePresence>
        {activeVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setActiveVideoId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveVideoId(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
                aria-label="Close video player"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* YouTube Iframe Embed */}
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blog Article Reader Modal Overlay */}
      <AnimatePresence>
        {activeArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setActiveArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col my-8 max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Sticky Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                    {activeArticle.type}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {activeArticle.date}
                  </span>
                </div>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-brand-navy flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Close article reader"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Article Body */}
              <div className="overflow-y-auto p-6 md:p-8 space-y-6">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy leading-tight">
                  {activeArticle.title}
                </h2>

                {activeArticle.imageUrl && (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-gray-250 select-none">
                    <Image
                      src={activeArticle.imageUrl}
                      alt={activeArticle.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <div className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line space-y-4">
                  {activeArticle.content}
                </div>
              </div>

              {/* Footer Action */}
              <div className="border-t border-gray-100 px-6 py-4 flex justify-between bg-gray-50 items-center">
                {activeArticle.linkUrl && (
                  <a
                    href={activeArticle.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    View post on LinkedIn →
                  </a>
                )}
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-6 py-2.5 rounded-full bg-brand-navy text-white font-bold text-sm hover:bg-teal-600 transition-colors cursor-pointer"
                >
                  Close Reader
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
