import type { Metadata } from "next";
import "../globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { QuotePanel } from "@/components/home/quote-panel";
import { siteConfig } from "@/content/site";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";

const sans = Noto_Sans_SC({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Noto_Serif_SC({ subsets: ["latin"], variable: "--font-serif", display: "swap", weight: ["400", "500", "600"] });

export const metadata: Metadata = { metadataBase: new URL(siteConfig.url), title: { default: siteConfig.title, template: `%s｜${siteConfig.name}` }, description: siteConfig.description, icons:{icon:"/brand/logo_tiny.png",apple:"/brand/logo_tiny.png"}, alternates:{canonical:"/"}, openGraph:{type:"website",locale:"zh_CN",siteName:siteConfig.name,title:siteConfig.title,description:siteConfig.description},robots:{index:true,follow:true} };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization={"@context":"https://schema.org","@type":"Organization",name:siteConfig.companyName,url:siteConfig.url,email:siteConfig.email,telephone:siteConfig.phone,address:siteConfig.address,logo:`${siteConfig.url}/brand/logo.png`};
  return <html lang="zh-CN" className={`${sans.variable} ${serif.variable}`}><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organization)}}/><SiteHeader /><main>{children}</main><SiteFooter /><QuotePanel /></body></html>;
}
