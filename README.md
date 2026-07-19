# 万象元生文旅 AIGC 案例站

基于 Next.js App Router 的文旅视频案例展示站。首页是一幅连续滚动长卷，包含动态水墨 Hero、横向电影案例画廊、服务能力与合作流程，以及按钮触发的全屏报价咨询面板。

## 本地运行

要求 Node.js 20.9 或更高版本。

```bash
npm install
cp .env.example .env.local
npm run dev
```

访问 `http://localhost:3000`。案例封面通过服务端代理读取私有 OSS；点击案例后，播放器仅为当前选中的分集生成临时视频链接。案例数据存储在 MySQL 中，通过 `/admin` 后台管理，首页始终按需从数据库读取（非静态生成），后台改动会立即反映到首页。

## 环境变量配置

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com

OSS_REGION=oss-cn-guangzhou
OSS_BUCKET=your-private-bucket
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret

MYSQL_URL=mysql://root:your-mysql-password@127.0.0.1:3306/case_site

SESSION_SECRET=change-me-to-a-long-random-string
```

Bucket 中所有对象保持私有。封面通过 `/api/media/image/[...path]` 同源代理并缓存，视频仅在点击播放后由 `/api/media/video-url` 返回 15 分钟签名 URL。AccessKey 只能设置为服务端环境变量，禁止添加 `NEXT_PUBLIC_` 前缀。案例对象前缀为 `case-site/cases/`，后台上传的文件统一存放在 `case-site/cases/uploads/` 目录下。

## 案例管理后台

首次连接一个空的 MySQL 数据库时，应用启动会自动建表、写入默认分类与内置的 11 个案例（`lib/cases/seed-data.ts`），并生成一个随机初始密码（存储为哈希，不落明文）。初始密码会显示在 `/admin/login` 页面上，登录后请在「账号设置」里尽快修改；修改过一次后，登录页就不会再展示初始密码。

登录后可在 `/admin/cases` 增删改案例、拖拽调整展示顺序，`/admin/categories` 管理分类（删除前需先清空该分类下的案例）；新建/编辑表单里封面和视频直传 OSS，视频的横竖屏由浏览器自动识别，上传完成后可直接点击预览播放。删除案例只会删数据库记录，不会删除 OSS 上的原始素材文件。

数据库结构定义在 `lib/db/schema.ts`，迁移文件在 `lib/db/migrations/`，可以用 `npm run db:generate` 基于 schema 重新生成迁移。

## HTTPS 证书自动续签（可选）

如果域名走阿里云 ALB 转发到本应用（ALB 上配置 HTTPS 监听），可以配置 `ALIYUN_ACCESS_KEY_ID`/`ALIYUN_ACCESS_KEY_SECRET`/`ALB_REGION_ID`/`ALB_LISTENER_ID` 四个环境变量（见 `.env.example`），应用启动时会自动向 Let's Encrypt 申请通配符证书（DNS-01，走阿里云云解析）、上传到数字证书管理服务、绑定到 ALB 监听，并按周期（默认 12 小时检查一次）自动续签。证书本身缓存在 MySQL 的 `acme_certificates` 表里，重新部署不会触发重复签发（Let's Encrypt 对同一组域名有每 7 天最多 5 次的限制），只有距离到期不足 30 天时才会真正发起续签。相关代码在 `lib/acme/`，逻辑由 `instrumentation.ts` 在应用启动时触发，不需要额外的容器或脚本。不配置这四个变量时该功能完全不生效，不影响正常部署。

## 验证

```bash
npm test
npm run build
npm start
```

部署前应确认：生产域名已写入 `NEXT_PUBLIC_SITE_URL`；OSS 与 `MYSQL_URL` 均可用；`SESSION_SECRET` 已设置为非默认的长随机值；真实二维码仍可扫描；`/sitemap.xml` 与 `/robots.txt` 返回成功；构建产物 `.next/static` 不包含 OSS 凭证或数据库连接串。
