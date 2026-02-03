import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { useBrandAdmin } from '@/hooks/useBrandAdmin';
import { getEvent, createEvent, updateEvent } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function BrandAdminEventForm() {
  const { eventId } = useParams<{ eventId: string }>();
  const isEdit = eventId && eventId !== 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { brandInfo } = useBrandAdmin();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    cover_image: '',
    location: '',
    event_date: '',
    event_time: '',
    is_public: true,
    requires_verification: false,
    max_attendees: '',
  });

  const { data: event, isLoading } = useQuery({
    queryKey: ['brand-admin', 'event', eventId],
    queryFn: () => getEvent(eventId!),
    enabled: !!isEdit,
  });

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        slug: event.slug,
        description: event.description,
        cover_image: event.cover_image,
        location: event.location,
        event_date: event.event_date,
        event_time: event.event_time,
        is_public: event.is_public,
        requires_verification: event.requires_verification,
        max_attendees: event.max_attendees?.toString() ?? '',
      });
    }
  }, [event]);

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: !isEdit ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.event_date) {
      toast.error('Título, ubicación y fecha son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        brand_id: brandInfo?.brand_id ?? null,
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        cover_image: form.cover_image.trim(),
        location: form.location.trim(),
        event_date: form.event_date,
        event_time: form.event_time,
        is_public: form.is_public,
        requires_verification: form.requires_verification,
        max_attendees: form.max_attendees ? Number(form.max_attendees) : null,
      };

      if (isEdit) {
        await updateEvent(eventId!, payload);
        toast.success('Evento actualizado');
      } else {
        await createEvent(payload);
        toast.success('Evento creado');
      }

      queryClient.invalidateQueries({ queryKey: ['brand-admin', 'events'] });
      navigate('/marca/eventos');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <BrandAdminLayout title="Editar evento">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </BrandAdminLayout>
    );
  }

  return (
    <BrandAdminLayout
      title={isEdit ? `Editar: ${event?.title ?? ''}` : 'Nuevo evento'}
      description={isEdit ? 'Modificar datos del evento' : 'Crear un nuevo evento'}
    >
      <Link
        to="/marca/eventos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a eventos
      </Link>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Ej: Lanzamiento nuevo modelo" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image">URL imagen de portada</Label>
            <Input id="cover_image" value={form.cover_image} onChange={(e) => setForm((p) => ({ ...p, cover_image: e.target.value }))} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación *</Label>
            <Input id="location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Ej: Montevideo, Uruguay" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Fecha *</Label>
              <Input id="event_date" type="date" value={form.event_date} onChange={(e) => setForm((p) => ({ ...p, event_date: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_time">Hora</Label>
              <Input id="event_time" type="time" value={form.event_time} onChange={(e) => setForm((p) => ({ ...p, event_time: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_attendees">Máximo de asistentes</Label>
            <Input id="max_attendees" type="number" value={form.max_attendees} onChange={(e) => setForm((p) => ({ ...p, max_attendees: e.target.value }))} placeholder="Sin límite" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Público</Label>
              <p className="text-xs text-muted-foreground">Visible para todos</p>
            </div>
            <Switch checked={form.is_public} onCheckedChange={(checked) => setForm((p) => ({ ...p, is_public: checked }))} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Requiere verificación</Label>
              <p className="text-xs text-muted-foreground">Solo usuarios verificados</p>
            </div>
            <Switch checked={form.requires_verification} onCheckedChange={(checked) => setForm((p) => ({ ...p, requires_verification: checked }))} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isEdit ? 'Guardar cambios' : 'Crear evento'}
            </Button>
            <Link to="/marca/eventos">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
          </div>
        </div>
      </form>
    </BrandAdminLayout>
  );
}
