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

export default function AdminEventForm() {
  const { eventId } = useParams<{ eventId: string }>();
  const isEdit = eventId && eventId !== 'new';
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brandId: '',
    title: '',
    slug: '',
    description: '',
    coverImage: '',
    location: '',
    eventDate: '',
    eventTime: '',
    isPublic: true,
    requiresVerification: false,
    maxAttendees: '',
  });

  const brands = useQuery(api.cars.listBrands);
  const event = useQuery(
    api.events.getEvent,
    isEdit ? { eventId: eventId as Id<"events"> } : 'skip'
  );

  const createEventMutation = useMutation(api.events.createEvent);
  const updateEventMutation = useMutation(api.events.updateEvent);

  const isLoading = isEdit && event === undefined;

  useEffect(() => {
    if (event) {
      setForm({
        brandId: event.brandId ?? '',
        title: event.title,
        slug: event.slug,
        description: event.description,
        coverImage: event.coverImage ?? '',
        location: event.location,
        eventDate: event.eventDate,
        eventTime: event.eventTime ?? '',
        isPublic: event.isPublic,
        requiresVerification: event.requiresVerification,
        maxAttendees: event.maxAttendees?.toString() ?? '',
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
    if (!form.title.trim() || !form.location.trim() || !form.eventDate) {
      toast.error('Título, ubicación y fecha son obligatorios');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateEventMutation({
          eventId: eventId as Id<"events">,
          brandId: form.brandId ? (form.brandId as Id<"brands">) : undefined,
          title: form.title.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          coverImage: form.coverImage.trim() || undefined,
          location: form.location.trim(),
          eventDate: form.eventDate,
          eventTime: form.eventTime || undefined,
          isPublic: form.isPublic,
          requiresVerification: form.requiresVerification,
          maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
        });
        toast.success('Evento actualizado');
      } else {
        await createEventMutation({
          brandId: form.brandId ? (form.brandId as Id<"brands">) : undefined,
          title: form.title.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          coverImage: form.coverImage.trim() || undefined,
          location: form.location.trim(),
          eventDate: form.eventDate,
          eventTime: form.eventTime || undefined,
          isPublic: form.isPublic,
          requiresVerification: form.requiresVerification,
          maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
        });
        toast.success('Evento creado');
      }

      navigate('/admin/events');
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <AdminLayout title="Editar evento">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? `Editar: ${event?.title ?? ''}` : 'Nuevo evento'}
      description={isEdit ? 'Modificar datos del evento' : 'Crear un nuevo evento'}
    >
      <Link
        to="/admin/events"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a eventos
      </Link>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="brandId">Marca (opcional)</Label>
            <select
              id="brandId"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.brandId}
              onChange={(e) => setForm((p) => ({ ...p, brandId: e.target.value }))}
            >
              <option value="">General (sin marca)</option>
              {(brands ?? []).map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

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
            <Label htmlFor="coverImage">URL imagen de portada</Label>
            <Input id="coverImage" value={form.coverImage} onChange={(e) => setForm((p) => ({ ...p, coverImage: e.target.value }))} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación *</Label>
            <Input id="location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Ej: Montevideo, Uruguay" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Fecha *</Label>
              <Input id="eventDate" type="date" value={form.eventDate} onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventTime">Hora</Label>
              <Input id="eventTime" type="time" value={form.eventTime} onChange={(e) => setForm((p) => ({ ...p, eventTime: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAttendees">Máximo de asistentes</Label>
            <Input id="maxAttendees" type="number" value={form.maxAttendees} onChange={(e) => setForm((p) => ({ ...p, maxAttendees: e.target.value }))} placeholder="Sin límite" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Público</Label>
              <p className="text-xs text-muted-foreground">Visible para todos</p>
            </div>
            <Switch checked={form.isPublic} onCheckedChange={(checked) => setForm((p) => ({ ...p, isPublic: checked }))} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Requiere verificación</Label>
              <p className="text-xs text-muted-foreground">Solo usuarios verificados</p>
            </div>
            <Switch checked={form.requiresVerification} onCheckedChange={(checked) => setForm((p) => ({ ...p, requiresVerification: checked }))} />
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
            <Link to="/admin/events">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
