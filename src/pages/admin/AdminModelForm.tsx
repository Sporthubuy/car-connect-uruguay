import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { CarSegment } from '@/types';
import type { Id } from '../../../convex/_generated/dataModel';

const SEGMENTS: CarSegment[] = ['sedan', 'hatchback', 'suv', 'crossover', 'pickup', 'coupe', 'convertible', 'wagon', 'van', 'sports'];

export default function AdminModelForm() {
  const { modelId } = useParams<{ modelId: string }>();
  const isEdit = modelId && modelId !== 'new';
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brandId: '',
    name: '',
    slug: '',
    segment: 'sedan' as CarSegment,
    yearStart: new Date().getFullYear(),
    yearEnd: '' as string | number,
  });

  const brands = useQuery(api.cars.listBrands);
  const model = useQuery(
    api.cars.getModel,
    isEdit ? { modelId: modelId as Id<"models"> } : 'skip'
  );

  const createModelMutation = useMutation(api.cars.createModel);
  const updateModelMutation = useMutation(api.cars.updateModel);

  const isLoading = isEdit && model === undefined;

  useEffect(() => {
    if (model) {
      setForm({
        brandId: model.brandId,
        name: model.name,
        slug: model.slug,
        segment: model.segment as CarSegment,
        yearStart: model.yearStart,
        yearEnd: model.yearEnd ?? '',
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
    if (!form.brandId || !form.name.trim() || !form.slug.trim()) {
      toast.error('Marca, nombre y slug son obligatorios');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateModelMutation({
          modelId: modelId as Id<"models">,
          name: form.name.trim(),
          slug: form.slug.trim(),
          segment: form.segment,
          yearStart: Number(form.yearStart),
          yearEnd: form.yearEnd ? Number(form.yearEnd) : undefined,
        });
        toast.success('Modelo actualizado');
      } else {
        await createModelMutation({
          brandId: form.brandId as Id<"brands">,
          name: form.name.trim(),
          slug: form.slug.trim(),
          segment: form.segment,
          yearStart: Number(form.yearStart),
          yearEnd: form.yearEnd ? Number(form.yearEnd) : undefined,
        });
        toast.success('Modelo creado');
      }

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
            <Label htmlFor="brandId">Marca *</Label>
            <select
              id="brandId"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.brandId}
              onChange={(e) => setForm((prev) => ({ ...prev, brandId: e.target.value }))}
              required
            >
              <option value="">Seleccionar marca</option>
              {(brands ?? []).map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
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
              <Label htmlFor="yearStart">Año inicio *</Label>
              <Input
                id="yearStart"
                type="number"
                value={form.yearStart}
                onChange={(e) => setForm((prev) => ({ ...prev, yearStart: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearEnd">Año fin</Label>
              <Input
                id="yearEnd"
                type="number"
                value={form.yearEnd}
                onChange={(e) => setForm((prev) => ({ ...prev, yearEnd: e.target.value }))}
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
