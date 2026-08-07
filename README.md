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

数据库结构定义在 `lib/db/schema.ts`，迁移文件在 `lib/db/migrations/`，可以用 `npm run db:generate` 基于 schema 重新生成迁移。生成后需人工检查 TIMESTAMP 列的写法，原因见 `CLAUDE.md`。

## HTTPS 证书自动续签（可选）

如果域名是通过 SAE 的"网关路由"转发到 ALB 的（SAE 控制台里叫"网关路由"，后端 API 其实是 Ingress），可以配置 `ALIYUN_ACCESS_KEY_ID`/`ALIYUN_ACCESS_KEY_SECRET`/`ALB_REGION_ID`/`ALB_INSTANCE_ID` 等环境变量（见 `.env.example`），应用启动时会自动向 Let's Encrypt 申请通配符证书（DNS-01，走阿里云云解析）、上传到数字证书管理服务、通过 SAE 的 Ingress 接口更新网关路由绑定的证书，并按周期（默认 12 小时检查一次）自动续签。

**证书必须通过 SAE 的 Ingress 接口更新，不能直接改 ALB 监听器**——SAE 会周期性把自己保存的路由配置（含证书）同步覆盖到 ALB 上，直接改 ALB 监听器的证书会在毫无提示的情况下被 SAE 改回去。

证书本身缓存在 MySQL 的 `acme_certificates` 表里，重新部署不会触发重复签发（Let's Encrypt 对同一组域名有每 7 天最多 5 次的限制），也不会重复上传/绑定（每次启动会先检查 SAE 网关路由上绑定的证书是否已经是数据库里缓存的这张，一致就跳过），只有距离到期不足 30 天、或者发现绑定的证书对不上时才会真正发起续签/重新绑定。相关代码在 `lib/acme/`，逻辑由 `instrumentation.ts` 在应用启动时触发，不需要额外的容器或脚本。不配置这些变量时该功能完全不生效，不影响正常部署。

需要的权限：`AliyunDNSFullAccess`（DNS-01 校验）、`AliyunYundunCertFullAccess`（数字证书管理服务，证书上传/删除）、`AliyunSAEFullAccess`（更新网关路由绑定的证书）。

## MCP 公众号发布服务

`/api/mcp` 是一个远程 MCP 服务，让本地 agent（如 Claude Code）通过它把文章发到微信公众号。

**它解决的问题**：微信在获取 `access_token` 时会校验调用方的**公网出口 IP** 是否在公众号的 IP 白名单里。本地开发机的 IP 会漂，没法登记；而本应用部署在 SAE 上，出公网走 NAT 网关绑定的 EIP，出口 IP 固定，因此适合做这一层中转。拿到 token 之后的接口（草稿箱、素材、发布）都不再校验 IP，所以整个痛点只集中在这一个调用上。

### 配置

1. 环境变量 `WECHAT_APP_ID` / `WECHAT_APP_SECRET`（公众平台「设置与开发 → 基本配置」）
2. 部署后带 Token 请求 `GET /api/health/egress-ip`，连打几次确认返回的 IP 恒定
3. 把该 IP 填进公众号后台的「IP 白名单」
4. 在 `/admin/tokens` 新建一个 Token，复制接入命令到本地终端执行：
   ```bash
   claude mcp add --transport http wechat https://video.fzzsai.com/api/mcp \
     --header "Authorization: Bearer <token>"
   ```

> **运维注意**：出口 IP 来自 NAT 网关绑定的弹性公网 IP（`39.108.129.23` / `eip-wz9sy75co08v511bb91q6`）。这个 IP 已登记在公众号 IP 白名单里，**释放或更换该 EIP 必须同步修改公众号后台**，否则发布会报 `40164`，而该错误码看不出跟 EIP 有任何关系，极难排查。

### 提供的工具

