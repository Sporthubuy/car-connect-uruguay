import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { useBrandAdmin } from '@/hooks/useBrandAdmin';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Id } from '../../../convex/_generated/dataModel';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'qualified', label: 'Calificado' },
  { value: 'converted', label: 'Convertido' },
  { value: 'lost', label: 'Perdido' },
];

export default function BrandAdminLeads() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { brandInfo } = useBrandAdmin();

  const brandId = brandInfo?.brand_id as Id<"brands"> | undefined;

  const leads = useQuery(
    api.leads.listLeadsByBrand,
    brandId ? { brandId } : 'skip'
  );

  const updateLeadStatusMutation = useMutation(api.leads.updateLeadStatus);

  const isLoading = leads === undefined;

  const filtered = (leads ?? []).filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: Id<"leads">, status: LeadStatus) => {
    try {
      await updateLeadStatusMutation({ leadId: id, status });
      toast.success('Estado actualizado');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  return (
    <BrandAdminLayout title="Leads" description="Consultas recibidas de potenciales compradores">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {search || statusFilter ? 'No se encontraron leads' : 'No hay leads registrados'}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Nombre</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Email</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Telefono</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Auto</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Estado</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{lead.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{lead.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{lead.phone}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {lead.car
                      ? [lead.car.model?.name, lead.car.name].filter(Boolean).join(' ')
                      : '\u2014'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead._id, e.target.value as LeadStatus)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {new Date(lead._creationTime).toLocaleDateString('es-UY')}
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
