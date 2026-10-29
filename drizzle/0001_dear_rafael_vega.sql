CREATE TABLE `table_talk` (
	`room_code` text NOT NULL,
	`id` text NOT NULL,
	`player_id` text NOT NULL,
	`name` text NOT NULL,
	`body` text NOT NULL,
	`sent_at` integer NOT NULL,
	PRIMARY KEY(`room_code`, `id`),
	FOREIGN KEY (`room_code`) REFERENCES `rooms`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `table_talk_recent` ON `table_talk` (`room_code`,`sent_at`);