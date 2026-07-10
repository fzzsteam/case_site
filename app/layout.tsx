import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = { metadataBase: new URL(siteConfig.url), title: { default: siteConfig.title, template: `%s｜${siteConfig.name}` }, description: siteConfig.description, alternates:{canonical:"/"}, openGraph:{type:"website",locale:"zh_CN",siteName:siteConfig.name,title:siteConfig.title,description:siteConfig.description},robots:{index:true,follow:true} };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization={"@context":"https://schema.org","@type":"Organization",name:siteConfig.name,url:siteConfig.url,email:siteConfig.email,telephone:siteConfig.phone,logo:`${siteConfig.url}/brand/logo.png`};
  return <html lang="zh-CN"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organization)}}/><SiteHeader /><main>{children}</main><SiteFooter /></body></html>;
}
