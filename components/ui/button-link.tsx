import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function ButtonLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) { return <Link className={`button-link ${light ? "light" : ""}`} href={href}>{children}<ArrowUpRight size={17} /></Link>; }
