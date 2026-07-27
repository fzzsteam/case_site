import type { Metadata } from "next";
import { AboutSection } from "@/components/about/about-section";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "关于我们",
  description: siteConfig.companyIntro,
  alternates: { canonical: "/about" },
  openGraph: { title: `关于我们｜${siteConfig.name}`, description: siteConfig.companyIntro, url: `${siteConfig.url}/about` },
};

export default function AboutPage() {
  return (
    <>
      <h1 className="sr-only">关于我们｜{siteConfig.name}</h1>
      <AboutSection />
    </>
  );
}
