import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { listTrimsAdmin, getModel, deleteTrim } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTrims() {
  const { modelId } = useParams<{ modelId: string }>();
  const queryClient = useQueryClient();

  const { data: model } = useQuery({
    queryKey: ['admin', 'model', modelId],
    queryFn: () => getModel(modelId!),
    enabled: !!modelId,
  });

  const { data: trims = [], isLoading } = useQuery({
    queryKey: ['admin', 'trims', modelId],
    queryFn: () => listTrimsAdmin(modelId!),
    enabled: !!modelId,
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminar versión "${name}"?`)) return;
    try {
      await deleteTrim(id);
      toast.success('Versión eliminada');
      queryClient.invalidateQueries({ queryKey: ['admin', 'trims', modelId] });
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  return (
    <AdminLayout
      title={model ? `Versiones: ${model.name}` : 'Versiones'}
      description="Gestionar versiones (trims) del modelo"
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/admin/models"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a modelos
        </Link>
        <Link to={`/admin/models/${modelId}/trims/new`}>
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
      ) : trims.length === 0 ? (
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
              {trims.map((trim) => (
                <tr key={trim.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{trim.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{trim.year}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    ${trim.price_usd.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{trim.engine}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Badge variant="outline">{trim.fuel_type}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {trim.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/trims/${trim.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title="Eliminar"
                        onClick={() => handleDelete(trim.id, trim.name)}
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
    </AdminLayout>
  );
}
