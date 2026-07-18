CREATE TABLE `case_episodes` (
	`id` char(36) NOT NULL,
	`case_id` char(36) NOT NULL,
	`video_path` varchar(500) NOT NULL,
	`orientation` enum('landscape','portrait') NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `case_episodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` char(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` enum('宣传片','广告片','短剧','IP创造') NOT NULL,
	`summary` text NOT NULL,
	`cover_path` varchar(500) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `case_episodes` ADD CONSTRAINT `case_episodes_case_id_cases_id_fk` FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON DELETE cascade ON UPDATE no action;