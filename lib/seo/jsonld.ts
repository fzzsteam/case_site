import type { CaseStudy } from "@/lib/cases/types";
import { absoluteSiteUrl } from "./config";
import { siteConfig } from "@/content/site";

export type JsonLdObject = Record<string, unknown>;

export const organizationId = `${siteConfig.url}#organization`;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: siteConfig.name,
    legalName: siteConfig.companyName,
    alternateName: siteConfig.alternateNames,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    logo: {
      "@type": "ImageObject",
      url: absoluteSiteUrl("/brand/logo.png", siteConfig.url),
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "CN",
      addressRegion: "广东省",
      addressLocality: "深圳市",
      streetAddress: siteConfig.address,
    },
    parentOrganization: {
      "@type": "Organization",
      name: "方直科技",
      identifier: {
        "@type": "PropertyValue",
        propertyID: "股票代码",
        value: "300235",
      },
    },
    contactPoint: [{
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: siteConfig.phone,
      email: siteConfig.email,
      availableLanguage: ["zh-CN"],
    }],
    knowsAbout: siteConfig.knowsAbout,
    makesOffer: siteConfig.services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service,
        provider: { "@id": organizationId },
      },
    })),
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}#website`,
    name: siteConfig.name,
    alternateName: siteConfig.alternateNames,
    url: siteConfig.url,
    inLanguage: "zh-CN",
    publisher: { "@id": organizationId },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url?: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: absoluteSiteUrl(item.url, siteConfig.url) } : {}),
    })),
  };
}

export function itemListJsonLd(
  name: string,
  items: Array<{ name: string; url: string; image?: string }>,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteSiteUrl(item.url, siteConfig.url),
      ...(item.image ? { image: absoluteSiteUrl(item.image, siteConfig.url) } : {}),
    })),
  };
}

export function faqPageJsonLd(faqs: Array<{ question: string; answer: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function videoObjectJsonLd({
  caseStudy,
  canonical,
  thumbnail,
  description,
  keywords,
  sourceOrganization,
}: {
  caseStudy: CaseStudy;
  canonical: string;
  thumbnail: string;
  description: string;
  keywords: string[];
  sourceOrganization?: string;
}): JsonLdObject {
  const primaryEpisode = caseStudy.episodes[0];
  const duration = toIsoDuration(primaryEpisode?.durationSeconds ?? null);

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: caseStudy.title,
    description,
    url: canonical,
    thumbnailUrl: [thumbnail],
    uploadDate: caseStudy.createdAt.toISOString(),
    ...(duration ? { duration } : {}),
    creator: { "@id": organizationId },
    publisher: { "@id": organizationId },
    inLanguage: "zh-CN",
    keywords: keywords.join(", "),
    genre: caseStudy.category,
    isFamilyFriendly: true,
    ...(sourceOrganization ? { sourceOrganization: { "@type": "Organization", name: sourceOrganization } } : {}),
  };
}

function toIsoDuration(seconds: number | null): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `PT${minutes}M${remainder}S`;
}
