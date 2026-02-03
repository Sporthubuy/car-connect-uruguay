import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { useBrandAdmin } from '@/hooks/useBrandAdmin';
import { useAuth } from '@/hooks/useAuth';
import { listActivationsAdmin, updateActivationStatus } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ActivationStatus } from '@/types';

const STATUS_TABS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'verified', label: 'Verificados' },
  { value: 'rejected', label: 'Rechazados' },
];

const statusVariant = (s: ActivationStatus) => {
  switch (s) {
    case 'pending': return 'secondary' as const;
    case 'verified': return 'default' as const;
    case 'rejected': return 'destructive' as const;
  }
};

const statusLabel = (s: ActivationStatus) => {
  switch (s) {
    case 'pending': return 'Pendiente';
    case 'verified': return 'Verificado';
    case 'rejected': return 'Rechazado';
  }
};

export default function BrandAdminActivations() {
  const [statusFilter, setStatusFilter] = useState('');
  const { brandInfo } = useBrandAdmin();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: activations = [], isLoading } = useQuery({
    queryKey: ['brand-admin', 'activations', brandInfo?.brand_id],
    queryFn: () => listActivationsAdmin(brandInfo!.brand_id),
    enabled: !!brandInfo?.brand_id,
  });

  const filtered = activations.filter((a) =>
    !statusFilter || a.status === statusFilter,
  );

  const handleStatus = async (id: string, status: ActivationStatus) => {
    if (!user) return;
    try {
      await updateActivationStatus(id, status, user.id);
      toast.success(status === 'verified' ? 'Activación verificada' : 'Activación rechazada');
      queryClient.invalidateQueries({ queryKey: ['brand-admin', 'activations'] });
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  return (
    <BrandAdminLayout title="Activaciones" description="Cola de verificación de vehículos">
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No hay activaciones {statusFilter ? 'con ese estado' : 'registradas'}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Usuario</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Modelo</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Año</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">VIN</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Estado</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Fecha</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((activation) => (
                <tr key={activation.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground text-sm">{activation.profile_name ?? '—'}</div>
                    <div className="text-xs text-muted-foreground">{activation.profile_email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {activation.model_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{activation.year}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell font-mono">
                    {activation.vin}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(activation.status)}>
                      {statusLabel(activation.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {new Date(activation.created_at).toLocaleDateString('es-UY')}
                  </td>
                  <td className="px-4 py-3">
                    {activation.status === 'pending' && (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600"
                          title="Verificar"
                          onClick={() => handleStatus(activation.id, 'verified')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          title="Rechazar"
                          onClick={() => handleStatus(activation.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BrandAdminLayout>
  );
}
