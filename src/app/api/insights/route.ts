import { NextResponse } from "next/server";

// Hardcoded fallback data in case API keys are not supplied or fail
const fallbackData = {
  blogs: [
    {
      type: "Blog" as const,
      title: "Feed Bites: Smarter Decisions for Better Outcomes",
      description: "In livestock farming, every feed choice determines your operational margins. Discover how functional feed additives and active mycotoxin binders like AflaMlock minimize mycotoxin risk and optimize herd performance.",
      meta: "5 min read",
      date: "July 15, 2026",
      imageUrl: "/images/rotate_2_1.jpeg",
      linkUrl: "https://www.linkedin.com/posts/chemlifeinnovations_feedbites-chemlifeinnovations-feedbites-activity-7243916601449336832-r_xQ",
      content: `In livestock farming, every feed choice determines your operational margins. Feed quality isn't just about weight; it is about gut performance and biochemical stability.

With #FeedBites, we share actionable updates to help dairy and poultry manufacturers make smarter feed preservation decisions. In this post, we discuss:

1. Aflatoxin M1 Risk: Learn how small amounts of fungal mold carry over into milk products, affecting food safety standards and cooperative compliance.
2. The Dual Binding Solution: Traditional binders only lock surface-level toxins. Advanced bio-complexes absorb mycotoxins and support liver function under stress.
3. Maximizing FCR: Keeping grains dry and mold-free preserves nutritional integrity, directly improving the Feed Conversion Ratio (FCR).

Make smarter decisions for better outcomes.`
    },
    {
      type: "Blog" as const,
      title: "Commercialization and Manufacturing of Bio-Trace Minerals in Partnership with TDB (DST)",
      description: "ChemLife Innovations achieves a milestone partnership with the Technology Development Board (TDB), Department of Science & Technology (DST), Govt of India, to scale and manufacture bio-trace minerals using ANBioT platform.",
      meta: "6 min read",
      date: "July 12, 2026",
      imageUrl: "/images/rotate_3_2.jpeg",
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
      type: "Blog" as const,
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
      type: "Blog" as const,
      title: "Feed Bites: The Ayurvedic Science Behind Chelated Bio-Trace Minerals",
      description: "Bridging traditional plant-based wisdom with modern biotechnology: how ANBioT biotransforms crude inorganic minerals into highly bioavailable organic supplements.",
      meta: "5 min read",
      date: "March 22, 2026",
      imageUrl: "/images/research_image.jpeg",
      linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
      content: `Bridging traditional plant-based wisdom with modern biotechnology is the core mission of ChemLife Innovations.

Through our patented Accelerated Natural Bio-Transformation (ANBioT) platform, we recreate natural bio-chelation pathways. Instead of feeding crude metal oxides or sulfates (which have low absorption and cause toxic stress), we chelate trace minerals directly to hydroxy amino acids.

This organic chelation increases absorption efficiency, optimizes digestion, and ensures trace minerals like Zinc, Copper, and Manganese are delivered exactly where the animal needs them.`
    },
    {
      type: "Blog" as const,
      title: "Feed Bites: The Critical Importance of Feed Hygiene",
      description: "How mold contamination silently erodes livestock farm profits through FCR drop and vet bills. Clean feed leads to pure milk and secure margins.",
      meta: "4 min read",
      date: "January 10, 2026",
      imageUrl: "/images/pellets.webp",
      linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
      content: `In poultry and cattle farming, feed accounts for up to 70% of production costs. If your feed is compromised by fungal mold or bacteria, your entire margin is at risk.

Clean feed ensures that animals absorb maximum nutrients, which directly impacts the Feed Conversion Ratio (FCR). By preventing mold growth from the source, farmers avoid the clinical losses associated with secondary bacterial infections and high mortality rates.`
    },
    {
      type: "Blog" as const,
      title: "Feed Bites: Redefining Poultry Gut Performance",
      description: "Discover how non-antibiotic gut performance solutions like GroGenie improve intestinal microbial balance and support high growth rates.",
      meta: "4 min read",
      date: "November 15, 2025",
      imageUrl: "/images/rotate_1_1.jpeg",
      linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
      content: `Maintaining poultry gut integrity is key to modern, sustainable farming. Intestinal health directly dictates how well broilers and layers absorb crucial nutrients.

GroGenie provides a non-antibiotic approach to managing enteric pathogens. By suppressing harmful bacteria and supporting healthy microflora, it promotes consistent growth and feed safety without the risks of antibiotic resistance.`
    },
    {
      type: "Blog" as const,
      title: "7 Essential Feed Hygiene Practices to Safeguard Livestock Health",
      description: "Feed hygiene is a cornerstone of livestock management, directly impacting animal health, growth performance, and overall farm profitability.",
      meta: "8 min read",
      date: "September 28, 2025",
      imageUrl: "/images/rotate_1_2.jpeg",
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
      type: "Blog" as const,
      title: "The Ayurvedic Connection: Copper in Ancient Medicine vs Modern Misuse",
      description: "For centuries, copper has held a unique place in human civilization, celebrated in Ayurveda for therapeutic qualities. Yet, modern misuse through misinformation and excessive consumption raises important health concerns.",
      meta: "5 min read",
      date: "September 26, 2025",
      imageUrl: "/images/rotate_2_2.jpeg",
      linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
      content: `For centuries, copper has held a unique place in human civilization, celebrated in Ayurveda for its exceptional therapeutic qualities. Ayurvedic texts recommend storing water in copper vessels (Tamra Jal) to balance the three doshas—Vata, Pitta, and Kapha—and to naturally purify the water.

However, modern misuse through misinformation and excessive consumption raises important health concerns. Today, we see an over-reliance on crude copper supplements and unregulated copper feed formulations.

While copper is an essential trace mineral necessary for collagen synthesis, iron absorption, and immune function, the boundary between requirement and toxicity is extremely narrow. Excess copper accumulation leads to chronic toxicity, liver damage (hepatosis), and physiological imbalance.

In livestock and animal nutrition, copper must be supplied scientifically. Crude, unrefined copper sources can trigger digestive distress and toxicity. The solution lies in advanced organic chelation technology, where copper is bonded to specific amino acids. This increases absorption efficiency and safety, avoiding the pitfalls of unscientific misuse.`
    },
    {
      type: "Blog" as const,
      title: "Top 6 Reasons Why Feed Hygiene Impacts Profits",
      description: "In poultry and livestock farming, feed hygiene often gets overlooked. Contaminated or poorly stored feed silently erodes profits through disease outbreaks, poor growth, and higher veterinary bills.",
      meta: "4 min read",
      date: "September 22, 2025",
      imageUrl: "/images/rotate_1_3.jpeg",
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
      type: "Blog" as const,
      title: "When Feed Turns Fatal: Real-Life Case Studies on Mold Outbreaks",
      description: "Across the globe, mold outbreaks have led to devastating losses for farmers, jeopardizing both animal welfare and human livelihoods. Explore real-world cases of mold contamination and their lessons.",
      meta: "6 min read",
      date: "September 20, 2025",
      imageUrl: "/images/rotate_2_3.jpeg",
      linkUrl: "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all",
      content: `Across the globe, mold outbreaks have led to devastating losses for farmers, jeopardizing both animal welfare and human livelihoods. Mold species like Aspergillus and Fusarium produce dangerous mycotoxins—including Aflatoxins and Ochratoxins—which are highly toxic even in minute quantities.

In this article, we analyze two real-world case studies:

- Case Study 1: A poultry farm in Southeast Asia experienced a sudden 15% drop in egg production and high mortality. The cause was traced to corn stored in high-humidity conditions, leading to severe aflatoxicosis.

- Case Study 2: A dairy operation faced reproductive failures and reduced milk yields. Investigation revealed moldy silage containing Zearalenone, an estrogenic mycotoxin.

These cases teach us that visual inspection is not enough. Mycotoxins are often invisible and odorless. Preventive testing, proper ventilation, and active mold inhibition are the only reliable defenses.`
    },
    {
      type: "Blog" as const,
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
      type: "Blog" as const,
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
      type: "Blog" as const,
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
      type: "Blog" as const,
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
      type: "Blog" as const,
      title: "6 Myths About Using Copper Sulfate in Animal Feed (Busted)",
      description: "Copper sulfate is a common additive in animal feed, but misconceptions lead to abuse and toxicity. We bust the 6 biggest myths surrounding its use in livestock nutrition.",
      meta: "3 min read",
      date: "July 30, 2025",
      imageUrl: "https://chemlifeinnovations.wordpress.com/wp-content/uploads/2025/07/listicle.png",
      linkUrl: "https://chemlifeinnovations.wordpress.com/2025/07/30/6-myths-about-using-copper-sulfate-in-animal-feed-busted/",
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
  ],
  podcasts: [
    {
      type: "Podcast" as const,
      title: "India’s Antibiotic-Free Protein Problem Explained | Myths & Poultry Science",
      description: "Dr. Santosh Ire demystifies antibiotic usage myths in poultry farming and addresses the core challenges of antibiotic-free protein production in India.",
      meta: "22 min play",
      date: "August 15, 2025",
      youtubeId: "cti7agsOeFA"
    }
  ],
  videos: [
    {
      type: "Video" as const,
      title: "What is important? Moisture in corn or water activity",
      description: "A quick, concise breakdown explaining the crucial differences between moisture content and water activity in corn-based animal feed.",
      meta: "2 min play",
      date: "August 20, 2025",
      youtubeId: "CuY2QU4BDvg"
    },
    {
      type: "Video" as const,
      title: "Are You Eating What Your Food Eats?",
      description: "An eye-opening discussion on feed safety, showing how the quality of livestock feed directly impacts human food chains and consumer health.",
      meta: "4 min play",
      date: "August 22, 2025",
      youtubeId: "K_KOuRqwvXA"
    },
    {
      type: "Video" as const,
      title: "Harsh reality against poultry feed | Harsh side of chemical",
      description: "A deep dive into the chemical additives in modern poultry feeds and their unintended long-term impacts on bird health.",
      meta: "4 min play",
      date: "June 10, 2025",
      youtubeId: "ovTjXxh0p_8"
    }
  ]
};

function summarizeDescription(text: string): string {
  if (!text) return "";

  // Cut off long metadata headers, timestamps, social handles, or footers
  const cutoffIndex = text.search(/(⏱️|TIMESTAMPS|\b\d{2}:\d{2}\b|🔗|🌐|📧|📞|🔔|👍|📲)/i);
  let cleaned = cutoffIndex !== -1 ? text.substring(0, cutoffIndex) : text;

  // Standardize line breaks to periods so they split cleanly into sentences
  cleaned = cleaned
    .replace(/\r?\n/g, ". ")
    .replace(/\s*(?:--|—|–)\s*/g, " - ") // Normalize em-dashes and double dashes to single dash
    .replace(/\s+/g, " ")                // Collapse consecutive spaces
    .replace(/\.+/g, ".")                // Clean up duplicate periods
    .trim();

  // Remove emojis
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "");

  // Extract the first 2 sentences
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  let summary = "";
  if (sentences.length > 0) {
    summary = sentences[0] || "";
    if (sentences[1]) {
      summary += " " + sentences[1];
    }
  } else {
    summary = cleaned;
  }

  summary = summary.trim();

  // Strip trailing period if duplicate, ensure clean structure
  if (summary.endsWith(".") && summary.endsWith("..")) {
    summary = summary.replace(/\.+$/, ".");
  }

  // Capped length safety limit
  if (summary.length > 180) {
    summary = summary.substring(0, 177) + "...";
  }

  return summary;
}

