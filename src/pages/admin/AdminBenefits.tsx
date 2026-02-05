import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Id } from '../../../convex/_generated/dataModel';

export default function AdminBenefits() {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: Id<"benefits">; title: string } | null>(null);

  const benefits = useQuery(api.activations.listBenefits);
  const deleteBenefitMutation = useMutation(api.activations.deleteBenefit);

  const isLoading = benefits === undefined;

  const filtered = (benefits ?? []).filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBenefitMutation({ benefitId: deleteTarget.id });
      toast.success('Beneficio eliminado');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <AdminLayout title="Beneficios" description="Gestionar beneficios para usuarios verificados">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar beneficio..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link to="/admin/benefits/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo beneficio
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {search ? 'No se encontraron beneficios' : 'No hay beneficios creados'}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Título</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Marca</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Vigencia</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Activo</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((benefit) => (
                <tr key={benefit._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{benefit.title}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                    {benefit.brand?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {new Date(benefit.validFrom).toLocaleDateString('es-UY')} – {new Date(benefit.validUntil).toLocaleDateString('es-UY')}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={benefit.isActive ? 'default' : 'secondary'}>
                      {benefit.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/benefits/${benefit._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title="Eliminar"
                        onClick={() => setDeleteTarget({ id: benefit._id, title: benefit.title })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar beneficio</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el beneficio "{deleteTarget?.title}"?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
