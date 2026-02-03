import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getMyBrandAdmin } from '@/lib/adminApi';

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
  const [brandInfo, setBrandInfo] = useState<BrandAdminInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setBrandInfo(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetch() {
      const info = await getMyBrandAdmin(user!.id);
      if (!cancelled) {
        setBrandInfo(info);
        setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  return { brandInfo, loading: authLoading || loading };
}
