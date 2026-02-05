import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { useBrandAdmin } from '@/hooks/useBrandAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { FuelType } from '@/types';
import type { Id } from '../../../convex/_generated/dataModel';

const FUEL_TYPES: FuelType[] = ['gasolina', 'diesel', 'hibrido', 'electrico', 'gnc'];

export default function BrandAdminTrimForm() {
  const { modelId, trimId } = useParams<{ modelId?: string; trimId?: string }>();
  const isEdit = !!trimId;
  const navigate = useNavigate();
  const { brandInfo } = useBrandAdmin();

  const [saving, setSaving] = useState(false);
  const [ownershipVerified, setOwnershipVerified] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    year: new Date().getFullYear(),
    priceUsd: 0,
    engine: '',
    transmission: '',
    fuelType: 'gasolina' as FuelType,
    horsepower: 0,
    torque: '',
    acceleration0100: '',
    topSpeed: '',
    fuelConsumption: '',
    doors: 4,
    seats: 5,
    trunkCapacity: '',
    features: '',
    images: '',
    isFeatured: false,
  });

  const trim = useQuery(
    api.cars.getTrim,
    isEdit ? { trimId: trimId as Id<"trims"> } : 'skip'
  );
  const isLoading = isEdit && trim === undefined;

  const resolvedModelId = modelId ?? (trim?.modelId as string | undefined);

  const ownerModel = useQuery(
    api.cars.getModel,
    resolvedModelId ? { modelId: resolvedModelId as Id<"models"> } : 'skip'
  );

  const createTrimMutation = useMutation(api.cars.createTrim);
  const updateTrimMutation = useMutation(api.cars.updateTrim);

  // Verify ownership
  useEffect(() => {
    if (ownerModel && brandInfo?.brand_id) {
      if (ownerModel.brandId !== brandInfo.brand_id) {
        toast.error('No tienes permiso para editar esta versión');
        navigate('/marca/modelos');
        return;
      }
      setOwnershipVerified(true);
    }
  }, [ownerModel, brandInfo, navigate]);

  useEffect(() => {
    if (trim) {
      setForm({
        name: trim.name,
        slug: trim.slug,
        year: trim.year,
        priceUsd: trim.priceUsd,
        engine: trim.engine,
        transmission: trim.transmission,
        fuelType: trim.fuelType,
        horsepower: trim.horsepower,
        torque: trim.torque?.toString() ?? '',
        acceleration0100: trim.acceleration0100?.toString() ?? '',
        topSpeed: trim.topSpeed?.toString() ?? '',
        fuelConsumption: trim.fuelConsumption?.toString() ?? '',
        doors: trim.doors,
        seats: trim.seats,
        trunkCapacity: trim.trunkCapacity?.toString() ?? '',
        features: trim.features.join(', '),
        images: trim.images.join('\n'),
        isFeatured: trim.isFeatured,
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

    if (!resolvedModelId) {
      toast.error('No se pudo determinar el modelo');
      return;
    }

    setSaving(true);
    try {
      const features = form.features ? form.features.split(',').map((f) => f.trim()).filter(Boolean) : [];
      const images = form.images ? form.images.split('\n').map((u) => u.trim()).filter(Boolean) : [];

      if (isEdit) {
        await updateTrimMutation({
          trimId: trimId as Id<"trims">,
          name: form.name.trim(),
          slug: form.slug.trim(),
          year: Number(form.year),
          priceUsd: Number(form.priceUsd),
          engine: form.engine.trim(),
          transmission: form.transmission.trim(),
          fuelType: form.fuelType,
          horsepower: Number(form.horsepower),
          torque: form.torque ? Number(form.torque) : undefined,
          acceleration0100: form.acceleration0100 ? Number(form.acceleration0100) : undefined,
          topSpeed: form.topSpeed ? Number(form.topSpeed) : undefined,
          fuelConsumption: form.fuelConsumption ? Number(form.fuelConsumption) : undefined,
          doors: Number(form.doors),
          seats: Number(form.seats),
          trunkCapacity: form.trunkCapacity ? Number(form.trunkCapacity) : undefined,
          features,
          images,
          isFeatured: form.isFeatured,
        });
        toast.success('Versión actualizada');
      } else {
        await createTrimMutation({
          modelId: resolvedModelId as Id<"models">,
          name: form.name.trim(),
          slug: form.slug.trim(),
          year: Number(form.year),
          priceUsd: Number(form.priceUsd),
          engine: form.engine.trim(),
          transmission: form.transmission.trim(),
          fuelType: form.fuelType,
          horsepower: Number(form.horsepower),
          torque: form.torque ? Number(form.torque) : undefined,
          acceleration0100: form.acceleration0100 ? Number(form.acceleration0100) : undefined,
          topSpeed: form.topSpeed ? Number(form.topSpeed) : undefined,
          fuelConsumption: form.fuelConsumption ? Number(form.fuelConsumption) : undefined,
          doors: Number(form.doors),
          seats: Number(form.seats),
          trunkCapacity: form.trunkCapacity ? Number(form.trunkCapacity) : undefined,
          features,
          images,
          isFeatured: form.isFeatured,
        });
        toast.success('Versión creada');
      }

      navigate(`/marca/modelos/${resolvedModelId}/versiones`);
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if ((isEdit && isLoading) || !ownershipVerified) {
    return (
      <BrandAdminLayout title={isEdit ? "Editar versión" : "Nueva versión"}>
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
              <Label htmlFor="priceUsd">Precio USD *</Label>
              <Input id="priceUsd" type="number" value={form.priceUsd} onChange={(e) => setForm((p) => ({ ...p, priceUsd: Number(e.target.value) }))} required />
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
              <Label htmlFor="fuelType">Combustible</Label>
              <select
                id="fuelType"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.fuelType}
                onChange={(e) => setForm((p) => ({ ...p, fuelType: e.target.value as FuelType }))}
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
              <Label htmlFor="acceleration0100">0-100 km/h (seg)</Label>
              <Input id="acceleration0100" type="number" step="0.1" value={form.acceleration0100} onChange={(e) => setForm((p) => ({ ...p, acceleration0100: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topSpeed">Vel. máxima (km/h)</Label>
              <Input id="topSpeed" type="number" value={form.topSpeed} onChange={(e) => setForm((p) => ({ ...p, topSpeed: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuelConsumption">Consumo (L/100km)</Label>
              <Input id="fuelConsumption" type="number" step="0.1" value={form.fuelConsumption} onChange={(e) => setForm((p) => ({ ...p, fuelConsumption: e.target.value }))} />
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
              <Label htmlFor="trunkCapacity">Baúl (litros)</Label>
              <Input id="trunkCapacity" type="number" value={form.trunkCapacity} onChange={(e) => setForm((p) => ({ ...p, trunkCapacity: e.target.value }))} />
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
              <Switch checked={form.isFeatured} onCheckedChange={(checked) => setForm((p) => ({ ...p, isFeatured: checked }))} />
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
