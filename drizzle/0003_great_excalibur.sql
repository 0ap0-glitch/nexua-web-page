CREATE TABLE `communityTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`category` enum('fan-club','workshop','professional','study-group','creator','general') NOT NULL,
	`widgetConfig` text,
	`isPublic` int unsigned NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communityTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityWidgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communityId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text,
	`position` int NOT NULL DEFAULT 0,
	`isVisible` int unsigned NOT NULL DEFAULT 1,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communityWidgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`targetType` enum('post','thread','reply') NOT NULL,
	`targetId` int NOT NULL,
	`reactionType` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `threadReplies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`threadId` int NOT NULL,
	`authorId` int NOT NULL,
	`parentReplyId` int,
	`content` text NOT NULL,
	`depth` int NOT NULL DEFAULT 0,
	`reactionCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `threadReplies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `threads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communityId` int NOT NULL,
	`authorId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`isPinned` int unsigned NOT NULL DEFAULT 0,
	`replyCount` int NOT NULL DEFAULT 0,
	`viewCount` int NOT NULL DEFAULT 0,
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `threads_id` PRIMARY KEY(`id`)
);
