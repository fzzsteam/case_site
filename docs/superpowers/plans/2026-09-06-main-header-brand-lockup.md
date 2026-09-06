# 主站页眉双 Logo 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在主站共享页眉中加入 EDU 站的方直智胜反白 Logo，并以“方直智胜背书 + 万象元生主品牌”的横向组合方式呈现。

**Architecture:** 保留现有单一首页链接，将两个 Logo、分隔线和可读语义封装在同一个 `Link` 内。方直智胜反白资源放入深墨绿色底牌，万象元生继续使用现有主站 Logo；通过独立 CSS 类控制桌面端和移动端尺寸，避免现有 `.brand img` 统一高度规则影响两个 Logo。

**Tech Stack:** Next.js 16、React 19、TypeScript、CSS、Vitest、Testing Library。

---

## 文件边界

- Create: `docs/superpowers/specs/2026-09-06-main-header-brand-lockup-design.md`（已提交，记录品牌层级和视觉决策）
- Create: `docs/superpowers/plans/2026-09-06-main-header-brand-lockup.md`（本实现计划）
- Modify: `components/layout/site-header.tsx`（主站页眉 Logo 组合与无障碍名称）
- Modify: `app/globals.css`（Logo 组合布局、底牌、分隔线和响应式尺寸）
- Modify: `tests/components/site-header.test.tsx`（验证首页链接语义和两个 Logo 资源）

### Task 1: 先更新页眉行为测试

**Files:**
- Modify: `tests/components/site-header.test.tsx`

- [ ] **Step 1: 将测试改为验证双 Logo 组合**

把现有测试改成下面的内容，保留移动菜单、案例链接和“获取方案”断言，同时新增首页链接名称和方直智胜资源断言：

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/layout/site-header";

it("renders the endorsed brand lockup and opens the mobile navigation", () => {
  render(<SiteHeader />);

  const homeLink = screen.getByRole("link", { name: "方直智胜旗下品牌万象元生" });
  expect(homeLink).toHaveAttribute("href", "/");
  expect(homeLink.querySelector('img[src="/edu/fangzhi-zhisheng-lockup.png"]')).toBeTruthy();
  expect(screen.getByAltText("万象元生")).toHaveAttribute("src", "/brand/logo.png");

  fireEvent.click(screen.getByRole("button", { name: "打开菜单" }));

  expect(screen.getByRole("navigation")).toHaveClass("open");
  expect(screen.getByRole("link", { name: "案例" })).toHaveAttribute("href", "/cases");
  expect(screen.getByRole("button", { name: "获取方案" })).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试确认新断言先失败**

Run: `npm test -- tests/components/site-header.test.tsx`

Expected: FAIL，因为当前页眉仍然没有“方直智胜旗下品牌万象元生”的首页链接名称，也没有 `/edu/fangzhi-zhisheng-lockup.png` 图片。

### Task 2: 实现页眉 Logo 组合

**Files:**
- Modify: `components/layout/site-header.tsx`

- [ ] **Step 1: 把单 Logo 首页链接替换为双 Logo 锁定组合**

保留现有导航、菜单状态和报价事件逻辑，把组件改成以下结构：

```tsx
"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [["/", "首页"], ["/cases", "案例"], ["/about", "关于我们"]];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const quote = () => { setOpen(false); window.dispatchEvent(new Event("open-quote")); };

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="方直智胜旗下品牌万象元生">
        <span className="brand-lockup">
          <span className="brand-parent">
            <img src="/edu/fangzhi-zhisheng-lockup.png" alt="" />
          </span>
          <span className="brand-divider" aria-hidden="true" />
          <img className="brand-main-logo" src="/brand/logo.png" alt="万象元生" />
        </span>
      </Link>
      <nav className={open ? "nav open" : "nav"} aria-label="主导航">
        {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <button className="nav-quote" onClick={quote}>获取方案</button>
      </nav>
      <button className="menu-button" aria-label={open ? "关闭菜单" : "打开菜单"} onClick={() => setOpen(!open)}>
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
```

- [ ] **Step 2: 运行页眉测试确认组件结构通过**

Run: `npm test -- tests/components/site-header.test.tsx`

Expected: PASS；Logo 资源、首页链接语义和原有移动菜单行为均通过。

### Task 3: 添加响应式视觉样式

**Files:**
- Modify: `app/globals.css:210-213`

- [ ] **Step 1: 用独立类替换现有统一 Logo 图片规则**

将“Use the supplied raster logo in the header.”下方的样式替换为：

```css
/* Use the supplied raster brand lockup in the header. */
.brand{display:flex;align-items:center;min-width:0}
.brand-lockup{display:flex;align-items:center;gap:16px;min-width:0}
.brand-parent{display:flex;align-items:center;flex:none;height:24px;padding:4px 8px;border-radius:2px;background:var(--ink)}
.brand-parent img{display:block;width:auto;height:16px;max-width:94px;object-fit:contain}
.brand-divider{width:1px;height:28px;background:#b8955188;flex:none}
.brand-main-logo{display:block;width:auto;height:44px;max-width:min(42vw,340px);object-fit:contain}
@media(max-width:720px){
  .brand-lockup{gap:10px}
  .brand-parent{height:20px;padding:3px 6px}
  .brand-parent img{height:14px;max-width:78px}
  .brand-divider{height:22px}
  .brand-main-logo{height:36px;max-width:48vw}
}
```

- [ ] **Step 2: 检查样式没有影响 EDU 页**

Run: `rg -n "brand-lockup|brand-parent|brand-divider|brand-main-logo" components app tests`

Expected: 新类只出现在 `components/layout/site-header.tsx` 和 `app/globals.css`；没有修改 EDU 导航组件或 EDU 样式。

### Task 4: 完成验证并提交实现

**Files:**
- Verify: `components/layout/site-header.tsx`
- Verify: `app/globals.css`
- Verify: `tests/components/site-header.test.tsx`

- [ ] **Step 1: 运行页眉测试和全量测试**

Run: `npm test -- tests/components/site-header.test.tsx`

Expected: PASS。

Run: `npm test`

Expected: 全部测试 PASS。

- [ ] **Step 2: 检查差异和生产构建**

Run: `git diff --check`

Expected: 无空白错误。

Run: `npm run build`

Expected: Next.js 生产构建成功完成。

- [ ] **Step 3: 提交实现，不包含用户未纳入任务的 AGENTS.md**

Run:

```bash
git add components/layout/site-header.tsx app/globals.css tests/components/site-header.test.tsx
git commit -m "feat: add endorsed brand lockup to main header"
```

Expected: 只提交页眉组件、样式和测试三个文件；未跟踪的 `AGENTS.md` 保持不变。

