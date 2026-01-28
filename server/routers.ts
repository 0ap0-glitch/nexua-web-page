import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as dbThreads from "./dbThreads";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============= USER PROFILE =============
  user: router({
    getProfile: protectedProcedure
      .input(z.object({ userId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const userId = input.userId || ctx.user.id;
        return await db.getUserById(userId);
      }),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        avatarUrl: z.string().optional(),
        preferences: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ============= PAGE MANAGEMENT =============
  pages: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserPages(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ pageId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPageById(input.pageId);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(["social", "professional", "creative", "private", "custom"]),
        visibility: z.enum(["public", "semi-public", "private", "ai-only"]).default("public"),
        layoutConfig: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createPage({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true, pageId: result };
      }),

    update: protectedProcedure
      .input(z.object({
        pageId: z.number(),
        name: z.string().optional(),
        type: z.enum(["social", "professional", "creative", "private", "custom"]).optional(),
        visibility: z.enum(["public", "semi-public", "private", "ai-only"]).optional(),
        layoutConfig: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { pageId, ...updates } = input;
        await db.updatePage(pageId, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ pageId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePage(input.pageId);
        return { success: true };
      }),
  }),

  // ============= WIDGET MANAGEMENT =============
  widgets: router({
    list: protectedProcedure
      .input(z.object({ pageId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPageWidgets(input.pageId);
      }),

    create: protectedProcedure
      .input(z.object({
        pageId: z.number(),
        type: z.string(),
        position: z.string(), // JSON string
        config: z.string().optional(), // JSON string
      }))
      .mutation(async ({ input }) => {
        const result = await db.createWidget(input);
        return { success: true, widgetId: result };
      }),

    update: protectedProcedure
      .input(z.object({
        widgetId: z.number(),
        position: z.string().optional(),
        config: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { widgetId, ...updates } = input;
        await db.updateWidget(widgetId, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ widgetId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteWidget(input.widgetId);
        return { success: true };
      }),
  }),

  // ============= COMMUNITY MANAGEMENT =============
  communities: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await db.getAllCommunities(input.limit);
      }),

    get: publicProcedure
      .input(z.object({ communityId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCommunityById(input.communityId);
      }),

    myCommunities: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserCommunities(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        type: z.enum(["interest", "emotional", "lifestyle", "goal", "dating", "mental-health", "creator", "general"]),
        visibility: z.enum(["public", "private", "invite-only"]).default("public"),
        avatarUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createCommunity({
          ...input,
          creatorId: ctx.user.id,
        });
        return { success: true, communityId: result };
      }),

    join: protectedProcedure
      .input(z.object({ communityId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.joinCommunity(input.communityId, ctx.user.id);
        return { success: true };
      }),

    leave: protectedProcedure
      .input(z.object({ communityId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.leaveCommunity(input.communityId, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============= POST MANAGEMENT =============
  posts: router({
    list: publicProcedure
      .input(z.object({
        communityId: z.number(),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        return await db.getCommunityPosts(input.communityId, input.limit);
      }),

    create: protectedProcedure
      .input(z.object({
        communityId: z.number(),
        content: z.string(),
        type: z.enum(["text", "image", "video", "link", "event"]).default("text"),
        mediaUrls: z.string().optional(), // JSON array
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createPost({
          ...input,
          authorId: ctx.user.id,
        });
        return { success: true, postId: result };
      }),
  }),

  // ============= CONNECTION MANAGEMENT =============
  connections: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserConnections(ctx.user.id);
    }),

    request: protectedProcedure
      .input(z.object({
        receiverId: z.number(),
        compatibilityScore: z.number().optional(),
        sharedInterests: z.string().optional(), // JSON array
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createConnectionRequest(
          ctx.user.id,
          input.receiverId,
          input.compatibilityScore,
          input.sharedInterests
        );
        return { success: true, connectionId: result };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        connectionId: z.number(),
        status: z.enum(["accepted", "rejected", "blocked"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateConnectionStatus(input.connectionId, input.status);
        return { success: true };
      }),
  }),

  // ============= AI COMPANION =============
  aiCompanion: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      let companion = await db.getAiCompanionByUserId(ctx.user.id);
      
      // Create default companion if doesn't exist
      if (!companion) {
        await db.createAiCompanion({
          userId: ctx.user.id,
          name: "NEX",
          avatarType: "default",
          voiceMode: "guide",
        });
        companion = await db.getAiCompanionByUserId(ctx.user.id);
      }
      
      return companion;
    }),

    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        avatarType: z.string().optional(),
        voiceMode: z.enum(["speak", "guide", "silent", "muted"]).optional(),
        personalityConfig: z.string().optional(),
        onboardingProgress: z.string().optional(),
        preferences: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateAiCompanion(ctx.user.id, input);
        return { success: true };
      }),

    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
        context: z.string().optional(), // JSON: conversation context
      }))
      .mutation(async ({ ctx, input }) => {
        // Get AI companion config
        const companion = await db.getAiCompanionByUserId(ctx.user.id);
        
        // TODO: Implement LLM integration for AI chat
        // For now, return a placeholder response
        return {
          response: `Hello ${ctx.user.name}, I'm ${companion?.name || 'NEX'}, your AI companion. This feature is coming soon!`,
          timestamp: new Date(),
        };
      }),
  }),

  // ============= FEATURE FLAGS =============
  featureFlags: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      // Only admins can see all feature flags
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return await db.getAllFeatureFlags();
    }),

    check: protectedProcedure
      .input(z.object({ featureName: z.string() }))
      .query(async ({ ctx, input }) => {
        const enabled = await db.isFeatureEnabled(input.featureName, ctx.user.id);
        return { enabled };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        enabled: z.number().default(0),
        rolloutPercentage: z.number().default(0),
        targetUserIds: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const result = await db.createFeatureFlag(input);
        return { success: true, flagId: result };
      }),

    update: protectedProcedure
      .input(z.object({
        flagId: z.number(),
        enabled: z.number().optional(),
        rolloutPercentage: z.number().optional(),
        targetUserIds: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const { flagId, ...updates } = input;
        await db.updateFeatureFlag(flagId, updates);
        return { success: true };
      }),
  }),

  // ============= DISCUSSION THREADS =============
  threads: router({
    list: publicProcedure
      .input(z.object({ communityId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await dbThreads.getCommunityThreads(input.communityId, input.limit);
      }),

    get: publicProcedure
      .input(z.object({ threadId: z.number() }))
      .query(async ({ input }) => {
        return await dbThreads.getThreadById(input.threadId);
      }),

    create: protectedProcedure
      .input(z.object({
        communityId: z.number(),
        title: z.string(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await dbThreads.createThread({
          ...input,
          authorId: ctx.user.id,
        });
        return { success: true, threadId: result };
      }),

    update: protectedProcedure
      .input(z.object({
        threadId: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        isPinned: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { threadId, ...updates } = input;
        await dbThreads.updateThread(threadId, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ threadId: z.number() }))
      .mutation(async ({ input }) => {
        await dbThreads.deleteThread(input.threadId);
        return { success: true };
      }),
  }),

  // ============= THREAD REPLIES =============
  threadReplies: router({
    list: publicProcedure
      .input(z.object({ threadId: z.number() }))
      .query(async ({ input }) => {
        return await dbThreads.getThreadReplies(input.threadId);
      }),

    create: protectedProcedure
      .input(z.object({
        threadId: z.number(),
        content: z.string(),
        parentReplyId: z.number().optional(),
        depth: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await dbThreads.createThreadReply({
          ...input,
          authorId: ctx.user.id,
        });
        return { success: true, replyId: result };
      }),

    delete: protectedProcedure
      .input(z.object({ replyId: z.number() }))
      .mutation(async ({ input }) => {
        await dbThreads.deleteThreadReply(input.replyId);
        return { success: true };
      }),
  }),

  // ============= REACTIONS =============
  reactions: router({
    add: protectedProcedure
      .input(z.object({
        targetType: z.enum(["post", "thread", "reply"]),
        targetId: z.number(),
        reactionType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await dbThreads.addReaction({
          userId: ctx.user.id,
          ...input,
        });
        return result;
      }),

    list: publicProcedure
      .input(z.object({
        targetType: z.enum(["post", "thread", "reply"]),
        targetId: z.number(),
      }))
      .query(async ({ input }) => {
        return await dbThreads.getReactions(input.targetType, input.targetId);
      }),
  }),

  // ============= COMMUNITY WIDGETS =============
  communityWidgets: router({
    list: publicProcedure
      .input(z.object({ communityId: z.number() }))
      .query(async ({ input }) => {
        return await dbThreads.getCommunityWidgets(input.communityId);
      }),

    create: protectedProcedure
      .input(z.object({
        communityId: z.number(),
        type: z.string(),
        title: z.string(),
        content: z.string().optional(),
        position: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await dbThreads.createCommunityWidget({
          ...input,
          createdBy: ctx.user.id,
        });
        return { success: true, widgetId: result };
      }),

    update: protectedProcedure
      .input(z.object({
        widgetId: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        position: z.number().optional(),
        isVisible: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { widgetId, ...updates } = input;
        await dbThreads.updateCommunityWidget(widgetId, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ widgetId: z.number() }))
      .mutation(async ({ input }) => {
        await dbThreads.deleteCommunityWidget(input.widgetId);
        return { success: true };
      }),
  }),

  // ============= EVENTS =============
  events: router({
    list: publicProcedure
      .input(z.object({ communityId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCommunityEvents(input.communityId);
      }),

    myEvents: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserEventRsvps(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        communityId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        type: z.enum(["online", "in-person", "hybrid"]),
        startTime: z.date(),
        endTime: z.date().optional(),
        location: z.string().optional(),
        maxAttendees: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createEvent({
          ...input,
          creatorId: ctx.user.id,
        });
        return { success: true, eventId: result };
      }),

    rsvp: protectedProcedure
      .input(z.object({
        eventId: z.number(),
        status: z.enum(["going", "interested", "not-going"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createEventRsvp({
          eventId: input.eventId,
          userId: ctx.user.id,
          status: input.status,
        });
        return { success: true, rsvpId: result };
      }),
  }),
});

export type AppRouter = typeof appRouter;
