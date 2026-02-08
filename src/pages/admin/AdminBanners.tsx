import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
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
import { Plus, Pencil, Trash2, Loader2, GripVertical, Image } from 'lucide-react';
import { toast } from 'sonner';
import type { Id } from '../../../convex/_generated/dataModel';

export default function AdminBanners() {
  const [deleteTarget, setDeleteTarget] = useState<{ id: Id<"banners">; title: string } | null>(null);

  const banners = useQuery(api.banners.listBanners);
  const deleteBannerMutation = useMutation(api.banners.deleteBanner);
  const toggleActiveMutation = useMutation(api.banners.updateBanner);

  const isLoading = banners === undefined;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBannerMutation({ bannerId: deleteTarget.id });
      toast.success('Banner eliminado');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setDeleteTarget(null);
    }
  };

  const toggleActive = async (bannerId: Id<"banners">, currentActive: boolean) => {
    try {
      await toggleActiveMutation({ bannerId, isActive: !currentActive });
      toast.success(currentActive ? 'Banner desactivado' : 'Banner activado');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
  };

  return (
    <AdminLayout title="Banners" description="Gestionar banners del carrusel de la página principal">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Los banners activos se muestran en el carrusel de la página principal
        </p>
        <Link to="/admin/banners/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo banner
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (banners ?? []).length === 0 ? (
        <div className="text-center py-16">
          <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No hay banners creados</p>
          <Link to="/admin/banners/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Crear primer banner
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(banners ?? []).sort((a, b) => a.order - b.order).map((banner) => (
            <div
              key={banner._id}
              className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
            >
              {/* Drag handle */}
              <div className="text-muted-foreground cursor-grab">
                <GripVertical className="h-5 w-5" />
              </div>

              {/* Thumbnail */}
              <div className="flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-muted">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{banner.title}</h3>
                {banner.subtitle && (
                  <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>
                )}
                {banner.linkUrl && (
                  <p className="text-xs text-primary truncate mt-1">{banner.linkUrl}</p>
                )}
              </div>

              {/* Order badge */}
              <div className="text-sm text-muted-foreground">
                #{banner.order + 1}
              </div>

              {/* Status */}
              <Badge
                variant={banner.isActive ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => toggleActive(banner._id, banner.isActive)}
              >
                {banner.isActive ? 'Activo' : 'Inactivo'}
              </Badge>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Link to={`/admin/banners/${banner._id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  title="Eliminar"
                  onClick={() => setDeleteTarget({ id: banner._id, title: banner.title })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar banner</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el banner "{deleteTarget?.title}"?
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
