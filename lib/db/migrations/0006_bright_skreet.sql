CREATE TABLE `mcp_tokens` (
	`id` char(36) NOT NULL,
	`name` varchar(50) NOT NULL,
	`token` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`last_used_at` timestamp,
	CONSTRAINT `mcp_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `mcp_tokens_token_unique` UNIQUE(`token`)
);
