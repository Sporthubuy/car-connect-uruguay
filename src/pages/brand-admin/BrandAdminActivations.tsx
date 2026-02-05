import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { useBrandAdmin } from '@/hooks/useBrandAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Id } from '../../../convex/_generated/dataModel';

type ActivationStatus = 'pending' | 'verified' | 'rejected';

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

  const brandId = brandInfo?.brand_id as Id<"brands"> | undefined;

  const activations = useQuery(
    api.activations.listActivationsByBrand,
    brandId ? { brandId } : 'skip'
  );

  const verifyActivationMutation = useMutation(api.activations.verifyActivation);
  const rejectActivationMutation = useMutation(api.activations.rejectActivation);

  const isLoading = activations === undefined;

  const filtered = (activations ?? []).filter((a) =>
    !statusFilter || a.status === statusFilter,
  );

  const handleVerify = async (id: Id<"vehicleActivations">) => {
    if (!user) return;
    try {
      await verifyActivationMutation({ activationId: id, verifiedBy: user._id });
      toast.success('Activacion verificada');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  const handleReject = async (id: Id<"vehicleActivations">) => {
    try {
      await rejectActivationMutation({ activationId: id });
      toast.success('Activacion rechazada');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  return (
    <BrandAdminLayout title="Activaciones" description="Cola de verificacion de vehiculos">
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
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Ano</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">VIN</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Estado</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Fecha</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((activation) => (
                <tr key={activation._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground text-sm">{activation.user?.fullName ?? '\u2014'}</div>
                    <div className="text-xs text-muted-foreground">{activation.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {activation.model?.name ?? '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{activation.year}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell font-mono">
                    {activation.vin}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(activation.status as ActivationStatus)}>
                      {statusLabel(activation.status as ActivationStatus)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {new Date(activation._creationTime).toLocaleDateString('es-UY')}
                  </td>
                  <td className="px-4 py-3">
                    {activation.status === 'pending' && (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600"
                          title="Verificar"
                          onClick={() => handleVerify(activation._id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          title="Rechazar"
                          onClick={() => handleReject(activation._id)}
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
