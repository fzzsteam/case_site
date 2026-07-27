ALTER TABLE `case_episodes` ADD `duration_seconds` int;--> statement-breakpoint
ALTER TABLE `cases` ADD `slug` varchar(255);--> statement-breakpoint
ALTER TABLE `cases` ADD `detail` text;--> statement-breakpoint
ALTER TABLE `cases` ADD CONSTRAINT `cases_slug_unique` UNIQUE(`slug`);