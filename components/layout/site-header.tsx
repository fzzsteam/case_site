"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [["/", "首页"], ["/cases", "案例"], ["/about", "关于我们"], ["/contact", "联系我们"]];
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><Link className="brand" href="/"><span className="brand-seal">万</span><span>万象元生<small>WANXIANG AIGC</small></span></Link><nav className={open ? "nav open" : "nav"} aria-label="主导航">{links.map(([href,label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}</nav><button className="menu-button" aria-label={open ? "关闭菜单" : "打开菜单"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></header>;
}
