import { eq, desc, and, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  threads,
  InsertThread,
  threadReplies,
  InsertThreadReply,
  reactions,
  InsertReaction,
  communityWidgets,
  InsertCommunityWidget,
  users,
} from "../drizzle/schema";

// ============= THREAD MANAGEMENT =============

export async function createThread(thread: InsertThread) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(threads).values(thread);
  return result;
}

export async function getCommunityThreads(communityId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: threads.id,
      communityId: threads.communityId,
      authorId: threads.authorId,
      title: threads.title,
      content: threads.content,
      isPinned: threads.isPinned,
      replyCount: threads.replyCount,
      viewCount: threads.viewCount,
      lastActivityAt: threads.lastActivityAt,
      createdAt: threads.createdAt,
      updatedAt: threads.updatedAt,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(threads)
    .innerJoin(users, eq(threads.authorId, users.id))
    .where(eq(threads.communityId, communityId))
    .orderBy(desc(threads.isPinned), desc(threads.lastActivityAt))
    .limit(limit);

  return result;
}

export async function getThreadById(threadId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      id: threads.id,
      communityId: threads.communityId,
      authorId: threads.authorId,
      title: threads.title,
      content: threads.content,
      isPinned: threads.isPinned,
      replyCount: threads.replyCount,
      viewCount: threads.viewCount,
      lastActivityAt: threads.lastActivityAt,
      createdAt: threads.createdAt,
      updatedAt: threads.updatedAt,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(threads)
    .innerJoin(users, eq(threads.authorId, users.id))
    .where(eq(threads.id, threadId))
    .limit(1);

  if (result.length > 0) {
    // Increment view count
    await db.update(threads)
      .set({ viewCount: sql`${threads.viewCount} + 1` })
      .where(eq(threads.id, threadId));
  }

  return result.length > 0 ? result[0] : undefined;
}

export async function updateThread(threadId: number, updates: Partial<InsertThread>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(threads).set(updates).where(eq(threads.id, threadId));
}

export async function deleteThread(threadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete all replies first
  await db.delete(threadReplies).where(eq(threadReplies.threadId, threadId));
  // Delete the thread
  await db.delete(threads).where(eq(threads.id, threadId));
}

// ============= THREAD REPLY MANAGEMENT =============

export async function createThreadReply(reply: InsertThreadReply) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(threadReplies).values(reply);

  // Increment thread reply count
  await db.update(threads)
    .set({
      replyCount: sql`${threads.replyCount} + 1`,
      lastActivityAt: new Date(),
    })
    .where(eq(threads.id, reply.threadId));

  return result;
}

export async function getThreadReplies(threadId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: threadReplies.id,
      threadId: threadReplies.threadId,
      authorId: threadReplies.authorId,
      parentReplyId: threadReplies.parentReplyId,
      content: threadReplies.content,
      depth: threadReplies.depth,
      reactionCount: threadReplies.reactionCount,
      createdAt: threadReplies.createdAt,
      updatedAt: threadReplies.updatedAt,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(threadReplies)
    .innerJoin(users, eq(threadReplies.authorId, users.id))
    .where(eq(threadReplies.threadId, threadId))
    .orderBy(threadReplies.createdAt);

  return result;
}

export async function deleteThreadReply(replyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the reply to find the thread
  const reply = await db.select().from(threadReplies).where(eq(threadReplies.id, replyId)).limit(1);
  
  if (reply.length > 0) {
    await db.delete(threadReplies).where(eq(threadReplies.id, replyId));
    
    // Decrement thread reply count
    await db.update(threads)
      .set({ replyCount: sql`${threads.replyCount} - 1` })
      .where(eq(threads.id, reply[0].threadId));
  }
}

// ============= REACTION MANAGEMENT =============

export async function addReaction(reaction: InsertReaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if reaction already exists
  const existing = await db
    .select()
    .from(reactions)
    .where(
      and(
        eq(reactions.userId, reaction.userId),
        eq(reactions.targetType, reaction.targetType),
        eq(reactions.targetId, reaction.targetId),
        eq(reactions.reactionType, reaction.reactionType)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove reaction if it exists (toggle)
    await db.delete(reactions).where(eq(reactions.id, existing[0].id));
    return { action: "removed" };
  } else {
    // Add new reaction
    await db.insert(reactions).values(reaction);
    
    // Increment reaction count on target
    if (reaction.targetType === "thread") {
      // Threads don't have reaction count, but we could add it
    } else if (reaction.targetType === "reply") {
      await db.update(threadReplies)
        .set({ reactionCount: sql`${threadReplies.reactionCount} + 1` })
        .where(eq(threadReplies.id, reaction.targetId));
    }
    
    return { action: "added" };
  }
}

export async function getReactions(targetType: "post" | "thread" | "reply", targetId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reactions)
    .where(and(eq(reactions.targetType, targetType), eq(reactions.targetId, targetId)));
}

// ============= COMMUNITY WIDGET MANAGEMENT =============

export async function createCommunityWidget(widget: InsertCommunityWidget) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(communityWidgets).values(widget);
  return result;
}

export async function getCommunityWidgets(communityId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(communityWidgets)
    .where(and(eq(communityWidgets.communityId, communityId), eq(communityWidgets.isVisible, 1)))
    .orderBy(communityWidgets.position);
}

export async function updateCommunityWidget(widgetId: number, updates: Partial<InsertCommunityWidget>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(communityWidgets).set(updates).where(eq(communityWidgets.id, widgetId));
}

export async function deleteCommunityWidget(widgetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(communityWidgets).where(eq(communityWidgets.id, widgetId));
}
