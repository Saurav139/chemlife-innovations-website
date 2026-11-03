"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Images, Videos, VideoPosters } from "@/lib/assets";
import { productPath } from "@/lib/catalog";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { useReducedMotion } from "framer-motion";
import { useNearViewport } from "@/components/BackgroundVideo";
import { StoryPlayer } from "../homepage-five/kit";
import s from "./taste.module.css";

// The doses printed on each product sheet, in grams per tonne of feed, for the products sold in 25 kg bags with
// one rate (or a range) per tonne. The reckoner below works from these.
const DOSES = [
  { product: "MaxDmold", label: "MaxDmold", min: 25 },
  { product: "SynDmold", label: "SynDmold", min: 50 },
  { product: "MaxDmold Plus", label: "MaxDmold Plus", min: 250 },
  { product: "GroGenie (12% & 60%)", label: "GroGenie 12%", min: 500 },
  { product: "GroGenie (12% & 60%)", label: "GroGenie 60%", min: 100 },
  { product: "EggGenie", label: "EggGenie", min: 500 },
  { product: "MBioWiz Plus", label: "MBioWiz Plus", min: 1000 },
  { product: "MBioWiz TS", label: "MBioWiz TS", min: 1000 },
  { product: "RumiWiz", label: "RumiWiz", min: 1000 },
  { product: "AflaMlock", label: "AflaMlock", min: 1000 },
  { product: "FeedGenie Forte", label: "FeedGenie Forte", min: 1000, max: 2000 },
  { product: "FeedGenie Prime", label: "FeedGenie Prime", min: 1000, max: 2000 },
  { product: "MethioWiz", label: "MethioWiz, in dairy feed", min: 500, max: 2000 },
  { product: "CholiWiz", label: "CholiWiz, in dairy cow feed", min: 750, max: 2000 },
];
const BAG_KG = 25;

// Each partner's own words: the line set large, and what they did with ChemLife beneath it.
const VOICES = [
  { company: "Huvepharma", name: "Akmal Reyaz", role: "Business Head, Dairy & Aqua, Huvepharma Sea (Pune) Private Limited", logo: Images.testimonials.huve,
    quote: "We are happy with the quality of the product and happy with service support provided by them.",
    context: "Specifically with the help of Chemlife Innovations using their proprietary multi-layer microencapsulation technology, we have introduced a novel functionalized feed ingredient for dairy.",
    picture: Images.products.banners.methiowiz, pictureAlt: "MethioWiz, a rumen-protected feed ingredient for dairy" },
  { company: "GROEXL Vet", name: "Dr Manjunatha B P", role: "Chief Executive Officer, GROEXL Vet Private Limited", logo: Images.testimonials.groxel,
    quote: "We are highly satisfied with the quality of Chemlife's Products and Technologies.",
    context: "Chemlife is our Technology partner and Product developer in the field of mold inhibition and toxin management using innovative technology for animal health.",
    picture: Images.products.banners.maxdmold, pictureAlt: "MaxDmold protecting feed grain from mould" },
  { company: "Quadragen", name: "Lakshmikanth Yadav", role: "Managing Director, Quadragen VetHealth Private Limited", logo: Images.testimonials.quadragen,
    quote: "We are pleased with quality and service/support of ChemLife Innovation.",
    context: "We have been able to launch PromoGen (Natural Growth promoter for poultry) and SlimEat (Lean meat inducer for swine) for export market and Bio-trace minerals for poultry for domestic market specifically with the support of Chemlife Innovations using their ANBioT technology.",
    picture: Images.products.banners.minbiozen, pictureAlt: "MinBioZen bio-trace minerals" },
];

