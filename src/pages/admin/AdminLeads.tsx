import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

const statusVariant = (s: LeadStatus) => {
  switch (s) {
    case 'new': return 'default' as const;
    case 'contacted': return 'secondary' as const;
    case 'qualified': return 'outline' as const;
    case 'converted': return 'default' as const;
    case 'lost': return 'destructive' as const;
  }
};

export default function AdminLeads() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const leads = useQuery(api.leads.listLeads) || [];
  const isLoading = leads === undefined;

  const updateStatusMutation = useMutation(api.leads.updateLeadStatus);

  const filtered = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (leadId: Id<'leads'>, status: LeadStatus) => {
    try {
      await updateStatusMutation({ leadId, status });
      toast.success('Estado actualizado');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  return (
    <AdminLayout title="Leads" description="Consultas recibidas de potenciales compradores">
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
          {search || statusFilter ? 'No se encontraron leads' : 'No hay leads'}
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Contacto</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Auto</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Ubicación</th>
                <th className="text-center p-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead._id} className="border-t">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                      <p className="text-sm text-muted-foreground">{lead.phone}</p>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {lead.car ? (
                      <div>
                        <p className="font-medium">
                          {lead.car.brand?.name} {lead.car.model?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lead.car.name} - USD {lead.car.priceUsd?.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <p className="text-sm">{lead.department}</p>
                    {lead.city && (
                      <p className="text-sm text-muted-foreground">{lead.city}</p>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead._id, e.target.value as LeadStatus)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
