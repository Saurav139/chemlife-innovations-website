"use client";

import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";

// Roles and bios are in the language file (about.leaders), in this order.
const LEADERS = [
  { name: "Radhakrishna PM", degree: "Ph.D, PG-Dip in Mgmt", image: Images.people.leaderRadhakrishna },
  { name: "Sharada KC", degree: "Ph.D", image: Images.people.leaderSharada },
  { name: "Sneha R", degree: "M.Com", image: Images.people.leaderSneehaCropped },
  { name: "Shankar CV", degree: "BE, MBA", image: Images.people.leaderShankar },
];

// G.I.F.T., in the order of its letters.
const VALUES = ["green", "innovation", "facts", "trust"] as const;

export default function AboutPage() {
  const t = useT().about;
  const leaders = LEADERS.map((leader, i) => ({ ...leader, ...t.leaders[i] }));

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="overflow-x-clip">
        <PageHero
          title={`${t.titleLine1} ${t.titleLine2}`}
          intro={t.intro}
          image={Images.people.foundersNew}
          imageAlt={t.foundersAlt}
          imagePosition="50% 38%"
          note={t.founders}
        />

        {/* Our Journey: the heading in the left column, the story on the axis */}
        <section id="our-journey" className="section-y scroll-mt-18 md:scroll-mt-20 lg:scroll-mt-24">
          <div className="frame grid lg:grid-cols-12 gap-x-8">
            <Reveal className="lg:col-span-4">
              <h2 className="text-title mb-8">{t.journeyTitle}</h2>
            </Reveal>
            <Reveal order={1} className="lg:col-start-6 lg:col-span-7 space-y-5">
              <p className="text-lead">{t.journeyText}</p>
              <p>{t.journeyText2}</p>
            </Reveal>
          </div>
        </section>

        {/* Our purpose: a navy page with the laboratory beside the vision and mission */}
        <section id="vision-mission" className="field-ink section-y scroll-mt-18 md:scroll-mt-20 lg:scroll-mt-24">
          <div className="frame">
            <SectionHead title={t.purposeTitle} />
            <div className="grid lg:grid-cols-12 gap-x-8 gap-y-10">
              <Reveal className="lg:col-span-5">
                <figure>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={Images.research.researchImage} alt={t.visionPhotoAlt} fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" />
                  </div>
                  <figcaption className="text-small mt-3">{t.visionPhotoLabel}</figcaption>
                </figure>
              </Reveal>
              <div className="lg:col-start-6 lg:col-span-7 space-y-10">
                {[
                  { title: t.visionKicker, text: t.visionText },
                  { title: t.missionKicker, text: t.missionText },
                ].map((statement, i) => (
                  <Reveal key={statement.title} order={i + 1}>
                    <h3 className="text-lead font-bold">{statement.title}</h3>
                    <p className="mt-3">{statement.text}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Leadership team: four portraits, each with its role and experience */}
        <section className="section-y">
          <div className="frame">
            <SectionHead title={t.leadersTitle} />
            <ul className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-12">
              {leaders.map((leader, i) => (
                <Reveal as="li" key={leader.name} order={i}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                    <Image src={leader.image} alt={leader.name} fill sizes="(min-width: 1024px) 270px, 50vw" className="object-cover object-top" />
                  </div>
                  <h3 className="text-lead font-bold mt-5">{leader.name}</h3>
                  <p className="font-semibold mt-1">{leader.role}</p>
                  <p className="text-small text-ink-soft">{leader.degree}</p>
                  <p className="mt-3">{leader.bio}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* G.I.F.T.: each value under its own letter, on the surface tone */}
        <section id="core-values" className="section-y bg-surface scroll-mt-18 md:scroll-mt-20 lg:scroll-mt-24">
          <div className="frame">
            <SectionHead title={t.valuesTitle} />
            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {VALUES.map((key, i) => (
                <Reveal as="li" key={key} order={i}>
                  <span aria-hidden="true" className="block text-display text-accent">{"GIFT"[i]}</span>
                  <h3 className="text-lead font-bold mt-4">{t.values[key].name}</h3>
                  <p className="mt-2">{t.values[key].text}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
