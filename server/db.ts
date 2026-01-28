import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  pages, 
  InsertPage,
  widgets,
  InsertWidget,
  communities,
  InsertCommunity,
  communityMembers,
  InsertCommunityMember,
  posts,
  InsertPost,
  connections,
  InsertConnection,
  aiCompanions,
  InsertAiCompanion,
  featureFlags,
  InsertFeatureFlag,
  events,
  InsertEvent,
  eventRsvps,
  InsertEventRsvp
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER MANAGEMENT =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "bio", "avatarUrl", "preferences"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, updates: { name?: string; bio?: string; avatarUrl?: string; preferences?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(updates).where(eq(users.id, userId));
}

// ============= PAGE MANAGEMENT =============

export async function createPage(page: InsertPage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(pages).values(page);
  return result;
}

export async function getUserPages(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pages).where(eq(pages.userId, userId)).orderBy(desc(pages.createdAt));
}

export async function getPageById(pageId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePage(pageId: number, updates: Partial<InsertPage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(pages).set(updates).where(eq(pages.id, pageId));
}

export async function deletePage(pageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete associated widgets first
  await db.delete(widgets).where(eq(widgets.pageId, pageId));
  // Delete the page
  await db.delete(pages).where(eq(pages.id, pageId));
}

// ============= WIDGET MANAGEMENT =============

export async function createWidget(widget: InsertWidget) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(widgets).values(widget);
  return result;
}

export async function getPageWidgets(pageId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(widgets).where(eq(widgets.pageId, pageId));
}

export async function updateWidget(widgetId: number, updates: Partial<InsertWidget>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(widgets).set(updates).where(eq(widgets.id, widgetId));
}

export async function deleteWidget(widgetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(widgets).where(eq(widgets.id, widgetId));
}

// ============= COMMUNITY MANAGEMENT =============

export async function createCommunity(community: InsertCommunity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(communities).values(community);
  const insertId = (result as any)[0]?.insertId;
  
  // Automatically add creator as owner
  if (insertId) {
    await db.insert(communityMembers).values({
      communityId: Number(insertId),
      userId: community.creatorId,
      role: 'owner'
    });
  }
  
  return result;
}

export async function getCommunityById(communityId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCommunities(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(communities).where(eq(communities.visibility, 'public')).orderBy(desc(communities.memberCount)).limit(limit);
}

export async function getUserCommunities(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: communities.id,
      name: communities.name,
      description: communities.description,
      type: communities.type,
      visibility: communities.visibility,
      creatorId: communities.creatorId,
      avatarUrl: communities.avatarUrl,
      memberCount: communities.memberCount,
      createdAt: communities.createdAt,
      updatedAt: communities.updatedAt,
      role: communityMembers.role,
      joinedAt: communityMembers.joinedAt
    })
    .from(communityMembers)
    .innerJoin(communities, eq(communityMembers.communityId, communities.id))
    .where(eq(communityMembers.userId, userId))
    .orderBy(desc(communityMembers.joinedAt));

  return result;
}

export async function joinCommunity(communityId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(communityMembers).values({
    communityId,
    userId,
    role: 'member'
  });

  // Increment member count
  await db.update(communities)
    .set({ memberCount: sql`${communities.memberCount} + 1` })
    .where(eq(communities.id, communityId));
}

export async function leaveCommunity(communityId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(communityMembers)
    .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, userId)));

  // Decrement member count
  await db.update(communities)
    .set({ memberCount: sql`${communities.memberCount} - 1` })
    .where(eq(communities.id, communityId));
}

// ============= POST MANAGEMENT =============

export async function createPost(post: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(posts).values(post);
  return result;
}

export async function getCommunityPosts(communityId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: posts.id,
      communityId: posts.communityId,
      authorId: posts.authorId,
      content: posts.content,
      type: posts.type,
      mediaUrls: posts.mediaUrls,
      reactionCount: posts.reactionCount,
      replyCount: posts.replyCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorName: users.name,
      authorAvatar: users.avatarUrl
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.communityId, communityId))
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  return result;
}

