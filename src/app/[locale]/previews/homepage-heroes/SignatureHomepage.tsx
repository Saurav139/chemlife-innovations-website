"use client";

import { useRef, useState, type CSSProperties, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useT } from "@/i18n/LocaleProvider";
import { Images } from "@/lib/assets";
import { PRODUCTS, RESEARCH_TOPICS, productAnchor, researchAnchor } from "@/lib/catalog";
import SocialResponsibilities from "@/components/SocialResponsibilities";
import AnbiotFigure from "../AnbiotFigure";
import s from "./signature.module.css";

export type SignatureDesign = "bubbles" | "field-journal" | "living-science";
const groups = [
  { id: "mono", category: "Mono-gastric", label: "Poultry & swine", short: "Poultry", image: Images.gallery.rotate11, alt: "Chickens on a poultry farm", color: "#cf4128", detail: "Nutrition for poultry and swine" },
  { id: "rumi", category: "Ruminants", label: "Dairy & cattle", short: "Dairy", image: Images.gallery.rotate22, alt: "A buffalo and calf on a farm", color: "#138178", detail: "Nutrition for dairy and cattle" },
  { id: "value", category: "Value Addition", label: "Feed & ingredients", short: "Feed", image: Images.research.pellets, alt: "Feed pellets and powdered feed ingredients in bowls", color: "#b37a18", detail: "More from every ingredient" },
] as const;
type Group = "all" | typeof groups[number]["id"];
const countFor = (category: string) => PRODUCTS.filter(product => product.category === category).length;
const accent = (color: string) => ({ "--species-accent": color }) as CSSProperties;
const researchLabels = ["ANBioT", "Green chelation", "Microencapsulation", "Nano trace minerals", "Nature-identical bioactives"];
const processImages = [Images.process.researchImage, Images.process.developmentImage, Images.process.manufacturingImage, Images.process.delivery];

function LeafMark() {
  return <svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M19 79C14 43 40 14 84 15c3 42-19 69-58 63M14 87 79 22M34 65l-3-22m19 7-1-22M46 55l23-1" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function BioactiveOrbit() {
  return <div className={s.orbit}>
    <svg className={s.orbitLines} viewBox="0 0 600 500" fill="none" aria-hidden="true">
      <circle cx="300" cy="250" r="172" stroke="#a8c6c0" strokeDasharray="4 9" />
      <ellipse cx="300" cy="250" rx="225" ry="102" stroke="#c9d9d5" transform="rotate(-25 300 250)" />
      <ellipse cx="300" cy="250" rx="225" ry="102" stroke="#d9dfcf" transform="rotate(35 300 250)" />
      <g className={s.orbitTravel}><circle cx="300" cy="78" r="7" fill="#cf4128" /><circle cx="300" cy="422" r="5" fill="#138178" /></g>
      <path d="m75 340 26-15 26 15v30l-26 15-26-15zm369-221 19-11 19 11v22l-19 11-19-11z" stroke="#adc6bd" strokeWidth="2" />
    </svg>
    <div className={s.orbitCore}><span>Our platform</span><strong>ANBioT</strong><p>Accelerated natural<br />bio-transformation</p><i aria-hidden="true" /></div>
    <div className={`${s.orbitNode} ${s.plantNode}`}><span className={s.leafNode}><LeafMark /></span><strong>Plant bioactives</strong></div>
    <div className={`${s.orbitNode} ${s.deliveryNode}`}><span className={s.capsuleNode}><i /><i /></span><strong>Protected delivery</strong></div>
    <div className={`${s.orbitNode} ${s.nutritionNode}`}><span className={s.nutritionPhoto}><Image src={Images.research.pellets} alt="" fill sizes="96px" /></span><strong>Animal nutrition</strong></div>
    <p className={s.orbitCaption}>Nature-inspired. Science-led.</p>
  </div>;
}

