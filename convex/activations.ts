import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============ VEHICLE ACTIVATIONS ============

export const listActivations = query({
  args: { status: v.optional(v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"))) },
  handler: async (ctx, args) => {
    const activations = await ctx.db.query("vehicleActivations").order("desc").collect();

    let filtered = activations;
    if (args.status) {
      filtered = activations.filter((a) => a.status === args.status);
    }

    const activationsWithDetails = await Promise.all(
      filtered.map(async (activation) => {
        const user = await ctx.db.get(activation.userId);
        const brand = await ctx.db.get(activation.brandId);
        const model = await ctx.db.get(activation.modelId);
        return { ...activation, user, brand, model };
      })
    );

    return activationsWithDetails;
  },
});

export const listActivationsByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const activations = await ctx.db.query("vehicleActivations").order("desc").collect();
    const brandActivations = activations.filter((a) => a.brandId === args.brandId);

    const activationsWithDetails = await Promise.all(
      brandActivations.map(async (activation) => {
        const user = await ctx.db.get(activation.userId);
        const brand = await ctx.db.get(activation.brandId);
        const model = await ctx.db.get(activation.modelId);
        return { ...activation, user, brand, model };
      })
    );

    return activationsWithDetails;
  },
});

export const getMyActivations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const activations = await ctx.db
      .query("vehicleActivations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const activationsWithDetails = await Promise.all(
      activations.map(async (activation) => {
        const brand = await ctx.db.get(activation.brandId);
        const model = await ctx.db.get(activation.modelId);
        return { ...activation, brand, model };
      })
    );

    return activationsWithDetails;
  },
});

export const createActivation = mutation({
  args: {
    userId: v.id("users"),
    brandId: v.id("brands"),
    modelId: v.id("models"),
    year: v.number(),
    vin: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if VIN already used
    const existing = await ctx.db
      .query("vehicleActivations")
      .withIndex("by_vin", (q) => q.eq("vin", args.vin))
      .first();

    if (existing) {
      throw new Error("Este VIN ya fue registrado");
    }

    return await ctx.db.insert("vehicleActivations", {
      ...args,
      status: "pending",
    });
  },
});

export const verifyActivation = mutation({
  args: { activationId: v.id("vehicleActivations"), verifiedBy: v.id("users") },
  handler: async (ctx, args) => {
    const activation = await ctx.db.get(args.activationId);
    if (!activation) return;

    await ctx.db.patch(args.activationId, {
      status: "verified",
      verifiedAt: Date.now(),
      verifiedBy: args.verifiedBy,
    });

    // Update user role to verified_user
    const user = await ctx.db.get(activation.userId);
    if (user && user.role === "user") {
      await ctx.db.patch(activation.userId, { role: "verified_user" });
    }
  },
});

export const rejectActivation = mutation({
  args: { activationId: v.id("vehicleActivations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.activationId, { status: "rejected" });
  },
});

export const deleteActivation = mutation({
  args: { activationId: v.id("vehicleActivations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.activationId);
  },
});

// ============ BENEFITS ============

export const listBenefits = query({
  args: { brandId: v.optional(v.id("brands")), activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let benefits;
    if (args.brandId) {
      benefits = await ctx.db
        .query("benefits")
        .withIndex("by_brand", (q) => q.eq("brandId", args.brandId!))
        .collect();
    } else {
      benefits = await ctx.db.query("benefits").collect();
    }

    if (args.activeOnly) {
      benefits = benefits.filter((b) => b.isActive);
    }

    const benefitsWithBrand = await Promise.all(
      benefits.map(async (benefit) => {
        const brand = await ctx.db.get(benefit.brandId);
        return { ...benefit, brand };
      })
    );

    return benefitsWithBrand;
  },
});

export const getBenefit = query({
  args: { benefitId: v.id("benefits") },
  handler: async (ctx, args) => {
    const benefit = await ctx.db.get(args.benefitId);
    if (!benefit) return null;

    const brand = await ctx.db.get(benefit.brandId);
    return { ...benefit, brand };
  },
});

export const createBenefit = mutation({
  args: {
    brandId: v.id("brands"),
    title: v.string(),
    description: v.string(),
    terms: v.optional(v.string()),
    validFrom: v.string(),
    validUntil: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("benefits", args);
  },
});

export const updateBenefit = mutation({
  args: {
    benefitId: v.id("benefits"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    terms: v.optional(v.string()),
    validFrom: v.optional(v.string()),
    validUntil: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { benefitId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(benefitId, filteredUpdates);
  },
});

export const deleteBenefit = mutation({
  args: { benefitId: v.id("benefits") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.benefitId);
  },
});
