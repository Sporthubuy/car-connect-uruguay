import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { useBrandAdmin } from '@/hooks/useBrandAdmin';
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
import { Plus, Search, Pencil, List, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Id } from '../../../convex/_generated/dataModel';

export default function BrandAdminModels() {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: Id<"models">; name: string } | null>(null);
  const { brandInfo } = useBrandAdmin();

  const brandId = brandInfo?.brand_id as Id<"brands"> | undefined;

  const models = useQuery(
    api.cars.listModels,
    brandId ? { brandId } : 'skip'
  );

  const deleteModelMutation = useMutation(api.cars.deleteModel);

  const isLoading = models === undefined;
  const filtered = (models ?? []).filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteModelMutation({ modelId: deleteTarget.id });
      toast.success('Modelo eliminado');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <BrandAdminLayout title="Modelos" description="Gestionar modelos de tu marca">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar modelo..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link to="/marca/modelos/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo modelo
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {search ? 'No se encontraron modelos' : 'No hay modelos creados'}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Modelo</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Segmento</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Año</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((model) => (
                <tr key={model._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{model.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant="outline">{model.segment}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {model.yearStart}{model.yearEnd ? `–${model.yearEnd}` : '+'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/marca/modelos/${model._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/marca/modelos/${model._id}/versiones`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Versiones">
                          <List className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title="Eliminar"
                        onClick={() => setDeleteTarget({ id: model._id, name: model.name })}
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
            <AlertDialogTitle>Eliminar modelo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el modelo "{deleteTarget?.name}"?
              Esta acción no se puede deshacer y eliminará también todas las versiones asociadas.
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
    </BrandAdminLayout>
  );
}
