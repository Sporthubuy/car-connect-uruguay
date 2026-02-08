import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Image, ExternalLink } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

export default function AdminBannerForm() {
  const { bannerId } = useParams<{ bannerId: string }>();
  const isEdit = bannerId && bannerId !== 'new';
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    linkText: '',
    order: 0,
    isActive: true,
  });

  const banner = useQuery(
    api.banners.getBanner,
    isEdit ? { bannerId: bannerId as Id<"banners"> } : 'skip'
  );
  const banners = useQuery(api.banners.listBanners);

  const createBannerMutation = useMutation(api.banners.createBanner);
  const updateBannerMutation = useMutation(api.banners.updateBanner);

  const isLoading = isEdit && banner === undefined;

  // Set default order for new banners
  useEffect(() => {
    if (!isEdit && banners) {
      const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.order)) + 1 : 0;
      setForm(p => ({ ...p, order: maxOrder }));
    }
  }, [isEdit, banners]);

  useEffect(() => {
    if (banner) {
      setForm({
        title: banner.title,
        subtitle: banner.subtitle ?? '',
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl ?? '',
        linkText: banner.linkText ?? '',
        order: banner.order,
        isActive: banner.isActive,
      });
    }
  }, [banner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.imageUrl.trim()) {
      toast.error('Título e imagen son obligatorios');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateBannerMutation({
          bannerId: bannerId as Id<"banners">,
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || undefined,
          imageUrl: form.imageUrl.trim(),
          linkUrl: form.linkUrl.trim() || undefined,
          linkText: form.linkText.trim() || undefined,
          order: form.order,
          isActive: form.isActive,
        });
        toast.success('Banner actualizado');
      } else {
        await createBannerMutation({
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || undefined,
          imageUrl: form.imageUrl.trim(),
          linkUrl: form.linkUrl.trim() || undefined,
          linkText: form.linkText.trim() || undefined,
          order: form.order,
          isActive: form.isActive,
        });
        toast.success('Banner creado');
      }

      navigate('/admin/banners');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <AdminLayout title="Editar banner">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? `Editar: ${banner?.title ?? ''}` : 'Nuevo banner'}
      description={isEdit ? 'Modificar datos del banner' : 'Crear un nuevo banner para el carrusel'}
    >
      <Link
        to="/admin/banners"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a banners
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-xl border bg-card p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ej: Descubrí el nuevo modelo 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={form.subtitle}
                onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="Ej: Tecnología de vanguardia y diseño único"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de la imagen *</Label>
              <Input
                id="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://ejemplo.com/imagen.jpg"
                required
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: 1920x600px o similar (aspecto 16:5)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkUrl">URL del enlace</Label>
                <Input
                  id="linkUrl"
                  value={form.linkUrl}
                  onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))}
                  placeholder="/autos o https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkText">Texto del botón</Label>
                <Input
                  id="linkText"
                  value={form.linkText}
                  onChange={(e) => setForm((p) => ({ ...p, linkText: e.target.value }))}
                  placeholder="Ej: Ver más"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={form.order}
                onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">
                Los banners se muestran de menor a mayor orden
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Activo</Label>
                <p className="text-xs text-muted-foreground">Solo los banners activos se muestran</p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : isEdit ? 'Guardar cambios' : 'Crear banner'}
              </Button>
              <Link to="/admin/banners">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </div>
        </form>

        {/* Preview */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Vista previa</h3>
          <div className="rounded-xl border bg-card overflow-hidden">
            {form.imageUrl ? (
              <div className="relative aspect-[16/6]">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                <div className="absolute inset-0 flex items-center p-8">
                  <div className="text-white max-w-md">
                    <h2 className="text-2xl font-bold mb-2">
                      {form.title || 'Título del banner'}
                    </h2>
                    {form.subtitle && (
                      <p className="text-white/80 mb-4">{form.subtitle}</p>
                    )}
                    {form.linkText && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold">
                        {form.linkText}
                        <ExternalLink className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[16/6] bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-2" />
                  <p>Ingresa una URL de imagen para ver la vista previa</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
