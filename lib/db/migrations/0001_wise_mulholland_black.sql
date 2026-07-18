CREATE TABLE `categories` (
	`id` char(36) NOT NULL,
	`name` varchar(50) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `cases` MODIFY COLUMN `category` varchar(50) NOT NULL;