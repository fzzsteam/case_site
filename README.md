# 万象元生文旅 AIGC 案例站

基于 Next.js App Router 的文旅视频案例展示站。首页是一幅连续滚动长卷，包含动态水墨 Hero、横向电影案例画廊、服务能力与合作流程，以及按钮触发的全屏报价咨询面板。

## 本地运行

要求 Node.js 20.9 或更高版本。

```bash
npm install
cp .env.example .env.local
npm run dev
```

访问 `http://localhost:3000`。案例封面通过服务端代理读取私有 OSS；点击案例后，播放器仅为当前选中的分集生成临时视频链接。

## OSS 配置

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
OSS_REGION=oss-cn-guangzhou
OSS_BUCKET=your-private-bucket
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
```

Bucket 中所有对象保持私有。封面通过 `/api/media/image/[...path]` 同源代理并缓存，视频仅在点击播放后由 `/api/media/video-url` 返回 15 分钟签名 URL。AccessKey 只能设置为服务端环境变量，禁止添加 `NEXT_PUBLIC_` 前缀。

案例对象前缀为 `case-site/cases/`。配置位于 `content/cases.ts`，一个项目使用一张封面，并可以包含多个分集或横竖屏版本：

```ts
{
  slug: "sudongpo-commerce",
  category: "广告片",
  coverPath: "case-site/cases/苏东坡带货视频/cover.png",
  episodes: [
    { title: "竖屏版", videoPath: "case-site/cases/苏东坡带货视频/case1.mp4", orientation: "portrait" },
    { title: "横屏版", videoPath: "case-site/cases/苏东坡带货视频/case2.mp4", orientation: "landscape" }
  ]
}
```

## 验证

```bash
npm test
npm run build
npm start
```

部署前应确认：生产域名已写入 `NEXT_PUBLIC_SITE_URL`；四个 OSS 变量可用；案例相对路径与 Bucket 对象一致；真实二维码仍可扫描；`/sitemap.xml` 与 `/robots.txt` 返回成功；构建产物 `.next/static` 不包含 OSS 凭证变量值。
