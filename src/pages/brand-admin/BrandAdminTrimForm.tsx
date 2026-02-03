import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { getTrim, createTrim, updateTrim } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { FuelType } from '@/types';

const FUEL_TYPES: FuelType[] = ['gasolina', 'diesel', 'hibrido', 'electrico', 'gnc'];

export default function BrandAdminTrimForm() {
  const { modelId, trimId } = useParams<{ modelId?: string; trimId?: string }>();
  const isEdit = !!trimId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    year: new Date().getFullYear(),
    price_usd: 0,
    engine: '',
    transmission: '',
    fuel_type: 'gasolina' as FuelType,
    horsepower: 0,
    torque: '',
    acceleration_0_100: '',
    top_speed: '',
    fuel_consumption: '',
    doors: 4,
    seats: 5,
    trunk_capacity: '',
    features: '',
    images: '',
    is_featured: false,
  });

  const { data: trim, isLoading } = useQuery({
    queryKey: ['brand-admin', 'trim', trimId],
    queryFn: () => getTrim(trimId!),
    enabled: !!isEdit,
  });

  const resolvedModelId = modelId ?? trim?.model_id;

  useEffect(() => {
    if (trim) {
      setForm({
        name: trim.name,
        slug: trim.slug,
        year: trim.year,
        price_usd: trim.price_usd,
        engine: trim.engine,
        transmission: trim.transmission,
        fuel_type: trim.fuel_type,
        horsepower: trim.horsepower,
        torque: trim.torque?.toString() ?? '',
        acceleration_0_100: trim.acceleration_0_100?.toString() ?? '',
        top_speed: trim.top_speed?.toString() ?? '',
        fuel_consumption: trim.fuel_consumption?.toString() ?? '',
        doors: trim.doors,
        seats: trim.seats,
        trunk_capacity: trim.trunk_capacity?.toString() ?? '',
        features: trim.features.join(', '),
        images: trim.images.join('\n'),
        is_featured: trim.is_featured,
      });
    }
  }, [trim]);

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
    if (!form.name.trim() || !form.engine.trim()) {
      toast.error('Nombre y motor son obligatorios');
      return;
    }

    const targetModelId = modelId ?? trim?.model_id;
    if (!targetModelId) {
      toast.error('No se pudo determinar el modelo');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        model_id: targetModelId,
        name: form.name.trim(),
        slug: form.slug.trim(),
        year: Number(form.year),
        price_usd: Number(form.price_usd),
        engine: form.engine.trim(),
        transmission: form.transmission.trim(),
        fuel_type: form.fuel_type,
        horsepower: Number(form.horsepower),
        torque: form.torque ? Number(form.torque) : null,
        acceleration_0_100: form.acceleration_0_100 ? Number(form.acceleration_0_100) : null,
        top_speed: form.top_speed ? Number(form.top_speed) : null,
        fuel_consumption: form.fuel_consumption ? Number(form.fuel_consumption) : null,
        doors: Number(form.doors),
        seats: Number(form.seats),
        trunk_capacity: form.trunk_capacity ? Number(form.trunk_capacity) : null,
        features: form.features ? form.features.split(',').map((f) => f.trim()).filter(Boolean) : [],
        images: form.images ? form.images.split('\n').map((u) => u.trim()).filter(Boolean) : [],
        is_featured: form.is_featured,
      };

      if (isEdit) {
        const { model_id: _, ...updates } = payload;
        await updateTrim(trimId!, updates);
        toast.success('Versión actualizada');
      } else {
        await createTrim(payload);
        toast.success('Versión creada');
      }

      queryClient.invalidateQueries({ queryKey: ['brand-admin', 'trims'] });
      navigate(`/marca/modelos/${targetModelId}/versiones`);
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <BrandAdminLayout title="Editar versión">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </BrandAdminLayout>
    );
  }

  const backUrl = resolvedModelId ? `/marca/modelos/${resolvedModelId}/versiones` : '/marca/modelos';

  return (
    <BrandAdminLayout
      title={isEdit ? `Editar: ${trim?.name ?? ''}` : 'Nueva versión'}
      description={isEdit ? 'Modificar datos de la versión' : 'Crear una nueva versión del modelo'}
    >
      <Link
        to={backUrl}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a versiones
      </Link>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Información básica</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Ej: XEi CVT" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Año *</Label>
              <Input id="year" type="number" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_usd">Precio USD *</Label>
              <Input id="price_usd" type="number" value={form.price_usd} onChange={(e) => setForm((p) => ({ ...p, price_usd: Number(e.target.value) }))} required />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Motor y rendimiento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="engine">Motor *</Label>
              <Input id="engine" value={form.engine} onChange={(e) => setForm((p) => ({ ...p, engine: e.target.value }))} placeholder="Ej: 2.0L 4 cilindros" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmisión *</Label>
              <Input id="transmission" value={form.transmission} onChange={(e) => setForm((p) => ({ ...p, transmission: e.target.value }))} placeholder="Ej: CVT" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel_type">Combustible</Label>
              <select
                id="fuel_type"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.fuel_type}
                onChange={(e) => setForm((p) => ({ ...p, fuel_type: e.target.value as FuelType }))}
              >
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="horsepower">Potencia (HP) *</Label>
              <Input id="horsepower" type="number" value={form.horsepower} onChange={(e) => setForm((p) => ({ ...p, horsepower: Number(e.target.value) }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="torque">Torque (Nm)</Label>
              <Input id="torque" type="number" value={form.torque} onChange={(e) => setForm((p) => ({ ...p, torque: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acceleration_0_100">0-100 km/h (seg)</Label>
              <Input id="acceleration_0_100" type="number" step="0.1" value={form.acceleration_0_100} onChange={(e) => setForm((p) => ({ ...p, acceleration_0_100: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="top_speed">Vel. máxima (km/h)</Label>
              <Input id="top_speed" type="number" value={form.top_speed} onChange={(e) => setForm((p) => ({ ...p, top_speed: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel_consumption">Consumo (L/100km)</Label>
              <Input id="fuel_consumption" type="number" step="0.1" value={form.fuel_consumption} onChange={(e) => setForm((p) => ({ ...p, fuel_consumption: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Carrocería</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doors">Puertas</Label>
              <Input id="doors" type="number" value={form.doors} onChange={(e) => setForm((p) => ({ ...p, doors: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats">Asientos</Label>
              <Input id="seats" type="number" value={form.seats} onChange={(e) => setForm((p) => ({ ...p, seats: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trunk_capacity">Baúl (litros)</Label>
              <Input id="trunk_capacity" type="number" value={form.trunk_capacity} onChange={(e) => setForm((p) => ({ ...p, trunk_capacity: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Extras</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="features">Características (separadas por coma)</Label>
              <Input id="features" value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} placeholder="ABS, ESP, 6 airbags, ..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="images">URLs de imágenes (una por línea)</Label>
              <textarea
                id="images"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.images}
                onChange={(e) => setForm((p) => ({ ...p, images: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Destacada</Label>
                <p className="text-xs text-muted-foreground">Mostrar como versión destacada</p>
              </div>
              <Switch checked={form.is_featured} onCheckedChange={(checked) => setForm((p) => ({ ...p, is_featured: checked }))} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEdit ? 'Guardar cambios' : 'Crear versión'}
          </Button>
          <Link to={backUrl}>
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
        </div>
      </form>
    </BrandAdminLayout>
  );
}
