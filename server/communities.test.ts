import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    bio: null,
    avatarUrl: null,
    preferences: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Community Features", () => {
  it("should create a new community", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.communities.create({
      name: "Test Community",
      description: "A test community for unit testing",
      type: "interest",
      visibility: "public",
    });

    expect(result.success).toBe(true);
    expect(result.communityId).toBeDefined();
  });

  it("should list public communities", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const communities = await caller.communities.list({ limit: 10 });

    expect(Array.isArray(communities)).toBe(true);
  });

  it("should get community by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a community first
    const createResult = await caller.communities.create({
      name: "Test Community for Get",
      description: "Testing get operation",
      type: "creator",
      visibility: "public",
    });

    // Get the community
    const community = await caller.communities.get({
      communityId: (createResult.communityId as any)[0]?.insertId || 1,
    });

    expect(community).toBeDefined();
  });
});

describe("Discussion Threads", () => {
  it("should create a new thread", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a community first
    const communityResult = await caller.communities.create({
      name: "Thread Test Community",
      description: "For testing threads",
      type: "general",
      visibility: "public",
    });

    const communityId = (communityResult.communityId as any)[0]?.insertId || 1;

    // Create a thread
    const threadResult = await caller.threads.create({
      communityId,
      title: "Test Thread",
      content: "This is a test thread content",
    });

    expect(threadResult.success).toBe(true);
    expect(threadResult.threadId).toBeDefined();
  });

  it("should list threads in a community", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const threads = await caller.threads.list({
      communityId: 1,
      limit: 10,
    });

    expect(Array.isArray(threads)).toBe(true);
  });
});

describe("Thread Replies", () => {
  it("should create a reply to a thread", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create community and thread first
    const communityResult = await caller.communities.create({
      name: "Reply Test Community",
      description: "For testing replies",
      type: "general",
      visibility: "public",
    });

    const communityId = (communityResult.communityId as any)[0]?.insertId || 1;

    const threadResult = await caller.threads.create({
      communityId,
      title: "Test Thread for Replies",
      content: "Thread content",
    });

    const threadId = (threadResult.threadId as any)[0]?.insertId || 1;

    // Create a reply
    const replyResult = await caller.threadReplies.create({
      threadId,
      content: "This is a test reply",
      depth: 0,
    });

    expect(replyResult.success).toBe(true);
    expect(replyResult.replyId).toBeDefined();
  });

  it("should list replies for a thread", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const replies = await caller.threadReplies.list({
      threadId: 1,
    });

    expect(Array.isArray(replies)).toBe(true);
  });
});

describe("Pages and Widgets", () => {
  it("should create a new page", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.pages.create({
      name: "My Test Page",
      type: "social",
      visibility: "public",
    });

    expect(result.success).toBe(true);
    expect(result.pageId).toBeDefined();
  });

  it("should list user pages", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const pages = await caller.pages.list();

    expect(Array.isArray(pages)).toBe(true);
  });

  it("should create a widget on a page", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a page first
    const pageResult = await caller.pages.create({
      name: "Widget Test Page",
      type: "social",
      visibility: "public",
    });

    const pageId = (pageResult.pageId as any)[0]?.insertId || 1;

    // Create a widget
    const widgetResult = await caller.widgets.create({
      pageId,
      type: "ai-companion",
      position: JSON.stringify({ x: 0, y: 0, w: 2, h: 2 }),
    });

    expect(widgetResult.success).toBe(true);
    expect(widgetResult.widgetId).toBeDefined();
  });
});

describe("Community Widgets", () => {
  it("should create a community widget", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a community first
    const communityResult = await caller.communities.create({
      name: "Widget Test Community",
      description: "For testing community widgets",
      type: "general",
      visibility: "public",
    });

    const communityId = (communityResult.communityId as any)[0]?.insertId || 1;

    // Create a community widget
    const widgetResult = await caller.communityWidgets.create({
      communityId,
      type: "announcement",
      title: "Welcome!",
      content: "Welcome to our community",
      position: 0,
    });

    expect(widgetResult.success).toBe(true);
    expect(widgetResult.widgetId).toBeDefined();
  });

  it("should list community widgets", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const widgets = await caller.communityWidgets.list({
      communityId: 1,
    });

    expect(Array.isArray(widgets)).toBe(true);
  });
});
