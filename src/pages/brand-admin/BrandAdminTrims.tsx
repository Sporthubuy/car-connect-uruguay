import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { Button } from '@/components/ui/button';
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
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Id } from '../../../convex/_generated/dataModel';

export default function BrandAdminTrims() {
  const { modelId } = useParams<{ modelId: string }>();
  const [deleteTarget, setDeleteTarget] = useState<{ id: Id<"trims">; name: string } | null>(null);

  const model = useQuery(
    api.cars.getModel,
    modelId ? { modelId: modelId as Id<"models"> } : 'skip'
  );

  const trims = useQuery(
    api.cars.listTrims,
    modelId ? { modelId: modelId as Id<"models"> } : 'skip'
  );

  const deleteTrimMutation = useMutation(api.cars.deleteTrim);

  const isLoading = trims === undefined;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTrimMutation({ trimId: deleteTarget.id });
      toast.success('Versión eliminada');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <BrandAdminLayout
      title={model ? `Versiones: ${model.name}` : 'Versiones'}
      description="Gestionar versiones (trims) del modelo"
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/marca/modelos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a modelos
        </Link>
        <Link to={`/marca/modelos/${modelId}/versiones/new`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva versión
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (trims ?? []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No hay versiones creadas para este modelo
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Versión</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Año</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Precio USD</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Motor</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Combustible</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Destacada</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(trims ?? []).map((trim) => (
                <tr key={trim._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{trim.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{trim.year}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    ${trim.priceUsd.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{trim.engine}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Badge variant="outline">{trim.fuelType}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {trim.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/marca/versiones/${trim._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title="Eliminar"
                        onClick={() => setDeleteTarget({ id: trim._id, name: trim.name })}
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
            <AlertDialogTitle>Eliminar versión</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la versión "{deleteTarget?.name}"?
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
    </BrandAdminLayout>
  );
}
