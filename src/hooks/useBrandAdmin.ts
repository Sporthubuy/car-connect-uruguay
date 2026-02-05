import { useAuth } from './useAuth';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface BrandAdminInfo {
  brand_id: string;
  brand_name: string;
  brand_slug: string;
  brand_logo_url: string | null;
}

interface UseBrandAdminResult {
  brandInfo: BrandAdminInfo | null;
  loading: boolean;
}

export function useBrandAdmin(): UseBrandAdminResult {
  const { user, loading: authLoading } = useAuth();

  const clerkId = user ? (user as any).clerkId : undefined;
  const info = useQuery(
    api.auth.getBrandAdminInfo,
    clerkId ? { clerkId } : 'skip'
  );

  const loading = authLoading || (!!clerkId && info === undefined);

  let brandInfo: BrandAdminInfo | null = null;
  if (info && info.brand) {
    brandInfo = {
      brand_id: info.brand._id,
      brand_name: info.brand.name,
      brand_slug: info.brand.slug,
      brand_logo_url: info.brand.logoUrl ?? null,
    };
  }

  return { brandInfo, loading };
}
