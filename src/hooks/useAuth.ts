import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { UserRole } from '@/types';
import type { Id } from '../../convex/_generated/dataModel';
import { useEffect } from 'react';

interface ConvexUser {
  _id: Id<'users'>;
  clerkId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  city?: string;
  address?: string;
  birthDate?: string;
  gender?: string;
  role: UserRole;
}

interface AuthState {
  user: ConvexUser | null;
  clerkUser: ReturnType<typeof useUser>['user'];
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isBrandAdmin: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerkAuth();

  // Get or create Convex user
  const convexUser = useQuery(
    api.auth.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : 'skip'
  );

  const upsertUser = useMutation(api.auth.upsertUser);

  // Sync Clerk user to Convex
  useEffect(() => {
    if (clerkUser && isLoaded) {
      upsertUser({
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        fullName: clerkUser.fullName || clerkUser.firstName || 'Usuario',
        avatarUrl: clerkUser.imageUrl,
      });
    }
  }, [clerkUser?.id, isLoaded]);

  const user = convexUser as ConvexUser | null;
  const role = (convexUser?.role as UserRole) || null;

  return {
    user,
    clerkUser,
    role,
    loading: !isLoaded || (!!clerkUser && convexUser === undefined),
    isAdmin: role === 'admin',
    isBrandAdmin: role === 'brand_admin',
    isAuthenticated: !!clerkUser,
    signOut: async () => {
      await signOut();
    },
  };
}
