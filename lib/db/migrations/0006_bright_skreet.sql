-- 这里的两处写法是手工调整过的，不要按 drizzle-kit 的默认输出改回去：
-- 生产 RDS 的 explicit_defaults_for_timestamp 是关闭的，此时
--   1) `DEFAULT (now())`（新版 drizzle-kit 的表达式默认值）会报 ERROR 1067；
--   2) 可空的 TIMESTAMP 必须显式写 `NULL DEFAULT NULL`，否则会被隐式改成
--      NOT NULL DEFAULT '0000-00-00 00:00:00'，撞上 sql_mode 里的 NO_ZERO_DATE 同样报 1067。
-- 本地 MySQL 容器该参数默认开启，所以这两个问题在本地都复现不出来。
CREATE TABLE `mcp_tokens` (
	`id` char(36) NOT NULL,
	`name` varchar(50) NOT NULL,
	`token` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_used_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `mcp_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `mcp_tokens_token_unique` UNIQUE(`token`)
);
