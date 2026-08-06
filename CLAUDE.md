# case_site 项目须知

## 生成数据库迁移后，必须人工检查 TIMESTAMP 列

**生产 RDS 的 `explicit_defaults_for_timestamp` 是关闭的，本地 MySQL 容器默认开启。**
这个差异会让下面两种写法**在本地怎么测都是绿的，一到生产就报 `ERROR 1067 Invalid default value`**，
而且失败发生在应用启动的建表阶段，日志里只会看到一句 `Database startup check failed`。

跑完 `npm run db:generate` 后，打开新生成的 `.sql`，按这两条改：

| drizzle-kit 生成的 | 必须改成 | 原因 |
| --- | --- | --- |
| `timestamp NOT NULL DEFAULT (now())` | `timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP` | 表达式默认值在该参数关闭时不被接受 |
| `last_used_at timestamp`（可空、无默认） | `last_used_at timestamp NULL DEFAULT NULL` | 否则 MySQL 隐式改成 `NOT NULL DEFAULT '0000-00-00 00:00:00'`，撞上 sql_mode 里的 `NO_ZERO_DATE` |

注意 `lib/db/migrations/0000`~`0005` 用的是 `DEFAULT CURRENT_TIMESTAMP`，那是**老版本 drizzle-kit** 的输出；
当前版本（drizzle-kit 0.31.x）改成了 `DEFAULT (now())`，所以老迁移能过、新迁移会挂，别被既有文件误导。

改完在提交前这样验一遍（本地容器名 `mysql8-local`，端口 3309）：

```bash
{
  echo "set session explicit_defaults_for_timestamp=0;"
  for f in lib/db/migrations/0*.sql; do sed 's|--> statement-breakpoint||g' "$f"; done
} > /tmp/all.sql
docker exec mysql8-local mysql -h127.0.0.1 -uroot -pdevpassword \
  -e "drop database if exists probe_prod; create database probe_prod;"
docker exec -i mysql8-local mysql -h127.0.0.1 -uroot -pdevpassword probe_prod < /tmp/all.sql
```

`--> statement-breakpoint` 是 drizzle 自己的分隔标记，`-->` 不是合法的 MySQL 注释，直接喂给 mysql 会语法错误，必须先剔除。

## 本地开发

`npm run dev:up` 已损坏（`.env.local` 里 OSS 四项写成了 `KEY: value` 的 YAML 格式，`dev.sh` 会 `source` 它并把
`OSS_REGION:` 当命令执行，退出码 127）。**直接用 `npm run dev`**；本地 MySQL 是常驻容器 `mysql8-local`，映射在
3309 端口，不需要 dev.sh 去拉起。用 `docker exec` 连它查库时要加 `--default-character-set=utf8mb4 -h127.0.0.1`，
否则写入的中文会双重编码成乱码。

## MCP 公众号服务

`/api/mcp` 的设计背景、工具清单和上线检查清单见 `README.md`。两个容易忘的点：

- 微信按**出口 IP** 校验白名单（不是入站 IP）。生产出口是 NAT 网关绑定的 EIP `39.108.129.23`，
  已登记在公众号后台；**释放或更换该 EIP 必须同步改公众号白名单**，否则报 `40164`，而该错误码
  跟 EIP 看不出任何关系，极难排查。
- `NEXT_PUBLIC_SITE_URL` 是**构建期内联**进产物的（来自 CI 的 build-arg），改 SAE 环境变量无效。
  `/api/mcp` 用它拼上传地址，所以改域名必须重新构建镜像。
