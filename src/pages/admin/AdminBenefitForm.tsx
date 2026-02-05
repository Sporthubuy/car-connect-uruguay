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
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

export default function AdminBenefitForm() {
  const { benefitId } = useParams<{ benefitId: string }>();
  const isEdit = benefitId && benefitId !== 'new';
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brandId: '',
    title: '',
    description: '',
    terms: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
  });

  const brands = useQuery(api.cars.listBrands);
  const benefit = useQuery(
    api.activations.getBenefit,
    isEdit ? { benefitId: benefitId as Id<"benefits"> } : 'skip'
  );

  const createBenefitMutation = useMutation(api.activations.createBenefit);
  const updateBenefitMutation = useMutation(api.activations.updateBenefit);

  const isLoading = isEdit && benefit === undefined;

  useEffect(() => {
    if (benefit) {
      setForm({
        brandId: benefit.brandId,
        title: benefit.title,
        description: benefit.description,
        terms: benefit.terms ?? '',
        validFrom: benefit.validFrom,
        validUntil: benefit.validUntil,
        isActive: benefit.isActive,
      });
    }
  }, [benefit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brandId || !form.title.trim() || !form.validFrom || !form.validUntil) {
      toast.error('Marca, título y fechas de vigencia son obligatorios');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateBenefitMutation({
          benefitId: benefitId as Id<"benefits">,
          title: form.title.trim(),
          description: form.description.trim(),
          terms: form.terms.trim() || undefined,
          validFrom: form.validFrom,
          validUntil: form.validUntil,
          isActive: form.isActive,
        });
        toast.success('Beneficio actualizado');
      } else {
        await createBenefitMutation({
          brandId: form.brandId as Id<"brands">,
          title: form.title.trim(),
          description: form.description.trim(),
          terms: form.terms.trim() || undefined,
          validFrom: form.validFrom,
          validUntil: form.validUntil,
          isActive: form.isActive,
        });
        toast.success('Beneficio creado');
      }

      navigate('/admin/benefits');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <AdminLayout title="Editar beneficio">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? `Editar: ${benefit?.title ?? ''}` : 'Nuevo beneficio'}
      description={isEdit ? 'Modificar datos del beneficio' : 'Crear un nuevo beneficio'}
    >
      <Link
        to="/admin/benefits"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a beneficios
      </Link>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="brandId">Marca *</Label>
            <select
              id="brandId"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.brandId}
              onChange={(e) => setForm((p) => ({ ...p, brandId: e.target.value }))}
              required
            >
              <option value="">Seleccionar marca</option>
              {(brands ?? []).map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ej: 10% descuento en service" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <textarea
              id="description"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Términos y condiciones</Label>
            <textarea
              id="terms"
              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.terms}
              onChange={(e) => setForm((p) => ({ ...p, terms: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Válido desde *</Label>
              <Input id="validFrom" type="date" value={form.validFrom} onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Válido hasta *</Label>
              <Input id="validUntil" type="date" value={form.validUntil} onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))} required />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Activo</Label>
              <p className="text-xs text-muted-foreground">Los beneficios inactivos no se muestran</p>
            </div>
            <Switch checked={form.isActive} onCheckedChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isEdit ? 'Guardar cambios' : 'Crear beneficio'}
            </Button>
            <Link to="/admin/benefits">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
