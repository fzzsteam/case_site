# 文旅 AIGC 案例站实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个具备水墨分层动效、私有 OSS 媒体访问、四个营销页面和完整基础 SEO 的文旅 AIGC 视频案例站。

**Architecture:** 使用 Next.js App Router 和服务端组件输出可抓取内容，少量客户端组件负责导航、筛选、弹层和动效。内容来自类型化静态配置；图片经同源服务端代理读取私有 OSS，视频只在用户点击时获取 15 分钟签名 URL。

**Tech Stack:** Next.js 16.2.10、React 19.2.7、TypeScript、Tailwind CSS、Motion 12.42.2、ali-oss 6.23.0、Vitest 4.1.10、Testing Library。

## Global Constraints

- OSS 中封面、分享图和视频全部保持私有，AccessKey 不得进入客户端包或 `NEXT_PUBLIC_*` 变量。
- 页面主体、核心文案、案例详情和报价必须在服务端 HTML 中可读取。
- 视频不自动播放，点击前不生成签名 URL；默认签名有效期为 900 秒。
- 动效支持 `prefers-reduced-motion`，移动端减少位移与鸟群数量。
- 只实现已批准的精简组件，不复刻设计稿中的数据墙和重复卡片。
- 不修改或提交现有未跟踪素材、缓存目录及 `img/logl.png` 删除状态。

---

## 文件结构

- `app/`：布局、四个主页面、案例详情、SEO 文件与媒体 API。
- `components/layout/`：导航和页脚。
- `components/ink/`：水墨场景、鸟群和页面动效预设。
- `components/cases/`：筛选、案例卡片、播放弹层。
- `components/sections/`：服务、能力、流程、报价和联系区块。
- `content/`：站点信息、案例、服务和报价的静态配置。
- `lib/oss/`：私有 OSS 客户端、路径校验、签名与对象流读取。
- `lib/seo/`：metadata 和 JSON-LD 生成器。
- `public/ink/`、`public/brand/`：从现有源素材复制的运行时静态资源。
- `tests/`：单元、组件、路由与 SEO 测试。

### Task 1: Next.js 与测试基线

**Files:**
- Create: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- Create: `tests/setup.ts`, `tests/smoke/home.test.tsx`

**Interfaces:**
- Produces: 可运行的 `npm run dev|build|test` 命令和 `@/*` 路径别名。

- [ ] **Step 1: 写失败的首页冒烟测试**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

it("renders the primary heading", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { level: 1, name: /重新定义文旅表达/ })).toBeInTheDocument();
});
```

- [ ] **Step 2: 创建依赖和脚本并验证测试失败**

Run: `npm install next@16.2.10 react@19.2.7 react-dom@19.2.7 motion@12.42.2 ali-oss@6.23.0 lucide-react zod && npm install -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss vitest@4.1.10 jsdom @vitejs/plugin-react @testing-library/react @testing-library/jest-dom`

Expected: `npm test -- tests/smoke/home.test.tsx` 失败，因为首页尚无目标标题。

- [ ] **Step 3: 实现最小 App Router 页面和全局设计变量**

在 `app/layout.tsx` 定义中文 `lang`、基础 metadata 和字体回退；在 `app/globals.css` 定义 `--paper`、`--ink`、`--jade`、`--gold`；首页先输出唯一 `h1`。

- [ ] **Step 4: 验证并提交**

Run: `npm test -- tests/smoke/home.test.tsx && npm run build`

Expected: 测试通过，Next.js 生产构建成功。

Commit: `git commit -m "chore: scaffold Next.js case site"`

### Task 2: 类型化内容与 SEO 生成器

**Files:**
- Create: `content/site.ts`, `content/cases.ts`, `content/services.ts`, `content/pricing.ts`
- Create: `lib/seo/metadata.ts`, `lib/seo/json-ld.ts`
- Test: `tests/content/cases.test.ts`, `tests/seo/metadata.test.ts`

**Interfaces:**
- Produces: `CaseStudy`, `caseStudies`, `getCaseBySlug(slug)`, `getCaseSlugs()`, `buildPageMetadata(input)`, `buildOrganizationJsonLd()`, `buildVideoJsonLd(caseStudy)`。

- [ ] **Step 1: 写失败测试，固定内容契约**

```ts
expect(getCaseSlugs()).toEqual(expect.arrayContaining(["nanyang-museum"]));
expect(getCaseBySlug("missing")).toBeUndefined();
expect(buildPageMetadata({ title: "案例", path: "/cases", description: "文旅案例" }).alternates?.canonical)
  .toBe("https://example.com/cases");
```

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- tests/content/cases.test.ts tests/seo/metadata.test.ts`

Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现静态配置和纯函数**

`CaseStudy` 必须包含 `slug`、`title`、`summary`、`description`、`category`、`services`、`coverPath`、`videoPath`、`publishedAt`、`featured`。`site.ts` 从 `NEXT_PUBLIC_SITE_URL` 构建绝对站点 URL，但不得包含 OSS 配置。

- [ ] **Step 4: 验证并提交**

Run: `npm test -- tests/content/cases.test.ts tests/seo/metadata.test.ts`

