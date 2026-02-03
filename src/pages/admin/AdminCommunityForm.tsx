import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  getCommunity,
  createCommunity,
  updateCommunity,
  listBrandsAdmin,
  listModelsAdmin,
} from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminCommunityForm() {
  const { communityId } = useParams<{ communityId: string }>();
  const isEdit = communityId && communityId !== 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    cover_image: '',
    brand_id: '',
    model_id: '',
  });

  const { data: community, isLoading } = useQuery({
    queryKey: ['admin', 'community', communityId],
    queryFn: () => getCommunity(communityId!),
    enabled: !!isEdit,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: listBrandsAdmin,
  });

  const { data: models = [] } = useQuery({
    queryKey: ['admin', 'models', form.brand_id],
    queryFn: () => listModelsAdmin(form.brand_id || undefined),
    enabled: !!form.brand_id,
  });

  useEffect(() => {
    if (community) {
      setForm({
        name: community.name,
        slug: community.slug,
        description: community.description,
        cover_image: community.cover_image ?? '',
        brand_id: community.brand_id ?? '',
        model_id: community.model_id ?? '',
      });
    }
  }, [community]);

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
        description: form.description.trim(),
        cover_image: form.cover_image.trim() || null,
        brand_id: form.brand_id || null,
        model_id: form.model_id || null,
      };

      if (isEdit) {
        await updateCommunity(communityId!, payload);
        toast.success('Comunidad actualizada');
      } else {
        await createCommunity(payload);
        toast.success('Comunidad creada');
      }

      queryClient.invalidateQueries({ queryKey: ['admin', 'communities'] });
      navigate('/admin/communities');
    } catch (err: any) {
      toast.error('Error', {
        description: err.message?.includes('duplicate')
          ? 'Ya existe una comunidad con ese slug'
          : err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <AdminLayout title="Editar comunidad">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? `Editar: ${community?.name ?? ''}` : 'Nueva comunidad'}
      description={isEdit ? 'Modificar datos de la comunidad' : 'Crear una nueva comunidad'}
    >
      <Link
        to="/admin/communities"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a comunidades
      </Link>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Club Toyota Uruguay"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="Ej: club-toyota-uruguay"
              required
            />
            <p className="text-xs text-muted-foreground">
              Identificador URL. Se genera automaticamente del nombre.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descripcion de la comunidad..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image">Imagen de portada (URL)</Label>
            <Input
              id="cover_image"
              value={form.cover_image}
              onChange={(e) => setForm((prev) => ({ ...prev, cover_image: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand_id">Marca (opcional)</Label>
            <select
              id="brand_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.brand_id}
              onChange={(e) => setForm((prev) => ({ ...prev, brand_id: e.target.value, model_id: '' }))}
            >
              <option value="">Sin marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {form.brand_id && (
            <div className="space-y-2">
              <Label htmlFor="model_id">Modelo (opcional)</Label>
              <select
                id="model_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.model_id}
                onChange={(e) => setForm((prev) => ({ ...prev, model_id: e.target.value }))}
              >
                <option value="">Sin modelo</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
                'Crear comunidad'
              )}
            </Button>
            <Link to="/admin/communities">
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
