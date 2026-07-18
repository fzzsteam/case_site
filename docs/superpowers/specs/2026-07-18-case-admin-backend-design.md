# 案例管理后台设计规格

## 目标

为案例站新增一个管理后台，支持对案例（含分集视频）进行增删改，数据实时反映到现有首页案例列表。后台复用现网站已有的 OSS AccessKey/Secret（`lib/oss`），新增 MySQL 作为案例数据的持久化存储，替换掉现在写死在 `content/cases.ts` 里的静态数据。

首版范围内：案例的增删改查、拖拽排序、封面/视频直传 OSS、单管理员密码登录。范围外：多管理员账号体系、操作日志、案例详情独立页面、OSS 文件的后台删除。

## 整体架构

- **数据层**：新增 MySQL 两张表（`cases`、`case_episodes`），用 Drizzle ORM + `mysql2` 驱动访问，`drizzle-kit` 管理 schema/migration。新增环境变量 `MYSQL_HOST`、`MYSQL_PORT`、`MYSQL_USER`、`MYSQL_PASSWORD`、`MYSQL_DATABASE`；本地 `.env.local` 连本地库，线上部署环境连线上库。
- **鉴权**：新增 `ADMIN_PASSWORD`、`SESSION_SECRET` 两个环境变量。`/admin/login` 校验密码后签发一个 HMAC 签名、有效期 7 天的 httpOnly + Secure + SameSite=Lax Cookie（不落库，无需 session 表）。根目录 `middleware.ts` 拦截 `/admin/*` 和 `/api/admin/*`（登录接口除外），Cookie 缺失、签名不合法或已过期则跳转登录页 / 返回 401。Cookie 签名校验只用 Web Crypto（`crypto.subtle`），可以在 Edge 或 Node 运行时都工作。
- **媒体上传**：后台请求 `/api/admin/media/upload-url` 用现有 AK/SK 生成 OSS 预签名 PUT URL（有效期 15 分钟，与现有视频签名一致），浏览器直传文件到 OSS，不经过 Next.js 服务器中转（大文件不占服务器带宽/内存）。所有后台上传的文件统一放在 `case-site/cases/uploads/` 目录下，对象名用随机短 ID + 原始文件名（如 `case-site/cases/uploads/8f3a1c-cover.png`）避免重名覆盖；这个路径落在 `lib/oss/path.ts` 现有的 `case-site/cases/` 允许前缀内，不需要改校验逻辑。上传接口在签名前校验 `kind` 对应的扩展名和 Content-Type 白名单：`kind=cover` 允许 `.png`/`.jpg`/`.jpeg`/`.webp`，`kind=video` 允许 `.mp4`/`.mov`/`.webm`，其余一律拒绝。
- **数据初始化**：应用启动时（`instrumentation.ts` 的 `register()` 钩子，Node.js 运行时下只执行一次）自动连接数据库，检查 `cases` 表是否为空；为空则把当前 `content/cases.ts` 里的 11 个案例数据种入数据库（服务端生成 UUID、按现有数组顺序写入 `sort_order`）。已有数据则跳过。本地和线上环境第一次连上各自的数据库时都会自动完成初始化，不需要手动跑命令。
- **首页数据来源**：`app/page.tsx` 改为异步 Server Component，直接从数据库查询按 `sort_order` 排序的案例列表，作为 props 传给 `HomeExperience`（原来是直接 `import { caseStudies } from "@/content/cases"`，现在改成接收 props），SEO 需要的服务端渲染内容不受影响。`content/cases.ts` 和相关测试（`tests/content/cases.test.ts`、`tests/content/projects.test.ts`）会被移除，替换为针对数据库查询层（`lib/cases/queries.ts`）的测试。

## 数据表结构

```
cases
  id            char(36) primary key   -- 提交表单时服务端生成 UUID
  title         varchar(255) not null
  category      enum('宣传片','广告片','短剧','IP创造') not null
  summary       text not null
  cover_path    varchar(500) not null  -- OSS 相对路径
  sort_order    int not null default 0
  created_at    datetime not null default now()
  updated_at    datetime not null default now() on update now()

case_episodes
  id            char(36) primary key   -- 提交表单时服务端生成 UUID
  case_id       char(36) not null references cases(id) on delete cascade
  video_path    varchar(500) not null  -- OSS 相对路径
  orientation   enum('landscape','portrait') not null  -- 上传时前端自动识别写入
  sort_order    int not null default 0
```

不设 `slug` 字段，案例和分集统一用 UUID 主键标识；分集不设 `title` 字段（现有首页播放弹层未使用分集标题，去掉不影响展示）。

## 后台页面

