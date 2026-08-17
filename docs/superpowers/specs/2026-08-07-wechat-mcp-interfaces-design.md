# 公众号 MCP 群发与接口补全设计规格

## 目标

在现有公众号 MCP 服务（`/api/mcp`，当前 6 个工具）基础上，补齐发文全流程缺失的官方接口：群发、草稿箱补全、发布能力补全、永久素材、留言管理、粉丝标签，并为群发建立防误触机制。账号类型为**认证服务号**，以下接口均可调用（群发接口、发布接口、留言接口自 2025 年 7 月起仅认证账号可用，本账号满足）。

## 范围

新增 18 个工具。**不做**：客服消息、模板消息、自定义菜单、二维码、数据统计、永久素材上传（`add_material`）、群发速度设置、标签增删改与打标签。

## 关键设计决策

1. **群发防误触（三层）**：
   - 工具契约：`wechat_mass_send` / `wechat_mass_send_by_openids` 的 `confirm` 参数必须为字面量 `true`，缺失或为 false 直接参数报错；`clientmsgid` 必填（≤32 字节），微信侧 24 小时内相同 id 拒绝重复推送（45065，返回已存在群发的 `msg_id`）。
   - 指令约束：`SERVER_INSTRUCTIONS` 写明群发工作流——必须先 `wechat_mass_preview` 预览、必须征得用户明确同意后才能传 `confirm=true`。
   - 平台侧：建议在公众号后台「设置-安全中心-风险操作保护」开启 API 群发保护，群发全员时管理员需在微信后台确认，30 分钟未确认则失败（errcode 40001/40002）。
2. **预览机制**：`message/mass/preview` 把文章（草稿 `media_id`）真推送给指定一人，支持 `touser`（openid）或 `towxname`（微信号）二选一；按微信号预览每日限 100 次；预览不计入每月 4 条群发配额。工具参数用 `to_wxname` / `to_openid` 二选一显式区分。
3. **群发按消息类型组装消息体**：`mpnews` 的 `media_id` 使用「草稿箱/新建草稿」返回值；`image`、`voice`、`mpvideo` 使用素材 `media_id`；`text`、`wxcard`、`music` 使用各自消息体字段。未传 `msgtype` 时兼容旧行为，默认 `mpnews`。
4. **GET 支持**：`tags/get` 是 GET 接口，`lib/wechat/client.ts` 需把 `request` 泛化出 GET 能力（新增 `getJson`），现有 `postJson` 不动。
5. **留言的 msg_data_id 来源**：群发返回的 `msg_data_id`，或 `freepublish/submit` 返回的 `msg_data_id`（现有 `submitPublish` 已透传该字段）。

## 接口明细

### 群发（新文件 `lib/wechat/mass.ts`）

| 工具 | 参数 | 微信接口 | 响应要点 |
| --- | --- | --- | --- |
| `wechat_mass_preview` | `msgtype`（默认 `mpnews`）及对应消息字段、`to_wxname` 或 `to_openid`（二选一） | `POST /cgi-bin/message/mass/preview` | 预览已发送提示 |
| `wechat_mass_send` | `msgtype`（默认 `mpnews`）及对应消息字段、`is_to_all`（默认 false）、`tag_id`（false 时必填）、**`confirm`（必须 true）**、**`clientmsgid`**、`send_ignore_reprint`（仅 mpnews） | `POST /cgi-bin/message/mass/sendall` | `msg_id`、`msg_data_id`、频率提示（服务号每月每用户 4 条、每天全员 1 次） |
| `wechat_mass_send_by_openids` | `msgtype`（默认 `mpnews`）及对应消息字段、`openids`（数组）、**`confirm`（必须 true）**、**`clientmsgid`** | `POST /cgi-bin/message/mass/send` | `msg_id`、`msg_data_id` |
| `wechat_mass_status` | `msg_id` | `POST /cgi-bin/message/mass/get` | `msg_status`（SENDING/SEND_SUCCESS/失败）、`totalcount`/`filtercount`/`sentcount`/`errorcount`、`article_url` |
| `wechat_mass_delete` | `msg_id`、`article_idx`（可选，多图文删单篇） | `POST /cgi-bin/message/mass/delete` | 删除结果（仅文章/视频可删） |

### 草稿箱补全（扩展 `lib/wechat/draft.ts`）

| 工具 | 参数 | 微信接口 | 响应要点 |
| --- | --- | --- | --- |
| `wechat_get_draft` | `media_id` | `POST /cgi-bin/draft/get` | 标题、正文 HTML、封面、作者等完整内容 |
| `wechat_delete_draft` | `media_id` | `POST /cgi-bin/draft/delete` | 删除结果 |

### 发布能力补全（新文件 `lib/wechat/publish.ts`）

| 工具 | 参数 | 微信接口 | 响应要点 |
| --- | --- | --- | --- |
| `wechat_list_published` | `offset`（默认 0）、`count`（默认 10） | `POST /cgi-bin/freepublish/batchget` | `total` + 发布列表（`article_id`、标题、更新时间） |
| `wechat_delete_published` | `article_id` | `POST /cgi-bin/freepublish/delete` | 删除结果（**不可逆**，description 注明） |
| `wechat_get_published_article` | `article_id` | `POST /cgi-bin/freepublish/getarticle` | 已发布图文详情 |

