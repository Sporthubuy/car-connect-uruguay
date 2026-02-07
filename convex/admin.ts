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

// Search users by email substring
export const searchUsersByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    const search = args.email.toLowerCase();
    return users.filter((u) => u.email.toLowerCase().includes(search)).slice(0, 10);
  },
});

// List all users with their roles
export const listUsersWithRoles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Create a new user (for admin panel)
export const createUser = mutation({
  args: {
    email: v.string(),
    fullName: v.string(),
    role: v.union(
      v.literal("visitor"),
      v.literal("user"),
      v.literal("verified_user"),
      v.literal("brand_admin"),
      v.literal("admin")
    ),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error(`Ya existe un usuario con el email ${args.email}`);
    }

    // Create user with a placeholder clerkId (will be updated when they sign in)
    const userId = await ctx.db.insert("users", {
      clerkId: `pending_${Date.now()}`,
      email: args.email,
      fullName: args.fullName,
      role: args.role,
    });

    return userId;
  },
});

// Set a user as brand admin
export const setBrandAdmin = mutation({
  args: {
    clerkUserId: v.string(), // email in this case
    brandId: v.id("brands"),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.clerkUserId))
      .first();

    if (!user) {
      throw new Error(`Usuario con email ${args.clerkUserId} no encontrado`);
    }

    // Check if already brand admin
    const existing = await ctx.db
      .query("brandAdmins")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      // Update existing brand admin entry
      await ctx.db.patch(existing._id, { brandId: args.brandId });
    } else {
      // Create new brand admin entry
      await ctx.db.insert("brandAdmins", {
        brandId: args.brandId,
        userId: user._id,
      });
    }

    // Update user role
    await ctx.db.patch(user._id, { role: "brand_admin" });

    return user._id;
  },
});
