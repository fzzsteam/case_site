# 万象元生文旅 AIGC 案例站

基于 Next.js App Router 的文旅视频案例展示站，包含四套水墨分层动效、案例详情 SEO、基础报价和私有阿里云 OSS 媒体访问。

## 本地运行

要求 Node.js 20.9 或更高版本。

```bash
npm install
cp .env.example .env.local
npm run dev
```

访问 `http://localhost:3000`。未配置 OSS 时页面和本地水墨动效正常展示，私有案例封面使用水墨占位，点击视频会显示可重试的不可用状态。

## OSS 配置

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
OSS_REGION=oss-cn-guangzhou
OSS_BUCKET=your-private-bucket
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
```

Bucket 中所有对象保持私有。封面通过 `/api/media/image/[...path]` 同源代理并缓存，视频仅在点击播放后由 `/api/media/video-url` 返回 15 分钟签名 URL。AccessKey 只能设置为服务端环境变量，禁止添加 `NEXT_PUBLIC_` 前缀。

允许的对象前缀为 `cases/` 和 `brand/`。案例配置位于 `content/cases.ts`：

```ts
{
  slug: "nanyang-museum",
  coverPath: "cases/nanyang/cover.webp",
  videoPath: "cases/nanyang/film.mp4"
}
```

## 验证

```bash
npm test
npm run build
npm start
```

部署前应确认：生产域名已写入 `NEXT_PUBLIC_SITE_URL`；四个 OSS 变量可用；案例相对路径与 Bucket 对象一致；真实二维码仍可扫描；`/sitemap.xml` 与 `/robots.txt` 返回成功；构建产物 `.next/static` 不包含 OSS 凭证变量值。