| 工具 | 说明 |
| --- | --- |
| `wechat_create_upload_url` | 换取 10 分钟有效的图片上传地址 |
| `wechat_create_draft` | 新建图文草稿（正文 HTML，封面必填） |
| `wechat_update_draft` | 覆盖更新已有草稿 |
| `wechat_list_drafts` | 列出草稿，找回 media_id |
| `wechat_get_draft` | 获取草稿详情（正文 HTML、封面） |
| `wechat_delete_draft` | 删除草稿 |
| `wechat_publish_draft` | 发布草稿（公开可访问，**不推送给粉丝**） |
| `wechat_get_publish_status` | 查询异步发布结果 |
| `wechat_list_published` | 列出已发布文章 |
| `wechat_delete_published` | 删除已发布文章（**不可逆**） |
| `wechat_get_published_article` | 获取已发布图文详情 |
| `wechat_mass_preview` | 把文章预览推送到指定微信（运营者核对排版，不计群发次数） |
| `wechat_mass_send` | 群发给粉丝（全员或按标签，**不可逆**，必须 confirm=true + clientmsgid） |
| `wechat_mass_send_by_openids` | 按 OpenID 列表群发（服务号） |
| `wechat_mass_status` | 查询群发发送状态 |
| `wechat_mass_delete` | 删除已群发消息 |
| `wechat_list_materials` | 分类型列出永久素材 |
| `wechat_delete_material` | 删除永久素材 |
| `wechat_list_comments` | 查看文章留言 |
| `wechat_reply_comment` | 回复留言 |
| `wechat_mark_comment` / `wechat_unmark_comment` | 精选 / 取消精选留言 |
| `wechat_delete_comment` | 删除留言 |
| `wechat_list_tags` | 列出粉丝标签（按标签群发时选 tag_id） |

**关于群发**：发布和群发是两套能力——`wechat_publish_draft` 只让文章公开可访问，不推送粉丝；`wechat_mass_send` 才是推送给粉丝的群发。群发不可逆，服务号每月每用户最多收到 4 条，因此加了防误触机制：

- 工具层强制 `confirm=true`，且 instructions 要求 agent 必须先 `wechat_mass_preview` 预览、征得用户明确确认后才能群发；
- `clientmsgid` 必填，微信侧 24 小时内相同 id 拒绝重复推送（错误码 45065）；
- 群发全员（`is_to_all=true`）每天最多一次并进入历史消息列表；按标签群发必须带 `tag_id`；
- 建议在公众号后台「设置-安全中心-风险操作保护」开启 **API 群发保护**，群发全员时管理员需在微信后台确认，30 分钟未确认自动失败。

所有接口均要求账号通过微信认证；个人主体或未认证账号自 2025 年 7 月起会被回收发布类接口权限。

### 图片为什么要走 curl

MCP 工具的参数由模型逐 token 生成，图片数据不可能写进参数。所以本地图片走旁路：`wechat_create_upload_url` 返回一个带 HMAC 签名的上传地址，agent 用 Bash 执行 `curl -F "file=@图片路径" '<upload_url>'` 上传，文件经 HTTP body 传输，完全不经过模型 context。服务端收到后立刻转投微信并返回自描述的 ref，**不保存任何临时状态**，因此多副本部署下不存在「上传打到 A 实例、建草稿打到 B 实例」的问题。

正文里的 `<img src>` 如果不是微信域名，服务端会自动抓取、转投微信并回填地址——微信对外链图片是**静默丢弃**的，不做这步会出现「草稿建成功但图片全是空白」。除此之外正文 HTML 不做任何改动。

### 上线检查清单

1. `GET /api/health/egress-ip` 连打 5 次，IP 恒定 → 填入公众号 IP 白名单
2. `/admin/tokens` 建 Token → 本地 `claude mcp add` → `/mcp` 确认连上且能看到 24 个工具
3. `wechat_create_upload_url` → curl 传一张图 → 拿到 ref
4. `wechat_create_draft` 建一篇带封面和正文图的草稿 → **去公众平台后台肉眼确认排版和图片都在**
5. `wechat_publish_draft` → `wechat_get_publish_status` 轮询到成功 → 打开文章链接确认
6. `wechat_list_tags` / `wechat_list_published` 各调一次，确认账号权限正常
7. 群发链路：`wechat_mass_preview`（发给运营者微信号）→ 用户确认 → `wechat_mass_send`（按标签，`is_to_all=false`，confirm=true + clientmsgid）→ `wechat_mass_status` 轮询成功 → 粉丝侧收到
8. 用相同 `clientmsgid` 重复调群发，确认返回 45065 被拦截
9. 用一个错误的 Token 调一次，确认返回 401

## 验证

```bash
npm test
npm run build
npm start
```

部署前应确认：生产域名已写入 `NEXT_PUBLIC_SITE_URL`；OSS 与 `MYSQL_URL` 均可用；`SESSION_SECRET` 已设置为非默认的长随机值；真实二维码仍可扫描；`/sitemap.xml` 与 `/robots.txt` 返回成功；构建产物 `.next/static` 不包含 OSS 凭证或数据库连接串。