export default function SignatureHomepage({ variant }: { variant: SignatureDesign }) {
  const t = useT();
  const [group, setGroup] = useState<Group>("all");
  const [visible, setVisible] = useState(6);
  const [step, setStep] = useState(0);
  const productSection = useRef<HTMLElement>(null);
  const productHeading = useRef<HTMLHeadingElement>(null);
  const scienceSection = useRef<HTMLElement>(null);
  const scienceHeading = useRef<HTMLHeadingElement>(null);
  const ids = { products: `${variant}-products`, science: `${variant}-research` };
  const category = groups.find(item => item.id === group);
  const journalPhoto = category ?? groups[1];
  const products = PRODUCTS.map((product, index) => ({ ...product, ...t.products.items[index] }));
  const filtered = products.filter(product => !category || product.category === category.category);

  function selectGroup(next: Group) { setGroup(next); setVisible(6); }
  function jump(event: MouseEvent<HTMLAnchorElement>, destination: "products" | "science", next?: Group) {
    event.preventDefault();
    if (next) selectGroup(next);
    const section = destination === "products" ? productSection.current : scienceSection.current;
    const heading = destination === "products" ? productHeading.current : scienceHeading.current;
    section?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    heading?.focus({ preventScroll: true });
  }

  const actions = <div className={s.actions}>
    <Link className={s.button} href="/contact?type=nutritionist">Talk to a nutritionist <span aria-hidden="true">↗</span></Link>
    <a className={s.textLink} href={`#${ids.science}`} onClick={event => jump(event, "science")}>See how ANBioT works <span aria-hidden="true">↗</span></a>
  </div>;

  const finder = <section ref={productSection} id={ids.products} className={s.finder} aria-labelledby={`${ids.products}-title`}>
    <div className={s.wrap}>
      <div className={s.sectionHead}><div><p className={s.eyebrow}>Find your starting point</p><h2 ref={productHeading} tabIndex={-1} id={`${ids.products}-title`}>Different animals.<br />The right approach.</h2></div><p>Browse ChemLife’s range by species, then explore each additive’s formulation, application and presentation.</p></div>
      <div role="group" aria-label="Filter additives by species" className={s.filters}>
        <button type="button" aria-pressed={group === "all"} onClick={() => selectGroup("all")}>All additives <span>{products.length}</span></button>
        {groups.map(item => <button key={item.id} type="button" style={accent(item.color)} aria-pressed={group === item.id} onClick={() => selectGroup(item.id)}>{item.label} <span>{countFor(item.category)}</span></button>)}
      </div>
      <p role="status" className={s.results}>Showing {Math.min(visible, filtered.length)} of {filtered.length} additives{category ? ` for ${category.label.toLowerCase()}` : " across the range"}</p>
      <ul className={s.products}>{filtered.slice(0, visible).map(product => <li key={product.id}>
        <Link href={`/products#${productAnchor(product.name)}`} style={accent(groups.find(item => item.category === product.category)?.color ?? "#305280")}>
          <div className={s.productTop}><span>{product.category}</span><div className={s.productIcon}><Image src={product.icon} alt="" fill sizes="48px" /></div></div>
          <h3>{product.name}</h3><p>{product.tagline}</p><span className={s.productLink}>Explore additive <span aria-hidden="true">↗</span></span>
        </Link>
      </li>)}</ul>
      {visible < filtered.length && <button className={s.more} onClick={() => setVisible(filtered.length)}>Show all {filtered.length} additives <span aria-hidden="true">↓</span></button>}
    </div>
  </section>;

  const science = <section ref={scienceSection} id={ids.science} className={s.science} aria-labelledby={`${ids.science}-title`}>
    <div className={s.wrap}>
      <div className={s.sectionHead}><div><p className={s.eyebrow}>The science behind the feed</p><h2 ref={scienceHeading} tabIndex={-1} id={`${ids.science}-title`}>Natural origins.<br />Precise science.</h2></div><p>Our ANBioT platform connects plant bioactives, biotransformation and protected delivery in functional feed additives.</p></div>
      <div className={s.scienceFigure}><AnbiotFigure embedded /></div>
      <div className={s.platforms}><p>Explore our research platforms</p><ul>{RESEARCH_TOPICS.map((topic, index) => <li key={topic.id}><Link href={`/research#${researchAnchor(topic.englishTitle)}`}><span>0{index + 1}</span>{researchLabels[index]}<span aria-hidden="true">↗</span></Link></li>)}</ul></div>
    </div>
  </section>;

  const process = <section className={s.process} aria-labelledby={`${variant}-process-title`}>
    <div className={s.wrap}>
      <div className={s.sectionHead}><div><p className={s.eyebrow}>Built at ChemLife</p><h2 id={`${variant}-process-title`}>From an idea<br />to animal nutrition.</h2></div><p>A connected process, from the first research question to the finished additive.</p></div>
      <div className={s.processChoices} role="group" aria-label="Explore ChemLife's process">{t.home.howWeDo.steps.map((item, index) => <button key={item.title} type="button" aria-pressed={step === index} aria-controls={`${variant}-process-detail`} onClick={() => setStep(index)}><span>0{index + 1}</span>{item.title}<span aria-hidden="true">↗</span></button>)}</div>
      <div className={s.processDetail} id={`${variant}-process-detail`}>
        <div className={s.processPhoto}><Image src={processImages[step]} alt={t.home.howWeDo.steps[step].alt} fill sizes="(min-width: 768px) 560px, calc(100vw - 40px)" /></div>
        <div className={s.processText}><span>0{step + 1} / 04</span><h3>{t.home.howWeDo.steps[step].title}</h3><p>{t.home.howWeDo.steps[step].description}</p><Link className={s.textLink} href="/about">Meet the people behind the work <span aria-hidden="true">↗</span></Link></div>
      </div>
    </div>
  </section>;

  return <div className={s.root} data-variant={variant}>
    <section className={s.hero} aria-label={`${variant === "bubbles" ? "Brand bubbles" : variant === "field-journal" ? "Field journal" : "Living science"} homepage hero`}>
      <div className={`${s.wrap} ${s.heroGrid}`}>
        <div className={s.heroCopy}>
          <p className={s.eyebrow}>{variant === "field-journal" ? "The ChemLife field journal / 01" : variant === "living-science" ? "At the intersection of nature & science" : "Innovations in bioactives"}</p>
          <h2>{variant === "bubbles" ? <>Nature-driven<br /> <em>functional feed</em><br /> additives.</> : variant === "field-journal" ? <>Better nutrition.<br /> Starts with<br /> <em>nature.</em></> : <>Nurtured by nature.<br /> <em>Refined by science.</em></>}</h2>
          <p className={s.lede}>We develop nature-derived functional feed additives for poultry, dairy and livestock through ANBioT, our accelerated natural biotransformation technology.</p>
          {actions}
          {variant === "living-science" && <div className={s.scienceFootnote}><LeafMark /><span>Plant bioactives. Protected delivery.<br />Practical animal nutrition.</span></div>}
        </div>
        {variant === "bubbles" ? <div className={s.bubbleComposition}>
          <h3>What do you feed?</h3><ul className={s.bubbles} aria-label="Browse additives by animal or ingredient">
            {groups.map((item, index) => <li key={item.id} className={s[`bubble${index}`]} style={accent(item.color)}><a href={`#${ids.products}`} onClick={event => jump(event, "products", item.id)}>
              <span className={s.bubblePhoto}><Image src={item.image} alt={item.alt} fill sizes="(min-width: 768px) 300px, 30vw" priority /></span>
              <span className={s.bubbleLabel}>{item.label}<span>{countFor(item.category)}</span></span>
            </a></li>)}
          </ul>
        </div> : variant === "field-journal" ? <div className={s.journalVisual}>
          <div className={s.journalPhoto} style={accent(journalPhoto.color)}><Image key={journalPhoto.id} src={journalPhoto.image} alt={journalPhoto.alt} fill sizes="(min-width: 768px) 540px, calc(100vw - 40px)" priority /><span className={s.journalStamp}><LeafMark />Nature<br />into nutrition.</span></div>
          <div className={s.journalCaption}><span>In focus / {journalPhoto.short}</span><strong>{journalPhoto.detail}</strong></div>
          <div className={s.journalChoices} role="group" aria-label="Choose a field journal subject">{groups.map(item => <button key={item.id} style={accent(item.color)} type="button" aria-pressed={journalPhoto.id === item.id} onClick={() => selectGroup(item.id)}>{item.label}<span aria-hidden="true">↗</span></button>)}</div>
        </div> : <BioactiveOrbit />}
      </div>
    </section>

    <section className={s.facts} aria-label="ChemLife at a glance"><dl className={s.wrap}>{[
      ["30+", "Years of research"], [String(PRODUCTS.length), "Additives in the range"], ["22+", "Customers served"], ["7+", "Awards won"],
    ].map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>

    {variant === "bubbles" ? <>{finder}{science}{process}</> : variant === "field-journal" ? <>{process}{finder}{science}</> : <>{science}{finder}{process}</>}

    <section className={s.values} aria-labelledby={`${variant}-values-title`}><div className={s.wrap}>
      <div className={s.sectionHead}><div><p className={s.eyebrow}>The principles behind our progress</p><h2 id={`${variant}-values-title`}>Our GIFT<br />to a better tomorrow.</h2></div><p>Four values guide how we think, work and collaborate.</p></div>
      <ol>{([['G', 'green'], ['I', 'innovation'], ['F', 'facts'], ['T', 'trust']] as const).map(([letter, key]) => <li key={key}><span aria-hidden="true">{letter}</span><h3>{t.about.values[key].name}</h3><p>{t.about.values[key].text}</p></li>)}</ol>
    </div></section>

    <section className={s.proof} aria-labelledby={`${variant}-proof-title`}><div className={`${s.wrap} ${s.proofGrid}`}>
      <div><p className={s.eyebrow}>Built through collaboration</p><h2 id={`${variant}-proof-title`}>Good science.<br />Longstanding relationships.</h2><Link className={s.textLink} href="/about">Get to know ChemLife <span aria-hidden="true">↗</span></Link></div>
      <figure><Image src={Images.testimonials.huve} alt="Huvepharma" width={150} height={65} className={s.quoteLogo} /><blockquote>“We are happy with the quality of the product and happy with service support provided by them.”</blockquote><figcaption><strong>Akmal Reyaz</strong><span>Business Head – Dairy & Aqua<br />Huvepharma Sea (Pune) Private Limited</span></figcaption></figure>
    </div></section>
    <SocialResponsibilities id={`${variant}-responsibility`} />
    <section className={s.contact}><div className={`${s.wrap} ${s.contactGrid}`}><div><p className={s.eyebrow}>Let’s find your starting point</p><h2>What’s in<br /><em>your feed?</em></h2></div><div><p>Tell our nutritionists about your animals, your feed and the problem you want to solve.</p><Link className={s.button} href="/contact?type=nutritionist">Talk to a nutritionist <span aria-hidden="true">↗</span></Link><a className={s.contactPhone} href="tel:+919535862570">+91 95358 62570</a></div></div></section>
  </div>;
}
