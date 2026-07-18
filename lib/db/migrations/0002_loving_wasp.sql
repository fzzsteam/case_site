CREATE TABLE `admin_credentials` (
	`id` int NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`initial_password` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_credentials_id` PRIMARY KEY(`id`)
);
