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

## 人才集市样例

访问 `/edu/talent` 查看人才列表，进入人才详情后可以查看图片、点击播放已上传视频，或在新窗口打开作品集网站。静态作品集的访问地址使用稳定的 `siteSlug.edu.fzzsai.com`，例如 `site-k7m3x9p.edu.fzzsai.com`；域名请求由一个 SAE 网关路由按 Host 识别 slug，再读取对应站点文件，不需要为每个作品单独创建 DNS 或 SAE 路由。

当前样例站点保存在 `public/portfolio/site-k7m3x9p/`，用于本地预览。生产部署静态源码时，将构建后的文件（根目录必须有 `index.html`）上传到私有 OSS 的 `portfolio-sites/<siteSlug>/` 前缀，并设置 `PORTFOLIO_STORAGE=oss`。应用会通过同一个 `siteSlug.edu.fzzsai.com` 代理读取 HTML、CSS、JS、图片和视频，浏览器不会直接拿到 OSS 地址；视频请求会透传 Range，支持拖动播放。上传入口和人才数据后台暂未开放，当前后台只提供只读人才列表。

人才资料由 `lib/talent/demo-data.ts` 作为幂等种子写入 `talent_profiles` 和 `talent_works`，应用启动时会自动执行数据迁移。本批人才作品的头像、封面和视频均使用私有 OSS 的 `case-site/cases/aigc-talent/` 对象路径；封面通过同源代理读取，视频在点击播放后生成临时签名地址。

## 案例管理后台

首次连接一个空的 MySQL 数据库时，应用启动会自动建表、写入默认分类与内置的 11 个案例（`lib/cases/seed-data.ts`），并生成一个随机初始密码（存储为哈希，不落明文）。初始密码会显示在 `/admin/login` 页面上，登录后请在「账号设置」里尽快修改；修改过一次后，登录页就不会再展示初始密码。

登录后可在 `/admin/cases` 增删改案例、拖拽调整展示顺序，`/admin/categories` 管理分类（删除前需先清空该分类下的案例）；新建/编辑表单里封面和视频直传 OSS，视频的横竖屏由浏览器自动识别，上传完成后可直接点击预览播放。删除案例只会删数据库记录，不会删除 OSS 上的原始素材文件。

数据库结构定义在 `lib/db/schema.ts`，迁移文件在 `lib/db/migrations/`，可以用 `npm run db:generate` 基于 schema 重新生成迁移。生成后需人工检查 TIMESTAMP 列的写法，原因见 `CLAUDE.md`。

## HTTPS 证书自动续签（可选）

如果域名是通过 SAE 的"网关路由"转发到 ALB 的（SAE 控制台里叫"网关路由"，后端 API 其实是 Ingress），可以配置 `ALIYUN_ACCESS_KEY_ID`/`ALIYUN_ACCESS_KEY_SECRET`/`ALB_REGION_ID`/`ALB_INSTANCE_ID` 等环境变量（见 `.env.example`），应用启动时会自动向 Let's Encrypt 申请多域名证书（默认包含 `fzzsai.com`、`*.fzzsai.com`、`*.edu.fzzsai.com`，DNS-01 走阿里云云解析）、上传到数字证书管理服务、通过 SAE 的 Ingress 接口更新网关路由绑定的证书，并按周期（默认 12 小时检查一次）自动续签。

**证书必须通过 SAE 的 Ingress 接口更新，不能直接改 ALB 监听器**——SAE 会周期性把自己保存的路由配置（含证书）同步覆盖到 ALB 上，直接改 ALB 监听器的证书会在毫无提示的情况下被 SAE 改回去。

