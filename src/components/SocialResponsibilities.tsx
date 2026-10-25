"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import SectionWrapper from "./SectionWrapper";
import { Images, VideoPosters } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";

// One photo per activity, in the order of the titles and descriptions in the language file (home.social.items).
// The photos are decorative (alt=""): each card's title and description say what it shows.
const itemPhotos = [
  VideoPosters.social1, // bicycle donation: a frame from the event video
  Images.social.image2, // POSH certification
  Images.social.image3, // cows supported at a goshala
];

const PHOTO_SIZES = "(min-width: 1024px) 320px, (min-width: 768px) 30vw, calc(100vw - 48px)";

export default function SocialResponsibilities() {
  const t = useT().home.social;
  const items = itemPhotos.map((photo, i) => ({ photo, ...t.items[i] }));

  return (
    <SectionWrapper className="py-16 md:py-24 lg:py-32 bg-white border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-teal-aa text-base lg:text-lg font-semibold tracking-widest uppercase">
            {t.kicker}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-brand-navy mt-3 leading-tight">
            {t.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {items.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.1, 0, 1] }}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <Image
                  src={item.photo}
                  alt=""
                  fill
                  sizes={PHOTO_SIZES}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 md:p-6">
                <h3 className="font-heading text-xl font-bold text-brand-navy mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">{item.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
