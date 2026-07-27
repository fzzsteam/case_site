"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CaseStudy } from "@/lib/cases/types";
import { HeroSection } from "./hero-section";
import { CaseTeaserSection } from "./case-teaser-section";
import { AboutSection } from "@/components/about/about-section";

export function HomeExperience({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .to(".hero-mist-front .hero-mist-left", { x: "-48vw", opacity: 0, duration: 2.3 }, 0)
        .to(".hero-mist-front .hero-mist-right", { x: "48vw", opacity: 0, duration: 2.3 }, 0)
        .to(".hero-mist-back .hero-mist-left", { x: "-30vw", opacity: .08, duration: 3 }, .12)
        .to(".hero-mist-back .hero-mist-right", { x: "30vw", opacity: .08, duration: 3 }, .12)
        .from(".origin-back-bridge, .origin-left-pagodas, .origin-left-foreground", { x: "-16vw", duration: 2.1 }, .18)
        .from(".origin-middle-islands, .origin-right-mountain, .origin-right-pavilion", { x: "16vw", duration: 2.1 }, .18)
        .from(".hero-copy > *", { y: 14, stagger: .08, duration: .6 }, "-=1")
      gsap.from(".editorial-case", { y: 50, opacity: 0, stagger: .08, scrollTrigger: { trigger: ".case-editorial-grid", start: "top 78%" } });
    }, root);
    return () => context.revert();
  }, [caseStudies.length]);

  return <div ref={root} className="scroll-story">
    <HeroSection />

    <section id="cases" className="cases-chapter story-chapter">
      <CaseTeaserSection caseStudies={caseStudies} />
    </section>

    <AboutSection />
  </div>;
}
