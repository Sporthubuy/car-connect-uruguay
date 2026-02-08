import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new lead
export const createLead = mutation({
  args: {
    carId: v.id("trims"),
    userId: v.optional(v.id("users")),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    department: v.string(),
    city: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leads", {
      ...args,
      status: "new",
    });
  },
});

// List all leads (admin)
export const listLeads = query({
  args: {},
  handler: async (ctx) => {
    const leads = await ctx.db.query("leads").order("desc").collect();

    const leadsWithCar = await Promise.all(
      leads.map(async (lead) => {
        const trim = await ctx.db.get(lead.carId);
        if (!trim) return { ...lead, car: null };

        const model = await ctx.db.get(trim.modelId);
        if (!model) return { ...lead, car: null };

        const brand = await ctx.db.get(model.brandId);
        return { ...lead, car: { ...trim, model, brand } };
      })
    );

    return leadsWithCar;
  },
});

// List leads by brand (brand admin)
export const listLeadsByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    // Get all models for this brand
    const models = await ctx.db
      .query("models")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const modelIds = models.map((m) => m._id);

    // Get all trims for these models
    const allTrims = await ctx.db.query("trims").collect();
    const brandTrims = allTrims.filter((t) => modelIds.includes(t.modelId));
    const trimIds = brandTrims.map((t) => t._id);

    // Get leads for these trims
    const allLeads = await ctx.db.query("leads").order("desc").collect();
    const brandLeads = allLeads.filter((l) => trimIds.includes(l.carId));

    // Enrich with car details
    const leadsWithCar = await Promise.all(
      brandLeads.map(async (lead) => {
        const trim = await ctx.db.get(lead.carId);
        if (!trim) return { ...lead, car: null };

        const model = await ctx.db.get(trim.modelId);
        if (!model) return { ...lead, car: null };

        const brand = await ctx.db.get(model.brandId);
        return { ...lead, car: { ...trim, model, brand } };
      })
    );

    return leadsWithCar;
  },
});

// List recent leads by brand (dashboard widget)
export const listRecentLeadsByBrand = query({
  args: { brandId: v.id("brands"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;

    const models = await ctx.db
      .query("models")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const modelIds = models.map((m) => m._id);

    const allTrims = await ctx.db.query("trims").collect();
    const brandTrims = allTrims.filter((t) => modelIds.includes(t.modelId));
    const trimIds = brandTrims.map((t) => t._id);

    const allLeads = await ctx.db.query("leads").order("desc").collect();
    const brandLeads = allLeads.filter((l) => trimIds.includes(l.carId)).slice(0, limit);

    const leadsWithCar = await Promise.all(
      brandLeads.map(async (lead) => {
        const trim = await ctx.db.get(lead.carId);
        if (!trim) return { ...lead, car: null };

        const model = await ctx.db.get(trim.modelId);
        if (!model) return { ...lead, car: null };

        const brand = await ctx.db.get(model.brandId);
        return { ...lead, car: { ...trim, model, brand } };
      })
    );

    return leadsWithCar;
  },
});

// Get leads by user
export const getMyLeads = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const leadsWithCar = await Promise.all(
      leads.map(async (lead) => {
        const trim = await ctx.db.get(lead.carId);
        if (!trim) return { ...lead, car: null };

        const model = await ctx.db.get(trim.modelId);
        if (!model) return { ...lead, car: null };

        const brand = await ctx.db.get(model.brandId);
        return { ...lead, car: { ...trim, model, brand } };
      })
    );

    return leadsWithCar;
  },
});

// Update lead status
export const updateLeadStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("converted"),
      v.literal("lost")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.leadId, { status: args.status });
  },
});

// Delete lead
export const deleteLead = mutation({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.leadId);
  },
});

// Count new leads by brand (for notification badge)
export const countNewLeadsByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const models = await ctx.db
      .query("models")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const modelIds = models.map((m) => m._id);

    const allTrims = await ctx.db.query("trims").collect();
    const brandTrims = allTrims.filter((t) => modelIds.includes(t.modelId));
    const trimIds = brandTrims.map((t) => t._id);

    const allLeads = await ctx.db.query("leads").collect();
    const newLeads = allLeads.filter(
      (l) => trimIds.includes(l.carId) && l.status === "new"
    );

    return newLeads.length;
  },
});

// Get lead stats
export const getLeadStats = query({
  args: {},
  handler: async (ctx) => {
    const leads = await ctx.db.query("leads").collect();

    const total = leads.length;
    const byStatus = {
      new: leads.filter((l) => l.status === "new").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
      qualified: leads.filter((l) => l.status === "qualified").length,
      converted: leads.filter((l) => l.status === "converted").length,
      lost: leads.filter((l) => l.status === "lost").length,
    };

    return { total, byStatus };
  },
});