证书本身缓存在 MySQL 的 `acme_certificates` 表里，重新部署不会触发重复签发（Let's Encrypt 对同一组域名有每 7 天最多 5 次的限制），也不会重复上传/绑定（每次启动会先检查 SAE 网关路由上绑定的证书是否已经是这组域名的证书，一致就跳过），只有证书缺少所需 SAN、距离到期不足 30 天、或者发现绑定的证书对不上时才会真正发起续签/重新绑定。相关代码在 `lib/acme/`，逻辑由 `instrumentation.ts` 在应用启动时触发，不需要额外的容器或脚本。不配置这些变量时该功能完全不生效，不影响正常部署。

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
| `wechat_create_multi_draft` | 一次新建多图文草稿（2-8 篇，粉丝收到一条多图文消息） |
| `wechat_update_draft` | 覆盖更新已有草稿 |
| `wechat_list_drafts` | 列出草稿，找回 media_id |
| `wechat_get_draft` | 获取草稿详情（正文 HTML、封面） |
| `wechat_delete_draft` | 删除草稿 |
| `wechat_publish_draft` | 发布草稿（公开可访问，**不推送给粉丝**） |
| `wechat_get_publish_status` | 查询异步发布结果 |
| `wechat_list_published` | 列出已发布文章 |
| `wechat_delete_published` | 删除已发布文章（**不可逆**） |
| `wechat_get_published_article` | 获取已发布图文详情 |
| `wechat_mass_preview` | 把群发消息预览推送到指定微信（支持图文/文本/图片/语音/视频/卡券/音乐，不计群发次数） |
| `wechat_mass_send` | 群发消息给粉丝（全员或按标签，**不可逆**，必须 confirm=true + clientmsgid） |
| `wechat_mass_send_by_openids` | 按 OpenID 列表群发消息（仅认证服务号） |
| `wechat_mass_status` | 查询群发发送状态 |
| `wechat_mass_delete` | 删除已群发消息 |
| `wechat_list_materials` | 分类型列出永久素材 |
| `wechat_delete_material` | 删除永久素材 |
| `wechat_list_comments` | 查看文章留言 |
| `wechat_reply_comment` | 回复留言 |
| `wechat_mark_comment` / `wechat_unmark_comment` | 精选 / 取消精选留言 |
| `wechat_delete_comment` | 删除留言 |
| `wechat_list_tags` | 列出粉丝标签（按标签群发时选 tag_id） |
| `wechat_get_article_read_stats` | 查某天所有被阅读文章的阅读人数 + 来源 |
| `wechat_get_article_stats_detail` | 查某天发表文章的完整指标（阅读/分享/点赞/留言/收藏，含标题链接） |
| `wechat_get_article_stats_summary` | 查一段日期（最长 30 天）的发表内容汇总概览 |
| `wechat_list_followers` | 关注者 openid 列表（分页） |
| `wechat_get_user_info` / `wechat_batch_get_user_info` | 粉丝基本信息（关注时间/来源/标签），支持批量 |
| `wechat_create_tag` / `wechat_update_tag` / `wechat_delete_tag` | 粉丝标签增删改 |
| `wechat_tag_users` / `wechat_untag_users` | 给粉丝打标签 / 取消标签 |
| `wechat_list_tag_members` / `wechat_get_user_tags` | 标签下粉丝列表 / 某粉丝的标签 |
| `wechat_get_followers_stats` / `wechat_get_total_followers` | 每日粉丝增减 / 累计关注 |
| `wechat_open_comments` / `wechat_close_comments` | 打开 / 关闭文章留言 |
| `wechat_delete_comment_reply` | 删除留言回复 |
| `wechat_get_material` / `wechat_get_material_count` | 永久素材详情 / 素材总数 |
| `wechat_get_mass_speed` | 查询群发速度（只读） |
| `wechat_create_menu` / `wechat_get_menu` / `wechat_delete_menu` | 自定义菜单创建 / 查询 / 删除 |
| `wechat_send_customer_message` | 发送客服消息（有 48 小时/条数触发窗口限制） |
| `wechat_send_typing` | 设置客服输入状态 |
| `wechat_list_kf_accounts` | 列出客服账号 |

**关于群发**：发布和群发是两套能力——`wechat_publish_draft` 只让文章公开可访问，不推送粉丝；`wechat_mass_send` 才是推送给粉丝的群发。群发不可逆，因此加了防误触机制：