- `/admin/login`：密码登录表单，登录成功后跳转 `/admin/cases`。
- `/admin/cases`：案例列表 —— 表格形式，含封面缩略图、标题、分类、分集数、更新时间；顶部提供分类筛选 tab 和"新建案例"入口；行首拖拽手柄支持拖拽调整展示顺序（原生 HTML5 drag & drop，不引入额外依赖）；每行提供编辑/删除操作，删除前弹二次确认。案例数量预期较小（十几到几十条），列表不做分页。
- `/admin/cases/new`、`/admin/cases/[id]/edit`：表单页 —— 标题、分类下拉、简介文本框、封面上传（拖拽区 + 上传进度条 + 预览缩略图）、分集列表（可增删多条，每条只需拖拽上传视频文件，上传后本地读取视频宽高自动判定横屏/竖屏并显示小标签，无需手动选择或填标题；支持拖拽调整分集顺序）。表单做基础必填校验，出错时给出行内提示；保存/删除用 toast 反馈结果。

视觉风格采用通用现代中后台样式（左侧导航 + 顶栏 + 内容区数据表格，参考 Vercel/Linear 一类产品克制的中性配色和留白），不做水墨中国风装饰，复用项目已有 Tailwind CSS v4 和 `lucide-react` 图标，不引入额外 UI 组件库。

## API 接口

- `POST /api/admin/login`：`{ password }` → 校验通过签发 Cookie。
- `POST /api/admin/logout`：清除 Cookie。
- `GET /api/admin/cases`：管理列表数据（含分集）。
- `POST /api/admin/cases`：创建案例，请求体含 `title`/`category`/`summary`/`cover_path`/`episodes: [{ video_path, orientation }]`，服务端生成案例和分集 UUID、写入并追加到排序末尾。
- `GET /api/admin/cases/:id`：单个案例详情，用于编辑表单回填。
- `PATCH /api/admin/cases/:id`：更新案例基础字段和分集集合（分集整体按提交的数组覆盖式更新：新增的插入、缺失的按 cascade 删除、保留的更新排序）。
- `DELETE /api/admin/cases/:id`：删除案例，级联删除分集记录；不删除 OSS 上的文件。
- `PATCH /api/admin/cases/reorder`：`{ orderedIds: string[] }` → 按数组顺序把 `sort_order` 重写为 0..N。
- `POST /api/admin/media/upload-url`：`{ fileName, contentType, kind: "cover" | "video" }` → 校验扩展名/Content-Type 后返回 `{ uploadUrl, objectPath }`。

所有 `/api/admin/*` 接口（除登录）都经 `middleware.ts` 校验 Cookie。

## 公开站改动

- `app/page.tsx`：新增数据库查询，服务端渲染时传入案例数据。
- `components/home/home-experience.tsx`：不再直接 import 静态数据，改为接收 `caseStudies`/`caseVideos` props；原来用 `projectSlug` 关联分集所属案例的地方改成 `projectId`（案例 UUID）。
- `app/api/media/video-url/route.ts`：视频路径合法性校验从查内存数组改成查 `case_episodes` 表是否存在该 `video_path`。
- `app/api/media/image/[...path]/route.ts`：路径前缀白名单不变，无需改动。

## 依赖变更

新增 `drizzle-orm`、`mysql2`，devDependency 新增 `drizzle-kit`。不引入额外 UI 组件库或拖拽库。

## 测试

- `lib/cases/queries.ts` 的数据库查询层单元测试（增删改查、排序、级联删除）。
- 鉴权：Cookie 签名/校验、密码校验、middleware 拦截行为的单元测试。
- `lib/oss` 新增的预签名上传 URL 生成函数、扩展名/Content-Type 校验的单元测试。
- 启动自动种子逻辑：空表时写入 11 条种子数据、非空表时跳过的单元测试。
- `/api/admin/*` 路由的集成测试（覆盖鉴权失败、参数校验失败、正常 CRUD）。
- 视频横竖屏自动识别的纯函数（输入宽高，输出 orientation）单元测试。
- 现有 `tests/content/*` 迁移为针对 `lib/cases/queries.ts` 的等价测试，保持对 11 个种子案例内容的回归覆盖。

## 验收清单

- 后台登录、增删改案例、拖拽排序、上传封面/视频均可正常工作，且改动实时反映到首页。
- 首次连接新数据库时自动完成 11 个案例的种子初始化，重复启动不会重复插入。
- OSS AccessKey/Secret 仍只出现在服务端环境变量中，不进入浏览器可见的代码或响应。
- 未登录状态下访问 `/admin/*` 或调用 `/api/admin/*` 会被拦截。
- `npm test`、`npm run build` 通过。
