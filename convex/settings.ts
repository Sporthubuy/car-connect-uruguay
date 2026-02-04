import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============ SITE SETTINGS ============

export const getSetting = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return setting?.value;
  },
});

export const getSettings = query({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, args) => {
    const settings: Record<string, string> = {};
    for (const key of args.keys) {
      const setting = await ctx.db
        .query("siteSettings")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      if (setting) {
        settings[key] = setting.value;
      }
    }
    return settings;
  },
});

export const getAllSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("siteSettings").collect();
    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  },
});

export const setSetting = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
      return existing._id;
    }

    return await ctx.db.insert("siteSettings", args);
  },
});

export const deleteSetting = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (setting) {
      await ctx.db.delete(setting._id);
    }
  },
});

// ============ ADMIN STATS ============

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const brands = await ctx.db.query("brands").collect();
    const models = await ctx.db.query("models").collect();
    const trims = await ctx.db.query("trims").collect();
    const leads = await ctx.db.query("leads").collect();
    const events = await ctx.db.query("events").collect();
    const benefits = await ctx.db.query("benefits").collect();
    const activations = await ctx.db.query("vehicleActivations").collect();
    const users = await ctx.db.query("users").collect();

    const newLeads = leads.filter((l) => l.status === "new").length;
    const pendingActivations = activations.filter((a) => a.status === "pending").length;

    return {
      brands: brands.length,
      models: models.length,
      trims: trims.length,
      leads: leads.length,
      newLeads,
      events: events.length,
      benefits: benefits.length,
      activations: activations.length,
      pendingActivations,
      users: users.length,
    };
  },
});

export const getBrandAdminStats = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const models = await ctx.db
      .query("models")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const modelIds = models.map((m) => m._id);
    const allTrims = await ctx.db.query("trims").collect();
    const trims = allTrims.filter((t) => modelIds.includes(t.modelId));
    const trimIds = trims.map((t) => t._id);

    const allLeads = await ctx.db.query("leads").collect();
    const leads = allLeads.filter((l) => trimIds.includes(l.carId));
    const newLeads = leads.filter((l) => l.status === "new").length;

    const events = await ctx.db
      .query("events")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const benefits = await ctx.db
      .query("benefits")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const allActivations = await ctx.db.query("vehicleActivations").collect();
    const activations = allActivations.filter((a) => a.brandId === args.brandId);
    const pendingActivations = activations.filter((a) => a.status === "pending").length;

    return {
      models: models.length,
      trims: trims.length,
      leads: leads.length,
      newLeads,
      events: events.length,
      benefits: benefits.length,
      activations: activations.length,
      pendingActivations,
    };
  },
});

// ============ BRAND CONTACTS ============

export const listBrandContacts = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brandContacts")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();
  },
});

export const createBrandContact = mutation({
  args: {
    brandId: v.id("brands"),
    email: v.string(),
    department: v.optional(v.string()),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    // If this is default, unset other defaults
    if (args.isDefault) {
      const existing = await ctx.db
        .query("brandContacts")
        .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
        .collect();

      for (const contact of existing) {
        if (contact.isDefault) {
          await ctx.db.patch(contact._id, { isDefault: false });
        }
      }
    }

    return await ctx.db.insert("brandContacts", args);
  },
});

export const updateBrandContact = mutation({
  args: {
    contactId: v.id("brandContacts"),
    email: v.optional(v.string()),
    department: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { contactId, ...updates } = args;

    // If setting as default, unset others
    if (updates.isDefault) {
      const contact = await ctx.db.get(contactId);
      if (contact) {
        const existing = await ctx.db
          .query("brandContacts")
          .withIndex("by_brand", (q) => q.eq("brandId", contact.brandId))
          .collect();

        for (const c of existing) {
          if (c._id !== contactId && c.isDefault) {
            await ctx.db.patch(c._id, { isDefault: false });
          }
        }
      }
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(contactId, filteredUpdates);
  },
});

export const deleteBrandContact = mutation({
  args: { contactId: v.id("brandContacts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.contactId);
  },
});

// ============ BRAND ADMINS ============

export const listBrandAdmins = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const admins = await ctx.db
      .query("brandAdmins")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const adminsWithUser = await Promise.all(
      admins.map(async (admin) => {
        const user = await ctx.db.get(admin.userId);
        return { ...admin, user };
      })
    );

    return adminsWithUser;
  },
});

export const addBrandAdmin = mutation({
  args: { brandId: v.id("brands"), userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if already admin
    const existing = await ctx.db
      .query("brandAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      throw new Error("Este usuario ya es administrador de una marca");
    }

    // Add as brand admin
    const adminId = await ctx.db.insert("brandAdmins", {
      brandId: args.brandId,
      userId: args.userId,
    });

    // Update user role
    await ctx.db.patch(args.userId, { role: "brand_admin" });

    return adminId;
  },
});

export const removeBrandAdmin = mutation({
  args: { brandAdminId: v.id("brandAdmins") },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.brandAdminId);
    if (!admin) return;

    // Reset user role
    await ctx.db.patch(admin.userId, { role: "user" });

    // Remove brand admin entry
    await ctx.db.delete(args.brandAdminId);
  },
});
