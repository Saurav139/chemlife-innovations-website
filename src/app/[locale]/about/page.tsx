"use client";

import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import Icon, { type IconName } from "@/components/site/Icon";
import { CtaBand, Eyebrow, Glow, Reveal, Section, SectionTitle, StatRow, twoTone, Accented } from "@/components/site/ui";
import { Images, VideoPosters } from "@/lib/assets";
import { PRODUCTS } from "@/lib/catalog";
import { useHref, useT } from "@/i18n/LocaleProvider";

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

const SOCIAL_IMAGES = [VideoPosters.social1, Images.social.image2, Images.social.image3];

export default function AboutPage() {
  const all = useT();
  const t = all.about;
  const w = all.home.whoWeAre;
  const s = all.home.social;
  const href = useHref();
  const leaders = LEADERS.map((leader, i) => ({ ...leader, ...t.leaders[i] }));
  const stats = all.site.proof.stats.map((stat) => ({ ...stat, value: stat.value.replace("{products}", String(PRODUCTS.length)) }));

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="site-ui bg-page overflow-x-clip">
        {/* The founders, with the company's headline over a glow */}
        <section className="relative overflow-hidden pt-32 md:pt-40 lg:pt-44 pb-16 md:pb-24">
          <Glow />
          <div className="relative container-site text-center">
            <Reveal><Eyebrow icon="users">{all.nav.about}</Eyebrow></Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-heading text-[2.4rem] leading-[1.06] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ink mt-6 max-w-5xl mx-auto">
                <Accented text={twoTone(t.titleLine1, t.titleLine2)} />
              </h1>
            </Reveal>
            <Reveal delay={0.1}><p className="text-copy text-lg md:text-xl mt-6 max-w-3xl mx-auto leading-relaxed">{t.journeyText}</p></Reveal>
            <Reveal delay={0.15} className="relative mt-14 md:mt-20">
              <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border border-line shadow-2xl shadow-ink/10">
                <Image src={Images.people.foundersNew} alt={t.foundersAlt} fill priority sizes="(min-width: 1240px) 1240px, 100vw" className="object-cover object-[50%_40%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#15273f]/80 via-transparent to-transparent" />
                <p className="absolute left-5 bottom-4 md:left-8 md:bottom-6 font-heading text-lg md:text-2xl font-bold text-white">{t.founders}</p>
              </div>
              <div className="hidden md:flex absolute -bottom-7 right-8 gap-3">
                {[{ icon: "shield" as const, text: w.facts[5].value.split(" ")[0] }, { icon: "pin" as const, text: "Doddaballapura, Bengaluru" }, { icon: "award" as const, text: "106 years combined" }].map((chip) =>
                  <span key={chip.text} className="flex items-center gap-2 rounded-full border border-line bg-card/95 backdrop-blur px-4 py-2.5 text-sm font-semibold text-ink shadow-xl shadow-ink/10">
                    <Icon name={chip.icon} className="w-4 h-4 text-flame" />{chip.text}
                  </span>)}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Our journey, beside the numbers */}
        <Section id="our-journey" tone="raised" labelledBy="journey-title">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal>
              <h2 id="journey-title" className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-ink">{t.journeyTitle}</h2>
              <p className="text-ink text-lg leading-relaxed mt-6">{t.journeyText}</p>
              <p className="text-copy leading-relaxed mt-4">{t.journeyText2}</p>
            </Reveal>
            <Reveal delay={0.1} className="rounded-3xl border border-line bg-card/70 p-8 md:p-10"><StatRow wide={2} stats={stats} /></Reveal>
          </div>
        </Section>

        {/* At a glance: the facts from the homepage copy */}
        <Section labelledBy="glance-title">
          <SectionTitle id="glance-title" title={`${w.title.split(":")[0]}: *${w.title.split(":").slice(1).join(":").trim()}*`} lead={w.intro} />
          <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {w.facts.map((fact, i) => <Reveal key={fact.label} delay={(i % 3) * 0.05} className={`rounded-2xl border border-line bg-card/70 p-6 ${fact.label === w.facts[9].label ? "sm:col-span-2 lg:col-span-3" : ""}`}>
              <dt className="text-xs font-bold tracking-widest uppercase text-flame">{fact.label}</dt>
              <dd className="text-ink/90 mt-2 leading-relaxed">{fact.value}</dd>
            </Reveal>)}
          </dl>
        </Section>

        {/* Vision and mission */}
        <Section id="vision-mission" tone="glow" labelledBy="purpose-title">
          <SectionTitle id="purpose-title" title={`*${t.purposeTitle}*`} />
          <div className="grid md:grid-cols-2 gap-5">
            {[{ title: t.visionKicker, text: t.visionText, icon: "eye" as const }, { title: t.missionKicker, text: t.missionText, icon: "target" as const }].map((item, i) =>
              <Reveal key={item.title} delay={i * 0.08} className="rounded-3xl border border-line bg-gradient-to-br from-card-hi to-page-alt p-8 md:p-10">
                <span className="grid place-items-center w-14 h-14 rounded-2xl bg-flame/15 text-flame"><Icon name={item.icon} className="w-7 h-7" /></span>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-ink mt-6">{item.title}</h3>
                <p className="text-copy text-lg leading-relaxed mt-4">{item.text}</p>
              </Reveal>)}
          </div>
        </Section>

        {/* Leadership */}
        <Section tone="raised" labelledBy="leaders-title">
          <SectionTitle id="leaders-title" title={`${t.leadersKicker}: *${t.leadersTitle}*`} lead={w.leadershipCaption} />
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {leaders.map((leader, i) => <Reveal as="li" key={leader.name} delay={i * 0.06} className="group rounded-2xl border border-line bg-card/70 overflow-hidden">
              <div className="relative aspect-[4/5] bg-card-hi">
                <Image src={leader.image} alt={leader.name} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              <div className="p-5 -mt-10 relative">
                <h3 className="font-heading text-xl font-bold text-ink">{leader.name}</h3>
                <p className="text-flame font-semibold mt-1">{leader.role}</p>
                <p className="text-xs text-copy-dim mt-0.5">{leader.degree}</p>
                <p className="text-copy text-[15px] leading-relaxed mt-3">{leader.bio}</p>
              </div>
            </Reveal>)}
          </ul>
        </Section>

        {/* G.I.F.T. values */}
        <Section id="core-values" labelledBy="values-title">
          <SectionTitle id="values-title" title={`${t.valuesKicker}: *${t.valuesTitle}*`} />
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((value, i) => <Reveal as="li" key={value.key} delay={i * 0.06} className="relative overflow-hidden rounded-2xl border border-line bg-card/70 p-7">
              <span aria-hidden="true" className="absolute -right-3 -top-6 font-heading text-[8rem] font-bold leading-none text-ink/5">{"GIFT"[i]}</span>
              <span className="relative grid place-items-center w-12 h-12 rounded-xl bg-mint/12 text-mint"><Icon name={value.icon} className="w-6 h-6" /></span>
              <h3 className="relative font-heading text-xl font-bold text-ink mt-6"><span className="text-flame">{"GIFT"[i]}</span> · {t.values[value.key].name}</h3>
              <p className="relative text-copy leading-relaxed mt-3">{t.values[value.key].text}</p>
            </Reveal>)}
          </ul>
        </Section>

        {/* Social responsibility */}
        <Section tone="raised" labelledBy="social-title">
          <SectionTitle id="social-title" title={`*${s.journalTitle.split(".")[0]}.*${s.journalTitle.split(".").slice(1).join(".")}`} lead={s.introduction} />
          <ul className="grid md:grid-cols-3 gap-5">
            {s.items.map((item, i) => <Reveal as="li" key={item.title} delay={i * 0.06} className="rounded-2xl border border-line bg-card/70 overflow-hidden flex flex-col">
              <div className="relative aspect-[4/3] bg-card-hi">
                <Image src={SOCIAL_IMAGES[i]} alt={s.imageAlts[i]} fill sizes="(min-width: 768px) 400px, 100vw" className={i === 1 ? "object-contain" : "object-cover"} />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs font-bold tracking-widest uppercase text-mint">{s.categories[i]}</p>
                <h3 className="font-heading text-xl font-bold text-ink mt-2">{s.featureTitles[i]}</h3>
                <p className="text-copy leading-relaxed mt-2">{item.desc}</p>
                <p className="mt-auto pt-5 font-semibold text-flame">{s.proofs[i]}</p>
              </div>
            </Reveal>)}
          </ul>
        </Section>

        <CtaBand title={all.site.cta.title} lead={all.site.cta.lead}
          primary={{ label: all.home.talkToNutritionist, href: href("/contact?type=nutritionist") }}
          secondary={{ label: w.requestDossier, href: href("/contact?type=dossier") }} />
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
