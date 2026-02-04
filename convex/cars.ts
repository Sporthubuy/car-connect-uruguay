import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============ BRANDS ============

export const listBrands = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.activeOnly) {
      return await ctx.db
        .query("brands")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .collect();
    }
    return await ctx.db.query("brands").collect();
  },
});

export const getBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.brandId);
  },
});

export const getBrandBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brands")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const createBrand = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    logoUrl: v.optional(v.string()),
    country: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("brands", args);
  },
});

export const updateBrand = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    country: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { brandId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(brandId, filteredUpdates);
  },
});

export const deleteBrand = mutation({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.brandId);
  },
});

// ============ MODELS ============

export const listModels = query({
  args: { brandId: v.optional(v.id("brands")) },
  handler: async (ctx, args) => {
    if (args.brandId) {
      return await ctx.db
        .query("models")
        .withIndex("by_brand", (q) => q.eq("brandId", args.brandId!))
        .collect();
    }
    return await ctx.db.query("models").collect();
  },
});

export const getModel = query({
  args: { modelId: v.id("models") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.modelId);
  },
});

export const getModelWithBrand = query({
  args: { modelId: v.id("models") },
  handler: async (ctx, args) => {
    const model = await ctx.db.get(args.modelId);
    if (!model) return null;
    const brand = await ctx.db.get(model.brandId);
    return { ...model, brand };
  },
});

export const createModel = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.string(),
    slug: v.string(),
    segment: v.union(
      v.literal("sedan"),
      v.literal("hatchback"),
      v.literal("suv"),
      v.literal("crossover"),
      v.literal("pickup"),
      v.literal("coupe"),
      v.literal("convertible"),
      v.literal("wagon"),
      v.literal("van"),
      v.literal("sports")
    ),
    yearStart: v.number(),
    yearEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("models", args);
  },
});

export const updateModel = mutation({
  args: {
    modelId: v.id("models"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    segment: v.optional(
      v.union(
        v.literal("sedan"),
        v.literal("hatchback"),
        v.literal("suv"),
        v.literal("crossover"),
        v.literal("pickup"),
        v.literal("coupe"),
        v.literal("convertible"),
        v.literal("wagon"),
        v.literal("van"),
        v.literal("sports")
      )
    ),
    yearStart: v.optional(v.number()),
    yearEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { modelId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(modelId, filteredUpdates);
  },
});

export const deleteModel = mutation({
  args: { modelId: v.id("models") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.modelId);
  },
});

// ============ TRIMS (Cars) ============

export const listTrims = query({
  args: { modelId: v.optional(v.id("models")), featuredOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("trims");

    if (args.modelId) {
      return await ctx.db
        .query("trims")
        .withIndex("by_model", (q) => q.eq("modelId", args.modelId!))
        .collect();
    }

    if (args.featuredOnly) {
      return await ctx.db
        .query("trims")
        .withIndex("by_featured", (q) => q.eq("isFeatured", true))
        .collect();
    }

    return await query.collect();
  },
});

export const listCarsWithDetails = query({
  args: {},
  handler: async (ctx) => {
    const trims = await ctx.db.query("trims").collect();

    const carsWithDetails = await Promise.all(
      trims.map(async (trim) => {
        const model = await ctx.db.get(trim.modelId);
        if (!model) return null;
        const brand = await ctx.db.get(model.brandId);
        if (!brand) return null;
        return { ...trim, model, brand };
      })
    );

    return carsWithDetails.filter((car) => car !== null);
  },
});

export const getCarById = query({
  args: { trimId: v.id("trims") },
  handler: async (ctx, args) => {
    const trim = await ctx.db.get(args.trimId);
    if (!trim) return null;

    const model = await ctx.db.get(trim.modelId);
    if (!model) return null;

    const brand = await ctx.db.get(model.brandId);
    if (!brand) return null;

    return { ...trim, model, brand };
  },
});

export const createTrim = mutation({
  args: {
    modelId: v.id("models"),
    name: v.string(),
    slug: v.string(),
    year: v.number(),
    priceUsd: v.number(),
    engine: v.string(),
    transmission: v.string(),
    fuelType: v.union(
      v.literal("gasolina"),
      v.literal("diesel"),
      v.literal("hibrido"),
      v.literal("electrico"),
      v.literal("gnc")
    ),
    horsepower: v.number(),
    torque: v.optional(v.number()),
    acceleration0100: v.optional(v.number()),
    topSpeed: v.optional(v.number()),
    fuelConsumption: v.optional(v.number()),
    doors: v.number(),
    seats: v.number(),
    trunkCapacity: v.optional(v.number()),
    features: v.array(v.string()),
    images: v.array(v.string()),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trims", args);
  },
});

export const updateTrim = mutation({
  args: {
    trimId: v.id("trims"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    year: v.optional(v.number()),
    priceUsd: v.optional(v.number()),
    engine: v.optional(v.string()),
    transmission: v.optional(v.string()),
    fuelType: v.optional(
      v.union(
        v.literal("gasolina"),
        v.literal("diesel"),
        v.literal("hibrido"),
        v.literal("electrico"),
        v.literal("gnc")
      )
    ),
    horsepower: v.optional(v.number()),
    torque: v.optional(v.number()),
    acceleration0100: v.optional(v.number()),
    topSpeed: v.optional(v.number()),
    fuelConsumption: v.optional(v.number()),
    doors: v.optional(v.number()),
    seats: v.optional(v.number()),
    trunkCapacity: v.optional(v.number()),
    features: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.string())),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { trimId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(trimId, filteredUpdates);
  },
});

export const deleteTrim = mutation({
  args: { trimId: v.id("trims") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.trimId);
  },
});

// ============ SAVED CARS ============

export const getSavedCars = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const saved = await ctx.db
      .query("savedCars")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const cars = await Promise.all(
      saved.map(async (s) => {
        const trim = await ctx.db.get(s.trimId);
        if (!trim) return null;
        const model = await ctx.db.get(trim.modelId);
        if (!model) return null;
        const brand = await ctx.db.get(model.brandId);
        if (!brand) return null;
        return { ...trim, model, brand, savedId: s._id };
      })
    );

    return cars.filter((c) => c !== null);
  },
});

export const getSavedCarIds = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const saved = await ctx.db
      .query("savedCars")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return saved.map((s) => s.trimId);
  },
});

export const saveCar = mutation({
  args: { userId: v.id("users"), trimId: v.id("trims") },
  handler: async (ctx, args) => {
    // Check if already saved
    const existing = await ctx.db
      .query("savedCars")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("trimId"), args.trimId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("savedCars", {
      userId: args.userId,
      trimId: args.trimId,
    });
  },
});

export const unsaveCar = mutation({
  args: { userId: v.id("users"), trimId: v.id("trims") },
  handler: async (ctx, args) => {
    const saved = await ctx.db
      .query("savedCars")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("trimId"), args.trimId))
      .first();

    if (saved) {
      await ctx.db.delete(saved._id);
    }
  },
});
