import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

interface AuthState {
  user: SupabaseUser | null;
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isBrandAdmin: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;

      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!cancelled) {
          setRole((data?.role as UserRole) ?? 'user');
        }
      }

      if (!cancelled) setLoading(false);
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);

      if (newUser) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', newUser.id)
          .single();

        setRole((data?.role as UserRole) ?? 'user');
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    role,
    loading,
    isAdmin: role === 'admin',
    isBrandAdmin: role === 'brand_admin',
  };
}
