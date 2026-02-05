import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users/Profiles
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    fullName: v.string(),
    avatarUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    department: v.optional(v.string()),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    gender: v.optional(v.string()),
    role: v.union(
      v.literal("visitor"),
      v.literal("user"),
      v.literal("verified_user"),
      v.literal("brand_admin"),
      v.literal("admin")
    ),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Brands
  brands: defineTable({
    name: v.string(),
    slug: v.string(),
    logoUrl: v.optional(v.string()),
    country: v.string(),
    isActive: v.boolean(),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    socialFacebook: v.optional(v.string()),
    socialInstagram: v.optional(v.string()),
    socialTwitter: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  // Brand Contacts
  brandContacts: defineTable({
    brandId: v.id("brands"),
    email: v.string(),
    department: v.optional(v.string()),
    isDefault: v.boolean(),
  }).index("by_brand", ["brandId"]),

  // Brand Admins
  brandAdmins: defineTable({
    brandId: v.id("brands"),
    userId: v.id("users"),
  })
    .index("by_brand", ["brandId"])
    .index("by_user", ["userId"]),

  // Models
  models: defineTable({
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
  })
    .index("by_brand", ["brandId"])
    .index("by_slug", ["slug"])
    .index("by_segment", ["segment"]),

  // Trims (Car variants)
  trims: defineTable({
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
  })
    .index("by_model", ["modelId"])
    .index("by_slug", ["slug"])
    .index("by_featured", ["isFeatured"])
    .index("by_price", ["priceUsd"])
    .index("by_year", ["year"]),

  // Leads
  leads: defineTable({
    carId: v.id("trims"),
    userId: v.optional(v.id("users")),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    department: v.string(),
    city: v.optional(v.string()),
    message: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("converted"),
      v.literal("lost")
    ),
  })
    .index("by_car", ["carId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Review Posts
  reviewPosts: defineTable({
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
    views: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_author", ["authorId"])
    .index("by_slug", ["slug"])
    .index("by_published", ["publishedAt"]),

  // Comments
  comments: defineTable({
    postId: v.id("reviewPosts"),
    authorId: v.id("users"),
    parentId: v.optional(v.id("comments")),
    content: v.string(),
    isApproved: v.boolean(),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"])
    .index("by_approved", ["isApproved"]),

  // Communities
  communities: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    coverImage: v.optional(v.string()),
    brandId: v.optional(v.id("brands")),
    modelId: v.optional(v.id("models")),
    memberCount: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_brand", ["brandId"]),

  // Community Posts
  communityPosts: defineTable({
    communityId: v.id("communities"),
    authorId: v.id("users"),
    title: v.string(),
    content: v.string(),
    images: v.optional(v.array(v.string())),
    upvotes: v.number(),
    downvotes: v.number(),
    commentCount: v.number(),
  })
    .index("by_community", ["communityId"])
    .index("by_author", ["authorId"]),

  // Community Members
  communityMembers: defineTable({
    communityId: v.id("communities"),
    userId: v.id("users"),
  })
    .index("by_community", ["communityId"])
    .index("by_user", ["userId"]),

  // Events
  events: defineTable({
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
  })
    .index("by_brand", ["brandId"])
    .index("by_slug", ["slug"])
    .index("by_date", ["eventDate"]),

  // Event RSVPs
  eventRsvps: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"]),

  // Vehicle Activations
  vehicleActivations: defineTable({
    userId: v.id("users"),
    brandId: v.id("brands"),
    modelId: v.id("models"),
    year: v.number(),
    vin: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected")
    ),
    verifiedAt: v.optional(v.number()),
    verifiedBy: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_vin", ["vin"]),

  // Benefits
  benefits: defineTable({
    brandId: v.id("brands"),
    title: v.string(),
    description: v.string(),
    terms: v.optional(v.string()),
    validFrom: v.string(),
    validUntil: v.string(),
    isActive: v.boolean(),
  })
    .index("by_brand", ["brandId"])
    .index("by_active", ["isActive"]),

  // Saved Cars (Favorites)
  savedCars: defineTable({
    userId: v.id("users"),
    trimId: v.id("trims"),
  })
    .index("by_user", ["userId"])
    .index("by_trim", ["trimId"]),

  // Site Settings
  siteSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
