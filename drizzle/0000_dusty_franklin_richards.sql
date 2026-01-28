CREATE TABLE "communities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"type" varchar(30) NOT NULL,
	"visibility" varchar(20) DEFAULT 'public' NOT NULL,
	"creatorId" integer NOT NULL,
	"avatarUrl" varchar(500),
	"memberCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communityMembers" (
	"id" serial PRIMARY KEY NOT NULL,
	"communityId" integer NOT NULL,
	"userId" integer NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communityTemplates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"category" varchar(30) NOT NULL,
	"widgetConfig" text,
	"isPublic" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communityWidgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"communityId" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text,
	"position" integer DEFAULT 0 NOT NULL,
	"isVisible" boolean DEFAULT true NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"requesterId" integer NOT NULL,
	"receiverId" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"compatibilityScore" integer,
	"sharedInterests" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eventRsvps" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventId" integer NOT NULL,
	"userId" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"communityId" integer NOT NULL,
	"creatorId" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"type" varchar(20) NOT NULL,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp,
	"location" varchar(300),
	"maxAttendees" integer,
	"attendeeCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "featureFlags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT false NOT NULL,
	"rolloutPercentage" integer DEFAULT 0 NOT NULL,
	"targetUserIds" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "featureFlags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"visibility" varchar(20) DEFAULT 'public' NOT NULL,
	"layoutConfig" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"communityId" integer NOT NULL,
	"authorId" integer NOT NULL,
	"content" text NOT NULL,
	"type" varchar(20) DEFAULT 'text' NOT NULL,
	"mediaUrls" text,
	"reactionCount" integer DEFAULT 0 NOT NULL,
	"replyCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"targetType" varchar(20) NOT NULL,
	"targetId" integer NOT NULL,
	"reactionType" varchar(50) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "threadReplies" (
	"id" serial PRIMARY KEY NOT NULL,
	"threadId" integer NOT NULL,
	"authorId" integer NOT NULL,
	"parentReplyId" integer,
	"content" text NOT NULL,
	"depth" integer DEFAULT 0 NOT NULL,
	"reactionCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"communityId" integer NOT NULL,
	"authorId" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"isPinned" boolean DEFAULT false NOT NULL,
	"replyCount" integer DEFAULT 0 NOT NULL,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"lastActivityAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"bio" text,
	"avatarUrl" varchar(500),
	"preferences" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "widgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"pageId" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"position" text NOT NULL,
	"config" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
