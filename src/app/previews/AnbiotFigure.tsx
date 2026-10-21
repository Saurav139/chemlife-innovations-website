"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import s from "./anbiot.module.css";

// Draw delay (--d) and duration (--t) for each animated part.
const at = (d: string, t?: string) => ({ "--d": d, ...(t ? { "--t": t } : {}) }) as CSSProperties;
const draw = s.draw;

/** "How ANBioT works" figure from the landscape homepage design, shown on the staging Design previews page. */
export default function AnbiotFigure() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "in" | "alive">("idle");
  const timer = useRef<number | undefined>(undefined);

  const play = useCallback(() => {
    window.clearTimeout(timer.current);
    setPhase("idle");
    // Restart on the next frame so the CSS animations run again from the start.
    requestAnimationFrame(() => {
      setPhase("in");
      timer.current = window.setTimeout(() => setPhase("alive"), 4300);
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect();
        play();
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer.current);
    };
  }, [play]);

  const state = phase === "idle" ? "" : phase === "in" ? s.in : `${s.in} ${s.alive}`;

  return (
    <div ref={ref} className={state}>
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-brand-navy">How ANBioT works</h2>
          <p className="text-brand-navy/70 mt-1 text-[15px]">The animated figure from the landscape homepage design.</p>
        </div>
        <button
          type="button"
          onClick={play}
          className="shrink-0 rounded-full border-2 border-brand-navy/20 px-4 py-1.5 text-sm font-semibold text-brand-navy hover:border-brand-orange hover:text-brand-orange"
        >
          Replay
        </button>
      </div>

      <figure className={s.figure}>
        <svg className={s.fig} viewBox="0 0 1200 290" role="img" aria-label="A plant leaf becomes a bioactive molecule, which becomes a multi-layer encapsulated feed additive">
          <g className={`${s.line} ${s.leaf}`}>
            <path className={draw} pathLength={1} style={at(".1s", "1.1s")} d="M118 222C106 150 156 84 286 66 282 172 214 230 118 222Z" />
            <path className={draw} pathLength={1} style={at(".45s", ".9s")} d="M96 246 118 222C164 178 220 124 286 66" />
            <path className={draw} pathLength={1} style={at(".8s", ".5s")} d="M146 196C141 176 143 158 153 142" />
            <path className={draw} pathLength={1} style={at(".85s", ".5s")} d="M176 170C173 150 179 130 192 114" />
            <path className={draw} pathLength={1} style={at(".9s", ".5s")} d="M210 140C210 122 218 106 232 94" />
            <path className={draw} pathLength={1} style={at(".8s", ".5s")} d="M152 192C172 197 190 196 208 188" />
            <path className={draw} pathLength={1} style={at(".85s", ".5s")} d="M184 164C204 167 222 164 238 154" />
            <path className={draw} pathLength={1} style={at(".9s", ".5s")} d="M218 134C236 134 252 128 264 118" />
          </g>
          <path className={`${s.line} ${s.flow} ${draw}`} pathLength={1} style={at("1.15s", ".8s")} d="M304 150C356 150 376 112 418 112S468 150 500 150" />
          <g className={s.molSpin}>
            <g className={`${s.line} ${s.mol}`}>
              <path className={draw} pathLength={1} style={at("1.75s", ".8s")} d="M558 100 601.3 125V175L558 200 514.7 175V125Z" />
              <path className={draw} pathLength={1} style={at("1.95s", ".7s")} d="M601.3 125 644.6 100 687.9 125V175L644.6 200 601.3 175" />
              <circle className={draw} pathLength={1} style={at("2.2s", ".6s")} cx="558" cy="150" r="29" />
              <path className={draw} pathLength={1} style={at("2.3s", ".4s")} d="M647.1 110.7 677.4 128.2M677.4 171.8 647.1 189.3" />
              <path className={draw} pathLength={1} style={at("2.35s", ".4s")} d="M558 100V70M514.7 175 489 190M687.9 125 715.6 109 740 123M640.6 202V230M648.6 202V230" />
            </g>
            <g className={s.atom}>
              <circle className={s.pop} style={at("2.6s")} cx="558" cy="62" r="7" />
              <circle className={s.pop} style={at("2.65s")} cx="482" cy="194" r="7" />
              <circle className={s.pop} style={at("2.7s")} cx="747" cy="127" r="7" />
              <circle className={s.pop} style={at("2.75s")} cx="644.6" cy="238" r="7" />
            </g>
          </g>
          <path className={`${s.line} ${s.flow} ${draw}`} pathLength={1} style={at("2.7s", ".8s")} d="M700 150C742 150 762 188 804 188S868 150 908 150" />
          <g>
            <circle className={`${s.ring} ${s.shell} ${s.grow}`} style={at("3.25s")} cx="1000" cy="150" r="80" />
            <circle className={`${s.ring} ${s.layer} ${s.grow}`} style={at("3.15s")} cx="1000" cy="150" r="61" />
            <circle className={`${s.ring} ${s.layer} ${s.grow}`} style={at("3.05s")} cx="1000" cy="150" r="43" />
            <circle className={`${s.core} ${s.grow}`} style={at("2.95s")} cx="1000" cy="150" r="24" />
          </g>
        </svg>
        <figcaption className={s.steps}>
          <div style={at("1s")}><strong>Plant bioactives</strong><span>Phytochemicals drawn from Ayurvedic botanicals</span></div>
          <div style={at("2.5s")}><strong>ANBioT</strong><span>Accelerated natural bio-transformation</span></div>
          <div style={at("3.5s")}><strong>Functional additive</strong><span>Multi-layer encapsulation for targeted release</span></div>
        </figcaption>

        {/* Phones: the three stages stacked, without the drawing animation. */}
        <ol className={s.mobile}>
          <li>
            <svg viewBox="86 56 210 200" aria-hidden="true">
              <g className={s.mLine} stroke="#14a08f" strokeWidth="6">
                <path d="M118 222C106 150 156 84 286 66 282 172 214 230 118 222Z" />
                <path d="M96 246 118 222C164 178 220 124 286 66" />
                <path d="M146 196C141 176 143 158 153 142M176 170C173 150 179 130 192 114M210 140C210 122 218 106 232 94M152 192C172 197 190 196 208 188M184 164C204 167 222 164 238 154M218 134C236 134 252 128 264 118" />
              </g>
            </svg>
            <div><strong>Plant bioactives</strong><span>Phytochemicals drawn from Ayurvedic botanicals</span></div>
          </li>
          <li>
            <svg viewBox="470 50 290 200" aria-hidden="true">
              <g className={s.mLine} stroke="#1f3d68" strokeWidth="7">
                <path d="M558 100 601.3 125V175L558 200 514.7 175V125Z" />
                <path d="M601.3 125 644.6 100 687.9 125V175L644.6 200 601.3 175" />
                <circle cx="558" cy="150" r="29" />
                <path d="M647.1 110.7 677.4 128.2M677.4 171.8 647.1 189.3M558 100V70M514.7 175 489 190M687.9 125 715.6 109 740 123M640.6 202V230M648.6 202V230" />
              </g>
              <g fill="#e65c38"><circle cx="558" cy="62" r="11" /><circle cx="482" cy="194" r="11" /><circle cx="747" cy="127" r="11" /><circle cx="644.6" cy="238" r="11" /></g>
            </svg>
            <div><strong>ANBioT</strong><span>Accelerated natural bio-transformation</span></div>
          </li>
          <li>
            <svg viewBox="915 65 170 170" aria-hidden="true">
              <circle cx="1000" cy="150" r="80" fill="none" stroke="#7f95b5" strokeWidth="5" strokeDasharray="4 12" strokeLinecap="round" />
              <circle cx="1000" cy="150" r="61" fill="none" stroke="#e0a020" strokeWidth="5" />
              <circle cx="1000" cy="150" r="43" fill="none" stroke="#e0a020" strokeWidth="5" />
              <circle cx="1000" cy="150" r="24" fill="#e65c38" />
            </svg>
            <div><strong>Functional additive</strong><span>Multi-layer encapsulation for targeted release</span></div>
          </li>
        </ol>
      </figure>
    </div>
  );
}
