import Image from "next/image";
import type { ReactNode } from "react";

// The first screen of every inner page: a band of one of ChemLife's own photographs, then the page title on the left
// margin and its standfirst hanging from the axis (column 6 of 12). It isn't faded in, so it shows straight away.
// A title over 40 characters (or its longer translation) takes the section size, so it stays on two lines.
export default function PageHero({ title, intro, image, imageAlt = "", imagePosition, note, children }: {
  title: string;
  intro: ReactNode;
  /** The masthead photograph. Pages without one (the legal pages) start with the title. */
  image?: string;
  imageAlt?: string;
  /** CSS object-position, to keep the photo's subject in the band. */
  imagePosition?: string;
  /** A short fact beside the standfirst, in the left column. */
  note?: ReactNode;
  /** The page's actions, under the standfirst. */
  children?: ReactNode;
}) {
  return (
    <section className="pt-18 md:pt-20 lg:pt-24">
      {image && (
        // The page's largest paint, so it loads first.
        <div className="relative h-[36svh] min-h-56 max-h-[28rem] overflow-hidden bg-surface">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover animate-masthead"
            style={imagePosition ? { objectPosition: imagePosition } : undefined}
          />
        </div>
      )}
      <div className="frame grid lg:grid-cols-12 gap-x-8 pt-10 md:pt-14 lg:pt-16">
        <h1 className={`lg:col-span-11 ${title.length > 40 ? "text-title" : "text-display"}`}>{title}</h1>
        <div className="lg:col-start-6 lg:col-span-7 mt-6 md:mt-8">
          <p className="text-lead">{intro}</p>
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
        {note && <div className="lg:col-span-4 lg:row-start-2 mt-6 md:mt-8 lg:pt-1.5 text-small text-ink-soft">{note}</div>}
      </div>
    </section>
  );
}
