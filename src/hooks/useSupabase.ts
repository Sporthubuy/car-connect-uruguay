import { useQuery } from '@tanstack/react-query';
import {
  fetchBrands,
  fetchModels,
  fetchCars,
  fetchCarById,
  fetchReviews,
  fetchCommunities,
  fetchEvents,
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

export function useCommunities() {
  return useQuery({
    queryKey: ['communities'],
    queryFn: fetchCommunities,
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });
}