export async function GET() {
  const linkedinToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const linkedinOrgId = process.env.LINKEDIN_ORGANIZATION_ID;
  const youtubeKey = process.env.YOUTUBE_API_KEY;
  const youtubePlaylistId = process.env.YOUTUBE_PLAYLIST_ID || "UUw9YQ4V85x2n_L3mC0uE7yA"; // Default uploads playlist id or channel uploads

  let liveBlogs = [...fallbackData.blogs];
  let livePodcasts = [...fallbackData.podcasts];
  let liveVideos = [...fallbackData.videos];

  // Try loading live LinkedIn posts if credentials are provided
  if (linkedinToken && linkedinOrgId) {
    try {
      const response = await fetch(
        `https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:organization:${linkedinOrgId}&sortBy=LAST_MODIFIED&count=15`,
        {
          headers: {
            Authorization: `Bearer ${linkedinToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
          next: { revalidate: 3600 }, // Cache on server for 1 hour
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.elements && data.elements.length > 0) {
          // Parse LinkedIn response objects into InsightItem format
          const mappedBlogs = data.elements.map((share: any) => {
            const dateObj = new Date(share.created?.time || Date.now());
            const formattedDate = dateObj.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });
            const text = share.comment || share.text?.text || "";
            const firstLine = text.split("\n")[0] || "Latest Update";
            const cleanTitle = firstLine.length > 60 ? firstLine.substring(0, 57) + "..." : firstLine;

            return {
              type: "Blog" as const,
              title: cleanTitle,
              description: text.substring(0, 150) + (text.length > 150 ? "..." : ""),
              meta: "3 min read",
              date: formattedDate,
              imageUrl: share.content?.contentEntities?.[0]?.thumbnails?.[0]?.resolvedUrl || "/images/rotate_2_1.jpeg",
              linkUrl: `https://www.linkedin.com/feed/update/urn:li:activity:${share.id}`,
              content: text,
            };
          });

          // Merge live blogs on top of default values
          liveBlogs = [...mappedBlogs, ...fallbackData.blogs];
        }
      }
    } catch (e) {
      console.warn("LinkedIn API integration error, utilizing fallback cache", e);
    }
  }

  // Try loading live YouTube uploads if credential is provided
  if (youtubeKey) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${youtubePlaylistId}&maxResults=25&key=${youtubeKey}`,
        {
          next: { revalidate: 3600 },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const videoIds = data.items
            .map((item: any) => item.contentDetails?.videoId || item.snippet?.resourceId?.videoId)
            .filter(Boolean)
            .join(",");

          // Fetch detailed video data (e.g., duration and full metadata)
          const detailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${youtubeKey}`,
            {
              next: { revalidate: 3600 },
            }
          );

          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            if (detailsData.items && detailsData.items.length > 0) {
              const mappedYouTubeItems = detailsData.items
                .map((item: any) => {
                  const snippet = item.snippet || {};
                  const durationStr = item.contentDetails?.duration || "";

                  // Calculate total seconds to filter out Shorts (< 60s)
                  let durationInSeconds = 0;
                  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                  if (match) {
                    const hours = parseInt(match[1] || "0", 10);
                    const minutes = parseInt(match[2] || "0", 10);
                    const seconds = parseInt(match[3] || "0", 10);
                    durationInSeconds = hours * 3600 + minutes * 60 + seconds;
                  }

                  // Discard Shorts (duration < 120 seconds)
                  if (durationInSeconds < 120) {
                    return null;
                  }

                  // Parse duration in ISO 8601 format (e.g., PT36M20S)
                  const titleLower = (snippet.title || "").toLowerCase();
                  const descLower = (snippet.description || "").toLowerCase();
                  const isPodcastKeyword =
                    titleLower.includes("podcast") ||
                    titleLower.includes("grand master") ||
                    titleLower.includes("grandmaster") ||
                    descLower.includes("podcast") ||
                    descLower.includes("grand master") ||
                    descLower.includes("grandmaster");

                  // A video is long (Podcast) if it's >= 10 mins (600s)
                  const isPodcast = isPodcastKeyword || (durationInSeconds >= 600);

                  const dateObj = new Date(snippet.publishedAt || Date.now());
                  const formattedDate = dateObj.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });

                  let metaPlay = "Video Play";
                  if (match) {
                    const hours = parseInt(match[1] || "0", 10);
                    const minutes = parseInt(match[2] || "0", 10);
                    const seconds = parseInt(match[3] || "0", 10);
                    if (hours > 0) {
                      metaPlay = `${hours} hr ${minutes} min play`;
                    } else if (minutes > 0) {
                      metaPlay = `${minutes} min play`;
                    } else {
                      metaPlay = `${seconds} sec play`;
                    }
                  }

                  const summary = summarizeDescription(snippet.description || "");

                  return {
                    type: (isPodcast ? "Podcast" : "Video") as "Podcast" | "Video",
                    title: snippet.title || "YouTube Video",
                    description: summary || "ChemLife Innovations YouTube upload details.",
                    meta: metaPlay,
                    date: formattedDate,
                    youtubeId: item.id,
                  };
                })
                .filter(Boolean);

              // Filter out the live items by type
              const liveFetchedPodcasts = mappedYouTubeItems.filter((item: any) => item.type === "Podcast");
              const liveFetchedVideos = mappedYouTubeItems.filter((item: any) => item.type === "Video");

              livePodcasts = [...liveFetchedPodcasts, ...fallbackData.podcasts];
              liveVideos = [...liveFetchedVideos, ...fallbackData.videos];
            }
          }
        }
      }
    } catch (e) {
      console.warn("YouTube API integration error, utilizing fallback cache", e);
    }
  }

  // Deduplicate entries by exact title matches
  const uniqueBlogs = liveBlogs.filter(
    (item, index, self) => self.findIndex((b) => b.title === item.title) === index
  );
  const uniquePodcasts = livePodcasts.filter(
    (item, index, self) => self.findIndex((p) => p.title === item.title) === index
  );
  const uniqueVideos = liveVideos.filter(
    (item, index, self) => self.findIndex((v) => v.title === item.title) === index
  );

  return NextResponse.json({
    blogs: uniqueBlogs,
    podcasts: uniquePodcasts,
    videos: uniqueVideos,
  });
}
