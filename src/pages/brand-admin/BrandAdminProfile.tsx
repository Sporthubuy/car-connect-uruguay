import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { useBrandAdmin } from '@/hooks/useBrandAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Building2 } from 'lucide-react';

export default function BrandAdminProfile() {
  const { brandInfo } = useBrandAdmin();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    logoUrl: '',
    description: '',
    website: '',
    phone: '',
    socialFacebook: '',
    socialInstagram: '',
    socialTwitter: '',
  });

  const brand = useQuery(
    api.cars.getBrand,
    brandInfo?.brand_id ? { brandId: brandInfo.brand_id as Id<"brands"> } : 'skip'
  );
  const isLoading = brand === undefined;

  const updateBrandProfileMutation = useMutation(api.cars.updateBrandProfile);

  useEffect(() => {
    if (brand) {
      setForm({
        logoUrl: brand.logoUrl ?? '',
        description: (brand as any).description ?? '',
        website: (brand as any).website ?? '',
        phone: (brand as any).phone ?? '',
        socialFacebook: (brand as any).socialFacebook ?? '',
        socialInstagram: (brand as any).socialInstagram ?? '',
        socialTwitter: (brand as any).socialTwitter ?? '',
      });
    }
  }, [brand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandInfo?.brand_id) return;

    setSaving(true);
    try {
      await updateBrandProfileMutation({
        brandId: brandInfo.brand_id as Id<"brands">,
        logoUrl: form.logoUrl.trim() || undefined,
        description: form.description.trim() || undefined,
        website: form.website.trim() || undefined,
        phone: form.phone.trim() || undefined,
        socialFacebook: form.socialFacebook.trim() || undefined,
        socialInstagram: form.socialInstagram.trim() || undefined,
        socialTwitter: form.socialTwitter.trim() || undefined,
      });
      toast.success('Perfil actualizado');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <BrandAdminLayout title="Perfil de la Marca">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </BrandAdminLayout>
    );
  }

  return (
    <BrandAdminLayout
      title="Perfil de la Marca"
      description="Editar información pública de tu marca"
    >
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Read-only info */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Información de la marca</h3>
          <div className="flex items-center gap-4">
            {form.logoUrl ? (
              <img
                src={form.logoUrl}
                alt={brand?.name}
                className="h-16 w-16 rounded-lg object-contain bg-white border"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium text-foreground">{brand?.name}</p>
              <p className="text-sm text-muted-foreground">/{brand?.slug}</p>
              <p className="text-xs text-muted-foreground mt-1">
                El nombre y slug solo pueden ser modificados por un administrador global.
              </p>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Personalización</h3>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL del logo</Label>
            <Input
              id="logoUrl"
              value={form.logoUrl}
              onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: imagen cuadrada de al menos 200x200px
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Descripción de la marca para mostrar en el catálogo..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Sitio web</Label>
              <Input
                id="website"
                value={form.website}
                onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://www.ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono de contacto</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+598 2 123 4567"
              />
            </div>
          </div>
        </div>

        {/* Social media */}
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Redes sociales</h3>

          <div className="space-y-2">
            <Label htmlFor="socialFacebook">Facebook</Label>
            <Input
              id="socialFacebook"
              value={form.socialFacebook}
              onChange={(e) => setForm((p) => ({ ...p, socialFacebook: e.target.value }))}
              placeholder="https://facebook.com/marca"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialInstagram">Instagram</Label>
            <Input
              id="socialInstagram"
              value={form.socialInstagram}
              onChange={(e) => setForm((p) => ({ ...p, socialInstagram: e.target.value }))}
              placeholder="https://instagram.com/marca"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialTwitter">X (Twitter)</Label>
            <Input
              id="socialTwitter"
              value={form.socialTwitter}
              onChange={(e) => setForm((p) => ({ ...p, socialTwitter: e.target.value }))}
              placeholder="https://x.com/marca"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </div>
      </form>
    </BrandAdminLayout>
  );
}
