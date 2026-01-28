import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  bio: text("bio"),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  preferences: text("preferences"), // JSON: user preferences
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User pages - users can create multiple personalized pages
 */
export const pages = mysqlTable("pages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["social", "professional", "creative", "private", "custom"]).notNull(),
  visibility: mysqlEnum("visibility", ["public", "semi-public", "private", "ai-only"]).default("public").notNull(),
  layoutConfig: text("layoutConfig"), // JSON string for grid layout
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

/**
 * Widgets - individual widget instances on pages
 */
export const widgets = mysqlTable("widgets", {
  id: int("id").autoincrement().primaryKey(),
  pageId: int("pageId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // e.g., "ai-companion", "community-feed", "calendar", "notes"
  position: text("position").notNull(), // JSON: {x, y, w, h}
  config: text("config"), // JSON: widget-specific configuration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Widget = typeof widgets.$inferSelect;
export type InsertWidget = typeof widgets.$inferInsert;

/**
 * Communities - interest-based groups
 */
export const communities = mysqlTable("communities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["interest", "emotional", "lifestyle", "goal", "dating", "mental-health", "creator", "general"]).notNull(),
  visibility: mysqlEnum("visibility", ["public", "private", "invite-only"]).default("public").notNull(),
  creatorId: int("creatorId").notNull(),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  memberCount: int("memberCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Community = typeof communities.$inferSelect;
export type InsertCommunity = typeof communities.$inferInsert;

/**
 * Community members - tracks membership and roles
 */
export const communityMembers = mysqlTable("communityMembers", {
  id: int("id").autoincrement().primaryKey(),
  communityId: int("communityId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "moderator", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type CommunityMember = typeof communityMembers.$inferSelect;
export type InsertCommunityMember = typeof communityMembers.$inferInsert;

/**
 * Posts - content within communities
 */
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  communityId: int("communityId").notNull(),
  authorId: int("authorId").notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["text", "image", "video", "link", "event"]).default("text").notNull(),
  mediaUrls: text("mediaUrls"), // JSON array of media URLs
  reactionCount: int("reactionCount").default(0).notNull(), // Private count, not shown publicly
  replyCount: int("replyCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Connections - user relationships without clout metrics
 */
export const connections = mysqlTable("connections", {
  id: int("id").autoincrement().primaryKey(),
  requesterId: int("requesterId").notNull(),
  receiverId: int("receiverId").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "blocked"]).default("pending").notNull(),
  compatibilityScore: int("compatibilityScore"), // AI-generated, private
  sharedInterests: text("sharedInterests"), // JSON array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = typeof connections.$inferInsert;

/**
 * AI Companions - personalized AI assistant configuration
 */
export const aiCompanions = mysqlTable("aiCompanions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  name: varchar("name", { length: 50 }).default("NEX").notNull(),
  avatarType: varchar("avatarType", { length: 50 }).default("default").notNull(),
  voiceMode: mysqlEnum("voiceMode", ["speak", "guide", "silent", "muted"]).default("guide").notNull(),
  personalityConfig: text("personalityConfig"), // JSON: personality traits
  onboardingProgress: text("onboardingProgress"), // JSON: features introduced
  preferences: text("preferences"), // JSON: user preferences for AI behavior
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiCompanion = typeof aiCompanions.$inferSelect;
export type InsertAiCompanion = typeof aiCompanions.$inferInsert;

/**
 * Feature Flags - server-side feature control
 */
export const featureFlags = mysqlTable("featureFlags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  enabled: int("enabled", { unsigned: true }).default(0).notNull(), // 0 = disabled, 1 = enabled
  rolloutPercentage: int("rolloutPercentage").default(0).notNull(), // 0-100 for gradual rollout
  targetUserIds: text("targetUserIds"), // JSON array for specific users
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;

/**
 * Events - community events
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  communityId: int("communityId").notNull(),
  creatorId: int("creatorId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["online", "in-person", "hybrid"]).notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  location: varchar("location", { length: 300 }),
  maxAttendees: int("maxAttendees"),
  attendeeCount: int("attendeeCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Event RSVPs
 */
export const eventRsvps = mysqlTable("eventRsvps", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["going", "interested", "not-going"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = typeof eventRsvps.$inferInsert;

/**
 * Discussion Threads - threaded conversations in communities
 */
export const threads = mysqlTable("threads", {
  id: int("id").autoincrement().primaryKey(),
  communityId: int("communityId").notNull(),
  authorId: int("authorId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  isPinned: int("isPinned", { unsigned: true }).default(0).notNull(),
  replyCount: int("replyCount").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Thread = typeof threads.$inferSelect;
export type InsertThread = typeof threads.$inferInsert;

/**
 * Thread Replies - nested replies in discussion threads
 */
export const threadReplies = mysqlTable("threadReplies", {
  id: int("id").autoincrement().primaryKey(),
  threadId: int("threadId").notNull(),
  authorId: int("authorId").notNull(),
  parentReplyId: int("parentReplyId"), // null for top-level replies
  content: text("content").notNull(),
  depth: int("depth").default(0).notNull(), // nesting level
  reactionCount: int("reactionCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ThreadReply = typeof threadReplies.$inferSelect;
export type InsertThreadReply = typeof threadReplies.$inferInsert;

/**
 * Reactions - reactions to posts, threads, and replies
 */
export const reactions = mysqlTable("reactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  targetType: mysqlEnum("targetType", ["post", "thread", "reply"]).notNull(),
  targetId: int("targetId").notNull(),
  reactionType: varchar("reactionType", { length: 50 }).notNull(), // emoji or reaction name
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = typeof reactions.$inferInsert;

/**
 * Community Widgets - custom widgets for community spaces
 */
export const communityWidgets = mysqlTable("communityWidgets", {
  id: int("id").autoincrement().primaryKey(),
  communityId: int("communityId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "announcement", "poll", "resources", "members", "custom"
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"), // JSON or text content
  position: int("position").default(0).notNull(), // display order
  isVisible: int("isVisible", { unsigned: true }).default(1).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityWidget = typeof communityWidgets.$inferSelect;
export type InsertCommunityWidget = typeof communityWidgets.$inferInsert;

/**
 * Community Templates - pre-built community layouts
 */
export const communityTemplates = mysqlTable("communityTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["fan-club", "workshop", "professional", "study-group", "creator", "general"]).notNull(),
  widgetConfig: text("widgetConfig"), // JSON: default widgets for this template
  isPublic: int("isPublic", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommunityTemplate = typeof communityTemplates.$inferSelect;
export type InsertCommunityTemplate = typeof communityTemplates.$inferInsert;