import { integer, pgTable, text, timestamp, varchar, serial, boolean } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Unique identifier for the user */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  bio: text("bio"),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  preferences: text("preferences"), // JSON: user preferences
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User pages - users can create multiple personalized pages
 */
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "social", "professional", "creative", "private", "custom"
  visibility: varchar("visibility", { length: 20 }).default("public").notNull(), // "public", "semi-public", "private", "ai-only"
  layoutConfig: text("layoutConfig"), // JSON string for grid layout
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

/**
 * Widgets - individual widget instances on pages
 */
export const widgets = pgTable("widgets", {
  id: serial("id").primaryKey(),
  pageId: integer("pageId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // e.g., "community-feed", "calendar", "notes"
  position: text("position").notNull(), // JSON: {x, y, w, h}
  config: text("config"), // JSON: widget-specific configuration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Widget = typeof widgets.$inferSelect;
export type InsertWidget = typeof widgets.$inferInsert;

/**
 * Communities - interest-based groups
 */
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 30 }).notNull(), // "interest", "emotional", "lifestyle", "goal", "dating", "mental-health", "creator", "general"
  visibility: varchar("visibility", { length: 20 }).default("public").notNull(), // "public", "private", "invite-only"
  creatorId: integer("creatorId").notNull(),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  memberCount: integer("memberCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Community = typeof communities.$inferSelect;
export type InsertCommunity = typeof communities.$inferInsert;

/**
 * Community members - tracks membership and roles
 */
export const communityMembers = pgTable("communityMembers", {
  id: serial("id").primaryKey(),
  communityId: integer("communityId").notNull(),
  userId: integer("userId").notNull(),
  role: varchar("role", { length: 20 }).default("member").notNull(), // "owner", "moderator", "member"
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type CommunityMember = typeof communityMembers.$inferSelect;
export type InsertCommunityMember = typeof communityMembers.$inferInsert;

/**
 * Posts - content within communities
 */
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  communityId: integer("communityId").notNull(),
  authorId: integer("authorId").notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 20 }).default("text").notNull(), // "text", "image", "video", "link", "event"
  mediaUrls: text("mediaUrls"), // JSON array of media URLs
  reactionCount: integer("reactionCount").default(0).notNull(), // Private count, not shown publicly
  replyCount: integer("replyCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Connections - user relationships without clout metrics
 */
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  requesterId: integer("requesterId").notNull(),
  receiverId: integer("receiverId").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // "pending", "accepted", "rejected", "blocked"
  compatibilityScore: integer("compatibilityScore"), // AI-generated, private
  sharedInterests: text("sharedInterests"), // JSON array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = typeof connections.$inferInsert;

/**
 * Feature Flags - server-side feature control
 */
export const featureFlags = pgTable("featureFlags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  enabled: boolean("enabled").default(false).notNull(),
  rolloutPercentage: integer("rolloutPercentage").default(0).notNull(), // 0-100 for gradual rollout
  targetUserIds: text("targetUserIds"), // JSON array for specific users
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;

/**
 * Events - community events
 */
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  communityId: integer("communityId").notNull(),
  creatorId: integer("creatorId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).notNull(), // "online", "in-person", "hybrid"
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  location: varchar("location", { length: 300 }),
  maxAttendees: integer("maxAttendees"),
  attendeeCount: integer("attendeeCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Event RSVPs
 */
export const eventRsvps = pgTable("eventRsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("eventId").notNull(),
  userId: integer("userId").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // "going", "interested", "not-going"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = typeof eventRsvps.$inferInsert;

/**
 * Discussion Threads - threaded conversations in communities
 */
export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  communityId: integer("communityId").notNull(),
  authorId: integer("authorId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  isPinned: boolean("isPinned").default(false).notNull(),
  replyCount: integer("replyCount").default(0).notNull(),
  viewCount: integer("viewCount").default(0).notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Thread = typeof threads.$inferSelect;
export type InsertThread = typeof threads.$inferInsert;

/**
 * Thread Replies - nested replies in discussion threads
 */
export const threadReplies = pgTable("threadReplies", {
  id: serial("id").primaryKey(),
  threadId: integer("threadId").notNull(),
  authorId: integer("authorId").notNull(),
  parentReplyId: integer("parentReplyId"), // null for top-level replies
  content: text("content").notNull(),
  depth: integer("depth").default(0).notNull(), // nesting level
  reactionCount: integer("reactionCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ThreadReply = typeof threadReplies.$inferSelect;
export type InsertThreadReply = typeof threadReplies.$inferInsert;

/**
 * Reactions - reactions to posts, threads, and replies
 */
export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  targetType: varchar("targetType", { length: 20 }).notNull(), // "post", "thread", "reply"
  targetId: integer("targetId").notNull(),
  reactionType: varchar("reactionType", { length: 50 }).notNull(), // emoji or reaction name
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = typeof reactions.$inferInsert;

/**
 * Community Widgets - custom widgets for community spaces
 */
export const communityWidgets = pgTable("communityWidgets", {
  id: serial("id").primaryKey(),
  communityId: integer("communityId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "announcement", "poll", "resources", "members", "custom"
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"), // JSON or text content
  position: integer("position").default(0).notNull(), // display order
  isVisible: boolean("isVisible").default(true).notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CommunityWidget = typeof communityWidgets.$inferSelect;
export type InsertCommunityWidget = typeof communityWidgets.$inferInsert;

/**
 * Community Templates - pre-built community layouts
 */
export const communityTemplates = pgTable("communityTemplates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 30 }).notNull(), // "fan-club", "workshop", "professional", "study-group", "creator", "general"
  widgetConfig: text("widgetConfig"), // JSON: default widgets for this template
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommunityTemplate = typeof communityTemplates.$inferSelect;
export type InsertCommunityTemplate = typeof communityTemplates.$inferInsert;
