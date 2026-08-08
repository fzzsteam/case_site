CREATE TABLE `aigc_leads` (
	`id` char(36) NOT NULL,
	`name` varchar(64) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`source` varchar(32) NOT NULL DEFAULT 'kit',
	`status` varchar(32) NOT NULL DEFAULT 'new',
	`request_ip` varchar(64),
	`user_agent` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aigc_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_aigc_leads_phone` ON `aigc_leads` (`phone`);--> statement-breakpoint
CREATE INDEX `idx_aigc_leads_created_at` ON `aigc_leads` (`created_at`);