import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import en from "@/i18n/messages/en";
import { englishOnly } from "@/i18n/server";
import { Images } from "@/lib/assets";
import { previewsAllowed } from "@/lib/previews";
import { loadPlatforms, type Platform } from "./content";
import "./v2.css";

export const metadata: Metadata = { title: "Research (preview 2)", robots: { index: false, follow: false } };
const BASE = "/previews/research-v2";

function PlatformCard({ p, featured }: { p: Platform; featured?: boolean }) {
  return (
    <li className={featured ? "rv2-plat rv2-plat-lead" : "rv2-plat"}>
      <a href={`${BASE}/${p.slug}`} aria-labelledby={`plat-${p.slug}`}>
        <span className="rv2-plat-art">
          <Image
            src={p.image}
            alt=""
            fill
            priority={featured}
            sizes={featured ? "(min-width: 900px) 560px, 92vw" : "(min-width: 900px) 540px, 92vw"}
          />
          <span className="rv2-plat-num" aria-hidden="true">0{p.number}</span>
        </span>
        <span className="rv2-plat-text">
          <span className="rv2-eyebrow">{featured ? "The core platform" : `Platform ${p.number}`}</span>
          <span className="rv2-plat-name" id={`plat-${p.slug}`} dangerouslySetInnerHTML={{ __html: p.title }} />
          <span className="rv2-plat-sub" dangerouslySetInnerHTML={{ __html: p.sub }} />
          <span className="rv2-plat-lede" dangerouslySetInnerHTML={{ __html: p.lede }} />
          <span className="rv2-plat-steps" aria-label="How it works, in three steps">
            {p.steps.map((s, i) => (
              <span key={s.title}>
                <b aria-hidden="true">{i + 1}</b>
                <span dangerouslySetInnerHTML={{ __html: s.title }} />
              </span>
            ))}
          </span>
          <span className="rv2-plat-more">Explore {p.short} <span aria-hidden="true">→</span></span>
        </span>
      </a>
    </li>
  );
}

// The Research page, second design: the five platforms on one screen-and-a-half (the core one first, the four built
// around it in a grid), each opening its own page under /previews/research-v2. Staging only, English only.
export default async function ResearchHubV2({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  const platforms = await loadPlatforms();
  const t = en.research;

  return (
    <VariantProvider>
      <Header />
      <main id="main" tabIndex={-1} className="rv2 min-h-screen bg-white">
        <section className="rv2-hero rv2-hub-hero" aria-labelledby="page-title">
          <Image className="rv2-hub-bg" src={Images.research.heroBanner} alt="" fill priority sizes="100vw" />
          <div className="rv2-wrap rv2-hub-hero-in">
            <p className="rv2-kicker">{t.kicker}</p>
            <h1 id="page-title">
              {t.titleStart} <span>{t.titleAccent}</span>
            </h1>
            <p className="rv2-lede">{t.intro}</p>
            <ol className="rv2-jump" aria-label="Research platforms">
              {platforms.map((p) => (
                <li key={p.slug}>
                  <a href={`${BASE}/${p.slug}`}>
                    <b aria-hidden="true">{p.number}</b>
                    {p.short}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rv2-section" aria-labelledby="platforms-title">
          <div className="rv2-wrap">
            <header className="rv2-head">
              <p className="rv2-eyebrow">Five research platforms</p>
              <h2 id="platforms-title">{t.listHeading}</h2>
            </header>
            <ul className="rv2-plats">
              {platforms.map((p, i) => (
                <PlatformCard key={p.slug} p={p} featured={i === 0} />
              ))}
            </ul>
          </div>
        </section>

        <section className="rv2-wrap rv2-cta-wrap" aria-labelledby="cta-title">
          <div className="rv2-cta">
            <div>
              <h2 id="cta-title">{t.ctaTitle}</h2>
              <p>{t.ctaText}</p>
              <div className="rv2-actions">
                <a className="rv2-btn rv2-btn-coral" href="/contact?type=research">{t.ctaButton}</a>
              </div>
            </div>
            <div className="rv2-cta-lines">
              <p>Or reach the research team directly.</p>
              <a href="tel:+919535862570">+91 95358 62570</a>
              <a href="mailto:innovate@chemlifeinnovations.com">innovate@chemlifeinnovations.com</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </VariantProvider>
  );
}