Expected: 全部通过。

Commit: `git commit -m "feat: add typed site content and SEO builders"`

### Task 3: 私有 OSS 媒体网关

**Files:**
- Create: `lib/oss/config.ts`, `lib/oss/path.ts`, `lib/oss/client.ts`, `lib/oss/media.ts`
- Create: `app/api/media/image/[...path]/route.ts`, `app/api/media/video-url/route.ts`
- Create: `.env.example`
- Test: `tests/oss/path.test.ts`, `tests/oss/media.test.ts`, `tests/api/media-routes.test.ts`

**Interfaces:**
- Produces: `validateMediaPath(path: string): string`, `getSignedVideoUrl(path: string, expires?: number): Promise<string>`, `getPrivateImage(path: string): Promise<{body: ReadableStream; contentType: string}>`。

- [ ] **Step 1: 写路径安全测试**

```ts
expect(validateMediaPath("cases/nanyang/cover.webp")).toBe("cases/nanyang/cover.webp");
expect(() => validateMediaPath("../secret")).toThrow("Invalid media path");
expect(() => validateMediaPath("https://host/object")).toThrow("Invalid media path");
```

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- tests/oss/path.test.ts tests/oss/media.test.ts tests/api/media-routes.test.ts`

Expected: FAIL，OSS 模块和路由不存在。

- [ ] **Step 3: 实现服务端客户端与路由**

读取 `OSS_REGION`、`OSS_BUCKET`、`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`；允许前缀仅为 `cases/` 和 `brand/`。图片 GET 路由返回稳定同源内容及 `Cache-Control: public, max-age=3600, s-maxage=86400`；视频 POST 只接受配置中存在的 `videoPath` 并返回 `{ url, expiresAt }`。

- [ ] **Step 4: 验证密钥隔离并提交**

Run: `npm test -- tests/oss tests/api/media-routes.test.ts && npm run build && ! rg "OSS_ACCESS_KEY_SECRET" .next/static`

Expected: 测试、构建和密钥扫描通过。

Commit: `git commit -m "feat: add private OSS media gateway"`

### Task 4: 共享布局与水墨动效系统

**Files:**
- Create: `components/layout/site-header.tsx`, `components/layout/site-footer.tsx`
- Create: `components/ink/ink-landscape.tsx`, `components/ink/bird-flock.tsx`, `components/ink/motion-presets.ts`
- Create: `components/ui/section-heading.tsx`, `components/ui/button-link.tsx`
- Copy: `layer/*.png` to `public/ink/`
- Copy: `img/logo.png`, `img/联系我们.png` to `public/brand/`
- Test: `tests/components/site-header.test.tsx`, `tests/components/ink-landscape.test.tsx`

**Interfaces:**
- Produces: `<InkLandscape preset="converge" | "river" | "unfold" | "reveal">` 和全站布局组件。

- [ ] **Step 1: 写导航与 reduced-motion 测试**

测试四个导航链接均存在、移动菜单可开关；模拟 `prefers-reduced-motion: reduce` 时场景根节点带 `data-motion="reduced"`。

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- tests/components/site-header.test.tsx tests/components/ink-landscape.test.tsx`

Expected: FAIL，组件不存在。

- [ ] **Step 3: 实现图层、鸟群和预设**

使用绝对定位图片和 Motion transform；`converge` 左右合拢，`river` 滚动视差，`unfold` 遮罩展开，`reveal` 云层散开。装饰图 `alt=""`、`aria-hidden="true"`；移动端使用 CSS 媒体查询减少动画幅度。

- [ ] **Step 4: 验证并提交**

Run: `npm test -- tests/components && npm run build`

Expected: 组件测试和构建通过。

Commit: `git commit -m "feat: add shared ink landscape and site layout"`

### Task 5: 案例组件、列表页与详情页

**Files:**
- Create: `components/cases/case-filter.tsx`, `components/cases/case-card.tsx`, `components/cases/case-grid.tsx`, `components/cases/case-dialog.tsx`
- Create: `app/cases/page.tsx`, `app/cases/[slug]/page.tsx`, `app/cases/[slug]/loading.tsx`, `app/cases/[slug]/not-found.tsx`
- Test: `tests/components/case-grid.test.tsx`, `tests/pages/case-detail.test.tsx`

**Interfaces:**
- Consumes: `caseStudies`, `getCaseBySlug`, `buildVideoJsonLd` 和 `/api/media/*`。
- Produces: 可筛选案例列表、按需播放弹层、静态案例详情和 `generateStaticParams()`。

- [ ] **Step 1: 写筛选、弹层和静态参数失败测试**

测试选择“博物馆”后只出现对应案例；点击播放后才调用 `/api/media/video-url`；Escape 关闭弹层并恢复焦点；未知 slug 调用 `notFound()`。

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- tests/components/case-grid.test.tsx tests/pages/case-detail.test.tsx`

Expected: FAIL，组件和页面不存在。

- [ ] **Step 3: 实现案例体验与 SEO**

列表页服务端输出全部案例文字，再由客户端筛选；封面使用 `/api/media/image/${coverPath}`；详情页生成唯一 metadata、canonical、稳定封面 URL 和 `VideoObject` JSON-LD，结构化数据不包含临时视频签名。

- [ ] **Step 4: 验证并提交**

Run: `npm test -- tests/components/case-grid.test.tsx tests/pages/case-detail.test.tsx && npm run build`

Expected: 测试通过，构建输出全部案例静态路径。

Commit: `git commit -m "feat: add SEO-ready case gallery and detail pages"`

### Task 6: 精简首页、关于页与联系报价页

**Files:**
- Modify: `app/page.tsx`
- Create: `app/about/page.tsx`, `app/contact/page.tsx`
- Create: `components/sections/service-grid.tsx`, `components/sections/capability-grid.tsx`, `components/sections/process-timeline.tsx`, `components/sections/pricing-grid.tsx`, `components/sections/contact-panel.tsx`
- Test: `tests/pages/marketing-pages.test.tsx`

**Interfaces:**
- Consumes: 内容配置、`InkLandscape` 和精选 `caseStudies`。
- Produces: 首页、关于页、联系页的完整服务端内容。

- [ ] **Step 1: 写页面内容失败测试**

```tsx
expect(home.getByRole("heading", { level: 1 })).toHaveTextContent("重新定义文旅表达");
expect(about.getByText("需求沟通")).toBeInTheDocument();
expect(contact.getByText("包月 1.5 万起")).toBeInTheDocument();
expect(contact.getByText("全案 3 万起")).toBeInTheDocument();
```

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- tests/pages/marketing-pages.test.tsx`

Expected: FAIL，页面或内容不存在。

- [ ] **Step 3: 实现精简区块**

首页仅包含 Hero、三项服务、精选案例和 CTA；关于页仅包含简介、四项能力、五步流程和 CTA；联系页仅包含 Hero、三档报价、真实二维码、联系方式和“万象元生”落款。各页使用对应动效预设和唯一 metadata。

- [ ] **Step 4: 验证并提交**

Run: `npm test -- tests/pages/marketing-pages.test.tsx && npm run build`

Expected: 测试和构建通过。

Commit: `git commit -m "feat: build focused marketing pages and pricing"`

### Task 7: 全站 SEO 文件与结构化数据

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`
- Test: `tests/seo/routes.test.ts`, `tests/seo/structured-data.test.ts`

**Interfaces:**
- Consumes: `siteConfig`, `getCaseSlugs()`, `buildOrganizationJsonLd()`。
- Produces: `sitemap.xml`、`robots.txt`、全站 Organization JSON-LD 和默认 OG 图。

- [ ] **Step 1: 写 SEO 路由失败测试**

测试 sitemap 包含 `/`、`/cases`、`/about`、`/contact` 和所有 `/cases/:slug`；robots 允许公开页面并屏蔽 `/api/`；Organization JSON-LD 包含品牌、Logo 和联系方式。

- [ ] **Step 2: 运行失败测试**

Run: `npm test -- tests/seo/routes.test.ts tests/seo/structured-data.test.ts`

Expected: FAIL，SEO 路由不存在。

- [ ] **Step 3: 实现并验证 HTML 可抓取性**

在根布局注入序列化后的 Organization JSON-LD；所有页面使用单一 `h1` 和连续标题层级；动态背景不包裹或延迟正文。

- [ ] **Step 4: 验证并提交**

Run: `npm test -- tests/seo && npm run build`

Expected: SEO 测试通过，构建无 metadata 或静态路由错误。

Commit: `git commit -m "feat: add sitemap robots and structured data"`

### Task 8: 性能、文档与最终验收

**Files:**
- Modify: `next.config.ts`, `README.md`
- Create: `tests/integration/site-navigation.test.tsx`, `tests/integration/media-fallback.test.tsx`

**Interfaces:**
- Consumes: 完整站点。
- Produces: 部署配置说明、环境变量文档和非浏览器自动化验收证据。

- [ ] **Step 1: 写站点集成测试**

使用 Testing Library 覆盖四页导航链接、移动菜单、分类筛选、播放请求失败降级、二维码可见、键盘关闭弹层和 reduced-motion。通过 Vitest mock 为 OSS API 返回固定测试响应。

- [ ] **Step 2: 运行用例并记录预期失败**

Run: `npm test -- tests/integration`

Expected: 首次运行暴露尚未满足的组件集成行为，而不是测试环境配置错误。

- [ ] **Step 3: 修复验收问题并补全文档**

README 必须列出 Node 版本、安装/开发/构建命令、全部 OSS 环境变量、相对路径格式、案例配置示例、私有图片代理行为和部署前检查项。优化图层尺寸和加载优先级，保证视频不预加载完整文件。

- [ ] **Step 4: 执行完整验证**

Run: `npm test && npm run build && ! rg "OSS_ACCESS_KEY_SECRET|OSS_ACCESS_KEY_ID" .next/static`

Expected: 单元/组件/集成测试、生产构建和客户端密钥扫描全部通过。

- [ ] **Step 5: 提交**

Commit: `git commit -m "test: verify responsive case site end to end"`
