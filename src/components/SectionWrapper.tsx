import { ReactNode } from "react";
import Reveal from "./Reveal";

interface Props {
  children: ReactNode;
  className?: string;
  id?: string;
}

/** A page section that fades in as it scrolls up. Visible from the start if it's already on screen (see Reveal). */
export default function SectionWrapper({ children, className = "", id }: Props) {
  return (
    <Reveal as="section" id={id} className={className}>
      {children}
    </Reveal>
  );
}
