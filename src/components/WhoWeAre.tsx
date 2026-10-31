"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/messages/en";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

// Each group's title, description and photo descriptions are in the language file (home.whoWeAre.cards), in this order.
const cardImages = [
  [Images.gallery.rotate11, Images.gallery.rotate12, Images.gallery.rotate13],
  [Images.gallery.rotate21, Images.gallery.rotate22, Images.gallery.rotate23],
  [Images.research.pellets, Images.gallery.rotate32, Images.gallery.rotate33],
];

type Card = Messages["home"]["whoWeAre"]["cards"][number] & { images: { src: string; alt: string }[] };

/** One species group: its photographs crossfading in a tall frame, then its name and what ChemLife makes for it. */
function Group({ card, index, imageIndex }: { card: Card; index: number; imageIndex: number }) {
  const image = card.images[imageIndex % card.images.length];
  return (
    <Reveal order={index + 1} className="flex flex-col">
      <div className="relative aspect-[3/2] md:aspect-[4/5] overflow-hidden bg-surface">
        <AnimatePresence initial={false}>
          <motion.div
            key={image.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1200px) 384px, (min-width: 768px) 33vw, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="pt-6 md:pr-8">
        <h3 className="text-lead font-bold">{card.title}</h3>
        <p className="mt-2">{card.description}</p>
      </div>
    </Reveal>
  );
}

export default function WhoWeAre() {
  const [imageIndex, setImageIndex] = useState(0);
  const t = useT().home.whoWeAre;
  const cards: Card[] = t.cards.map((card, i) => ({
    ...card,
    images: cardImages[i].map((src, j) => ({ src, alt: card.alts[j] })),
  }));

  // A slow change of photograph, like light shifting in a room. It waits while the tab is hidden, and stays on the
  // first photo for visitors who ask for less motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      if (!document.hidden) setImageIndex((prev) => prev + 1);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-y bg-white">
      <div className="frame">
        <SectionHead title={t.title} />
        {/* The three photographs butt together into one band on tablets and up. */}
        <div className="grid gap-y-12 md:grid-cols-3 md:gap-y-0">
          {cards.map((card, i) => (
            <Group key={card.title} card={card} index={i} imageIndex={imageIndex} />
          ))}
        </div>
      </div>
    </section>
  );
}
