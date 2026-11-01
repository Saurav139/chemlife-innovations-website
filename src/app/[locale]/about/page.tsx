"use client";

import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import Icon, { type IconName } from "@/components/site/Icon";
import { Counter, Kicker, PageHero, Reveal, SectionHead, Seal } from "@/components/site/ui";
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
const VALUES: { key: "green" | "innovation" | "facts" | "trust"; icon: IconName }[] = [
  { key: "green", icon: "leaf" },
  { key: "innovation", icon: "spark" },
  { key: "facts", icon: "doc" },
  { key: "trust", icon: "shield" },
];

// The same figures as the homepage; their labels are in home.stats.
const STATS = [30, 16, 22, 7];

export default function AboutPage() {
  const all = useT();
  const t = all.about;
  const leaders = LEADERS.map((leader, i) => ({ ...leader, ...t.leaders[i] }));

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="site-ui bg-page overflow-x-clip">
        <PageHero trail={all.nav.about} title={`${t.titleLine1} *${t.titleLine2}*`} lead={t.journeyText}>
          {/* The founders, wide, with the seal pinned to the corner */}
          <Reveal delay={0.15} className="relative mt-14 md:mt-20">
            <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-ink">
              <Image src={Images.people.foundersNew} alt={t.foundersAlt} fill priority sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover object-[50%_40%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#13233a]/70 via-transparent to-transparent" />
              <p className="absolute left-5 bottom-5 md:left-10 md:bottom-8 label-mono text-white flex items-center gap-3"><span className="h-px w-8 bg-white/70" />{t.founders}</p>
            </div>
            <Seal text="Built on science · Driven by purpose · " className="hidden md:grid absolute -top-14 right-10 w-36 h-36 rounded-full bg-page text-ink border border-line">
              <Icon name="leaf" className="w-8 h-8 text-flame" strokeWidth={1.4} />
            </Seal>
          </Reveal>
        </PageHero>

        {/* Our journey */}
        <section id="our-journey" aria-labelledby="journey-title" className="paper relative bg-page pb-20 md:pb-28 lg:pb-36 pt-6">
          <div className="container-site grid lg:grid-cols-12 gap-10 lg:gap-12">
            <Reveal className="lg:col-span-4"><Kicker index="01">{t.journeyTitle}</Kicker>
              <h2 id="journey-title" className="sr-only">{t.journeyTitle}</h2>
            </Reveal>
            <Reveal delay={0.05} className="lg:col-span-8">
              <p className="font-display text-[1.75rem] md:text-[2.4rem] leading-[1.25] tracking-[-0.015em] text-ink">{t.journeyText2}</p>
              <dl className="grid grid-cols-2 md:grid-cols-4 mt-14 border-t border-line">
                {STATS.map((value, i) => (
                  <div key={i} className={`pt-6 pb-2 ${i ? "pl-5 border-l border-line" : ""} ${i === 2 ? "max-md:pl-0 max-md:border-l-0 max-md:border-t max-md:mt-6" : ""} ${i === 3 ? "max-md:border-t max-md:mt-6" : ""}`}>
                    <dt className="label-mono text-copy-dim">{all.home.stats[i]}</dt>
                    <dd className="font-display text-5xl md:text-6xl text-ink mt-3"><Counter value={value} /><span className="text-flame">+</span></dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* Vision and mission */}
        <section id="vision-mission" aria-labelledby="purpose-title" className="theme-dark paper relative bg-page py-20 md:py-28 lg:py-36 overflow-hidden">
          <div className="container-site">
            <SectionHead id="purpose-title" index="02" kicker={t.purposeTitle} title={t.missionTitle.replace(/(\S+\s+\S+?)\.?$/, "*$1.*")} />
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-12 items-start">
              <Reveal className="lg:col-span-5 relative">
                <div className="relative aspect-[4/5] rounded-t-full overflow-hidden bg-card">
                  <Image src={Images.research.researchImage} alt={t.visionPhotoAlt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                </div>
                <p className="label-mono text-copy-dim mt-5 flex items-center gap-3"><span className="h-px w-8 bg-current opacity-50" />{t.visionPhotoLabel}</p>
              </Reveal>
              <div className="lg:col-span-7 space-y-14">
                {[{ kicker: t.visionKicker, text: t.visionText, icon: "eye" as const }, { kicker: t.missionKicker, text: t.missionText, icon: "target" as const }].map((item, i) => (
                  <Reveal key={item.kicker} delay={i * 0.1} className="border-t border-line pt-8">
                    <div className="flex items-center gap-4">
                      <span className="grid place-items-center w-12 h-12 rounded-full border border-flame text-flame"><Icon name={item.icon} className="w-5 h-5" /></span>
                      <h3 className="label-mono text-ink">{item.kicker}</h3>
                    </div>
                    <p className="font-display text-2xl md:text-[2rem] leading-[1.35] text-ink mt-7">{item.text}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section aria-labelledby="leaders-title" className="paper relative bg-page py-20 md:py-28 lg:py-36">
          <div className="container-site">
            <SectionHead id="leaders-title" index="03" kicker={t.leadersKicker} title={`*${t.leadersTitle}*`} lead={all.home.whoWeAre.leadershipCaption} />
            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
              {leaders.map((leader, i) => (
                <Reveal as="li" key={leader.name} delay={i * 0.08} className={`group ${i % 2 ? "lg:mt-16" : ""}`}>
                  <div className="relative aspect-[3/4] rounded-t-full overflow-hidden bg-card-hi">
                    <Image src={leader.image} alt={leader.name} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" className="object-cover object-top grayscale-[0.35] group-hover:grayscale-0 group-hover:scale-[1.03] transition-[filter,transform] duration-700" />
                  </div>
                  <p className="label-mono text-flame mt-6">{leader.role}</p>
                  <h3 className="font-display text-3xl text-ink mt-2">{leader.name}</h3>
                  <p className="label-mono text-copy-dim mt-1 normal-case tracking-normal text-[13px]">{leader.degree}</p>
                  <p className="text-copy leading-relaxed mt-4 border-t border-line pt-4">{leader.bio}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* G.I.F.T. values: one large letter for each */}
        <section id="core-values" aria-labelledby="values-title" className="paper relative bg-page-alt py-20 md:py-28 lg:py-36">
          <div className="container-site">
            <SectionHead id="values-title" index="04" kicker={t.valuesKicker} title={`${t.valuesTitle.replace(/(\S+)$/, "*$1*")} — G.I.F.T.`} />
            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-ink">
              {VALUES.map((value, i) => (
                <Reveal as="li" key={value.key} delay={i * 0.08} className={`group relative py-10 sm:px-6 lg:px-8 border-b border-line lg:border-b-0 ${i ? "lg:border-l" : ""} ${i % 2 ? "sm:border-l" : ""} border-line`}>
                  <span aria-hidden="true" className="block font-display text-[8rem] md:text-[10rem] leading-[0.8] text-transparent [-webkit-text-stroke:1.5px_var(--color-flame)] group-hover:text-flame transition-colors duration-500">{"GIFT"[i]}</span>
                  <div className="flex items-center gap-3 mt-8">
                    <Icon name={value.icon} className="w-5 h-5 text-mint" />
                    <h3 className="font-display text-2xl text-ink"><span className="sr-only">{"GIFT"[i]}: </span>{t.values[value.key].name}</h3>
                  </div>
                  <p className="text-copy leading-relaxed mt-3">{t.values[value.key].text}</p>
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
