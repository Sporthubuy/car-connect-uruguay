import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============ REVIEW POSTS ============

export const listReviews = query({
  args: { publishedOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const reviews = await ctx.db.query("reviewPosts").order("desc").collect();

    let filtered = reviews;
    if (args.publishedOnly) {
      filtered = reviews.filter((r) => r.publishedAt);
    }

    const reviewsWithAuthor = await Promise.all(
      filtered.map(async (review) => {
        const author = await ctx.db.get(review.authorId);
        let car = null;
        if (review.carId) {
          const trim = await ctx.db.get(review.carId);
          if (trim) {
            const model = await ctx.db.get(trim.modelId);
            if (model) {
              const brand = await ctx.db.get(model.brandId);
              car = { ...trim, model, brand };
            }
          }
        }
        return { ...review, author, car };
      })
    );

    return reviewsWithAuthor;
  },
});

export const getReview = query({
  args: { reviewId: v.id("reviewPosts") },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) return null;

    const author = await ctx.db.get(review.authorId);
    let car = null;
    if (review.carId) {
      const trim = await ctx.db.get(review.carId);
      if (trim) {
        const model = await ctx.db.get(trim.modelId);
        if (model) {
          const brand = await ctx.db.get(model.brandId);
          car = { ...trim, model, brand };
        }
      }
    }

    return { ...review, author, car };
  },
});

export const getReviewBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const review = await ctx.db
      .query("reviewPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!review) return null;

    const author = await ctx.db.get(review.authorId);
    let car = null;
    if (review.carId) {
      const trim = await ctx.db.get(review.carId);
      if (trim) {
        const model = await ctx.db.get(trim.modelId);
        if (model) {
          const brand = await ctx.db.get(model.brandId);
          car = { ...trim, model, brand };
        }
      }
    }

    return { ...review, author, car };
  },
});

export const createReview = mutation({
  args: {
    authorId: v.id("users"),
    carId: v.optional(v.id("trims")),
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    coverImage: v.string(),
    pros: v.array(v.string()),
    cons: v.array(v.string()),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reviewPosts", {
      ...args,
      views: 0,
      publishedAt: undefined,
    });
  },
});

export const updateReview = mutation({
  args: {
    reviewId: v.id("reviewPosts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    pros: v.optional(v.array(v.string())),
    cons: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { reviewId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(reviewId, filteredUpdates);
  },
});

export const publishReview = mutation({
  args: { reviewId: v.id("reviewPosts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reviewId, { publishedAt: Date.now() });
  },
});

export const unpublishReview = mutation({
  args: { reviewId: v.id("reviewPosts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reviewId, { publishedAt: undefined });
  },
});

export const deleteReview = mutation({
  args: { reviewId: v.id("reviewPosts") },
  handler: async (ctx, args) => {
    // Delete all comments first
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.reviewId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(args.reviewId);
  },
});

export const incrementViews = mutation({
  args: { reviewId: v.id("reviewPosts") },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (review) {
      await ctx.db.patch(args.reviewId, { views: review.views + 1 });
    }
  },
});

// ============ COMMENTS ============

export const listComments = query({
  args: { postId: v.id("reviewPosts"), approvedOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    let filtered = comments;
    if (args.approvedOnly) {
      filtered = comments.filter((c) => c.isApproved);
    }

    const commentsWithAuthor = await Promise.all(
      filtered.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        return { ...comment, author };
      })
    );

    return commentsWithAuthor;
  },
});

export const listAllComments = query({
  args: {},
  handler: async (ctx) => {
    const comments = await ctx.db.query("comments").order("desc").collect();

    const commentsWithDetails = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        const post = await ctx.db.get(comment.postId);
        return { ...comment, author, post };
      })
    );

    return commentsWithDetails;
  },
});

export const createComment = mutation({
  args: {
    postId: v.id("reviewPosts"),
    authorId: v.id("users"),
    parentId: v.optional(v.id("comments")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("comments", {
      ...args,
      isApproved: false,
    });
  },
});

export const approveComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.commentId, { isApproved: true });
  },
});

export const rejectComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.commentId);
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.commentId);
  },
});
