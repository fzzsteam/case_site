"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { BirdFlock } from "./bird-flock";

export type InkPreset = "converge" | "river" | "unfold" | "reveal";
export function InkLandscape({ preset = "converge", children, compact = false }: { preset?: InkPreset; children: React.ReactNode; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const farX = useTransform(scrollYProgress, [0,1], [0, preset === "river" ? -90 : 20]);
  const nearX = useTransform(scrollYProgress, [0,1], [0, preset === "river" ? 100 : -28]);
  const entrance = reduced ? {} : preset === "unfold" ? { clipPath: ["inset(0 50% 0 50%)", "inset(0 0% 0 0%)"] } : {};
  return <section ref={ref} className={`ink-landscape preset-${preset} ${compact ? "compact" : ""}`} data-motion={reduced ? "reduced" : "full"}>
    <motion.div className="ink-stage" initial={reduced ? false : { opacity: .35 }} animate={{ opacity: 1, ...entrance }} transition={{ duration: 1.8, ease: [.2,.8,.2,1] }}>
      <motion.img className="ink-layer cloud-layer" src="/ink/cloud.png" alt="" aria-hidden="true" animate={reduced ? {} : { x: ["-4%", "4%", "-4%"] }} transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }} />
      <motion.img className="ink-layer far-layer" src="/ink/mou1.png" alt="" aria-hidden="true" style={reduced ? {} : { x: farX }} />
      <motion.img className="ink-layer mid-layer" src="/ink/mou3.png" alt="" aria-hidden="true" style={reduced ? {} : { x: nearX }} />
      <motion.img className="ink-layer left-layer" src="/ink/tree.png" alt="" aria-hidden="true" initial={reduced ? false : { x: "-18%", opacity: .2 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 2.4, ease: [.16,1,.3,1] }} />
      <motion.img className="ink-layer house-layer" src="/ink/house.png" alt="" aria-hidden="true" initial={reduced ? false : { x: "18%", opacity: .2 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 2.4, ease: [.16,1,.3,1] }} />
      {!reduced && <BirdFlock />}
    </motion.div>
    <motion.div className="hero-content" initial={reduced ? false : { opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .55, duration: 1 }}>{children}</motion.div>
    <div className="hero-curve" aria-hidden="true" />
  </section>;
}
