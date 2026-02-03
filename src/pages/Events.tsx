import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { useEvents, useMyRsvps, useRsvpCounts } from '@/hooks/useSupabase';
import { rsvpToEvent, cancelRsvp } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Lock,
  Calendar,
  Loader2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const Events = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useEvents();
  const { data: myRsvps = [], refetch: refetchRsvps } = useMyRsvps();
  const { data: rsvpCounts = {}, refetch: refetchCounts } = useRsvpCounts();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [processingEvent, setProcessingEvent] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleRsvp = async (eventId: string, isRsvpd: boolean, maxAttendees?: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if event is full
    const currentCount = rsvpCounts[eventId] || 0;
    if (!isRsvpd && maxAttendees && currentCount >= maxAttendees) {
      toast.error('Cupos agotados');
      return;
    }

    setProcessingEvent(eventId);
    try {
      if (isRsvpd) {
        await cancelRsvp(eventId);
        toast.success('Inscripcion cancelada');
      } else {
        await rsvpToEvent(eventId);
        toast.success('Inscripcion exitosa!');
      }
      refetchRsvps();
      refetchCounts();
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    } finally {
      setProcessingEvent(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-UY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="container-wide py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <CalendarDays className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Eventos
            </h1>
          </div>
          <p className="text-muted-foreground">
            Test drives, exposiciones y eventos exclusivos
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
        <>
        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isRsvpd = myRsvps.includes(event.id);
            const currentCount = rsvpCounts[event.id] || 0;
            const isFull = event.max_attendees ? currentCount >= event.max_attendees : false;
            const isProcessing = processingEvent === event.id;

            return (
              <article
                key={event.id}
                className="overflow-hidden rounded-xl bg-card border hover:border-primary/30 hover:shadow-card transition-all duration-300 group"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={event.cover_image}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {event.requires_verification ? (
                      <Badge className="bg-primary text-primary-foreground border-0">
                        <Lock className="h-3 w-3 mr-1" />
                        Verificados
                      </Badge>
                    ) : (
                      <Badge className="bg-success text-success-foreground border-0">
                        Publico
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {new Date(event.event_date).toLocaleDateString('es-UY', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{event.event_time} hs</span>
                    </div>
                    {event.max_attendees && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {currentCount}/{event.max_attendees} inscriptos
                        </span>
                      </div>
                    )}
                  </div>
                  {event.requires_verification ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Evento exclusivo para usuarios verificados
                      </p>
                      <Link to="/perfil">
                        <Button size="sm" className="w-full" variant="outline">
                          Activar vehiculo para asistir
                        </Button>
                      </Link>
                    </div>
                  ) : isRsvpd ? (
                    <Button
                      size="sm"
                      className="w-full"
                      variant="secondary"
                      disabled={isProcessing}
                      onClick={() => handleRsvp(event.id, true)}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Inscripto - Cancelar
                        </>
                      )}
                    </Button>
                  ) : isFull ? (
                    <Button
                      size="sm"
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Cupos agotados
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      disabled={isProcessing}
                      onClick={() => handleRsvp(event.id, false, event.max_attendees)}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Inscribirme'
                      )}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-16">
            <CalendarDays className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay eventos proximos
            </h3>
            <p className="text-muted-foreground">
              Pronto anunciaremos nuevos eventos
            </p>
          </div>
        )}
        </>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-primary p-8 md:p-12 text-center">
          <Lock className="h-10 w-10 text-primary-foreground/80 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-foreground mb-4">
            Eventos exclusivos para verificados
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
            Activa tu vehiculo con el numero de chasis y accede a test drives
            privados, track days y beneficios especiales de tu marca.
          </p>
          <Link to="/perfil">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Activar mi vehiculo
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Events;
