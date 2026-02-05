import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { useBrandAdmin } from '@/hooks/useBrandAdmin';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Car,
  Mail,
  MessageSquare,
  Calendar,
  Gift,
  ShieldCheck,
  Loader2,
  Plus,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Id } from '../../../convex/_generated/dataModel';

export default function BrandAdminDashboard() {
  const { brandInfo } = useBrandAdmin();

  const brandId = brandInfo?.brand_id as Id<"brands"> | undefined;

  const stats = useQuery(
    api.settings.getBrandAdminStats,
    brandId ? { brandId } : 'skip'
  );

  const trends = useQuery(
    api.settings.getBrandAdminTrends,
    brandId ? { brandId } : 'skip'
  );

  const recentLeads = useQuery(
    api.leads.listRecentLeadsByBrand,
    brandId ? { brandId, limit: 5 } : 'skip'
  );

  const upcomingEvents = useQuery(
    api.events.listUpcomingEventsByBrand,
    brandId ? { brandId, limit: 5 } : 'skip'
  );

  const isLoading = stats === undefined;

  const cards = [
    { name: 'Modelos', href: '/marca/modelos', icon: Car, count: stats?.models, badge: stats?.trims ? `${stats.trims} versiones` : null },
    { name: 'Leads', href: '/marca/leads', icon: MessageSquare, count: stats?.leads, badge: stats?.newLeads ? `${stats.newLeads} nuevos` : null },
    { name: 'Eventos', href: '/marca/eventos', icon: Calendar, count: stats?.events, badge: null },
    { name: 'Beneficios', href: '/marca/beneficios', icon: Gift, count: stats?.benefits, badge: null },
    { name: 'Activaciones', href: '/marca/activaciones', icon: ShieldCheck, count: stats?.activations, badge: stats?.pendingActivations ? `${stats.pendingActivations} pendientes` : null },
  ];

  return (
    <BrandAdminLayout title="Dashboard" description="Panel de administración de tu marca">
      {/* Brand info + Quick actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {brandInfo?.brand_logo_url ? (
            <img
              src={brandInfo.brand_logo_url}
              alt={brandInfo.brand_name}
              className="h-12 w-12 rounded-lg object-contain bg-white border"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {brandInfo?.brand_name ?? 'Cargando...'}
            </h2>
            <p className="text-sm text-muted-foreground">
              /{brandInfo?.brand_slug}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/marca/modelos/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Modelo
            </Button>
          </Link>
          <Link to="/marca/eventos/new">
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Evento
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending activations alert */}
      {stats?.pendingActivations && stats.pendingActivations > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  {stats.pendingActivations} activacion{stats.pendingActivations > 1 ? 'es' : ''} pendiente{stats.pendingActivations > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Hay usuarios esperando verificación de su vehículo
                </p>
              </div>
            </div>
            <Link to="/marca/activaciones">
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50">
                Ver activaciones
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Link
                key={card.href}
                to={card.href}
                className="rounded-xl border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <card.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">{card.name}</h3>
                <p className="text-2xl font-bold text-foreground">{card.count ?? 0}</p>
                {card.badge && (
                  <Badge variant="secondary" className="mt-2">{card.badge}</Badge>
                )}
              </Link>
            ))}
          </div>

          {/* Recent leads and upcoming events */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent leads */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Leads recientes</h3>
                <Link to="/marca/leads" className="text-sm text-primary hover:underline flex items-center gap-1">
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {!recentLeads || recentLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No hay leads registrados</p>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div key={lead._id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm text-foreground">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.car?.model?.name} {lead.car?.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={lead.status === 'new' ? 'default' : 'secondary'} className="text-xs">
                          {lead.status === 'new' ? 'Nuevo' : lead.status === 'contacted' ? 'Contactado' : lead.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(lead._creationTime).toLocaleDateString('es-UY')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming events */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Próximos eventos</h3>
                <Link to="/marca/eventos" className="text-sm text-primary hover:underline flex items-center gap-1">
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {!upcomingEvents || upcomingEvents.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">No hay eventos próximos</p>
                  <Link to="/marca/eventos/new">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Crear evento
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event._id}
                      to={`/marca/eventos/${event._id}`}
                      className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {new Date(event.eventDate).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })}
                        </p>
                        {event.eventTime && (
                          <p className="text-xs text-muted-foreground">{event.eventTime}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trends Section */}
          {trends && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-6">Tendencias</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leads per week */}
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Leads por semana (ultimas 8 semanas)</h3>
                  <div className="aspect-[16/9]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trends.leadsPerWeek}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="label" className="text-xs" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} className="text-xs" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" name="Leads" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Activations per month */}
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Activaciones por mes (ultimos 6 meses)</h3>
                  <div className="aspect-[16/9]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trends.activationsPerMonth}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="label" className="text-xs" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} className="text-xs" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="Activaciones" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </BrandAdminLayout>
  );
}
