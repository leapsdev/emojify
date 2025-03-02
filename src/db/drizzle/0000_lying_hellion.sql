CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`address` text,
	`username` text,
	`profile_image_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
