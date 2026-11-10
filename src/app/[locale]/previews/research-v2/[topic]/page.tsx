import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { englishOnly } from "@/i18n/server";
import { previewsAllowed } from "@/lib/previews";
import ResearchArticle from "../../research/[topic]/ResearchArticle";
import { loadPlatforms } from "../content";
import SectionNav from "../SectionNav";
import "../v2.css";

type Params = Promise<{ locale: string; topic: string }>;
const BASE = "/previews/research-v2";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { topic } = await params;
  const page = (await loadPlatforms()).find((p) => p.slug === topic);
  return { title: page ? `${page.short} | Research` : "Research", robots: { index: false, follow: false } };
}

const Html = ({ as: Tag = "span", html, ...rest }: { as?: "span" | "p" | "h1" | "h3" | "dt" | "dd"; html: string; className?: string }) => (
  <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />
);

// One research platform's page, second design: the same content and animated figure as /previews/research/<topic>,
// laid out with the platform's picture and key facts up top, a bar to move around the page and between platforms,
// and the steps set under the figure they explain. Staging only, English only.
export default async function ResearchTopicV2({ params }: { params: Params }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  const { topic } = await params;
  const platforms = await loadPlatforms();
  const index = platforms.findIndex((p) => p.slug === topic);
  if (index < 0) notFound();
  const p = platforms[index];
  const prev = platforms[index - 1];
  const next = platforms[index + 1];
  const hasRange = p.products.length > 0 || p.rangeNote !== "";

  const sections = [
    { id: "how", label: "How it works" },
    { id: "why", label: "Why it matters" },
    ...(hasRange ? [{ id: "range", label: "Products" }] : []),
    ...(p.support ? [{ id: "support", label: "Recognition" }] : []),
    { id: "platforms", label: "Other platforms" },
  ];

  return (
    <VariantProvider>
      <Header />
      <main id="main" tabIndex={-1} className="rv2 min-h-screen bg-white">
        <section className="rv2-hero" aria-labelledby="page-title">
          <div className="rv2-wrap rv2-hero-grid">
            <div className="rv2-hero-text">
              <nav aria-label="Breadcrumb" className="rv2-crumbs">
                <a href={BASE}>Research</a>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{p.short}</span>
              </nav>
              <p className="rv2-kicker">Platform {p.number} of {platforms.length}</p>
              <Html as="h1" html={p.title} />
              <Html as="p" className="rv2-sub" html={p.sub} />
              <Html as="p" className="rv2-lede" html={p.lede} />
              <div className="rv2-actions">
                <a className="rv2-btn rv2-btn-coral" href="/contact?type=research">Request the technical dossier</a>
                <a className="rv2-btn rv2-btn-line" href="#how">See how it works</a>
              </div>
            </div>
            <div className="rv2-hero-art">
              <Image src={p.image} alt="" fill priority sizes="(min-width: 900px) 520px, 92vw" />
            </div>
          </div>
          {p.facts.length > 0 && (
            <div className="rv2-wrap">
              <dl className="rv2-keyfacts">
                {p.facts.slice(0, 3).map((f) => (
                  <div key={f.label}>
                    <Html as="dt" html={f.label} />
                    <Html as="dd" html={f.value} />
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        <SectionNav
          sections={sections}
          number={p.number}
          total={platforms.length}
          prev={prev && { href: `${BASE}/${prev.slug}`, label: prev.short }}
          next={next && { href: `${BASE}/${next.slug}`, label: next.short }}
        />

        <section className="rv2-section rv2-how" id="how" aria-labelledby="how-title">
          <div className="rv2-wrap">
            <header className="rv2-head rv2-head-center">
              <p className="rv2-eyebrow">The process</p>
              <h2 id="how-title">How it works</h2>
              <Html as="p" html={p.howIntro} />
            </header>
            <ResearchArticle html={p.symbols + p.figure} />
            <ol className="rv2-steps">
              {p.steps.map((s, i) => (
                <li key={s.title}>
                  <span className="rv2-step-num" aria-hidden="true">{i + 1}</span>
                  <div>
                    <Html as="h3" html={s.title} />
                    <Html as="p" html={s.text} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rv2-section rv2-why" id="why" aria-labelledby="why-title">
          <div className="rv2-wrap rv2-why-grid">
            <div>
              <header className="rv2-head">
                <p className="rv2-eyebrow">The benefits</p>
                <h2 id="why-title">Why it matters</h2>
              </header>
              <ul className="rv2-benefits">
                {p.benefits.map((b) => (
                  <li key={b.title}>
                    <span className="rv2-icon" aria-hidden="true"><svg><use href={`#${b.icon}`} /></svg></span>
                    <div>
                      <Html as="h3" html={b.title} />
                      <Html as="p" html={b.text} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {p.facts.length > 0 && (
              <aside className="rv2-sheet" aria-labelledby="sheet-title">
                <h2 id="sheet-title">At a glance</h2>
                <dl>
                  {p.facts.map((f) => (
                    <div key={f.label}>
                      <Html as="dt" html={f.label} />
                      <Html as="dd" html={f.value} />
                    </div>
                  ))}
                </dl>
                {p.factsSource && <Html as="p" className="rv2-sheet-src" html={p.factsSource} />}
              </aside>
            )}
          </div>
        </section>

        {hasRange && (
          <section className="rv2-section" id="range" aria-labelledby="range-title">
            <div className="rv2-wrap">
              <header className="rv2-head rv2-head-row">
                <div>
                  <p className="rv2-eyebrow">Built on this platform</p>
                  <h2 id="range-title">In the range</h2>
                </div>
                <a className="rv2-link" href="/products">Browse all 18 additives</a>
              </header>
              {p.products.length > 0 ? (
                <ul className="rv2-products">
                  {p.products.map((product) => (
                    <li key={product.href}>
                      <a href={product.href}>
                        {product.image && (
                          <span className="rv2-product-art">
                            <Image src={product.image} alt="" fill sizes="(min-width: 700px) 260px, 92vw" />
                          </span>
                        )}
                        <span className="rv2-product-text">
                          <Html className="rv2-product-need" html={product.need} />
                          <Html className="rv2-product-name" html={product.name} />
                          <Html className="rv2-product-desc" html={product.desc} />
                          <span className="rv2-product-more">View product <span aria-hidden="true">→</span></span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <Html as="p" className="rv2-range-note" html={p.rangeNote} />
              )}
            </div>
          </section>
        )}

        {p.support && (
          <div className="rv2-wrap rv2-support">
            <div className="rp" dangerouslySetInnerHTML={{ __html: p.support }} />
          </div>
        )}

        <section className="rv2-section rv2-others" id="platforms" aria-labelledby="platforms-title">
          <div className="rv2-wrap">
            <header className="rv2-head rv2-head-row">
              <div>
                <p className="rv2-eyebrow">Keep exploring</p>
                <h2 id="platforms-title">The other platforms</h2>
              </div>
              <a className="rv2-link" href={BASE}>All research</a>
            </header>
            <ul className="rv2-cards">
              {platforms.filter((o) => o.slug !== p.slug).map((o) => (
                <li key={o.slug}>
                  <a href={`${BASE}/${o.slug}`}>
                    <span className="rv2-card-art">
                      <Image src={o.image} alt="" fill sizes="(min-width: 1000px) 280px, (min-width: 600px) 46vw, 120px" />
                    </span>
                    <span className="rv2-card-text">
                      <span className="rv2-card-num">Platform {o.number}</span>
                      <span className="rv2-card-name">{o.short}</span>
                      <Html className="rv2-card-sub" html={o.sub} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rv2-wrap rv2-cta-wrap" aria-labelledby="cta-title">
          <div className="rv2-cta">
            <div>
              <h2 id="cta-title">Want the full technical dossier?</h2>
              <Html as="p" html={p.ctaText} />
              <div className="rv2-actions">
                <a className="rv2-btn rv2-btn-coral" href="/contact?type=research">Request the dossier</a>
                <a className="rv2-btn rv2-btn-line" href="/contact?type=nutritionist">Talk to a nutritionist</a>
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
