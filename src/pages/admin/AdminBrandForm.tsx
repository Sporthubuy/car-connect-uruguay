import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getBrand, createBrand, updateBrand } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminBrandForm() {
  const { brandId } = useParams<{ brandId: string }>();
  const isEdit = brandId && brandId !== 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    logo_url: '',
    country: 'UY',
    is_active: true,
  });

  const { data: brand, isLoading } = useQuery({
    queryKey: ['admin', 'brand', brandId],
    queryFn: () => getBrand(brandId!),
    enabled: !!isEdit,
  });

  useEffect(() => {
    if (brand) {
      setForm({
        name: brand.name,
        slug: brand.slug,
        logo_url: brand.logo_url ?? '',
        country: brand.country,
        is_active: brand.is_active,
      });
    }
  }, [brand]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: !isEdit ? generateSlug(name) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Nombre y slug son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        logo_url: form.logo_url.trim() || null,
        country: form.country.trim() || 'UY',
        is_active: form.is_active,
      };

      if (isEdit) {
        await updateBrand(brandId!, payload);
        toast.success('Marca actualizada');
      } else {
        await createBrand(payload);
        toast.success('Marca creada');
      }

      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
      navigate('/admin/brands');
    } catch (err: any) {
      toast.error('Error', {
        description: err.message?.includes('duplicate')
          ? 'Ya existe una marca con ese slug'
          : err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <AdminLayout title="Editar marca">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? `Editar: ${brand?.name ?? ''}` : 'Nueva marca'}
      description={isEdit ? 'Modificar datos de la marca' : 'Crear una nueva marca en el catálogo'}
    >
      <Link
        to="/admin/brands"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a marcas
      </Link>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Toyota"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="Ej: toyota"
              required
            />
            <p className="text-xs text-muted-foreground">
              Identificador URL. Se genera automáticamente del nombre.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">URL del logo</Label>
            <Input
              id="logo_url"
              value={form.logo_url}
              onChange={(e) => setForm((prev) => ({ ...prev, logo_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={form.country}
              onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
              placeholder="UY"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Activa</Label>
              <p className="text-xs text-muted-foreground">
                Las marcas inactivas no se muestran en el catálogo
              </p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, is_active: checked }))
              }
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isEdit ? (
                'Guardar cambios'
              ) : (
                'Crear marca'
              )}
            </Button>
            <Link to="/admin/brands">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
