import type { JsonLdObject } from "@/lib/seo/jsonld";

export function JsonLd({ data }: { data: JsonLdObject }) {
  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialized }} />;
}
