import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { useBrandAdmin } from '@/hooks/useBrandAdmin';
import { getBenefit, createBenefit, updateBenefit } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function BrandAdminBenefitForm() {
  const { benefitId } = useParams<{ benefitId: string }>();
  const isEdit = benefitId && benefitId !== 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { brandInfo } = useBrandAdmin();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    terms: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
  });

  const { data: benefit, isLoading } = useQuery({
    queryKey: ['brand-admin', 'benefit', benefitId],
    queryFn: () => getBenefit(benefitId!),
    enabled: !!isEdit,
  });

  useEffect(() => {
    if (benefit) {
      setForm({
        title: benefit.title,
        description: benefit.description,
        terms: benefit.terms ?? '',
        valid_from: benefit.valid_from,
        valid_until: benefit.valid_until,
        is_active: benefit.is_active,
      });
    }
  }, [benefit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.valid_from || !form.valid_until) {
      toast.error('Título y fechas de vigencia son obligatorios');
      return;
    }

    if (!brandInfo?.brand_id) {
      toast.error('No se pudo determinar la marca');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        brand_id: brandInfo.brand_id,
        title: form.title.trim(),
        description: form.description.trim(),
        terms: form.terms.trim() || null,
        valid_from: form.valid_from,
        valid_until: form.valid_until,
        is_active: form.is_active,
      };

      if (isEdit) {
        const { brand_id: _, ...updates } = payload;
        await updateBenefit(benefitId!, updates);
        toast.success('Beneficio actualizado');
      } else {
        await createBenefit(payload);
        toast.success('Beneficio creado');
      }

      queryClient.invalidateQueries({ queryKey: ['brand-admin', 'benefits'] });
      navigate('/marca/beneficios');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <BrandAdminLayout title="Editar beneficio">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </BrandAdminLayout>
    );
  }

  return (
    <BrandAdminLayout
      title={isEdit ? `Editar: ${benefit?.title ?? ''}` : 'Nuevo beneficio'}
      description={isEdit ? 'Modificar datos del beneficio' : 'Crear un nuevo beneficio'}
    >
      <Link
        to="/marca/beneficios"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a beneficios
      </Link>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="rounded-xl border bg-card p-6 space-y-5">
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
              <Label htmlFor="valid_from">Válido desde *</Label>
              <Input id="valid_from" type="date" value={form.valid_from} onChange={(e) => setForm((p) => ({ ...p, valid_from: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valid_until">Válido hasta *</Label>
              <Input id="valid_until" type="date" value={form.valid_until} onChange={(e) => setForm((p) => ({ ...p, valid_until: e.target.value }))} required />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Activo</Label>
              <p className="text-xs text-muted-foreground">Los beneficios inactivos no se muestran</p>
            </div>
            <Switch checked={form.is_active} onCheckedChange={(checked) => setForm((p) => ({ ...p, is_active: checked }))} />
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
            <Link to="/marca/beneficios">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
          </div>
        </div>
      </form>
    </BrandAdminLayout>
  );
}
