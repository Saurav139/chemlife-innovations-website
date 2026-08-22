"""Parse and save FAQ sets to data/faqs/ as JSON files.

Two FAQ sets:
  1. educational_faqs  — 100 general Q&As about feed additives
  2. feed_hygiene_faqs — Feed hygiene, mold, mycotoxins, silage (121 questions)

Each set is split into separate files per category (poultry / dairy / general)
so the embedding pipeline routes them to the correct Pinecone namespaces.

Run:
    python scripts/fetch_faqs.py
"""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import DATA_DIR

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

OUT_DIR = DATA_DIR / "faqs"
OUT_DIR.mkdir(parents=True, exist_ok=True)


# ── FAQ Set 1: 100 Educational FAQs ──────────────────────────────────────────

EDUCATIONAL_FAQS: list[dict] = [
    {
        "section": "I. General Questions About Animal Feed Additives",
        "category": "general",
        "qas": [
            {"q": "What are animal feed additives?", "a": "Substances added to feed to improve nutrition, health, growth, or product quality."},
            {"q": "Why are feed additives used in poultry and dairy diets?", "a": "To improve feed efficiency, enhance growth, prevent diseases, and improve product quality."},
            {"q": "Are feed additives the same as nutrients?", "a": "No — additives aren't primary nutrients (proteins/carbs), but support nutrition and health."},
            {"q": "Who regulates feed additives in India?", "a": "The Food Safety and Standards Authority of India (FSSAI) and Fertiliser and Chemicals regulations."},
            {"q": "Are all feed additives legal in India?", "a": "No — only those permitted by FSSAI and other regulatory bodies."},
            {"q": "What forms do feed additives come in?", "a": "Powders, liquids, pellets, microcapsules."},
            {"q": "Do additives replace vaccines?", "a": "No. They support immunity but are not substitutes for vaccines."},
            {"q": "Do feed additives change feed taste?", "a": "Some do (flavors/appetizers) to increase palatability."},
            {"q": "Are additives species-specific?", "a": "Many are — poultry, cattle, buffalo, goats require different formulations."},
            {"q": "How are feed additives labeled?", "a": "With ingredient, dosage, warnings, manufacturing and expiry date."},
        ],
    },
    {
        "section": "II. Types of Additives Used in Poultry",
        "category": "poultry",
        "qas": [
            {"q": "What are probiotics?", "a": ""},
            {"q": "How do prebiotics work?", "a": ""},
            {"q": "What are enzymes used for in poultry?", "a": ""},
            {"q": "How do antioxidants benefit birds?", "a": ""},
            {"q": "What are growth promoters?", "a": ""},
            {"q": "Are antibiotics still used as growth promoters?", "a": ""},
            {"q": "What are acidifiers?", "a": ""},
            {"q": "How do amino acids as additives help?", "a": ""},
            {"q": "What are organic acids used for?", "a": ""},
            {"q": "Are essential oils additives in poultry diets?", "a": ""},
            {"q": "What is vitamin-mineral premix?", "a": ""},
            {"q": "How do feed preservatives help?", "a": ""},
            {"q": "What role do coccidiostats play?", "a": ""},
            {"q": "What are mycotoxin binders?", "a": ""},
            {"q": "What are flavor enhancers?", "a": ""},
        ],
    },
    {
        "section": "III. Types of Additives Used in Dairy Animals",
        "category": "dairy",
        "qas": [
            {"q": "What are rumen modifiers?", "a": ""},
            {"q": "How does yeast improve dairy performance?", "a": ""},
            {"q": "What are buffers and how do they help cows?", "a": ""},
            {"q": "What are fat supplements?", "a": ""},
            {"q": "What role do amino acid supplements play in dairy?", "a": ""},
            {"q": "How are vitamins & minerals different in dairy additives?", "a": ""},
            {"q": "What are antioxidants used for in dairy feeds?", "a": ""},
            {"q": "What are ionophores?", "a": ""},
            {"q": "What are methane inhibitors?", "a": ""},
            {"q": "What are probiotics in dairy feeds?", "a": ""},
            {"q": "How do enzymes benefit dairy digestion?", "a": ""},
            {"q": "What are selenium and vitamin E used for?", "a": ""},
            {"q": "What is CLA (conjugated linoleic acid)?", "a": ""},
            {"q": "What are mycotoxin adsorbents in dairy feeds?", "a": ""},
            {"q": "What are pellet binders?", "a": ""},
        ],
    },
    {
        "section": "IV. Application & Dosage Questions",
        "category": "general",
        "qas": [
            {"q": "How are additives mixed into feeds?", "a": ""},
            {"q": "Should additives be given every day?", "a": ""},
            {"q": "Can additives be overused?", "a": ""},
            {"q": "How is correct dosage determined?", "a": ""},
            {"q": "Can additives be added to water?", "a": ""},
            {"q": "When should probiotics be administered?", "a": ""},
            {"q": "Are additives given differently during heat stress?", "a": ""},
            {"q": "Do calves and heifers need the same additives?", "a": ""},
            {"q": "Do layers need different additives from broilers?", "a": ""},
            {"q": "Should additives change between seasons?", "a": ""},
        ],
    },
    {
        "section": "V. Merits (Benefits) of Feed Additives",
        "category": "general",
        "qas": [
            {"q": "Do additives improve growth rate?", "a": ""},
            {"q": "Can additives improve milk yield?", "a": ""},
            {"q": "Do they improve feed conversion ratio (FCR)?", "a": ""},
            {"q": "Do additives increase immunity?", "a": ""},
            {"q": "Can they reduce disease outbreaks?", "a": ""},
            {"q": "Do additives reduce mortality?", "a": ""},
            {"q": "Can additives decrease antibiotic use?", "a": ""},
            {"q": "Do additives improve egg quality?", "a": ""},
            {"q": "Do additives improve milk quality?", "a": ""},
            {"q": "Can feed additives reduce methane emissions?", "a": ""},
            {"q": "Do probiotics stabilize gut health?", "a": ""},
            {"q": "Do enzymes reduce feed cost?", "a": ""},
            {"q": "Can additives improve reproductive performance?", "a": ""},
            {"q": "Do additives improve nutrient absorption?", "a": ""},
            {"q": "Can additives reduce environmental waste?", "a": ""},
        ],
    },
    {
        "section": "VI. Demerits & Risks of Feed Additives",
        "category": "general",
        "qas": [
            {"q": "Can misuse cause toxicity?", "a": ""},
            {"q": "Do additives increase production costs?", "a": ""},
            {"q": "Are there withdrawal period issues?", "a": ""},
            {"q": "Can additives leave residues in milk/meat/eggs?", "a": ""},
            {"q": "Do some additives cause feed refusal?", "a": ""},
            {"q": "Can antibiotics in feed lead to resistance?", "a": ""},
            {"q": "Are probiotics always effective?", "a": ""},
            {"q": "Can additives affect gut microflora negatively?", "a": ""},
            {"q": "Can additives interact with drugs/vaccines?", "a": ""},
            {"q": "Are there side effects at high doses?", "a": ""},
            {"q": "Do some additives lose potency in heat/humidity?", "a": ""},
            {"q": "Can additives mask poor nutrition?", "a": ""},
            {"q": "Can additives cause allergic reactions?", "a": ""},
            {"q": "Are some additives banned internationally?", "a": ""},
            {"q": "Do additives require specialized storage?", "a": ""},
        ],
    },
    {
        "section": "VII. Safety, Quality, & Monitoring",
        "category": "general",
        "qas": [
            {"q": "How to verify quality of feed additives?", "a": ""},
            {"q": "Are there standard tests for additive effectiveness?", "a": ""},
            {"q": "Who monitors additive safety in India?", "a": ""},
            {"q": "What are safe storage practices?", "a": ""},
            {"q": "How are expired additives handled?", "a": ""},
            {"q": "Can farmers mix additives on-farm?", "a": ""},
            {"q": "Should veterinarians recommend additives?", "a": ""},
            {"q": "How to report adverse effects?", "a": ""},
            {"q": "Are certifications required for additive producers?", "a": ""},
            {"q": "Do additives need withdrawal periods before harvest/slaughter?", "a": ""},
        ],
    },
    {
        "section": "VIII. Economic & Practical Questions",
        "category": "general",
        "qas": [
            {"q": "Do additives reduce overall feed cost?", "a": ""},
            {"q": "Are commercial additives expensive?", "a": ""},
            {"q": "Can small farmers afford additives?", "a": ""},
            {"q": "Do additives increase profitability?", "a": ""},
            {"q": "Are government subsidies available for additives?", "a": ""},
            {"q": "Can feed additives improve sustainability?", "a": ""},
            {"q": "Are there cooperative models for purchasing additives?", "a": ""},
            {"q": "Does training affect additive usage success?", "a": ""},
            {"q": "Are additives necessary in all production systems?", "a": ""},
            {"q": "Should feed additive programs be customized per farm?", "a": ""},
        ],
    },
]


