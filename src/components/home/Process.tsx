"use client";

import Image from "next/image";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import Icon, { type IconName } from "@/components/site/Icon";
import { Reveal, Section, SectionTitle } from "@/components/site/ui";

const STEP_IMAGES = [Images.process.researchImage, Images.process.developmentImage, Images.process.manufacturingImage, Images.process.delivery];
const RESOURCE_ICONS: IconName[] = ["book", "flask", "spark"];

/** From lab to farm: the four steps, each with its photo. */
export function Process() {
  const t = useT();
  const steps = t.home.howWeDo.steps;
  return <Section tone="raised" labelledBy="process-title">
    <SectionTitle id="process-title" title={t.site.process.title} lead={t.site.process.lead} />
    <ol className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <span aria-hidden="true" className="hidden lg:block absolute left-[12%] right-[12%] top-[7.5rem] h-px bg-gradient-to-r from-mint/0 via-flame/50 to-mint/0" />
      {steps.map((step, i) => <Reveal as="li" key={step.title} delay={i * 0.08} className="relative rounded-2xl border border-line bg-card/70 overflow-hidden">
        <div className="relative aspect-[16/10]">
          <Image src={STEP_IMAGES[i]} alt={step.alt} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
          <span className="absolute left-4 bottom-3 grid place-items-center w-10 h-10 rounded-full bg-brand-orange-aa font-heading font-bold text-white">{i + 1}</span>
        </div>
        <div className="p-5 pt-3">
          <h3 className="font-heading text-lg font-bold text-ink">{step.title}</h3>
          <p className="text-copy text-[15px] leading-relaxed mt-1.5">{step.description}</p>
        </div>
      </Reveal>)}
    </ol>
  </Section>;
}

/** Where to learn more: insights, research and the AI experts. */
export function Resources() {
  const t = useT();
  const r = t.site.resources;
  const href = useHref();
  const links = [href("/insights"), href("/research"), "/chat"];
  return <Section labelledBy="resources-title">
    <SectionTitle id="resources-title" title={r.title} lead={r.lead} />
    <ul className="grid md:grid-cols-3 gap-4">
      {r.cards.map((card, i) => <Reveal as="li" key={card.title} delay={i * 0.06}>
        <a href={links[i]} className="group flex flex-col h-full rounded-2xl border border-line bg-gradient-to-b from-card to-page-alt p-7 hover:border-flame/40 transition-colors">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-mint/12 text-mint"><Icon name={RESOURCE_ICONS[i]} className="w-6 h-6" /></span>
          <h3 className="font-heading text-xl font-bold text-ink mt-6">{card.title}</h3>
          <p className="text-copy leading-relaxed mt-2">{card.text}</p>
          <span className="inline-flex items-center gap-2 font-semibold text-flame mt-auto pt-6">{r.open}<Icon name="arrow" className="w-4 h-4 transition-transform group-hover:translate-x-1" /></span>
        </a>
      </Reveal>)}
    </ul>
  </Section>;
}
