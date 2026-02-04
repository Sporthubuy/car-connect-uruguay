import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// ============ AUTH HOOKS ============

export function useCurrentUser() {
  const { user: clerkUser, isLoaded } = useUser();
  const convexUser = useQuery(
    api.auth.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  return {
    user: convexUser,
    clerkUser,
    isLoaded,
    isAuthenticated: !!clerkUser,
  };
}

export function useIsAdmin() {
  const { user: clerkUser } = useUser();
  return useQuery(
    api.auth.isAdmin,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
}

export function useBrandAdminInfo() {
  const { user: clerkUser } = useUser();
  return useQuery(
    api.auth.getBrandAdminInfo,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
}

// ============ CARS HOOKS ============

export function useBrands(activeOnly?: boolean) {
  return useQuery(api.cars.listBrands, { activeOnly });
}

export function useBrand(brandId: Id<"brands"> | undefined) {
  return useQuery(api.cars.getBrand, brandId ? { brandId } : "skip");
}

export function useModels(brandId?: Id<"brands">) {
  return useQuery(api.cars.listModels, { brandId });
}

export function useModel(modelId: Id<"models"> | undefined) {
  return useQuery(api.cars.getModelWithBrand, modelId ? { modelId } : "skip");
}

export function useCars() {
  return useQuery(api.cars.listCarsWithDetails, {});
}

export function useFeaturedCars() {
  return useQuery(api.cars.listTrims, { featuredOnly: true });
}

export function useCarById(trimId: Id<"trims"> | undefined) {
  return useQuery(api.cars.getCarById, trimId ? { trimId } : "skip");
}

export function useSavedCars(userId: Id<"users"> | undefined) {
  return useQuery(api.cars.getSavedCars, userId ? { userId } : "skip");
}

export function useSavedCarIds(userId: Id<"users"> | undefined) {
  return useQuery(api.cars.getSavedCarIds, userId ? { userId } : "skip");
}

// ============ LEADS HOOKS ============

export function useLeads() {
  return useQuery(api.leads.listLeads, {});
}

export function useLeadsByBrand(brandId: Id<"brands"> | undefined) {
  return useQuery(api.leads.listLeadsByBrand, brandId ? { brandId } : "skip");
}

export function useMyLeads(userId: Id<"users"> | undefined) {
  return useQuery(api.leads.getMyLeads, userId ? { userId } : "skip");
}

export function useLeadStats() {
  return useQuery(api.leads.getLeadStats, {});
}

// ============ EVENTS HOOKS ============

export function useEvents(publicOnly?: boolean) {
  return useQuery(api.events.listEvents, { publicOnly });
}

export function useEventsByBrand(brandId: Id<"brands"> | undefined) {
  return useQuery(api.events.listEventsByBrand, brandId ? { brandId } : "skip");
}

export function useEvent(eventId: Id<"events"> | undefined) {
  return useQuery(api.events.getEvent, eventId ? { eventId } : "skip");
}

export function useMyRsvps(userId: Id<"users"> | undefined) {
  return useQuery(api.events.getMyRsvps, userId ? { userId } : "skip");
}

export function useAllRsvpCounts() {
  return useQuery(api.events.getAllRsvpCounts, {});
}

// ============ COMMUNITIES HOOKS ============

export function useCommunities() {
  return useQuery(api.communities.listCommunities, {});
}

export function useCommunity(communityId: Id<"communities"> | undefined) {
  return useQuery(api.communities.getCommunity, communityId ? { communityId } : "skip");
}

export function useCommunityPosts(communityId?: Id<"communities">) {
  return useQuery(api.communities.listCommunityPosts, { communityId });
}

export function useMyMemberships(userId: Id<"users"> | undefined) {
  return useQuery(api.communities.getMyMemberships, userId ? { userId } : "skip");
}

// ============ REVIEWS HOOKS ============

export function useReviews(publishedOnly?: boolean) {
  return useQuery(api.reviews.listReviews, { publishedOnly });
}

export function useReview(reviewId: Id<"reviewPosts"> | undefined) {
  return useQuery(api.reviews.getReview, reviewId ? { reviewId } : "skip");
}

export function useReviewBySlug(slug: string | undefined) {
  return useQuery(api.reviews.getReviewBySlug, slug ? { slug } : "skip");
}

export function useComments(postId: Id<"reviewPosts"> | undefined, approvedOnly?: boolean) {
  return useQuery(api.reviews.listComments, postId ? { postId, approvedOnly } : "skip");
}

export function useAllComments() {
  return useQuery(api.reviews.listAllComments, {});
}

// ============ ACTIVATIONS HOOKS ============

export function useActivations(status?: "pending" | "verified" | "rejected") {
  return useQuery(api.activations.listActivations, { status });
}

export function useActivationsByBrand(brandId: Id<"brands"> | undefined) {
  return useQuery(api.activations.listActivationsByBrand, brandId ? { brandId } : "skip");
}

export function useMyActivations(userId: Id<"users"> | undefined) {
  return useQuery(api.activations.getMyActivations, userId ? { userId } : "skip");
}

export function useBenefits(brandId?: Id<"brands">, activeOnly?: boolean) {
  return useQuery(api.activations.listBenefits, { brandId, activeOnly });
}

// ============ SETTINGS HOOKS ============

export function useSetting(key: string) {
  return useQuery(api.settings.getSetting, { key });
}

export function useSettings(keys: string[]) {
  return useQuery(api.settings.getSettings, { keys });
}

export function useAllSettings() {
  return useQuery(api.settings.getAllSettings, {});
}

export function useAdminStats() {
  return useQuery(api.settings.getAdminStats, {});
}

export function useBrandAdminStats(brandId: Id<"brands"> | undefined) {
  return useQuery(api.settings.getBrandAdminStats, brandId ? { brandId } : "skip");
}

export function useBrandContacts(brandId: Id<"brands"> | undefined) {
  return useQuery(api.settings.listBrandContacts, brandId ? { brandId } : "skip");
}

export function useBrandAdmins(brandId: Id<"brands"> | undefined) {
  return useQuery(api.settings.listBrandAdmins, brandId ? { brandId } : "skip");
}

export function useUsers() {
  return useQuery(api.auth.listUsers, {});
}