# ── FAQ Set 2: Feed Hygiene FAQs ──────────────────────────────────────────────

FEED_HYGIENE_FAQS: list[dict] = [
    {
        "section": "I. Fundamentals of Feed Hygiene",
        "category": "general",
        "qas": [
            {"q": "How can dirty feed quietly infect a whole flock or herd over time?", "a": ""},
            {"q": "Which toxin is more prominent in India?", "a": ""},
            {"q": "What are the permissible levels of aflatoxin in dairy and poultry feed?", "a": ""},
            {"q": "How do toxins affect the performance of the animals?", "a": ""},
            {"q": "What is worse for a farm: one big disease outbreak or long-term low-level feed contamination, and why?", "a": ""},
            {"q": "How can poor feed hygiene in mills, silos, and sheds waste money spent on genetics, vaccines, and good nutrition?", "a": ""},
            {"q": "What is the difference between feed that looks clean and feed that is really microbiologically clean?", "a": ""},
            {"q": "How is feed hygiene linked to One Health, joining animal health, food safety, and public health?", "a": ""},
            {"q": "What common wrong beliefs do farmers and millers have about feed hygiene that should be corrected?", "a": ""},
            {"q": "How can poor feed hygiene cancel the benefits of high-energy diets or precise amino acid balancing?", "a": ""},
            {"q": "How does poor feed hygiene affect animal performance?", "a": ""},
            {"q": "What are the economic losses associated with contaminated feed?", "a": ""},
            {"q": "How does feed hygiene influence FCR and weight gain?", "a": ""},
            {"q": "What is the difference between feed safety and feed hygiene?", "a": ""},
            {"q": "What are the main biological contaminants in feed?", "a": ""},
            {"q": "What are the chemical contaminants in feed?", "a": ""},
            {"q": "How does moisture affect feed stability?", "a": ""},
            {"q": "What is safe moisture level in poultry feed?", "a": ""},
            {"q": "Why is water activity (aw) critical in feed preservation?", "a": ""},
        ],
    },
    {
        "section": "II. Salmonella & Pathogen Control",
        "category": "general",
        "qas": [
            {"q": "How does Salmonella enter feed mills?", "a": ""},
            {"q": "What are high-risk raw materials for Salmonella?", "a": ""},
            {"q": "How does contaminated feed affect poultry farms?", "a": ""},
            {"q": "What is vertical vs horizontal transmission?", "a": ""},
            {"q": "How do organic acids control Salmonella?", "a": ""},
            {"q": "What is acidification of feed?", "a": ""},
            {"q": "How effective is formic acid in pathogen control?", "a": ""},
            {"q": "What is the role of buffered organic acids?", "a": ""},
            {"q": "Can pelleting kill Salmonella completely?", "a": ""},
            {"q": "What is post-pellet contamination?", "a": ""},
            {"q": "How to sanitize feed bins?", "a": ""},
            {"q": "What is biofilm and how does it form in feed mills?", "a": ""},
            {"q": "How to break biofilm in silos?", "a": ""},
            {"q": "What is environmental monitoring for Salmonella?", "a": ""},
            {"q": "How often should a feed mill test for pathogens?", "a": ""},
            {"q": "How does eating Salmonella-contaminated feed change gut microbes and gut barrier function in poultry?", "a": ""},
            {"q": "How do enteric pathogens cause dysbiosis and poor nutrient absorption in monogastric animals?", "a": ""},
            {"q": "How does chronic subclinical infection from dirty feed show up in ADG and FCR data?", "a": ""},
            {"q": "Why is gut health central to welfare, productivity, and disease resilience?", "a": ""},
            {"q": "How can clean feed help reduce in-feed antibiotic use and support antimicrobial stewardship?", "a": ""},
            {"q": "How does pathogen-contaminated feed increase performance variation between birds or cows in the same group?", "a": ""},
            {"q": "What is the link between gut inflammation and poor feed conversion in high-performance poultry?", "a": ""},
            {"q": "How do feed-borne pathogens interfere with the benefits of probiotics, prebiotics, and enzymes?", "a": ""},
            {"q": "How can better feed hygiene lower veterinary and medicine costs over a cycle?", "a": ""},
            {"q": "Why is early-life feed hygiene so important for lifetime gut health and performance?", "a": ""},
            {"q": "When you see wet litter and footpad lesions in broilers, how might feed contamination be part of the cause?", "a": ""},
        ],
    },
    {
        "section": "III. Mold & Fungal Management",
        "category": "general",
        "qas": [
            {"q": "What causes mold growth in stored grains?", "a": ""},
            {"q": "What are visible signs of fungal contamination?", "a": ""},
            {"q": "What is the role of propionic acid in mold control?", "a": ""},
            {"q": "How do mold inhibitors work?", "a": ""},
            {"q": "What is the difference between a preservative and a sanitizer?", "a": ""},
            {"q": "What are the common storage fungi?", "a": ""},
            {"q": "How does humidity influence fungal growth?", "a": ""},
            {"q": "What is the critical moisture level for mold growth?", "a": ""},
            {"q": "Can mold growth occur without visible signs?", "a": ""},
            {"q": "How to prevent fungal growth in monsoon season?", "a": ""},
            {"q": "I am using a toxin binder at 1 kg/ton. Whether it controls pathogens?", "a": ""},
            {"q": "There are no visible signs of mold or fungus. Should I use a mold inhibitor?", "a": ""},
            {"q": "Will it be toxic if a mold inhibitor is used in higher concentration?", "a": ""},
        ],
    },
    {
        "section": "IV. Silage Hygiene",
        "category": "dairy",
        "qas": [
            {"q": "What is good quality silage?", "a": ""},
            {"q": "What is ideal dry matter for maize silage?", "a": ""},
            {"q": "What is aerobic spoilage?", "a": ""},
            {"q": "How do yeast cause silage heating?", "a": ""},
            {"q": "What are silage inoculants?", "a": ""},
            {"q": "How does pH influence silage quality?", "a": ""},
            {"q": "What is the role of lactic acid bacteria?", "a": ""},
            {"q": "What is butyric acid fermentation?", "a": ""},
            {"q": "How to prevent mold growth in silage bunkers?", "a": ""},
            {"q": "How does poor silage affect milk yield?", "a": ""},
            {"q": "How do poor aeration and condensation in silos promote mold growth and mycotoxin formation?", "a": ""},
            {"q": "Why is it important to separate old feed from new feed and avoid fines and crust buildup in bins?", "a": ""},
            {"q": "How often should silos and bins be cleaned, and which cleaning methods work best?", "a": ""},
            {"q": "How do plastic bags and floor-level storage on small farms increase aflatoxin risk?", "a": ""},
            {"q": "Why does long-term storage of concentrates without moisture control sharply increase aflatoxin risk?", "a": ""},
            {"q": "How can simple storage changes (raised platforms, pallets, airflow) reduce aflatoxin problems?", "a": ""},
            {"q": "Which early warning signs (smell, caking, hot spots) point to feed spoilage?", "a": ""},
            {"q": "How does feed dust around mills and silos affect both hygiene and worker lung health?", "a": ""},
            {"q": "What is the role of routine sampling and testing at mill and farm gate for mycotoxins and pathogens?", "a": ""},
            {"q": "How can training feed handlers and staff change the overall risk of contamination and residues?", "a": ""},
        ],
    },
    {
        "section": "V. Feed Mill and Farm Hygiene & Sanitation",
        "category": "general",
        "qas": [
            {"q": "What is feed mill biosecurity?", "a": ""},
            {"q": "What are critical control points in feed manufacturing?", "a": ""},
            {"q": "How to design a feed mill sanitation protocol?", "a": ""},
            {"q": "What is dry cleaning vs wet cleaning in feed mills?", "a": ""},
            {"q": "How to control cross-contamination?", "a": ""},
            {"q": "How do dust, fines, and rework in feed mills increase microbial carryover and cross-contamination?", "a": ""},
            {"q": "How does pelleting cut microbial load, and why is contamination after pelleting still a big risk?", "a": ""},
            {"q": "What is flushing in feed mills?", "a": ""},
            {"q": "How to validate cleaning effectiveness?", "a": ""},
            {"q": "What is GMP in feed industry?", "a": ""},
            {"q": "What is HACCP in feed manufacturing?", "a": ""},
            {"q": "How to control rodent contamination in feed mills?", "a": ""},
            {"q": "How can dirty conveyors, coolers, and finished-feed bins act as long-term pathogen reservoirs?", "a": ""},
            {"q": "Why are farm silos and on-farm bins often the weakest point in feed hygiene?", "a": ""},
            {"q": "How do biofilms in feed equipment make pathogen control tougher and more persistent?", "a": ""},
            {"q": "What role do rodents, insects, and birds play in bringing and spreading pathogens in feed and storage areas?", "a": ""},
            {"q": "How can poor water quality and drinker systems, together with dirty feed, increase disease pressure?", "a": ""},
            {"q": "Why must feed hygiene be linked with other biosecurity steps like entry control and litter management?", "a": ""},
            {"q": "How do different housing systems (cages, deep litter, loose housing) change the risk of feed-borne pathogens?", "a": ""},
        ],
    },
    {
        "section": "VI. Moisture & Storage Management",
        "category": "general",
        "qas": [
            {"q": "What is safe storage moisture for maize?", "a": ""},
            {"q": "How to measure grain moisture?", "a": ""},
            {"q": "What is a water activity meter?", "a": ""},
            {"q": "How does condensation form in silos?", "a": ""},
            {"q": "What is silo sweating?", "a": ""},
            {"q": "How to prevent caking in mineral mixtures?", "a": ""},
            {"q": "What is FIFO in feed storage?", "a": ""},
            {"q": "How long can finished feed be stored?", "a": ""},
            {"q": "What are risks of long-term storage?", "a": ""},
            {"q": "How does temperature affect feed shelf life?", "a": ""},
            {"q": "How does moisture influence microbial proliferation?", "a": ""},
        ],
    },
    {
        "section": "VII. Mycotoxins",
        "category": "general",
        "qas": [
            {"q": "What are mycotoxins?", "a": ""},
            {"q": "Which fungi produce aflatoxins?", "a": ""},
            {"q": "In tropical and South Asian diets, which raw materials carry the highest aflatoxin risk, and why?", "a": ""},
            {"q": "How do heat and humidity in storage speed up mold growth and aflatoxin formation in feed?", "a": ""},
            {"q": "What early signs of aflatoxicosis can you see in poultry and dairy cattle on farm?", "a": ""},
            {"q": "How does long-term low-level aflatoxin exposure differ from a short high-dose exposure for performance and liver health?", "a": ""},
            {"q": "Why are young birds and high-yielding dairy cows more sensitive to aflatoxin in feed?", "a": ""},
            {"q": "How is aflatoxin B1 in feed changed into aflatoxin M1 in milk, and what does this mean for milk safety?", "a": ""},
            {"q": "What are the usual legal limits for aflatoxin in feed and milk, and how often do real samples cross these limits?", "a": ""},
            {"q": "How does a mix of toxins (like aflatoxin plus fumonisin or DON) make risk assessment and control harder?", "a": ""},
            {"q": "Why is just looking at grains and feed not enough to judge aflatoxin risk?", "a": ""},
            {"q": "What is the difference between aflatoxin B1 and M1?", "a": ""},
            {"q": "How does aflatoxin affect poultry liver?", "a": ""},
            {"q": "What are the symptoms of mycotoxicosis in dairy cattle?", "a": ""},
            {"q": "What is DON (vomitoxin) and how does it affect pigs?", "a": ""},
            {"q": "What is Zearalenone and how does it impact reproduction?", "a": ""},
            {"q": "How does T2 toxin affect immunity?", "a": ""},
            {"q": "Can multiple mycotoxins occur together in feed?", "a": ""},
            {"q": "What is masked mycotoxin?", "a": ""},
            {"q": "How can climate change increase mycotoxin risk?", "a": ""},
            {"q": "What is the safe limit of aflatoxin in poultry feed?", "a": ""},
            {"q": "How do we test feed for mycotoxins?", "a": ""},
            {"q": "What is the difference between ELISA and HPLC for toxin testing?", "a": ""},
            {"q": "What are broad-spectrum toxin binders?", "a": ""},
            {"q": "How do toxin binders work?", "a": ""},
            {"q": "What is the difference between adsorption and biotransformation?", "a": ""},
            {"q": "Can toxin binders affect nutrient absorption?", "a": ""},
            {"q": "How to select the right toxin binder?", "a": ""},
            {"q": "When should toxin binder dosage be increased?", "a": ""},
            {"q": "What is the maximum dose of toxin binder?", "a": ""},
            {"q": "Will it cause toxicity if used at a higher concentration?", "a": ""},
            {"q": "How do aflatoxins reduce feed intake and feed efficiency in broilers and layers before clear disease shows up?", "a": ""},
            {"q": "In dairy cows, how does aflatoxin exposure affect milk yield, milk quality, and metabolic stress?", "a": ""},
            {"q": "How does aflatoxin exposure increase the risk of common infections in farm animals?", "a": ""},
            {"q": "How do aflatoxins damage the liver, and why is the liver central in aflatoxicosis?", "a": ""},
            {"q": "Which subtle production changes (FCR, egg shell quality, fertility, etc.) can signal hidden mycotoxin problems?", "a": ""},
            {"q": "Why can two farms using the same feed show very different responses to aflatoxin?", "a": ""},
            {"q": "How does aflatoxin-driven immunosuppression affect vaccine response and disease outbreaks in poultry?", "a": ""},
            {"q": "In ruminants, how do rumen microbes deal with aflatoxins, and what are the limits of this natural protection?", "a": ""},
            {"q": "How can aflatoxin contamination cut farm profits even when mortality stays low?", "a": ""},
            {"q": "What long-term reproductive problems can arise from chronic aflatoxin intake in breeders?", "a": ""},
            {"q": "How does aflatoxin M1 in milk threaten human health, especially children and vulnerable groups?", "a": ""},
            {"q": "Which parts of meat animals are most likely to contain mycotoxin residues, and what does this mean for food safety?", "a": ""},
            {"q": "How do regulators decide safe limits for aflatoxin residues in milk and meat?", "a": ""},
            {"q": "What is the economic impact when milk or meat is rejected because of aflatoxin residues?", "a": ""},
            {"q": "How can residue problems from feed damage the brand image of integrators and processors?", "a": ""},
            {"q": "Why is regular aflatoxin M1 testing in milk essential in modern dairies?", "a": ""},
            {"q": "How can aflatoxin residues in animal products add up to long-term dietary exposure in humans?", "a": ""},
            {"q": "How do rapid aflatoxin tests on-site help stop contaminated products from reaching consumers?", "a": ""},
            {"q": "How do strict export standards for residues affect feed hygiene needs in exporting countries?", "a": ""},
            {"q": "How does the One Health view turn aflatoxin control into a wider food security and public health issue?", "a": ""},
        ],
    },
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def sections_to_text(sections: list[dict]) -> str:
    lines: list[str] = []
    for sec in sections:
        lines.append(f"\n## {sec['section']}\n")
        for item in sec["qas"]:
            lines.append(f"Q: {item['q']}")
            if item.get("a"):
                lines.append(f"A: {item['a']}")
            lines.append("")
    return "\n".join(lines).strip()


def save_faq_set(name: str, title: str, url: str, sections: list[dict]) -> None:
    """Split sections by category and save as separate JSON files.

    poultry  → <name>_poultry.json   (poultry namespace only)
    dairy    → <name>_dairy.json     (dairy namespace only)
    general  → <name>_general.json   (both namespaces)
    """
    by_category: dict[str, list[dict]] = {"poultry": [], "dairy": [], "general": []}
    for sec in sections:
        by_category[sec["category"]].append(sec)

    for category, cat_sections in by_category.items():
        if not cat_sections:
            continue
        out = {
            "source": "faqs",
            "title": f"{title} [{category}]",
            "url": url,
            "category": category,
            "sections": cat_sections,
            "full_text": sections_to_text(cat_sections),
        }
        path = OUT_DIR / f"{name}_{category}.json"
        path.write_text(json.dumps(out, indent=2, ensure_ascii=False))
        log.info("Saved %s — %d sections, %d chars", path.name, len(cat_sections), len(out["full_text"]))


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    # Clean up any old unsplit files
    for old in OUT_DIR.glob("*.json"):
        old.unlink()
        log.info("Removed old file: %s", old.name)

    save_faq_set(
        name="educational_faqs",
        title="100 FAQs About Animal Feed Additives – Chemlife",
        url="https://chemlifeinnovations.com",
        sections=EDUCATIONAL_FAQS,
    )

    save_faq_set(
        name="feed_hygiene_faqs",
        title="Feed Hygiene FAQ – Chemlife",
        url="https://chemlifeinnovations.com",
        sections=FEED_HYGIENE_FAQS,
    )

    log.info("Done — FAQ files saved to %s", OUT_DIR)


if __name__ == "__main__":
    main()