// ============= CONNECTION MANAGEMENT =============

export async function createConnectionRequest(requesterId: number, receiverId: number, compatibilityScore?: number, sharedInterests?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(connections).values({
    requesterId,
    receiverId,
    compatibilityScore,
    sharedInterests,
    status: 'pending'
  });
  return result;
}

export async function getUserConnections(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get connections where user is either requester or receiver and status is accepted
  const result = await db
    .select()
    .from(connections)
    .where(
      and(
        sql`(${connections.requesterId} = ${userId} OR ${connections.receiverId} = ${userId})`,
        eq(connections.status, 'accepted')
      )
    )
    .orderBy(desc(connections.updatedAt));

  return result;
}

export async function updateConnectionStatus(connectionId: number, status: 'accepted' | 'rejected' | 'blocked') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(connections).set({ status }).where(eq(connections.id, connectionId));
}

// ============= AI COMPANION MANAGEMENT =============

export async function createAiCompanion(companion: InsertAiCompanion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(aiCompanions).values(companion);
  return result;
}

export async function getAiCompanionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(aiCompanions).where(eq(aiCompanions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAiCompanion(userId: number, updates: Partial<InsertAiCompanion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(aiCompanions).set(updates).where(eq(aiCompanions.userId, userId));
}

// ============= FEATURE FLAG MANAGEMENT =============

export async function createFeatureFlag(flag: InsertFeatureFlag) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(featureFlags).values(flag);
  return result;
}

export async function getAllFeatureFlags() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(featureFlags);
}

export async function getFeatureFlagByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(featureFlags).where(eq(featureFlags.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateFeatureFlag(flagId: number, updates: Partial<InsertFeatureFlag>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(featureFlags).set(updates).where(eq(featureFlags.id, flagId));
}

export async function isFeatureEnabled(featureName: string, userId?: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const flag = await getFeatureFlagByName(featureName);
  if (!flag || !flag.enabled) return false;

  // Check if user is in target list
  if (userId && flag.targetUserIds) {
    try {
      const targetIds = JSON.parse(flag.targetUserIds);
      if (Array.isArray(targetIds) && targetIds.length > 0) {
        return targetIds.includes(userId);
      }
    } catch (e) {
      console.error("Failed to parse targetUserIds", e);
    }
  }

  // Check rollout percentage
  if (flag.rolloutPercentage === 100) return true;
  if (flag.rolloutPercentage === 0) return false;

  // Simple percentage-based rollout (in production, use consistent hashing)
  if (userId) {
    return (userId % 100) < flag.rolloutPercentage;
  }

  return false;
}

// ============= EVENT MANAGEMENT =============

export async function createEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(events).values(event);
  return result;
}

export async function getCommunityEvents(communityId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(events).where(eq(events.communityId, communityId)).orderBy(events.startTime);
}

export async function createEventRsvp(rsvp: InsertEventRsvp) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(eventRsvps).values(rsvp);
  
  // Increment attendee count if status is 'going'
  if (rsvp.status === 'going') {
    await db.update(events)
      .set({ attendeeCount: sql`${events.attendeeCount} + 1` })
      .where(eq(events.id, rsvp.eventId));
  }
  
  return result;
}

export async function getUserEventRsvps(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: eventRsvps.id,
      eventId: eventRsvps.eventId,
      userId: eventRsvps.userId,
      status: eventRsvps.status,
      createdAt: eventRsvps.createdAt,
      updatedAt: eventRsvps.updatedAt,
      eventTitle: events.title,
      eventStartTime: events.startTime,
      eventType: events.type,
      communityId: events.communityId
    })
    .from(eventRsvps)
    .innerJoin(events, eq(eventRsvps.eventId, events.id))
    .where(eq(eventRsvps.userId, userId))
    .orderBy(events.startTime);

  return result;
}
