import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all banners (admin)
export const listBanners = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("banners")
      .withIndex("by_order")
      .collect();
  },
});

// List active banners (public)
export const listActiveBanners = query({
  args: {},
  handler: async (ctx) => {
    const banners = await ctx.db
      .query("banners")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Sort by order
    return banners.sort((a, b) => a.order - b.order);
  },
});

// Get single banner
export const getBanner = query({
  args: { bannerId: v.id("banners") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bannerId);
  },
});

// Create banner
export const createBanner = mutation({
  args: {
    title: v.string(),
    subtitle: v.optional(v.string()),
    imageUrl: v.string(),
    linkUrl: v.optional(v.string()),
    linkText: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("banners", args);
  },
});

// Update banner
export const updateBanner = mutation({
  args: {
    bannerId: v.id("banners"),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    linkText: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { bannerId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(bannerId, filteredUpdates);
  },
});

// Delete banner
export const deleteBanner = mutation({
  args: { bannerId: v.id("banners") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.bannerId);
  },
});

// Reorder banners
export const reorderBanners = mutation({
  args: {
    bannerIds: v.array(v.id("banners")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.bannerIds.length; i++) {
      await ctx.db.patch(args.bannerIds[i], { order: i });
    }
  },
});
