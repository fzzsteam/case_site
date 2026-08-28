CREATE TABLE `talent_profiles` (
	`id` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`role` varchar(255) NOT NULL,
	`intro` text NOT NULL,
	`bio` text NOT NULL,
	`avatar_path` varchar(500),
	`location` varchar(100),
	`skills` text NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `talent_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `talent_works` (
	`id` varchar(100) NOT NULL,
	`talent_id` varchar(64) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('video','image','website') NOT NULL,
	`source` enum('uploaded','static','external') NOT NULL,
	`summary` text NOT NULL,
	`cover_path` varchar(500) NOT NULL,
	`media_path` varchar(500),
	`media_paths` text,
	`gallery_paths` text,
	`site_slug` varchar(255),
	`site_url` varchar(1000),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `talent_works_id` PRIMARY KEY(`id`),
	CONSTRAINT `talent_works_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `talent_works` ADD CONSTRAINT `talent_works_talent_id_talent_profiles_id_fk` FOREIGN KEY (`talent_id`) REFERENCES `talent_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_talent_works_talent_id` ON `talent_works` (`talent_id`);--> statement-breakpoint
CREATE INDEX `idx_talent_works_sort_order` ON `talent_works` (`talent_id`,`sort_order`);
