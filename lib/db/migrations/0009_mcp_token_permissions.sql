ALTER TABLE `mcp_tokens` ADD `permissions` text NULL;
--> statement-breakpoint
UPDATE `mcp_tokens` SET `permissions` = '["wechat.*"]' WHERE `permissions` IS NULL;
--> statement-breakpoint
ALTER TABLE `mcp_tokens` MODIFY `permissions` text NOT NULL;
