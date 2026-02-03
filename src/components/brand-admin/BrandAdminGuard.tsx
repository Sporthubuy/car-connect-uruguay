import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface BrandAdminGuardProps {
  children: React.ReactNode;
}

export function BrandAdminGuard({ children }: BrandAdminGuardProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || (role !== 'brand_admin' && role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
