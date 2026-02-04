import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Make a user admin by email
export const makeAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`Usuario con email ${args.email} no encontrado`);
    }

    await ctx.db.patch(user._id, { role: "admin" });

    return {
      message: `Usuario ${args.email} ahora es admin`,
      userId: user._id
    };
  },
});

// Make a user brand admin
export const makeBrandAdmin = mutation({
  args: {
    email: v.string(),
    brandId: v.id("brands")
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`Usuario con email ${args.email} no encontrado`);
    }

    // Check if already brand admin
    const existing = await ctx.db
      .query("brandAdmins")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      throw new Error("Este usuario ya es administrador de una marca");
    }

    // Add as brand admin
    await ctx.db.insert("brandAdmins", {
      brandId: args.brandId,
      userId: user._id,
    });

    // Update user role
    await ctx.db.patch(user._id, { role: "brand_admin" });

    return {
      message: `Usuario ${args.email} ahora es brand admin`,
      userId: user._id
    };
  },
});

// List all users with their roles
export const listUsersWithRoles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});
