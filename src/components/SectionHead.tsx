import type { ReactNode } from "react";
import Reveal from "./Reveal";

/** A section's opening, the same on every page: its heading on the left margin, and the lead sentence (if any)
 *  hanging from the axis below it. On a colour field both take the field's white. */
export default function SectionHead({ title, lead, id, className = "" }: {
  title: ReactNode;
  lead?: ReactNode;
  /** For aria-labelledby on the section. */
  id?: string;
  className?: string;
}) {
  return (
    <div className={`grid lg:grid-cols-12 gap-x-8 mb-12 md:mb-16 ${className}`}>
      <Reveal className="lg:col-span-9">
        <h2 id={id} className="text-title">{title}</h2>
      </Reveal>
      {lead && (
        <Reveal order={1} className="lg:col-start-6 lg:col-span-7 mt-6 md:mt-8">
          <p className="text-lead">{lead}</p>
        </Reveal>
      )}
    </div>
  );
}
