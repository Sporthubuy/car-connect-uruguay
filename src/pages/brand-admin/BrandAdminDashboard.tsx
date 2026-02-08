import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { useBrandAdmin } from '@/hooks/useBrandAdmin';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Car,
  MessageSquare,
  Calendar,
  Gift,
  ShieldCheck,
  Loader2,
  Plus,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Eye,
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

// Welcome banner with onboarding checklist
function WelcomeBanner({
  hasModels,
  hasEvents,
  hasBenefits,
  brandName
}: {
  hasModels: boolean;
  hasEvents: boolean;
  hasBenefits: boolean;
  brandName: string;
}) {
  const steps = [
    {
      label: 'Agregar modelos',
      href: '/marca/modelos/new',
      completed: hasModels,
      description: 'Añade los modelos de vehículos de tu marca'
    },
    {
      label: 'Crear un evento',
      href: '/marca/eventos/new',
      completed: hasEvents,
      description: 'Organiza test drives, lanzamientos o exhibiciones'
    },
    {
      label: 'Configurar beneficios',
      href: '/marca/beneficios/new',
      completed: hasBenefits,
      description: 'Define descuentos y beneficios exclusivos'
    },
  ];

  const allCompleted = steps.every((s) => s.completed);
  const completedCount = steps.filter((s) => s.completed).length;

  if (allCompleted) return null;

  return (
    <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            ¡Bienvenido, {brandName}!
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Completa estos pasos para aprovechar al máximo tu panel
          </p>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {completedCount}/{steps.length} completados
        </div>
      </div>
      <div className="space-y-3">
        {steps.map((step) => (
          <Link
            key={step.href}
            to={step.href}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              step.completed
                ? 'bg-green-50 dark:bg-green-950/30 cursor-default'
                : 'bg-background hover:bg-muted/50'
            }`}
          >
            {step.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${step.completed ? 'text-green-700 dark:text-green-300 line-through' : 'text-foreground'}`}>
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground truncate">{step.description}</p>
            </div>
            {!step.completed && (
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Quick actions panel
function QuickActions({ newLeadsCount }: { newLeadsCount: number }) {
  return (
    <div className="rounded-xl border bg-card p-6 mb-6">
      <h3 className="font-semibold text-foreground mb-4">Acciones rápidas</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/marca/modelos/new">
          <Button className="w-full gap-2 h-auto py-3 flex-col" size="lg">
            <Plus className="h-5 w-5" />
            <span>Nuevo Modelo</span>
          </Button>
        </Link>
        <Link to="/marca/eventos/new">
          <Button variant="outline" className="w-full gap-2 h-auto py-3 flex-col" size="lg">
            <Calendar className="h-5 w-5" />
            <span>Nuevo Evento</span>
          </Button>
        </Link>
        <Link to="/marca/beneficios/new">
          <Button variant="outline" className="w-full gap-2 h-auto py-3 flex-col" size="lg">
            <Gift className="h-5 w-5" />
            <span>Nuevo Beneficio</span>
          </Button>
        </Link>
        <Link to="/marca/leads">
          <Button variant="ghost" className="w-full gap-2 h-auto py-3 flex-col relative" size="lg">
            <Eye className="h-5 w-5" />
            <span>Ver Leads</span>
            {newLeadsCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                {newLeadsCount > 9 ? '9+' : newLeadsCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </div>
  );
}

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

  // Get count of new leads for quick actions badge
  const newLeadsCount = useQuery(
    api.leads.countNewLeadsByBrand,
    brandId ? { brandId } : 'skip'
  );

  const isLoading = stats === undefined;

  // Check what the brand has set up for the welcome banner
  const hasModels = (stats?.models ?? 0) > 0;
  const hasEvents = (stats?.events ?? 0) > 0;
  const hasBenefits = (stats?.benefits ?? 0) > 0;

  const cards = [
    { name: 'Modelos', href: '/marca/modelos', icon: Car, count: stats?.models, badge: stats?.trims ? `${stats.trims} versiones` : null },
    { name: 'Leads', href: '/marca/leads', icon: MessageSquare, count: stats?.leads, badge: stats?.newLeads ? `${stats.newLeads} nuevos` : null },
    { name: 'Eventos', href: '/marca/eventos', icon: Calendar, count: stats?.events, badge: null },
    { name: 'Beneficios', href: '/marca/beneficios', icon: Gift, count: stats?.benefits, badge: null },
    { name: 'Activaciones', href: '/marca/activaciones', icon: ShieldCheck, count: stats?.activations, badge: stats?.pendingActivations ? `${stats.pendingActivations} pendientes` : null },
  ];

  return (
    <BrandAdminLayout title="Dashboard" description="Panel de administración de tu marca">
      {/* Brand info header */}
      <div className="flex items-center gap-4 mb-6">
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

      {/* Welcome banner with onboarding checklist */}
      {!isLoading && (
        <WelcomeBanner
          hasModels={hasModels}
          hasEvents={hasEvents}
          hasBenefits={hasBenefits}
          brandName={brandInfo?.brand_name ?? 'tu marca'}
        />
      )}

      {/* Quick actions */}
      {!isLoading && (
        <QuickActions newLeadsCount={newLeadsCount ?? 0} />
      )}

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
