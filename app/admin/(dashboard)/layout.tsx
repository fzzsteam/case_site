"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Clapperboard, LogOut, Menu, Settings, Tags, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/cases", label: "案例管理", icon: Clapperboard },
  { href: "/admin/categories", label: "分类管理", icon: Tags },
  { href: "/admin/settings", label: "账号设置", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">案</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">案例管理后台</p>
          <p className="truncate text-xs text-sidebar-foreground/70">Content Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-sidebar-accent text-white" : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white",
              )}
            >
              <Icon size={17} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-white"
        >
          <LogOut size={17} />
          退出登录
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 bg-sidebar md:sticky md:top-0 md:block md:h-screen">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-64 bg-sidebar shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-sm md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="打开菜单"
            className="grid size-9 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Menu size={19} />
          </button>
          <span className="text-sm font-semibold">案例管理后台</span>
          {mobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="关闭菜单"
              className="ml-auto grid size-9 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X size={19} />
            </button>
          )}
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
