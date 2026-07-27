"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [["/", "首页"], ["/cases", "案例"], ["/about", "关于我们"]];
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const quote = () => { setOpen(false); window.dispatchEvent(new Event("open-quote")); };
  return <header className="site-header"><Link className="brand" href="/"><img src="/brand/logo.png" alt="万象元生" /></Link><nav className={open ? "nav open" : "nav"} aria-label="主导航">{links.map(([href,label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}<button className="nav-quote" onClick={quote}>获取方案</button></nav><button className="menu-button" aria-label={open ? "关闭菜单" : "打开菜单"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></header>;
}