const AWARD_YEARS = ["2020–21", "2019", "2021", "2020", "2026"];
const STEP_IMAGES = [Images.process.researchImage, Images.process.developmentImage, Images.process.manufacturingImage, Images.process.delivery];
// What we serve: every group's three photographs, with their sizes, the first one lifted out of the run.
const SERVE = [
  [{ src: Images.gallery.rotate11, w: 960, h: 950 }, { src: Images.gallery.rotate12, w: 1260, h: 980 }, { src: Images.gallery.rotate13, w: 400, h: 400 }],
  [{ src: Images.gallery.rotate21, w: 1280, h: 921 }, { src: Images.gallery.rotate22, w: 1200, h: 800 }, { src: Images.gallery.rotate23, w: 1600, h: 1591 }],
  [{ src: Images.research.pellets, w: 612, h: 408 }, { src: Images.gallery.rotate32, w: 1200, h: 800 }, { src: Images.gallery.rotate33, w: 1280, h: 720 }],
];
const PARTNER_NAMES = Object.values(Images.partnerLogos.names);
const SOCIAL_IMAGES = [VideoPosters.social1, Images.social.image2, Images.social.image3];

/** The team-trip clip: a muted loop that keeps its poster frame, plays only near the screen and never for reduced motion. */
function TripVideo({ active }: { active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active && !reduce) video.play().catch(() => {});
    else video.pause();
  }, [active, reduce]);
  return <video ref={ref} muted loop playsInline preload="none" poster={VideoPosters.trip1} aria-label="The ChemLife team on a trip"><source src={Videos.trip1} type="video/mp4" /></video>;
}

function grams(g: number) {
  return g < 1000 ? `${Math.round(g)} g` : `${Number((g / 1000).toFixed(g < 10000 ? 2 : 1))} kg`;
}

/** The live thing: pick a product and the feed you make, read the dose and the bags. */
function Reckoner() {
  const href = useHref();
  const [pick, setPick] = useState(0);
  const [tonnes, setTonnes] = useState(10);
  const dose = DOSES[pick];
  const t = Number.isFinite(tonnes) && tonnes > 0 ? tonnes : 0;
  const low = dose.min * t;
  const high = (dose.max ?? dose.min) * t;
  const amount = dose.max ? `${grams(low)} to ${grams(high)}` : grams(low);
  const bags = Math.ceil(high / 1000 / BAG_KG);
  const bagText = high / 1000 < BAG_KG ? "part of one 25 kg bag" : `${bags} bags of 25 kg`;
  return <div className={s.reckon}>
    <h3 id="reckon-title">Work out a dose</h3>
    <output className={s.reckonResult} aria-live="polite">
      {t > 0 ? <><span>{amount} for {t} {t === 1 ? "tonne" : "tonnes"}</span><span>of {dose.product.replace(/ \(.*\)/, "")} in your feed: {bagText}.</span></> : <span>Enter the tonnes of feed you make.</span>}
    </output>
    <form className={s.reckonForm} aria-labelledby="reckon-title" onSubmit={(e) => e.preventDefault()}>
      <label>Product
        <select value={pick} onChange={(e) => setPick(Number(e.target.value))}>
          {DOSES.map((d, i) => <option key={d.label} value={i}>{d.label}</option>)}
        </select>
      </label>
      <label>Feed, in tonnes
        <input type="number" inputMode="decimal" min={0.1} step={0.5} value={tonnes} onChange={(e) => setTonnes(parseFloat(e.target.value))} />
      </label>
    </form>
    <p className={s.reckonNote}>
      <span className={s.muted}>The rate printed on the product sheet. Your nutritionist may set another.</span>
      <a className={s.link} href={href(productPath(dose.product))}>{dose.product.replace(/ \(.*\)/, "")} product sheet</a>
    </p>
  </div>;
}

