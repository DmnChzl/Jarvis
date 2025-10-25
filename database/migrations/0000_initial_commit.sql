CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sessionId` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`timestamp` integer NOT NULL
);
