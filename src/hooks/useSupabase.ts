import { useQuery } from '@tanstack/react-query';
import {
  fetchBrands,
  fetchModels,
  fetchModelsByBrand,
  fetchCars,
  fetchCarById,
  fetchReviews,
  fetchReviewBySlug,
  fetchCommentsByPost,
  fetchCommunities,
  fetchCommunityPosts,
  fetchUserMemberships,
  fetchEvents,
  fetchMyRsvps,
  fetchAllRsvpCounts,
  fetchMyActivations,
  fetchMyLeads,
  fetchSavedCars,
  fetchSavedCarIds,
  fetchStaticPage,
} from '@/lib/api';

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
  });
}

export function useModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: fetchModels,
  });
}

export function useModelsByBrand(brandId: string) {
  return useQuery({
    queryKey: ['models', 'brand', brandId],
    queryFn: () => fetchModelsByBrand(brandId),
    enabled: !!brandId,
  });
}

export function useCars() {
  return useQuery({
    queryKey: ['cars'],
    queryFn: fetchCars,
  });
}

export function useCarById(id: string) {
  return useQuery({
    queryKey: ['cars', id],
    queryFn: () => fetchCarById(id),
    enabled: !!id,
  });
}

export function useReviews() {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: fetchReviews,
  });
}

export function useReviewBySlug(slug: string) {
  return useQuery({
    queryKey: ['reviews', slug],
    queryFn: () => fetchReviewBySlug(slug),
    enabled: !!slug,
  });
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchCommentsByPost(postId),
    enabled: !!postId,
  });
}

export function useCommunities() {
  return useQuery({
    queryKey: ['communities'],
    queryFn: fetchCommunities,
  });
}

export function useCommunityPosts(communityId?: string) {
  return useQuery({
    queryKey: ['community-posts', communityId],
    queryFn: () => fetchCommunityPosts(communityId),
  });
}

export function useUserMemberships() {
  return useQuery({
    queryKey: ['user-memberships'],
    queryFn: fetchUserMemberships,
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });
}

export function useMyRsvps() {
  return useQuery({
    queryKey: ['my-rsvps'],
    queryFn: fetchMyRsvps,
  });
}

export function useRsvpCounts() {
  return useQuery({
    queryKey: ['rsvp-counts'],
    queryFn: fetchAllRsvpCounts,
  });
}

export function useMyActivations() {
  return useQuery({
    queryKey: ['my-activations'],
    queryFn: fetchMyActivations,
  });
}

export function useMyLeads() {
  return useQuery({
    queryKey: ['my-leads'],
    queryFn: fetchMyLeads,
  });
}

export function useSavedCars() {
  return useQuery({
    queryKey: ['saved-cars'],
    queryFn: fetchSavedCars,
  });
}

export function useSavedCarIds() {
  return useQuery({
    queryKey: ['saved-car-ids'],
    queryFn: fetchSavedCarIds,
  });
}

export function useStaticPage(pageKey: string) {
  return useQuery({
    queryKey: ['static-page', pageKey],
    queryFn: () => fetchStaticPage(pageKey),
    enabled: !!pageKey,
  });
}
