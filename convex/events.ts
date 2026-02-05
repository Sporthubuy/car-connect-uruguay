import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all events
export const listEvents = query({
  args: { publicOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const events = await ctx.db.query("events").order("desc").collect();

    if (args.publicOnly) {
      return events.filter((e) => e.isPublic);
    }

    return events;
  },
});

// List events by brand
export const listEventsByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

// List upcoming events by brand (dashboard widget)
export const listUpcomingEventsByBrand = query({
  args: { brandId: v.id("brands"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    const today = new Date().toISOString().split("T")[0];

    const events = await ctx.db
      .query("events")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const upcoming = events
      .filter((e) => e.eventDate >= today)
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
      .slice(0, limit);

    return upcoming;
  },
});

// Get event by ID
export const getEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    if (event.brandId) {
      const brand = await ctx.db.get(event.brandId);
      return { ...event, brand };
    }

    return event;
  },
});

// Get event by slug
export const getEventBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Create event
export const createEvent = mutation({
  args: {
    brandId: v.optional(v.id("brands")),
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    coverImage: v.string(),
    location: v.string(),
    eventDate: v.string(),
    eventTime: v.string(),
    isPublic: v.boolean(),
    requiresVerification: v.boolean(),
    maxAttendees: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", args);
  },
});

// Update event
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    location: v.optional(v.string()),
    eventDate: v.optional(v.string()),
    eventTime: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    requiresVerification: v.optional(v.boolean()),
    maxAttendees: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(eventId, filteredUpdates);
  },
});

// Delete event
export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    // Delete all RSVPs first
    const rsvps = await ctx.db
      .query("eventRsvps")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const rsvp of rsvps) {
      await ctx.db.delete(rsvp._id);
    }

    await ctx.db.delete(args.eventId);
  },
});

// ============ RSVPs ============

// Get RSVP count for event
export const getRsvpCount = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const rsvps = await ctx.db
      .query("eventRsvps")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    return rsvps.length;
  },
});

// Get all RSVP counts
export const getAllRsvpCounts = query({
  args: {},
  handler: async (ctx) => {
    const rsvps = await ctx.db.query("eventRsvps").collect();
    const counts: Record<string, number> = {};

    for (const rsvp of rsvps) {
      const eventId = rsvp.eventId as string;
      counts[eventId] = (counts[eventId] || 0) + 1;
    }

    return counts;
  },
});

// Get user's RSVPs
export const getMyRsvps = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const rsvps = await ctx.db
      .query("eventRsvps")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return rsvps.map((r) => r.eventId);
  },
});

// Check if user has RSVP'd
export const hasRsvp = query({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const rsvp = await ctx.db
      .query("eventRsvps")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    return !!rsvp;
  },
});

// RSVP to event
export const rsvpToEvent = mutation({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if already RSVP'd
    const existing = await ctx.db
      .query("eventRsvps")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) return existing._id;

    // Check capacity
    const event = await ctx.db.get(args.eventId);
    if (event?.maxAttendees) {
      const count = await ctx.db
        .query("eventRsvps")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect();
      if (count.length >= event.maxAttendees) {
        throw new Error("Event is full");
      }
    }

    return await ctx.db.insert("eventRsvps", {
      eventId: args.eventId,
      userId: args.userId,
    });
  },
});

// Cancel RSVP
export const cancelRsvp = mutation({
  args: { eventId: v.id("events"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const rsvp = await ctx.db
      .query("eventRsvps")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (rsvp) {
      await ctx.db.delete(rsvp._id);
    }
  },
});

// Get event attendees (admin)
export const getEventAttendees = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const rsvps = await ctx.db
      .query("eventRsvps")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const attendees = await Promise.all(
      rsvps.map(async (rsvp) => {
        const user = await ctx.db.get(rsvp.userId);
        return user;
      })
    );

    return attendees.filter((a) => a !== null);
  },
});
