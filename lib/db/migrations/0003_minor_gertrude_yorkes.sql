CREATE TABLE `acme_certificates` (
	`domain` varchar(255) NOT NULL,
	`fullchain` text NOT NULL,
	`private_key` text NOT NULL,
	`not_after` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `acme_certificates_domain` PRIMARY KEY(`domain`)
);
