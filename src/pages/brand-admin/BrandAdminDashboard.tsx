import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BrandAdminLayout } from '@/components/brand-admin/BrandAdminLayout';
import { useBrandAdmin } from '@/hooks/useBrandAdmin';
import { getBrandAdminStats, getBrandAdminTrends } from '@/lib/adminApi';
import {
  Building2,
  Car,
  Mail,
  MessageSquare,
  Calendar,
  Gift,
  ShieldCheck,
  Loader2,
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

export default function BrandAdminDashboard() {
  const { brandInfo } = useBrandAdmin();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['brand-admin', 'stats', brandInfo?.brand_id],
    queryFn: () => getBrandAdminStats(brandInfo!.brand_id),
    enabled: !!brandInfo?.brand_id,
  });

  const { data: trends } = useQuery({
    queryKey: ['brand-admin', 'trends', brandInfo?.brand_id],
    queryFn: () => getBrandAdminTrends(brandInfo!.brand_id),
    enabled: !!brandInfo?.brand_id,
  });

  const cards = [
    { name: 'Modelos', href: '/marca/modelos', icon: Car, count: stats?.models, badge: stats?.trims ? `${stats.trims} versiones` : null },
    { name: 'Contactos', href: '/marca/contactos', icon: Mail, count: stats?.contacts, badge: null },
    { name: 'Leads', href: '/marca/leads', icon: MessageSquare, count: stats?.leads, badge: stats?.newLeads ? `${stats.newLeads} nuevos` : null },
    { name: 'Eventos', href: '/marca/eventos', icon: Calendar, count: stats?.events, badge: null },
    { name: 'Beneficios', href: '/marca/beneficios', icon: Gift, count: stats?.benefits, badge: null },
    { name: 'Activaciones', href: '/marca/activaciones', icon: ShieldCheck, count: stats?.activations, badge: stats?.pendingActivations ? `${stats.pendingActivations} pendientes` : null },
  ];

  return (
    <BrandAdminLayout title="Mi Marca" description="Panel de administración de tu marca">
      {/* Brand info card */}
      <div className="rounded-xl border bg-card p-6 mb-6">
        <div className="flex items-center gap-4">
          {brandInfo?.brand_logo_url ? (
            <img
              src={brandInfo.brand_logo_url}
              alt={brandInfo.brand_name}
              className="h-16 w-16 rounded-lg object-contain bg-white border"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {brandInfo?.brand_name ?? 'Cargando...'}
            </h2>
            <p className="text-sm text-muted-foreground">
              /{brandInfo?.brand_slug}
            </p>
          </div>
        </div>
      </div>

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
