import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getModel, createModel, updateModel, listBrandsAdmin } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { CarSegment } from '@/types';

const SEGMENTS: CarSegment[] = ['sedan', 'hatchback', 'suv', 'crossover', 'pickup', 'coupe', 'convertible', 'wagon', 'van', 'sports'];

export default function AdminModelForm() {
  const { modelId } = useParams<{ modelId: string }>();
  const isEdit = modelId && modelId !== 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brand_id: '',
    name: '',
    slug: '',
    segment: 'sedan' as CarSegment,
    year_start: new Date().getFullYear(),
    year_end: '' as string | number,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: listBrandsAdmin,
  });

  const { data: model, isLoading } = useQuery({
    queryKey: ['admin', 'model', modelId],
    queryFn: () => getModel(modelId!),
    enabled: !!isEdit,
  });

  useEffect(() => {
    if (model) {
      setForm({
        brand_id: model.brand_id,
        name: model.name,
        slug: model.slug,
        segment: model.segment,
        year_start: model.year_start,
        year_end: model.year_end ?? '',
      });
    }
  }, [model]);

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: !isEdit ? generateSlug(name) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand_id || !form.name.trim() || !form.slug.trim()) {
      toast.error('Marca, nombre y slug son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        brand_id: form.brand_id,
        name: form.name.trim(),
        slug: form.slug.trim(),
        segment: form.segment,
        year_start: Number(form.year_start),
        year_end: form.year_end ? Number(form.year_end) : null,
      };

      if (isEdit) {
        await updateModel(modelId!, payload);
        toast.success('Modelo actualizado');
      } else {
        await createModel(payload);
        toast.success('Modelo creado');
      }

      queryClient.invalidateQueries({ queryKey: ['admin', 'models'] });
      navigate('/admin/models');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <AdminLayout title="Editar modelo">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? `Editar: ${model?.name ?? ''}` : 'Nuevo modelo'}
      description={isEdit ? 'Modificar datos del modelo' : 'Crear un nuevo modelo'}
    >
      <Link
        to="/admin/models"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a modelos
      </Link>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="brand_id">Marca *</Label>
            <select
              id="brand_id"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.brand_id}
              onChange={(e) => setForm((prev) => ({ ...prev, brand_id: e.target.value }))}
              required
            >
              <option value="">Seleccionar marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Corolla"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="Ej: corolla"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment">Segmento *</Label>
            <select
              id="segment"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.segment}
              onChange={(e) => setForm((prev) => ({ ...prev, segment: e.target.value as CarSegment }))}
            >
              {SEGMENTS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year_start">Año inicio *</Label>
              <Input
                id="year_start"
                type="number"
                value={form.year_start}
                onChange={(e) => setForm((prev) => ({ ...prev, year_start: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year_end">Año fin</Label>
              <Input
                id="year_end"
                type="number"
                value={form.year_end}
                onChange={(e) => setForm((prev) => ({ ...prev, year_end: e.target.value }))}
                placeholder="En producción"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isEdit ? 'Guardar cambios' : 'Crear modelo'}
            </Button>
            <Link to="/admin/models">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
