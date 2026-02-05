import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

export default function AdminCommunityForm() {
  const { communityId } = useParams<{ communityId: string }>();
  const isEdit = communityId && communityId !== 'new';
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    coverImage: '',
    brandId: '',
    modelId: '',
  });

  const community = useQuery(
    api.communities.getCommunity,
    isEdit ? { communityId: communityId as Id<"communities"> } : 'skip'
  );

  const brands = useQuery(api.cars.listBrands);
  const models = useQuery(
    api.cars.listModels,
    form.brandId ? { brandId: form.brandId as Id<"brands"> } : 'skip'
  );

  const createCommunityMutation = useMutation(api.communities.createCommunity);
  const updateCommunityMutation = useMutation(api.communities.updateCommunity);

  const isLoading = isEdit && community === undefined;

  useEffect(() => {
    if (community) {
      setForm({
        name: community.name,
        slug: community.slug,
        description: community.description ?? '',
        coverImage: community.coverImage ?? '',
        brandId: community.brandId ?? '',
        modelId: community.modelId ?? '',
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
      if (isEdit) {
        await updateCommunityMutation({
          communityId: communityId as Id<"communities">,
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
          coverImage: form.coverImage.trim() || undefined,
          brandId: form.brandId ? (form.brandId as Id<"brands">) : undefined,
          modelId: form.modelId ? (form.modelId as Id<"models">) : undefined,
        });
        toast.success('Comunidad actualizada');
      } else {
        await createCommunityMutation({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
          coverImage: form.coverImage.trim() || undefined,
          brandId: form.brandId ? (form.brandId as Id<"brands">) : undefined,
          modelId: form.modelId ? (form.modelId as Id<"models">) : undefined,
        });
        toast.success('Comunidad creada');
      }

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
            <Label htmlFor="coverImage">Imagen de portada (URL)</Label>
            <Input
              id="coverImage"
              value={form.coverImage}
              onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandId">Marca (opcional)</Label>
            <select
              id="brandId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.brandId}
              onChange={(e) => setForm((prev) => ({ ...prev, brandId: e.target.value, modelId: '' }))}
            >
              <option value="">Sin marca</option>
              {(brands ?? []).map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {form.brandId && (
            <div className="space-y-2">
              <Label htmlFor="modelId">Modelo (opcional)</Label>
              <select
                id="modelId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.modelId}
                onChange={(e) => setForm((prev) => ({ ...prev, modelId: e.target.value }))}
              >
                <option value="">Sin modelo</option>
                {(models ?? []).map((m) => (
                  <option key={m._id} value={m._id}>
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