export default function TasteHome() {
  const t = useT();
  const home = t.home;
  const w = home.whoWeAre;
  const href = useHref();
  const root = useRef<HTMLDivElement>(null);
  const [js, setJs] = useState(false);
  const [story, setStory] = useState(false);
  const [voice, setVoice] = useState(0);
  const [lifeRef, near] = useNearViewport<HTMLDivElement>();
  const v = VOICES[voice];

  // Entrances: each part rises once as it comes into view. Without script everything is simply there.
  useEffect(() => {
    setJs(true);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.setAttribute("data-in", ""); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    root.current?.querySelectorAll("[data-reveal], [data-shutter]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const d = (ms: number) => ({ "data-reveal": "", style: { "--d": `${ms}ms` } as React.CSSProperties });

  return <div ref={root} className={`${s.root} ${js ? s.js : ""}`}>
    <div className={s.page}>
      <nav aria-label="Main" className={s.nav}>
        <Link href={href("/")}><Image src={Images.branding.logoHorizontal} alt="ChemLife Innovations" width={653} height={240} priority /></Link>
        <div className={s.navLinks}>
          <Link href={href("/products")}>Products</Link>
          <Link href={href("/research")}>Research</Link>
          <Link href={href("/about")}>About</Link>
          <Link href={href("/careers")}>Careers</Link>
        </div>
        <Link className={s.button} href={href("/contact?type=nutritionist")}>{home.talkToNutritionist}</Link>
      </nav>

      <main id="main" tabIndex={-1}>
        {/* Three prints hung from one rail; the headline under the small one */}
        <header className={`${s.grid} ${s.hero}`}>
          <figure className={`${s.frame} ${s.r11} ${s.heroSmall}`} {...d(200)}>
            <Image src={Images.products.banners.feedgeniePrime} alt="FeedGenie Prime, ChemLife's multi-mycotoxin defence for poultry feed" width={600} height={600} sizes="(min-width: 768px) 15vw, 38vw" priority />
          </figure>
          <figure className={s.heroTall}>
            <div className={`${s.frame} ${s.r34}`} data-shutter="">
              <Image src={Images.heroes.awardsPortrait} alt={home.heroAlt} width={900} height={1200} sizes="(min-width: 768px) 32vw, 72vw" priority className="object-[50%_35%]" />
            </div>
            <figcaption className={s.caption}>ChemLife&rsquo;s founders on stage, receiving an award</figcaption>
          </figure>
          <figure className={s.heroWide} {...d(300)}>
            <div className={`${s.frame} ${s.r1610}`}>
              <Image src={Images.heroes.chicken} alt="Broilers on a poultry farm" width={1050} height={656} sizes="(min-width: 768px) 38vw, 100vw" priority />
            </div>
            <figcaption className={s.caption}>Broilers on a poultry farm</figcaption>
          </figure>
          <div className={s.heroText}>
            <h1>
              <span className={s.line}><span style={{ "--i": 0 } as React.CSSProperties}>Feed additives,</span></span>
              <span className={s.line}><span style={{ "--i": 1 } as React.CSSProperties}>from nature</span></span>
            </h1>
            <p className={s.heroLead} {...d(420)}>{t.meta.home.description}</p>
            <div className={s.heroActions} {...d(480)}>
              <Link className={s.link} href={href("/products")}>{home.findProduct}</Link>
              <button type="button" className={s.link} onClick={() => setStory(true)}>{home.watchStory}</button>
            </div>
          </div>
        </header>

        {/* Who we are: the company's own description holds while its people pass */}
        <section aria-labelledby="who-title" className={s.who}>
          <div className={s.grid}>
            <div className={s.pinText}>
              <h2 id="who-title" className={s.s1} {...d(0)}>{w.kicker}</h2>
              <p {...d(90)}>{w.title}</p>
            </div>
            <div className={s.pinPics}>
              <figure className={`${s.frame} ${s.r45}`} {...d(0)}><Image src={Images.people.founders} alt="Three of ChemLife's directors" width={1024} height={531} sizes="(min-width: 768px) 26vw, 64vw" className="object-[55%_50%]" /></figure>
              <figure className={`${s.frame} ${s.r1610} ${s.drift}`} {...d(0)}><Image src={Images.people.foundersNew} alt={t.about.foundersAlt} width={1600} height={721} sizes="(min-width: 768px) 42vw, 78vw" /></figure>
              <figure className={`${s.frame} ${s.r11}`} {...d(0)}><Image src={Images.heroes.slide87} alt="A chick drinking at a poultry farm drinker" width={1000} height={1000} sizes="(min-width: 768px) 18vw, 52vw" className="object-[40%_50%]" /></figure>
            </div>
          </div>
          <div className={`${s.grid} ${s.whoMore}`}>
            <h3 {...d(0)}>{w.tagline}</h3>
            <div className={s.whoBody}>
              <p {...d(80)}>{w.intro}</p>
              <p className={s.muted} {...d(160)}>{w.leadershipCaption}</p>
              <div className={s.whoActions} {...d(240)}>
                <Link className={s.button} href={href("/products")}>{w.exploreProducts}</Link>
                <Link className={s.link} href={href("/research")}>{w.seeResearch}</Link>
                <Link className={s.link} href={href("/about")}>{w.meetLeadership}</Link>
                <Link className={s.link} href={href("/contact?type=dossier")}>{w.requestDossier}</Link>
              </div>
            </div>
          </div>
        </section>

        {/* The ten facts, as a table pushed right */}
        <section aria-labelledby="facts-title" className={`${s.grid} ${s.facts}`}>
          <h2 id="facts-title" {...d(0)}>ChemLife in<br />ten facts</h2>
          <figure className={`${s.frame} ${s.r45} ${s.factsPic}`} {...d(120)}>
            <Image src={Images.process.howWeDoBg} alt={home.howWeDo.bgAlt} width={800} height={1000} sizes="(min-width: 768px) 30vw, 60vw" />
          </figure>
          <table className={s.factsTable} {...d(80)}>
            <tbody>
              {w.facts.map((f) => <tr key={f.label}><th scope="row">{f.label}</th><td>{f.value}</td></tr>)}
            </tbody>
          </table>
        </section>

        {/* What we serve: a run of frames, one lifted; then the dose reckoner */}
        <section aria-labelledby="serve-title" className={`${s.grid} ${s.serve}`}>
          <div className={s.serveAside}>
            <h2 id="serve-title" {...d(0)}>{w.serveTitle}</h2>
            <Link className={s.link} href={href("/products")} {...d(80)}>{t.products.allProducts}</Link>
            <div className={s.serveNotes}>
              {w.cards.map((card, i) => <p key={card.title} {...d(120 + i * 70)}><strong>{card.title}</strong>{card.description}</p>)}
            </div>
          </div>
          <div className={s.run} role="region" aria-label={w.serveTitle} tabIndex={0}>
            {SERVE.flatMap((group, i) => group.map((img, j) => <figure key={img.src} className={i === 0 && j === 0 ? s.lifted : undefined} {...d((i * 3 + j) * 60)}>
              <div className={`${s.frame} ${s.frameHover}`}><Image src={img.src} alt={w.cards[i].alts[j]} width={img.w} height={img.h} sizes="(min-width: 768px) 40vw, 90vw" /></div>
              <figcaption>{w.cards[i].alts[j]}<span>{w.cards[i].title}</span></figcaption>
            </figure>))}
          </div>
          <Reckoner />
        </section>

        {/* How we do it: four photographs down a diagonal */}
        <section aria-labelledby="how-title" className={`${s.grid} ${s.how}`}>
          <h2 id="how-title" {...d(0)}>How we do it</h2>
          {home.howWeDo.steps.map((step, i) => [
            <figure key={`p${i}`} className={`${s.frame} ${[s.r34, s.r11, s.r1610, s.r45][i]} ${[s.how1, s.how2, s.how3, s.how4][i]}`} {...d(0)}>
              <Image src={STEP_IMAGES[i]} alt={step.alt} width={1200} height={900} sizes="(min-width: 768px) 34vw, 100vw" />
            </figure>,
            <p key={`t${i}`} className={[s.howT1, s.howT2, s.howT3, s.howT4][i]} {...d(90)}><b>{step.title}.</b> {step.description}</p>,
          ])}
        </section>

        {/* Recognised and trusted: plain names in columns */}
        <section aria-labelledby="proof-title" className={`${s.grid} ${s.proof}`}>
          <h2 id="proof-title" {...d(0)}>Recognised<br />and trusted</h2>
          <div className={s.names} {...d(80)}>
            <ul>
              <li className={s.kind}>{home.awards.title}</li>
              {home.awards.items.map((a, i) => <li key={a.title}>{a.title}, {AWARD_YEARS[i]}</li>)}
            </ul>
            <ul>
              <li className={s.kind}>Support and quality</li>
              <li>Technology Development Board, 2023</li>
              <li>FAMI-QS certified</li>
              <li>BIRAC, Government of India</li>
              <li>C-CAMP K-SAP BIO 50</li>
            </ul>
            <ul>
              <li className={s.kind}>{home.partners.title}</li>
              {PARTNER_NAMES.slice(0, 9).map((n) => <li key={n}>{n}</li>)}
            </ul>
            <ul>
              <li className={s.kind} aria-hidden="true">&nbsp;</li>
              {PARTNER_NAMES.slice(9).map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        </section>

        {/* What partners say: their product beside their own words */}
        <section aria-labelledby="voice-title" className={`${s.grid} ${s.voice}`}>
          <h2 id="voice-title" {...d(0)}>What our partners say</h2>
          <figure className={`${s.frame} ${s.r34} ${s.voicePic}`} {...d(60)}>
            <Image key={v.picture} src={v.picture} alt={v.pictureAlt} width={900} height={1200} sizes="(min-width: 768px) 30vw, 72vw" />
          </figure>
          <figure className={s.voiceQuote} {...d(120)}>
            <blockquote id="voice-panel" role="tabpanel" aria-labelledby={`voice-tab-${voice}`}>&ldquo;{v.quote}&rdquo;</blockquote>
            <figcaption><strong>{v.name}</strong><br />{v.role}</figcaption>
            <p className={s.voiceContext}>&ldquo;{v.context}&rdquo;</p>
            <div role="tablist" aria-label={home.partners.kicker} className={s.voiceTabs}>
              {VOICES.map((item, i) => <button key={item.company} id={`voice-tab-${i}`} type="button" role="tab" aria-selected={voice === i} aria-controls="voice-panel"
                className={s.link} onClick={() => setVoice(i)}>{item.company}</button>)}
            </div>
          </figure>
          <figure className={`${s.frame} ${s.r11} ${s.voiceLogo}`} {...d(200)}>
            <Image key={v.logo} src={v.logo} alt={`${v.company} logo`} width={300} height={300} sizes="160px" />
          </figure>
        </section>

        {/* Life at ChemLife, then the commitments: staggered pairs in open ground */}
        <section aria-labelledby="life-title" className={`${s.grid} ${s.life}`}>
          <div className={s.lifeHead}>
            <h2 id="life-title" {...d(0)}>{home.life.title}</h2>
            <ul {...d(80)}>{home.life.points.map((p) => <li key={p}>{p}</li>)}</ul>
            <Link className={s.link} href={href("/careers")} {...d(160)}>{home.life.joinUs}</Link>
          </div>
          <div ref={lifeRef} className={`${s.frame} ${s.r34} ${s.lifeA}`} {...d(0)}>
            <TripVideo active={near} />
          </div>
          <figure className={`${s.frame} ${s.r54} ${s.lifeB}`} {...d(0)}><Image src={VideoPosters.trip2} alt="The ChemLife team on a trip" width={1000} height={800} sizes="(min-width: 768px) 46vw, 84vw" /></figure>
          <figure className={`${s.frame} ${s.r32} ${s.lifeC} ${s.drift}`} {...d(0)}><Image src={VideoPosters.trip3} alt="The ChemLife team on a trip" width={1200} height={800} sizes="(min-width: 768px) 46vw, 56vw" /></figure>

          <div className={s.commitHead}>
            <h2 {...d(0)}>{home.social.journalTitle}</h2>
            <p {...d(80)}>{home.social.introduction}</p>
          </div>
          {home.social.items.map((item, i) => <figure key={item.title} className={[s.commitA, s.commitB, s.commitC][i]} {...d(0)}>
            <div className={`${s.frame} ${[s.r54, s.r34, s.r32][i]}`}><Image src={SOCIAL_IMAGES[i]} alt={home.social.imageAlts[i]} width={1200} height={900} sizes="(min-width: 768px) 46vw, 84vw" /></div>
            <figcaption className={s.story}><strong>{home.social.featureTitles[i]}</strong><span>{item.desc}</span><span className={s.muted}>{home.social.proofs[i]}</span></figcaption>
          </figure>)}
        </section>

        {/* Questions: a wide heading, the questions indented beneath */}
        <section aria-labelledby="faq-title" className={`${s.grid} ${s.faq}`}>
          <h2 id="faq-title" {...d(0)}>Questions, answered</h2>
          <div className={s.faqList}>
            {w.faq.map((item, i) => <details key={item.q} open={i === 0} {...d(i * 70)}>
              <summary>{item.q}<svg width="18" height="11" viewBox="0 0 18 11" aria-hidden="true"><path d="M1 1.5l8 8 8-8" fill="none" stroke="currentColor" strokeWidth="2" /></svg></summary>
              <p>{item.a}</p>
            </details>)}
          </div>
        </section>

        {/* The close: three farm photographs, then the field with the one invitation */}
        <section aria-labelledby="close-title">
          <div className={s.strip}>
            <figure className={s.frame}><Image src={Images.heroes.slide76} alt="A cow and her calf in a pasture" width={1600} height={800} sizes="(min-width: 768px) 34vw, 100vw" /></figure>
            <figure className={s.frame}><Image src={Images.heroes.dairy} alt="Dairy farming" width={1249} height={700} sizes="(min-width: 768px) 34vw, 50vw" /></figure>
            <figure className={s.frame}><Image src={Images.gallery.rotate12} alt={w.cards[0].alts[1]} width={1260} height={980} sizes="(min-width: 768px) 34vw, 50vw" /></figure>
          </div>
          <div className={`${s.grid} ${s.band}`}>
            <h2 id="close-title" {...d(0)}>{t.contact.titleStart} {t.contact.titleAccent} {t.contact.titleEnd}</h2>
            <p className={s.statement} {...d(80)}>
              Have questions about our nature-driven functional feed additives or looking for a distribution partnership? <Link href={href("/contact?type=nutritionist")}>{home.talkToNutritionist}</Link>.
            </p>
            <p className={s.small} {...d(160)}>
              <span><a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}>{CONTACT_PHONE}</a> or <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></span>
              <span>Plot no 18, KIADB Industrial Area, Doddaballapura, Bengaluru</span>
            </p>
          </div>
        </section>
      </main>
    </div>

    {/* The footer is uncovered as the page slides away */}
    <footer className={s.footer}>
      <div className={`${s.grid} ${s.footCols}`}>
        <div><strong>Visit</strong><span>Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Greater Bengaluru 561 203, Karnataka</span></div>
        <div><strong>Pages</strong>
          {[["Products", "/products"], ["Research", "/research"], ["About", "/about"], ["Insights", "/insights"], ["Careers", "/careers"], ["Contact", "/contact"]].map(([label, path]) =>
            <Link key={path} href={href(path)}>{label}</Link>)}
        </div>
        <div><strong>Follow</strong>
          <a href="https://www.linkedin.com/company/chemlifeinnovations" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://www.youtube.com/@chemlifeinnovations2739" target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href="https://www.facebook.com/people/Chemlife-Innovations/100063821717542/" target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
        <div><strong>Talk to us</strong>
          <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}>{CONTACT_PHONE}</a>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </div>
      <div />
      <div>
        <div className={s.wordmark} aria-hidden="true">
          <svg viewBox="0 0 1000 205"><text x="0" y="170" textLength="1000" lengthAdjust="spacingAndGlyphs" fill="currentColor" style={{ fontSize: 238, fontWeight: 700, letterSpacing: "-0.04em" }}>ChemLife</text></svg>
        </div>
        <p className={s.legal}>
          <span>&copy; {new Date().getFullYear()} ChemLife Innovations Pvt Ltd. {t.footer.rights}</span>
          <Link href="/privacy">{t.footer.privacy}</Link>
          <Link href="/terms">{t.footer.terms}</Link>
        </p>
      </div>
    </footer>
    <StoryPlayer open={story} onClose={() => setStory(false)} />
  </div>;
}
