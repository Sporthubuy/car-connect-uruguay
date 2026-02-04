import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============ COMMUNITIES ============

export const listCommunities = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("communities").collect();
  },
});

export const getCommunity = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.communityId);
  },
});

export const getCommunityBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communities")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const createCommunity = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    coverImage: v.optional(v.string()),
    brandId: v.optional(v.id("brands")),
    modelId: v.optional(v.id("models")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("communities", {
      ...args,
      memberCount: 0,
    });
  },
});

export const updateCommunity = mutation({
  args: {
    communityId: v.id("communities"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { communityId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(communityId, filteredUpdates);
  },
});

export const deleteCommunity = mutation({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    // Delete all posts and members first
    const posts = await ctx.db
      .query("communityPosts")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();
    for (const post of posts) {
      await ctx.db.delete(post._id);
    }

    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    await ctx.db.delete(args.communityId);
  },
});

// ============ COMMUNITY MEMBERS ============

export const isMember = query({
  args: { communityId: v.id("communities"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("communityMembers")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    return !!member;
  },
});

export const getMyMemberships = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("communityMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return memberships.map((m) => m.communityId);
  },
});

export const joinCommunity = mutation({
  args: { communityId: v.id("communities"), userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if already member
    const existing = await ctx.db
      .query("communityMembers")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) return existing._id;

    // Add member
    const memberId = await ctx.db.insert("communityMembers", {
      communityId: args.communityId,
      userId: args.userId,
    });

    // Update member count
    const community = await ctx.db.get(args.communityId);
    if (community) {
      await ctx.db.patch(args.communityId, {
        memberCount: community.memberCount + 1,
      });
    }

    return memberId;
  },
});

export const leaveCommunity = mutation({
  args: { communityId: v.id("communities"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("communityMembers")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (member) {
      await ctx.db.delete(member._id);

      // Update member count
      const community = await ctx.db.get(args.communityId);
      if (community && community.memberCount > 0) {
        await ctx.db.patch(args.communityId, {
          memberCount: community.memberCount - 1,
        });
      }
    }
  },
});

// ============ COMMUNITY POSTS ============

export const listCommunityPosts = query({
  args: { communityId: v.optional(v.id("communities")) },
  handler: async (ctx, args) => {
    let posts;
    if (args.communityId) {
      posts = await ctx.db
        .query("communityPosts")
        .withIndex("by_community", (q) => q.eq("communityId", args.communityId!))
        .order("desc")
        .collect();
    } else {
      posts = await ctx.db.query("communityPosts").order("desc").collect();
    }

    const postsWithAuthor = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        const community = await ctx.db.get(post.communityId);
        return { ...post, author, community };
      })
    );

    return postsWithAuthor;
  },
});

export const getCommunityPost = query({
  args: { postId: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    const author = await ctx.db.get(post.authorId);
    const community = await ctx.db.get(post.communityId);
    return { ...post, author, community };
  },
});

export const createCommunityPost = mutation({
  args: {
    communityId: v.id("communities"),
    authorId: v.id("users"),
    title: v.string(),
    content: v.string(),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("communityPosts", {
      ...args,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
    });
  },
});

export const updateCommunityPost = mutation({
  args: {
    postId: v.id("communityPosts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { postId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(postId, filteredUpdates);
  },
});

export const deleteCommunityPost = mutation({
  args: { postId: v.id("communityPosts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.postId);
  },
});

export const voteCommunityPost = mutation({
  args: {
    postId: v.id("communityPosts"),
    type: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return;

    if (args.type === "up") {
      await ctx.db.patch(args.postId, { upvotes: post.upvotes + 1 });
    } else {
      await ctx.db.patch(args.postId, { downvotes: post.downvotes + 1 });
    }
  },
});
