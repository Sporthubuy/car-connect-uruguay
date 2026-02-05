import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const HERO_FIELDS = [
  { key: 'hero_badge', label: 'Badge del hero', type: 'input' },
  { key: 'hero_title', label: 'Titulo del hero', type: 'input' },
  { key: 'hero_subtitle', label: 'Subtitulo del hero', type: 'textarea' },
  { key: 'hero_cta_primary_text', label: 'CTA primario — Texto', type: 'input' },
  { key: 'hero_cta_primary_link', label: 'CTA primario — Link', type: 'input' },
  { key: 'hero_cta_secondary_text', label: 'CTA secundario — Texto', type: 'input' },
  { key: 'hero_cta_secondary_link', label: 'CTA secundario — Link', type: 'input' },
] as const;

export default function AdminSiteSettings() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const settings = useQuery(api.settings.getAllSettings);
  const setSettingMutation = useMutation(api.settings.setSetting);

  const isLoading = settings === undefined;

  useEffect(() => {
    if (settings) {
      const initial: Record<string, string> = {};
      for (const field of HERO_FIELDS) {
        const setting = settings.find((s) => s.key === field.key);
        initial[field.key] = typeof setting?.value === 'string' ? setting.value : '';
      }
      setForm(initial);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      for (const field of HERO_FIELDS) {
        await setSettingMutation({ key: field.key, value: form[field.key] ?? '' });
      }
      toast.success('Configuracion guardada');
    } catch (err: any) {
      toast.error('Error al guardar', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Configuracion del sitio">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configuracion del sitio" description="Editar contenido del hero y configuracion general">
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-foreground">Hero del Homepage</h2>

          {HERO_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.key}
                  value={form[field.key] ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  rows={3}
                />
              ) : (
                <Input
                  id={field.key}
                  value={form[field.key] ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                />
              )}
            </div>
          ))}

          <div className="pt-2">
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
        </div>
      </form>
    </AdminLayout>
  );
}
