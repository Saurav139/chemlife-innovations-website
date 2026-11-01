"use client";

import { useState } from "react";
import Image from "next/image";
import { Images, Videos, VideoPosters } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import Icon from "@/components/site/Icon";
import { Reveal, SectionHead, accentSecond } from "@/components/site/ui";

const IMAGES = [VideoPosters.social1, Images.social.image2, Images.social.image3];

/** Social responsibility: three stories, side by side. The first plays its video in place. */
export default function Commitments({ index = "07" }: { index?: string }) {
  const t = useT().home.social;
  const [playing, setPlaying] = useState(false);

  return (
    <section aria-labelledby="social-title" className="paper relative bg-page py-20 md:py-28 lg:py-36">
      <div className="container-site">
        <SectionHead id="social-title" index={index} kicker={t.kicker} title={accentSecond(t.journalTitle)} lead={t.introduction} />
        <ul className="grid md:grid-cols-3 gap-x-8 gap-y-14">
          {t.items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 0.08} className={i === 1 ? "md:mt-20" : ""}>
              <article aria-labelledby={`social-${i}`}>
                <div className={`relative aspect-[4/5] overflow-hidden bg-card-hi ${i === 1 ? "rounded-t-full" : "rounded-[1.75rem]"}`}>
                  {i === 0 && playing
                    ? <video src={Videos.social1} poster={IMAGES[0]} controls autoPlay muted playsInline aria-label={t.imageAlts[0]} className="absolute inset-0 w-full h-full object-cover bg-black" />
                    : <>
                      <Image src={IMAGES[i]} alt={t.imageAlts[i]} fill sizes="(min-width: 768px) 30vw, 100vw" className={i === 1 ? "object-cover object-top" : "object-cover"} />
                      {i === 0 && <button type="button" onClick={() => setPlaying(true)}
                        className="absolute left-5 bottom-5 inline-flex items-center gap-3 rounded-full bg-[#f3eee4] text-[#14243a] pl-2 pr-5 py-2 font-semibold shadow-lg hover:bg-white transition-colors cursor-pointer">
                        <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-orange-aa text-white"><Icon name="play" className="w-4 h-4 ml-0.5" /></span>{t.watchVideo}
                      </button>}
                    </>}
                </div>
                <p className="label-mono text-mint mt-6">{t.categories[i]}</p>
                <h3 id={`social-${i}`} className="font-display text-[1.85rem] leading-tight text-ink mt-3">{t.featureTitles[i]}</h3>
                <p className="text-copy leading-relaxed mt-3">{item.desc}</p>
                <p className="inline-flex items-center gap-2 mt-5 rounded-full border border-flame/50 px-4 py-2 text-flame font-semibold text-sm">
                  <Icon name="check" className="w-4 h-4" strokeWidth={2.2} />{t.proofs[i]}
                </p>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
