CREATE TABLE `aiCompanions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(50) NOT NULL DEFAULT 'NEX',
	`avatarType` varchar(50) NOT NULL DEFAULT 'default',
	`voiceMode` enum('speak','guide','silent','muted') NOT NULL DEFAULT 'guide',
	`personalityConfig` text,
	`onboardingProgress` text,
	`preferences` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiCompanions_id` PRIMARY KEY(`id`),
	CONSTRAINT `aiCompanions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `communities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`type` enum('interest','emotional','lifestyle','goal','dating','mental-health','creator','general') NOT NULL,
	`visibility` enum('public','private','invite-only') NOT NULL DEFAULT 'public',
	`creatorId` int NOT NULL,
	`avatarUrl` varchar(500),
	`memberCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communityId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','moderator','member') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communityMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requesterId` int NOT NULL,
	`receiverId` int NOT NULL,
	`status` enum('pending','accepted','rejected','blocked') NOT NULL DEFAULT 'pending',
	`compatibilityScore` int,
	`sharedInterests` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventRsvps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('going','interested','not-going') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `eventRsvps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communityId` int NOT NULL,
	`creatorId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`type` enum('online','in-person','hybrid') NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`location` varchar(300),
	`maxAttendees` int,
	`attendeeCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `featureFlags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`enabled` int unsigned NOT NULL DEFAULT 0,
	`rolloutPercentage` int NOT NULL DEFAULT 0,
	`targetUserIds` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `featureFlags_id` PRIMARY KEY(`id`),
	CONSTRAINT `featureFlags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('social','professional','creative','private','custom') NOT NULL,
	`visibility` enum('public','semi-public','private','ai-only') NOT NULL DEFAULT 'public',
	`layoutConfig` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communityId` int NOT NULL,
	`authorId` int NOT NULL,
	`content` text NOT NULL,
	`type` enum('text','image','video','link','event') NOT NULL DEFAULT 'text',
	`mediaUrls` text,
	`reactionCount` int NOT NULL DEFAULT 0,
	`replyCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `widgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`position` text NOT NULL,
	`config` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `widgets_id` PRIMARY KEY(`id`)
);