### 永久素材（新文件 `lib/wechat/material.ts`）

| 工具 | 参数 | 微信接口 | 响应要点 |
| --- | --- | --- | --- |
| `wechat_list_materials` | `type`（image/video/voice/news）、`offset`、`count` | `POST /cgi-bin/material/batchget_material` | `total_count` + 素材列表（media_id、名称、更新时间） |
| `wechat_delete_material` | `media_id` | `POST /cgi-bin/material/del_material` | 删除结果 |

### 留言管理（新文件 `lib/wechat/comment.ts`）

| 工具 | 参数 | 微信接口 | 响应要点 |
| --- | --- | --- | --- |
| `wechat_list_comments` | `msg_data_id`、`index`（可选）、`begin`、`count`（≤50）、`type`（0/1/2） | `POST /cgi-bin/comment/list` | `total` + 评论列表（含 `user_comment_id`、内容、是否精选） |
| `wechat_reply_comment` | `msg_data_id`、`index`、`user_comment_id`、`content` | `POST /cgi-bin/comment/reply/add` | 回复结果 |
| `wechat_mark_comment` | `msg_data_id`、`index`、`user_comment_id` | `POST /cgi-bin/comment/markelect` | 标记精选 |
| `wechat_unmark_comment` | `msg_data_id`、`index`、`user_comment_id` | `POST /cgi-bin/comment/unmarkelect` | 取消精选 |
| `wechat_delete_comment` | `msg_data_id`、`index`、`user_comment_id` | `POST /cgi-bin/comment/delete` | 删除评论 |

### 粉丝标签（新文件 `lib/wechat/tag.ts`）

| 工具 | 参数 | 微信接口 | 响应要点 |
| --- | --- | --- | --- |
| `wechat_list_tags` | 无 | `GET /cgi-bin/tags/get` | 标签列表（`id`、`name`、`count`），供按标签群发选 `tag_id` |

## 文件结构

- 新增 `lib/wechat/mass.ts`、`publish.ts`、`material.ts`、`comment.ts`、`tag.ts`
- 扩展 `lib/wechat/draft.ts`：`getDraft`、`deleteDraft`（现有 `submitPublish`/`getPublishStatus` 不动，避免无谓搬迁）
- 扩展 `lib/wechat/client.ts`：泛化 `request`，新增 `getJson`
- 扩展 `lib/mcp/tools.ts`：按「群发 / 草稿 / 发布 / 素材 / 留言 / 标签」分组注册 18 个新工具，沿用现有 `ToolDefinition` 结构与 zod 校验
- 更新 `lib/mcp/protocol.ts`：`SERVER_INSTRUCTIONS` 增加群发工作流与 confirm 规则
- 更新 `README.md`：工具表、群发频率限制说明、上线检查清单

## 数据流（群发全流程）

```
wechat_create_draft（mpnews）或素材 media_id（image/voice/mpvideo）
→ wechat_mass_preview（传与群发相同的消息类型和字段，to_wxname=运营者微信号）
→ agent 停下询问用户「预览已发到你微信，确认无误就群发？」
→ 用户明确同意
→ wechat_mass_send（传与预览相同的消息类型和字段，confirm=true, clientmsgid=..., is_to_all/tag_id）
→ 返回 msg_id → wechat_mass_status 轮询到完成 → 汇报
```

## 错误处理

- 复用 `postJson` / `WechatApiError`：`errcode`/`errmsg` 已格式化，agent 可直接读到错误文本并纠正。
- `confirm` 缺失或非 `true`：zod 报「必须先调用 wechat_mass_preview 并征得用户明确同意才能群发」。
- `is_to_all=false` 且未传 `tag_id`：zod refine 报错。
- `clientmsgid` 重复：微信 45065，透传并提示已存在的群发 `msg_id`（可接着查状态）。
- 群发保护拒绝：40001（管理员拒绝）/ 40002（30 分钟超时）透传。

## 测试

- 每个新 lib 模块的单元测试（mock fetch）：断言请求路径、请求体、返回映射。
- 群发闸门：`confirm` 缺失 / 非 true 被拒；`confirm=true` 且带 `clientmsgid` 才发；`is_to_all=false` 无 `tag_id` 被拒。
- `getJson` 路径测试（`tags/get`）。
- `tests/mcp/protocol.test.ts`：工具清单断言更新为 24 个；原「不提供群发工具」断言替换为「群发工具存在且 confirm 必填」。

## 上线检查清单补充

1. 部署后调 `wechat_list_tags`、`wechat_list_published` 确认账号权限正常。
2. 走一遍「预览 → 用户确认 → 群发（按标签，is_to_all=false）」的完整链路，确认粉丝侧收到、公众号后台群发记录正确。
3. 用相同 `clientmsgid` 重复调用，确认返回 45065 被拦截。