- 工具层强制 `confirm=true`，且 instructions 要求 agent 必须先 `wechat_mass_preview` 预览、征得用户明确确认后才能群发；
- `clientmsgid` 必填，微信侧 24 小时内相同 id 拒绝重复推送（错误码 45065）；
- 群发全员（`is_to_all=true`）每天最多一次并进入历史消息列表；按标签群发必须带 `tag_id`；
- 频次限制：认证公众号每天可群发 1 次（全员或按标签）；服务号每月每用户最多收到 4 条。按 OpenID 群发（`wechat_mass_send_by_openids`）仅认证服务号可用；
- 建议在公众号后台「设置-安全中心-风险操作保护」开启 **API 群发保护**，群发全员时管理员需在微信后台确认，30 分钟未确认自动失败。

群发消息类型由 `msgtype` 区分：不传时兼容旧行为，按 `mpnews` 使用草稿 `media_id`；`text` 使用 `content`；`image` / `voice` / `mpvideo` 使用素材 `media_id`；`wxcard` 使用 `card_id`/`card_ext`；`music` 使用 `music_url`、`hq_music_url` 和 `thumb_media_id`。图片素材可以通过 `wechat_create_upload_url(purpose="cover")` 上传，返回的 `wxmedia:xxx` ref 可直接传给图片预览/群发工具。

所有接口均要求账号通过微信认证；个人主体或未认证账号自 2025 年 7 月起会被回收发布类接口权限。

**关于阅读数**：数据统计接口（`datacube`）向所有认证公众号开放。阅读数按日期返回当天所有文章，不能按单篇 id 直接查——要某篇的数据用返回的 `msgid`（群发/发布返回的 `msg_data_id_序号`）或标题过滤。数据从 2025-11-01 起有效，每次只能查 1 天，最大到昨天，建议每天 8 点后查询前一天；`wechat_get_article_stats_detail` 每篇只统计发表后 30 天。

### 图片为什么要走 curl

MCP 工具的参数由模型逐 token 生成，图片数据不可能写进参数。所以本地图片走旁路：`wechat_create_upload_url` 返回一个带 HMAC 签名的上传地址，agent 用 Bash 执行 `curl -F "file=@图片路径" '<upload_url>'` 上传，文件经 HTTP body 传输，完全不经过模型 context。服务端收到后立刻转投微信并返回自描述的 ref，**不保存任何临时状态**，因此多副本部署下不存在「上传打到 A 实例、建草稿打到 B 实例」的问题。

正文里的 `<img src>` 如果不是微信域名，服务端会自动抓取、转投微信并回填地址——微信对外链图片是**静默丢弃**的，不做这步会出现「草稿建成功但图片全是空白」。除此之外正文 HTML 不做任何改动。

### 上线检查清单

1. `GET /api/health/egress-ip` 连打 5 次，IP 恒定 → 填入公众号 IP 白名单
2. `/admin/tokens` 建 Token → 本地 `claude mcp add` → `/mcp` 确认连上且能看到 52 个工具
3. `wechat_create_upload_url` → curl 传一张图 → 拿到 ref
4. `wechat_create_draft` 建一篇带封面和正文图的草稿 → **去公众平台后台肉眼确认排版和图片都在**
5. `wechat_publish_draft` → `wechat_get_publish_status` 轮询到成功 → 打开文章链接确认
6. `wechat_list_tags` / `wechat_list_published` 各调一次，确认账号权限正常
7. 群发链路：`wechat_mass_preview`（发给运营者微信号）→ 用户确认 → `wechat_mass_send`（按标签，`is_to_all=false`，confirm=true + clientmsgid）→ `wechat_mass_status` 轮询成功 → 粉丝侧收到
8. 用相同 `clientmsgid` 重复调群发，确认返回 45065 被拦截
9. `wechat_get_article_read_stats` 查昨天，确认能取到阅读数据（当天没人读时返回空列表属正常）
10. 用一个错误的 Token 调一次，确认返回 401

## 验证

```bash
npm test
npm run build
npm start
```

部署前应确认：生产域名已写入 `NEXT_PUBLIC_SITE_URL`；OSS 与 `MYSQL_URL` 均可用；`SESSION_SECRET` 已设置为非默认的长随机值；真实二维码仍可扫描；`/sitemap.xml` 与 `/robots.txt` 返回成功；构建产物 `.next/static` 不包含 OSS 凭证或数据库连接串。
